import { injectable, inject } from "tsyringe";
import { IPost } from "../../interfaces/IPost";
import { IUser } from "../../interfaces/IUser";
import { Post } from "../../models/postModel";
import { IPostRepository, PostSharePreview } from "./interface/IPostRepository";
import UserModel from "../../models/userModel";
import mongoose from "mongoose";
import { Types } from "mongoose";

// Shared with PostService / PostController — the raw shape of a new post
// as it comes in from the client, before it's mapped onto the Post schema.
export interface AddPostInput {
  caption: string;
  mediaUrl?: string;
  hashtags?: string[];
  mediaType?: "image" | "video";
}

@injectable()
class PostRepository implements IPostRepository {
  constructor(@inject("PostModel") private readonly postModel: typeof Post) {}

  async addPost(post: AddPostInput, user: IUser): Promise<IPost> {
    try {
      const newPost = new this.postModel({
        userid: user._id,
        content: post.caption,
        media: post.mediaUrl ? [post.mediaUrl] : [],
        postTag: post.hashtags || [],
      });

      const savedPost = await newPost.save();

      return savedPost as IPost;
    } catch (error) {
      throw error;
    }
  }

  async getPost(user: IUser): Promise<IPost[]> {
    try {
      const completeUser = await UserModel.findById(user._id).select("interests profession");

      if (!completeUser) {
        return [];
      }

      const userInterests = (completeUser.interests || []).map((i) =>
        i.toString().toLowerCase().trim()
      );

      const userProfession = completeUser.profession
        ? completeUser.profession.toString().toLowerCase().trim()
        : null;

      const matchTags = [...userInterests];
      if (userProfession && !matchTags.includes(userProfession)) {
        matchTags.push(userProfession);
      }

      const orConditions: Record<string, unknown>[] = [{ userid: user._id }];
      if (matchTags.length > 0) {
        orConditions.push({ postTag: { $in: matchTags } });
      }

      const posts = await this.postModel
        .find({ $or: orConditions })
        .sort({ createdAt: -1 })
        .populate("userid", "name profileImage")
        .exec();

      return posts as IPost[];
    } catch (error) {
      console.error("Error in PostRepository.getPost:", error);
      throw error;
    }
  }

  async getUsersPosts(user: IUser): Promise<IPost[]> {
    try {
      const completeUser = await UserModel.findById(user._id).select("interests profession role");

      if (!completeUser) {
        return [];
      }

      const userInterests = (completeUser.interests || []).map((i) =>
        i.toString().toLowerCase().trim()
      );

      const userProfession = completeUser.profession
        ? completeUser.profession.toString().toLowerCase().trim()
        : null;

      const userRole = completeUser.role || null;

      // Tags we match against postTag: interests + profession
      const matchTags = [...userInterests];
      if (userProfession && !matchTags.includes(userProfession)) {
        matchTags.push(userProfession);
      }

      const orConditions: Record<string, unknown>[] = [
        { userid: completeUser._id }, // always show own posts
      ];

      if (matchTags.length > 0) {
        orConditions.push({ postTag: { $in: matchTags } });
      }

      if (userRole) {
        orConditions.push({ "author.role": userRole });
      }

      if (userInterests.length > 0) {
        orConditions.push({ "author.interests": { $in: userInterests } });
      }

      const posts = await this.postModel.aggregate([
        {
          $lookup: {
            from: "users", // must match the actual Mongo collection name for UserModel
            localField: "userid",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        { $match: { $or: orConditions } },
        { $sort: { createdAt: -1 } }, // newest first
      ]);

      return posts as IPost[];
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch posts");
    }
  }

  // NOTE: followUser / UnFollowUser removed — connections now live in
  // ConnectionRepository (see connectionRepository.ts). Use
  // connectionService.areConnected(userA, userB) wherever you used to
  // check user.followers/user.following.

  async getPostsByUserId(userId: string): Promise<IPost[]> {
    try {
      const posts = await this.postModel
        .find({ userid: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .populate("userid", "name profileImage")
        .exec();

      return posts as IPost[];
    } catch (error) {
      console.error("Error in PostRepository.getPostsByUserId:", error);
      throw error;
    }
  }

  async toggleSavePost(userId: string, postId: string): Promise<{ saved: boolean; savedPost: string[] }> {
    const user = await UserModel.findById(userId).select('savedPost');
    if (!user) {
      throw new Error('User not found');
    }

    const postObjectId = new Types.ObjectId(postId);
    const alreadySaved = (user.savedPost ?? []).some(
      (id: Types.ObjectId) => id.toString() === postId
    );

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      alreadySaved
        ? { $pull: { savedPost: postObjectId } }
        : { $addToSet: { savedPost: postObjectId } },
      { new: true }
    ).select('savedPost');

    if (!updatedUser) {
      throw new Error('Failed to update saved posts');
    }

    return {
      saved: !alreadySaved,
      savedPost: (updatedUser.savedPost ?? []).map((id: Types.ObjectId) => id.toString())
    };
  }

  /**
   * Deletes a post, but only if `userId` is the post's owner.
   * Throws 'NOT_FOUND' or 'FORBIDDEN' so the service/controller can map
   * them to 404 / 403 respectively.
   */
  async deleteById(postId: string, userId: string): Promise<void> {
    const deleted = await Post.findOneAndDelete({
      _id: postId,
      userid: new Types.ObjectId(userId)
    });

    if (!deleted) {
      const exists = await Post.exists({ _id: postId });
      throw new Error(exists ? 'FORBIDDEN' : 'NOT_FOUND');
    }
  }

  async findOwnerId(postId: string): Promise<string | null> {
    const post = await this.postModel.findById(postId).select("userid").lean();
    return post ? post.userid.toString() : null;
  }

  async getSharePreview(postId: string): Promise<PostSharePreview | null> {
    if (!Types.ObjectId.isValid(postId)) {
      return null;
    }

    const post = await this.postModel
      .findById(postId)
      .select("content media userid")
      .populate("userid", "name")
      .lean()
      .exec();

    if (!post) {
      return null;
    }

    const author = post.userid as unknown as { name?: string } | null;

    return {
      postContent: String(post.content ?? "").slice(0, 500),
      postMedia: Array.isArray(post.media) ? post.media[0] : undefined,
      postAuthorName: author?.name,
    };
  }
}

export default PostRepository;