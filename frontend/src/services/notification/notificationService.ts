
import { api } from "../../utils/axiosInterceptor";

export interface NotificationSender {
  _id: string;
  name: string;
  profileImage?: string;
}

export interface NotificationPost {
  _id: string;
  content?: string;
  media?: string[];
}

export interface AppNotification {
  _id: string;
  recipient: string;

  sender: NotificationSender | string;

  type:
    | "post_share"
    | "like"
    | "comment"
    | "follow"
    | "connection_request"
    | "connection_accepted"
    | "message";

  post?: NotificationPost | string;

  connection?: string;

  group?: string | { _id: string; name?: string };

  message: string;

  isRead: boolean;

  createdAt: string;
}

interface GetNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
}

export type ConnectionStatus =
  | "none"
  | "pending"
  | "accepted"
  | "rejected";

export interface ConnectionStatusResult {
  status: ConnectionStatus;
  connectionId?: string;
  isRequester?: boolean;
}

class NotificationService {
  // ============================================================
  // GET NOTIFICATIONS
  // ============================================================

  async getNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<GetNotificationsResult> {
    try {
      const response = await api.shared.get(
        `/notifications?page=${page}&limit=${limit}`
      );

      return {
        notifications:
          response.data.notifications || [],

        unreadCount:
          response.data.unreadCount || 0,
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: unknown };
      };

      console.error(
        "Error fetching notifications:",
        error
      );

      console.error(
        "Status:",
        err?.response?.status
      );

      console.error(
        "Response body:",
        err?.response?.data
      );

      throw error;
    }
  }

  // ============================================================
  // GET CONNECTION STATUS
  // ============================================================

  async getConnectionStatus(
    userId: string
  ): Promise<ConnectionStatusResult> {
    try {
      const response = await api.shared.get(
        `/connections/status/${encodeURIComponent(userId)}`
      );

      const data = response.data?.data || {};

      let connectionId = data.connectionId;

      if (
        connectionId &&
        typeof connectionId === "object"
      ) {
        connectionId = connectionId._id;
      }

      return {
        status: data.status || "none",
        connectionId,
        isRequester: data.isRequester,
      };
    } catch (error) {
      console.error(
        "Error fetching connection status:",
        error
      );

      throw error;
    }
  }

  // ============================================================
  // MARK AS READ
  // ============================================================

  async markAsRead(
    notificationId: string
  ): Promise<void> {
    try {
      await api.shared.patch(
        `/notifications/${notificationId}/read`
      );
    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error
      );

      throw error;
    }
  }

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  async markAllAsRead(): Promise<void> {
    try {
      await api.shared.post(
        "/notifications/read-all"
      );
    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        error
      );

      throw error;
    }
  }

  // ============================================================
  // REGISTER DEVICE
  // ============================================================

  async registerDevice(
    token: string,
    platform: "web" | "android" | "ios"
  ): Promise<void> {
    try {
      await api.shared.post(
        "/notifications/register-device",
        {
          token,
          platform,
        }
      );
    } catch (error) {
      console.error(
        "Error registering device for push:",
        error
      );

      throw error;
    }
  }

  // ============================================================
  // UNREGISTER DEVICE
  // ============================================================

  async unregisterDevice(
    token: string
  ): Promise<void> {
    try {
      await api.shared.delete(
        `/notifications/unregister-device/${encodeURIComponent(
          token
        )}`
      );
    } catch (error) {
      console.error(
        "Error unregistering device:",
        error
      );
    }
  }
}

export default new NotificationService();
