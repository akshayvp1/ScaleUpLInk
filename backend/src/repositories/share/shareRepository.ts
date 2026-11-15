import { injectable } from "tsyringe";
import { Types } from "mongoose";
import { Share } from "../../models/shareModel";
import { Post } from "../../models/postModel";
import { IShareRepository } from "./interface/IShareRepository";

@injectable()
class ShareRepository implements IShareRepository {
  async addShare(postId: string, userId: string): Promise<{ totalShare: number }> {
    const postObjectId = new Types.ObjectId(postId);

    await Share.create({ postId: postObjectId, userId: new Types.ObjectId(userId) });

    const updated = await Post.findByIdAndUpdate(
      postObjectId,
      { $inc: { totalShare: 1 } },
      { new: true }
    ).select("totalShare");

    if (!updated) throw new Error("Post not found");

    return { totalShare: updated.totalShare };
  }

  async getShareDetails(postId: string, sharedBy?: string) {
    const post = await Post.findById(postId)
      .populate("userid", "name profileImage")
      .select("content media userid totalShare totalLikes createdAt")
      .lean()
      .exec();

    if (!post) return null;

    const shareEntry = sharedBy
      ? await Share.findOne({ postId, userId: sharedBy }).populate("userId", "name profileImage")
      : await Share.findOne({ postId }).sort({ sharedAt: -1 }).populate("userId", "name profileImage");

    const totalShareCount = await Share.countDocuments({ postId });

    return {
      post: {
        _id: post._id,
        content: post.content,
        media: post.media,
        userid: post.userid,
        author: post.userid,
        totalShare: post.totalShare,
        totalLikes: post.totalLikes,
        createdAt: post.createdAt,
      },
      share: shareEntry ? { sharedBy: shareEntry.userId, sharedAt: shareEntry.sharedAt } : null,
      totalShareCount,
    };
  }
}

export default ShareRepository;