



// import { Post, Comment, Share } from "../../types/post/post.types";
// import { api } from "../../utils/axiosInterceptor";


// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   profileImage?: string;
//   profession?: string;
//   bio?: string;
//   role?: string;
//   followers?: string[];
//   following?: string[];
// }


// interface PostFormData {
//   mediaUrl: string;
//   mediaType: 'image' | 'video';
//   caption: string;
//   hashtags: string[];
// }


// interface IPostService {
  
 
//   getUsersPosts(): Promise<Post[]>;
//   getUserById(userId: string): Promise<User>;
//   likePost(postId: string): Promise<Post>;
//   savePost(postId: string): Promise<void>;
//   addComment(postId: string, commentText: string): Promise<Post>;
//   // getPostComments(postId: string): Promise<Comment[]>;
// }

// class PostService implements IPostService {
//   async addPost(postData: PostFormData): Promise<void> {
//     try {
//       const response = await api.shared.post('/add-post', postData);
//       console.log(response, "uuuuuuuuuuu");
      
      
//       const completePost: Post = response.data.post; 
//       console.log(completePost,"kuuuuu")
     
//       console.log('Post added successfully:', response.data);
//     } catch (error) {
//       console.error('Error adding post:', error);
//       throw error; 
//     }
//   }

//   async getPost(): Promise<Post[]> {
//     try {
//         const response = await api.shared.get('/posts');
//         const posts = response.data.posts;
//         console.log('Posts fetched successfully:', posts);
//         return posts;
//     } catch (error) {
//         console.error('Error fetching posts:', error);
//         throw error;
//     }
// }
  
//   async getUsersPosts(): Promise<Post[]> {
//     try {
     
//       const response = await api.shared.get('/get-posts');
      
      
//       return response.data.posts || [];
//     } catch (error) {
//       console.error('Error fetching user posts:', error);
      
//       return [];
//     }
//   }
  
//   async getUserById(userId: string): Promise<User> {
//     try {
      
//       const response = await api.shared.get(`/users/${userId}`);
      
     
//       return response.data.user;
//     } catch (error) {
//       console.error(`Error fetching user ${userId}:`, error);
//       throw error;
//     }
//   }
  
//   async likePost(postId: string): Promise<Post> {
//     try {
  
//       const response = await api.shared.post(`/posts/${postId}/like`);
      
      
//       return response.data.post;
//     } catch (error) {
//       console.error('Error liking post:', error);
//       throw error;
//     }
//   }
  
//   async savePost(postId: string): Promise<void> {
//     try {
      
//       await api.shared.post(`/posts/${postId}/save`);
      
      
//     } catch (error) {
//       console.error('Error saving post:', error);
//       throw error;
//     }
//   }
  
//   async addComment(postId: string, commentText: string): Promise<Post> {
//     try {
     
//       const response = await api.shared.post(`/posts/${postId}/comment`, { commentText });
      
      
//       return response.data.post;
//     } catch (error) {
//       console.error('Error adding comment:', error);
//       throw error;
//     }
//   }
//   async getCurrentUser(): Promise<User> {
//     try {
      
//       const response = await api.shared.get('/current-user');
      
      
//       return response.data.user;
//     } catch (error) {
//       console.error('Error fetching current user:', error);
//       throw error;
//     }
//   }
  
//   async getPostComments(postId: string): Promise<Comment[]> {
//     try {
      
//       const response = await api.shared.get(`/posts/${postId}/comments`);
      
      
//       return response.data.comments || [];
//     } catch (error) {
//       console.error('Error fetching comments:', error);
//       throw error;
//     }
//   }
//   async followUser(userId: string): Promise<string[]> {
//     try {
//       const response = await api.shared.post('/followUser', { userId });
//       return response.data.followers; 
//     } catch (error) {
//       console.error('Error following user:', error);
//       throw error;
//     }
//   }
  
  
//   async sharePost(postId: string): Promise<Post> {
//     try {
     
//       const response = await api.shared.post(`/posts/${postId}/share`);
      
      
//       return response.data.post;
//     } catch (error) {
//       console.error('Error sharing post:', error);
//       throw error;
//     }
//   }
  
//   async getFeedPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
//     try {
     
//       const response = await api.shared.get(`/feed?page=${page}&limit=${limit}`);
      
      
//       return response.data.posts || [];
//     } catch (error) {
//       console.error('Error fetching feed:', error);
//       throw error;
//     }
//   }
  
//   async deletePost(postId: string): Promise<void> {
//     try {
      
//       await api.shared.delete(`/posts/${postId}`);
      
      
//     } catch (error) {
//       console.error('Error deleting post:', error);
//       throw error;
//     }
//   }
// }

// export default new PostService();





import { Post, Comment, Share } from "../../types/post/post.types";
import { api } from "../../utils/axiosInterceptor";

interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  profession?: string;
  bio?: string;
  role?: string;
  followers?: string[];
  following?: string[];
}

interface PostFormData {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  hashtags: string[];
}

interface IPostService {
  getUsersPosts(): Promise<Post[]>;
  getUserById(userId: string): Promise<User>;
  likePost(postId: string): Promise<Post>;
  unLikePost(postId: string): Promise<Post>;
  savePost(postId: string): Promise<void>;
  addComment(postId: string, commentText: string): Promise<Post>;
  followUser(userId: string): Promise<string[]>;
  unfollowUser(userId: string): Promise<string[]>;
  getCurrentUser(): Promise<User>;
  getPostComments(postId: string): Promise<Comment[]>;
  sharePost(postId: string): Promise<Post>;
  getFeedPosts(page: number, limit: number): Promise<Post[]>;
  deletePost(postId: string): Promise<void>;
}

class PostService implements IPostService {
  async addPost(postData: PostFormData): Promise<void> {
    try {
      const response = await api.shared.post('/add-post', postData);
      console.log('Post added successfully:', response.data);
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  }

  async getPost(): Promise<Post[]> {
    try {
      const response = await api.shared.get('/posts');
      console.log('Posts fetched successfully:', response.data.posts);
      return response.data.posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getUsersPosts(): Promise<Post[]> {
    try {
      const response = await api.shared.get('/get-posts');
      return response.data.posts || [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await api.shared.get(`/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

  async likePost(postId: string): Promise<Post> {
    try {
      const response = await api.shared.post(`/posts/${postId}/like`);
      return response.data.post;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unLikePost(postId: string): Promise<Post> {
    try {
      const response = await api.shared.post(`/posts/${postId}/unlike`);
      return response.data.post;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  async savePost(postId: string): Promise<void> {
    try {
      await api.shared.post(`/posts/${postId}/save`);
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  }

  async addComment(postId: string, commentText: string): Promise<Post> {
    try {
      const response = await api.shared.post(`/posts/${postId}/comment`, { commentText });
      return response.data.post;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.shared.get('/current-user');
      return response.data.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async getPostComments(postId: string): Promise<Comment[]> {
    try {
      const response = await api.shared.get(`/posts/${postId}/comments`);
      return response.data.comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async followUser(userId: string): Promise<string[]> {
    try {
      const response = await api.shared.post('/followUser', { userId });
      return response.data.followers;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(userId: string): Promise<string[]> {
    try {
      const response = await api.shared.post('/unfollowUser', { userId });
      return response.data.followers;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async sharePost(postId: string): Promise<Post> {
    try {
      const response = await api.shared.post(`/posts/${postId}/share`);
      return response.data.post;
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }

  async getFeedPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
    try {
      const response = await api.shared.get(`/feed?page=${page}&limit=${limit}`);
      return response.data.posts || [];
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await api.shared.delete(`/posts/${postId}`);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
  async getPostByUserId(userId: string): Promise<Post[]> {
    try {
      const response = await api.shared.get(`/posts/user/${userId}`);
      return response.data.posts || [];
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
      throw error;
    }
  }
}

export default new PostService();