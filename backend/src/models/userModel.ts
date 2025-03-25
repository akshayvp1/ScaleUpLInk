import mongoose, { Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser"; 

const UserSchema: Schema = new Schema<IUser>(
  {
    contactNumber: { type: String, sparse: true ,unique:true},
    password: { type: String, required: false },
    email: { type: String, required: true},
    profession: { type: String },
    plan: {
      type: { type: String, enum: ["free", "premium"], default: "free" },
    },
    isBlocked: { type: Boolean, default: false },
    profileImage: { type: String },
    bio: { type: String },
    isPremium: { type: Boolean, default: false },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
    createdAt: { type: Date, default: Date.now },
    name: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ["entrepreneur", "investor"], required:false },
    investorDetails: {
      companyFounded: { type: Number },
      companyName: { type: String },
      companyRegistration: { type: Number },
      investmentHistory: { type: String },
    },
    coverImage: { type: String },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interest" }],
    savedPost: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    age: { type: Number },
  },
  { timestamps: true }
);

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;
