export interface IStripeEvent {
  eventId: string;
  type: string;
  processedAt?: Date;
}
