// src/interfaces/ISeat.ts
import { Document, Types } from "mongoose";

export type SeatStatus = "available" | "held" | "booked";

export interface ISeat extends Document {
  eventId: Types.ObjectId;
  seatLabel: string;
  row: string;
  number: number;
  category: string;
  price: number;
  status: SeatStatus;
  heldBy?: Types.ObjectId | null;
  holdExpiresAt?: Date | null;
  bookingId?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}