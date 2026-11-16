import { Document, Types } from "mongoose";
import { ChatEventPreview, ChatMessageType } from "./IMessage";

export interface IGroupMessage extends Document, ChatEventPreview {
  groupId: Types.ObjectId;
  senderId: Types.ObjectId;
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
  seenBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
