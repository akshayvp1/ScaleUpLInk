import { Document, Types } from 'mongoose';

export interface Ticket {
  type: string;
  price: number;
  quantity: number;
  _id?: string; 
}

export interface EventDocument extends Document {
  _id: Types.ObjectId; 
  user_id: Types.ObjectId;
  eventTitle: string;
  eventDescription: string;
  eventType: 'Conference' | 'Concert' | 'Workshop' | 'Exhibition' | 'Meetup' | 'Party';
  eventStatus: 'pending' | 'approve' | 'cancelled' | 'completed';
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
  attendees: number;
  createdAt: Date;
  updatedAt: Date;
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

export interface RawEventProps {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  type: string;
  startDate: string;
  startTime: string;
  endingDate: string;
  endingTime: string;
  eventVisibility: 'Public' | 'Private';
  venueName: string;
  venueAddress?: string;
  city: string;
  tickets: Ticket[]; 
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage?: string;
  attendees: number;
  createdAt?: string;
  updatedAt?: string;
}