import express from 'express';
import container from "../config/container"
import AuthController from '../controllers/entrepreneur/authController';
 



const authController = container.resolve(AuthController);

const shared = express.Router();


shared.post('/googleAuth',authController.googleSignIn)
shared.patch('/addIntrests',authController.addInterests)


export default shared;