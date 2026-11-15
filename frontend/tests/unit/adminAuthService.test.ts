import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  post: vi.fn(),
}));

vi.mock("../../src/redux/app/store", () => ({
  store: { dispatch: mocks.dispatch },
}));

vi.mock("../../src/utils/axiosInterceptor", () => ({
  api: { admin: { post: mocks.post } },
}));

import AdminAuthService from "../../src/services/admin/adminAuthService";

describe("AdminAuthService", () => {
  beforeEach(() => {
    mocks.dispatch.mockReset();
    mocks.post.mockReset();
  });

  it("persists the admin access token and user after sign in", async () => {
    mocks.post.mockResolvedValue({
      data: {
        user: {
          _id: "507f1f77bcf86cd799439011",
          email: "admin@example.com",
          role: "admin",
        },
        accessToken: "admin-access-token",
      },
    });

    const result = await AdminAuthService.signIn(
      "admin@example.com",
      "secret"
    );

    expect(mocks.post).toHaveBeenCalledWith("/signin", {
      email: "admin@example.com",
      password: "secret",
    });
    expect(result.accessToken).toBe("admin-access-token");
    expect(mocks.dispatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: "auth/signIn",
        payload: expect.objectContaining({
          email: "admin@example.com",
          role: "admin",
          token: "admin-access-token",
        }),
      })
    );
    expect(mocks.dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ type: "tempUser/setTempUser" })
    );
  });

  it("clears local admin auth state even when logout fails", async () => {
    mocks.post.mockRejectedValue(new Error("network error"));

    await expect(AdminAuthService.logout()).rejects.toThrow("network error");
    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: "auth/signOut" })
    );
  });
});
