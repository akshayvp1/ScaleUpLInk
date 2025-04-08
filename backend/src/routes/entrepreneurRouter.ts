
// import express from 'express';
// import container from "../config/container"
// import AuthController from '../controllers/entrepreneur/authController';

// const authController = container.resolve(AuthController);


// const entrepreneur = express.Router();

// entrepreneur.post('/send-otp', authController.register);
// entrepreneur.post('/resend-otp', authController.resendOtp);
// entrepreneur.post('/signin', authController.signIn);
// entrepreneur.post('/verify-otp', authController.verifyOTP);
// entrepreneur.post('/googleAuth',authController.googleSignIn)
// entrepreneur.post('/entrepreneur-role', authController.setEntrepreneurRole);
// export default entrepreneur;




// routes/entrepreneurRouter.ts

import express from "express";
import container from "../config/container";
import AuthController from "../controllers/entrepreneur/authController";

const entrepreneur = express.Router();
const authController = container.resolve(AuthController);

// ================== Entrepreneur Auth Routes ==================
entrepreneur.post("/send-otp", authController.register);
entrepreneur.post("/resend-otp", authController.resendOtp);
entrepreneur.post("/verify-otp", authController.verifyOTP);
entrepreneur.post("/signin", authController.signIn);
entrepreneur.post("/googleAuth", authController.googleSignIn);
entrepreneur.post("/entrepreneur-role", authController.setEntrepreneurRole);

export default entrepreneur;
