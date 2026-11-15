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
import SeatRepository from "../repositories/seat/seatRepository";
import SeatService from "../services/seat/seatService";
import SeatController from "../controllers/seat/seatController";
import SearchController from "../controllers/search/searchController"
import SearchService from "../services/Search/searchService"
import SearchRespository from "../repositories/search/searchRepository"
import { SeatModel } from "../models/seatModel";

import NotificationModel from "../models/NotificationModel";
import DeviceNotification from "../models/deviceTokenModel";
import NotificationRepository from "../repositories/notification/notificationRepository";
import DeviceTokenRepository from "../repositories/notification/deviceTokenRepository";
import PushService from "../services/notification/pushService";
import NotificationService from "../services/notification/notificationService";
import NotificationController from "../controllers/notification/notificationController";
import LikeRepository from "../repositories/like/likeRepository";
import ShareRepository from "../repositories/share/shareRepository";
import CommentRepository from "../repositories/comment/commentRepository";

import Message from "../models/Message"
import Group from "../models/Group";
import GroupMessage from "../models/GroupMessage";

import ChatRepository from "../repositories/chat/chatRepository";
import GroupRepository from "../repositories/chat/groupRepository";

import ChatService from "../services/chat/chatService";
import GroupService from "../services/chat/groupService";

import ChatController from "../controllers/chat/chatController";
import GroupController from "../controllers/chat/groupController";

import ConnectionController from "../controllers/connection/connectionController";
import ConnectionService from "../services/connection/connectionService";
import ConnectionRepository from "../repositories/connection/connectionRepository";
import ConnectionModel from "../models/connectionModel";

// Register models (concrete values)
container.register("ConnectionModel", {
  useValue: ConnectionModel,
});

container.register("IConnectionRepository", {
  useClass: ConnectionRepository,
});

container.register("ConnectionService", {
  useClass: ConnectionService,
});

container.register("ConnectionController", {
  useClass: ConnectionController,
});

container.register("Group", { useValue: Group });
container.register("GroupMessage", { useValue: GroupMessage });
container.register("Message", { useValue: Message });

// Register models (concrete values)
container.register("UserModel", { useValue: UserModel });
container.register("PostModel", { useValue: Post });
container.register("StoryModel", { useValue: StoryModel });
container.register("EventModel", { useValue: EventModel });
container.register("AdminModel", { useValue: AdminModel })
container.register("BookingsModel", { useValue: BookingsModel })
container.register("SeatModel", { useValue: SeatModel });

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
container.register("StoryRepository", StoryRepository)
container.register("StoryService", StoryService)
container.register("StoryController", StoryController)
container.register("EventRepository", EventRepository)
container.register("EventService", EventService)
container.register("EventController", EventController)
container.register("AdminAuthRepository", AdminAuthRepository)
container.register("AdminAuthController", AdminAuthController)
container.register("AdminAuthService", AdminAuthService)
container.register("AdminManageRepository", AdminManageRepository)
container.register("AdminManageService", AdminManageService)
container.register("AdminMangeControllers", AdminMangeControllers)
container.register("PaymentController", PaymentController)
container.register("PaymentService", PaymentService)
container.register("PaymentRepository", PaymentRepository)

container.register("SeatRepository", SeatRepository);
container.register("SeatService", SeatService);
container.register("SeatController", SeatController);

container.register("SearchController", SearchController)
container.register("SearchService", SearchService)
container.register("SearchRepository", SearchRespository)

// ================== Notifications (in-app + push) ==================
container.register("NotificationModel", { useValue: NotificationModel });
container.register("DeviceTokenModel", { useValue: DeviceNotification });
container.registerSingleton("NotificationRepository", NotificationRepository);
container.registerSingleton("DeviceTokenRepository", DeviceTokenRepository);
container.registerSingleton("PushService", PushService);
container.registerSingleton("NotificationService", NotificationService);
container.registerSingleton("NotificationController", NotificationController);

container.register("LikeRepository", { useClass: LikeRepository });
container.register("CommentRepository", { useClass: CommentRepository });
container.register("ShareRepository", { useClass: ShareRepository });

container.register("ChatController",{useClass:ChatController})
container.register("GroupController", { useClass: GroupController });

container.register("ChatService",{useClass:ChatService})
container.register("GroupService", { useClass: GroupService });

container.register("ChatRepository",{useClass:ChatRepository})
container.register("GroupRepository", { useClass: GroupRepository });

export default container;