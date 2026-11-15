import express from 'express';
import multer from "multer";
import container from '../config/container';

import AuthController from '../controllers/entrepreneur/authController';
import InvestorController from '../controllers/investor/investorController';
import AuthService from '../services/entrepreneur/authService';
import InvestorService from '../services/investor/investorService';
import { authenticate } from '../middlewares/auth';
import { isUserActive } from '../middlewares/checkUserStatus';

const investor = express.Router();
const upload = multer();

const authController = container.resolve(AuthController);
const investorController = container.resolve(InvestorController);
const authService = container.resolve(AuthService);
const investorService = container.resolve(InvestorService);
const activeCheck = isUserActive(authService, investorService);

// ================== Investor Auth Routes ==================
investor.post('/send-otp', upload.none(), authController.register.bind(authController));
investor.post('/resend-otp', authController.resendOtp.bind(authController));
investor.post('/signin', authController.signIn.bind(authController));
investor.post('/verify-otp', authController.verifyOTP.bind(authController));

// ================== Investor Profile ==================
investor.post('/complete-profile', investorController.completeProfile.bind(investorController));

// ================== Investor Discovery ==================
investor.get(
  '/discover',
  authenticate,
  activeCheck,
  investorController.listInvestors.bind(investorController)
);
investor.get(
  '/profile/:investorId',
  authenticate,
  activeCheck,
  investorController.getInvestorById.bind(investorController)
);

export default investor;