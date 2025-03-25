// import express from 'express';
// import AuthController from '../controllers/entrepreneur/authController';
// import AuthService from '../services/entrepreneur/authService';
// // import UserRepository from '../repositories/entrepreneur/userRepository';
// import multer from "multer"
// const upload = multer();
// // const  userRepository = new UserRepository()
// const authService = new AuthService()
// const authController = new AuthController(authService)

// const entrepreneur = express.Router();

// entrepreneur.post('/send-otp', upload.none(), authController.register);
// entrepreneur.post('/resend-otp',authController.resendOtp)
// entrepreneur.post('/signin', authController.signIn);
// entrepreneur.post('/verify-otp', authController.verifyOTP); 

// export default entrepreneur;

 

import express from 'express';
import container from "../config/container"
import AuthController from '../controllers/entrepreneur/authController';

const authController = container.resolve(AuthController);


const entrepreneur = express.Router();

entrepreneur.post('/send-otp', authController.register);
entrepreneur.post('/resend-otp', authController.resendOtp);
entrepreneur.post('/signin', authController.signIn);
entrepreneur.post('/verify-otp', authController.verifyOTP);
entrepreneur.post('/googleAuth',authController.googleSignIn)
entrepreneur.post('/entrepreneur-role', authController.setEntrepreneurRole);
export default entrepreneur;
