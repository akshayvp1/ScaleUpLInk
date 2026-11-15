import { describe, expect, it } from "vitest";
import {
  generateToken,
  refreshAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../src/utils/jwt";

const payload = {
  id: "507f1f77bcf86cd799439011",
  email: "phase1@example.com",
  role: "entrepreneur" as const,
};

describe("jwt utilities", () => {
  it("generates access and refresh tokens that verify", async () => {
    const tokens = generateToken(payload);

    await expect(verifyAccessToken(tokens.accessToken)).resolves.toMatchObject(payload);
    await expect(verifyRefreshToken(tokens.refreshToken)).resolves.toMatchObject(payload);
  });

  it("refreshes an access token from a refresh token", async () => {
    const tokens = generateToken(payload);
    const accessToken = refreshAccessToken(tokens.refreshToken);

    await expect(verifyAccessToken(accessToken)).resolves.toMatchObject(payload);
  });

  it("rejects an invalid access token", async () => {
    await expect(verifyAccessToken("not-a-token")).rejects.toThrow(
      "Invalid or expired access token"
    );
  });
});
