// // models/eventModel.ts
// import { Schema, model } from 'mongoose';
// import { EventDocument } from '../interfaces/IEvent';

// const ticketSchema = new Schema(
//   {
//     type: {
//       type: String,
//       required: true,
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     quantity: {
//       type: Number,
//       required: true,
//     },
//   },
//   { _id: false } 
// );

// const eventSchema = new Schema<EventDocument>(
//   {
//     user_id: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     eventTitle: {
//       type: String,
//       required: true,
//     },
//     eventDescription: {
//       type: String,
//       required: true,
//     },
//     eventType: {
//       type: String,
//       enum: ['Conference', 'Concert', 'Workshop', 'Exhibition', 'Meetup', 'Party'],
//       required: true,
//     },
//     startDate: {
//       type: Date,
//       required: true,
//     },
//     startTime: {
//       type: String,
//       required: true,
//     },
//     endingDate: {
//       type: Date,
//       required: true,
//     },
//     endingTime: {
//       type: String,
//     },
//     eventVisibility: {
//       type: String,
//       enum: ['Public', 'Private'],
//       required: true,
//     },
//     venueName: {
//       type: String,
//       required: true,
//     },
//     venueAddress: {
//       type: String,
//     },
//     city: {
//       type: String,
//       required: true,
//     },
//     tickets: {
//       type: [ticketSchema],
//       required: true,
//     },
//     ageRestriction: {
//       type: Boolean,
//       required: true,
//     },
//     mainBanner: {
//       type: String,
//       required: true,
//     },
//     promotionalImage: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export const EventModel = model<EventDocument>('Event', eventSchema);



import { Schema, model } from 'mongoose';
import { EventDocument } from '../interfaces/IEvent';

const ticketSchema = new Schema(
  {
    type: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: true } 
);

const eventSchema = new Schema<EventDocument>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventTitle: { type: String, required: true },
    eventDescription: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['Conference', 'Concert', 'Workshop', 'Exhibition', 'Meetup', 'Party'],
      required: true,
    },
    startDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endingDate: { type: Date, required: true },
    endingTime: { type: String },
    eventVisibility: { type: String, enum: ['Public', 'Private'], default: 'Public' },
    eventStatus: {
      type: String,
      enum: ["pending", "approve", "cancelled", "completed"],
      default: "pending"
    },
    venueName: { type: String, required: true },
    venueAddress: { type: String },
    city: { type: String, required: true },
    tickets: { type: [ticketSchema], required: true },
    ageRestriction: { type: Boolean, required: true },
    mainBanner: { type: String, required: true },
    promotionalImage: { type: String },
    attendees: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const EventModel = model<EventDocument>('Event', eventSchema);