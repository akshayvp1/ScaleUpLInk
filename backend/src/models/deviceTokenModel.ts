// models/deviceTokenModel.ts
import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IDeviceToken extends Document {
  user: Types.ObjectId;
  token: string;
  platform: "web" | "android" | "ios";
  createdAt: Date;
  updatedAt: Date;
}

const DeviceTokenSchema = new Schema<IDeviceToken>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // A token can move between users (e.g. shared device, logout/login) so
    // it's the unique key, not (user, token) — upsert always lands on one row.
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ["web", "android", "ios"], required: true }
  },
  { timestamps: true }
);

const DeviceTokenModel = model<IDeviceToken>("DeviceToken", DeviceTokenSchema);
export default DeviceTokenModel;