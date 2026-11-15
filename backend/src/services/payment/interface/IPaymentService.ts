import Stripe from "stripe";
import { IBooking, ITicket } from "../../../interfaces/IBooking";

export interface BookingEventSummary {
  id: string;
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: Date;
  startTime: string;
  endingDate: Date;
  endingTime?: string;
  venueName: string;
  venueAddress?: string;
  city: string;
  ageRestriction: boolean;
  mainBanner: string;
}

export interface BookingDetailsResponse {
  bookingId: string;
  tickets: ITicket[];
  totalAmount: number;
  discount?: number;
  coupon?: string | null;
  paymentStatus: string;
  createdAt?: Date;
  event: BookingEventSummary;
}

export interface IPaymentService {
  createPaymentIntent(
    eventId: string,
    userId: string,
    seatLabels: string[],
    isRetry?: boolean,
    paymentIntentId?: string
  ): Promise<Stripe.PaymentIntent>;
  retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent>;
  cancelPayment(paymentIntentId: string): Promise<void>;
  handleWebhookEvent(event: Stripe.Event): Promise<void>;
  verifyPayment(paymentIntentId: string, userId: string): Promise<any>;
  confirmSeatsBooked(
    eventId: string,
    seatLabels: string[],
    userId: string,
    bookingId: string
  ): Promise<IBooking>;
  getBookingDetails(bookingId: string, userId: string): Promise<BookingDetailsResponse>;
  handleStateTransactions(): Promise<void>;
}