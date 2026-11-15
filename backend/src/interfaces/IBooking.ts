// src/interfaces/IBooking.ts
import { Types } from "mongoose";

export interface ITicket {
  seatLabel: string;
  row: string;
  number: number;
  category: string;
  price: number;
  uniqueId: string;
  uniqueQrCode: string;
  status: "active" | "used" | "cancelled";
}

export interface IBooking {
  _id?: Types.ObjectId;
  bookingId: string;
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  tickets: ITicket[];
  totalAmount: number;
  discount?: number;
  coupon?: string | null;
  stripeSessionId: string;
  paymentStatus: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  createdAt?: Date;
  updatedAt?: Date;
}