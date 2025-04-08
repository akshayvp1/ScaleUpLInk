

// import React, { useState, useRef, useEffect } from 'react';
// import { Heart, MessageCircle, Send, Bookmark, X, UserPlus } from 'lucide-react';
// import postService from '../../services/post/postService';

// // Interfaces (unchanged)
// interface IUser {
//   _id: string;
//   name: string;
//   email: string;
//   contactNumber?: string;
//   profileImage?: string;
//   profession?: string;
//   bio?: string;
//   role?: "entrepreneur" | "investor";
//   isPremium?: boolean;
//   followers?: string[];
//   following?: string[];
//   savedPost?: string[];
//   interests?: string[];
// }

// interface Comment {
//   _id: string;
//   userId: string;
//   userName?: string;
//   userImage?: string;
//   commentText: string;
//   createdAt: Date;
// }

// interface IPost {
//   _id: string;
//   userid: string;
//   content: string;
//   media?: string[];
//   likes: string[];
//   comments: Comment[];
//   totalShare: number;
//   totalLikes: number;
//   engagementScore: number;
//   postTag?: string[];
//   shares?: Array<{ sharedAt: Date; userid: string }>;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface PostWithUser extends Omit<IPost, 'userid'> {
//   user: IUser;
// }

// type PostCardProps = {
//   post: PostWithUser;
//   isFocused: boolean;
//   onLike: (postId: string) => void;
//   onComment: (postId: string, comment: string) => void;
//   onSave: (postId: string) => void;
//   onFollow?: (userId: string) => void;
//   currentUserId: string;
//   onClick?: () => void;
//   isFollowing?: boolean;
// };

// const SocialPost: React.FC = () => {
//   const [posts, setPosts] = useState<PostWithUser[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentUser, setCurrentUser] = useState<IUser | null>(null);
//   const [focusedIndex, setFocusedIndex] = useState(0);
//   const [following, setFollowing] = useState<Set<string>>(new Set());
//   const carouselRef = useRef<HTMLDivElement>(null);
//   const mobileScrollRef = useRef<HTMLDivElement>(null);
//   const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
//   const [dragOffset, setDragOffset] = useState(0);

//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const user = await postService.getCurrentUser();
//         setCurrentUser({
//           ...user,
//           role: (user.role === "entrepreneur" || user.role === "investor") ? user.role : undefined,
//         });
//         if (user.following) setFollowing(new Set(user.following));
//       } catch (error) {
//         console.error('Failed to load current user:', error);
//         setCurrentUser({ _id: 'default-user-id', name: 'Default User', email: 'default@example.com' });
//       }
//     };

//     const fetchUserPosts = async () => {
//       try {
//         setIsLoading(true);
//         const userPosts = await postService.getUsersPosts();
//         const postsWithUsers = await Promise.all(
//           userPosts.map(async (post) => {
//             const userData = await postService.getUserById(post.userid);
//             const enhancedComments = await Promise.all(
//               post.comments.map(async (comment) => {
//                 const commentUser = await postService.getUserById(comment.userId);
                
//                 return { ...comment, userName: commentUser.name, userImage: commentUser.profileImage };
//               })
//             );
//             return { ...post, comments: enhancedComments, user: userData } as PostWithUser;
//           })
//         );
//         setPosts(postsWithUsers);
//       } catch (error) {
//         console.error('Failed to load user posts:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCurrentUser();
//     fetchUserPosts();
//   }, []);

//   useEffect(() => {
//     const updatePosition = () => {
//       if (carouselRef.current && posts.length > 0) {
//         const cardWidth = carouselRef.current.offsetWidth / 3; // Divide by 3 for 33.33% width
//         const offset = focusedIndex * cardWidth - (carouselRef.current.offsetWidth - cardWidth) / 2 + dragOffset;
//         carouselRef.current.scrollTo({ left: offset, behavior: dragOffset ? 'auto' : 'smooth' });
//       }
//       if (mobileScrollRef.current && posts.length > 0) {
//         mobileScrollRef.current.scrollTo({ top: focusedIndex * window.innerHeight, behavior: 'smooth' });
//       }
//     };
//     updatePosition();
//     window.addEventListener('resize', updatePosition);
//     return () => window.removeEventListener('resize', updatePosition);
//   }, [focusedIndex, posts, dragOffset]);

//   const handleLikePost = async (postId: string) => {
//     try {
//       const updatedPost = await postService.likePost(postId);
//       setPosts((prev) =>
//         prev.map((p) =>
//           p._id === postId
//             ? { ...p, likes: updatedPost.likes, totalLikes: updatedPost.likes.length } // Update totalLikes based on likes array
//             : p
//         )
//       );
//     } catch (error) {
//       console.error('Failed to like post:', error);
//     }
//   };

//   const handleSavePost = async (postId: string) => {
//     await postService.savePost(postId);
//   };

//   const handleCommentPost = async (postId: string, commentText: string) => {
//     if (!commentText.trim() || !currentUser) return;
//     const updatedPost = await postService.addComment(postId, commentText);
//     setPosts((prev) =>
//       prev.map((p) =>
//         p._id === postId
//           ? {
//               ...p,
//               comments: updatedPost.comments.map((c: any) => ({
//                 ...c,
//                 userName: currentUser.name,
//                 userImage: currentUser.profileImage,
//               })),
//             }
//           : p
//       )
//     );
//   };

//   const handleFollowUser = async (userId: string) => {
//     try {
//       const isFollowing = following.has(userId);
//       await postService.followUser(userId);
//       setFollowing((prev) => {
//         const newFollowing = new Set(prev);
//         isFollowing ? newFollowing.delete(userId) : newFollowing.add(userId);
//         return newFollowing;
//       });
//     } catch (error) {
//       console.error('Failed to follow/unfollow user:', error);
//     }
//   };

//   const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
//     const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
//     const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
//     setDragStart({ x: clientX, y: clientY });
//   };

//   const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!dragStart) return;
//     const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
//     const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
//     const diffX = dragStart.x - clientX;
//     const diffY = dragStart.y - clientY;

//     if (carouselRef.current && Math.abs(diffX) > Math.abs(diffY)) {
//       e.preventDefault();
//       setDragOffset(diffX);
//     }
//   };

//   const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!dragStart) return;
//     const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
//     const diffX = dragStart.x - clientX;

//     if (Math.abs(diffX) > 50 && carouselRef.current) {
//       if (diffX > 0) {
//         // Swipe left (move forward)
//         setFocusedIndex((prev) => Math.min(prev + 1, posts.length - 1));
//       } else {
//         // Swipe right (move backward)
//         setFocusedIndex((prev) => Math.max(prev - 1, 0));
//       }
//     }
//     setDragStart(null);
//     setDragOffset(0);
//   };

//   const renderDesktopCarousel = () => (
//     <div className="hidden md:block relative max-w-5xl mx-auto px-6 py-12">
//       <div
//         ref={carouselRef}
//         className="flex overflow-x-hidden snap-x snap-mandatory"
//         onMouseDown={handleDragStart}
//         onMouseMove={handleDragMove}
//         onMouseUp={handleDragEnd}
//         onMouseLeave={handleDragEnd}
//         onTouchStart={handleDragStart}
//         onTouchMove={handleDragMove}
//         onTouchEnd={handleDragEnd}
//         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//       >
//         {posts.map((post, index) => {
//           const distance = Math.abs(index - focusedIndex);
//           const scale = distance === 0 ? 1 : 0.9 - distance * 0.05;
//           const isFollowing = following.has(post.user._id);
//           return (
//             <div
//               key={post._id}
//               className="flex-shrink-0 snap-center transition-all duration-500 ease-out"
//               style={{
//                 width: '33.33%',
//                 padding: '0 1rem',
//                 transform: `scale(${scale}) perspective(1000px) rotateY(${distance * 5}deg)`,
//                 opacity: 1 - distance * 0.2,
//                 zIndex: posts.length - distance,
//               }}
//             >
//               <PostCard
//                 post={post}
//                 isFocused={index === focusedIndex}
//                 onLike={handleLikePost}
//                 onComment={handleCommentPost}
//                 onSave={handleSavePost}
//                 onFollow={handleFollowUser}
//                 currentUserId={currentUser?._id || 'default-user-id'}
//                 onClick={() => setFocusedIndex(index)}
//                 isFollowing={isFollowing}
//               />
//             </div>
//           );
//         })}
//       </div>
//       <div className="flex justify-center mt-6 space-x-2">
//         {posts.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => setFocusedIndex(i)}
//             className={`w-2 h-2 rounded-full transition-all duration-300 ${
//               i === focusedIndex ? 'bg-indigo-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
//             }`}
//           />
//         ))}
//       </div>
//     </div>
//   );

//   const renderMobileView = () => (
//     <div
//       ref={mobileScrollRef}
//       className="md:hidden h-screen overflow-y-scroll snap-y snap-mandatory"
//       style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//     >
//       {posts.map((post) => {
//         const isFollowing = following.has(post.user._id);
//         return (
//           <div key={post._id} className="h-screen snap-start">
//             <PostCard
//               post={post}
//               isFocused={true}
//               onLike={handleLikePost}
//               onComment={handleCommentPost}
//               onSave={handleSavePost}
//               onFollow={handleFollowUser}
//               currentUserId={currentUser?._id || 'default-user-id'}
//               isFollowing={isFollowing}
//             />
//           </div>
//         );
//       })}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-indigo-100">
//       {isLoading ? (
//         <div className="flex justify-center items-center h-screen">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
//         </div>
//       ) : posts.length === 0 ? (
//         <div className="text-center py-12 text-gray-600 text-lg">No posts to show</div>
//       ) : (
//         <>
//           {renderDesktopCarousel()}
//           {renderMobileView()}
//         </>
//       )}
//     </div>
//   );
// };

// const PostCard: React.FC<PostCardProps> = ({
//   post,
//   isFocused,
//   onLike,
//   onComment,
//   onSave,
//   onFollow,
//   currentUserId,
//   onClick,
//   isFollowing,
// }) => {
//   const [commentText, setCommentText] = useState('');
//   const [showComments, setShowComments] = useState(false);
//   const [likeAnimation, setLikeAnimation] = useState(false);
//   const [tapCount, setTapCount] = useState(0);
//   const modalRef = useRef<HTMLDivElement>(null);
//   const cardRef = useRef<HTMLDivElement>(null);

//   const isLiked = post.likes.includes(currentUserId);

//   useEffect(() => {
//     const handleOutsideClick = (e: MouseEvent) => {
//       if (modalRef.current && !modalRef.current.contains(e.target as Node)) setShowComments(false);
//     };
//     if (showComments) document.addEventListener('mousedown', handleOutsideClick);
//     return () => document.removeEventListener('mousedown', handleOutsideClick);
//   }, [showComments]);

//   const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
//     e.preventDefault();
//     setTapCount((prev) => prev + 1);
//     setTimeout(() => {
//       if (tapCount === 1) {
//         setLikeAnimation(true);
//         onLike(post._id);
//         setTimeout(() => setLikeAnimation(false), 800);
//       }
//       setTapCount(0);
//     }, 300);
//   };

//   const handleSubmitComment = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (commentText.trim()) {
//       onComment(post._id, commentText);
//       setCommentText('');
//     }
//   };

//   const formatTimeAgo = (date: Date) => {
//     const now = new Date();
//     const diffMs = now.getTime() - new Date(date).getTime();
//     const diffSec = Math.floor(diffMs / 1000);
//     if (diffSec < 60) return 'Just now';
//     const diffMin = Math.floor(diffSec / 60);
//     if (diffMin < 60) return `${diffMin}m ago`;
//     const diffHr = Math.floor(diffMin / 60);
//     if (diffHr < 24) return `${diffHr}h ago`;
//     const diffDay = Math.floor(diffHr / 24);
//     return `${diffDay}d ago`;
//   };

//   const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

//   return (
//     <div
//       ref={cardRef}
//       className={`bg-white ${
//         isFocused ? 'h-full' : 'rounded-xl shadow-lg'
//       } flex flex-col overflow-hidden transition-all duration-300 max-w-md mx-auto`}
//       onClick={onClick}
//     >
//       {/* Header */}
//       <div className="p-4 flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
//         <img
//           src={post.user.profileImage || '/default-avatar.png'}
//           alt={post.user.name}
//           className="w-10 h-10 rounded-full mr-3 ring-2 ring-indigo-200 shadow-sm"
//         />
//         <div className="flex-1 flex items-center justify-between">
//           <div>
//             <h3 className="font-semibold text-gray-900 text-sm">{post.user.name}</h3>
//             <p className="text-xs text-gray-500">{post.user.profession || post.user.role}</p>
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onFollow?.(post.user._id);
//             }}
//             className={`flex items-center text-xs font-medium px-3 py-1 rounded-full shadow-sm transition-all duration-200 ${
//               isFollowing
//                 ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 : 'bg-indigo-600 text-white hover:bg-indigo-700'
//             }`}
//           >
//             <UserPlus className="w-4 h-4 mr-1" />
//             {isFollowing ? 'Following' : 'Follow'}
//           </button>
//         </div>
//       </div>

//       {/* Media/Content */}
//       {post.media?.length ? (
//         <div
//           className="relative flex-1 bg-black"
//           onTouchStart={handleDoubleTap}
//           onDoubleClick={handleDoubleTap}
//         >
//           {isVideo(post.media[0]) ? (
//             <video
//               src={post.media[0]}
//               controls
//               className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//             />
//           ) : (
//             <img
//               src={post.media[0]}
//               alt={post.content}
//               className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//             />
//           )}
//           {likeAnimation && (
//             <Heart className="absolute inset-0 m-auto w-20 h-20 text-red-500 fill-current animate-ping" />
//           )}
//         </div>
//       ) : (
//         <p className="p-4 text-gray-800 text-base flex-1">{post.content}</p>
//       )}

//       {/* Actions */}
//       <div className="p-4">
//         <div className="flex justify-between items-center mb-3">
//           <div className="flex space-x-4">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onLike(post._id);
//               }}
//               className={`text-gray-600 ${isLiked ? 'text-red-500' : 'hover:text-red-500'} transition-colors`}
//             >
//               <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
//             </button>
//             <button
//               onClick={() => setShowComments(true)}
//               className="text-gray-600 hover:text-indigo-500 transition-colors"
//             >
//               <MessageCircle className="w-6 h-6" />
//             </button>
//             <button className="text-gray-600 hover:text-indigo-500 transition-colors">
//               <Send className="w-6 h-6" />
//             </button>
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onSave(post._id);
//             }}
//             className="text-gray-600 hover:text-yellow-500 transition-colors"
//           >
//             <Bookmark className="w-6 h-6" />
//           </button>
//         </div>
//         <p className="font-semibold text-gray-900 text-sm">{post.likes.length} likes</p>
//         {post.content && post.media?.length && (
//           <p className="mt-2 text-gray-800 text-sm">
//             <span className="font-semibold">{post.user.name}</span> {post.content}
//           </p>
//         )}
//         {post.comments.length > 0 && (
//           <button
//             onClick={() => setShowComments(true)}
//             className="text-gray-500 text-xs mt-2 hover:text-indigo-600 transition-colors"
//           >
//             View all {post.comments.length} comments
//           </button>
//         )}
//         <p className="text-xs text-gray-400 mt-2">{formatTimeAgo(post.createdAt)}</p>
//       </div>

//       {/* Comment Input */}
//       <form onSubmit={handleSubmitComment} className="p-4 border-t flex items-center bg-gray-50">
//         <input
//           type="text"
//           value={commentText}
//           onChange={(e) => setCommentText(e.target.value)}
//           placeholder="Add a comment..."
//           className="flex-1 bg-white p-2 rounded-full text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
//         />
//         <button
//           type="submit"
//           disabled={!commentText.trim()}
//           className="text-indigo-600 font-semibold ml-3 text-sm disabled:text-gray-400 transition-colors"
//         >
//           Post
//         </button>
//       </form>

//       {/* Comment Modal */}
//       {showComments && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div
//             ref={modalRef}
//             className="bg-white w-full max-w-md h-[70vh] rounded-xl flex flex-col overflow-hidden shadow-2xl"
//           >
//             <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
//               <h3 className="font-semibold text-lg text-gray-900">{post.comments.length} Comments</h3>
//               <button onClick={() => setShowComments(false)}>
//                 <X className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
//               </button>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//               {post.comments.map((comment) => (
//                 <div key={comment._id} className="flex items-start mb-4">
//                   <img
//                     src={comment.userImage || '/default-avatar.png'}
//                     alt={comment.userName}
//                     className="w-8 h-8 rounded-full mr-3 ring-1 ring-gray-200"
//                   />
//                   <div className="flex-1">
//                     <p className="text-gray-800 text-sm">
//                       <span className="font-semibold">{comment.userName}</span> {comment.commentText}
//                     </p>
//                     <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(comment.createdAt)}</p>
//                   </div>
//                   <button className="text-gray-400 hover:text-red-500 ml-2 transition-colors">
//                     <Heart className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//             <form onSubmit={handleSubmitComment} className="p-4 border-t flex items-center bg-white">
//               <input
//                 type="text"
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 placeholder="Add a comment..."
//                 className="flex-1 bg-gray-100 p-2 rounded-full text-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
//               />
//               <button
//                 type="submit"
//                 disabled={!commentText.trim()}
//                 className="text-indigo-600 font-semibold ml-3 text-sm disabled:text-gray-400 transition-colors"
//               >
//                 Post
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SocialPost;




// import React, { useState, useRef, useEffect } from 'react';
// import { Heart, MessageCircle, Send, Bookmark, X, UserPlus } from 'lucide-react';
// import postService from '../../services/post/postService';

// // Interfaces
// interface IUser {
//   _id: string;
//   name: string;
//   email: string;
//   contactNumber?: string;
//   profileImage?: string;
//   profession?: string;
//   bio?: string;
//   role?: "entrepreneur" | "investor";
//   isPremium?: boolean;
//   followers?: string[];
//   following?: string[];
//   savedPost?: string[];
//   interests?: string[];
// }

// interface Comment {
//   _id: string;
//   userId: string;
//   userName?: string;
//   userImage?: string;
//   commentText: string;
//   createdAt: Date;
// }

// interface IPost {
//   _id: string;
//   userid: string;
//   content: string;
//   media?: string[];
//   likes: string[];
//   comments: Comment[];
//   totalShare: number;
//   totalLikes: number;
//   engagementScore: number;
//   postTag?: string[];
//   shares?: Array<{ sharedAt: Date; userid: string }>;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface PostWithUser extends Omit<IPost, 'userid'> {
//   user: IUser;
// }

// type PostCardProps = {
//   post: PostWithUser;
//   isFocused: boolean;
//   onLike: (postId: string) => void;
//   onComment: (postId: string, comment: string) => void;
//   onSave: (postId: string) => void;
//   onFollow?: (userId: string) => void;
//   currentUserId: string;
//   onClick?: () => void;
//   isFollowing?: boolean;
// };

// const SocialPost: React.FC = () => {
//   const [posts, setPosts] = useState<PostWithUser[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentUser, setCurrentUser] = useState<IUser | null>(null);
//   const [focusedIndex, setFocusedIndex] = useState(0);
//   const [following, setFollowing] = useState<Set<string>>(new Set());
//   const carouselRef = useRef<HTMLDivElement>(null);
//   const mobileScrollRef = useRef<HTMLDivElement>(null);
//   const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
//   const [dragOffset, setDragOffset] = useState(0);

//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const user = await postService.getCurrentUser();
//         setCurrentUser({
//           ...user,
//           role: (user.role === "entrepreneur" || user.role === "investor") ? user.role : undefined,
//         });
//         if (user.following) setFollowing(new Set(user.following));
//       } catch (error) {
//         console.error('Failed to load current user:', error);
//         setCurrentUser({ _id: 'default-user-id', name: 'Default User', email: 'default@example.com' });
//       }
//     };

//     const fetchUserPosts = async () => {
//       try {
//         setIsLoading(true);
//         const userPosts = await postService.getUsersPosts();
//         const postsWithUsers = await Promise.all(
//           userPosts.map(async (post) => {
//             const userData = await postService.getUserById(post.userid);
//             const enhancedComments = await Promise.all(
//               post.comments.map(async (comment) => {
//                 const commentUser = await postService.getUserById(comment.userId);
//                 return { ...comment, userName: commentUser.name, userImage: commentUser.profileImage };
//               })
//             );
//             return { ...post, comments: enhancedComments, user: userData } as PostWithUser;
//           })
//         );
//         setPosts(postsWithUsers);
//       } catch (error) {
//         console.error('Failed to load user posts:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchCurrentUser();
//     fetchUserPosts();
//   }, []);

//   useEffect(() => {
//     const updatePosition = () => {
//       if (carouselRef.current && posts.length > 0) {
//         const cardWidth = carouselRef.current.offsetWidth / 3;
//         const offset = focusedIndex * cardWidth - (carouselRef.current.offsetWidth - cardWidth) / 2 + dragOffset;
//         carouselRef.current.scrollTo({ left: offset, behavior: dragOffset ? 'auto' : 'smooth' });
//       }
//       if (mobileScrollRef.current && posts.length > 0) {
//         mobileScrollRef.current.scrollTo({ top: focusedIndex * window.innerHeight, behavior: 'smooth' });
//       }
//     };
//     updatePosition();
//     window.addEventListener('resize', updatePosition);
//     return () => window.removeEventListener('resize', updatePosition);
//   }, [focusedIndex, posts, dragOffset]);

//   const handleLikePost = async (postId: string) => {
//     try {
//       const updatedPost = await postService.likePost(postId);
//       setPosts((prev) =>
//         prev.map((p) =>
//           p._id === postId
//             ? { ...p, likes: updatedPost.likes, totalLikes: updatedPost.likes.length }
//             : p
//         )
//       );
//     } catch (error) {
//       console.error('Failed to like post:', error);
//     }
//   };

//   const handleSavePost = async (postId: string) => {
//     await postService.savePost(postId);
//   };

//   const handleCommentPost = async (postId: string, commentText: string) => {
//     if (!commentText.trim() || !currentUser) return;
//     const updatedPost = await postService.addComment(postId, commentText);
//     setPosts((prev) =>
//       prev.map((p) =>
//         p._id === postId
//           ? {
//               ...p,
//               comments: updatedPost.comments.map((c: any) => ({
//                 ...c,
//                 userName: currentUser.name,
//                 userImage: currentUser.profileImage,
//               })),
//             }
//           : p
//       )
//     );
//   };

//   const handleFollowUser = async (userId: string) => {
//     try {
//       const isFollowing = following.has(userId);
//       await postService.followUser(userId);
//       setFollowing((prev) => {
//         const newFollowing = new Set(prev);
//         if (isFollowing) {
//           newFollowing.delete(userId);
//         } else {
//           newFollowing.add(userId);
//         }
//         return newFollowing;
//       });
//     } catch (error) {
//       console.error('Failed to follow/unfollow user:', error);
//     }
//   };

//   const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
//     const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
//     const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
//     setDragStart({ x: clientX, y: clientY });
//   };

//   const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!dragStart) return;
//     const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
//     const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
//     const diffX = dragStart.x - clientX;
//     const diffY = dragStart.y - clientY;

//     if (carouselRef.current && Math.abs(diffX) > Math.abs(diffY)) {
//       e.preventDefault();
//       setDragOffset(diffX);
//     }
//   };

//   const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
//     if (!dragStart) return;
//     const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
//     const diffX = dragStart.x - clientX;

//     if (Math.abs(diffX) > 50 && carouselRef.current) {
//       if (diffX > 0) {
//         setFocusedIndex((prev) => Math.min(prev + 1, posts.length - 1));
//       } else {
//         setFocusedIndex((prev) => Math.max(prev - 1, 0));
//       }
//     }
//     setDragStart(null);
//     setDragOffset(0);
//   };

//   const renderDesktopCarousel = () => (
//     <div className="hidden md:block relative max-w-5xl mx-auto px-6 py-12">
//       <div
//         ref={carouselRef}
//         className="flex overflow-x-hidden snap-x snap-mandatory"
//         onMouseDown={handleDragStart}
//         onMouseMove={handleDragMove}
//         onMouseUp={handleDragEnd}
//         onMouseLeave={handleDragEnd}
//         onTouchStart={handleDragStart}
//         onTouchMove={handleDragMove}
//         onTouchEnd={handleDragEnd}
//         style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//       >
//         {posts.map((post, index) => {
//           const distance = Math.abs(index - focusedIndex);
//           const scale = distance === 0 ? 1 : 0.9 - distance * 0.05;
//           const isFollowing = following.has(post.user._id);
//           return (
//             <div
//               key={post._id}
//               className="flex-shrink-0 snap-center transition-all duration-500 ease-out"
//               style={{
//                 width: '33.33%',
//                 padding: '0 1rem',
//                 transform: `scale(${scale}) perspective(1000px) rotateY(${distance * 5}deg)`,
//                 opacity: 1 - distance * 0.2,
//                 zIndex: posts.length - distance,
//               }}
//             >
//               <PostCard
//                 post={post}
//                 isFocused={index === focusedIndex}
//                 onLike={handleLikePost}
//                 onComment={handleCommentPost}
//                 onSave={handleSavePost}
//                 onFollow={handleFollowUser}
//                 currentUserId={currentUser?._id || 'default-user-id'}
//                 onClick={() => setFocusedIndex(index)}
//                 isFollowing={isFollowing}
//               />
//             </div>
//           );
//         })}
//       </div>
//       <div className="flex justify-center mt-6 space-x-2">
//         {posts.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => setFocusedIndex(i)}
//             className={`w-2 h-2 rounded-full transition-all duration-300 ${
//               i === focusedIndex ? 'bg-indigo-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
//             }`}
//           />
//         ))}
//       </div>
//     </div>
//   );

//   const renderMobileView = () => (
//     <div
//       ref={mobileScrollRef}
//       className="md:hidden h-screen overflow-y-scroll snap-y snap-mandatory"
//       style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
//     >
//       {posts.map((post) => {
//         const isFollowing = following.has(post.user._id);
//         return (
//           <div key={post._id} className="h-screen snap-start">
//             <PostCard
//               post={post}
//               isFocused={true}
//               onLike={handleLikePost}
//               onComment={handleCommentPost}
//               onSave={handleSavePost}
//               onFollow={handleFollowUser}
//               currentUserId={currentUser?._id || 'default-user-id'}
//               isFollowing={isFollowing}
//             />
//           </div>
//         );
//       })}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-indigo-100">
//       {isLoading ? (
//         <div className="flex justify-center items-center h-screen">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
//         </div>
//       ) : posts.length === 0 ? (
//         <div className="text-center py-12 text-gray-600 text-lg">No posts to show</div>
//       ) : (
//         <>
//           {renderDesktopCarousel()}
//           {renderMobileView()}
//         </>
//       )}
//     </div>
//   );
// };

// const PostCard: React.FC<PostCardProps> = ({
//   post,
//   isFocused,
//   onLike,
//   onComment,
//   onSave,
//   onFollow,
//   currentUserId,
//   onClick,
//   isFollowing,
// }) => {
//   const [commentText, setCommentText] = useState('');
//   const [showComments, setShowComments] = useState(false);
//   const [likeAnimation, setLikeAnimation] = useState(false);
//   const [tapCount, setTapCount] = useState(0);
//   const modalRef = useRef<HTMLDivElement>(null);
//   const cardRef = useRef<HTMLDivElement>(null);

//   const isLiked = post.likes.includes(currentUserId);

//   useEffect(() => {
//     const handleOutsideClick = (e: MouseEvent) => {
//       if (modalRef.current && !modalRef.current.contains(e.target as Node)) setShowComments(false);
//     };
//     if (showComments) document.addEventListener('mousedown', handleOutsideClick);
//     return () => document.removeEventListener('mousedown', handleOutsideClick);
//   }, [showComments]);

//   const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
//     e.preventDefault();
//     setTapCount((prev) => prev + 1);
//     setTimeout(() => {
//       if (tapCount === 1) {
//         setLikeAnimation(true);
//         onLike(post._id);
//         setTimeout(() => setLikeAnimation(false), 800);
//       }
//       setTapCount(0);
//     }, 300);
//   };

//   const handleSubmitComment = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (commentText.trim()) {
//       onComment(post._id, commentText);
//       setCommentText('');
//     }
//   };

//   const formatTimeAgo = (date: Date) => {
//     const now = new Date();
//     const diffMs = now.getTime() - new Date(date).getTime();
//     const diffSec = Math.floor(diffMs / 1000);
//     if (diffSec < 60) return 'Just now';
//     const diffMin = Math.floor(diffSec / 60);
//     if (diffMin < 60) return `${diffMin}m ago`;
//     const diffHr = Math.floor(diffMin / 60);
//     if (diffHr < 24) return `${diffHr}h ago`;
//     const diffDay = Math.floor(diffHr / 24);
//     return `${diffDay}d ago`;
//   };

//   const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

//   return (
//     <div
//       ref={cardRef}
//       className={`bg-white ${
//         isFocused ? 'h-full' : 'rounded-xl shadow-lg'
//       } flex flex-col overflow-hidden transition-all duration-300 max-w-md mx-auto`}
//       onClick={onClick}
//     >
//       {/* Header */}
//       <div className="p-4 flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
//         <img
//           src={post.user.profileImage || '/default-avatar.png'}
//           alt={post.user.name}
//           className="w-10 h-10 rounded-full mr-3 ring-2 ring-indigo-200 shadow-sm"
//         />
//         <div className="flex-1 flex items-center justify-between">
//           <div>
//             <h3 className="font-semibold text-gray-900 text-sm">{post.user.name}</h3>
//             <p className="text-xs text-gray-500">{post.user.profession || post.user.role}</p>
//           </div>
//           {currentUserId !== post.user._id && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onFollow?.(post.user._id);
//               }}
//               className={`flex items-center text-xs font-medium px-3 py-1 rounded-full shadow-sm transition-all duration-200 ${
//                 isFollowing
//                   ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                   : 'bg-indigo-600 text-white hover:bg-indigo-700'
//               }`}
//             >
//               <UserPlus className="w-4 h-4 mr-1" />
//               {isFollowing ? 'Following' : 'Follow'}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Media/Content */}
//       {post.media?.length ? (
//         <div
//           className="relative flex-1 bg-black"
//           onTouchStart={handleDoubleTap}
//           onDoubleClick={handleDoubleTap}
//         >
//           {isVideo(post.media[0]) ? (
//             <video
//               src={post.media[0]}
//               controls
//               className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//             />
//           ) : (
//             <img
//               src={post.media[0]}
//               alt={post.content}
//               className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//             />
//           )}
//           {likeAnimation && (
//             <Heart className="absolute inset-0 m-auto w-20 h-20 text-red-500 fill-current animate-ping" />
//           )}
//         </div>
//       ) : (
//         <p className="p-4 text-gray-800 text-base flex-1">{post.content}</p>
//       )}

//       {/* Actions */}
//       <div className="p-4">
//         <div className="flex justify-between items-center mb-3">
//           <div className="flex space-x-4">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onLike(post._id);
//               }}
//               className={`text-gray-600 ${isLiked ? 'text-red-500' : 'hover:text-red-500'} transition-colors`}
//             >
//               <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
//             </button>
//             <button
//               onClick={() => setShowComments(true)}
//               className="text-gray-600 hover:text-indigo-500 transition-colors"
//             >
//               <MessageCircle className="w-6 h-6" />
//             </button>
//             <button className="text-gray-600 hover:text-indigo-500 transition-colors">
//               <Send className="w-6 h-6" />
//             </button>
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onSave(post._id);
//             }}
//             className="text-gray-600 hover:text-yellow-500 transition-colors"
//           >
//             <Bookmark className="w-6 h-6" />
//           </button>
//         </div>
//         <p className="font-semibold text-gray-900 text-sm">{post.likes.length} likes</p>
//         {post.content && post.media?.length && (
//           <p className="mt-2 text-gray-800 text-sm">
//             <span className="font-semibold">{post.user.name}</span> {post.content}
//           </p>
//         )}
//         {post.comments.length > 0 && (
//           <button
//             onClick={() => setShowComments(true)}
//             className="text-gray-500 text-xs mt-2 hover:text-indigo-600 transition-colors"
//           >
//             View all {post.comments.length} comments
//           </button>
//         )}
//         <p className="text-xs text-gray-400 mt-2">{formatTimeAgo(post.createdAt)}</p>
//       </div>

//       {/* Comment Input */}
//       <form onSubmit={handleSubmitComment} className="p-4 border-t flex items-center bg-gray-50">
//         <input
//           type="text"
//           value={commentText}
//           onChange={(e) => setCommentText(e.target.value)}
//           placeholder="Add a comment..."
//           className="flex-1 bg-white p-2 rounded-full text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-sm"
//         />
//         <button
//           type="submit"
//           disabled={!commentText.trim()}
//           className="text-indigo-600 font-semibold ml-3 text-sm disabled:text-gray-400 transition-colors"
//         >
//           Post
//         </button>
//       </form>

//       {/* Comment Modal */}
//       {showComments && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div
//             ref={modalRef}
//             className="bg-white w-full max-w-md h-[70vh] rounded-xl flex flex-col overflow-hidden shadow-2xl"
//           >
//             <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
//               <h3 className="font-semibold text-lg text-gray-900">{post.comments.length} Comments</h3>
//               <button onClick={() => setShowComments(false)}>
//                 <X className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
//               </button>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
//               {post.comments.map((comment) => (
//                 <div key={comment._id} className="flex items-start mb-4">
//                   <img
//                     src={comment.userImage || '/default-avatar.png'}
//                     alt={comment.userName}
//                     className="w-8 h-8 rounded-full mr-3 ring-1 ring-gray-200"
//                   />
//                   <div className="flex-1">
//                     <p className="text-gray-800 text-sm">
//                       <span className="font-semibold">{comment.userName}</span> {comment.commentText}
//                     </p>
//                     <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(comment.createdAt)}</p>
//                   </div>
//                   <button className="text-gray-400 hover:text-red-500 ml-2 transition-colors">
//                     <Heart className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//             <form onSubmit={handleSubmitComment} className="p-4 border-t flex items-center bg-white">
//               <input
//                 type="text"
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 placeholder="Add a comment..."
//                 className="flex-1 bg-gray-100 p-2 rounded-full text-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
//               />
//               <button
//                 type="submit"
//                 disabled={!commentText.trim()}
//                 className="text-indigo-600 font-semibold ml-3 text-sm disabled:text-gray-400 transition-colors"
//               >
//                 Post
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SocialPost;





import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, X, UserPlus } from 'lucide-react';
import postService from '../../services/post/postService';

// Interfaces remain unchanged
interface IUser {
  _id: string;
  name: string;
  email: string;
  contactNumber?: string;
  profileImage?: string;
  profession?: string;
  bio?: string;
  role?: "entrepreneur" | "investor";
  isPremium?: boolean;
  followers?: string[];
  following?: string[];
  savedPost?: string[];
  interests?: string[];
}

interface Comment {
  _id: string;
  userId: string;
  userName?: string;
  userImage?: string;
  commentText: string;
  createdAt: Date;
}

interface IPost {
  _id: string;
  userid: string;
  content: string;
  media?: string[];
  likes: string[];
  comments: Comment[];
  totalShare: number;
  totalLikes: number;
  engagementScore: number;
  postTag?: string[];
  shares?: Array<{ sharedAt: Date; userid: string }>;
  createdAt: Date;
  updatedAt: Date;
}

interface PostWithUser extends Omit<IPost, 'userid'> {
  user: IUser;
}

type PostCardProps = {
  post: PostWithUser;
  isFocused: boolean;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onSave: (postId: string) => void;
  onFollow?: (userId: string) => void;
  currentUserId: string;
  onClick?: () => void;
  isFollowing?: boolean;
};

// SocialPost component remains unchanged except for PostCard usage
const SocialPost: React.FC = () => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await postService.getCurrentUser();
        setCurrentUser({
          ...user,
          role: (user.role === "entrepreneur" || user.role === "investor") ? user.role : undefined,
        });
        if (user.following) setFollowing(new Set(user.following));
      } catch (error) {
        console.error('Failed to load current user:', error);
        setCurrentUser({ _id: 'default-user-id', name: 'Default User', email: 'default@example.com' });
      }
    };

    const fetchUserPosts = async () => {
      try {
        setIsLoading(true);
        const userPosts = await postService.getUsersPosts();
        const postsWithUsers = await Promise.all(
          userPosts.map(async (post) => {
            const userData = await postService.getUserById(post.userid);
            const enhancedComments = await Promise.all(
              post.comments.map(async (comment) => {
                const commentUser = await postService.getUserById(comment.userId);
                return { ...comment, userName: commentUser.name, userImage: commentUser.profileImage };
              })
            );
            return { ...post, comments: enhancedComments, user: userData } as PostWithUser;
          })
        );
        setPosts(postsWithUsers);
      } catch (error) {
        console.error('Failed to load user posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUserPosts();
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (carouselRef.current && posts.length > 0) {
        const cardWidth = carouselRef.current.offsetWidth / 3;
        const offset = focusedIndex * cardWidth - (carouselRef.current.offsetWidth - cardWidth) / 2 + dragOffset;
        carouselRef.current.scrollTo({ left: offset, behavior: dragOffset ? 'auto' : 'smooth' });
      }
      if (mobileScrollRef.current && posts.length > 0) {
        mobileScrollRef.current.scrollTo({ top: focusedIndex * window.innerHeight, behavior: 'smooth' });
      }
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [focusedIndex, posts, dragOffset]);

  const handleLikePost = async (postId: string) => {
    try {
      const updatedPost = await postService.likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: updatedPost.likes, totalLikes: updatedPost.likes.length }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleSavePost = async (postId: string) => {
    await postService.savePost(postId);
  };

  const handleCommentPost = async (postId: string, commentText: string) => {
    if (!commentText.trim() || !currentUser) return;
    const updatedPost = await postService.addComment(postId, commentText);
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              comments: updatedPost.comments.map((c: any) => ({
                ...c,
                userName: currentUser.name,
                userImage: currentUser.profileImage,
              })),
            }
          : p
      )
    );
  };

  const handleFollowUser = async (userId: string) => {
    try {
      const isFollowing = following.has(userId);
      await postService.followUser(userId);
      setFollowing((prev) => {
        const newFollowing = new Set(prev);
        if (isFollowing) {
          newFollowing.delete(userId);
        } else {
          newFollowing.add(userId);
        }
        return newFollowing;
      });
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diffX = dragStart.x - clientX;
    const diffY = dragStart.y - clientY;

    if (carouselRef.current && Math.abs(diffX) > Math.abs(diffY)) {
      e.preventDefault();
      setDragOffset(diffX);
    }
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart) return;
    const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diffX = dragStart.x - clientX;

    if (Math.abs(diffX) > 50 && carouselRef.current) {
      if (diffX > 0) {
        setFocusedIndex((prev) => Math.min(prev + 1, posts.length - 1));
      } else {
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }
    }
    setDragStart(null);
    setDragOffset(0);
  };

  const renderDesktopCarousel = () => (
    <div className="hidden md:block relative max-w-5xl mx-auto px-6 py-12">
      <div
        ref={carouselRef}
        className="flex overflow-x-hidden snap-x snap-mandatory"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {posts.map((post, index) => {
          const distance = Math.abs(index - focusedIndex);
          const scale = distance === 0 ? 1 : 0.9 - distance * 0.05;
          const isFollowing = following.has(post.user._id);
          return (
            <div
              key={post._id}
              className="flex-shrink-0 snap-center transition-all duration-500 ease-out"
              style={{
                width: '33.33%',
                padding: '0 1rem',
                transform: `scale(${scale}) perspective(1000px) rotateY(${distance * 5}deg)`,
                opacity: 1 - distance * 0.2,
                zIndex: posts.length - distance,
              }}
            >
              <PostCard
                post={post}
                isFocused={index === focusedIndex}
                onLike={handleLikePost}
                onComment={handleCommentPost}
                onSave={handleSavePost}
                onFollow={handleFollowUser}
                currentUserId={currentUser?._id || 'default-user-id'}
                onClick={() => setFocusedIndex(index)}
                isFollowing={isFollowing}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => setFocusedIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === focusedIndex ? 'bg-indigo-600 w-4' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );

  const renderMobileView = () => (
    <div
      ref={mobileScrollRef}
      className="md:hidden h-screen overflow-y-scroll snap-y snap-mandatory"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {posts.map((post) => {
        const isFollowing = following.has(post.user._id);
        return (
          <div key={post._id} className="h-screen snap-start">
            <PostCard
              post={post}
              isFocused={true}
              onLike={handleLikePost}
              onComment={handleCommentPost}
              onSave={handleSavePost}
              onFollow={handleFollowUser}
              currentUserId={currentUser?._id || 'default-user-id'}
              isFollowing={isFollowing}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-indigo-100">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-gray-600 text-lg">No posts to show</div>
      ) : (
        <>
          {renderDesktopCarousel()}
          {renderMobileView()}
        </>
      )}
    </div>
  );
};

// Updated PostCard component with new UI
const PostCard: React.FC<PostCardProps> = ({
  post,
  isFocused,
  onLike,
  onComment,
  onSave,
  onFollow,
  currentUserId,
  onClick,
  isFollowing,
}) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isLiked = post.likes.includes(currentUserId);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setShowComments(false);
    };
    if (showComments) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showComments]);

  const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setTapCount((prev) => prev + 1);
    setTimeout(() => {
      if (tapCount === 1) {
        setLikeAnimation(true);
        onLike(post._id);
        setTimeout(() => setLikeAnimation(false), 800);
      }
      setTapCount(0);
    }, 300);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post._id, commentText);
      setCommentText('');
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now39';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 max-w-md mx-auto flex flex-col ${
        isFocused ? 'h-full' : 'my-4'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.profileImage || '/default-avatar.png'}
            alt={post.user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm hover:underline cursor-pointer">
              {post.user.name}
            </h3>
            <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        {currentUserId !== post.user._id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFollow?.(post.user._id);
            }}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-200 ${
              isFollowing
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Media/Content */}
      <div className="relative w-full aspect-[4/5] bg-gray-100" onTouchStart={handleDoubleTap} onDoubleClick={handleDoubleTap}>
        {post.media?.length ? (
          isVideo(post.media[0]) ? (
            <video
              src={post.media[0]}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={post.media[0]}
              alt={post.content}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <p className="text-gray-700 text-center">{post.content}</p>
          </div>
        )}
        {likeAnimation && (
          <Heart className="absolute inset-0 m-auto w-24 h-24 text-red-500 fill-current animate-ping" />
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(post._id);
              }}
              className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(post._id);
            }}
            className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Engagement Info */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">{post.likes.length} likes</p>
          {post.content && (
            <p className="text-sm text-gray-800">
              <span className="font-semibold hover:underline cursor-pointer">{post.user.name}</span>{' '}
              {post.content}
            </p>
          )}
          {post.comments.length > 0 && (
            <button
              onClick={() => setShowComments(true)}
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              View all {post.comments.length} comments
            </button>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmitComment} className="p-4 pt-0 flex items-center">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-gray-100 p-2 rounded-full text-sm border-none focus:outline-none focus:ring-1 focus:ring-indigo-300"
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="ml-3 text-indigo-600 font-medium text-sm disabled:text-gray-400 hover:text-indigo-800 transition-colors"
        >
          Post
        </button>
      </form>

      {/* Comment Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md rounded-xl max-h-[80vh] flex flex-col overflow-hidden shadow-xl"
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Comments</h3>
              <button onClick={() => setShowComments(false)}>
                <X className="w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-3">
                  <img
                    src={comment.userImage || '/default-avatar.png'}
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold hover:underline cursor-pointer">
                        {comment.userName}
                      </span>{' '}
                      {comment.commentText}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</p>
                      <button className="text-xs text-gray-500 hover:text-red-500 transition-colors">
                        Like
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmitComment} className="p-4 border-t flex items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-100 p-2 rounded-full text-sm border-none focus:outline-none focus:ring-1 focus:ring-indigo-300"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="ml-3 text-indigo-600 font-medium text-sm disabled:text-gray-400 hover:text-indigo-800 transition-colors"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPost;