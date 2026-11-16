import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const loadCors = async () => {
  vi.resetModules();
  return import("../../src/config/cors");
};

const loadCookie = async () => {
  vi.resetModules();
  return import("../../src/utils/refreshCookie");
};

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("production CORS config", () => {
  it("accepts comma-separated origins and normalizes trailing slashes", async () => {
    process.env.NODE_ENV = "production";
    process.env.CLIENT_URL =
      "https://app.example.com/, https://www.example.com";
    delete process.env.FRONTEND_URL;
    delete process.env.CORS_ORIGINS;

    const { isOriginAllowed } = await loadCors();

    expect(isOriginAllowed("https://app.example.com")).toBe(true);
    expect(isOriginAllowed("https://www.example.com")).toBe(true);
    expect(isOriginAllowed("https://evil.example.com")).toBe(false);
  });

  it("supports wildcard subdomains when configured explicitly", async () => {
    process.env.NODE_ENV = "production";
    process.env.CLIENT_URL = "*.onrender.com";
    delete process.env.FRONTEND_URL;
    delete process.env.CORS_ORIGINS;

    const { isOriginAllowed } = await loadCors();

    expect(isOriginAllowed("https://scaleup-frontend.onrender.com")).toBe(true);
    expect(isOriginAllowed("https://onrender.com")).toBe(true);
    expect(isOriginAllowed("https://onrender.com.evil.test")).toBe(false);
  });

  it("rejects requests from origins that are not configured", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.CLIENT_URL;
    delete process.env.FRONTEND_URL;
    delete process.env.CORS_ORIGINS;

    const { isOriginAllowed } = await loadCors();

    expect(isOriginAllowed("https://app.example.com")).toBe(false);
    expect(isOriginAllowed(undefined)).toBe(true);
  });
});

describe("refresh cookie options", () => {
  it("uses cross-site secure cookies in production", async () => {
    process.env.NODE_ENV = "production";

    const { refreshCookieOptions } = await loadCookie();

    expect(refreshCookieOptions()).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
  });

  it("uses lax cookies in development", async () => {
    process.env.NODE_ENV = "development";

    const { refreshCookieOptions } = await loadCookie();

    expect(refreshCookieOptions()).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
  });
});
