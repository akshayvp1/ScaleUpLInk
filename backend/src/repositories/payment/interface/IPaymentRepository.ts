import { ClientSession } from "mongoose";
import { IBooking } from "../../../interfaces/IBooking";

export interface IPaymentRepository {
  ensureStripeEventIndex(): Promise<void>;
  claimStripeEvent(eventId: string, type: string, session?: ClientSession): Promise<boolean>;
  findTicketByQrCode(qrCode: string): Promise<IBooking | null>;
  markTicketUsed(bookingId: string, qrCode: string): Promise<IBooking | null>;
}