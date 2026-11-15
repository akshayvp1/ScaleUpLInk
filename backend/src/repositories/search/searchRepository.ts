import { injectable } from "tsyringe";
import mongoose, { FilterQuery } from "mongoose";
import { ISearchRepository } from "./ISearchRepository";
import UserModel from "../../models/userModel";
import { IUser } from "../../interfaces/IUser";

@injectable()
class SearchRepository implements ISearchRepository {
  async searchUsers(
    query: string,
    currentUserId: string,
    limit = 20
  ): Promise<IUser[]> {
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);

    const filters: FilterQuery<IUser> = {
      _id: { $ne: currentUserObjectId },
      // Blocked users are simply the ones marked inactive — no separate
      // field needed.
      isActive: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    };

    return UserModel.find(filters)
      .select("-password")
      .limit(limit)
      .lean<IUser[]>();
  }
}

export default SearchRepository;