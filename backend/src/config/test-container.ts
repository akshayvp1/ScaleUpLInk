// test-container.ts
import "reflect-metadata";
import { container } from "tsyringe";
import "./config/container";
import UserRepository from "../repositories/entrepreneur/userRepository";
import AuthService from "../services/entrepreneur/authService";

console.log("Container test:");
try {
  const repo = container.resolve("UserRepository");
  console.log("UserRepository resolved:", repo instanceof UserRepository);

  const service = container.resolve(AuthService);
  console.log("AuthService resolved:", service instanceof AuthService);
} catch (error) {
  console.error("Container resolution error:", error);
}  