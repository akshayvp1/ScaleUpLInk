export interface User {
  _id: string;
  name: string;
  profileImage?: string;
}

export interface Comment {
  _id?: string;
  postId: string;
  userId: string | User;
  commentText: string;
  createdAt: Date;
}

export interface Share {
  sharedBy: User;
  sharedAt: Date;
}

export interface Post {
  _id?: string;
  userid: string | User;
  content: string;
  media?: string[];
  totalShare: number;
  totalLikes: number;
  totalComments: number;
  engagementScore: number;
  postTag?: string[];
  isLiked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostState {
  posts: Post[];
  currentPost: Post | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}