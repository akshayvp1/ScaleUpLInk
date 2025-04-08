// interface/IPostService.ts
import { IPost } from "../../../interfaces/IPost";
import { IUser } from "../../../interfaces/IUser";

export default interface IPostService {
    addPost(post: any, user: IUser): Promise<IPost>
    getPost(user: IUser): Promise<IPost[]>
    getUsersPosts(user: IUser): Promise<IPost[]>
}