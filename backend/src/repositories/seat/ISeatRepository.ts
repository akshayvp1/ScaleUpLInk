// src/repositories/seat/ISeatRepository.ts
import { ISeat } from "../../interfaces/ISeat";

export interface ISeatRepository {
  findByEventAndLabels(eventId: string, seatLabels: string[]): Promise<ISeat[]>;
  findByEventId(eventId: string): Promise<ISeat[]>;
  findOne(eventId: string, seatLabel: string): Promise<ISeat | null>;
  insertMany(seats: Partial<ISeat>[]): Promise<ISeat[]>;
  atomicHold(
    eventId: string,
    seatLabel: string,
    userId: string,
    holdExpiresAt: Date
  ): Promise<ISeat | null>;
  atomicExtendHold(
    eventId: string,
    seatLabel: string,
    userId: string,
    holdExpiresAt: Date
  ): Promise<ISeat | null>;
  atomicRelease(eventId: string, seatLabels: string[], userId: string): Promise<number>;
  atomicConfirmBooked(
    eventId: string,
    seatLabels: string[],
    userId: string,
    bookingId: string
  ): Promise<number>;
  releaseAllExpiredHolds(): Promise<number>;
  countAvailable(eventId: string): Promise<number>;
}