// import { Request, Response } from "express";
// import { inject, injectable } from "tsyringe";
// import { IPostController } from "./interface/IPostController";
// import PostService from "../../services/post/postService";
// import { IUser } from "../../interfaces/IUser";
// import { ITokenPayload } from "../../utils/jwt";
// import mongoose from 'mongoose';

// @injectable()
// class PostController implements IPostController {
//     constructor(@inject("PostService") private postService: PostService) {}

//     async addPost(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
//         const post = req.body;
//         const tokenUser = req.user;

//         console.log(post, "posttttt");
//         console.log(tokenUser, "userrrrr");

//         try {
//             if (!tokenUser) {
//                 res.status(401).json({ message: "User not authenticated" });
//                 return;
//             }

//             const user: Partial<IUser> = {
//                 _id: new mongoose.Types.ObjectId(tokenUser.id),
//                 email: tokenUser.email,
//                 role: tokenUser.role
//             };

//             const savedPost = await this.postService.addPost(post, user as IUser);
//             res.status(201).json({
//                 message: "Post added successfully",
//                 post: savedPost
//             });
//         } catch (error) {
//             console.error('Error in PostController.addPost:', error);
//             res.status(500).json({
//                 message: "Failed to add post",
//                 error: error instanceof Error ? error.message : "Unknown error"
//             });
//         }
//     }
//     async getPost(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
//         try {
//             const tokenUser = req.user;

//             if (!tokenUser) {
//                 res.status(401).json({ message: "User not authenticated" });
//                 return;
//             }

//             const user: Partial<IUser> = {
//                 _id: new mongoose.Types.ObjectId(tokenUser.id),
//                 email: tokenUser.email,
//                 role: tokenUser.role
//             };

//             const posts = await this.postService.getPost(user as IUser);
            
//             if (!posts || posts.length === 0) {
//                 res.status(200).json({
//                     message: "No posts found for this user",
//                     posts: []
//                 });
//                 return;
//             }

//             res.status(200).json({
//                 message: "Posts retrieved successfully",
//                 post: posts
//             });
//         } catch (error) {
//             console.error('Error in PostController.getPost:', error);
//             res.status(500).json({
//                 message: "Failed to retrieve posts",
//                 error: error instanceof Error ? error.message : "Unknown error"
//             });
//         }
//     }

// }

// export default PostController;



import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IPostController } from "./interface/IPostController";
import PostService from "../../services/post/postService";
import { IUser } from "../../interfaces/IUser";
import { ITokenPayload } from "../../utils/jwt";
import mongoose from 'mongoose';

@injectable()
class PostController implements IPostController {
    constructor(
        @inject("PostService") private postService: PostService
) {}

    async addPost(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
        const post = req.body;
        const tokenUser = req.user;

        console.log(post, "posttttt");
        console.log(tokenUser, "userrrrr");

        try {
            if (!tokenUser) {
                res.status(401).json({ message: "User not authenticated" });
                return;
            }

            const user: Partial<IUser> = {
                _id: new mongoose.Types.ObjectId(tokenUser.id),
                email: tokenUser.email,
                role: tokenUser.role
            };

            const savedPost = await this.postService.addPost(post, user as IUser);
            res.status(201).json({
                message: "Post added successfully",
                post: savedPost
            });
        } catch (error) {
            console.error('Error in PostController.addPost:', error);
            res.status(500).json({
                message: "Failed to add post",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    async getPost(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
        try {
            const tokenUser = req.user;

            if (!tokenUser) {
                res.status(401).json({ message: "User not authenticated" });
                return;
            }

            const user: Partial<IUser> = {
                _id: new mongoose.Types.ObjectId(tokenUser.id),
                email: tokenUser.email,
                role: tokenUser.role
            };

            const posts = await this.postService.getPost(user as IUser);
            
            if (!posts || posts.length === 0) {
                res.status(200).json({
                    message: "No posts found for this user",
                    posts: []
                });
                return;
            }

            res.status(200).json({
                message: "Posts retrieved successfully",
                posts: posts 
            });
        } catch (error) {
            console.error('Error in PostController.getPost:', error);
            res.status(500).json({
                message: "Failed to retrieve posts",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }
    async getUserPosts(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
        console.log("oooooo")
        try {
            const tokenUser = req.user;
             console.log("aaaaa")
            if (!tokenUser) {
                res.status(401).json({ message: "User not authenticated" });
                return;
            }
    
            const user: Partial<IUser> = {
                _id: new mongoose.Types.ObjectId(tokenUser.id),
                email: tokenUser.email,
                role: tokenUser.role
            };
               console.log("bbbbbbb")
            const posts = await this.postService.getUsersPosts(user as IUser);

            console.log(posts,"edaaaaaaa")
            
            if (!posts || posts.length === 0) {
                res.status(200).json({
                    message: "No posts found matching your interests",
                    posts: []
                });
                return;
            }
    
            res.status(200).json({
                message: "Posts retrieved successfully",
                posts: posts 
            });
        } catch (error) {
            console.error('Error in PostController.getUserPosts:', error);
            res.status(500).json({
                message: "An error occurred while retrieving posts",
                error: error instanceof Error ? error.message : "Unknown error"
            });
        }
    }

    async addLike(req: Request & { user?: { id: string } }, res: Response): Promise<void> {
        try {
            const { postId } = req.params;
            const userId = req.user?.id;
    
            if (!userId) {
                res.status(401).json({ message: "User not authenticated" });
                return;
            }
    
            const likedPost = await this.postService.addLike(postId as string, userId);
    
            res.status(200).json({ message: "Post liked successfully", post: likedPost });
        } catch (error) {
            console.error("Error liking post:", error);
            res.status(400).json({ message: error instanceof Error ? error.message : "An error occurred" });
        }
    }
    async addComment(req: Request & { user?: { id: string } }, res: Response): Promise<void> {
        try {
            const  {postId}  = req.params;
            const  {commentText}  = req.body;
            const userId = req.user?.id; 

            if (!userId) {
                 res.status(401).json({ message: "User not authenticated" });
            }

            const updatedPost = await this.postService.addComment(postId as string , userId as string , commentText as string );

            res.status(200).json({ message: "Comment added successfully", post: updatedPost });
        } catch (error) {
            console.error("Error adding comment:", error);
            res.status(500).json({ message: "An error occurred while adding the comment" });
        }
}
async followUser(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
    try {
        console.log("Controller executing...");

        const { userId: userIdToFollow } = req.body; 
        const loggedInUserId = req.user?.id; 

        console.log(userIdToFollow, "userIdToFollow");
        console.log(loggedInUserId, "loggedInUserId");

        if (!loggedInUserId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        if (!userIdToFollow || loggedInUserId === userIdToFollow) {
            res.status(400).json({ message: "Invalid user to follow" });
            return;
        }

        // Call the service to handle the follow action
        const result = await this.postService.followUser(loggedInUserId, userIdToFollow);
        console.log(result, "Follow action result");

        res.status(200).json({
            message: "User followed successfully",
            data: result
        });
    } catch (error) {
        console.error("Error in followUser:", error);
        res.status(500).json({ message: "An error occurred while following the user" });
    }
}


}

export default PostController;