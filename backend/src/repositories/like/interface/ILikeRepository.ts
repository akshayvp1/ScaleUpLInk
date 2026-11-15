export interface ILikeRepository {
  addLike(postId: string, userId: string): Promise<{ liked: boolean; totalLikes: number }>;
  removeLike(postId: string, userId: string): Promise<{ liked: boolean; totalLikes: number }>;
  hasLiked(postId: string, userId: string): Promise<boolean>;
  getLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>>;
}