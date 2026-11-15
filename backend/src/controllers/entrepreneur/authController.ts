




import { NextFunction, Request, Response } from "express";
import AuthService from "../../services/entrepreneur/authService";
import { IAuthController } from "../../controllers/entrepreneur/interface/IAuthController";
import { inject, injectable } from "tsyringe";
import { verifyRefreshToken, refreshAccessToken } from "../../utils/jwt";
import { IUser } from "../../interfaces/IUser";
import ConnectionService from "../../services/connection/connectionService";
import { buildUserView } from "../../utils/userVisibility";

@injectable()
class AuthController implements IAuthController {
  private authService: AuthService;

  constructor(
    @inject("AuthService") authService: AuthService,
    @inject("ConnectionService") private connectionService: ConnectionService
  ) {
    this.authService = authService;
  }

  // Register User (Only Sends OTP)
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.body) {
        throw new Error("Body is empty");
      }
      const response = await this.authService.register(req.body);
      res.status(200).json({ response });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      await this.authService.resendOtp(email);
      res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const user = await this.authService.verifyOTP(email, otp);
      res.status(200).json(user);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  signIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required.",
        });
        return;
      }

      const signInResult = await this.authService.signIn(email, password);

      if (!signInResult.isMatch) {
        res.status(400).json({
          success: false,
          message: signInResult.message || "Incorrect email or password.",
        });
        return;
      }

      const { accessToken, refreshToken, user } = signInResult;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        accessToken,
        user,
        message: "Verification completed.",
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  signOut = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.status(200).json({
        message: "User signed out successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  googleSignIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const { credential } = req.body;

      if (!credential) {
        res.status(400).json({ message: "Google credential is required." });
        return;
      }

      const result = await this.authService.googleSignIn(credential);

      if (!result.partialUser) {
        const { user, accessToken, refreshToken, partialUser } = result;

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ user, accessToken, partialUser });
        return;
      }

      const { user: newUser, partialUser } = result;

      res.status(200).json({ user: newUser, partialUser });
    } catch (error) {
      console.error("Google Sign-In Controller Error:", error);
      res.status(500).json({ message: "Failed to authenticate via Google." });
    }
  };

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token is required" });
        return;
      }

      await verifyRefreshToken(refreshToken);
      const newAccessToken = refreshAccessToken(refreshToken);

      res.status(200).json({
        accessToken: newAccessToken,
        message: "Access token refreshed successfully",
      });
    } catch (error) {
      res.status(403).json({
        message: (error as Error).message || "Invalid or expired refresh token",
      });
    }
  }

  setEntrepreneurRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userData } = req.body as { userData?: Partial<IUser> };
      if (!userData) {
        res.status(400).json({ message: "User data is required." });
        return;
      }
      const result = await this.authService.setEntrepreneurRole({ userData });

      const { user, accessToken, refreshToken } = result;
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        user,
        accessToken,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  addInterests = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;
      if (!data) {
        res.status(400).json({ message: "Invalid input data" });
        return;
      }

      const updatedUser = await this.authService.addInterests(data, req.user);
      res.status(200).json({
        message: "Interests added successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error in addInterests:", error);
      this.handleError(res, error);
    }
  };

  updateData = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;
      if (!data) {
        res.status(400).json({ message: "Invalid input data" });
        return;
      }

      const updatedUser = await this.authService.updateData(data, req.user);
      res.status(200).json({
        message: "Updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error in updateData:", error);
      this.handleError(res, error);
    }
  };

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      const user = await this.authService.getUser(userId as string);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const viewerId = req.user?.id;
      let canViewFullProfile = true;

      if (
        user.role === "investor" &&
        viewerId &&
        viewerId !== (userId as string)
      ) {
        canViewFullProfile = await this.connectionService.areConnected(
          viewerId,
          userId as string
        );
      }

      res.status(200).json({
        user: buildUserView(user, canViewFullProfile),
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "An error occurred while retrieving the user" });
    }
  }

  async currentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const user = await this.authService.getUser(userId as string);
      res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      this.handleError(res, error);
    }
  }

  async otpForgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const response = await this.authService.otpForgotPassword(email);
      res.status(200).json({ success: response });
    } catch (error) {
      console.error("Error in otpForgotPassword:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async verifyForgotOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp }: { email: string; otp: string } = req.body;
      if (!email || !otp) {
        res.status(400).json({ message: "Email and OTP are required" });
        return;
      }

      const resetToken = await this.authService.verifyForgotOtp(email, otp);
      if (!resetToken) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        resetToken,
      });
    } catch (error) {
      console.error("Error in verifyForgotOtp:", (error as Error).message);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, newPassword, resetToken } = req.body;
      if (!email || !newPassword || !resetToken) {
        res.status(400).json({
          message: "Email, new password, and reset token are required",
        });
        return;
      }

      const response = await this.authService.changePassword(
        email,
        newPassword,
        resetToken
      );
      if (!response) {
        res.status(400).json({ message: "Failed to update password" });
        return;
      }

      res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Error in changePassword:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async changeOldPassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const email = req.user?.email;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: "currentPassword and new password are required" });
        return;
      }

      const response = await this.authService.changeOldPassword(email as string,currentPassword, newPassword);
      if (!response) {
        res.status(400).json({ message: "Failed to update password" });
        return;
      }

      res.status(200).json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Error in changePassword:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  private handleError(res: Response, error: unknown): void {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
}

export default AuthController;
