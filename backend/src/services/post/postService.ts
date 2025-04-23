import { inject, injectable } from "tsyringe";
import IPostService from "./interface/IPostService";
import PostRepository from "../../repositories/post/postRepository";
import { IPost } from "../../interfaces/IPost";
import { IUser } from "../../interfaces/IUser";

@injectable()
class PostService implements IPostService {
    constructor(@inject("PostRepository") private postRepository: PostRepository) {}

    async addPost(post: any, user: IUser): Promise<IPost> { 
        try {
            const postData = {
                caption: post.caption,
                mediaUrl: post.mediaUrl,
                hashtags: post.hashtags,
                mediaType: post.mediaType
            };
            const savedPost = await this.postRepository.addPost(postData, user);
            return savedPost;
        } catch (error) {
            console.error('Error in PostService.addPost:', error);
            throw error;
        }
    }
    async getPost(user: IUser): Promise<IPost[]> {
        try {
            const posts = await this.postRepository.getPost(user);
            return posts;
        } catch (error) {
            console.error('Error in PostService.getPost:', error);
            throw error;
        }
    }
    
async getUsersPosts(userPartial: IUser): Promise<IPost[]> {
    try {
        
        const posts = await this.postRepository.getUsersPosts(userPartial);
        console.log(posts,"LOOOOOOOO")
        return posts;
    } catch (error) {
        console.error('Error in PostService.getUsersPosts:', error);
        throw error;
    }
}
async addLike(postId: string, userId: string) {
    return await this.postRepository.addLike(postId, userId);
}
async unLike(postId: string, userId: string) {
    return await this.postRepository.unLike(postId, userId);
}
async addComment(postId: string, userId: string, commentText: string): Promise<IPost | null> {
    return this.postRepository.addComment(postId, userId, commentText);
}
async followUser(followerId: string, userIdToFollow: string): Promise<{ message: string }> {
    try {
        console.log("Service executing...");
        return await this.postRepository.followUser(followerId, userIdToFollow);
    } catch (error) {
        console.error("Error in PostService.followUser:", error);
        throw error;
    }
}
async UnFollowUser(followerId: string, userIdToUnFollow: string): Promise<{ message: string }> {
    try {
        console.log("Service executing...");
        return await this.postRepository.UnFollowUser(followerId, userIdToUnFollow);
    } catch (error) {
        console.error("Error in PostService.followUser:", error);
        throw error;
    }
}


    
}

export default PostService;