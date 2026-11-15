import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { IPaymentController } from "./interface/IPaymentController";
import PaymentService from "../../services/payment/paymentService";
import stripe from "../../config/stripe";

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

@injectable()
class PaymentController implements IPaymentController {
    constructor(
        @inject("PaymentService") private paymentService: PaymentService
    ) {}

    createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
        try {
            const { eventId, seats, isRetry, paymentIntentId } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (!Array.isArray(seats) || seats.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'At least one seat is required.',
                });
                return;
            }

            const seatLabels: string[] = seats.map((s: { seatLabel: string }) => s.seatLabel);

            const paymentIntent = await this.paymentService.createPaymentIntent(
                eventId,
                userId,
                seatLabels,
                isRetry,
                paymentIntentId
            );

            res.status(200).json({
                success: true,
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error: any) {
            console.error('Error creating payment intent:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message || 'Something went wrong',
            });
        }
    };

    handleWebhook = async (req: Request, res: Response): Promise<void> => {
        const sig = req.headers["stripe-signature"] as string;

        try {
            if (!sig) {
                throw new Error("No Stripe signature found");
            }

            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                stripeWebhookSecret
            );

            await this.paymentService.handleWebhookEvent(event);
            res.status(200).json({ received: true });
        } catch (error: any) {
            console.error("Stripe Webhook Error:", error.message);
            res.status(400).json({
                success: false,
                message: error.message || "Webhook error",
            });
        }
    };

    verifyPayment = async (req: Request, res: Response): Promise<void> => {
        try {
          const { paymentIntentId } = req.params;
          const userId = req.user?.id;

          if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
          }

          const payment = await this.paymentService.verifyPayment(
            paymentIntentId as string,
            userId
          );

          if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
            return;
          }
          res.status(200).json({ success: true, payment });
        } catch (error: any) {
            console.error("Error verifying payment:", error);
            const message = error.message || "Failed to verify payment";
            const status =
                message === "Payment not found"
                    ? 404
                    : message === "Payment does not belong to you"
                        ? 403
                        : 500;
            res.status(status).json({
                success: false,
                message: status === 500 ? "Failed to verify payment" : message,
            });
        }
    };

    // Called by the frontend right after verifyPayment confirms
    // paymentStatus === "paid". The service independently re-checks that
    // before touching any seat, so this endpoint is safe even if called
    // directly without a real payment.
   confirmSeatsBooked = async (req: Request, res: Response): Promise<void> => {
        try {
            const { eventId, seatLabels, bookingId } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            if (!eventId || !Array.isArray(seatLabels) || seatLabels.length === 0 || !bookingId) {
                res.status(400).json({
                    success: false,
                    message: 'eventId, seatLabels, and bookingId are required.',
                });
                return;
            }

            const booking = await this.paymentService.confirmSeatsBooked(eventId, seatLabels, userId, bookingId);

            res.status(200).json({ success: true, booking });
        } catch (error: any) {
            console.error('Error confirming seats as booked:', error);
            res.status(409).json({
                success: false,
                message: error.message || 'Failed to confirm seats as booked.',
            });
        }
    };
    getBookingDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const { bookingId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated',
                });
                return;
            }

            const details = await this.paymentService.getBookingDetails(
                bookingId as string,
                userId
            );

            res.status(200).json({ success: true, booking: details });
        } catch (error: any) {
            console.error('Error fetching booking details:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'Booking not found.',
            });
        }
    };
}

export default PaymentController;