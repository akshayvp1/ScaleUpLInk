import { injectable, inject } from "tsyringe";
import { Model, Types } from "mongoose";

import {
  IMessage,
  NormalizedChatMessagePayload,
} from "../../interfaces/IMessage";
import { IUser } from "../../interfaces/IUser";
import { IChatRepository } from "./interface/IChatRepository";

@injectable()
class ChatRepository implements IChatRepository {
  constructor(
    @inject("Message")
    private messageModel: Model<IMessage>,

    @inject("UserModel")
    private userModel: Model<IUser>
  ) {}

  async saveMessage(
    senderId: string,
    receiverId: string,
    payload: NormalizedChatMessagePayload
  ): Promise<IMessage> {
    return await this.messageModel.create({
      senderId,
      receiverId,
      ...payload,
    });
  }

  async getMessages(
    userA: string,
    userB: string
  ): Promise<IMessage[]> {
    return await this.messageModel
      .find({
        $or: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA },
        ],
      })
      .sort({ createdAt: 1 });
  }

  async markSeen(messageIds: string[], userId: string): Promise<string[]> {
    const messages = await this.messageModel
      .find({ _id: { $in: messageIds }, receiverId: userId })
      .select("senderId")
      .lean();

    const senderIds = [
      ...new Set(messages.map((message) => message.senderId.toString())),
    ];

    await this.messageModel.updateMany(
      {
        _id: { $in: messageIds },
        receiverId: userId,
      },
      {
        seen: true,
      }
    );

    return senderIds;
  }

  async getUsers(currentUserId: string): Promise<IUser[]> {
    return await this.userModel
      .find({ _id: { $ne: currentUserId } })
      .select("_id name role profileImage profession");
  }

  async getUsersByIds(ids: string[]): Promise<IUser[]> {
    if (ids.length === 0) return [];

    return await this.userModel
      .find({ _id: { $in: ids }, isActive: true })
      .select("_id name role profileImage profession");
  }

  async getUnreadCountsBySender(receiverId: string): Promise<Record<string, number>> {
    if (!Types.ObjectId.isValid(receiverId)) return {};

    const rows = await this.messageModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      { $match: { receiverId: new Types.ObjectId(receiverId), seen: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);

    return rows.reduce<Record<string, number>>((counts, row) => {
      counts[String(row._id)] = row.count;
      return counts;
    }, {});
  }

  async getMessageSenderForRecipient(
    messageId: string,
    recipientId: string
  ): Promise<string | null> {
    if (!Types.ObjectId.isValid(messageId) || !Types.ObjectId.isValid(recipientId)) {
      return null;
    }

    const message = await this.messageModel
      .findOne({ _id: messageId, receiverId: recipientId })
      .select("senderId")
      .lean();

    return message ? String(message.senderId) : null;
  }
}

export default ChatRepository;