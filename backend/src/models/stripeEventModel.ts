import { Schema, model } from "mongoose";
import { IStripeEvent } from "../interfaces/IStripeEvent";

const stripeEventSchema = new Schema<IStripeEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const StripeEventModel = model<IStripeEvent>("StripeEvent", stripeEventSchema);
