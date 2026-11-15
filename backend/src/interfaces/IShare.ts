import { Document, Types } from "mongoose";

export interface IShare extends Document {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  sharedAt: Date;
}