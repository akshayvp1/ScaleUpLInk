
import { api } from "../../utils/axiosInterceptor";
import { store } from "../../redux/app/store";
import { signIn, signOut } from "../../redux/features/auth/authSlice";
import { setTempUser } from "../../redux/features/auth/tempSlice";
import { IUser } from "../../types/auth/auth.types";
import axios from "axios";

interface IAuthServiceEntrepreneur {
  sendOtp(credentials: FormData, role: "entrepreneur" | "investor"): Promise<MockSignUpResult>;
  verifyOtpSignUp(email: string, otp: string, role: "entrepreneur" | "investor"): Promise<void>;
  signUp(userData: FormData, role: "entrepreneur" | "investor"): Promise<void>;
  signIn(credentials: { email: string; password: string }, role?: "entrepreneur" | "investor"): Promise<SignInResult>;
  signOut(role: "entrepreneur" | "investor"): Promise<void>;
  resendOtp(email: string, role: "entrepreneur" | "investor"): Promise<MockSignUpResult>;
  verifyGoogleToken(credential: string): Promise<GoogleSignInResult>;
}

type SignInResult = { user: IUser };
type MockSignUpResult = { status: number; message: string };
type GoogleSignInResult = { partialUser?: boolean; entrepreneur?: any; accessToken?: string } | boolean;

class AuthServiceEntrepreneur implements IAuthServiceEntrepreneur {
  async sendOtp(credentials: FormData, role: "entrepreneur" | "investor"): Promise<MockSignUpResult> {
    try {
      const response = await api[role].post(`/send-otp`, credentials);
      console.log(response, "frontresponse");

      store.dispatch(setTempUser({ tempUser: { email: credentials.get("email") as string } }));
      console.log(response.data, "dccccc");
      return response.data;

    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to send OTP");
      }
      throw new Error("An unknown error occurred while sending OTP");
    }
  }
  
  async resendOtp(email: string, role: "entrepreneur" | "investor"): Promise<MockSignUpResult> {
    try {
      console.log(email, "credddd");
      const response = await api[role].post('/resend-otp', { email });
      console.log("daaat", response);
      return response.data;
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Failed to send OTP");
      }
      throw new Error("An unknown error occurred while sending OTP");
    }
  }

  async verifyOtpSignUp(email: string, otp: string, role: "entrepreneur" | "investor"): Promise<void> {
    try {
      await api[role].post("/verify-otp", { email, otp });

      store.dispatch(setTempUser({ tempUser: { email } }));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Invalid OTP");
      }
      throw new Error("An unknown error occurred during OTP verification");
    }
  }

  async signUp(userData: FormData, role: "entrepreneur" | "investor"): Promise<void> {
    try {
      await api[role].post("/register", userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Registration failed");
      }
      throw new Error("An unknown error occurred during registration");
    }
  }

  async signIn(credentials: { email: string; password: string }, role: "entrepreneur" | "investor" = "entrepreneur"): Promise<SignInResult> {
    try {
      const response = await api[role].post("/signin", credentials);
      console.log(response, "hhhh");
      console.log(response.data.data.user.email, "fffff");
      console.log(response.data.data.accessToken, "ddddd");
      store.dispatch(signIn({
        email: response.data.data.user.email,
        role: response.data.data.user.role,
        token: response.data.data.accessToken,
        isAuthenticated: true,
      }));

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Login failed");
      }
      throw new Error("An unknown error occurred during login");
    }
  }
  
  async verifyGoogleToken(credential: string): Promise<GoogleSignInResult> {
    try {
      console.log("Google Auth Credential:", credential);
  
      const response = await api["shared"].post("/googleAuth", { credential });
      const { entrepreneur, accessToken, partialUser } = response.data;
  
      if (partialUser) {
        store.dispatch(setTempUser({ tempUser: entrepreneur }));
  
        console.log("Partial user detected, requiring additional information.");
        return { partialUser, entrepreneur, accessToken };
      }
  
      // Fully authenticated user
      store.dispatch(
        signIn({
          email: entrepreneur.email,
          role: entrepreneur.role,
          token: accessToken,
          isAuthenticated: true,
        })
      );
  
      return { partialUser: false, entrepreneur, accessToken };
  
    } catch (error) {
      console.error("Google Authentication Error:", error);
  
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Google authentication failed");
      }
      throw new Error("An unknown error occurred during Google authentication");
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
}

export default new AuthServiceEntrepreneur();