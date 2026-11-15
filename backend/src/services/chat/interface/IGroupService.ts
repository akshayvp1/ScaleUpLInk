import { IGroup } from "../../../interfaces/IGroup";
import { IGroupMessage } from "../../../interfaces/IGroupMessage";
import { ChatMessagePayload } from "../../../interfaces/IMessage";

export interface IGroupService {
  createGroup(name: string, description: string, adminId: string, memberIds: string[]): Promise<IGroup>;
  getGroupsForUser(userId: string): Promise<IGroup[]>;
  getGroupById(groupId: string): Promise<IGroup | null>;
  addMember(groupId: string, requesterId: string, userId: string): Promise<void>;
  removeMember(groupId: string, requesterId: string, userId: string): Promise<void>;
  saveGroupMessage(
    groupId: string,
    senderId: string,
    input: string | ChatMessagePayload
  ): Promise<IGroupMessage>;
  getGroupMessages(groupId: string, requesterId: string): Promise<IGroupMessage[]>;
  getGroupMemberIds(groupId: string, requesterId: string): Promise<string[]>;
  markGroupMessagesSeen(messageIds: string[], userId: string): Promise<void>;
}
