import express from "express";
import container from "../config/container";
import { authenticate } from "../middlewares/auth";
import { isUserActive } from "../middlewares/checkUserStatus";

import AuthController from "../controllers/entrepreneur/authController";
import PostController from "../controllers/post/postController";
import StoryController from "../controllers/story/storyController";
import NotificationController from "../controllers/notification/notificationController";
import { checkUserStatus } from "../controllers/shared/sharedController";

import AuthService from "../services/entrepreneur/authService";
import InvestorService from "../services/investor/investorService";
import EventController from "../controllers/event/eventController";
import AdminAuthService from "../services/admin/adminAuthService";
import SearchController from "../controllers/search/searchController";
import ChatController from "../controllers/chat/chatController";
import ConnectionController from "../controllers/connection/connectionController";
const shared = express.Router();

// Controllers
const authController = container.resolve(AuthController);
const postController = container.resolve(PostController);
const storyController = container.resolve(StoryController);
const eventController = container.resolve(EventController);
const searchController = container.resolve(SearchController);
const notificationController = container.resolve(NotificationController);
const connectionController = container.resolve(ConnectionController);
const chatController =
  container.resolve(ChatController);
  // Services
const authService = container.resolve(AuthService);
const investorService = container.resolve(InvestorService);
const adminAuthService = container.resolve(AdminAuthService);

// Active-account gate, built once and reused across routes
const activeCheck = isUserActive(authService, investorService);

// ================== Auth Routes ==================
shared.get(
  "/auth/status",
  authenticate,
  checkUserStatus(authService, investorService, adminAuthService)
);
shared.post("/signin", authController.signIn.bind(authController));
shared.post("/googleAuth", authController.googleSignIn.bind(authController));
shared.post("/refresh-token", authController.refreshToken.bind(authController));
shared.post("/forgot-password", authController.otpForgotPassword.bind(authController));
shared.post("/forgot-password-otp", authController.verifyForgotOtp.bind(authController));
shared.post("/change-password", authController.changePassword.bind(authController));
shared.post(
  "/change-old-password",
  authenticate,
  activeCheck,
  authController.changeOldPassword.bind(authController)
);
shared.get("/current-user", authenticate, authController.currentUser.bind(authController));
shared.post("/auth/signout", authController.signOut.bind(authController));
shared.get(
  "/users/:userId",
  authenticate,
  activeCheck,
  authController.getUserById.bind(authController)
);
shared.patch(
  "/addInterests",
  authenticate,
  activeCheck,
  authController.addInterests.bind(authController)
);
shared.patch(
  "/update-data",
  authenticate,
  activeCheck,
  authController.updateData.bind(authController)
);

// ================== Post Routes ==================
shared.post("/add-post", authenticate, activeCheck, postController.addPost.bind(postController));
shared.get("/posts", authenticate, activeCheck, postController.getPost.bind(postController));
shared.get(
  "/get-posts",
  authenticate,
  activeCheck,
  postController.getUserPosts.bind(postController)
);
shared.post(
  "/posts/:postId/like",
  authenticate,
  activeCheck,
  postController.addLike.bind(postController)
);
shared.post(
  "/posts/:postId/unlike",
  authenticate,
  activeCheck,
  postController.unLike.bind(postController)
);
shared.post(
  "/posts/:postId/comment",
  authenticate,
  activeCheck,
  postController.addComment.bind(postController)
);
shared.get(
  "/posts/:postId/comments",
  authenticate,
  activeCheck,
  postController.getComments.bind(postController)
);
shared.post(
  "/posts/:postId/save",
  authenticate,
  activeCheck,
  postController.savePost.bind(postController)
);
shared.post(
  "/posts/:postId/share",
  authenticate,
  activeCheck,
  postController.sharePost.bind(postController)
);
shared.post(
  "/posts/:postId/share-to-users",
  authenticate,
  activeCheck,
  postController.shareToUsers.bind(postController)
);
shared.delete(
  "/posts/:postId",
  authenticate,
  activeCheck,
  postController.deletePost.bind(postController)
);
// shared.post(
//   "/followUser",
//   authenticate,
//   activeCheck,
//   postController.followUser.bind(postController)
// );
// shared.post(
//   "/unfollowUser",
//   authenticate,
//   activeCheck,
//   postController.unFollowUser.bind(postController)
// );

// ================== Notification Routes ==================
shared.get(
  "/notifications",
  authenticate,
  notificationController.getNotifications.bind(notificationController)
);
shared.patch(
  "/notifications/:notificationId/read",
  authenticate,
  notificationController.markAsRead.bind(notificationController)
);
shared.post(
  "/notifications/read-all",
  authenticate,
  notificationController.markAllAsRead.bind(notificationController)
);

// ================== Story Routes ==================
shared.post(
  "/stories",
  authenticate,
  activeCheck,
  storyController.createStory.bind(storyController)
);
shared.post(
  "/stories/:storyId/viewers",
  authenticate,
  activeCheck,
  storyController.addStoryViewers.bind(storyController)
);
shared.get("/stories/:storyId", authenticate, storyController.getStoryById.bind(storyController));
shared.get(
  "/stories/:userId/users",
  authenticate,
  storyController.getUserStories.bind(storyController)
);
shared.get(
  "/stories/:currentUserId/followed",
  authenticate,
  storyController.getFollowingUserStories.bind(storyController)
);

// ================== Event Routes ==================
shared.post(
  "/event-creation",
  authenticate,
  activeCheck,
  eventController.createEvent.bind(eventController)
);
shared.get("/get-events", authenticate, eventController.getAllEvents.bind(eventController));
shared.get("/events/:id", authenticate, eventController.getEventById.bind(eventController));
shared.get("/paid-events", authenticate, eventController.getPaidEvents.bind(eventController));
shared.get(
  "/created-by",
  authenticate,
  activeCheck,
  eventController.createdEvents.bind(eventController)
);

shared.get("/search", authenticate, searchController.searchUsers.bind(searchController));
shared.get("/posts/user/:userId", authenticate, postController.getPostsByUserId.bind(postController));

// routes/shared.ts (additions)
shared.post(
  "/notifications/register-device",
  authenticate,
  notificationController.registerDevice.bind(notificationController)
);
shared.delete(
  "/notifications/unregister-device/:token",
  authenticate,
  notificationController.unregisterDevice.bind(notificationController)
);
shared.get(
  "/posts/:postId/share-details",
  authenticate,
  activeCheck,
  postController.getShareDetails.bind(postController)
);

shared.get("/users-list", authenticate, activeCheck, chatController.getUsers);



shared.post(
  "/connections/request",
  authenticate,
  activeCheck,
  connectionController.sendRequest.bind(connectionController)
);
 
shared.post(
  "/connections/:connectionId/respond",
  authenticate,
  activeCheck,
  connectionController.respondToRequest.bind(connectionController)
);
 
shared.post(
  "/connections/:connectionId/cancel",
  authenticate,
  activeCheck,
  connectionController.cancelRequest.bind(connectionController)
);
 
shared.delete(
  "/connections/:userId",
  authenticate,
  activeCheck,
  connectionController.removeConnection.bind(connectionController)
);
 
shared.get(
  "/connections/status/:userId",
  authenticate,
  activeCheck,
  connectionController.getStatus.bind(connectionController)
);
 
shared.get(
  "/connections/pending",
  authenticate,
  activeCheck,
  connectionController.getPendingRequests.bind(connectionController)
);
 
shared.get(
  "/connections",
  authenticate,
  activeCheck,
  connectionController.getConnections.bind(connectionController)
);
 
shared.get(
  "/connections/list/:userId",
  authenticate,
  activeCheck,
  connectionController.getConnectionsForUser.bind(connectionController)
);


export default shared;