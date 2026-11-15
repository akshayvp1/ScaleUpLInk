// repositories/notification/interface/IDeviceTokenRepository.ts
import { IDeviceToken } from "../../../models/deviceTokenModel";

export interface IDeviceTokenRepository {
  upsert(userId: string, token: string, platform: "web" | "android" | "ios"): Promise<IDeviceToken>;
  remove(token: string): Promise<void>;
  getTokensForUsers(userIds: string[]): Promise<string[]>;
  removeMany(tokens: string[]): Promise<void>;
}