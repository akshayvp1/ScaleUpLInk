import {
  Post,
  Comment,
  Share,
} from "../../types/post/post.types";

import { api } from "../../utils/axiosInterceptor";

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  profession?: string;
  bio?: string;
  role?: string;
  savedPost?: string[];
}

interface PostFormData {
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string;
  hashtags: string[];
}

interface SavePostResult {
  saved: boolean;
  savedPost: string[];
}

interface LikeResult {
  liked: boolean;
  totalLikes: number;
}

export interface ShareDetails {
  post: Post;
  share: Share | null;
  totalShareCount: number;
}


// ============================================================
// CONNECTION TYPES
// ============================================================

export type ConnectionStatus =
  | "none"
  | "pending"
  | "accepted"
  | "rejected";

export interface ConnectionStatusResult {
  status: ConnectionStatus;

  connectionId?: string;

  isRequester?: boolean;
}

export interface ConnectionUser {
  _id: string;
  name: string;
  profileImage?: string;
  profession?: string;
}

export interface ConnectionRecord {
  _id: string;

  requester: ConnectionUser;

  recipient: ConnectionUser;

  status: ConnectionStatus;

  createdAt: string;

  updatedAt: string;
}


// ============================================================
// HELPER
// ============================================================

/**
 * Makes sure we always send the MongoDB connection ID
 * instead of accidentally sending the complete connection object.
 */
const getConnectionId = (
  connection:
    | string
    | ConnectionRecord
    | { _id?: string }
): string => {
  if (typeof connection === "string") {
    return connection;
  }

  if (
    connection &&
    typeof connection === "object" &&
    typeof connection._id === "string"
  ) {
    return connection._id;
  }

  throw new Error(
    "Invalid connection ID"
  );
};


// ============================================================
// POST SERVICE
// ============================================================

class PostService {

  // ============================================================
  // POSTS
  // ============================================================

  async addPost(
    postData: PostFormData
  ): Promise<void> {
    await api.shared.post(
      "/add-post",
      postData
    );
  }


  async getUsersPosts(): Promise<Post[]> {
    try {
      const response =
        await api.shared.get(
          "/get-posts"
        );

      return response.data.posts || [];
    } catch (error) {
      console.error(
        "Error fetching user posts:",
        error
      );

      return [];
    }
  }


  async getUserById(
    userId: string
  ): Promise<User> {
    const response =
      await api.shared.get(
        `/users/${userId}`
      );

    return response.data.user;
  }


  // ============================================================
  // LIKE
  // ============================================================

  async likePost(
    postId: string
  ): Promise<LikeResult> {
    const response =
      await api.shared.post(
        `/posts/${postId}/like`
      );

    return response.data.post;
  }


  async unLikePost(
    postId: string
  ): Promise<LikeResult> {
    const response =
      await api.shared.post(
        `/posts/${postId}/unlike`
      );

    return response.data.post;
  }


  // ============================================================
  // SAVE
  // ============================================================

  async savePost(
    postId: string
  ): Promise<SavePostResult> {
    const response =
      await api.shared.post(
        `/posts/${postId}/save`
      );

    return {
      saved:
        response.data.saved,

      savedPost:
        response.data.savedPost,
    };
  }


  // ============================================================
  // COMMENTS
  // ============================================================

  async addComment(
    postId: string,
    commentText: string
  ): Promise<Comment> {
    const response =
      await api.shared.post(
        `/posts/${postId}/comment`,
        {
          commentText,
        }
      );

    return response.data.post;
  }


  async getComments(
    postId: string
  ): Promise<Comment[]> {
    const response =
      await api.shared.get(
        `/posts/${postId}/comments`
      );

    return response.data.comments || [];
  }


  // ============================================================
  // CURRENT USER
  // ============================================================

  async getCurrentUser(): Promise<User> {
    const response =
      await api.shared.get(
        "/current-user"
      );

    return response.data.user;
  }


  // ============================================================
  // CONNECTIONS
  // ============================================================

  /**
   * Send connection request.
   *
   * POST /connections/request
   */
  async sendConnectionRequest(
    userId: string
  ): Promise<ConnectionRecord> {

    const response =
      await api.shared.post(
        "/connections/request",
        {
          userId,
        }
      );

    return response.data.data;
  }


  /**
   * Accept / reject connection request.
   *
   * POST /connections/:connectionId/respond
   *
   * IMPORTANT:
   * This accepts either:
   *
   * respondToConnectionRequest("abc123", true)
   *
   * OR accidentally:
   *
   * respondToConnectionRequest(connectionObject, true)
   *
   * and always sends only the actual _id.
   */
  async respondToConnectionRequest(
    connection:
      | string
      | ConnectionRecord
      | { _id?: string },

    accept: boolean
  ): Promise<ConnectionRecord> {

    const connectionId =
      getConnectionId(connection);

    console.log(
      "Responding to connection:",
      {
        connectionId,
        accept,
      }
    );

    const response =
      await api.shared.post(
        `/connections/${encodeURIComponent(
          connectionId
        )}/respond`,
        {
          accept,
        }
      );

    return response.data.data;
  }


  /**
   * Cancel pending request.
   *
   * POST /connections/:connectionId/cancel
   */
  async cancelConnectionRequest(
    connection:
      | string
      | ConnectionRecord
      | { _id?: string }
  ): Promise<void> {

    const connectionId =
      getConnectionId(connection);

    await api.shared.post(
      `/connections/${encodeURIComponent(
        connectionId
      )}/cancel`
    );
  }


  /**
   * Remove an accepted connection.
   *
   * DELETE /connections/:userId
   */
  async removeConnection(
    userId: string
  ): Promise<void> {

    await api.shared.delete(
      `/connections/${encodeURIComponent(
        userId
      )}`
    );
  }


  /**
   * Get connection status with another user.
   *
   * GET /connections/status/:userId
   */
  async getConnectionStatus(
  userId: string
): Promise<ConnectionStatusResult> {
  const response = await api.shared.get(
    `/connections/status/${encodeURIComponent(userId)}`
  );

  const data = response.data.data;

  return {
    status: data?.status || "none",
    connectionId:
      typeof data?.connectionId === "object"
        ? data.connectionId?._id
        : data?.connectionId,
    isRequester: data?.isRequester,
  };
}


  /**
   * Get pending connection requests.
   *
   * GET /connections/pending
   */
  async getPendingConnectionRequests(): Promise<
    ConnectionRecord[]
  > {

    const response =
      await api.shared.get(
        "/connections/pending"
      );

    return (
      response.data.data || []
    );
  }


  /**
   * Get current user's accepted connections.
   *
   * GET /connections
   */
  async getConnections(): Promise<
    ConnectionRecord[]
  > {

    const response =
      await api.shared.get(
        "/connections"
      );

    return (
      response.data.data || []
    );
  }


  /**
   * Get accepted connections for another user.
   *
   * GET /connections/list/:userId
   */
  async getConnectionsForUser(
    userId: string
  ): Promise<ConnectionRecord[]> {

    const response =
      await api.shared.get(
        `/connections/list/${encodeURIComponent(
          userId
        )}`
      );

    return (
      response.data.data || []
    );
  }


  // ============================================================
  // SHARE
  // ============================================================

  async sharePost(
    postId: string
  ): Promise<{
    totalShare: number;
  }> {

    const response =
      await api.shared.post(
        `/posts/${postId}/share`
      );

    return response.data.post;
  }


  async shareToUsers(
    postId: string,
    userIds: string[]
  ): Promise<{
    totalShare: number;
  }> {

    const response =
      await api.shared.post(
        `/posts/${postId}/share-to-users`,
        {
          userIds,
        }
      );

    return response.data.post;
  }


  // ============================================================
  // FEED
  // ============================================================

  async getFeedPosts(
    page = 1,
    limit = 10
  ): Promise<Post[]> {

    const response =
      await api.shared.get(
        `/feed?page=${page}&limit=${limit}`
      );

    return (
      response.data.posts || []
    );
  }


  // ============================================================
  // DELETE POST
  // ============================================================

  async deletePost(
    postId: string
  ): Promise<void> {

    await api.shared.delete(
      `/posts/${postId}`
    );
  }


  // ============================================================
  // USER POSTS
  // ============================================================

  async getPostByUserId(
    userId: string
  ): Promise<Post[]> {

    const response =
      await api.shared.get(
        `/posts/user/${userId}`
      );

    return (
      response.data.posts || []
    );
  }


  // ============================================================
  // SHARE DETAILS
  // ============================================================

  async getShareDetails(
    postId: string,
    sharedBy?: string
  ): Promise<ShareDetails> {

    const response =
      await api.shared.get(
        `/posts/${postId}/share-details`,
        {
          params: sharedBy
            ? { sharedBy }
            : undefined,
        }
      );

    return response.data;
  }
}


export default new PostService();