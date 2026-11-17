import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { IUser } from "../../interfaces/IUser";
import IAuthService from "../../services/entrepreneur/interface/IAuthService";
import redisClient from "../../config/redisConfig";
import { sendOTPEmail } from "../../utils/emailService";
import { inject, injectable } from "tsyringe";
import UserRepository from "../../repositories/entrepreneur/userRepository";
import {
  generatePasswordResetToken,
  generateToken,
  ITokenPayload,
  verifyPasswordResetToken,
} from "../../utils/jwt";
import { OAuth2Client } from "google-auth-library";
import { googleSignInResult } from "../../services/entrepreneur/interface/IAuthService";
import { sanitizeUser } from "../../utils/sanitizeUser";
import {
  normalizeContactNumber,
  normalizeEmail,
  validateEmailPayload,
  validateLoginPayload,
  validateOtpPayload,
  validateRegistrationPayload,
} from "../../utils/authValidation";
import {
  resolveInterests,
  resolveProfession,
} from "../../utils/onboardingCatalog";

const configuredOtpTtl = Number(process.env.OTP_TTL_SECONDS || 600);
const OTP_TTL_SECONDS =
  Number.isFinite(configuredOtpTtl) && configuredOtpTtl > 0
    ? configuredOtpTtl
    : 600;
const registrationKey = (email: string) => `registration:${email}`;
const passwordResetKey = (email: string) => `password-reset:${email}`;

@injectable()
class AuthService implements IAuthService {
  constructor(@inject("UserRepository") private userRepository: UserRepository) {}

  async register(
    userData: Partial<IUser> & { confirmPassword?: string }
  ): Promise<{ message: string }> {
    const validationError = validateRegistrationPayload(userData);
    if (validationError) throw new Error(validationError);

    const email = normalizeEmail(userData.email);
    const contactNumber = normalizeContactNumber(userData.contactNumber);
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new Error("Email already registered.");

    const existingContact = await this.userRepository.findByContactNumber(
      contactNumber
    );
    if (existingContact && existingContact.email !== email) {
      throw new Error("Mobile number already registered.");
    }

    const {
      confirmPassword: _confirmPassword,
      companyName,
      companyFounded,
      businessRegNumber,
      ...baseData
    } = userData;

    const registrationData: Partial<IUser> = {
      ...baseData,
      name: baseData.name?.trim(),
      email,
      contactNumber,
      investorDetails:
        userData.role === "investor"
          ? {
              companyName: companyName?.trim(),
              companyFounded: Number(companyFounded),
              companyRegistration: Number(businessRegNumber),
            }
          : baseData.investorDetails,
    };

    const password = registrationData.password;
    if (!password) {
      throw new Error("Password is required.");
    }

    const otp = randomInt(100000, 1000000).toString();
    const passwordHash = await bcrypt.hash(password, 10);
    const otpData = {
      otp,
      userData: { ...registrationData, password: passwordHash },
      expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
    };
    const key = registrationKey(email);

    await redisClient.set(key, JSON.stringify(otpData), { EX: OTP_TTL_SECONDS });
    try {
      await sendOTPEmail(email, otp, OTP_TTL_SECONDS);
    } catch (error) {
      await redisClient.del(key);
      throw error;
    }

    return { message: "OTP sent to email. Verify to complete registration." };
  }

  async resendOtp(emailValue: string): Promise<boolean> {
    const validationError = validateEmailPayload(emailValue);
    if (validationError) throw new Error(validationError);

    const email = normalizeEmail(emailValue);
    const key = registrationKey(email);
    const storedData = await redisClient.get(key);
    if (!storedData) throw new Error("OTP expired or invalid. Please register again.");

    const parsedData = JSON.parse(storedData);
    const newOtp = randomInt(100000, 1000000).toString();
    parsedData.otp = newOtp;
    parsedData.expiresAt = Date.now() + OTP_TTL_SECONDS * 1000;

    await redisClient.set(key, JSON.stringify(parsedData), {
      EX: OTP_TTL_SECONDS,
    });
    try {
      await sendOTPEmail(email, newOtp, OTP_TTL_SECONDS);
    } catch (error) {
      await redisClient.del(key);
      throw error;
    }

    return true;
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ isMatch: boolean; message: string; accessToken?: string; refreshToken?: string; user?: IUser }> {
    const validationError = validateLoginPayload(email, password);
    if (validationError) throw new Error(validationError);

    try {
      const normalizedEmail = normalizeEmail(email);
      const user: IUser | null = await this.userRepository.findByEmail(
        normalizedEmail
      );
      const incorrectMessage = "Incorrect email or password.";

      if (!user || !user.password) {
        return { isMatch: false, message: incorrectMessage };
      }
  
      const isMatch: boolean = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { isMatch: false, message: incorrectMessage };
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
        user: sanitizeUser(user) as IUser,
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
      

      if (!payload || !payload.email) {
        throw new Error("Invalid Google credentials.");
      }

      const googleName =
        payload.name ||
        [payload.given_name, payload.family_name].filter(Boolean).join(" ") ||
        payload.email.split("@")[0];

      const user = await this.userRepository.findByEmail(
        normalizeEmail(payload.email)
      );
      const partialUser = false;

      if (user) {
        const payload: ITokenPayload = {
          id: user._id!.toString(),
          email: user.email,
          role: user.role,
        };
    

        const { accessToken, refreshToken } = generateToken(payload);

        return {
          user: sanitizeUser(user) as IUser,
          accessToken,
          refreshToken,
          partialUser,
        };
      }

      const newUser = {
        email: normalizeEmail(payload.email),
        name: googleName,
        profileImage: payload.picture,
      };

      await redisClient.set(`google:${newUser.email}`, JSON.stringify(newUser), { EX: 300 });

      return { user: newUser as IUser, partialUser: true };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw new Error("Failed to authenticate using Google.");
    }
  }

  

  async verifyOTP(emailValue: string, otp: string): Promise<{ user: IUser }> {
    const validationError = validateOtpPayload(emailValue, otp);
    if (validationError) throw new Error(validationError);

    const email = normalizeEmail(emailValue);
    const key = registrationKey(email);

    try {
      const storedData = await redisClient.get(key);
      if (!storedData) throw new Error("OTP not found or expired.");
      const tempData = JSON.parse(storedData);
      if (tempData.otp !== otp || Date.now() > tempData.expiresAt) {
        throw new Error("Invalid or expired OTP.");
      }

      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) throw new Error("Email already registered.");

      const contactNumber = normalizeContactNumber(
        tempData.userData.contactNumber
      );
      if (contactNumber) {
        const existingContact = await this.userRepository.findByContactNumber(
          contactNumber
        );
        if (existingContact && existingContact.email !== email) {
          throw new Error("Mobile number already registered.");
        }
      }

      const passwordHash = tempData.userData.password?.startsWith("$2")
        ? tempData.userData.password
        : await bcrypt.hash(tempData.userData.password, 10);

      const userData: Partial<IUser> = {
        ...tempData.userData,
        password: passwordHash,
        email,
        contactNumber,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newUser = await this.userRepository.createUser(userData as IUser);
      await redisClient.del(key);

      return { user: sanitizeUser(newUser) as IUser };
    } catch (error: any) {
      const expectedMessages = [
        "OTP not found or expired.",
        "Invalid or expired OTP.",
        "Email already registered.",
        "Mobile number already registered.",
      ];
      if (expectedMessages.includes(error?.message)) throw error;
      throw new Error("OTP verification failed. Please request a new OTP.");
    }
  }




async setEntrepreneurRole(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
  try {
      const { userData } = input;
      if (!userData) {
          throw new Error("Invalid input: userData is missing");
      }

      const googleDataString = await redisClient.get(`google:${userData.email}`);
      
      const googleData = googleDataString ? JSON.parse(googleDataString) : null;

      const updatedUserData: Partial<IUser> = {
          ...googleData,   
          ...userData,    
          isBlocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
      };

      if (!updatedUserData.email || !updatedUserData.name) {
          throw new Error("Email and Name are required to complete profile.");
      }

      const createdUser = await this.userRepository.createUser(updatedUserData as IUser);
      if (!createdUser) {
          throw new Error("Failed to create user");
      }

      const jwtPayload: ITokenPayload = {
          id: createdUser._id!.toString(),
          email: createdUser.email,
          role: createdUser.role,
      };

      const { accessToken, refreshToken } = generateToken(jwtPayload);

      if (googleData) {
          await redisClient.del(`google:${userData.email}`);
      }

      return {
        user: sanitizeUser(createdUser) as IUser,
        accessToken,
        refreshToken,
      };

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
  const email = normalizeEmail(user?.email);

  if (!email) {
    throw new Error("Unauthorized");
  }

  const profession = data.profession?.trim();
  if (!profession) {
    throw new Error("Please select a profession.");
  }

  const interests = Array.from(
    new Set((data.interest ?? []).map((item) => item.trim()).filter(Boolean))
  );
  if (interests.length === 0) {
    throw new Error("Please select at least one interest.");
  }
  if (interests.length > 10) {
    throw new Error("Please select no more than 10 interests.");
  }

  const existingUser = await this.userRepository.findUserByEmail(email);
  if (!existingUser) {
    throw new Error("User not found");
  }

  const professionDoc = await resolveProfession(profession);
  const interestDocs = await resolveInterests(interests);

  return await this.userRepository.addInterests(
    email,
    interestDocs.map((item) => item.label),
    professionDoc?.label ?? profession,
    professionDoc?._id,
    interestDocs.map((item) => item._id)
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
  const email = user?.email;
  if (!email) {
    throw new Error("Unauthorized");
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
async otpForgotPassword(emailValue: string): Promise<boolean> {
  const validationError = validateEmailPayload(emailValue);
  if (validationError) throw new Error(validationError);

  const email = normalizeEmail(emailValue);
  try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) return false;

      const newOtp = randomInt(100000, 1000000).toString();
      const key = passwordResetKey(email);
      const parsedData = {
        otp: newOtp,
        expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
      };

      await redisClient.set(key, JSON.stringify(parsedData), {
        EX: OTP_TTL_SECONDS,
      });
      try {
        await sendOTPEmail(email, newOtp, OTP_TTL_SECONDS);
      } catch (error) {
        await redisClient.del(key);
        throw error;
      }

      return true;
  } catch (error) {
      console.error("Error in otpForgotPassword:", error);
      throw error;
  }
}
async verifyForgotOtp(emailValue: string, otp: string): Promise<string | null> {
  const validationError = validateOtpPayload(emailValue, otp);
  if (validationError) throw new Error(validationError);

  const email = normalizeEmail(emailValue);
  const key = passwordResetKey(email);
  try {
      const storedData = await redisClient.get(key);
      if (!storedData) return null;

      const tempData = JSON.parse(storedData);
      if (tempData.otp !== otp || Date.now() > tempData.expiresAt) {
        return null;
      }

      await redisClient.del(key);
      return generatePasswordResetToken(email);
  } catch (error) {
      console.error("Error in verifyForgotOtp:", error);
      return null;
  }
}

async changePassword(
  email: string,
  newPassword: string,
  resetToken: string
): Promise<boolean> {
  try {
      const resetPayload = await verifyPasswordResetToken(resetToken);
      if (resetPayload.email !== email) {
          throw new Error("Invalid password reset token");
      }

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
