import "reflect-metadata";
import { container } from "tsyringe";
import UserModel from "../models/userModel";
import UserRepository from "../repositories/entrepreneur/userRepository";
import AuthService from "../services/entrepreneur/authService";
import AuthController from "../controllers/entrepreneur/authController";



container.register("UserModel", { useValue: UserModel });
container.register("UserRepository", { useClass: UserRepository });
container.register("AuthService", { useClass: AuthService });
container.register("AuthController", { useClass: AuthController });

export default container;
