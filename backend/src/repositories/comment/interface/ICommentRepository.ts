import { IComment } from "../../../interfaces/IComment";

export interface ICommentRepository {
  addComment(postId: string, userId: string, commentText: string): Promise<IComment>;
  getCommentsForPost(postId: string): Promise<IComment[]>;
}