import { IGroup } from "../../../interfaces/IGroup";
import { IGroupMessage } from "../../../interfaces/IGroupMessage";
import { NormalizedChatMessagePayload } from "../../../interfaces/IMessage";

export interface IGroupRepository {
  createGroup(name: string, description: string, adminId: string, memberIds: string[]): Promise<IGroup>;
  getGroupById(groupId: string): Promise<IGroup | null>;
  getGroupsForUser(userId: string): Promise<IGroup[]>;
  isMember(groupId: string, userId: string): Promise<boolean>;
  isAdmin(groupId: string, userId: string): Promise<boolean>;
  addMember(groupId: string, userId: string): Promise<void>;
  removeMember(groupId: string, userId: string): Promise<void>;
  saveGroupMessage(
    groupId: string,
    senderId: string,
    payload: NormalizedChatMessagePayload
  ): Promise<IGroupMessage>;
  getGroupMessages(groupId: string): Promise<IGroupMessage[]>;
  getGroupMemberIds(groupId: string): Promise<string[]>;
  markGroupMessagesSeen(messageIds: string[], userId: string): Promise<void>;
  getGroupUnreadCounts(userId: string): Promise<Record<string, number>>;
  getGroupMessageSenderForRecipient(
    messageId: string,
    recipientId: string
  ): Promise<string | null>;
}
