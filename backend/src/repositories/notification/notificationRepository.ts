import {
  injectable,
  inject,
} from "tsyringe";

import {
  INotification,
} from "../../interfaces/INotification";

import NotificationModel from "../../models/NotificationModel";

import {
  INotificationRepository,
  NewNotification,
} from "./interface/INotificationRepository";


@injectable()
class NotificationRepository
  implements INotificationRepository
{
  constructor(
    @inject("NotificationModel")
    private readonly notificationModel:
      typeof NotificationModel
  ) {}


  // ============================================================
  // CREATE
  // ============================================================

  async createMany(
    notifications: NewNotification[]
  ): Promise<INotification[]> {
    if (!notifications.length) {
      return [];
    }

    const created =
      await this.notificationModel.insertMany(
        notifications
      );

    return created as unknown as INotification[];
  }


  // ============================================================
  // GET USER NOTIFICATIONS
  // ============================================================

  async getForUser(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<INotification[]> {

    return this.notificationModel
      .find({
        recipient: userId,
      })

      .sort({
        createdAt: -1,
      })

      .skip(
        (page - 1) * limit
      )

      .limit(limit)

      .populate(
        "sender",
        "name profileImage profession"
      )

      .populate(
        "post",
        "content media comments likes totalLikes totalShare"
      )

      .populate(
        "connection"
      )

      .populate(
        "group",
        "name"
      )

      .exec();
  }


  // ============================================================
  // UNREAD COUNT
  // ============================================================

  async getUnreadCount(
    userId: string
  ): Promise<number> {

    return this.notificationModel.countDocuments({
      recipient: userId,

      isRead: false,
    });
  }


  // ============================================================
  // MARK ONE AS READ
  // ============================================================

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification | null> {

    return this.notificationModel.findOneAndUpdate(
      {
        _id: notificationId,

        recipient: userId,
      },

      {
        $set: {
          isRead: true,
        },
      },

      {
        new: true,
      }
    );
  }


  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  async markAllAsRead(
    userId: string
  ): Promise<void> {

    await this.notificationModel.updateMany(
      {
        recipient: userId,

        isRead: false,
      },

      {
        $set: {
          isRead: true,
        },
      }
    );
  }
}


export default NotificationRepository;