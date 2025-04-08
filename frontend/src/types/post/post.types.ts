// import { Types } from 'mongoose';

export interface Comment {
  _id?: string;
  userId: string;
  commentText: string;
  createdAt: Date;
}

export interface Share {
  sharedAt: Date;
  userid: string;
}

export interface Post {
  _id?: string;
  userid: string;
  content: string;
  media?: string[];
  likes: string[];
  comments: Comment[];
  totalShare: number;
  totalLikes: number;
  engagementScore: number;
  postTag?: string[];
  shares: Share[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostState {
  posts: Post[];
  currentPost: Post | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}