import "reflect-metadata";
import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import AdminAuthService from "../../src/services/admin/adminAuthService";
import AdminModel from "../../src/models/adminModel";
import type AdminAuthRepository from "../../src/repositories/admin/adminAuthRepository";

// Minimal stand-in for the repository. Returning a real Mongoose document
// (not a plain object) is the whole point: the original bug only appeared
// because the service spread a Mongoose document, which drops every schema
// field, instead of converting it to a plain object first.
const repositoryReturning = (admin: unknown) =>
  ({ findByEmail: async () => admin } as unknown as AdminAuthRepository);

describe("AdminAuthService.signIn", () => {
  it("serializes a mongoose admin document with role/email and without password", async () => {
    const hashedPassword = await bcrypt.hash("secret", 10);
    const adminDoc = new AdminModel({
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    const service = new AdminAuthService(repositoryReturning(adminDoc));
    const result = await service.signIn("admin@example.com", "secret");

    expect(result.isMatch).toBe(true);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();

    // These are the exact fields the frontend needs to allow the admin route.
    expect(result.user).toMatchObject({
      email: "admin@example.com",
      role: "admin",
      isActive: true,
    });
    expect(result.user).not.toHaveProperty("password");
  });

  it("rejects an incorrect password", async () => {
    const hashedPassword = await bcrypt.hash("secret", 10);
    const adminDoc = new AdminModel({
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });

    const service = new AdminAuthService(repositoryReturning(adminDoc));
    const result = await service.signIn("admin@example.com", "wrong-password");

    expect(result.isMatch).toBe(false);
    expect(result.user).toBeUndefined();
    expect(result.accessToken).toBeUndefined();
  });

  it("rejects an unknown admin email", async () => {
    const service = new AdminAuthService(repositoryReturning(null));
    const result = await service.signIn("nobody@example.com", "secret");

    expect(result.isMatch).toBe(false);
    expect(result.message).toBe("User not found.");
  });
});
