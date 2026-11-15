import { Router } from "express";
import { container } from "tsyringe";
import GroupController from "../controllers/chat/groupController";
import { authenticate } from "../middlewares/auth";
import { isUserActive } from "../middlewares/checkUserStatus";
import AuthService from "../services/entrepreneur/authService";
import InvestorService from "../services/investor/investorService";

const groupRouter = Router();
const groupController = container.resolve(GroupController);
const authService = container.resolve(AuthService);
const investorService = container.resolve(InvestorService);
const activeCheck = isUserActive(authService, investorService);

groupRouter.post("/", authenticate, activeCheck, groupController.createGroup);
groupRouter.get("/my-groups", authenticate, activeCheck, groupController.getMyGroups);
groupRouter.get("/:groupId/messages", authenticate, activeCheck, groupController.getGroupMessages);
groupRouter.post("/:groupId/members", authenticate, activeCheck, groupController.addMember);
groupRouter.delete("/:groupId/members", authenticate, activeCheck, groupController.removeMember);

export default groupRouter;