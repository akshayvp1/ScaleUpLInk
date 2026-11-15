// src/services/stripe/stripeService.ts
import { api } from "../../utils/axiosInterceptor";
import { Seat } from "../seat/seatServics";

export interface BookingTicket {
  seatLabel: string;
  row: string;
  number: number;
  category: string;
  price: number;
  uniqueId: string;
  uniqueQrCode: string;
  status: "active" | "used" | "cancelled";
}

export interface Payment {
  bookingId: string;
  userId: string;
  eventId: string;
  tickets: BookingTicket[];
  totalAmount: number;
  discount?: number;
  coupon?: string | null;
  stripeSessionId: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingDetails {
  bookingId: string;
  tickets: BookingTicket[];
  totalAmount: number;
  discount?: number;
  coupon?: string | null;
  paymentStatus: string;
}

export interface BookingEventSummary {
  id: string;
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: string;
  startTime: string;
  endingDate: string;
  endingTime?: string;
  venueName: string;
  venueAddress?: string;
  city: string;
  ageRestriction: boolean;
  mainBanner: string;
}

export interface FullBookingDetails {
  bookingId: string;
  tickets: BookingTicket[];
  totalAmount: number;
  discount?: number;
  coupon?: string | null;
  paymentStatus: string;
  createdAt?: string;
  event: BookingEventSummary;
}

interface IStripeService {
  createPaymentIntent(
    eventId: string,
    seats: Seat[],
    isRetry?: boolean,
    paymentIntentId?: string
  ): Promise<{ clientSecret: string }>;
  verifyPayment(paymentIntentId: string): Promise<Payment>;
  confirmSeatsBooked(
    eventId: string,
    seatLabels: string[],
    bookingId: string
  ): Promise<{ booking: BookingDetails }>;
  getBookingDetails(bookingId: string): Promise<FullBookingDetails>;
}

class StripeService implements IStripeService {
  async createPaymentIntent(
    eventId: string,
    seats: Seat[],
    isRetry = false,
    paymentIntentId?: string
  ): Promise<{ clientSecret: string }> {
    try {
      const response = await api.stripe.post("/create-payment-intent", {
        eventId,
        seats,
        isRetry,
        paymentIntentId,
      });
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

  async confirmSeatsBooked(
    eventId: string,
    seatLabels: string[],
    bookingId: string
  ): Promise<{ booking: BookingDetails }> {
    try {
      const response = await api.stripe.post("/confirm-seats-booked", {
        eventId,
        seatLabels,
        bookingId,
      });
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to confirm seats as booked.");
      }
      return { booking: response.data.booking };
    } catch (error: unknown) {
      console.error("Error confirming seats as booked:", error);
      const message = error instanceof Error ? error.message : "Failed to confirm seats as booked.";
      throw new Error(message);
    }
  }

  // Fetches the full booking + event summary for the confirmation/ticket
  // page. Safe to call any time — the backend re-verifies ownership on
  // every request rather than trusting anything cached on the client.
  async getBookingDetails(bookingId: string): Promise<FullBookingDetails> {
    try {
      const response = await api.stripe.get(`/booking/${bookingId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch booking details.");
      }
      return response.data.booking;
    } catch (error: unknown) {
      console.error("Error fetching booking details:", error);
      const message = error instanceof Error ? error.message : "Failed to fetch booking details.";
      throw new Error(message);
    }
  }
}

export default new StripeService();