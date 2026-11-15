import { ClientSession } from "mongoose";

export interface IPaymentRepository {
  ensureStripeEventIndex(): Promise<void>;
  claimStripeEvent(eventId: string, type: string, session?: ClientSession): Promise<boolean>;
}