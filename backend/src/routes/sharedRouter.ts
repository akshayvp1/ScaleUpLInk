
// import express from "express";
// import container from "../config/container";
// import { authenticate } from "../middlewares/auth";
// import AuthController from "../controllers/entrepreneur/authController";
// import PostController from "../controllers/post/postController";
// import AuthService from "../services/entrepreneur/authService";
// import InvestorService from "../services/investor/investorService";
// import { checkUserStatus } from "../controllers/shared/sharedController";
// import StoryController from "../controllers/story/storyController";
// // import StoryService from "../services/story/storyService";

// const authController = container.resolve(AuthController);
// const postController = container.resolve(PostController);
// const storyController = container.resolve(StoryController)

// // ✅ Create instances of services
// const authService = container.resolve(AuthService); 
// const investorService = container.resolve(InvestorService);
// // const storyService = container.resolve(StoryService)

// const shared = express.Router();

// // ✅ Pass the instances, not the class itself
// shared.get("/auth/status", authenticate, checkUserStatus(authService, investorService));

// shared.post("/googleAuth", authController.googleSignIn.bind(authController));

// shared.patch("/addInterests", authenticate, authController.addInterests.bind(authController));

// shared.patch("/update-data", authenticate, authController.updateData.bind(authController));

// shared.post("/add-post", authenticate, postController.addPost.bind(postController));

// shared.get("/posts", authenticate, postController.getPost.bind(postController));

// shared.get("/get-posts", authenticate, postController.getUserPosts.bind(postController));

// shared.get("/users/:userId", authenticate, authController.getUserById.bind(authController));

// shared.post("/posts/:postId/like", authenticate, postController.addLike.bind(postController));

// shared.post("/posts/:postId/comment", authenticate, postController.addComment.bind(postController));

// shared.get("/current-user", authenticate, authController.currentUser.bind(authController));

// shared.post("/followUser", authenticate, postController.followUser.bind(postController));

// shared.post("/refresh-token", authController.refreshToken.bind(authController));

// shared.post("/forgot-password", authController.otpForgotPassword.bind(authController));

// shared.post("/forgot-password-otp", authController.verifyForgotOtp.bind(authController));

// shared.post("/change-password", authController.changePassword.bind(authController));

// shared.post('/stories',authenticate,storyController.createStory.bind(storyController))

// shared.post('/stories/:storyId/viewers',authenticate,storyController.addStoryViewers.bind(storyController))

// shared.get('/stories/:storyId',authenticate,storyController.getStoryById.bind(storyController))

// shared.get('/stories/:userId/users',authenticate,storyController.getUserStories.bind(storyController))

// shared.get('/stories/:currentUserId/followed',authenticate,storyController.getFollowingUserStories.bind(storyController))

// shared.post("/auth/signout", authController.signOut.bind(authController));

// export default shared;





// routes/sharedRouter.ts

import express from "express";
import container from "../config/container";
import { authenticate } from "../middlewares/auth";

import AuthController from "../controllers/entrepreneur/authController";
import PostController from "../controllers/post/postController";
import StoryController from "../controllers/story/storyController";
import { checkUserStatus } from "../controllers/shared/sharedController";

import AuthService from "../services/entrepreneur/authService";
import InvestorService from "../services/investor/investorService";
import EventController from "../controllers/event/eventController";
import AdminAuthService from "../services/admin/adminAuthService";

const shared = express.Router();

// Controllers
const authController = container.resolve(AuthController);
const postController = container.resolve(PostController);
const storyController = container.resolve(StoryController);
const eventController = container.resolve(EventController)

// Services
const authService = container.resolve(AuthService);
const investorService = container.resolve(InvestorService);
const adminAuthService = container.resolve(AdminAuthService)

// ================== Auth Routes ==================
shared.get("/auth/status", authenticate, checkUserStatus(authService, investorService,adminAuthService));
shared.post("/googleAuth", authController.googleSignIn.bind(authController));
shared.post("/refresh-token", authController.refreshToken.bind(authController));
shared.post("/forgot-password", authController.otpForgotPassword.bind(authController));
shared.post("/forgot-password-otp", authController.verifyForgotOtp.bind(authController));
shared.post("/change-password", authController.changePassword.bind(authController));
shared.post("/change-old-password", authenticate,authController.changeOldPassword.bind(authController));
shared.get("/current-user", authenticate, authController.currentUser.bind(authController));
shared.post("/auth/signout", authController.signOut.bind(authController));
shared.get("/users/:userId", authenticate, authController.getUserById.bind(authController));
shared.patch("/addInterests", authenticate, authController.addInterests.bind(authController));
shared.patch("/update-data", authenticate, authController.updateData.bind(authController));

// ================== Post Routes ==================
shared.post("/add-post", authenticate, postController.addPost.bind(postController));
shared.get("/posts", authenticate, postController.getPost.bind(postController));
shared.get("/get-posts", authenticate, postController.getUserPosts.bind(postController));
shared.post("/posts/:postId/like", authenticate, postController.addLike.bind(postController));
shared.post("/posts/:postId/comment", authenticate, postController.addComment.bind(postController));
shared.post("/followUser", authenticate, postController.followUser.bind(postController));
shared.post("/posts/:postId/unlike", authenticate, postController.unLike.bind(postController));
shared.post("/unfollowUser", authenticate, postController.unFollowUser.bind(postController));


// ================== Story Routes ==================
shared.post("/stories", authenticate, storyController.createStory.bind(storyController));
shared.post("/stories/:storyId/viewers", authenticate, storyController.addStoryViewers.bind(storyController));
shared.get("/stories/:storyId", authenticate, storyController.getStoryById.bind(storyController));
shared.get("/stories/:userId/users", authenticate, storyController.getUserStories.bind(storyController));
shared.get("/stories/:currentUserId/followed", authenticate, storyController.getFollowingUserStories.bind(storyController));

//========== Event Routes ===========================
shared.post('/event-creation',authenticate,eventController.createEvent.bind(eventController))
shared.get('/get-events',authenticate,eventController.getAllEvents.bind(eventController))
shared.get('/events/:id',authenticate,eventController.getEventById.bind(eventController))
shared.get('/paid-events',authenticate,eventController.getPaidEvents.bind(eventController))
shared.get('/created-by',authenticate,eventController.createdEvents.bind(eventController))

export default shared;
