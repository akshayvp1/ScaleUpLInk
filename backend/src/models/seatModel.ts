// src/models/seatModel.ts
import { Schema, model } from "mongoose";
import { ISeat } from "../interfaces/ISeat";

const seatSchema = new Schema<ISeat>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    seatLabel: { type: String, required: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["available", "held", "booked"],
      default: "available",
      required: true,
    },
    heldBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    holdExpiresAt: { type: Date, default: null },
    bookingId: { type: Schema.Types.ObjectId, ref: "Bookings", default: null },
  },
  { timestamps: true }
);

// One seat label per event — also the lookup path for every hold/confirm call
seatSchema.index({ eventId: 1, seatLabel: 1 }, { unique: true });

// Powers the "release expired holds" cron/query
seatSchema.index({ status: 1, holdExpiresAt: 1 });

export const SeatModel = model<ISeat>("Seat", seatSchema);