
import { api } from "../../utils/axiosInterceptor";
import { RootState, store } from "../../redux/app/store";
import { signIn, signOut } from "../../redux/features/auth/authSlice";
import { setTempUser } from "../../redux/features/auth/tempSlice";
import { IUser } from "../../types/auth/auth.types";
import axios from "axios";
import role from "../../pages/auth/role";

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

interface IAuthServiceEntrepreneur {
  sendOtp(credentials: RegisterCredentials, role: "entrepreneur" | "investor"): Promise<MockSignUpResult>;
  verifyOtpSignUp(email: string, otp: string, role: "entrepreneur" | "investor"): Promise<void>;
  signUp(userData: FormData, role: "entrepreneur" | "investor"): Promise<void>;
  signIn(credentials: { email: string; password: string }, role?: "entrepreneur" | "investor"): Promise<SignInResult>;
  signOut(role: "entrepreneur" | "investor"): Promise<void>;
  resendOtp(email: string, role: "entrepreneur" | "investor"): Promise<MockSignUpResult>;
  verifyGoogleToken(credential: string): Promise<GoogleSignInResult>;
  completeProfile(userData:Partial<IUser>):Promise<void>
  entrepeneruRole(userData:Partial<IUser>):Promise<void>
  addInterests(data: Partial<IUser>): Promise<void>
}

type SignInResult = { user: IUser };
type MockSignUpResult = { status: number; message: string };
type GoogleSignInResult = { partialUser?: boolean; entrepreneur?: any; accessToken?: string } | boolean;

class AuthServiceEntrepreneur implements IAuthServiceEntrepreneur {
  async sendOtp(credentials: RegisterCredentials, role: "entrepreneur" | "investor"): Promise<MockSignUpResult> {
    try {
      console.log(credentials, "kkkkkkkkkkkk");
      const response = await api[role].post("/send-otp", credentials);
      console.log(response, "frontresponse");
      store.dispatch(setTempUser({ tempUser: { email: credentials.email } }));
      
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
  
  // async verifyGoogleToken(credential: string): Promise<GoogleSignInResult> {
  //   try {
  //     console.log("Google Auth Credential:", credential);
  //     const response = await api["shared"].post("/googleAuth", { credential });
  //     const { user, accessToken, partialUser } = response.data;
  //     console.log(user,"ggggggg");
  //     if (partialUser) {
  //       store.dispatch(setTempUser({ tempUser: user }));
  //       console.log("Partial user detected, requiring additional information.");
  //       const userData = store.getState().tempUser;
  //       console.log(userData,'jjjjjjjj');
  //       return { partialUser, accessToken };
  //     }

  //     store.dispatch(
  //       signIn({
          
  //         email: user.email,
  //         role: user.role,
  //         token: accessToken,
  //         isAuthenticated: true,
  //       })
  //     );

  //     return { partialUser: false, accessToken };
  //   } catch (error) {
  //     console.error("Google Authentication Error:", error);
  //     if (axios.isAxiosError(error)) {
  //       throw new Error(error.response?.data?.message || "Google authentication failed");
  //     }
  //     throw new Error("An unknown error occurred during Google authentication");
  //   }
  // }

  async verifyGoogleToken(credential: string): Promise<GoogleSignInResult> {
    try {
      console.log(credential,"kkkkkkkddd")
      const response = await api["shared"].post("/googleAuth", { credential });
      const { user, accessToken, partialUser } = response.data;
      console.log(user,"ggggggg");
      if (partialUser) {
        store.dispatch(setTempUser({ tempUser: user }));
       
    
      store.dispatch(
        signIn({
          
          email: user.email,
          role: user.role,
          token: accessToken,
          isAuthenticated: false,
        })
      );
      return partialUser
    }
    store.dispatch(
      signIn({
        email:user.email,
        role:user.role,
        token:accessToken
      })
    )
    store.dispatch(setTempUser(user))

      return partialUser
    } catch (error) {
      console.error("Google Authentication Error:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Google authentication failed");
      }
      throw new Error("An unknown error occurred during Google authentication");
    }
  }
  async completeProfile(userData:Partial<IUser>):Promise<void>{
     try{
       const response = await api.investor.post("/complete-profile",{userData})

       console.log(response.data,">>>>>")
      //  const {investor,accessToken}=response.data
       console.log(response)
       const {user,accessToken} = response.data

       console.log(user,"///////")

       store.dispatch(
        signIn({
          email:user.email,
          role:user.role,
          token:accessToken
        })
       )
       store.dispatch(setTempUser({ tempUser: user }));
       

       const userD = store.getState().tempUser;
       console.log(userD,"mnnnnnn")

     }catch(error){
      console.log(error)
     }
  }
  async entrepeneruRole(userData:Partial<IUser>):Promise<void>{
    try{
      const response = await api.entrepreneur.post("/entrepreneur-role",{userData})

      console.log(response.data,">>>>>")
     //  const {investor,accessToken}=response.data
      console.log(response)
      const {user,accessToken} = response.data

      console.log(user,"///////")

      store.dispatch(
       signIn({
         email:user.email,
         role:user.role,
         token:accessToken
       })
      )
      store.dispatch(setTempUser({ tempUser: user }));

      const userD = store.getState().tempUser;
      console.log(userD,"0000000")

    }catch(error){
     console.log(error)
    }
  }

  async addInterests(data: Partial<IUser>): Promise<void>{
    try{
     
      await api.shared.patch("/addIntrests",{data})

    }catch(error){
      console.log(error)
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