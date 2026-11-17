import { injectable, inject } from "tsyringe";
import { Model, Types } from "mongoose";
import { IGroup } from "../../interfaces/IGroup";
import { IGroupMessage } from "../../interfaces/IGroupMessage";
import { NormalizedChatMessagePayload } from "../../interfaces/IMessage";
import { IGroupRepository } from "./interface/IGroupRepository";

@injectable()
class GroupRepository implements IGroupRepository {
  constructor(
    @inject("Group") private groupModel: Model<IGroup>,
    @inject("GroupMessage") private groupMessageModel: Model<IGroupMessage>
  ) {}

  async createGroup(name: string, description: string, adminId: string, memberIds: string[]): Promise<IGroup> {
    const allMembers = [...new Set([adminId, ...memberIds])];
    return await this.groupModel.create({
      name,
      description,
      admin: adminId,
      members: allMembers,
    });
  }

  async getGroupById(groupId: string): Promise<IGroup | null> {
    return await this.groupModel.findById(groupId).populate("members", "name email");
  }

  async getGroupsForUser(userId: string): Promise<IGroup[]> {
    return await this.groupModel
      .find({ members: userId })
      .populate("members", "name email")
      .sort({ updatedAt: -1 });
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    return Boolean(await this.groupModel.exists({ _id: groupId, members: userId }));
  }

  async isAdmin(groupId: string, userId: string): Promise<boolean> {
    return Boolean(await this.groupModel.exists({ _id: groupId, admin: userId }));
  }

  async addMember(groupId: string, userId: string): Promise<void> {
    await this.groupModel.findByIdAndUpdate(groupId, {
      $addToSet: { members: userId },
    });
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await this.groupModel.findByIdAndUpdate(groupId, {
      $pull: { members: userId },
    });
  }

  async saveGroupMessage(
    groupId: string,
    senderId: string,
    payload: NormalizedChatMessagePayload
  ): Promise<IGroupMessage> {
    return await this.groupMessageModel.create({
      groupId,
      senderId,
      ...payload,
      seenBy: [senderId],
    });
  }

  async getGroupMessages(groupId: string): Promise<IGroupMessage[]> {
    return await this.groupMessageModel
      .find({ groupId })
      .populate("senderId", "name email")
      .sort({ createdAt: 1 });
  }

  async getGroupMemberIds(groupId: string): Promise<string[]> {
    const group = await this.groupModel
      .findById(groupId)
      .select("members")
      .lean();

    return (group?.members ?? []).map((memberId) => memberId.toString());
  }

  async markGroupMessagesSeen(messageIds: string[], userId: string): Promise<void> {
    const groupIds = await this.getMemberGroupIds(userId);

    await this.groupMessageModel.updateMany(
      { _id: { $in: messageIds }, groupId: { $in: groupIds } },
      { $addToSet: { seenBy: userId } }
    );
  }

  async getGroupUnreadCounts(userId: string): Promise<Record<string, number>> {
    const groupIds = await this.getMemberGroupIds(userId);
    if (groupIds.length === 0) return {};

    const rows = await this.groupMessageModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      {
        $match: {
          groupId: { $in: groupIds },
          seenBy: { $ne: new Types.ObjectId(userId) },
        },
      },
      { $group: { _id: "$groupId", count: { $sum: 1 } } },
    ]);

    return rows.reduce<Record<string, number>>((counts, row) => {
      counts[String(row._id)] = row.count;
      return counts;
    }, {});
  }

  async getGroupMessageSenderForRecipient(
    messageId: string,
    recipientId: string
  ): Promise<string | null> {
    if (!Types.ObjectId.isValid(messageId) || !Types.ObjectId.isValid(recipientId)) {
      return null;
    }

    const groupIds = await this.getMemberGroupIds(recipientId);
    const message = await this.groupMessageModel
      .findOne({ _id: messageId, groupId: { $in: groupIds } })
      .select("senderId")
      .lean();

    return message ? String(message.senderId) : null;
  }

  private async getMemberGroupIds(userId: string): Promise<Types.ObjectId[]> {
    if (!Types.ObjectId.isValid(userId)) return [];

    const groups = await this.groupModel
      .find({ members: new Types.ObjectId(userId) })
      .select("_id")
      .lean();

    return groups.map((group) => group._id);
  }
}

export default GroupRepository;