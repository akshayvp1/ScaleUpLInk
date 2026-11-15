import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { authenticate, authorize } from "../../src/middlewares/auth";
import { generateToken } from "../../src/utils/jwt";

const app = express();

app.get("/protected", authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.get("/admin", authenticate, authorize("admin"), (_req, res) => {
  res.json({ ok: true });
});

describe("auth middleware", () => {
  it("rejects a request without an authorization header", async () => {
    const response = await request(app).get("/protected");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "No token provided" });
  });

  it("rejects a malformed authorization header", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Token abc");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "No token provided" });
  });

  it("rejects an invalid token", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid or expired token" });
  });

  it("attaches a verified user to the request", async () => {
    const { accessToken } = generateToken({
      id: "507f1f77bcf86cd799439011",
      email: "phase1@example.com",
      role: "entrepreneur",
    });

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      id: "507f1f77bcf86cd799439011",
      email: "phase1@example.com",
      role: "entrepreneur",
    });
  });

  it("blocks a role that is not authorized", async () => {
    const { accessToken } = generateToken({
      id: "507f1f77bcf86cd799439011",
      email: "phase1@example.com",
      role: "entrepreneur",
    });

    const response = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: "Access denied" });
  });
});
