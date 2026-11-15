import mongoose, { Schema, Model } from "mongoose";
import { IShare } from "../interfaces/IShare";

const ShareSchema = new Schema<IShare>({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sharedAt: { type: Date, default: Date.now },
});

ShareSchema.index({ postId: 1, sharedAt: -1 });
ShareSchema.index({ userId: 1, sharedAt: -1 });

export const Share: Model<IShare> = mongoose.model<IShare>("Share", ShareSchema);