// src/services/seatService.ts
import { injectable, inject } from "tsyringe";
import { ISeatRepository } from "../../repositories/seat/ISeatRepository";
import { ISeat } from "../../interfaces/ISeat";
import { ISeatService, HoldResult, ExtendHoldResult } from "./ISeatService";
const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SEATS_PER_HOLD = 8;

@injectable()
class SeatService implements ISeatService {
  constructor(
    @inject("SeatRepository") private seatRepository: ISeatRepository
  ) {}

  async getSeatsForEvent(eventId: string): Promise<ISeat[]> {
    return this.seatRepository.findByEventId(eventId);
  }

  async generateSeatsForEvent(
    eventId: string,
    rows: { row: string; count: number; category: string; price: number }[]
  ): Promise<ISeat[]> {
    const seatsToInsert: Partial<ISeat>[] = [];
    for (const { row, count, category, price } of rows) {
      for (let n = 1; n <= count; n++) {
        seatsToInsert.push({
          eventId: eventId as unknown as ISeat["eventId"],
          seatLabel: `${row}${n}`,
          row,
          number: n,
          category,
          price,
          status: "available",
        });
      }
    }
    return this.seatRepository.insertMany(seatsToInsert);
  }

  // Holds each requested seat with one atomic update per seat. If any seat
  // fails (already taken), rolls back every seat this call just claimed so
  // the user isn't left holding a partial, confusing selection.
  async holdSeats(eventId: string, seatLabels: string[], userId: string): Promise<HoldResult> {
    if (seatLabels.length === 0) {
      return { success: false, seats: [], failedLabels: [] };
    }
    if (seatLabels.length > MAX_SEATS_PER_HOLD) {
      throw new Error(`You can hold at most ${MAX_SEATS_PER_HOLD} seats at a time.`);
    }

    const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);

    const results = await Promise.all(
      seatLabels.map((seatLabel) =>
        this.seatRepository.atomicHold(eventId, seatLabel, userId, holdExpiresAt)
      )
    );

    const failedLabels = seatLabels.filter((_, i) => !results[i]);

    if (failedLabels.length > 0) {
      const succeededLabels = seatLabels.filter((label) => !failedLabels.includes(label));
      if (succeededLabels.length > 0) {
        await this.seatRepository.atomicRelease(eventId, succeededLabels, userId);
      }
      return { success: false, seats: [], failedLabels };
    }

    return { success: true, seats: results as ISeat[], failedLabels: [] };
  }

  // Refreshes the hold expiry for seats the user already holds (used when
  // they reach the actual payment step, so the 5-minute window restarts).
  // Any seat that isn't currently held by this exact user counts as failed
  // — e.g. their hold already expired and was reclaimed by someone else.
  async extendHold(eventId: string, seatLabels: string[], userId: string): Promise<ExtendHoldResult> {
    if (seatLabels.length === 0) {
      return { success: false, failedLabels: [] };
    }

    const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);

    const results = await Promise.all(
      seatLabels.map((seatLabel) =>
        this.seatRepository.atomicExtendHold(eventId, seatLabel, userId, holdExpiresAt)
      )
    );

    const failedLabels = seatLabels.filter((_, i) => !results[i]);

    return { success: failedLabels.length === 0, failedLabels };
  }

  async releaseSeats(eventId: string, seatLabels: string[], userId: string): Promise<void> {
    await this.seatRepository.atomicRelease(eventId, seatLabels, userId);
  }

  async getSeatsByLabels(eventId: string, seatLabels: string[]): Promise<ISeat[]> {
    return this.seatRepository.findByEventAndLabels(eventId, seatLabels);
  }

  async confirmSeatsBooked(
    eventId: string,
    seatLabels: string[],
    userId: string,
    bookingId: string
  ): Promise<void> {
    const modifiedCount = await this.seatRepository.atomicConfirmBooked(
      eventId,
      seatLabels,
      userId,
      bookingId
    );

    if (modifiedCount !== seatLabels.length) {
      // Hold expired or was reclaimed mid-payment. Rare given the 5-minute
      // window, but the caller (payment verification flow) must treat this
      // as a failure and trigger a refund.
      throw new Error(
        "One or more seat holds expired before payment could be confirmed. Refund required."
      );
    }
  }

  async releaseExpiredHolds(): Promise<number> {
    return this.seatRepository.releaseAllExpiredHolds();
  }
}

export default SeatService;