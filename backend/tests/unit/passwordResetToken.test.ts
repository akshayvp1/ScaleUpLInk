import { describe, expect, it } from "vitest";
import {
  generatePasswordResetToken,
  generateToken,
  verifyPasswordResetToken,
} from "../../src/utils/jwt";

describe("password reset token", () => {
  it("round-trips an email through a reset token", async () => {
    const token = generatePasswordResetToken("reset@example.com");

    await expect(verifyPasswordResetToken(token)).resolves.toEqual({
      email: "reset@example.com",
      purpose: "password-reset",
    });
  });

  it("rejects a normal access token", async () => {
    const { accessToken } = generateToken({
      id: "507f1f77bcf86cd799439011",
      email: "phase1@example.com",
      role: "entrepreneur",
    });

    await expect(verifyPasswordResetToken(accessToken)).rejects.toThrow(
      "Invalid or expired password reset token"
    );
  });

  it("rejects an invalid reset token", async () => {
    await expect(verifyPasswordResetToken("not-a-token")).rejects.toThrow(
      "Invalid or expired password reset token"
    );
  });
});
