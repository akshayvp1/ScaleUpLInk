import { container } from "tsyringe";
import SeatService from "../services/seat/seatService";

const seatService = container.resolve(SeatService);

const CHECK_INTERVAL_MS = 60 * 1000;

export const startSeatHoldCleanupJob = (): void => {
  setInterval(async () => {
    try {
      const releasedCount = await seatService.releaseExpiredHolds();

      if (releasedCount > 0) {
        console.log(`Released ${releasedCount} expired seat hold(s).`);
      }
    } catch (err) {
      console.error("Error releasing expired seat holds:", err);
    }
  }, CHECK_INTERVAL_MS);
};