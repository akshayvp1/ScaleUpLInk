// src/services/seat/ISeatService.ts
import { ISeat } from "../../interfaces/ISeat";


export interface HoldResult {
  success: boolean;
  seats: ISeat[];
  failedLabels: string[];
}

export interface ExtendHoldResult {
  success: boolean;
  failedLabels: string[];
}


export interface ISeatService {
  getSeatsForEvent(eventId: string): Promise<ISeat[]>;
  generateSeatsForEvent(
    eventId: string,
    rows: { row: string; count: number; category: string; price: number }[],
    requester?: { id: string; role?: string }
  ): Promise<ISeat[]>;
  holdSeats(eventId: string, seatLabels: string[], userId: string): Promise<HoldResult>;
  extendHold(eventId: string, seatLabels: string[], userId: string): Promise<ExtendHoldResult>;
  releaseSeats(eventId: string, seatLabels: string[], userId: string): Promise<void>;
    getSeatsByLabels(eventId: string, seatLabels: string[]): Promise<ISeat[]>;

confirmSeatsBooked(
    eventId: string,
    seatLabels: string[],
    userId: string,
    bookingId: string
  ): Promise<void>;
  releaseExpiredHolds(): Promise<number>;
}
