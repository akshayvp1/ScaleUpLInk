import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { IUser } from "../../interfaces/IUser";
import IAuthService from "../../services/entrepreneur/interface/IAuthService";
import redisClient from "../../config/redisConfig";
import { sendOTPEmail } from "../../utils/emailService";
import { inject, injectable } from "tsyringe";
import UserRepository from "../../repositories/entrepreneur/userRepository";
import { generateTokens,ITokenPayload } from "../../utils/jwt";
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
  
      const { accessToken, refreshToken } = generateTokens(payload);
  
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
    

        const { accessToken, refreshToken } = generateTokens(payload);

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

  async completeProfile(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
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

        // Generate tokens
        const jwtPayload: ITokenPayload = {
            id: createdUser._id!.toString(),
            email: createdUser.email,
            role: createdUser.role,
        };

        const { accessToken, refreshToken } = generateTokens(jwtPayload);

        if (googleData) {
            await redisClient.del(`google:${userData.email}`);
        }

        return { user: createdUser, accessToken, refreshToken };

    } catch (error) {
        console.error("Complete Profile Error:", error);
        throw new Error(`Failed to complete profile: ${(error as Error).message}`);
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

      const { accessToken, refreshToken } = generateTokens(jwtPayload);

      if (googleData) {
          await redisClient.del(`google:${userData.email}`);
      }

      return { user: createdUser, accessToken, refreshToken };

  } catch (error) {
      console.error("Complete Profile Error:", error);
      throw new Error(`Failed to complete profile: ${(error as Error).message}`);
  }
}


}

export default AuthService;
