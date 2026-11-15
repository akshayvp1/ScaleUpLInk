import { beforeEach, describe, expect, it } from "vitest";
import TokenManager from "../../src/utils/taskManager";

describe("TokenManager", () => {
  const tokenManager = new TokenManager();

  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and returns an access token", () => {
    tokenManager.setToken("access-token");

    expect(tokenManager.getAccessToken()).toBe("access-token");
  });

  it("clears the access token", () => {
    tokenManager.setToken("access-token");
    tokenManager.clearToken();

    expect(tokenManager.getAccessToken()).toBeNull();
  });
});
