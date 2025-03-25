import express from 'express';
import entrepreneurRouter from '../routes/entrepreneurRouter';
import sharedRouter from './sharedRouter';
import investorRouter from '../routes/investorRouter'
const router = express.Router();

router.use('/user', entrepreneurRouter);
router.use('/shared', sharedRouter);
router.use('/investor',investorRouter)

export default router;
