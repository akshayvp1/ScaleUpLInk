import { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  contactNumber: string;
  password: string;
  email: string;
  profession?: string;
  plan: {
    type: "free" | "premium";
  };
  isBlocked: boolean;
  profileImage?: string;
  bio?: string;
  isPremium: boolean;
  walletId?: Types.ObjectId;
  createdAt: Date;
  otp:string|null,
  otpExpiresAt:Date|null,
  name: string;
  updatedAt: Date;
  role: "entrepreneur" | "investor";
  investorDetails?: {
    companyFounded?: number;
    companyName?: string;
    companyRegistration?: number;
    investmentHistory?: string;
  };
  coverImage?: string;
  followers: Types.ObjectId[];
  interests: Types.ObjectId[];
  savedPost: Types.ObjectId[];
  following: Types.ObjectId[];
  age?: number;
}
