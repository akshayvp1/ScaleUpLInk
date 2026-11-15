import {
  INotification,
  NotificationType,
} from "../../../interfaces/INotification";

export interface NewNotification {
  recipient: string;

  sender: string;

  type: NotificationType;

  post?: string;

  connection?: string;

  group?: string;

  message: string;
}

export interface INotificationRepository {
  createMany(
    notifications: NewNotification[]
  ): Promise<INotification[]>;

  getForUser(
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
}