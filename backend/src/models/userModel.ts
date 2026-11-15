import mongoose, { Schema, model } from "mongoose";
import { IUser } from "../interfaces/IUser";

const UserSchema: Schema = new Schema<IUser>(
  {
    contactNumber: { type: String, sparse: true, unique: true },
    password: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    profession: { type: String },
    plan: {
      type: { type: String, enum: ["free", "premium"], default: "free" },
    },
    isActive: { type: Boolean, default: true },
    profileImage: { type: String },
    bio: { type: String },
    isPremium: { type: Boolean, default: false },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    createdAt: { type: Date, default: Date.now },
    name: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ["entrepreneur", "investor", "admin"], required: false },
    investorDetails: {
      companyFounded: { type: Number },
      companyName: { type: String },
      companyRegistration: { type: Number },
    },
    coverImage: { type: String },
    // followers / following removed — connections now live in their own
    // "Connection" collection (requester, recipient, status). Use
    // ConnectionService.areConnected(userA, userB) / getConnections(userId)
    // instead of reading arrays off the user doc.
    interests: [{ type: String }],
    savedPost: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    age: { type: Number },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, isActive: 1 });

const UserModel = model<IUser>("User", UserSchema);

export default UserModel;