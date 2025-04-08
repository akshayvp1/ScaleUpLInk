// import mongoose, { Schema, Document, Types } from 'mongoose';

// export interface IPostMethods {
//     addComment(userId: Types.ObjectId, commentText: string): Promise<IPost>;
//     likePost(userId: Types.ObjectId): Promise<IPost>;
//   }

// // Interface for Post document
// export interface IPost extends Document {
//   _id: Types.ObjectId;
//   userid: Types.ObjectId;
//   content: string;
//   media?: string[];
//   likes: Types.ObjectId[];
//   comments: Array<{
//     _id: Types.ObjectId;
//     userId: Types.ObjectId;
//     commentText: string;
//     createdAt: Date;
//   }>;
//   totalShare: number;
//   totalLikes: number;
//   engagementScore: number;
//   postTag?: string[];
//   shares: Array<{
//     sharedAt: Date;
//     userid: Types.ObjectId;
//   }>;
//   createdAt: Date;
//   updatedAt: Date;
//   engagement: {
//     likes: number;
//     shares: number;
//     comments: number;
//   };
//   addComment(userId: Types.ObjectId, commentText: string): Promise<IPost>;
//   likePost(userId: Types.ObjectId): Promise<IPost>;
// }


// interfaces/IPost.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPostMethods {
    addComment(userId: Types.ObjectId, commentText: string): Promise<IPost>;
    likePost(userId: Types.ObjectId): Promise<IPost>;
}

export interface IPostInput {
  caption: string;
  mediaUrl?: string;
  mediaType?: string;
  hashtags?: string[];
}

export interface IPost extends Document {
    _id: Types.ObjectId;
    userid: Types.ObjectId;
    content: string;  // This will map to caption
    media?: string[]; // This will map to mediaUrl
    mediaType?: string; // Add if you need to store media type
    likes: Types.ObjectId[];
    comments: Array<{
        _id: Types.ObjectId;
        userId: Types.ObjectId;
        commentText: string;
        createdAt: Date;
    }>;
    totalShare: number;
    totalLikes: number;
    engagementScore: number;
    postTag?: string[]; // This will map to hashtags
    shares: Array<{
        sharedAt: Date;
        userid: Types.ObjectId;
    }>;
    createdAt: Date;
    updatedAt: Date;
    engagement: {
        likes: number;
        shares: number;
        comments: number;
    };
    addComment(userId: Types.ObjectId, commentText: string): Promise<IPost>;
    likePost(userId: Types.ObjectId): Promise<IPost>;
}


