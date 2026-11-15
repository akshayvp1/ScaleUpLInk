import { Document, Types } from "mongoose";

export interface IComment extends Document {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  commentText: string;
  createdAt: Date;
}