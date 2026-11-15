import mongoose from 'mongoose';

export interface IStory extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  media: string;
  mediaType?: "image" | "video";
  caption?: string;
  viewers: mongoose.Types.ObjectId[];
  duration: number;
  createdAt: Date;
  expiresAt: Date;
}