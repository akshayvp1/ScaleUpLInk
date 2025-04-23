import { injectable, inject } from "tsyringe";
import { IPost } from "../../interfaces/IPost";
import { IUser } from "../../interfaces/IUser";
import { Post } from "../../models/postModel";
import { IPostRepository } from "./interface/IPostRepository";
import UserModel from "../../models/userModel";
import mongoose from "mongoose";

@injectable()
class PostRepository implements IPostRepository {
    constructor(@inject("PostModel") private readonly postModel: typeof Post) {}

    async addPost(post: any, user: IUser): Promise<IPost> {
        try {
            const newPost = new this.postModel({
                userid: user._id,
                content: post.caption,
                media: post.mediaUrl ? [post.mediaUrl] : [],
                postTag: post.hashtags || [],
            });
            
            const savedPost = await newPost.save();
            return savedPost;
        } catch (error) {
            throw error;
        }
    }
    
    async getPost(user: IUser): Promise<IPost[]> {
        try {
            const posts = await this.postModel
                .find({ userid: user._id })
                .sort({ createdAt: -1 })
                .populate('userid', 'name profileImage followers following')
                .populate({
                    path: 'comments.userId',
                    select: 'name profileImage'
                })
                .exec();
            return posts;
        } catch (error) {
            console.error('Error in PostRepository.getPost:', error);
            throw error;
        }
    }
    async getUsersPosts(user: IUser): Promise<IPost[]> {
        try {
            console.log(`🔍 Fetching posts for user: ${user._id}`);
    
            const completeUser = await UserModel.findById(user._id)
                .select("interests")
                .lean<{ interests?: string[] }>();
    
            if (!completeUser?.interests?.length) {
                console.log("⚠️ No interests found. Returning empty posts.");
                return [];
            }
    
            
            const userInterests = completeUser.interests.map(interest =>
                interest.startsWith("#") ? interest.toLowerCase() : `#${interest.toLowerCase()}`
            );
    
            console.log("✅ Normalized interests:", userInterests);
    
            const posts = await this.postModel
                .find({ postTag: { $elemMatch: { $in: userInterests } } }) 
                .sort({ createdAt: 1 })
                .lean()
                .hint({ postTag: 1 })
                .exec();
    
            console.log(`📌 Found ${posts.length} matching posts.`);
            return posts;
        } catch (error) {
            console.error("❌ Error fetching user posts:", error);
            throw new Error("Failed to fetch posts based on user interests.");
        }
    }
   

    async addLike(postId: string, userId: string) {
        const post = await this.postModel.findById(new mongoose.Types.ObjectId(postId));
    
        if (!post) return null; 
    
        const userObjectId = new mongoose.Types.ObjectId(userId);
    
        if (post.likes.some((id) => id.equals(userObjectId))) {
            return post; 
        }
    
        post.likes.push(userObjectId); 
        await post.save();
    
        return post;
    }
    
async unLike(postId: string, userId: string) {
    const post = await this.postModel.findById(new mongoose.Types.ObjectId(postId));
  
    if (!post) return null;
  
    const userObjectId = new mongoose.Types.ObjectId(userId);
  
    if (post.likes.some((id) => id.equals(userObjectId))) {
      post.likes = post.likes.filter((id) => !id.equals(userObjectId));
      await post.save();
    }
  
    return post;
  }
      
    async addComment(postId: string, userId: string, commentText: string): Promise<IPost | null> {
        const post = await Post.findById(postId);
    
        if (!post) return null; 
    
        const newComment = {
            _id: new mongoose.Types.ObjectId(),
            userId: new mongoose.Types.ObjectId(userId),
            commentText,
            createdAt: new Date(),
        };
    
        post.comments.push(newComment); 
        await post.save(); 
    
        return post;
    }
    
    async followUser(followerId: string, userIdToFollow: string): Promise<{ message: string }> {
        try {
            console.log("Executing followUser...");
    
            const followerObjectId = new mongoose.Types.ObjectId(followerId);
            const userToFollowObjectId = new mongoose.Types.ObjectId(userIdToFollow);
    
            // Ensure both users exist
            const follower = await UserModel.findById(followerObjectId);
            const userToFollow = await UserModel.findById(userToFollowObjectId);
    
            if (!follower || !userToFollow) {
                return { message: "One or both users not found" };
            }
    
            if (follower.following.some(id => id.equals(userToFollowObjectId))) {
                return { message: "Already following this user" };
            }
    
            await UserModel.findByIdAndUpdate(followerObjectId, {
                $addToSet: { following: userToFollowObjectId }
            });
    
            await UserModel.findByIdAndUpdate(userToFollowObjectId, {
                $addToSet: { followers: followerObjectId }
            });
    
            return { message: "Followed successfully" };
        } catch (error) {
            console.error("Error in followUser:", error);
            throw error;
        }
}
async UnFollowUser(followerId: string, userIdToUnFollow: string): Promise<{ message: string }> {
    try {
        console.log("Executing UnFollowUser...");

        const followerObjectId = new mongoose.Types.ObjectId(followerId);
        const userToUnFollowObjectId = new mongoose.Types.ObjectId(userIdToUnFollow);

        // Ensure both users exist
        const follower = await UserModel.findById(followerObjectId);
        const userToUnFollow = await UserModel.findById(userToUnFollowObjectId);

        if (!follower || !userToUnFollow) {
            return { message: "One or both users not found" };
        }

        if (!follower.following.some(id => id.equals(userToUnFollowObjectId))) {
            return { message: "You are not following this user" };
        }

        // Remove from following and followers
        await UserModel.findByIdAndUpdate(followerObjectId, {
            $pull: { following: userToUnFollowObjectId }
        });

        await UserModel.findByIdAndUpdate(userToUnFollowObjectId, {
            $pull: { followers: followerObjectId }
        });

        return { message: "Unfollowed successfully" };
    } catch (error) {
        console.error("Error in UnFollowUser:", error);
        throw error;
    }
}

}


export default PostRepository;