// import "reflect-metadata";
// import { container } from "tsyringe";
// import UserModel from "../models/userModel";
// import UserRepository from "../repositories/entrepreneur/userRepository";
// import AuthService from "../services/entrepreneur/authService";
// import AuthController from "../controllers/entrepreneur/authController";
// import InvestorService from "../services/investor/investorService";
// import InvestorRepository from "../repositories/investor/investorRepository"
// import InvestorController from "../controllers/investor/investorController"
// import { Post } from "../models/postModel";
// import PostRepository from "../repositories/post/postRepository";
// import PostService from "../services/post/postService";
// import PostController from "../controllers/post/postController";


// container.register("UserModel", { useValue: UserModel });
// container.register("UserRepository", { useClass: UserRepository });
// container.register("AuthService", { useClass: AuthService });
// container.register("AuthController", { useClass: AuthController });
// container.register("InvestorService",{useClass:InvestorService})
// container.register("InvestorRepository",{useClass:InvestorRepository})
// container.register("InvestorController",{useClass:InvestorController})
// container.register("PostModel",{useValue:Post})
// container.register("PostRepository",{useValue:PostRepository})
// container.register("PostService",{useValue:PostService})
// container.register("PostController",{useValue:PostController})

// export default container;

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

// Register models (concrete values)
container.register("UserModel", { useValue: UserModel });
container.register("PostModel", { useValue: Post });
container.register("StoryModel", { useValue: StoryModel });
container.register("EventModel", { useValue: EventModel });


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




export default container;