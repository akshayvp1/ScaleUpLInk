import { Document, Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: "admin" | "entrepreneur" | "investor";
  isActive: boolean;
}