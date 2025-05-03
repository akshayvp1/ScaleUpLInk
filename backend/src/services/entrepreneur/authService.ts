import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { IUser } from "../../interfaces/IUser";
import IAuthService from "../../services/entrepreneur/interface/IAuthService";
import redisClient from "../../config/redisConfig";
import { sendOTPEmail } from "../../utils/emailService";
import { inject, injectable } from "tsyringe";
import UserRepository from "../../repositories/entrepreneur/userRepository";
import { generateToken,ITokenPayload } from "../../utils/jwt";
import { OAuth2Client } from "google-auth-library";
import { googleSignInResult } from "../../services/entrepreneur/interface/IAuthService";


@injectable()
class AuthService implements IAuthService {
  constructor(@inject("UserRepository") private userRepository: UserRepository) {}

  async register(userData: Partial<IUser>): Promise<{ message: string }> {
    const existingUser = await this.userRepository.findByEmail(userData.email!);
    if (existingUser) throw new Error("Email already registered.");
    if (userData.role === "investor" && !userData.contactNumber) {
      throw new Error("Investors must provide a mobile number.");
    }

    const otp = randomInt(100000, 999999).toString();
    console.log(otp,"otp")
    const otpData = {
      otp,
      userData: { ...userData },
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    await redisClient.set(userData.email!, JSON.stringify(otpData), { EX: 600 });
    await sendOTPEmail(userData.email!, otp);
    return { message: "OTP sent to email. Verify to complete registration." };
  }

  async resendOtp(email: string): Promise<boolean> {
    try {
      const userData = await redisClient.get(email);
      if (!userData) throw new Error("OTP expired or invalid");

      const parsedData = JSON.parse(userData);
      const newOtp = randomInt(100000, 999999).toString();
      console.log(newOtp,"NewOtp")
      parsedData.otp = newOtp;

      await redisClient.set(email, JSON.stringify(parsedData), { EX: 300 });
      await sendOTPEmail(email, newOtp);

      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ isMatch: boolean; message: string; accessToken?: string; refreshToken?: string; user?: IUser }> {
    try {
      const user: IUser | null = await this.userRepository.findByEmail(email);
      if (!user) {
        return { isMatch: false, message: "User not found." };
      }
  
      const isMatch: boolean = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { isMatch: false, message: "Incorrect password." };
      }
  
      const payload: ITokenPayload = {
        id: user._id!.toString(),
        email: user.email,
        role: user.role,
      };
  
      const { accessToken, refreshToken } = generateToken(payload);
  
      return {
        isMatch: true,
        message: "Verification complete",
        accessToken,
        refreshToken, 
        user,
      };
    } catch (error) {
      throw new Error(`Failed to verify user: ${(error as Error).message}`);
    }
  }

  async googleSignIn(credential: string): Promise<googleSignInResult> {
    try {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      

      if (!payload || !payload.email || !payload.given_name || !payload.family_name) {
        throw new Error("Invalid Google credentials.");
      }

      const user = await this.userRepository.findByEmail(payload.email);
      const partialUser = false;

      if (user) {
        const payload: ITokenPayload = {
          id: user._id!.toString(),
          email: user.email,
          role: user.role,
        };
    

        const { accessToken, refreshToken } = generateToken(payload);

        return { user, accessToken, refreshToken, partialUser };
      }

      const newUser = {
        email: payload.email,
        name: payload.given_name,
        profileImage: payload.picture,
      };
      console.log(newUser)

      await redisClient.set(`google:${newUser.email}`, JSON.stringify(newUser), { EX: 300 });

      return { user: newUser as IUser, partialUser: true };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw new Error("Failed to authenticate using Google.");
    }
  }

  

  async verifyOTP(email: string, otp: string): Promise<{ user: IUser }> {
    try {
      const storedData = await redisClient.get(email);
      if (!storedData) throw new Error("OTP not found or expired.");
         console.log(storedData,"dddddddjjjjjj")
      const tempData = JSON.parse(storedData);
      if (tempData.otp !== otp || Date.now() > tempData.expiresAt) {
        throw new Error("Invalid or expired OTP.");
      }

      tempData.userData.password = await bcrypt.hash(tempData.userData.password, 10);
      const userData: Partial<IUser> = {
        ...tempData.userData,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newUser = await this.userRepository.createUser(userData as IUser);
      await redisClient.del(email);

      return { user: newUser };
    } catch (error: any) {
      throw new Error("OTP verification failed.");
    }
  }




async setEntrepreneurRole(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
  try {
      const { userData } = input;
      if (!userData) {
          throw new Error("Invalid input: userData is missing");
      }

      console.log("Received User Data:", userData);

      const googleDataString = await redisClient.get(`google:${userData.email}`);
      
      const googleData = googleDataString ? JSON.parse(googleDataString) : null;

      console.log("Google Data:", googleData);
      const updatedUserData: Partial<IUser> = {
          ...googleData,   
          ...userData,    
          isBlocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
      };

      console.log("Updated User Data:", updatedUserData);

      if (!updatedUserData.email || !updatedUserData.name) {
          console.error("Validation Error: Missing required fields", updatedUserData);
          throw new Error("Email and Name are required to complete profile.");
      }

      const createdUser = await this.userRepository.createUser(updatedUserData as IUser);
      if (!createdUser) {
          throw new Error("Failed to create user");
      }

      console.log("Created User:", createdUser);

      const jwtPayload: ITokenPayload = {
          id: createdUser._id!.toString(),
          email: createdUser.email,
          role: createdUser.role,
      };

      const { accessToken, refreshToken } = generateToken(jwtPayload);

      if (googleData) {
          await redisClient.del(`google:${userData.email}`);
      }

      return { user: createdUser, accessToken, refreshToken };

  } catch (error) {
      console.error("Complete Profile Error:", error);
      throw new Error(`Failed to complete profile: ${(error as Error).message}`);
  }
}

async checkActiveStatus(id:string):Promise<boolean>{
  try{
    const user = await this.userRepository.findUserById(id)
    if(!user){
      throw new Error("error")
    }
    return user.isActive
  }catch(error){
    throw error
  }
}
async addInterests(
  data: {
    email?: string;
    profession?: string;
    interest?: string[];
  },
  user?: ITokenPayload
): Promise<IUser | null> {
  console.log("i amd addinterest service")

  const email = data.email || user?.email;

  if (!email) {
    throw new Error('Email is required');
  }

  const interests = data.interest?.filter(
    interest => interest && interest.trim() !== ''
  );


  const existingUser = await this.userRepository.findUserByEmail(email);
  if (!existingUser) {
    throw new Error('User not found');
  }

  // Add interests
  return await this.userRepository.addInterests(
    email, 
    interests || [], 
    data.profession
  );
}
async updateData(
  data: {
    name?: string;
    contactNumber?: string;
    profileImage?: string;
    bio?: string;
    email?: string;
  },
  user?: ITokenPayload
): Promise<IUser | null> {
  console.log("Updating user data in service");

  const email = data.email || user?.email;
  if (!email) {
    throw new Error("Email is required");
  }

  const existingUser = await this.userRepository.findUserByEmail(email);
  if (!existingUser) {
    throw new Error("User not found");
  }

  return await this.userRepository.updateData({ ...data, email });
}
async getUserById(id: string): Promise<IUser | null> {
  return await this.userRepository.findUserById(id);
}
async getUser(userId: string): Promise<IUser | null> {
  try {
    return await this.userRepository.findUserById(userId);
  } catch (error) {
    console.error("Error fetching user:", error);
    return null; 
  }
}
async otpForgotPassword(email: string): Promise<boolean> {
  try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
          console.log("User not found");
          return false;
      }

      const newOtp = randomInt(100000, 999999).toString();
      console.log(newOtp, "NewOtp");

      const parsedData = { otp: newOtp };

      await redisClient.set(email, JSON.stringify(parsedData), { EX: 300 });
      await sendOTPEmail(email, newOtp); 

      return true;
  } catch (error) {
      console.error("Error in otpForgotPassword:", error);
      return false;
  }
 
}
async verifyForgotOtp(email: string, otp: string): Promise<boolean> {
  try {
      const storedData = await redisClient.get(email);
      if (!storedData) {
          console.error("OTP not found or expired.");
          return false; 
      }

      console.log(storedData, "Stored OTP Data");
      const tempData = JSON.parse(storedData);

      if (tempData.otp !== otp) {
          console.error("Invalid OTP.");
          return false; 
      }

      return true; 
  } catch (error) {
      console.error("Error in verifyForgotOtp:", error);
      return false; 
  }
}

async changePassword(email: string, newPassword: string): Promise<boolean> {
  try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
          throw new Error("User not found");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await this.userRepository.updatePassword(email, hashedPassword);
      
      return !!updatedUser;
  } catch (error) {
      console.error("Error in changePassword:", error);
      return false;
  }
}
async changeOldPassword(email: string, currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    // Step 1: Get the user
    const user = await this.userRepository.findByEmail(email);

    if (!user || !user.password) {
      throw new Error("User not found or password not set.");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log("Incorrect current password.");
      return false;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updated = await this.userRepository.changeOldPassword(email, hashedNewPassword);

    return updated;
  } catch (error) {
    console.error("Error in changePassword:", error);
    return false;
  }
}


}





export default AuthService;
