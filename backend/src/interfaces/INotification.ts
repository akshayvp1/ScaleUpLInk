import { Document, Types } from "mongoose";

export type NotificationType =
  | "post_share"
  | "like"
  | "comment"
  | "follow"
  | "connection_request"
  | "connection_accepted"
  | "message";

export interface INotificationData {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;

  type: NotificationType;

  post?: Types.ObjectId;

  connection?: Types.ObjectId;

  group?: Types.ObjectId;

  message: string;

  isRead: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface INotification
  extends Document,
    INotificationData {}