
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
interface InterestData {
  email?: string;
  profession?: string;
  interest: string[];
}
interface updateData{
        name:string|null,
        contactNumber ?: string,
        profileImage ?: string,
        bio ?: string,
        email?:string
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
  addInterests(data: InterestData): Promise<void>
  updateDetail(data:updateData):Promise<void>
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

  // async signIn(credentials: { email: string; password: string }, role: "entrepreneur" | "investor" = "entrepreneur"): Promise<SignInResult> {
  //   try {
  //     const response = await api[role].post("/signin", credentials);
  //     console.log(response, "hhhh");
  //     console.log(response.data.user.email, "fffff");
  //     console.log(response.data.accessToken, "ddddd");
  //     const {accessToken,user}=response.data
  //     store.dispatch(
  //       signIn({
  //         email:user.email,
  //         role:user.role,
  //         token:accessToken
  //       })
  //      )
      
  //      store.dispatch(setTempUser({ tempUser: user }));
  //     return user;
  //   } catch (error: unknown) {
  //     if (axios.isAxiosError(error)) {
  //       throw new Error(error.response?.data?.message || "Login failed");
  //     }
  //     throw new Error("An unknown error occurred during login");
  //   }
  // }
  
  async signIn(credentials: { email: string; password: string }, role: "entrepreneur" | "investor" = "entrepreneur"): Promise<{ user: any; accessToken: string }> {
    try {
      const response = await api[role].post("/signin", credentials);
      const { accessToken, user } = response.data;
      
      store.dispatch(signIn({ email: user.email, role: user.role, token: accessToken }));
      store.dispatch(setTempUser({ tempUser: user }));
      
      return { user, accessToken }; // ✅ Fix: Return both user and token
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || "Login failed");
      }
      throw new Error("An unknown error occurred during login");
    }
}
async logout(): Promise<void> {
  try {
    await api.shared.post('/auth/signout'); // Fixed typo from 'singout' to 'signout'
    store.dispatch(signOut()); // Dispatch Redux action to clear auth state
  } catch (error) {
    console.error('Logout error:', error);
    throw error; // Re-throw error so it can be caught in the component
  }
}


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
    store.dispatch(setTempUser({ tempUser: user }));

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

  async addInterests(data: InterestData): Promise<void> {
    try {
      console.log("Adding interests:", data);
      const response = await api.shared.patch("/addInterests", data);
      console.log(response,"hpppppp")
      // Optionally update the user in the store if the backend returns updated user data
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
  async updateDetail(data:updateData):Promise<void>{
    try{
      const response = await api.shared.patch("/update-data", data);
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
   async forgotPassword(email:string):Promise<void>{
     try{
         const response = await api.shared.post('/forgot-password',{email})
         return response.data
     }catch(error){
      console.log(error)
     }
   }
   async verifyforgotOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    try {
        const response = await api.shared.post<{ success: boolean; message: string }>('/forgot-password-otp', { email, otp });
        return response.data;
    } catch (error) {
        console.error("Error in verifyforgotOtp:", (error as Error).message);
        throw new Error("Something went wrong while verifying OTP");
    }
}

   async changePassword(email:string,newPassword:string):Promise<void>{
    try{
     const response = await api.shared.post('/change-password',{email,newPassword})
     return response.data
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