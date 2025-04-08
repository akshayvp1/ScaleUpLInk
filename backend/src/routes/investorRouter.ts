// import express from 'express';
// import AuthController from '../controllers/entrepreneur/authController';
// import AuthService from '../services/entrepreneur/authService';
// import { container } from 'tsyringe';
// // import UserRepository from '../repositories/entrepreneur/userRepository';
// import multer from "multer"
// import InvestorService from '../services/investor/investorService';
// import InvestorController from '../controllers/investor/investorController';
// const upload = multer();

// const authService = container.resolve(AuthService);
// const authController = new AuthController(authService)
// const investorService = container.resolve(InvestorService)
// const investorController = new InvestorController(investorService)

// const investor = express.Router();
// investor.post('/send-otp', authController.register);
// investor.post('/resend-otp', authController.resendOtp);
// investor.post('/signin', authController.signIn);
// investor.post('/send-otp', upload.none(), authController.register);
// investor.post('/verify-otp', authController.verifyOTP); 
// investor.post('/complete-profile', investorController.completeProfile); 

// export default investor;
 



// routes/investorRouter.ts

import express from 'express';
import multer from "multer";
import { container } from 'tsyringe';

import AuthController from '../controllers/entrepreneur/authController';
import InvestorController from '../controllers/investor/investorController';

import AuthService from '../services/entrepreneur/authService';
import InvestorService from '../services/investor/investorService';

const investor = express.Router();
const upload = multer();

// Dependency Injection
const authService = container.resolve(AuthService);
const investorService = container.resolve(InvestorService);

const authController = new AuthController(authService);
const investorController = new InvestorController(investorService);

// ================== Investor Auth Routes ==================
investor.post('/send-otp', upload.none(), authController.register);
investor.post('/resend-otp', authController.resendOtp);
investor.post('/signin', authController.signIn);
investor.post('/verify-otp', authController.verifyOTP);

// ================== Investor Profile ==================
investor.post('/complete-profile', investorController.completeProfile);

export default investor;
