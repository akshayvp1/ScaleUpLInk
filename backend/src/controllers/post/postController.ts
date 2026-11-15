import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { Server } from "socket.io";
import { IPostController } from "./interface/IPostController";
import PostService from "../../services/post/postService";
import NotificationService from "../../services/notification/notificationService";
import ChatService from "../../services/chat/chatService";
import { AddPostInput } from "../../repositories/post/postRepository";
import { IUser } from "../../interfaces/IUser";
import { ITokenPayload } from "../../utils/jwt";
import mongoose from 'mongoose';

@injectable()
class PostController implements IPostController {
    constructor(
        @inject("PostService") private postService: PostService,
        @inject("NotificationService") private notificationService: NotificationService,
        @inject("ChatService") private chatService: ChatService
) {}

    async addPost(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
        const post = req.body as AddPostInput;
        const tokenUser = req.user;

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

    async addLike(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
    try {
        const { postId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const likedPost = await this.postService.addLike(postId as string, userId);

        // Only notify on a genuinely new like, not a duplicate tap
        if ((likedPost as any).isNewLike) {
            const ownerId = await this.postService.getPostOwnerId(postId as string);
            if (ownerId) {
                this.notificationService
                    .notifyLike(userId, ownerId, postId as string)
                    .catch((err) => console.error("notifyLike failed:", err));
            }
        }

        res.status(200).json({ message: "Post liked successfully", post: likedPost });
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(400).json({ message: error instanceof Error ? error.message : "An error occurred" });
    }
}
    async unLike(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
        try {
            const { postId } = req.params;
            const userId = req.user?.id;
    
            if (!userId) {
                res.status(401).json({ message: "User not authenticated" });
                return;
            }
    
            const likedPost = await this.postService.unLike(postId as string, userId);
    
            res.status(200).json({ message: "Post unliked successfully", post: likedPost });
        } catch (error) {
            console.error("Error unliking post:", error);
            res.status(400).json({ message: error instanceof Error ? error.message : "An error occurred" });
        }
    }
    async addComment(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
    try {
        const { postId } = req.params;
        const { commentText } = req.body;
        const userId = req.user?.id;

        if (!userId) {
             res.status(401).json({ message: "User not authenticated" });
             return;
        }

        const updatedPost = await this.postService.addComment(postId as string, userId, commentText as string);

        const ownerId = await this.postService.getPostOwnerId(postId as string);
        if (ownerId) {
            this.notificationService
                .notifyComment(userId, ownerId, postId as string)
                .catch((err) => console.error("notifyComment failed:", err));
        }

        res.status(200).json({ message: "Comment added successfully", post: updatedPost });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "An error occurred while adding the comment" });
    }
}
// async followUser(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
//     try {
//         const { userId: userIdToFollow } = req.body;
//         const loggedInUserId = req.user?.id;
//         if (!loggedInUserId) {
//             res.status(401).json({ message: "User not authenticated" });
//             return;
//         }

//         if (!userIdToFollow || loggedInUserId === userIdToFollow) {
//             res.status(400).json({ message: "Invalid user to follow" });
//             return;
//         }

//         const result = await this.postService.followUser(loggedInUserId, userIdToFollow);
//         console.log(result, "Follow action result");

//         // Only notify on an actual new follow, not "Already following this user"
//         if (result.message === "Followed successfully") {
//             this.notificationService
//                 .notifyFollow(loggedInUserId, userIdToFollow)
//                 .catch((err) => console.error("notifyFollow failed:", err));
//         }

//         res.status(200).json({
//             message: "User followed successfully",
//             data: result
//         });
//     } catch (error) {
//         console.error("Error in followUser:", error);
//         res.status(500).json({ message: "An error occurred while following the user" });
//     }
// }
// async unFollowUser(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
//     try {
       
//         const { userId: userIdToUnFollow } = req.body; 
//         const loggedInUserId = req.user?.id; 
//         if (!loggedInUserId) {
//             res.status(401).json({ message: "User not authenticated" });
//             return;
//         }

//         if (!userIdToUnFollow || loggedInUserId === userIdToUnFollow) {
//             res.status(400).json({ message: "Invalid user to follow" });
//             return;
//         }

//         const result = await this.postService.UnFollowUser(loggedInUserId, userIdToUnFollow);
//         console.log(result, "UnFollow action result");

//         res.status(200).json({
//             message: "User Unfollowed successfully",
//             data: result
//         });
//     } catch (error) {
//         console.error("Error in followUser:", error);
//         res.status(500).json({ message: "An error occurred while following the user" });
//     }
// }
async getPostsByUserId(req: Request & { user?: ITokenPayload }, res: Response): Promise<void> {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;
    if (!userId || !requestingUserId) {
      res.status(400).json({ message: "userId is required" });
      return;
    }
    const posts = await this.postService.getPostsByUserId(userId as string, requestingUserId);
    res.status(200).json({ message: "Posts retrieved successfully", posts });
  } catch (error) {
    console.error('Error in PostController.getPostsByUserId:', error);
    res.status(500).json({ message: "Failed to retrieve posts", error: error instanceof Error ? error.message : "Unknown error" });
  }
}

    savePost = async (req: Request & { user?: ITokenPayload }, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await this.postService.savePost(userId, postId as string);
      res.status(200).json({
        message: result.saved ? 'Post saved' : 'Post removed from saved',
        ...result
      });
    } catch (error) {
      console.error('Error saving post:', error);
      res.status(500).json({ message: 'Failed to save post' });
    }
  };

  sharePost = async (req: Request & { user?: ITokenPayload }, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const post = await this.postService.sharePost(userId, postId as string);
      res.status(200).json({ message: 'Post shared', post });
    } catch (error) {
      console.error('Error sharing post:', error);
      res.status(500).json({ message: 'Failed to share post' });
    }
  };

  // Shares the post to specific people from the sender's own network
  // (their followers/following, chosen in the "Share to" picker on the
  // frontend). Reuses the existing sharePost/addShare flow so totalShare
  // and the shares[] audit trail on the post stay consistent with the
  // plain "share" button, then fans out one notification per recipient.
  //
  // NOTE: for now this only creates a Notification document (bell icon).
  // A follow-up iteration will additionally deliver this as a chat message
  // through the existing socket-based chat system — that's a separate,
  // larger change (needs a conversation/thread to attach the shared post
  // to) and isn't part of this endpoint.
  shareToUsers = async (req: Request & { user?: ITokenPayload }, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;
      const { userIds } = req.body as { userIds?: string[] };
      const senderId = req.user?.id;

      if (!senderId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      if (!postId) {
        res.status(400).json({ message: 'postId is required' });
        return;
      }
      if (!Array.isArray(userIds) || userIds.length === 0) {
        res.status(400).json({ message: 'Select at least one person to share with' });
        return;
      }

      const post = await this.postService.sharePost(senderId, postId as string);
      await this.notificationService.notifyPostShare(senderId, userIds, postId as string);

      // Deliver the shared post into each recipient's chat history when the
      // two users are connected. Notifications above remain for everyone so
      // the existing share flow keeps working for non-chat recipients.
      const io = req.app.get("io") as Server | undefined;

      await Promise.all(
        userIds.map(async (receiverId) => {
          try {
            const saved = await this.chatService.saveMessage(
              senderId,
              receiverId,
              {
                text: "",
                type: "post",
                postId: postId as string,
              }
            );

            if (!io) return;

            const payload = {
              _id: saved._id.toString(),
              senderId,
              receiverId,
              text: saved.text,
              type: saved.type ?? "post",
              postId: saved.postId,
              postContent: saved.postContent,
              postMedia: saved.postMedia,
              postAuthorName: saved.postAuthorName,
              seen: false,
              createdAt: saved.createdAt,
            };

            io.to(receiverId).emit("receive_message", payload);
            io.to(senderId).emit("message_sent", payload);
          } catch (error) {
            if (
              !(error instanceof Error) ||
              error.message !== "NOT_CONNECTED"
            ) {
              console.error("Failed to share post in chat:", error);
            }
          }
        })
      );

      res.status(200).json({ message: 'Post shared', post });
    } catch (error) {
      console.error('Error sharing post to users:', error);
      res.status(500).json({ message: 'Failed to share post' });
    }
  };

  deletePost = async (req: Request & { user?: ITokenPayload }, res: Response): Promise<void> => {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await this.postService.deletePost(userId, postId as string);
      res.status(200).json({ message: 'Post deleted' });
    } catch (error: unknown) {
      console.error('Error deleting post:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'FORBIDDEN') {
        res.status(403).json({ message: 'You can only delete your own posts' });
        return;
      }
      if (message === 'NOT_FOUND') {
        res.status(404).json({ message: 'Post not found' });
        return;
      }
      res.status(500).json({ message: 'Failed to delete post' });
    }
  };
async getShareDetails(req: Request, res: Response): Promise<void> {
  try {
    const { postId } = req.params;
    const { sharedBy } = req.query as { sharedBy?: string };

    const result = await this.postService.getShareDetails(postId as string, sharedBy);

    if (!result) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching share details:", error);
    res.status(500).json({ message: "Failed to fetch share details" });
  }
}
async getComments(req: Request, res: Response): Promise<void> {
  try {
    const { postId } = req.params;
    const comments = await this.postService.getComments(postId as string);
    res.status(200).json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
}


}

export default PostController;