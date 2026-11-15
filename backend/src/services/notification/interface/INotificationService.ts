import {
  INotification,
} from "../../../interfaces/INotification";

export interface INotificationService {

  notifyPostShare(
    senderId: string,
    recipientIds: string[],
    postId: string
  ): Promise<void>;

  registerDevice(
    userId: string,
    token: string,
    platform:
      | "web"
      | "android"
      | "ios"
  ): Promise<void>;

  unregisterDevice(
    token: string
  ): Promise<void>;

  getNotifications(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<INotification[]>;

  getUnreadCount(
    userId: string
  ): Promise<number>;

  markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification | null>;

  markAllAsRead(
    userId: string
  ): Promise<void>;

  notifyLike(
    senderId: string,
    recipientId: string,
    postId: string
  ): Promise<void>;

  notifyComment(
    senderId: string,
    recipientId: string,
    postId: string
  ): Promise<void>;

  notifyFollow(
    senderId: string,
    recipientId: string
  ): Promise<void>;

  notifyConnectionRequest(
    senderId: string,
    recipientId: string,
    connectionId: string
  ): Promise<void>;

  notifyConnectionAccepted(
    accepterId: string,
    requesterId: string,
    connectionId: string
  ): Promise<void>;

  notifyMessage(
    senderId: string,
    recipientId: string,
    preview: string,
    groupName?: string,
    groupId?: string
  ): Promise<void>;
}