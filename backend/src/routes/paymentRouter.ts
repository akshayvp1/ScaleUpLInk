import express from 'express';
import { container } from 'tsyringe';
import PaymentController from '../controllers/payments/paymentController';
import { authenticate } from "../middlewares/auth";
import { isUserActive } from "../middlewares/checkUserStatus";
import AuthService from "../services/entrepreneur/authService";
import InvestorService from "../services/investor/investorService";

const payment = express.Router();

const paymentController = container.resolve(PaymentController);
const authService = container.resolve(AuthService);
const investorService = container.resolve(InvestorService);
const activeCheck = isUserActive(authService, investorService);

payment.post('/create-payment-intent', authenticate, activeCheck, paymentController.createPaymentIntent.bind(paymentController));
payment.post("/webhook", paymentController.handleWebhook.bind(paymentController));
payment.get("/verify-payment/:paymentIntentId", authenticate, activeCheck, paymentController.verifyPayment.bind(paymentController));
payment.post("/confirm-seats-booked", authenticate, activeCheck, paymentController.confirmSeatsBooked.bind(paymentController));
payment.get("/ticket/:qrCode", authenticate, activeCheck, paymentController.verifyTicket.bind(paymentController));
payment.post("/ticket/:qrCode/check-in", authenticate, activeCheck, paymentController.checkInTicket.bind(paymentController));
payment.get("/booking/:bookingId", authenticate, activeCheck, paymentController.getBookingDetails.bind(paymentController));

export default payment;