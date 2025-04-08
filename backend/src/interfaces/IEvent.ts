// interfaces/event.interface.ts
import { Document, Types } from 'mongoose';

export interface Ticket {
  type: string;
  price: number;
  quantity: number;
}

export interface EventDocument extends Document {
  _id: Types.ObjectId; // Explicitly type _id
  user_id: Types.ObjectId;
  eventTitle: string;
  eventDescription: string;
  eventType: 'Conference' | 'Concert' | 'Workshop' | 'Exhibition' | 'Meetup' | 'Party';
  startDate: Date;
  startTime: string;
  endingDate: Date;
  endingTime?: string;
  eventVisibility: 'Public' | 'Private';
  venueName: string;
  venueAddress?: string;
  city: string;
  tickets: Ticket[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateEventDTO {
  eventTitle: string;
  eventDescription: string;
  eventType: 'Conference' | 'Concert' | 'Workshop' | 'Exhibition' | 'Meetup' | 'Party';
  startDate: Date;
  startTime: string;
  endingDate: Date;
  endingTime?: string;
  eventVisibility: 'Public' | 'Private';
  venueName: string;
  venueAddress?: string;
  city: string;
  tickets: Ticket[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage?: string;
}

// repositories/event/eventRepository.ts
export interface RawEventProps {
  id: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  startTime: string;
  endingDate: string;
  endingTime: string;
  venueName: string;
  city: string;
  ticketPrice: number;
  ageRestriction: boolean;
  mainBanner: string;
  attendees: number;
}