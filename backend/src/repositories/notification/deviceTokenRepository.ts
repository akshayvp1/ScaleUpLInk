// repositories/notification/deviceTokenRepository.ts
import { injectable, inject } from "tsyringe";
import DeviceTokenModel, { IDeviceToken } from "../../models/deviceTokenModel";
import { IDeviceTokenRepository } from "./interface/IDeviceTokenRepository";

@injectable()
class DeviceTokenRepository implements IDeviceTokenRepository {
  constructor(
    @inject("DeviceTokenModel") private readonly deviceTokenModel: typeof DeviceTokenModel
  ) {}

  async upsert(userId: string, token: string, platform: "web" | "android" | "ios"): Promise<IDeviceToken> {
    return this.deviceTokenModel.findOneAndUpdate(
      { token },
      { $set: { user: userId, token, platform } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async remove(token: string): Promise<void> {
    await this.deviceTokenModel.deleteOne({ token });
  }

  async getTokensForUsers(userIds: string[]): Promise<string[]> {
    const docs = await this.deviceTokenModel.find({ user: { $in: userIds } }).select("token").lean();
    return docs.map((d) => d.token);
  }

  async removeMany(tokens: string[]): Promise<void> {
    if (!tokens.length) return;
    await this.deviceTokenModel.deleteMany({ token: { $in: tokens } });
  }
}

export default DeviceTokenRepository;