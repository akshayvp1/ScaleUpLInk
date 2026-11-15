import { injectable } from "tsyringe";
import { Types } from "mongoose";
import { Comment } from "../../models/commentModel";
import { Post } from "../../models/postModel";
import { ICommentRepository } from "./interface/ICommentRepository";
import { IComment } from "../../interfaces/IComment";

@injectable()
class CommentRepository implements ICommentRepository {
  async addComment(postId: string, userId: string, commentText: string): Promise<IComment> {
    const postObjectId = new Types.ObjectId(postId);

    const comment = await Comment.create({
      postId: postObjectId,
      userId: new Types.ObjectId(userId),
      commentText,
    });

    await Post.findByIdAndUpdate(postObjectId, { $inc: { totalComments: 1 } });

    return comment.populate("userId", "name profileImage");
  }

  async getCommentsForPost(postId: string): Promise<IComment[]> {
    return Comment.find({ postId: new Types.ObjectId(postId) })
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 })
      .exec();
  }
}

export default CommentRepository;