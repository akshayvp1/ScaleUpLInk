


import { Schema, model } from 'mongoose';
import { EventDocument } from '../interfaces/IEvent';

const ticketSchema = new Schema(
  {
    type: { type: String, required: true, trim: true, maxlength: 80 },
    price: { type: Number, required: true, min: 0, max: 1_000_000 },
    quantity: { type: Number, required: true, min: 1, max: 1_000_000 },
  },
  { _id: true } 
);

const eventSchema = new Schema<EventDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventTitle: { type: String, required: true, trim: true, maxlength: 120 },
    eventDescription: { type: String, required: true, trim: true, maxlength: 5000 },
    eventType: {
      type: String,
      enum: ['Conference', 'Concert', 'Workshop', 'Exhibition', 'Meetup', 'Party'],
      required: true,
    },
    startDate: { type: Date, required: true },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    endingDate: { type: Date, required: true },
    endingTime: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    eventVisibility: { type: String, enum: ['Public', 'Private'], default: 'Public' },
    eventStatus: {
      type: String,
      enum: ["pending", "approve", "cancelled", "completed"],
      default: "pending"
    },
    venueName: { type: String, required: true, trim: true, maxlength: 200 },
    venueAddress: { type: String, trim: true, maxlength: 300 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    tickets: {
      type: [ticketSchema],
      required: true,
      validate: {
        validator: (tickets: unknown[]) => Array.isArray(tickets) && tickets.length > 0,
        message: 'At least one ticket type is required',
      },
    },
    ageRestriction: { type: Boolean, required: true },
    mainBanner: { type: String, required: true },
    promotionalImage: { type: String },
    attendees: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

eventSchema.index({ eventStatus: 1, startDate: 1 });
eventSchema.index({ user_id: 1, createdAt: -1 });
eventSchema.index({ city: 1, startDate: 1 });

export const EventModel = model<EventDocument>('Event', eventSchema);