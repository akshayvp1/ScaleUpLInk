import { IUser } from "../../../interfaces/IUser";
import {
  IMessage,
  NormalizedChatMessagePayload,
} from "../../../interfaces/IMessage";

export interface IChatRepository {
  saveMessage(
    senderId: string,
    receiverId: string,
    payload: NormalizedChatMessagePayload
  ): Promise<IMessage>;
  getMessages(userA: string, userB: string): Promise<IMessage[]>;
  markSeen(messageIds: string[], userId: string): Promise<string[]>;
  getUsers(currentUserId: string): Promise<IUser[]>;
  getUsersByIds(ids: string[]): Promise<IUser[]>;
}
