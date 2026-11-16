// src/controllers/payments/interface/IPaymentController.ts
import { Request, Response } from "express";

export interface IPaymentController {
  createPaymentIntent(req: Request, res: Response): Promise<void>;
  handleWebhook(req: Request, res: Response): Promise<void>;
  verifyPayment(req: Request, res: Response): Promise<void>;
  confirmSeatsBooked(req: Request, res: Response): Promise<void>;
  verifyTicket(req: Request, res: Response): Promise<void>;
  checkInTicket(req: Request, res: Response): Promise<void>;
  getBookingDetails(req: Request, res: Response): Promise<void>;
}