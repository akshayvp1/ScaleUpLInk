



// src/services/stripe/stripeService.ts
import { api } from "../../utils/axiosInterceptor";

interface Ticket {
  type: string;
  price: number;
  quantity: number;
  description?: string;
  perks?: string[];
  usedTickets?: number;
  totalPrice?: number;
  uniqueId?: string;
  uniqueQrCode?: string;
  status?: "active" | "used" | "cancelled";
}

interface Payment {
  bookingId: string;
  userId: string;
  eventId: string;
  tickets: Ticket[];
  totalAmount: number;
  discount?: number;
  coupon?: string | null;
  stripeSessionId: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

interface IStripeService {
  createPaymentIntent(
    eventId: string,
    amount: number,
    tickets: Ticket[],
    isRetry?: boolean,
    paymentIntentId?: string
  ): Promise<{ clientSecret: string }>;
  verifyPayment(paymentIntentId: string): Promise<Payment>;
}

class StripeService implements IStripeService {
  async createPaymentIntent(
    eventId: string,
    amount: number,
    tickets: Ticket[],
    isRetry = false,
    paymentIntentId?: string
  ): Promise<{ clientSecret: string }> {
    try {
      

      const response = await api.stripe.post("/create-payment-intent", {
        eventId,
        amount,
        tickets,
        isRetry,
        paymentIntentId,
      });
      console.log(response,"koooooi❤️❤️❤️❤️❤️")
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create payment intent.");
      }
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating payment intent:", error);
      const message = error instanceof Error ? error.message : "Failed to create payment intent.";
      throw new Error(message);
    }
  }

  async verifyPayment(paymentIntentId: string): Promise<Payment> {
    try {
      const response = await api.stripe.get(`/verify-payment/${paymentIntentId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to verify payment.");
      }
      const payment: Payment = {
        bookingId: response.data.payment.bookingId,
        userId: response.data.payment.userId.toString(),
        eventId: response.data.payment.eventId.toString(),
        tickets: response.data.payment.tickets,
        totalAmount: response.data.payment.totalAmount,
        discount: response.data.payment.discount,
        coupon: response.data.payment.coupon,
        stripeSessionId: response.data.payment.stripeSessionId,
        paymentStatus: response.data.payment.paymentStatus,
        createdAt: response.data.payment.createdAt,
        updatedAt: response.data.payment.updatedAt,
      };
      return payment;
    } catch (error: unknown) {
      console.error("Error verifying payment:", error);
      const message = error instanceof Error ? error.message : "Failed to verify payment.";
      throw new Error(message);
    }
  }
}

export default new StripeService();