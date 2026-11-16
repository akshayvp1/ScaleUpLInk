import type { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const refreshCookieOptions = (maxAge?: number): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  ...(maxAge ? { maxAge } : {}),
});

export const refreshCookieClearOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
});
