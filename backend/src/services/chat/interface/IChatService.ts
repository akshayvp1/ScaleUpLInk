import {
  ChatMessagePayload,
  IMessage,
} from "../../../interfaces/IMessage";
import { IUser } from "../../../interfaces/IUser";

export interface IChatService {
  saveMessage(
    senderId: string,
    receiverId: string,
    input: string | ChatMessagePayload
  ): Promise<IMessage>;
  getMessages(userA: string, userB: string): Promise<IMessage[]>;
  markSeen(messageIds: string[], userId: string): Promise<string[]>;
  getUsers(userId: string): Promise<IUser[]>;
}
