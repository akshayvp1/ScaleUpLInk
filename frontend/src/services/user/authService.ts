import { api } from "../../utils/axiosInterceptor";
import { store } from "../../redux/app/store";
import { signIn, signOut } from "../../redux/features/auth/authSlice";
import { setTempUser } from "../../redux/features/auth/tempSlice";
import { IUser, UserRole } from "../../types/auth/auth.types";
import axios from "axios";

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  companyFounded?: string;
  businessRegNumber?: string;
  contactNumber?: string;
  role: "entrepreneur" | "investor";
}
interface InterestData {
  email?: string;
  profession?: string;
  interest: string[];
}
interface updateData {
  name: string | null;
  contactNumber?: string;
  profileImage?: string;
  bio?: string;
  email?: string;
}

interface IAuthServiceEntrepreneur {
  sendOtp(credentials: RegisterCredentials, role: "entrepreneur" | "investor"): Promise<MockSignUpResult>;
  verifyOtpSignUp(email: string, otp: string, role: "entrepreneur" | "investor"): Promise<void>;
  signIn(credentials: { email: string; password: string }): Promise<SignInResult>;
  signOut(role: "entrepreneur" | "investor"): Promise<void>;
  resendOtp(email: string, role: "entrepreneur" | "investor"): Promise<MockSignUpResult>;
  verifyGoogleToken(credential: string): Promise<GoogleSignInResult>;
  completeProfile(userData: Partial<IUser>): Promise<void>;
  entrepeneruRole(userData: Partial<IUser>): Promise<void>;
  addInterests(data: InterestData): Promise<void>;
  updateDetail(data: updateData): Promise<void>;
  getUserById(userId: string): Promise<IUser | null>;
}

type SignInResult = { user: IUser; accessToken: string };
type MockSignUpResult = { status: number; message: string };
type GoogleSignInResult = {
  partialUser: boolean;
  user?: IUser;
  accessToken?: string;
};

class AuthServiceEntrepreneur implements IAuthServiceEntrepreneur {
  async sendOtp(credentials: RegisterCredentials, role: "entrepreneur" | "investor"): Promise<MockSignUpResult> {
    try {
      const response = await api[role].post("/send-otp", credentials);
      store.dispatch(
        setTempUser({
          tempUser: { email: credentials.email, role: role as UserRole },
        })
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to send OTP");
      }
      throw new Error("An unknown error occurred while sending OTP");
    }
  }

  async resendOtp(email: string, role: "entrepreneur" | "investor"): Promise<MockSignUpResult> {
    try {
      const response = await api[role].post("/resend-otp", { email });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to send OTP");
      }
      throw new Error("An unknown error occurred while sending OTP");
    }
  }

  async verifyOtpSignUp(email: string, otp: string, role: "entrepreneur" | "investor"): Promise<void> {
    try {
      await api[role].post("/verify-otp", { email, otp });
      store.dispatch(
        setTempUser({
          tempUser: { email, role: role as UserRole },
        })
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Invalid OTP");
      }
      throw new Error("An unknown error occurred during OTP verification");
    }
  }

  async signIn(
    credentials: { email: string; password: string }
  ): Promise<SignInResult> {
    try {
      const response = await api.shared.post<{
        accessToken: string;
        user: IUser;
      }>("/signin", credentials);
      const { accessToken, user } = response.data;

      if (!accessToken || !user?.role) {
        throw new Error("Invalid sign-in response");
      }

      store.dispatch(
        signIn({
          email: user.email,
          role: user.role,
          token: accessToken,
          user,
        })
      );
      store.dispatch(setTempUser({ tempUser: user }));

      return { user, accessToken };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Login failed");
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.shared.post("/auth/signout");
      store.dispatch(signOut());
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  // ─── FIX: `user` now passed into both signIn dispatches ─────────────────
  
async verifyGoogleToken(credential: string): Promise<GoogleSignInResult> {
  try {
    const response = await api.shared.post("/googleAuth", { credential });

    const { user, accessToken, partialUser } = response.data;

    if (!user?.email) {
      throw new Error("Google authentication response does not contain a valid user.");
    }

    // New Google user: complete registration/profile first
    if (partialUser) {
      store.dispatch(setTempUser({ tempUser: user }));

      return {
        partialUser: true,
        user,
      };
    }

    // Existing Google user
    if (!accessToken || !user.role) {
      throw new Error("Google authentication response is missing user role or access token.");
    }

    store.dispatch(
      signIn({
        email: user.email,
        role: user.role,
        token: accessToken,
        isAuthenticated: true,
        user,
      })
    );

    store.dispatch(setTempUser({ tempUser: user }));

    return {
      partialUser: false,
      user,
      accessToken,
    };

  } catch (error) {
    console.error("Google Authentication Error:", error);

    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Google authentication failed"
      );
    }

    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred during Google authentication");
  }
}


  async completeProfile(userData: Partial<IUser>): Promise<void> {
    try {
      const response = await api.investor.post<{
        accessToken: string;
        user: IUser;
      }>("/complete-profile", { userData });
      const { user, accessToken } = response.data;

      if (!accessToken || !user?.role) {
        throw new Error("Invalid profile completion response");
      }

      store.dispatch(
        signIn({
          email: user.email,
          role: user.role,
          token: accessToken,
          user,
        })
      );
      store.dispatch(setTempUser({ tempUser: user }));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to complete profile"
        );
      }
      throw error;
    }
  }

  async entrepeneruRole(userData: Partial<IUser>): Promise<void> {
    try {
      const response = await api.entrepreneur.post<{
        accessToken: string;
        user: IUser;
      }>("/entrepreneur-role", { userData });
      const { user, accessToken } = response.data;

      if (!accessToken || !user?.role) {
        throw new Error("Invalid role selection response");
      }

      store.dispatch(
        signIn({
          email: user.email,
          role: user.role,
          token: accessToken,
          user,
        })
      );
      store.dispatch(setTempUser({ tempUser: user }));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to assign role"
        );
      }
      throw error;
    }
  }

  async addInterests(data: InterestData): Promise<void> {
    try {
      const response = await api.shared.patch("/addInterests", data);
      if (response.data.user) {
        store.dispatch(setTempUser({ tempUser: response.data.user }));
      }
    } catch (error) {
      console.error("Error adding interests:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to add interests");
      }
      throw new Error("An unknown error occurred while adding interests");
    }
  }

  async updateDetail(data: updateData): Promise<void> {
    try {
      const response = await api.shared.patch("/update-data", data);
      if (response.data.user) {
        store.dispatch(setTempUser({ tempUser: response.data.user }));
      }
    } catch (error) {
      console.error("Error updating detail:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to update detail");
      }
      throw new Error("An unknown error occurred while updating detail");
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      localStorage.setItem("email", email);
      await api.shared.post("/forgot-password", { email });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to send reset OTP");
      }
      throw new Error("An unknown error occurred while sending reset OTP");
    }
  }

  async verifyforgotOtp(
    email: string,
    otp: string
  ): Promise<{ success: boolean; message: string; resetToken: string }> {
    try {
      const response = await api.shared.post<{
        success: boolean;
        message: string;
        resetToken: string;
      }>("/forgot-password-otp", { email, otp });
      return response.data;
    } catch (error) {
      console.error("Error in verifyforgotOtp:", (error as Error).message);
      throw new Error("Something went wrong while verifying OTP");
    }
  }

  async changePassword(
    email: string,
    newPassword: string,
    resetToken: string
  ): Promise<void> {
    try {
      await api.shared.post("/change-password", {
        email,
        newPassword,
        resetToken,
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to change password");
      }
      throw new Error("An unknown error occurred while changing password");
    }
  }

  async changeOldPassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.shared.post("/change-old-password", { currentPassword, newPassword });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to change password");
      }
      throw new Error("An unknown error occurred while changing password");
    }
  }

  async signOut(role: "entrepreneur" | "investor"): Promise<void> {
    try {
      await api[role].post("/logout");
      store.dispatch(signOut());
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Logout failed");
      }
      throw new Error("An unknown error occurred during logout");
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const response = await api.shared.get(`/users/${userId}`);
      return response.data.user as IUser;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        throw new Error(error.response?.data?.message || "Failed to fetch user");
      }
      throw new Error("An unknown error occurred while fetching user");
    }
  }
}

export default new AuthServiceEntrepreneur();