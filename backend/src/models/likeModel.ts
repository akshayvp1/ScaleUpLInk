import mongoose, { Schema, Model } from "mongoose";
import { ILike } from "../interfaces/ILike";

const LikeSchema = new Schema<ILike>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// one like per user per post — also makes addLike idempotent
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like: Model<ILike> = mongoose.model<ILike>("Like", LikeSchema);