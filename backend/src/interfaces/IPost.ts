// interfaces/IPost.ts
import { Document, Types } from 'mongoose';

export interface IPostMethods {}

export interface IPostInput {
  caption: string;
  mediaUrl?: string;
  mediaType?: string;
  hashtags?: string[];
}

export interface IPost extends Document {
  _id: Types.ObjectId;
  userid: Types.ObjectId;
  content: string;       // maps to caption
  media?: string[];      // maps to mediaUrl
  mediaType?: string;
  totalShare: number;
  totalLikes: number;
  totalComments: number;
  engagementScore: number;
  postTag?: string[];    // maps to hashtags
  createdAt: Date;
  updatedAt: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
}