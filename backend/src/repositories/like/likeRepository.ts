import { injectable } from "tsyringe";
import { Types } from "mongoose";
import { Like } from "../../models/likeModel";
import { Post } from "../../models/postModel";
import { ILikeRepository } from "./interface/ILikeRepository";

@injectable()
class LikeRepository implements ILikeRepository {
  async addLike(postId: string, userId: string) {
  const postObjectId = new Types.ObjectId(postId);
  const userObjectId = new Types.ObjectId(userId);

  try {
    await Like.create({ postId: postObjectId, userId: userObjectId });
  } catch (error: any) {
    if (error?.code !== 11000) throw error;
    const totalLikes = await Like.countDocuments({ postId: postObjectId });
    return { liked: true, totalLikes, isNewLike: false }; // <-- added
  }

  const updated = await Post.findByIdAndUpdate(
    postObjectId,
    { $inc: { totalLikes: 1 } },
    { new: true }
  ).select("totalLikes");

  return { liked: true, totalLikes: updated?.totalLikes ?? 0, isNewLike: true }; // <-- added
}

  async removeLike(postId: string, userId: string) {
    const postObjectId = new Types.ObjectId(postId);
    const userObjectId = new Types.ObjectId(userId);

    const deleted = await Like.findOneAndDelete({ postId: postObjectId, userId: userObjectId });

    if (!deleted) {
      const totalLikes = await Like.countDocuments({ postId: postObjectId });
      return { liked: false, totalLikes };
    }

    const updated = await Post.findByIdAndUpdate(
      postObjectId,
      { $inc: { totalLikes: -1 } },
      { new: true }
    ).select("totalLikes");

    return { liked: false, totalLikes: updated?.totalLikes ?? 0 };
  }

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    const exists = await Like.exists({
      postId: new Types.ObjectId(postId),
      userId: new Types.ObjectId(userId),
    });
    return !!exists;
  }
  async getLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
    if (!postIds.length) return new Set();
    const likes = await Like.find({
      userId: new Types.ObjectId(userId),
      postId: { $in: postIds.map((id) => new Types.ObjectId(id)) },
    }).select("postId");
    return new Set(likes.map((l) => l.postId.toString()));
  }
  
}

export default LikeRepository;