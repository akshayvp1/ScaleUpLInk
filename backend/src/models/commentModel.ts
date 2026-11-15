import mongoose, { Schema, Model } from "mongoose";
import { IComment } from "../interfaces/IComment";

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commentText: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CommentSchema.index({ postId: 1, createdAt: -1 });

export const Comment: Model<IComment> = mongoose.model<IComment>("Comment", CommentSchema);