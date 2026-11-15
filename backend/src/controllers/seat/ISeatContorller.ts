import { Request, Response } from "express";

export interface ISeatController {
  getSeatsForEvent(req: Request, res: Response): Promise<void>;
  generateSeatsForEvent(req: Request, res: Response): Promise<void>;
  holdSeats(req: Request, res: Response): Promise<void>;
  releaseSeats(req: Request, res: Response): Promise<void>;
  confirmSeatsBooked(req: Request, res: Response): Promise<void>;
}