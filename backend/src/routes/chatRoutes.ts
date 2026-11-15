import { Router } from "express";
import { container } from "tsyringe";
import ChatController from "../controllers/chat/chatController";
import { authenticate } from "../middlewares/auth";
import { isUserActive } from "../middlewares/checkUserStatus";
import AuthService from "../services/entrepreneur/authService";
import InvestorService from "../services/investor/investorService";

const chatRouter = Router();

const chatController =
  container.resolve(ChatController);
const authService = container.resolve(AuthService);
const investorService = container.resolve(InvestorService);
const activeCheck = isUserActive(authService, investorService);

chatRouter.get(
  "/messages/:receiverId",
  authenticate,
  activeCheck,
  chatController.getMessages
);

export default chatRouter;