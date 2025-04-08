// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { Types } from "mongoose";
// import { Comment, Post, PostState } from "../../../types/post/post.types";

// // Initial State
// const initialState: PostState = {
//   posts: [] as Post[],
//   currentPost: null,
//   status: "idle",
//   error: null,
// };

// // Post Slice
// const postSlice = createSlice({
//   name: "posts",
//   initialState,
//   reducers: {
//     // Fetch Posts
//     fetchPostsStart: (state) => {
//       state.status = "loading";
//       state.error = null;
//     },
//     fetchPostsSuccess: (state, action: PayloadAction<Post[]>) => {
//       state.status = "succeeded";
//       state.posts = action.payload;
//     },
//     fetchPostsFailure: (state, action: PayloadAction<string>) => {
//       state.status = "failed";
//       state.error = action.payload;
//     },

//     createPost: (state, action: PayloadAction<Post>) => {
//       console.log("Before update:", state.posts);
    
//       if (!Array.isArray(state.posts)) {
//         state.posts = []; // Ensure state.posts is an array
//       }
    
//       state.posts.push(action.payload); // ✅ Immer handles mutation
//       state.currentPost = action.payload;
    
//       console.log("After update:", state.posts);
//     },
    

//     // Update Post
//     updatePost: (state, action: PayloadAction<Post>) => {
//       const index = state.posts.findIndex(
//         (post) => post._id === action.payload._id
//       );
//       if (index !== -1) {
//         state.posts[index] = action.payload;
//         state.currentPost = action.payload;
//       }
//     },

//     // Delete Post
//     deletePost: (state, action: PayloadAction<string>) => {
//       state.posts = state.posts.filter((post) => post._id !== action.payload);
//       state.currentPost = null;
//     },

//     // Add Comment
//     addComment: (
//       state,
//       action: PayloadAction<{
//         postId: string;
//         userId: string;
//         commentText: string;
//       }>
//     ) => {
//       const postIndex = state.posts.findIndex(
//         (post) => post._id === action.payload.postId
//       );
//       if (postIndex !== -1) {
//         const updatedPost = { ...state.posts[postIndex] };
//         const newComment: Comment = {
//           _id: new Types.ObjectId().toString(),
//           userId: action.payload.userId,
//           commentText: action.payload.commentText,
//           createdAt: new Date(),
//         };

//         updatedPost.comments.push(newComment);

//         state.posts[postIndex] = updatedPost;

//         if (state.currentPost?._id === action.payload.postId) {
//           state.currentPost = updatedPost;
//         }
//       }
//     },

//     // Like Post
//     likePost: (
//       state,
//       action: PayloadAction<{
//         postId: string;
//         userId: string;
//       }>
//     ) => {
//       const postIndex = state.posts.findIndex(
//         (post) => post._id === action.payload.postId
//       );
//       if (postIndex !== -1) {
//         const updatedPost = { ...state.posts[postIndex] };

//         // Check if user already liked the post
//         const userIndex = updatedPost.likes.indexOf(action.payload.userId);
//         if (userIndex === -1) {
//           updatedPost.likes.push(action.payload.userId);
//           updatedPost.totalLikes = updatedPost.likes.length;
//         } else {
//           updatedPost.likes.splice(userIndex, 1);
//           updatedPost.totalLikes = updatedPost.likes.length;
//         }

//         state.posts[postIndex] = updatedPost;

//         if (state.currentPost?._id === action.payload.postId) {
//           state.currentPost = updatedPost;
//         }
//       }
//     },

//     // Set Current Post
//     setCurrentPost: (state, action: PayloadAction<Post | null>) => {
//       state.currentPost = action.payload;
//     },

//     // Clear Error
//     clearError: (state) => {
//       state.error = null;
//     },
//   },
// });

// // Export actions and reducer
// export const {
//   fetchPostsStart,
//   fetchPostsSuccess,
//   fetchPostsFailure,
//   createPost,
//   updatePost,
//   deletePost,
//   addComment,
//   likePost,
//   setCurrentPost,
//   clearError,
// } = postSlice.actions;

// export default postSlice.reducer;
