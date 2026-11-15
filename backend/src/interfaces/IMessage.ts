import { Types } from "mongoose";

export type ChatMessageType =
  | "text"
  | "image"
  | "video"
  | "file"
  | "sticker"
  | "post";

export interface ChatMessagePayload {
  text?: string;
  type?: ChatMessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  postId?: string;
  postContent?: string;
  postMedia?: string;
  postAuthorName?: string;
}

export interface NormalizedChatMessagePayload {
  text: string;
  type: ChatMessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  postId?: string;
  postContent?: string;
  postMedia?: string;
  postAuthorName?: string;
}

export interface IMessage {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  text: string;
  type?: ChatMessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  postId?: string;
  postContent?: string;
  postMedia?: string;
  postAuthorName?: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
