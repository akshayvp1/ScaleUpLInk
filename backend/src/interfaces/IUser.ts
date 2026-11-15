
import { Document, Types } from "mongoose";

export interface IUser extends Document {
  contactNumber: string;
  password: string;
  email: string;
  profession?: string;
  _id: Types.ObjectId;

  plan: {
    type: "free" | "premium";
  };

  profileImage?: string;
  bio?: string;
  isPremium: boolean;
  walletId?: Types.ObjectId;
  eventId?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  otp: string | null;
  otpExpiresAt: Date | null;
  name: string;
  updatedAt: Date;
  role: "entrepreneur" | "investor" | "admin";

  companyName?: string;
  companyFounded?: string | number;
  businessRegNumber?: string | number;

  investorDetails?: {
    companyFounded?: number;
    companyName?: string;
    companyRegistration?: number;
  };

  coverImage?: string;
  followers: Types.ObjectId[];
  interests: Types.ObjectId[];
  savedPost: Types.ObjectId[];
  following: Types.ObjectId[];
  age?: number;
}
