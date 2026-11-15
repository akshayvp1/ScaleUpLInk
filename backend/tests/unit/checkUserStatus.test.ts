import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { isUserActive } from "../../src/middlewares/checkUserStatus";
import type IAuthService from "../../src/services/entrepreneur/interface/IAuthService";
import type IInvestorService from "../../src/services/investor/interface/IInvestorService";

const createApp = (
  role: "entrepreneur" | "investor" | "admin",
  authService: IAuthService,
  investorService: IInvestorService
) => {
  const app = express();

  app.get(
    "/status",
    (req, _res, next) => {
      req.user = {
        id: "507f1f77bcf86cd799439011",
        email: "phase1@example.com",
        role,
      };
      next();
    },
    isUserActive(authService, investorService),
    (_req, res) => {
      res.json({ ok: true });
    }
  );

  return app;
};

describe("isUserActive middleware", () => {
  it("allows an active entrepreneur", async () => {
    const authService = {
      checkActiveStatus: vi.fn().mockResolvedValue(true),
    } as unknown as IAuthService;
    const investorService = {
      checkActiveStatus: vi.fn(),
    } as unknown as IInvestorService;

    const response = await request(
      createApp("entrepreneur", authService, investorService)
    ).get("/status");

    expect(response.status).toBe(200);
    expect(authService.checkActiveStatus).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011"
    );
    expect(investorService.checkActiveStatus).not.toHaveBeenCalled();
  });

  it("blocks an inactive investor", async () => {
    const authService = {
      checkActiveStatus: vi.fn(),
    } as unknown as IAuthService;
    const investorService = {
      checkActiveStatus: vi.fn().mockResolvedValue(false),
    } as unknown as IInvestorService;

    const response = await request(
      createApp("investor", authService, investorService)
    ).get("/status");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: "Your account is blocked" });
    expect(investorService.checkActiveStatus).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011"
    );
    expect(authService.checkActiveStatus).not.toHaveBeenCalled();
  });

  it("does not run account lookups for admins", async () => {
    const authService = {
      checkActiveStatus: vi.fn(),
    } as unknown as IAuthService;
    const investorService = {
      checkActiveStatus: vi.fn(),
    } as unknown as IInvestorService;

    const response = await request(
      createApp("admin", authService, investorService)
    ).get("/status");

    expect(response.status).toBe(200);
    expect(authService.checkActiveStatus).not.toHaveBeenCalled();
    expect(investorService.checkActiveStatus).not.toHaveBeenCalled();
  });
});
