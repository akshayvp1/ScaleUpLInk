// backend/src/repositories/payment/PaymentRepository.ts
import { injectable } from "tsyringe";
import { IPaymentRepository } from "./interface/IPaymentRepository";
import { BookingsModel } from "../../models/bookingModel";
import { EventModel } from "../../models/eventModel"; // adjust path if different
import { StripeEventModel } from "../../models/stripeEventModel";
import { IBooking } from "../../interfaces/IBooking";
import { ClientSession } from "mongoose";

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000;
}

@injectable()
class PaymentRepository implements IPaymentRepository {
  async ensureStripeEventIndex(): Promise<void> {
    try {
      await StripeEventModel.createIndexes();
      const indexes = await StripeEventModel.collection.indexes();
      const hasUniqueEventIdIndex = indexes.some((index) => {
        const key = index.key as Record<string, unknown>;
        return (
          index.unique === true &&
          Object.keys(key).length === 1 &&
          key.eventId === 1 &&
          !index.partialFilterExpression &&
          index.sparse !== true
        );
      });

      if (!hasUniqueEventIdIndex) {
        throw new Error("Stripe eventId unique index is missing");
      }
    } catch (error) {
      console.error("Failed to ensure Stripe eventId unique index:", error);
      throw new Error("Stripe event uniqueness protection is unavailable");
    }
  }

  async claimStripeEvent(
    eventId: string,
    type: string,
    session?: ClientSession
  ): Promise<boolean> {
    try {
      await StripeEventModel.create([{ eventId, type }], { session });
      return true;
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) return false;
      console.error("Error recording Stripe event:", error);
      throw new Error(
        `Failed to record Stripe event: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findPendingEvent(eventId: string): Promise<IBooking[]> {
    try {
      return await BookingsModel.find({
        eventId: eventId,
        paymentStatus: "pending",
      }).exec();
    } catch (error: unknown) {
      console.error("Error finding pending payments for event:", error);
      throw new Error(
        `Failed to find pending payments: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findPendingEventForUser(
    eventId: string,
    userId: string
  ): Promise<IBooking[]> {
    try {
      return await BookingsModel.find({
        eventId,
        userId,
        paymentStatus: "pending",
      }).exec();
    } catch (error: unknown) {
      console.error("Error finding pending payments for user:", error);
      throw new Error(
        `Failed to find pending payments: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async updatePayment(
    paymentIntentId: string,
    update: Partial<IBooking>,
    session?: ClientSession
  ): Promise<IBooking | null> {
    try {
      const options = session ? { session, new: true } : { new: true };
      const isCompletingPayment = update.paymentStatus === "paid";
      const isFailingPayment = update.paymentStatus === "failed";

      // Terminal states are monotonic: a retried success must not increment
      // attendees twice or resurrect a refunded booking, and a failed event
      // must never downgrade a paid/refunded booking.
      const filter = isCompletingPayment
        ? { stripeSessionId: paymentIntentId, paymentStatus: { $nin: ["paid", "refunded"] } }
        : isFailingPayment
          ? { stripeSessionId: paymentIntentId, paymentStatus: { $nin: ["paid", "refunded"] } }
          : { stripeSessionId: paymentIntentId };

      let payment = await BookingsModel.findOneAndUpdate(filter, { $set: update }, options).exec();

      if (payment && isCompletingPayment) {
        // Tickets are the source of truth for how many people were admitted.
        // Legacy `seats`/`quantity` fallbacks are kept only for old bookings.
        const seatCount = Array.isArray(payment.tickets) && payment.tickets.length > 0
          ? payment.tickets.length
          : Array.isArray((payment as any).seats) && (payment as any).seats.length > 0
            ? (payment as any).seats.length
            : ((payment as any).quantity ?? 1);

        await EventModel.findByIdAndUpdate(
          payment.eventId,
          { $inc: { attendees: seatCount } },
          session ? { session } : undefined
        ).exec();
      } else if (!payment && (isCompletingPayment || isFailingPayment)) {
        // Nothing matched because the booking was already in a terminal state
        // (not because it is missing) — return the current doc so callers do
        // not treat this idempotent no-op as "booking not found".
        payment = await BookingsModel.findOne({ stripeSessionId: paymentIntentId }).exec();
      }

      return payment;
    } catch (error: unknown) {
      console.error("Error updating payment:", error);
      throw new Error(
        `Failed to update payment: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getPaymentByIntentId(paymentIntentId: string): Promise<IBooking | null> {
    try {
      return await BookingsModel.findOne({ stripeSessionId: paymentIntentId }).exec();
    } catch (error: unknown) {
      console.error("Error fetching payment by intent ID:", error);
      throw new Error(
        `Failed to fetch payment: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findByBookingId(bookingId: string): Promise<IBooking | null> {
    try {
      return await BookingsModel.findOne({ bookingId }).exec();
    } catch (error: unknown) {
      console.error("Error fetching booking by bookingId:", error);
      throw new Error(
        `Failed to fetch booking: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findTicketByQrCode(qrCode: string): Promise<IBooking | null> {
    try {
      return await BookingsModel.findOne({
        "tickets.uniqueQrCode": qrCode,
      }).exec();
    } catch (error: unknown) {
      console.error("Error fetching ticket by QR code:", error);
      throw new Error(
        `Failed to fetch ticket: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async markTicketUsed(
    bookingId: string,
    qrCode: string
  ): Promise<IBooking | null> {
    try {
      return await BookingsModel.findOneAndUpdate(
        {
          bookingId,
          tickets: {
            $elemMatch: {
              uniqueQrCode: qrCode,
              status: "active",
            },
          },
        },
        {
          $set: { "tickets.$.status": "used" },
        },
        { new: true }
      ).exec();
    } catch (error: unknown) {
      console.error("Error marking ticket used:", error);
      throw new Error(
        `Failed to mark ticket used: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findStalePayments(status: string, staleDate: Date): Promise<IBooking[]> {
    try {
      return await BookingsModel.find({
        paymentStatus: status,
        updatedAt: { $lte: staleDate },
      }).exec();
    } catch (error: unknown) {
      console.error("Error finding stale payments:", error);
      throw new Error(
        `Failed to find stale payments: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export default PaymentRepository;
