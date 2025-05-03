import express from 'express';
import { container } from 'tsyringe';
import PaymentController from '../controllers/payments/paymentController';

import { authenticate } from "../middlewares/auth";


const payment = express.Router();

const paymentController = container.resolve(PaymentController)


payment.post('/create-payment-intent',authenticate,paymentController.createPaymentIntent)
payment.post("/webhook",express.raw({ type: "application/json" }), paymentController.handleWebhook);
payment.get("/verify-payment/:paymentIntentId", authenticate, paymentController.verifyPayment);

export default payment