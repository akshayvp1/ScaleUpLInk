import { inject, injectable } from "tsyringe";
import { Model, Types } from "mongoose";
import { IChatService } from "./interface/IChatService";
import { IChatRepository } from "../../repositories/chat/interface/IChatRepository";
import {
  ChatMessagePayload,
  IMessage,
} from "../../interfaces/IMessage";
import { IUser } from "../../interfaces/IUser";
import { IConnection } from "../../interfaces/IConnection";
import { EventDocument } from "../../interfaces/IEvent";
import ConnectionService from "../connection/connectionService";
import { IPostRepository } from "../../repositories/post/interface/IPostRepository";
import { normalizeChatPayload } from "../../utils/chatPayload";

const getPartyId = (party: unknown): string => {
  if (!party) return "";
  if (typeof party === "string") return party;
  if (typeof party === "object" && "_id" in party) {
    return String((party as { _id: unknown })._id ?? "");
  }
  return String(party);
};

@injectable()
class ChatService implements IChatService {
  constructor(
    @inject("ChatRepository")
    private chatRepository: IChatRepository,

    @inject("ConnectionService")
    private connectionService: ConnectionService,

    @inject("PostRepository")
    private postRepository: IPostRepository,

    @inject("EventModel")
    private eventModel: Model<EventDocument>
  ) {}

  async saveMessage(
    senderId: string,
    receiverId: string,
    input: string | ChatMessagePayload
  ): Promise<IMessage> {
    if (!Types.ObjectId.isValid(senderId) || !Types.ObjectId.isValid(receiverId)) {
      throw new Error("Invalid user id");
    }

    if (senderId === receiverId) {
      throw new Error("Cannot message yourself");
    }

    const connected = await this.connectionService.areConnected(
      senderId,
      receiverId
    );

    if (!connected) {
      throw new Error("NOT_CONNECTED");
    }

    let payload = normalizeChatPayload(input);

    if (payload.type === "post" && payload.postId) {
      const preview = await this.postRepository.getSharePreview(payload.postId);

      if (!preview) {
        throw new Error("Post not found");
      }

      payload = { ...payload, ...preview };
    }

    if (payload.type === "event" && payload.eventId) {
      const event = await this.eventModel
        .findById(payload.eventId)
        .select(
          "eventStatus eventTitle mainBanner startDate startTime venueName city"
        )
        .lean();

      if (!event || event.eventStatus !== "approve") {
        throw new Error("Event not found or not available to share");
      }

      payload = {
        ...payload,
        eventTitle: event.eventTitle,
        eventImage: event.mainBanner,
        eventStartDate: new Date(event.startDate).toISOString(),
        eventStartTime: event.startTime,
        eventVenue: event.venueName,
        eventCity: event.city,
      };
    }

    return await this.chatRepository.saveMessage(senderId, receiverId, payload);
  }

  async getMessages(userA: string, userB: string): Promise<IMessage[]> {
    if (!Types.ObjectId.isValid(userA) || !Types.ObjectId.isValid(userB)) {
      throw new Error("Invalid user id");
    }

    const connected = await this.connectionService.areConnected(userA, userB);

    if (!connected) {
      throw new Error("NOT_CONNECTED");
    }

    return await this.chatRepository.getMessages(userA, userB);
  }

  async markSeen(messageIds: string[], userId: string): Promise<string[]> {
    return await this.chatRepository.markSeen(messageIds, userId);
  }

  async getUsers(userId: string): Promise<IUser[]> {
    const connections = await this.connectionService.getConnections(userId);

    const otherUserIds = [
      ...new Set(
        connections
          .map((connection: IConnection) => {
            const requesterId = getPartyId(connection.requester);
            const recipientId = getPartyId(connection.recipient);
            return requesterId === userId ? recipientId : requesterId;
          })
          .filter((id) => id && id !== userId)
      ),
    ];

    const users = await this.chatRepository.getUsersByIds(otherUserIds);
    const unreadCounts = await this.chatRepository.getUnreadCountsBySender(userId);

    return users.map(
      (user) =>
        ({
          ...user.toObject(),
          unreadCount: unreadCounts[String(user._id)] ?? 0,
        }) as unknown as IUser
    );
  }

  async getUnreadCountsBySender(userId: string): Promise<Record<string, number>> {
    return await this.chatRepository.getUnreadCountsBySender(userId);
  }

  async getMessageSenderForRecipient(
    messageId: string,
    recipientId: string
  ): Promise<string | null> {
    return await this.chatRepository.getMessageSenderForRecipient(
      messageId,
      recipientId
    );
  }
}

export default ChatService;
