

import "reflect-metadata"; 
import { container } from "tsyringe";
import UserModel from "../models/userModel";
import UserRepository from "../repositories/entrepreneur/userRepository";
import AuthService from "../services/entrepreneur/authService";
import AuthController from "../controllers/entrepreneur/authController";
import InvestorService from "../services/investor/investorService";
import InvestorRepository from "../repositories/investor/investorRepository";
import InvestorController from "../controllers/investor/investorController";
import { Post } from "../models/postModel";
import PostRepository from "../repositories/post/postRepository";
import PostService from "../services/post/postService";
import PostController from "../controllers/post/postController";
import StoryModel from "../models/storyModel";
import StoryController from "../controllers/story/storyController";
import StoryRepository from "../repositories/story/storyRepository";
import StoryService from "../services/story/storyService";
import EventService from '../services/event/eventService'
import { EventModel } from "../models/eventModel";
import EventRepository from "../repositories/event/eventRepository";
import EventController from "../controllers/event/eventController";
import AdminModel from "../models/adminModel";
import AdminAuthService from "../services/admin/adminAuthService";
import AdminAuthRepository from "../repositories/admin/adminAuthRepository";
import AdminAuthController from "../controllers/admin/adminAuthController";
import AdminManageService from "../services/admin/adminMangeService";
import AdminManageRepository from "../repositories/admin/adminManageRepository";
import AdminMangeControllers from "../controllers/admin/adminManageController";
import PaymentController from "../controllers/payments/paymentController";
import PaymentService from "../services/payment/paymentService";
import PaymentRepository from "../repositories/payment/PaymentRepository";
import { BookingsModel } from "../models/bookingModel";
// Register models (concrete values)
container.register("UserModel", { useValue: UserModel });
container.register("PostModel", { useValue: Post });
container.register("StoryModel", { useValue: StoryModel });
container.register("EventModel", { useValue: EventModel });
container.register("AdminModel",{useValue:AdminModel})
container.register("BookingsModel",{useValue:BookingsModel})
// Register injectable classes
container.register("UserRepository", UserRepository);
container.register("AuthService", AuthService);
container.register("AuthController", AuthController);
container.register("InvestorService", InvestorService);
container.register("InvestorRepository", InvestorRepository);
container.register("InvestorController", InvestorController);
container.register("PostRepository", PostRepository);
container.register("PostService", PostService);
container.register("PostController", PostController);
container.register("StoryRepository",StoryRepository)
container.register("StoryService",StoryService)
container.register("StoryController",StoryController)
container.register("EventRepository",EventRepository)
container.register("EventService",EventService)
container.register("EventController",EventController)
container.register("AdminAuthRepository",AdminAuthRepository)
container.register("AdminAuthController",AdminAuthController)
container.register("AdminAuthService",AdminAuthService)
container.register("AdminManageRepository",AdminManageRepository)
container.register("AdminManageService",AdminManageService)
container.register("AdminMangeControllers",AdminMangeControllers)
container.register("PaymentController",PaymentController)
container.register("PaymentService",PaymentService)
container.register("PaymentRepository",PaymentRepository)

export default container;