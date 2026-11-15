import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { adminAuthenticate } from "../../src/middlewares/adminAuth";
import { generateToken } from "../../src/utils/jwt";

const app = express();

app.get("/admin-only", adminAuthenticate, (req, res) => {
  res.json({ user: req.user });
});

const tokenFor = (role: "admin" | "entrepreneur" | "investor") =>
  generateToken({
    id: "507f1f77bcf86cd799439011",
    email: `${role}@example.com`,
    role,
  }).accessToken;

describe("adminAuthenticate middleware", () => {
  it("rejects a request without an authorization header", async () => {
    const response = await request(app).get("/admin-only");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "No token provided" });
  });

  it("rejects a malformed authorization header", async () => {
    const response = await request(app)
      .get("/admin-only")
      .set("Authorization", `Token ${tokenFor("admin")}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "No token provided" });
  });

  it("rejects a non-admin token", async () => {
    const response = await request(app)
      .get("/admin-only")
      .set("Authorization", `Bearer ${tokenFor("entrepreneur")}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: "Access denied: Admins only" });
  });

  it("allows an admin token", async () => {
    const response = await request(app)
      .get("/admin-only")
      .set("Authorization", `Bearer ${tokenFor("admin")}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      id: "507f1f77bcf86cd799439011",
      email: "admin@example.com",
      role: "admin",
    });
  });
});
