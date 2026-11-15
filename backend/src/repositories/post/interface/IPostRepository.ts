// interface/IPostRepository.ts
import { IPost } from "../../../interfaces/IPost";
import { IUser } from "../../../interfaces/IUser";

export interface PostSharePreview {
    postContent: string;
    postMedia?: string;
    postAuthorName?: string;
}

export interface IPostRepository {
    addPost(post: any, user: IUser): Promise<IPost>;
    getPost(user: IUser): Promise<IPost[]>
    getUsersPosts(user: IUser): Promise<IPost[]>
    findOwnerId(postId: string): Promise<string | null>;
    getSharePreview(postId: string): Promise<PostSharePreview | null>;
}