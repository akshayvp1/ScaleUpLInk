// src/models/bookingModel.ts
import { Schema, model } from "mongoose";
import { IBooking, ITicket } from "../interfaces/IBooking";

// One ticket per booked seat — seatLabel/row/number/category/price are
// copied from the seat at booking time so the ticket stays historically
// accurate even if the event's seat pricing changes later.
const ticketSchema = new Schema<ITicket>({
  seatLabel: { type: String, required: true },
  row: { type: String, required: true },
  number: { type: Number, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  uniqueId: { type: String, required: true, unique: true },
  uniqueQrCode: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['active', 'used', 'cancelled'],
    default: 'active',
  },
});

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
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ userId: 1, paymentStatus: 1 });
bookingSchema.index({ eventId: 1, paymentStatus: 1 });
bookingSchema.index({ paymentStatus: 1, updatedAt: 1 });

export const BookingsModel = model<IBooking>('Bookings', bookingSchema);