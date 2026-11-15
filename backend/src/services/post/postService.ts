import { inject, injectable } from "tsyringe";
import IPostService from "./interface/IPostService";
import PostRepository, { AddPostInput } from "../../repositories/post/postRepository";
import LikeRepository from "../../repositories/like/likeRepository";
import CommentRepository from "../../repositories/comment/commentRepository";
import ShareRepository from "../../repositories/share/shareRepository";
import { IPost } from "../../interfaces/IPost";
import { IUser } from "../../interfaces/IUser";
import { IComment } from "../../interfaces/IComment";

export type PostWithLikeStatus = IPost & { isLiked: boolean };

@injectable()
class PostService implements IPostService {
  constructor(
    @inject("PostRepository") private postRepository: PostRepository,
    @inject("LikeRepository") private likeRepository: LikeRepository,
    @inject("CommentRepository") private commentRepository: CommentRepository,
    @inject("ShareRepository") private shareRepository: ShareRepository
  ) {}

 private async withLikeStatus(posts: IPost[], userId: string): Promise<PostWithLikeStatus[]> {
  const likedIds = await this.likeRepository.getLikedPostIds(
    userId,
    posts.map((p) => p._id.toString())
  );
  return posts.map((p) => {
    const plain = typeof (p as any).toObject === 'function' ? (p as any).toObject() : p;
    return {
      ...plain,
      isLiked: likedIds.has(p._id.toString()),
    };
  });
}

  async addPost(post: AddPostInput, user: IUser): Promise<IPost> {
    return this.postRepository.addPost(post, user);
  }

  async getPost(user: IUser): Promise<PostWithLikeStatus[]> {
    const posts = await this.postRepository.getPost(user);
    return this.withLikeStatus(posts, user._id.toString());
  }

  async getUsersPosts(user: IUser): Promise<PostWithLikeStatus[]> {
    const posts = await this.postRepository.getUsersPosts(user);
    return this.withLikeStatus(posts, user._id.toString());
  }

  async getPostsByUserId(userId: string, requestingUserId: string): Promise<PostWithLikeStatus[]> {
    const posts = await this.postRepository.getPostsByUserId(userId);
    return this.withLikeStatus(posts, requestingUserId);
  }

  async addLike(postId: string, userId: string) {
    return this.likeRepository.addLike(postId, userId);
  }
  async unLike(postId: string, userId: string) {
    return this.likeRepository.removeLike(postId, userId);
  }

  async addComment(postId: string, userId: string, commentText: string): Promise<IComment> {
    return this.commentRepository.addComment(postId, userId, commentText);
  }
  async getComments(postId: string): Promise<IComment[]> {
    return this.commentRepository.getCommentsForPost(postId);
  }

  // async followUser(followerId: string, userIdToFollow: string) {
  //   return this.postRepository.followUser(followerId, userIdToFollow);
  // }
  // async UnFollowUser(followerId: string, userIdToUnFollow: string) {
  //   return this.postRepository.UnFollowUser(followerId, userIdToUnFollow);
  // }

  async savePost(userId: string, postId: string) {
    if (!userId || !postId) throw new Error("userId and postId are required");
    return this.postRepository.toggleSavePost(userId, postId);
  }

  async sharePost(userId: string, postId: string) {
    if (!userId || !postId) throw new Error("userId and postId are required");
    return this.shareRepository.addShare(postId, userId);
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    if (!userId || !postId) throw new Error("userId and postId are required");
    await this.postRepository.deleteById(postId, userId);
  }

  async getShareDetails(postId: string, sharedBy?: string) {
    return this.shareRepository.getShareDetails(postId, sharedBy);
  }
  // Add to PostService class
async getPostOwnerId(postId: string): Promise<string | null> {
  return this.postRepository.findOwnerId(postId);
}
}

export default PostService;