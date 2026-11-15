// src/repositories/seat/seatRepository.ts
import { injectable } from "tsyringe";
import { Types } from "mongoose";
import { SeatModel } from "../../models/seatModel";
import { ISeat } from "../../interfaces/ISeat";
import { ISeatRepository } from "./ISeatRepository";

@injectable()
class SeatRepository implements ISeatRepository {
  async findByEventId(eventId: string): Promise<ISeat[]> {
    return SeatModel.find({ eventId }).sort({ row: 1, number: 1 });
  }

  async findOne(eventId: string, seatLabel: string): Promise<ISeat | null> {
    return SeatModel.findOne({ eventId, seatLabel });
  }

  async insertMany(seats: Partial<ISeat>[]): Promise<ISeat[]> {
    return SeatModel.insertMany(seats) as unknown as Promise<ISeat[]>;
  }

  // The single query that prevents double-booking. Only succeeds if the
  // seat is currently "available", OR "held" with an expired hold (so an
  // abandoned hold can be reclaimed without a separate cleanup pass).
  async atomicHold(
    eventId: string,
    seatLabel: string,
    userId: string,
    holdExpiresAt: Date
  ): Promise<ISeat | null> {
    return SeatModel.findOneAndUpdate(
      {
        eventId,
        seatLabel,
        $or: [
          { status: "available" },
          { status: "held", holdExpiresAt: { $lt: new Date() } },
        ],
      },
      {
        status: "held",
        heldBy: new Types.ObjectId(userId),
        holdExpiresAt,
      },
      { new: true }
    );
  }

  // Unlike atomicHold, this does NOT try to claim an available seat — it
  // only refreshes the expiry on a seat this exact user is already
  // holding. Used when the user reaches the actual payment step, so the
  // 5-minute window restarts from "about to pay" instead of "originally
  // selected".
  async atomicExtendHold(
    eventId: string,
    seatLabel: string,
    userId: string,
    holdExpiresAt: Date
  ): Promise<ISeat | null> {
    return SeatModel.findOneAndUpdate(
      {
        eventId,
        seatLabel,
        heldBy: new Types.ObjectId(userId),
        status: "held",
      },
      { holdExpiresAt },
      { new: true }
    );
  }

  async atomicRelease(eventId: string, seatLabels: string[], userId: string): Promise<number> {
    const result = await SeatModel.updateMany(
      { eventId, seatLabel: { $in: seatLabels }, heldBy: new Types.ObjectId(userId) },
      { status: "available", heldBy: null, holdExpiresAt: null }
    );
    return result.modifiedCount;
  }

  // Flips held -> booked. Only matches seats this user currently holds, so
  // a stale/expired hold can never be silently converted into a booking.
  async atomicConfirmBooked(
    eventId: string,
    seatLabels: string[],
    userId: string,
    bookingId: string
  ): Promise<number> {
    const result = await SeatModel.updateMany(
      {
        eventId,
        seatLabel: { $in: seatLabels },
        heldBy: new Types.ObjectId(userId),
        status: "held",
      },
      {
        status: "booked",
        bookingId: new Types.ObjectId(bookingId),
        holdExpiresAt: null,
      }
    );
    return result.modifiedCount;
  }

  async releaseAllExpiredHolds(): Promise<number> {
    const result = await SeatModel.updateMany(
      { status: "held", holdExpiresAt: { $lt: new Date() } },
      { status: "available", heldBy: null, holdExpiresAt: null }
    );
    return result.modifiedCount;
  }

  async countAvailable(eventId: string): Promise<number> {
    return SeatModel.countDocuments({ eventId, status: "available" });
  }
  async findByEventAndLabels(eventId: string, seatLabels: string[]): Promise<ISeat[]> {
    try {
      return await SeatModel.find({
        eventId,
        seatLabel: { $in: seatLabels },
      }).exec();
    } catch (error: unknown) {
      console.error("Error finding seats by labels:", error);
      throw new Error(`Failed to find seats: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

export default SeatRepository;