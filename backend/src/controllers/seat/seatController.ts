// src/controllers/seatController.ts
import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { ISeatService } from "../../services/seat/ISeatService";

import {ISeatController} from "./ISeatContorller";

@injectable()
class SeatController implements ISeatController {
  constructor(
    @inject("SeatService") private seatService: ISeatService
  ) {}

  // Arrow-function class properties keep `this` bound to the instance when
  // these are passed directly as Express handlers (e.g. router.get("/", controller.getSeatsForEvent)),
  // same as you'd otherwise need .bind(controller) for in the routes file.

  getSeatsForEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId } = req.params;
      const seats = await this.seatService.getSeatsForEvent(eventId as string);
      res.set('Cache-Control', 'no-store'); // seat availability is live data — never cache this
      res.status(200).json({ success: true, seats });
    } catch (error) {
      console.error("Error fetching seats:", error);
      res.status(500).json({ success: false, message: "Failed to fetch seats." });
    }
  };

  generateSeatsForEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId, rows } = req.body;
      if (!eventId || !Array.isArray(rows) || rows.length === 0) {
        res.status(400).json({ success: false, message: "eventId and rows are required." });
        return;
      }
      const seats = await this.seatService.generateSeatsForEvent(eventId, rows);
      res.status(201).json({ success: true, seats });
    } catch (error) {
      console.error("Error generating seats:", error);
      res.status(500).json({ success: false, message: "Failed to generate seats." });
    }
  };

  holdSeats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId, seatLabels } = req.body;
      const userId = req.user!.id; 

      if (!eventId || !Array.isArray(seatLabels) || seatLabels.length === 0) {
        res.status(400).json({ success: false, message: "eventId and seatLabels are required." });
        return;
      }

      const result = await this.seatService.holdSeats(eventId, seatLabels, userId);

      if (!result.success) {
        res.status(409).json({
          success: false,
          message: "Some seats are no longer available.",
          failedLabels: result.failedLabels,
        });
        return;
      }

      res.status(200).json({ success: true, seats: result.seats });
    } catch (error) {
      console.error("Error holding seats:", error);
      const message = error instanceof Error ? error.message : "Failed to hold seats.";
      res.status(500).json({ success: false, message });
    }
  };

  releaseSeats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId, seatLabels } = req.body;
      const userId = req.user!.id;

      if (!eventId || !Array.isArray(seatLabels) || seatLabels.length === 0) {
        res.status(400).json({ success: false, message: "eventId and seatLabels are required." });
        return;
      }

      await this.seatService.releaseSeats(eventId, seatLabels, userId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error releasing seats:", error);
      res.status(500).json({ success: false, message: "Failed to release seats." });
    }
  };

  // Called right after Stripe payment verification succeeds on the frontend.
  // This is the step that makes seats permanently unavailable.
  confirmSeatsBooked = async (req: Request, res: Response): Promise<void> => {
    try {
      const { eventId, seatLabels, bookingId } = req.body;
      const userId = req.user!.id;

      if (!eventId || !Array.isArray(seatLabels) || seatLabels.length === 0 || !bookingId) {
        res.status(400).json({
          success: false,
          message: "eventId, seatLabels, and bookingId are required.",
        });
        return;
      }

      await this.seatService.confirmSeatsBooked(eventId, seatLabels, userId, bookingId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error confirming seats as booked:", error);
      const message = error instanceof Error ? error.message : "Failed to confirm seats as booked.";
      // 409: hold expired / was reclaimed — caller must trigger a refund
      res.status(409).json({ success: false, message });
    }
  };
}

export default SeatController;