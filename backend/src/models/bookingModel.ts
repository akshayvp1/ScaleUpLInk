// src/models/bookingModel.ts
import { Schema, model } from "mongoose";
import { IBooking } from "../interfaces/IBooking";

// Ticket Subdocument Schema
const ticketSchema = new Schema({
  type: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  usedTickets: { type: Number, required: true, min: 0, default: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  uniqueId: { type: String, required: true, unique: true },
  uniqueQrCode: { type: String, required: true }, // Store QR code data URL or reference
  status: { type: String, required: true, enum: ['active', 'used', 'cancelled'], default: 'active' },
});

// Booking Schema
const bookingSchema = new Schema<IBooking>({
  bookingId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  tickets: {
    type: [ticketSchema],
    required: true,
    validate: {
      validator: (tickets: unknown[]) => Array.isArray(tickets) && tickets.length > 0,
      message: 'At least one ticket is required',
    },
  },
  totalAmount: { type: Number, required: true, min: 0 },
  discount: { type: Number, min: 0, default: 0 },
  coupon: { type: String, default: null },
  stripeSessionId: { type: String, required: true, unique: true },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

export const BookingsModel = model<IBooking>('Bookings', bookingSchema);