import { describe, expect, it } from "vitest";
import { sanitizeUser } from "../../src/utils/sanitizeUser";

describe("sanitizeUser", () => {
  it("removes a password from a plain object", () => {
    const user = {
      id: "507f1f77bcf86cd799439011",
      email: "phase1@example.com",
      password: "hashed-password",
    };

    expect(sanitizeUser(user)).toEqual({
      id: "507f1f77bcf86cd799439011",
      email: "phase1@example.com",
    });
  });

  it("removes a password from a mongoose-like document", () => {
    const user = {
      toObject: () => ({
        email: "phase1@example.com",
        password: "hashed-password",
        role: "entrepreneur",
      }),
    };

    expect(sanitizeUser(user)).toEqual({
      email: "phase1@example.com",
      role: "entrepreneur",
    });
  });
});
