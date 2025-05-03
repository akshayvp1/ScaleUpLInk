import express  from "express";
import { container } from "tsyringe";
import AdminAuthController from "../controllers/admin/adminAuthController";
import AdminMangeControllers from "../controllers/admin/adminManageController"
import AuthController from "../controllers/entrepreneur/authController";
import { adminAuthenticate } from "../middlewares/adminAuth";

const admin = express.Router()
const adminAuthController = container.resolve(AdminAuthController)
const adminManageController = container.resolve(AdminMangeControllers)
const authController = container.resolve(AuthController)

admin.post('/signin',adminAuthController.signIn)
admin.post("/auth/signout",adminAuthController.signOut)
admin.get('/get-users',adminAuthenticate,adminManageController.getUsers)
admin.post("/refresh-token", authController.refreshToken.bind(authController));
admin.patch("/block-user/:userId",adminAuthenticate,adminManageController.blockUser)
admin.patch("/unblock-user/:userId",adminAuthenticate,adminManageController.unblockUser)

// Event management routes
admin.get('/events', adminAuthenticate, adminManageController.getAllEvents);
admin.patch('/events/:eventId/approve', adminAuthenticate, adminManageController.approveEvent);
admin.patch('/events/:eventId/unapprove', adminAuthenticate, adminManageController.unapproveEvent);

export default admin