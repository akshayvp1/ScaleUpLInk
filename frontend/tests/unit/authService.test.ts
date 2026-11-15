import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sharedPost: vi.fn(),
  investorPost: vi.fn(),
  entrepreneurPost: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock("../../src/utils/axiosInterceptor", () => ({
  api: {
    shared: { post: mocks.sharedPost },
    investor: { post: mocks.investorPost },
    entrepreneur: { post: mocks.entrepreneurPost },
  },
}));

vi.mock("../../src/redux/app/store", () => ({
  store: { dispatch: mocks.dispatch },
}));

import authService from "../../src/services/user/authService";

describe("user auth password reset flow", () => {
  beforeEach(() => {
    mocks.sharedPost.mockReset();
    mocks.investorPost.mockReset();
    mocks.entrepreneurPost.mockReset();
    mocks.dispatch.mockReset();
  });

  it("signs in through the shared endpoint and uses the returned role", async () => {
    mocks.sharedPost.mockResolvedValue({
      data: {
        accessToken: "access-token",
        user: {
          email: "investor@example.com",
          role: "investor",
        },
      },
    });

    const result = await authService.signIn({
      email: "investor@example.com",
      password: "secret",
    });

    expect(mocks.sharedPost).toHaveBeenCalledWith("/signin", {
      email: "investor@example.com",
      password: "secret",
    });
    expect(result.user.role).toBe("investor");
    expect(mocks.dispatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: "auth/signIn",
        payload: expect.objectContaining({
          email: "investor@example.com",
          role: "investor",
          token: "access-token",
        }),
      })
    );
  });

  it("returns the reset token from forgot-password OTP verification", async () => {
    mocks.sharedPost.mockResolvedValue({
      data: {
        success: true,
        message: "OTP verified successfully",
        resetToken: "reset-token",
      },
    });

    await expect(
      authService.verifyforgotOtp("phase1@example.com", "123456")
    ).resolves.toEqual({
      success: true,
      message: "OTP verified successfully",
      resetToken: "reset-token",
    });
    expect(mocks.sharedPost).toHaveBeenCalledWith("/forgot-password-otp", {
      email: "phase1@example.com",
      otp: "123456",
    });
  });

  it("sends the reset token with the new password", async () => {
    mocks.sharedPost.mockResolvedValue({ data: { success: true } });

    await authService.changePassword(
      "phase1@example.com",
      "NewPassword1!",
      "reset-token"
    );

    expect(mocks.sharedPost).toHaveBeenCalledWith("/change-password", {
      email: "phase1@example.com",
      newPassword: "NewPassword1!",
      resetToken: "reset-token",
    });
  });

  it("surfaces change-password failures", async () => {
    mocks.sharedPost.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: "Invalid password reset token" } },
    });

    await expect(
      authService.changePassword(
        "phase1@example.com",
        "NewPassword1!",
        "expired-token"
      )
    ).rejects.toThrow("Invalid password reset token");
  });

  it("surfaces forgot-password failures", async () => {
    mocks.sharedPost.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: "Failed to send OTP" } },
    });

    await expect(
      authService.forgotPassword("phase1@example.com")
    ).rejects.toThrow("Failed to send OTP");
  });

  it("preserves the selected role while sending an OTP", async () => {
    mocks.investorPost.mockResolvedValue({
      data: { status: 200, message: "OTP sent" },
    });

    await authService.sendOtp(
      {
        name: "Test User",
        email: "investor@example.com",
        password: "secret",
        role: "investor",
      },
      "investor"
    );

    expect(mocks.investorPost).toHaveBeenCalledWith("/send-otp", {
      name: "Test User",
      email: "investor@example.com",
      password: "secret",
      role: "investor",
    });
    expect(mocks.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "tempUser/setTempUser",
        payload: {
          tempUser: { email: "investor@example.com", role: "investor" },
        },
      })
    );
  });

  it("surfaces profile-completion failures", async () => {
    mocks.investorPost.mockRejectedValue({
      isAxiosError: true,
      response: { data: { message: "Email and Name are required" } },
    });

    await expect(
      authService.completeProfile({ email: "investor@example.com" })
    ).rejects.toThrow("Email and Name are required");
  });
});
