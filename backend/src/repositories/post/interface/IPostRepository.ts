// interface/IPostRepository.ts
import { IPost } from "../../../interfaces/IPost";
import { IUser } from "../../../interfaces/IUser";

export interface IPostRepository {
    addPost(post: any, user: IUser): Promise<IPost>;
    getPost(user: IUser): Promise<IPost[]>
    getUsersPosts(user: IUser): Promise<IPost[]>
}