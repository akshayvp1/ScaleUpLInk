import { injectable, inject } from "tsyringe";
import { Types } from "mongoose";
import { IGroupService } from "./interface/IGroupService";
import { IGroupRepository } from "../../repositories/chat/interface/IGroupRepository";
import { IUserRepository } from "../../repositories/entrepreneur/interface/IUserRepository";
import { IGroup } from "../../interfaces/IGroup";
import { IGroupMessage } from "../../interfaces/IGroupMessage";
import { ChatMessagePayload } from "../../interfaces/IMessage";
import ConnectionService from "../connection/connectionService";
import { IPostRepository } from "../../repositories/post/interface/IPostRepository";
import { normalizeChatPayload } from "../../utils/chatPayload";

@injectable()
class GroupService implements IGroupService {
  constructor(
    @inject("GroupRepository") private groupRepository: IGroupRepository,
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("ConnectionService") private connectionService: ConnectionService,
    @inject("PostRepository") private postRepository: IPostRepository
  ) {}

  private assertValidObjectId(id: string, label: string): void {
    if (!Types.ObjectId.isValid(id)) throw new Error(`Invalid ${label}`);
  }

  private async assertEligibleUser(userId: string): Promise<void> {
    this.assertValidObjectId(userId, "user id");
    const user = await this.userRepository.findUserById(userId);
    if (!user) throw new Error("User not found");
    if (!user.isActive) throw new Error("User is not eligible to join this group");
  }

  private async assertConnected(adminId: string, userId: string): Promise<void> {
    const connected = await this.connectionService.areConnected(adminId, userId);
    if (!connected) {
      throw new Error("You can only add people you are connected with");
    }
  }

  private async assertMember(groupId: string, userId: string): Promise<void> {
    const isMember = await this.groupRepository.isMember(groupId, userId);
    if (!isMember) throw new Error("Not a group member");
  }

  private async assertAdmin(groupId: string, userId: string): Promise<void> {
    const isAdmin = await this.groupRepository.isAdmin(groupId, userId);
    if (!isAdmin) throw new Error("Only group admin can perform this action");
  }

  async createGroup(name: string, description: string, adminId: string, memberIds: string[]): Promise<IGroup> {
    this.assertValidObjectId(adminId, "user id");

    const trimmedName = (name ?? "").trim();
    const trimmedDescription = (description ?? "").trim();

    if (!trimmedName) throw new Error("Group name is required");
    if (trimmedName.length > 100) throw new Error("Group name is too long");
    if (trimmedDescription.length > 500) throw new Error("Description is too long");

    const requestedMembers = Array.isArray(memberIds) ? memberIds : [];
    const uniqueMemberIds = [...new Set(requestedMembers)].filter(
      (memberId) => memberId !== adminId
    );

    for (const memberId of uniqueMemberIds) {
      await this.assertEligibleUser(memberId);
      await this.assertConnected(adminId, memberId);
    }

    const created = await this.groupRepository.createGroup(
      trimmedName,
      trimmedDescription,
      adminId,
      uniqueMemberIds
    );

    return (await this.groupRepository.getGroupById(String(created._id))) ?? created;
  }

  async getGroupsForUser(userId: string): Promise<IGroup[]> {
    return await this.groupRepository.getGroupsForUser(userId);
  }

  async getGroupById(groupId: string): Promise<IGroup | null> {
    return await this.groupRepository.getGroupById(groupId);
  }

  async addMember(groupId: string, requesterId: string, userId: string): Promise<void> {
    this.assertValidObjectId(groupId, "group id");
    this.assertValidObjectId(userId, "user id");
    await this.assertAdmin(groupId, requesterId);
    await this.assertEligibleUser(userId);
    await this.assertConnected(requesterId, userId);
    await this.groupRepository.addMember(groupId, userId);
  }

  async removeMember(groupId: string, requesterId: string, userId: string): Promise<void> {
    this.assertValidObjectId(groupId, "group id");
    this.assertValidObjectId(userId, "user id");

    if (requesterId === userId) {
      await this.assertMember(groupId, requesterId);
      if (await this.groupRepository.isAdmin(groupId, requesterId)) {
        throw new Error("Group admin cannot leave the group");
      }
    } else {
      await this.assertAdmin(groupId, requesterId);
    }
    await this.groupRepository.removeMember(groupId, userId);
  }

  async saveGroupMessage(
    groupId: string,
    senderId: string,
    input: string | ChatMessagePayload
  ): Promise<IGroupMessage> {
    this.assertValidObjectId(groupId, "group id");
    await this.assertMember(groupId, senderId);
    let payload = normalizeChatPayload(input);

    if (payload.type === "post" && payload.postId) {
      const preview = await this.postRepository.getSharePreview(payload.postId);

      if (!preview) {
        throw new Error("Post not found");
      }

      payload = { ...payload, ...preview };
    }

    return await this.groupRepository.saveGroupMessage(groupId, senderId, payload);
  }

  async getGroupMessages(groupId: string, requesterId: string): Promise<IGroupMessage[]> {
    this.assertValidObjectId(groupId, "group id");
    await this.assertMember(groupId, requesterId);
    return await this.groupRepository.getGroupMessages(groupId);
  }

  async getGroupMemberIds(groupId: string, requesterId: string): Promise<string[]> {
    this.assertValidObjectId(groupId, "group id");
    await this.assertMember(groupId, requesterId);
    return await this.groupRepository.getGroupMemberIds(groupId);
  }

  async markGroupMessagesSeen(messageIds: string[], userId: string): Promise<void> {
    await this.groupRepository.markGroupMessagesSeen(messageIds, userId);
  }
}

export default GroupService;
