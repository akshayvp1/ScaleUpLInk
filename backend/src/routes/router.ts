import express from 'express';
import entrepreneurRouter from '../routes/entrepreneurRouter';
import sharedRouter from './sharedRouter';
import investorRouter from '../routes/investorRouter'
import adminRouter from '../routes/adminRouter'
import seatRouter from '../routes/seatRouter'
import chatRouter from "./chatRoutes";
import groupRouter from "./groupRouter";
const router = express.Router();

router.use('/user', entrepreneurRouter);
router.use('/shared', sharedRouter);
router.use('/investor',investorRouter)
router.use('/admin',adminRouter)
router.use('/seats',seatRouter)
router.use("/chat", chatRouter);
router.use("/group", groupRouter);


export default router;
