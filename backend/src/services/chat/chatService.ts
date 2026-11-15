import { inject, injectable } from "tsyringe";
import { Types } from "mongoose";
import { IChatService } from "./interface/IChatService";
import { IChatRepository } from "../../repositories/chat/interface/IChatRepository";
import {
  ChatMessagePayload,
  IMessage,
} from "../../interfaces/IMessage";
import { IUser } from "../../interfaces/IUser";
import { IConnection } from "../../interfaces/IConnection";
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
    private postRepository: IPostRepository
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

    return await this.chatRepository.getUsersByIds(otherUserIds);
  }
}

export default ChatService;
