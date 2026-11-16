// src/services/seatService.ts
import { injectable, inject } from "tsyringe";
import { Model, Types } from "mongoose";
import { ISeatRepository } from "../../repositories/seat/ISeatRepository";
import { ISeat } from "../../interfaces/ISeat";
import { ISeatService, HoldResult, ExtendHoldResult } from "./ISeatService";
import { EventDocument } from "../../interfaces/IEvent";
import {
  assertEventBookable,
  getEventStartDateTime,
} from "../../utils/eventValidation";

const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SEATS_PER_HOLD = 8;
const MAX_SEATS_PER_EVENT = 5000;

const uniqueSeatLabels = (seatLabels: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const label of seatLabels) {
    if (typeof label !== "string") continue;
    const trimmed = label.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
};

@injectable()
class SeatService implements ISeatService {
  constructor(
    @inject("SeatRepository") private seatRepository: ISeatRepository,
    @inject("EventModel") private eventModel: Model<EventDocument>
  ) {}

  private async getEventOrThrow(eventId: string): Promise<EventDocument> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid event id");
    }

    const event = await this.eventModel.findById(eventId);
    if (!event) throw new Error("Event not found");
    return event;
  }

  async getSeatsForEvent(eventId: string): Promise<ISeat[]> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new Error("Invalid event id");
    }

    const seats = await this.seatRepository.findByEventId(eventId);
    const now = Date.now();

    // Expired holds are logically available even before the cleanup job runs.
    // Presenting them as available avoids showing phantom "held" seats and
    // matches what the atomic claim query will actually allow.
    return seats.map((seat) => {
      if (
        seat.status === "held" &&
        seat.holdExpiresAt &&
        new Date(seat.holdExpiresAt).getTime() <= now
      ) {
        const raw = seat.toObject ? seat.toObject() : seat;
        return {
          ...raw,
          status: "available",
          heldBy: null,
          holdExpiresAt: null,
        } as ISeat;
      }
      return seat;
    });
  }

  async generateSeatsForEvent(
    eventId: string,
    rows: { row: string; count: number; category: string; price: number }[],
    requester?: { id: string; role?: string }
  ): Promise<ISeat[]> {
    const event = await this.getEventOrThrow(eventId);

    if (
      requester &&
      requester.role !== "admin" &&
      event.user_id.toString() !== requester.id
    ) {
      throw new Error("You can only create a seat map for your own event");
    }

    if (event.eventStatus === "cancelled" || event.eventStatus === "completed") {
      throw new Error("This event is no longer accepting a seat map");
    }

    const start = getEventStartDateTime(event);
    if (start && start.getTime() <= Date.now()) {
      throw new Error("This event has already started");
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("At least one seat row is required");
    }

    const existingCount = await this.seatRepository.countByEvent(eventId);
    if (existingCount > 0) {
      throw new Error(
        "A seat map already exists for this event. Delete or update it instead of generating a new one."
      );
    }

    const seatsToInsert: Partial<ISeat>[] = [];
    const seenRows = new Set<string>();

    for (const raw of rows) {
      const row = typeof raw?.row === "string" ? raw.row.trim().toUpperCase() : "";
      const category =
        typeof raw?.category === "string" ? raw.category.trim() : "";
      const count = Number(raw?.count);
      const price = Number(raw?.price);

      if (!row) throw new Error("Every seat row needs a row label");
      if (row.length > 10) throw new Error(`Row label "${row}" is too long`);
      if (seenRows.has(row)) throw new Error(`Row "${row}" was added twice`);
      seenRows.add(row);

      if (!category) throw new Error(`Row "${row}" needs a ticket category`);
      if (!Number.isInteger(count) || count < 1) {
        throw new Error(`Row "${row}" needs a whole number of seats of at least 1`);
      }
      if (!Number.isFinite(price) || price < 0) {
        throw new Error(`Row "${row}" has an invalid price`);
      }

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

    if (seatsToInsert.length > MAX_SEATS_PER_EVENT) {
      throw new Error(`An event cannot have more than ${MAX_SEATS_PER_EVENT} seats`);
    }

    return this.seatRepository.insertMany(seatsToInsert);
  }

  // Holds each requested seat with one atomic update per seat. If any seat
  // fails (already taken), rolls back every seat this call just claimed so
  // the user isn't left holding a partial, confusing selection.
  async holdSeats(eventId: string, seatLabels: string[], userId: string): Promise<HoldResult> {
    const labels = uniqueSeatLabels(Array.isArray(seatLabels) ? seatLabels : []);
    if (labels.length === 0) {
      return { success: false, seats: [], failedLabels: [] };
    }
    if (labels.length > MAX_SEATS_PER_HOLD) {
      throw new Error(`You can hold at most ${MAX_SEATS_PER_HOLD} seats at a time.`);
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user id");
    }

    const event = await this.getEventOrThrow(eventId);
    assertEventBookable(event);

    const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);

    const results = await Promise.all(
      labels.map((seatLabel) =>
        this.seatRepository.atomicHold(eventId, seatLabel, userId, holdExpiresAt)
      )
    );

    const failedLabels = labels.filter((_, i) => !results[i]);

    if (failedLabels.length > 0) {
      const succeededLabels = labels.filter((label) => !failedLabels.includes(label));
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
    const labels = uniqueSeatLabels(Array.isArray(seatLabels) ? seatLabels : []);
    if (labels.length === 0) {
      return { success: false, failedLabels: [] };
    }
    if (labels.length > MAX_SEATS_PER_HOLD) {
      throw new Error(`You can hold at most ${MAX_SEATS_PER_HOLD} seats at a time.`);
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user id");
    }

    const event = await this.getEventOrThrow(eventId);
    assertEventBookable(event);

    const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MS);

    const results = await Promise.all(
      labels.map((seatLabel) =>
        this.seatRepository.atomicExtendHold(eventId, seatLabel, userId, holdExpiresAt)
      )
    );

    const failedLabels = labels.filter((_, i) => !results[i]);

    return { success: failedLabels.length === 0, failedLabels };
  }

  async releaseSeats(eventId: string, seatLabels: string[], userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(eventId) || !Types.ObjectId.isValid(userId)) {
      return;
    }
    const labels = uniqueSeatLabels(Array.isArray(seatLabels) ? seatLabels : []);
    if (labels.length === 0) return;
    await this.seatRepository.atomicRelease(eventId, labels, userId);
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
    if (!Types.ObjectId.isValid(eventId) || !Types.ObjectId.isValid(bookingId)) {
      throw new Error("Invalid event or booking id");
    }

    const labels = uniqueSeatLabels(Array.isArray(seatLabels) ? seatLabels : []);
    if (labels.length === 0) {
      throw new Error("At least one seat is required");
    }

    const modifiedCount = await this.seatRepository.atomicConfirmBooked(
      eventId,
      labels,
      userId,
      bookingId
    );

    if (modifiedCount === labels.length) return;

    // The webhook and the frontend can both confirm the same booking. Treat
    // that as success when the seats are already booked against this exact
    // booking id; only a genuinely lost hold is an error.
    const alreadyBooked = await this.seatRepository.countBookedByBooking(
      eventId,
      labels,
      bookingId
    );

    if (alreadyBooked !== labels.length) {
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