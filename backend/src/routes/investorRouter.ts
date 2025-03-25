import express from 'express';
import AuthController from '../controllers/entrepreneur/authController';
import AuthService from '../services/entrepreneur/authService';
import { container } from 'tsyringe';
// import UserRepository from '../repositories/entrepreneur/userRepository';
import multer from "multer"
const upload = multer();

const authServiceeee = container.resolve(AuthService);
const authController = new AuthController(authServiceeee)

const investor = express.Router();

investor.post('/send-otp', upload.none(), authController.register);
investor.post('/verify-otp', authController.verifyOTP); 
investor.post('/complete-profile', authController.completeProfile); 

export default investor;
 