


// backend/src/repositories/payment/PaymentRepository.ts
import { injectable } from "tsyringe";
import { IPaymentRepository } from "./interface/IPaymentRepository";
import { BookingsModel } from "../../models/bookingModel";
import { IBooking } from "../../interfaces/IBooking";
import  { ClientSession } from "mongoose";

@injectable()
class PaymentRepository implements IPaymentRepository {
  async findPendingEvent(eventId: string): Promise<IBooking[]> {
    try {
      return await BookingsModel.find({
        eventId: eventId,
        paymentStatus: "pending",
      }).exec();
    } catch (error: unknown) {
      console.error("Error finding pending payments for event:", error);
      throw new Error(`Failed to find pending payments: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async updatePayment(
    paymentIntentId: string,
    update: Partial<IBooking>,
    session?: ClientSession
  ): Promise<IBooking | null> {
    try {
      const options = session ? { session, new: true } : { new: true };
      const payment = await BookingsModel.findOneAndUpdate(
        { stripeSessionId: paymentIntentId },
        { $set: update },
        options
      ).exec();
      return payment;
    } catch (error: unknown) {
      console.error("Error updating payment:", error);
      throw new Error(`Failed to update payment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getPaymentByIntentId(paymentIntentId: string): Promise<IBooking | null> {
    try {
      return await BookingsModel.findOne({ stripeSessionId: paymentIntentId }).exec();
    } catch (error: unknown) {
      console.error("Error fetching payment by intent ID:", error);
      throw new Error(`Failed to fetch payment: ${error instanceof Error ? error.message : "Unknown error"}`);
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
      throw new Error(`Failed to find stale payments: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export default PaymentRepository;


// import { injectable } from "tsyringe";
// import { IPaymentRepository } from "./interface/IPaymentRepository";
// import { BookingsModel } from "../../models/bookingModel";
// import { IBooking } from "../../interfaces/IBooking";
// import { ClientSession } from "mongoose";
// import mongoose from "mongoose";
// @injectable()
// class PaymentRepository implements IPaymentRepository {
//   async findPendingEvent(eventId: string): Promise<IBooking[]> {
//     try {
//       return await BookingsModel.find({
//         eventId: eventId,
//         paymentStatus: "pending",
//       }).exec();
//     } catch (error: unknown) {
//       console.error("Error finding pending payments for event:", error);
//       throw new Error(`Failed to find pending payments: ${error instanceof Error ? error.message : "Unknown error"}`);
//     }
//   }

//   async updatePayment(
//     paymentIntentId: string,
//     update: Partial<IBooking>,
//     session?: ClientSession
//   ): Promise<IBooking | null> {
//     try {
//       const options = session ? { session, new: true } : { new: true };
//       const payment = await BookingsModel.findOneAndUpdate(
//         { stripeSessionId: paymentIntentId },
//         { $set: update },
//         options
//       ).exec();
//       return payment;
//     } catch (error: unknown) {
//       console.error("Error updating payment:", error);
//       throw new Error(`Failed to update payment: ${error instanceof Error ? error.message : "Unknown error"}`);
//     }
//   }

//   async getPaymentByIntentId(paymentIntentId: string): Promise<IBooking | null> {
//     try {
//       return await BookingsModel.findOne({ stripeSessionId: paymentIntentId }).exec();
//     } catch (error: unknown) {
//       console.error("Error fetching payment by intent ID:", error);
//       throw new Error(`Failed to fetch payment: ${error instanceof Error ? error.message : "Unknown error"}`);
//     }
//   }

//   async findStalePayments(status: string, staleDate: Date): Promise<IBooking[]> {
//     try {
//       return await BookingsModel.find({
//         paymentStatus: status,
//         updatedAt: { $lte: staleDate },
//       }).exec();
//     } catch (error: unknown) {
//       console.error("Error finding stale payments:", error);
//       throw new Error(`Failed to find stale payments: ${error instanceof Error ? error.message : "Unknown error"}`);
//     }
//   }

//   async findOne(query: { stripeSessionId: string; user: mongoose.Types.ObjectId; paymentStatus?: string }): Promise<IBooking | null> {
//     try {
//       const conditions: any = {
//         stripeSessionId: query.stripeSessionId,
//         userId: query.user,
//       };
//       if (query.paymentStatus) {
//         conditions.paymentStatus = query.paymentStatus;
//       }
//       return await BookingsModel.findOne(conditions).exec();
//     } catch (error: unknown) {
//       console.error("Error finding payment:", error);
//       throw new Error(`Failed to find payment: ${error instanceof Error ? error.message : "Unknown error"}`);
//     }
//   }
// }

// export default PaymentRepository;