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
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { IBooking } from "../../interfaces/IBooking";
import { EventModel } from "../../models/eventModel";
import { BookingDetailsResponse } from "./interface/IPaymentService";

@injectable()
class PaymentService implements IPaymentService {
  private readonly PENDING_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    @inject("PaymentRepository") private paymentRepository: PaymentRepository,
    @inject("SeatService") private seatService: ISeatService
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const extendResult = await this.seatService.extendHold(eventId, seatLabels, userId);
      if (!extendResult.success) {
        throw new Error(
          `Your hold on seat(s) ${extendResult.failedLabels.join(", ")} has expired. Please go back and reselect your seats.`
        );
      }

      const seats = await this.seatService.getSeatsByLabels(eventId, seatLabels);
      if (seats.length !== seatLabels.length) {
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

      const existingPayments = await this.paymentRepository.findPendingEvent(eventId);

      for (const payment of existingPayments) {
        try {
          const existingIntent = await this.retrievePaymentIntent(payment.stripeSessionId);
          if (
            ["requires_payment_method", "requires_confirmation", "requires_action"].includes(
              existingIntent.status
            )
          ) {
            await session.commitTransaction();
            return existingIntent;
          } else {
            await this.cancelPayment(payment.stripeSessionId);
          }
        } catch (error) {
          console.error("Error processing existing payment:", error);
          await this.paymentRepository.updatePayment(payment.stripeSessionId, {
            paymentStatus: paymentStatus.FAILED,
          });
        }
      }

      if (isRetry && paymentIntentId) {
        try {
          const existingIntent = await this.retrievePaymentIntent(paymentIntentId);
          if (existingIntent.status === "succeeded") {
            const existingPayment = await this.paymentRepository.getPaymentByIntentId(paymentIntentId);
            if (existingPayment?.paymentStatus === paymentStatus.PAID) {
              await session.commitTransaction();
              return existingIntent;
            }
          }
          if (
            ["requires_payment_method", "requires_confirmation", "requires_action"].includes(
              existingIntent.status
            )
          ) {
            await session.commitTransaction();
            return existingIntent;
          } else {
            throw new Error("Payment intent is not in a retryable state");
          }
        } catch (error) {
          console.error("Error retrying payment intent:", error);
        }
      }

      const newPaymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "inr",
        metadata: { eventId, userId },
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
      await session.abortTransaction();
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

    await this.seatService.confirmSeatsBooked(
      eventId,
      seatLabels,
      userId,
      (booking._id as mongoose.Types.ObjectId).toString()
    );

    return booking;
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