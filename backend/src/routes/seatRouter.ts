import { Router } from "express";
import { container } from "tsyringe";
import SeatController from "../controllers/seat/seatController";
import { authenticate, authorize } from "../middlewares/auth";
import { isUserActive } from "../middlewares/checkUserStatus";
import AuthService from "../services/entrepreneur/authService";
import InvestorService from "../services/investor/investorService";

const router = Router();
const seatController = container.resolve(SeatController);

const authService = container.resolve(AuthService);
const investorService = container.resolve(InvestorService);
const activeCheck = isUserActive(authService, investorService);

router.get("/:eventId", authenticate, seatController.getSeatsForEvent.bind(seatController));
router.post(
  "/generate",
  authenticate,
  authorize("entrepreneur", "admin"), // adjust to whichever role(s) actually own event creation
  activeCheck,
  seatController.generateSeatsForEvent.bind(seatController)
);
router.post("/hold", authenticate, activeCheck, seatController.holdSeats.bind(seatController));
router.post("/release", authenticate, activeCheck, seatController.releaseSeats.bind(seatController));
router.post("/confirm-booked", authenticate, activeCheck, seatController.confirmSeatsBooked.bind(seatController));

export default router;