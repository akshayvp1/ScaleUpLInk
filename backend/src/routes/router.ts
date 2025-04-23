import express from 'express';
import entrepreneurRouter from '../routes/entrepreneurRouter';
import sharedRouter from './sharedRouter';
import investorRouter from '../routes/investorRouter'
import adminRouter from '../routes/adminRouter'
// import stripeRouter from '../routes/stripeRouter'
const router = express.Router();

router.use('/user', entrepreneurRouter);
router.use('/shared', sharedRouter);
router.use('/investor',investorRouter)
router.use('/admin',adminRouter)
// router.use('/stripe',stripeRouter)

export default router;
