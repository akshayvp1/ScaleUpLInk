import express from "express";
import container from "../config/container";
import AuthController from "../controllers/entrepreneur/authController";
// import { authenticate } from "../middlewares/auth";

const entrepreneur = express.Router();
const authController = container.resolve(AuthController);

// ================== Entrepreneur Auth Routes ==================
entrepreneur.post("/send-otp", authController.register.bind(authController));
entrepreneur.post("/resend-otp", authController.resendOtp.bind(authController));
entrepreneur.post("/verify-otp", authController.verifyOTP.bind(authController));
entrepreneur.post("/signin", authController.signIn.bind(authController));
entrepreneur.post("/googleAuth", authController.googleSignIn.bind(authController));
entrepreneur.post("/entrepreneur-role", authController.setEntrepreneurRole.bind(authController));

export default entrepreneur;