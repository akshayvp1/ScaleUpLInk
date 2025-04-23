// src/models/interfaces/IBooking.ts

import { Document, Types } from "mongoose";

export interface ITicket {
    type: string;
    price: number;
    quantity: number;
    usedTickets: number;
    totalPrice: number;
    uniqueId: string;
    uniqueQrCode: string;
    status: string;
}

export interface IBooking extends Document {
    bookingId: string;
    userId: Types.ObjectId;
    eventId: Types.ObjectId;
    tickets: ITicket[];
    totalAmount: number;
    discount: number;
    coupon?: string | null;
    stripeSessionId: string;
    paymentStatus: 'paid' | 'unpaid' | 'pending' | 'failed';
    createdAt?: Date;
    updatedAt?: Date;
}
