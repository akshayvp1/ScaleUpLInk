import {
  injectable,
  inject,
} from "tsyringe";

import {
  INotification,
} from "../../interfaces/INotification";

import NotificationRepository from "../../repositories/notification/notificationRepository";

import DeviceTokenRepository from "../../repositories/notification/deviceTokenRepository";

import PushService from "./pushService";

import {
  INotificationService,
} from "./interface/INotificationService";


@injectable()
class NotificationService
  implements INotificationService
{
  constructor(
    @inject("NotificationRepository")
    private readonly notificationRepository:
      NotificationRepository,

    @inject("DeviceTokenRepository")
    private readonly deviceTokenRepository:
      DeviceTokenRepository,

    @inject("PushService")
    private readonly pushService:
      PushService
  ) {}


  // ============================================================
  // POST SHARE
  // ============================================================

  async notifyPostShare(
    senderId: string,
    recipientIds: string[],
    postId: string
  ): Promise<void> {

    const targets =
      Array.from(
        new Set(recipientIds)
      ).filter(
        (id) => id !== senderId
      );

    if (!targets.length) {
      return;
    }

    const notifications =
      targets.map(
        (recipientId) => ({
          recipient: recipientId,

          sender: senderId,

          type:
            "post_share" as const,

          post: postId,

          message:
            "shared a post with you",
        })
      );

    await this.notificationRepository
      .createMany(
        notifications
      );

    this.pushService
      .sendToUsers(
        targets,
        {
          title:
            "New share",

          body:
            "Someone shared a post with you",

          data: {
            type:
              "post_share",

            postId,

            senderId,
          },
        }
      )
      .catch(
        (error) =>
          console.error(
            "Post share push failed:",
            error
          )
      );
  }


  // ============================================================
  // REGISTER DEVICE
  // ============================================================

  async registerDevice(
    userId: string,
    token: string,
    platform:
      | "web"
      | "android"
      | "ios"
  ): Promise<void> {

    await this.deviceTokenRepository.upsert(
      userId,
      token,
      platform
    );
  }


  // ============================================================
  // UNREGISTER DEVICE
  // ============================================================

  async unregisterDevice(
    token: string
  ): Promise<void> {

    await this.deviceTokenRepository.remove(
      token
    );
  }


  // ============================================================
  // GET NOTIFICATIONS
  // ============================================================

  async getNotifications(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<INotification[]> {

    return this.notificationRepository
      .getForUser(
        userId,
        page,
        limit
      );
  }


  // ============================================================
  // GET UNREAD COUNT
  // ============================================================

  async getUnreadCount(
    userId: string
  ): Promise<number> {

    return this.notificationRepository
      .getUnreadCount(userId);
  }


  // ============================================================
  // MARK AS READ
  // ============================================================

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<INotification | null> {

    return this.notificationRepository
      .markAsRead(
        notificationId,
        userId
      );
  }


  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  async markAllAsRead(
    userId: string
  ): Promise<void> {

    await this.notificationRepository
      .markAllAsRead(userId);
  }


  // ============================================================
  // LIKE
  // ============================================================

  async notifyLike(
    senderId: string,
    recipientId: string,
    postId: string
  ): Promise<void> {

    if (
      senderId === recipientId
    ) {
      return;
    }

    await this.notificationRepository
      .createMany([
        {
          recipient: recipientId,

          sender: senderId,

          type:
            "like" as const,

          post: postId,

          message:
            "liked your post",
        },
      ]);

    this.pushService
      .sendToUsers(
        [recipientId],
        {
          title:
            "New like",

          body:
            "Someone liked your post",

          data: {
            type:
              "like",

            postId,

            senderId,
          },
        }
      )
      .catch(
        (error) =>
          console.error(
            "Like push failed:",
            error
          )
      );
  }


  // ============================================================
  // COMMENT
  // ============================================================

  async notifyComment(
    senderId: string,
    recipientId: string,
    postId: string
  ): Promise<void> {

    if (
      senderId === recipientId
    ) {
      return;
    }

    await this.notificationRepository
      .createMany([
        {
          recipient: recipientId,

          sender: senderId,

          type:
            "comment" as const,

          post: postId,

          message:
            "commented on your post",
        },
      ]);

    this.pushService
      .sendToUsers(
        [recipientId],
        {
          title:
            "New comment",

          body:
            "Someone commented on your post",

          data: {
            type:
              "comment",

            postId,

            senderId,
          },
        }
      )
      .catch(
        (error) =>
          console.error(
            "Comment push failed:",
            error
          )
      );
  }


  // ============================================================
  // FOLLOW
  // ============================================================

  async notifyFollow(
    senderId: string,
    recipientId: string
  ): Promise<void> {

    if (
      senderId === recipientId
    ) {
      return;
    }

    await this.notificationRepository
      .createMany([
        {
          recipient: recipientId,

          sender: senderId,

          type:
            "follow" as const,

          message:
            "started following you",
        },
      ]);

    this.pushService
      .sendToUsers(
        [recipientId],
        {
          title:
            "New follower",

          body:
            "Someone started following you",

          data: {
            type:
              "follow",

            senderId,

            userId:
              senderId,
          },
        }
      )
      .catch(
        (error) =>
          console.error(
            "Follow push failed:",
            error
          )
      );
  }


  // ============================================================
  // CONNECTION REQUEST
  // ============================================================

  async notifyConnectionRequest(
    senderId: string,
    recipientId: string,
    connectionId: string
  ): Promise<void> {

    if (
      senderId === recipientId
    ) {
      return;
    }

    // In-app notification
    await this.notificationRepository
      .createMany([
        {
          recipient: recipientId,

          sender: senderId,

          type:
            "connection_request" as const,

          connection:
            connectionId,

          message:
            "sent you a connection request",
        },
      ]);


    // Push notification
    this.pushService
      .sendToUsers(
        [recipientId],
        {
          title:
            "New connection request",

          body:
            "Someone sent you a connection request",

          data: {
            type:
              "connection_request",

            connectionId,

            senderId,

            userId:
              senderId,
          },
        }
      )
      .catch(
        (error) =>
          console.error(
            "Connection request push failed:",
            error
          )
      );
  }


  // ============================================================
  // CONNECTION ACCEPTED
  // ============================================================

  async notifyConnectionAccepted(
    accepterId: string,
    requesterId: string,
    connectionId: string
  ): Promise<void> {

    if (
      accepterId === requesterId
    ) {
      return;
    }

    // In-app notification
    await this.notificationRepository
      .createMany([
        {
          recipient: requesterId,

          sender: accepterId,

          type:
            "connection_accepted" as const,

          connection:
            connectionId,

          message:
            "accepted your connection request",
        },
      ]);


    // Push notification
    this.pushService
      .sendToUsers(
        [requesterId],
        {
          title:
            "Connection accepted",

          body:
            "Your connection request was accepted",

          data: {
            type:
              "connection_accepted",

            connectionId,

            senderId:
              accepterId,

            userId:
              accepterId,
          },
        }
      )
      .catch(
        (error) =>
          console.error(
            "Connection accepted push failed:",
            error
          )
      );
  }

  // ============================================================
  // CHAT MESSAGE
  // ============================================================

  async notifyMessage(
    senderId: string,
    recipientId: string,
    preview: string,
    groupName?: string,
    groupId?: string
  ): Promise<void> {

    if (senderId === recipientId) {
      return;
    }

    const message = (
      groupName
        ? `sent a message in ${groupName}`
        : "sent you a message"
    ).slice(0, 300);

    await this.notificationRepository
      .createMany([
        {
          recipient: recipientId,

          sender: senderId,

          type:
            "message" as const,

          ...(groupId
            ? { group: groupId }
            : {}),

          message,
        },
      ]);

    const body = (
      preview ||
      message
    ).slice(0, 180);

    this.pushService
      .sendToUsers(
        [recipientId],
        {
          title:
            groupName
              ? `New message in ${groupName}`
              : "New message",

          body,

          data: {
            type: "message",

            senderId,

            ...(groupId
              ? { groupId }
              : {}),
          },
        }
      )
      .catch(
        (error) =>
          console.error(
            "Message push failed:",
            error
          )
      );
  }
}


export default NotificationService;