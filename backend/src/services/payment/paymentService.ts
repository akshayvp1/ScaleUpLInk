


import { injectable, inject } from "tsyringe";
import { IPaymentService } from "./interface/IPaymentService";
import PaymentRepository from "../../repositories/payment/PaymentRepository";
import stripe from "../../config/stripe";
import { paymentStatus } from "../../../src/constants/paymentStatus";
import { BookingsModel } from "../../models/bookingModel";
import Stripe from "stripe";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface Ticket {
  type: string;
  price: number;
  quantity: number;
  totalPrice: number;
  uniqueId: string;
  uniqueQrCode: string;
  status: "active" | "used" | "cancelled";
}

@injectable()
class PaymentService implements IPaymentService {
  private readonly PENDING_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

  constructor(
    @inject("PaymentRepository") private paymentRepository: PaymentRepository
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

  async createPaymentIntent(
    eventId: string,
    userId: string,
    amount: number,
    isRetry = false,
    paymentIntentId?: string
  ): Promise<Stripe.PaymentIntent> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      
      // Check for existing pending payments for the event
      const existingPayments = await this.paymentRepository.findPendingEvent(eventId);

      for (const payment of existingPayments) {
        try {
          const paymentIntent = await this.retrievePaymentIntent(payment.stripeSessionId);
          if (
            ["requires_payment_method", "requires_confirmation", "requires_action"].includes(
              paymentIntent.status
            )
          ) {
            await session.commitTransaction();
            return paymentIntent; 
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

      // Create new payment intent
      const newPaymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: "inr",
        metadata: { eventId, userId },
        payment_method_types: ["card"],
      });

      
      const ticket: Ticket = {
        type: "default",
        price: amount,
        quantity: 1,
        totalPrice: amount,
        uniqueId: uuidv4(),
        uniqueQrCode: uuidv4(),
        status: "active",
      };

      await BookingsModel.create(
        [{
          bookingId: uuidv4(),
          userId: new mongoose.Types.ObjectId(userId),
          eventId: new mongoose.Types.ObjectId(eventId),
          tickets: [ticket],
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
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
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
        default:
          console.log(`Unhandled event type ${event.type}`);
          return;
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error("Webhook handling error:", error);
      throw new Error(`Failed to handle webhook: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      session.endSession();
    }
  }

  async verifyPayment(paymentIntentId: string): Promise<any> {
    try {
      console.log(paymentIntentId,"ithaaaa🤣❤️❤️")
      const payment = await this.paymentRepository.getPaymentByIntentId(paymentIntentId);
      if (!payment) {
        throw new Error("Payment not found");
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
            // Payment requires additional action (e.g., 3D Secure); keep as pending
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
      throw new Error(`Failed to verify payment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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
}

export default PaymentService;




// import { injectable, inject } from "tsyringe";
// import Stripe from "stripe";
// import mongoose, { Types } from "mongoose";
// import { v4 as uuidv4 } from "uuid";
// import { IPaymentService } from "./interface/IPaymentService";
// import PaymentRepository from "../../repositories/payment/PaymentRepository";
// import stripe from "../../config/stripe";
// import { paymentStatus } from "../../../src/constants/paymentStatus";
// import { BookingsModel } from "../../models/bookingModel";

// interface Ticket {
//   type: string;
//   price: number;
//   quantity: number;
//   totalPrice: number;
//   uniqueId: string;
//   uniqueQrCode: string;
//   status: "active" | "used" | "cancelled";
// }

// @injectable()
// class PaymentService implements IPaymentService {
//   private readonly PENDING_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
//   private readonly CANCEL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

//   constructor(@inject("PaymentRepository") private paymentRepository: PaymentRepository) {}

//   private async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
//     try {
//       return await stripe.paymentIntents.retrieve(paymentIntentId);
//     } catch (error) {
//       console.error(`Error retrieving payment intent ${paymentIntentId}:`, error);
//       throw new Error(`Failed to retrieve payment intent: ${error instanceof Error ? error.message : "Unknown error"}`);
//     }
//   }

//   private async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
//     try {
//       await stripe.paymentIntents.cancel(paymentIntentId);
//       await this.paymentRepository.updatePayment(paymentIntentId, { paymentStatus: paymentStatus.FAILED });
//     } catch (error) {
//       console.error(`Error canceling payment intent ${paymentIntentId}:`, error);
//       throw new Error(`Failed to cancel payment intent: ${error instanceof Error ? error.message : "Unknown error"}`);
//     }
//   }

//   async createPaymentIntent(
//     eventId: string,
//     userId: string,
//     amount: number,
//     isRetry = false,
//     paymentIntentId?: string
//   ): Promise<Stripe.PaymentIntent> {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       // Check for existing pending payments for the event
//       const existingPayments = await this.paymentRepository.findPendingEvent(eventId);
//       let reusableIntent: Stripe.PaymentIntent | null = null;

//       for (const payment of existingPayments) {
//         try {
//           const intent = await this.retrievePaymentIntent(payment.stripeSessionId);
//           if (["requires_payment_method", "requires_confirmation", "requires_action"].includes(intent.status)) {
//             reusableIntent = intent;
//             break;
//           } else {
//             await this.cancelPaymentIntent(payment.stripeSessionId);
//           }
//         } catch (error) {
//           console.error(`Error processing payment ${payment.stripeSessionId}:`, error);
//           await this.paymentRepository.updatePayment(payment.stripeSessionId, {
//             paymentStatus: paymentStatus.FAILED,
//           });
//         }
//       }

//       if (reusableIntent) {
//         await session.commitTransaction();
//         return reusableIntent;
//       }

//       if (isRetry && paymentIntentId) {
//         try {
//           const existingIntent = await this.retrievePaymentIntent(paymentIntentId);
//           if (existingIntent.status === "succeeded") {
//             const existingPayment = await this.paymentRepository.getPaymentByIntentId(paymentIntentId);
//             if (existingPayment?.paymentStatus === paymentStatus.PAID) {
//               await session.commitTransaction();
//               return existingIntent;
//             }
//           }
//           if (["requires_payment_method", "requires_confirmation", "requires_action"].includes(existingIntent.status)) {
//             await session.commitTransaction();
//             return existingIntent;
//           } else {
//             throw new Error("Payment intent is not in a retryable state");
//           }
//         } catch (error) {
//           console.error(`Error retrying payment intent ${paymentIntentId}:`, error);
//           throw new Error("Failed to retrieve payment intent for retry");
//         }
//       }

//       // Create new payment intent
//       const newPaymentIntent = await stripe.paymentIntents.create({
//         amount: amount * 100,
//         currency: "inr",
//         metadata: { eventId, userId },
//         payment_method_types: ["card"],
//       });

//       const ticket: Ticket = {
//         type: "default",
//         price: amount,
//         quantity: 1,
//         totalPrice: amount,
//         uniqueId: uuidv4(),
//         uniqueQrCode: uuidv4(),
//         status: "active",
//       };

//       await BookingsModel.create(
//         [
//           {
//             bookingId: uuidv4(),
//             userId: new mongoose.Types.ObjectId(userId),
//             eventId: new mongoose.Types.ObjectId(eventId),
//             tickets: [ticket],
//             totalAmount: amount,
//             stripeSessionId: newPaymentIntent.id,
//             paymentStatus: paymentStatus.PENDING,
//           },
//         ],
//         { session }
//       );

//       await session.commitTransaction();
//       return newPaymentIntent;
//     } catch (error) {
//       await session.abortTransaction();
//       console.error("Error creating payment intent:", error);
//       throw new Error(`Failed to create payment intent: ${error instanceof Error ? error.message : "Unknown error"}`);
//     } finally {
//       session.endSession();
//     }
//   }

//   async handleWebhookEvent(event: Stripe.Event): Promise<void> {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       let payment;

//       switch (event.type) {
//         case "payment_intent.succeeded": {
//           const paymentIntent = event.data.object as Stripe.PaymentIntent;
//           payment = await this.paymentRepository.updatePayment(
//             paymentIntent.id,
//             { paymentStatus: paymentStatus.PAID },
//             session
//           );
//           if (!payment) throw new Error("Payment not found");
//           break;
//         }
//         case "payment_intent.payment_failed":
//         case "payment_intent.canceled": {
//           const paymentIntent = event.data.object as Stripe.PaymentIntent;
//           payment = await this.paymentRepository.updatePayment(
//             paymentIntent.id,
//             { paymentStatus: paymentStatus.FAILED },
//             session
//           );
//           if (!payment) throw new Error("Payment not found");
//           break;
//         }
//         default:
//           console.log(`Unhandled event type ${event.type}`);
//           return;
//       }

//       await session.commitTransaction();
//     } catch (error) {
//       await session.abortTransaction();
//       console.error("Error handling webhook:", error);
//       throw new Error(`Failed to handle webhook: ${error instanceof Error ? error.message : "Unknown error"}`);
//     } finally {
//       session.endSession();
//     }
//   }

//   async verifyPayment(paymentIntentId: string): Promise<boolean> {
//     try {
//       const payment = await this.paymentRepository.getPaymentByIntentId(paymentIntentId);
//       if (!payment) throw new Error("Payment not found");
//       return payment.paymentStatus === paymentStatus.PAID;
//     } catch (error) {
//       console.error("Error verifying payment:", error);
//       throw new Error(`Failed to verify payment: ${error instanceof Error ? error.message : "Unknown error"}`);
//     }
//   }

//   async cancelPayment(paymentIntentId: string, userId: string): Promise<void> {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const payment = await this.paymentRepository.findOne({
//         stripeSessionId: paymentIntentId,
//         user: new Types.ObjectId(userId),
//       });
//       if (!payment) throw new Error("Payment not found or unauthorized");

//       await stripe.paymentIntents.cancel(paymentIntentId);
//       await this.paymentRepository.updatePayment(paymentIntentId, { paymentStatus: paymentStatus.CANCELLED }, session);

//       await session.commitTransaction();
//     } catch (error) {
//       await session.abortTransaction();
//       console.error("Error cancelling payment:", error);
//       throw new Error(`Failed to cancel payment: ${error instanceof Error ? error.message : "Unknown error"}`);
//     } finally {
//       session.endSession();
//     }
//   }

//   async cancelSuccessfulPayment(paymentIntentId: string, userId: string): Promise<void> {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const payment = await this.paymentRepository.findOne({
//         stripeSessionId: paymentIntentId,
//         user: new Types.ObjectId(userId),
//         paymentStatus: paymentStatus.PAID,
//       });
//       if (!payment) throw new Error("Payment not found or unauthorized");

//       if (!payment.createdAt) throw new Error("Payment creation date is missing");
//       const paymentTime = new Date(payment.createdAt).getTime();
//       const currentTime = new Date().getTime();
//       if (currentTime - paymentTime > this.CANCEL_WINDOW_MS) {
//         throw new Error("Cancellation window has expired");
//       }

//       await stripe.refunds.create({ payment_intent: paymentIntentId });
//       await this.paymentRepository.updatePayment(paymentIntentId, { paymentStatus: paymentStatus.REFUNDED }, session);

//       await session.commitTransaction();
//     } catch (error) {
//       await session.abortTransaction();
//       console.error("Error cancelling successful payment:", error);
//       throw new Error(`Failed to cancel successful payment: ${error instanceof Error ? error.message : "Unknown error"}`);
//     } finally {
//       session.endSession();
//     }
//   }

//   async handleStateTransactions(): Promise<void> {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//       const staleDate = new Date(Date.now() - this.PENDING_TIMEOUT_MS);
//       const stalePayments = await this.paymentRepository.findStalePayments(paymentStatus.PENDING, staleDate);

//       for (const payment of stalePayments) {
//         try {
//           const paymentIntent = await this.retrievePaymentIntent(payment.stripeSessionId);
//           if (["requires_payment_method", "requires_confirmation", "requires_action"].includes(paymentIntent.status)) {
//             await this.cancelPaymentIntent(payment.stripeSessionId);
//           }

//           await this.paymentRepository.updatePayment(
//             payment.stripeSessionId,
//             { paymentStatus: paymentStatus.FAILED },
//             session
//           );
//         } catch (error) {
//           console.error(`Error handling stale payment ${payment.stripeSessionId}:`, error);
//           continue;
//         }
//       }

//       await session.commitTransaction();
//     } catch (error) {
//       await session.abortTransaction();
//       console.error("Error handling stale transactions:", error);
//       throw new Error(`Failed to handle stale transactions: ${error instanceof Error ? error.message : "Unknown error"}`);
//     } finally {
//       session.endSession();
//     }
//   }
// }

// export default PaymentService;