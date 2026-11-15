import { injectable, inject } from "tsyringe";
import { Model } from "mongoose";
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
    const groups = await this.groupModel
      .find({ members: userId })
      .select("_id")
      .lean();
    const groupIds = groups.map((group) => group._id);

    await this.groupMessageModel.updateMany(
      { _id: { $in: messageIds }, groupId: { $in: groupIds } },
      { $addToSet: { seenBy: userId } }
    );
  }
}

export default GroupRepository;