import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import NotificationService from "../../services/notification/notificationService";
import { ITokenPayload } from "../../utils/jwt";

@injectable()
class NotificationController {
  constructor(
    @inject("NotificationService") private notificationService: NotificationService
  ) {}

  getNotifications = async (req: Request & { user?: ITokenPayload }, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const page = parseInt((req.query.page as string) || "1", 10) || 1;
      const limit = parseInt((req.query.limit as string) || "20", 10) || 20;

      const [notifications, unreadCount] = await Promise.all([
        this.notificationService.getNotifications(userId, page, limit),
        this.notificationService.getUnreadCount(userId)
      ]);

      res.status(200).json({ notifications, unreadCount });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  };

  markAsRead = async (req: Request & { user?: ITokenPayload }, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      const updated = await this.notificationService.markAsRead(notificationId as string, userId);
      res.status(200).json({ notification: updated });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  };

  markAllAsRead = async (req: Request & { user?: ITokenPayload }, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }

      await this.notificationService.markAllAsRead(userId);
      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  };
  // controllers/notification/notificationController.ts (additions)
registerDevice = async (req: Request & { user?: ITokenPayload }, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { token, platform } = req.body;
    if (!userId) { res.status(401).json({ message: "User not authenticated" }); return; }
    if (!token || !platform) { res.status(400).json({ message: "token and platform are required" }); return; }

    await this.notificationService.registerDevice(userId, token, platform);
    res.status(200).json({ message: "Device registered" });
  } catch (error) {
    console.error("Error registering device:", error);
    res.status(500).json({ message: "Failed to register device" });
  }
};

unregisterDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    await this.notificationService.unregisterDevice(token as string);
    res.status(200).json({ message: "Device unregistered" });
  } catch (error) {
    console.error("Error unregistering device:", error);
    res.status(500).json({ message: "Failed to unregister device" });
  }
};
}

export default NotificationController;