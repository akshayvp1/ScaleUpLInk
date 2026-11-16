// src/services/payment/paymentService.ts
import { injectable, inject } from "tsyringe";
import { IPaymentService } from "./interface/IPaymentService";
import PaymentRepository from "../../repositories/payment/PaymentRepository";
import { ISeatService } from "../seat/ISeatService";
import stripe from "../../config/stripe";
import { paymentStatus } from "../../constants/paymentStatus";
import { BookingsModel } from "../../models/bookingModel";
import { ITicket } from "../../interfaces/IBooking";
import Stripe from "stripe";
import mongoose, { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IBooking } from "../../interfaces/IBooking";
import { EventDocument } from "../../interfaces/IEvent";
import { EventModel } from "../../models/eventModel";
import {
  BookingDetailsResponse,
  TicketVerificationResponse,
} from "./interface/IPaymentService";
import { assertEventBookable } from "../../utils/eventValidation";

const uniqueSeatLabels = (seatLabels: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const label of seatLabels) {
    if (typeof label !== "string") continue;
    const trimmed = label.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
};

const sameSeatSet = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((label) => set.has(label));
};

@injectable()
class PaymentService implements IPaymentService {
  private readonly PENDING_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    @inject("PaymentRepository") private paymentRepository: PaymentRepository,
    @inject("SeatService") private seatService: ISeatService,
    @inject("EventModel") private eventModel: Model<EventDocument>
  ) {}

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error("Error retrieving payment intent:", error);
      throw new Error(`Failed to retrieve payment intent: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async cancelPayment(paymentIntentId: string): Promise<void> {
    try {
      const existing = await this.paymentRepository.getPaymentByIntentId(
        paymentIntentId
      );

      // Never let a stale cleanup attempt cancel/downgrade a payment that has
      // already succeeded (or been refunded).
      if (
        existing &&
        (existing.paymentStatus === paymentStatus.PAID ||
          existing.paymentStatus === paymentStatus.REFUNDED)
      ) {
        return;
      }

      await stripe.paymentIntents.cancel(paymentIntentId);
      await this.paymentRepository.updatePayment(paymentIntentId, {
        paymentStatus: paymentStatus.FAILED,
      });
    } catch (error) {
      console.error("Error cancelling payment:", error);
      throw new Error(`Failed to cancel payment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Refresh the hold, price the booking from the seats themselves (never
  // trust a client-supplied amount), then create the Stripe intent + a
  // pending booking with one ticket per seat.
  async createPaymentIntent(
    eventId: string,
    userId: string,
    seatLabels: string[],
    isRetry = false,
    paymentIntentId?: string
  ): Promise<Stripe.PaymentIntent> {
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid event id");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user id");
    }

    const labels = uniqueSeatLabels(Array.isArray(seatLabels) ? seatLabels : []);
    if (labels.length === 0) {
      throw new Error("At least one seat is required.");
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) throw new Error("Event not found.");
    assertEventBookable(event);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const extendResult = await this.seatService.extendHold(eventId, labels, userId);
      if (!extendResult.success) {
        throw new Error(
          `Your hold on seat(s) ${extendResult.failedLabels.join(", ")} has expired. Please go back and reselect your seats.`
        );
      }

      const seats = await this.seatService.getSeatsByLabels(eventId, labels);
      if (seats.length !== labels.length) {
        throw new Error("One or more selected seats could not be found.");
      }

      const tickets: ITicket[] = seats.map((seat) => ({
        seatLabel: seat.seatLabel,
        row: seat.row,
        number: seat.number,
        category: seat.category,
        price: seat.price,
        uniqueId: uuidv4(),
        uniqueQrCode: uuidv4(),
        status: "active",
      }));

      const amount = tickets.reduce((sum, t) => sum + t.price, 0);

      if (!Number.isFinite(amount) || amount < 0) {
        throw new Error("The selected seats have an invalid total price.");
      }

      const existingPayments =
        await this.paymentRepository.findPendingEventForUser(eventId, userId);

      for (const payment of existingPayments) {
        try {
          const existingIntent = await this.retrievePaymentIntent(
            payment.stripeSessionId
          );
          const existingLabels = (payment.tickets ?? []).map((t) => t.seatLabel);
          const sameSelection = sameSeatSet(existingLabels, labels);

          if (existingIntent.status === "succeeded") {
            // The charge already went through (e.g. the webhook is delayed).
            // Finalize that booking instead of creating a second intent.
            const paid = await this.paymentRepository.updatePayment(
              payment.stripeSessionId,
              { paymentStatus: paymentStatus.PAID },
              session
            );

            await session.commitTransaction();

            if (paid) await this.finalizePaidBooking(paid);

            if (sameSelection) return existingIntent;

            throw new Error(
              "A payment for a different seat selection has already succeeded. Open your booked events to view those tickets."
            );
          }

          if (
            sameSelection &&
            [
              "requires_payment_method",
              "requires_confirmation",
              "requires_action",
            ].includes(existingIntent.status)
          ) {
            await session.commitTransaction();
            return existingIntent;
          }

          if (
            [
              "requires_payment_method",
              "requires_confirmation",
              "requires_action",
            ].includes(existingIntent.status)
          ) {
            await this.cancelPayment(payment.stripeSessionId);
          } else {
            await this.paymentRepository.updatePayment(payment.stripeSessionId, {
              paymentStatus: paymentStatus.FAILED,
            });
          }
        } catch (error) {
          console.error("Error processing existing payment:", error);
          await this.paymentRepository.updatePayment(payment.stripeSessionId, {
            paymentStatus: paymentStatus.FAILED,
          });
        }
      }

      if (isRetry && paymentIntentId) {
        const existingPayment =
          await this.paymentRepository.getPaymentByIntentId(paymentIntentId);

        if (
          !existingPayment ||
          existingPayment.userId.toString() !== userId ||
          existingPayment.eventId.toString() !== eventId
        ) {
          throw new Error("Payment intent does not belong to this booking.");
        }

        try {
          const existingIntent = await this.retrievePaymentIntent(paymentIntentId);
          if (existingIntent.status === "succeeded") {
            if (existingPayment.paymentStatus === paymentStatus.PAID) {
              await session.commitTransaction();
              return existingIntent;
            }
          }
          if (
            ["requires_payment_method", "requires_confirmation", "requires_action"].includes(
              existingIntent.status
            ) &&
            sameSeatSet((existingPayment.tickets ?? []).map((t) => t.seatLabel), labels)
          ) {
            await session.commitTransaction();
            return existingIntent;
          }
          throw new Error("Payment intent is not in a retryable state");
        } catch (error) {
          console.error("Error retrying payment intent:", error);
          throw error;
        }
      }

      const newPaymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "inr",
        metadata: {
          eventId,
          userId,
          seatLabels: labels.join(",").slice(0, 500),
        },
        payment_method_types: ["card"],
      });

      await BookingsModel.create(
        [{
          bookingId: uuidv4(),
          userId: new mongoose.Types.ObjectId(userId),
          eventId: new mongoose.Types.ObjectId(eventId),
          tickets,
          totalAmount: amount,
          stripeSessionId: newPaymentIntent.id,
          paymentStatus: paymentStatus.PENDING,
        }],
        { session }
      );

      await session.commitTransaction();
      return newPaymentIntent;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error("Error creating payment intent:", error);
      throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      session.endSession();
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    const supportedEventTypes = new Set([
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "payment_intent.canceled",
    ]);

    if (!supportedEventTypes.has(event.type)) {
      console.log(`Unhandled event type ${event.type}`);
      return;
    }

    try {
      await this.paymentRepository.ensureStripeEventIndex();
    } catch (error) {
      console.error("Stripe webhook rejected because event uniqueness protection is unavailable:", error);
      throw new Error("Stripe event uniqueness protection is unavailable");
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    let paidBooking: IBooking | null = null;
    let failedBooking: IBooking | null = null;
    try {
      const claimed = await this.paymentRepository.claimStripeEvent(
        event.id,
        event.type,
        session
      );
      if (!claimed) {
        try {
          if (session.inTransaction()) await session.abortTransaction();
        } catch (abortError) {
          console.error("Failed to abort duplicate Stripe event transaction:", abortError);
        }
        console.log(`Duplicate Stripe event ignored: ${event.id}`);
        return;
      }

      switch (event.type) {
        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const payment = await this.paymentRepository.updatePayment(
            paymentIntent.id,
            { paymentStatus: paymentStatus.PAID },
            session
          );
          if (!payment) throw new Error("Payment not found");
          paidBooking = payment;
          break;
        }
        case "payment_intent.payment_failed":
        case "payment_intent.canceled": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const payment = await this.paymentRepository.updatePayment(
            paymentIntent.id,
            { paymentStatus: paymentStatus.FAILED },
            session
          );
          if (!payment) throw new Error("Payment not found");
          failedBooking = payment;
          break;
        }
      }

      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error("Webhook handling error:", error);
      throw new Error(`Failed to handle webhook: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      session.endSession();
    }

    if (paidBooking) {
      try {
        await this.finalizePaidBooking(paidBooking);
      } catch (error) {
        console.error("Failed to finalize paid booking after webhook:", error);
      }
    }

    if (failedBooking) {
      await this.releaseFailedBooking(failedBooking);
    }
  }

  /**
   * Turns a fully paid booking's seat holds into booked seats. Called from
   * both the Stripe webhook and payment verification so seats are finalized
   * even if the buyer closes the tab right after paying.
   *
   * If the hold was lost while payment was in flight we refund automatically
   * rather than leaving a paid booking without seats.
   */
  private async finalizePaidBooking(booking: IBooking): Promise<void> {
    const bookingMongoId = booking._id
      ? booking._id.toString()
      : (booking as unknown as { id?: string }).id;

    if (!bookingMongoId) return;

    try {
      await this.seatService.confirmSeatsBooked(
        booking.eventId.toString(),
        (booking.tickets ?? []).map((ticket) => ticket.seatLabel),
        booking.userId.toString(),
        bookingMongoId
      );
    } catch (confirmError) {
      console.error(
        "Seat hold expired before payment finalization; issuing refund:",
        confirmError
      );

      try {
        await stripe.refunds.create({
          payment_intent: booking.stripeSessionId,
        });
        await this.paymentRepository.updatePayment(booking.stripeSessionId, {
          paymentStatus: paymentStatus.REFUNDED,
        });
      } catch (refundError) {
        console.error("Automatic refund failed for unseated booking:", refundError);
      }
    }
  }

  private async releaseFailedBooking(booking: IBooking): Promise<void> {
    try {
      await this.seatService.releaseSeats(
        booking.eventId.toString(),
        (booking.tickets ?? []).map((ticket) => ticket.seatLabel),
        booking.userId.toString()
      );
    } catch (error) {
      console.error("Failed to release seats for failed payment:", error);
    }
  }

  async verifyPayment(paymentIntentId: string, userId: string): Promise<any> {
    try {
      const payment = await this.paymentRepository.getPaymentByIntentId(paymentIntentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      if (payment.userId.toString() !== userId) {
        throw new Error("Payment does not belong to you");
      }

      if (payment.paymentStatus === paymentStatus.PENDING) {
        const paymentIntent = await this.retrievePaymentIntent(paymentIntentId);
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          if (paymentIntent.status === "succeeded") {
            const updatedPayment = await this.paymentRepository.updatePayment(
              paymentIntentId,
              { paymentStatus: paymentStatus.PAID },
              session
            );
            if (!updatedPayment) throw new Error("Payment not found after update");
            await session.commitTransaction();
            await this.finalizePaidBooking(updatedPayment);
            return updatedPayment;
          } else if (
            paymentIntent.status === "canceled" ||
            paymentIntent.last_payment_error ||
            ["requires_payment_method", "requires_confirmation"].includes(paymentIntent.status)
          ) {
            const updatedPayment = await this.paymentRepository.updatePayment(
              paymentIntentId,
              { paymentStatus: paymentStatus.FAILED },
              session
            );
            if (!updatedPayment) throw new Error("Payment not found after update");
            await session.commitTransaction();
            return updatedPayment;
          } else if (paymentIntent.status === "requires_action") {
            await session.commitTransaction();
            return payment;
          }
          await session.commitTransaction();
        } catch (error) {
          await session.abortTransaction();
          throw new Error(`Failed to update payment: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
          session.endSession();
        }
      }

      if (payment.paymentStatus === paymentStatus.PAID) {
        await this.finalizePaidBooking(payment);
      }

      return payment;
    } catch (error) {
      console.error("Error verifying payment:", error);
      if (
        error instanceof Error &&
        (error.message === "Payment not found" || error.message === "Payment does not belong to you")
      ) {
        throw error;
      }
      throw new Error(`Failed to verify payment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async confirmSeatsBooked(
    eventId: string,
    seatLabels: string[],
    userId: string,
    bookingId: string
  ): Promise<IBooking> {
    const booking = await this.paymentRepository.findByBookingId(bookingId);

    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.userId.toString() !== userId) {
      throw new Error("This booking does not belong to you.");
    }

    if (booking.eventId.toString() !== eventId) {
      throw new Error("Booking does not match this event.");
    }

    if (booking.paymentStatus !== paymentStatus.PAID) {
      throw new Error("Payment has not been confirmed for this booking.");
    }

    const labels = uniqueSeatLabels(Array.isArray(seatLabels) ? seatLabels : []);
    const bookingLabels = (booking.tickets ?? []).map((ticket) => ticket.seatLabel);

    // The booking already records exactly which seats were paid for. Refuse
    // any other selection so a paid booking cannot be used to claim seats it
    // never paid for.
    if (!sameSeatSet(bookingLabels, labels)) {
      throw new Error("Seat selection does not match this booking.");
    }

    await this.seatService.confirmSeatsBooked(
      eventId,
      labels,
      userId,
      (booking._id as mongoose.Types.ObjectId).toString()
    );

    return booking;
  }

  private extractTicketCode(qrCode: string): string {
    const raw = (qrCode ?? "").trim();
    if (!raw) return "";

    // Older ticket PDFs encoded a JSON payload
    // ({ bookingId, ticketId, code }) instead of the raw code.
    if (raw.startsWith("{")) {
      try {
        const parsed = JSON.parse(raw) as { code?: unknown };
        if (typeof parsed.code === "string") return parsed.code.trim();
      } catch {
        // Not valid JSON; fall through and treat it as a raw code.
      }
    }

    return raw;
  }

  private async getTicketVerificationContext(
    qrCode: string,
    requesterId: string,
    requesterRole?: string
  ): Promise<{
    booking: IBooking;
    ticket: ITicket;
    event: {
      _id: mongoose.Types.ObjectId;
      eventTitle: string;
      startDate: Date;
      startTime: string;
      venueName: string;
      city: string;
    };
  }> {
    const code = this.extractTicketCode(qrCode);
    if (!code) throw new Error("Ticket code is required");
    if (!requesterId) throw new Error("Unauthorized");

    const booking = await this.paymentRepository.findTicketByQrCode(code);
    if (!booking) throw new Error("Ticket not found");

    const ticket = (booking.tickets ?? []).find(
      (item) => item.uniqueQrCode === code
    );
    if (!ticket) throw new Error("Ticket not found");

    const event = await this.eventModel
      .findById(booking.eventId)
      .select("user_id eventTitle startDate startTime venueName city")
      .lean();

    if (!event) throw new Error("Event not found for this ticket");

    if (
      requesterRole !== "admin" &&
      event.user_id.toString() !== requesterId
    ) {
      throw new Error("You can only verify tickets for your own events");
    }

    return {
      booking,
      ticket,
      event: event as unknown as {
        _id: mongoose.Types.ObjectId;
        eventTitle: string;
        startDate: Date;
        startTime: string;
        venueName: string;
        city: string;
      },
    };
  }

  private buildTicketResponse(
    context: Awaited<ReturnType<PaymentService["getTicketVerificationContext"]>>,
    checkedIn: boolean
  ): TicketVerificationResponse {
    const { booking, ticket, event } = context;

    return {
      valid: booking.paymentStatus === paymentStatus.PAID && ticket.status === "active",
      message:
        booking.paymentStatus !== paymentStatus.PAID
          ? "This booking has not been paid."
          : ticket.status === "used"
            ? "This ticket has already been checked in."
            : ticket.status === "cancelled"
              ? "This ticket has been cancelled."
              : checkedIn
                ? "Ticket checked in successfully."
                : "Ticket is valid.",
      checkedIn,
      ticket,
      bookingId: booking.bookingId,
      eventId: booking.eventId.toString(),
      eventTitle: event.eventTitle,
      eventStartDate: event.startDate,
      eventStartTime: event.startTime,
      venueName: event.venueName,
      city: event.city,
    };
  }

  async verifyTicket(
    qrCode: string,
    requesterId: string,
    requesterRole?: string
  ): Promise<TicketVerificationResponse> {
    const context = await this.getTicketVerificationContext(
      qrCode,
      requesterId,
      requesterRole
    );
    return this.buildTicketResponse(context, false);
  }

  async checkInTicket(
    qrCode: string,
    requesterId: string,
    requesterRole?: string
  ): Promise<TicketVerificationResponse> {
    const context = await this.getTicketVerificationContext(
      qrCode,
      requesterId,
      requesterRole
    );

    if (context.booking.paymentStatus !== paymentStatus.PAID) {
      return this.buildTicketResponse(context, false);
    }

    if (context.ticket.status !== "active") {
      return this.buildTicketResponse(context, context.ticket.status === "used");
    }

    const updated = await this.paymentRepository.markTicketUsed(
      context.booking.bookingId,
      context.ticket.uniqueQrCode
    );

    if (!updated) {
      // Another scanner won the race. Re-read so the response reflects the
      // actual final ticket state.
      const latest = await this.paymentRepository.findTicketByQrCode(
        context.ticket.uniqueQrCode
      );
      const latestTicket = latest?.tickets.find(
        (item) => item.uniqueQrCode === context.ticket.uniqueQrCode
      );

      if (latest && latestTicket) {
        return this.buildTicketResponse(
          { ...context, booking: latest, ticket: latestTicket },
          latestTicket.status === "used"
        );
      }

      return this.buildTicketResponse(context, false);
    }

    const updatedTicket = updated.tickets.find(
      (item) => item.uniqueQrCode === context.ticket.uniqueQrCode
    );

    return this.buildTicketResponse(
      {
        ...context,
        booking: updated,
        ticket: updatedTicket ?? { ...context.ticket, status: "used" },
      },
      true
    );
  }

  async handleStateTransactions(): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const staleDate = new Date(Date.now() - this.PENDING_TIMEOUT_MS);
      const stalePayments = await this.paymentRepository.findStalePayments(
        paymentStatus.PENDING,
        staleDate
      );

      for (const payment of stalePayments) {
        try {
          const paymentIntent = await this.retrievePaymentIntent(payment.stripeSessionId);
          if (
            ["requires_payment_method", "requires_confirmation", "requires_action"].includes(
              paymentIntent.status
            )
          ) {
            await this.cancelPayment(payment.stripeSessionId);
          }

          await this.paymentRepository.updatePayment(
            payment.stripeSessionId,
            { paymentStatus: paymentStatus.FAILED },
            session
          );
        } catch (error) {
          console.error("Error handling stale payment:", error);
          continue;
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error("Error in handleStateTransactions:", error);
      throw new Error(`Failed to handle stale transactions: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      session.endSession();
    }
  }
   async getBookingDetails(
    bookingId: string,
    userId: string
  ): Promise<BookingDetailsResponse> {
    const booking = await this.paymentRepository.findByBookingId(bookingId);

    if (!booking) {
      throw new Error("Booking not found.");
    }

    if (booking.userId.toString() !== userId) {
      throw new Error("This booking does not belong to you.");
    }

    const event = await EventModel.findById(booking.eventId).lean();
    if (!event) {
      throw new Error("Event not found for this booking.");
    }

    return {
      bookingId: booking.bookingId,
      tickets: booking.tickets,
      totalAmount: booking.totalAmount,
      discount: booking.discount,
      coupon: booking.coupon,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
      event: {
        id: (event._id as mongoose.Types.ObjectId).toString(),
        eventTitle: event.eventTitle,
        eventDescription: event.eventDescription,
        eventType: event.eventType,
        startDate: event.startDate,
        startTime: event.startTime,
        endingDate: event.endingDate,
        endingTime: event.endingTime,
        venueName: event.venueName,
        venueAddress: event.venueAddress,
        city: event.city,
        ageRestriction: event.ageRestriction,
        mainBanner: event.mainBanner,
      },
    };
  }
}

export default PaymentService;