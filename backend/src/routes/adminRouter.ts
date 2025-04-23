import express  from "express";
import { container } from "tsyringe";
import AdminAuthController from "../controllers/admin/adminAuthController";
import AdminMangeControllers from "../controllers/admin/adminManageController";
import { authenticate } from "../middlewares/auth";
import AuthController from "../controllers/entrepreneur/authController";

const admin = express.Router()
const adminAuthController = container.resolve(AdminAuthController)
const adminManageController = container.resolve(AdminMangeControllers)
const authController = container.resolve(AuthController)

admin.post('/signin',adminAuthController.signIn)
admin.post("/auth/signout",adminAuthController.signOut)
admin.get('/get-users',authenticate,adminManageController.getUsers)
admin.post("/refresh-token", authController.refreshToken.bind(authController));
admin.patch("/block-user/:userId",authenticate,adminManageController.blockUser)
admin.patch("/unblock-user/:userId",authenticate,adminManageController.unblockUser)

// Event management routes
admin.get('/events', authenticate, adminManageController.getAllEvents);
admin.patch('/events/:eventId/approve', authenticate, adminManageController.approveEvent);
admin.patch('/events/:eventId/unapprove', authenticate, adminManageController.unapproveEvent);

export default admin