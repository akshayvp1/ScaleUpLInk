
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { Heart, MessageCircle, Send, Bookmark, X } from 'lucide-react';
// import postService from '../../services/post/postService';

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

// // Add CSS class for hiding scrollbars
// const scrollbarHideStyles = `
//   .hide-scrollbar::-webkit-scrollbar {
//     display: none;
//   }
//   .hide-scrollbar {
//     -ms-overflow-style: none;
//     scrollbar-width: none;
//   }
// `;

// const SocialPost: React.FC = () => {
//   const [posts, setPosts] = useState<PostWithUser[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentUser, setCurrentUser] = useState<IUser | null>(null);
//   const [focusedIndex, setFocusedIndex] = useState(0);
//   const [following, setFollowing] = useState<Set<string>>(new Set());
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
  
//   const carouselRef = useRef<HTMLDivElement>(null);
//   const isScrolling = useRef(false);
//   const lastScrollTime = useRef(0);
//   const scrollTimeout = useRef<number | null>(null);
//   const touchStartX = useRef(0);
//   const touchStartY = useRef(0);

//   // Check if device is mobile
//   useEffect(() => {
//     const checkIsMobile = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };
    
//     // Initial check
//     checkIsMobile();
    
//     // Listen for resize events
//     window.addEventListener('resize', checkIsMobile);
//     return () => window.removeEventListener('resize', checkIsMobile);
//   }, []);

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

//   // Enhanced smooth transition with snap
//   const smoothTransition = useCallback((targetIndex: number) => {
//     if (targetIndex < 0 || targetIndex >= posts.length || focusedIndex === targetIndex) return;
    
//     setIsTransitioning(true);
//     setFocusedIndex(targetIndex);
    
//     // Smooth scroll to the target item
//     if (carouselRef.current) {
//       const scrollContainer = carouselRef.current;
//       // Adjust card width based on mobile or desktop
//       const cardWidth = isMobile 
//         ? scrollContainer.offsetWidth // Full width for mobile
//         : scrollContainer.offsetWidth * 0.3333; // 33.33% for desktop
      
//       const targetPosition = targetIndex * cardWidth;
      
//       scrollContainer.scrollTo({
//         left: targetPosition,
//         behavior: 'smooth'
//       });
//     }
    
//     setTimeout(() => {
//       setIsTransitioning(false);
//     }, 500);
//   }, [focusedIndex, posts.length, isMobile]);

//   // Improved wheel event handler - convert vertical scroll to horizontal
//   useEffect(() => {
//     const handleWheel = (e: WheelEvent) => {
//       // Prevent default to disable native scrolling
//       e.preventDefault();
      
//       const now = Date.now();
//       if (now - lastScrollTime.current < 100) return; // Throttle scrolling
//       lastScrollTime.current = now;
      
//       // Determine direction based on deltaY (vertical scroll)
//       if (Math.abs(e.deltaY) > 10) {
//         if (e.deltaY > 0 && focusedIndex < posts.length - 1) {
//           // Scroll down = move right
//           smoothTransition(focusedIndex + 1);
//         } else if (e.deltaY < 0 && focusedIndex > 0) {
//           // Scroll up = move left
//           smoothTransition(focusedIndex - 1);
//         }
//       }
      
//       // Also handle horizontal scrolling
//       if (Math.abs(e.deltaX) > 30) {
//         if (e.deltaX > 0 && focusedIndex < posts.length - 1) {
//           smoothTransition(focusedIndex + 1);
//         } else if (e.deltaX < 0 && focusedIndex > 0) {
//           smoothTransition(focusedIndex - 1);
//         }
//       }
//     };
    
//     const carouselElement = carouselRef.current;
//     if (carouselElement) {
//       carouselElement.addEventListener('wheel', handleWheel, { passive: false });
//     }
    
//     return () => {
//       if (carouselElement) {
//         carouselElement.removeEventListener('wheel', handleWheel);
//       }
//       if (scrollTimeout.current) {
//         window.clearTimeout(scrollTimeout.current);
//       }
//     };
//   }, [focusedIndex, posts.length, smoothTransition]);

//   // Handle keyboard navigation
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowRight' && focusedIndex < posts.length - 1) {
//         smoothTransition(focusedIndex + 1);
//       } else if (e.key === 'ArrowLeft' && focusedIndex > 0) {
//         smoothTransition(focusedIndex - 1);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [focusedIndex, posts.length, smoothTransition]);
  
//   const handleTouchStart = (e: React.TouchEvent) => {
//     touchStartX.current = e.touches[0].clientX;
//     touchStartY.current = e.touches[0].clientY;
//   };
  
//   const handleTouchMove = (e: React.TouchEvent) => {
//     // Allow vertical scrolling on mobile for individual post content
//     if (!isMobile) {
//       e.preventDefault();
//     }
//   };
  
//   const handleTouchEnd = (e: React.TouchEvent) => {
//     const touchEndX = e.changedTouches[0].clientX;
//     const touchEndY = e.changedTouches[0].clientY;
    
//     const deltaX = touchStartX.current - touchEndX;
//     const deltaY = touchStartY.current - touchEndY;
    
//     // If horizontal swipe is more significant than vertical
//     if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
//       if (deltaX > 50 && focusedIndex < posts.length - 1) {
//         // Swipe left = move right
//         smoothTransition(focusedIndex + 1);
//       } else if (deltaX < -50 && focusedIndex > 0) {
//         // Swipe right = move left
//         smoothTransition(focusedIndex - 1);
//       }
//     }
//     // Only use vertical swipes for navigation on desktop
//     else if (!isMobile && Math.abs(deltaY) > 50) {
//       if (deltaY > 0 && focusedIndex < posts.length - 1) {
//         // Swipe up = move right
//         smoothTransition(focusedIndex + 1);
//       } else if (deltaY < 0 && focusedIndex > 0) {
//         // Swipe down = move left
//         smoothTransition(focusedIndex - 1);
//       }
//     }
//   };

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

//   const handleUnLikePost = async (postId: string) => {
//     try {
//       const updatedPost = await postService.unLikePost(postId);
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
//     try {
//       await postService.savePost(postId);
//     } catch (error) {
//       console.error('Failed to save post:', error);
//     }
//   };

//   const handleCommentPost = async (postId: string, commentText: string) => {
//     if (!commentText.trim() || !currentUser) return;
//     try {
//       const updatedPost = await postService.addComment(postId, commentText);
//       setPosts((prev) =>
//         prev.map((p) =>
//           p._id === postId
//             ? {
//                 ...p,
//                 comments: updatedPost.comments.map((c: any) => ({
//                   ...c,
//                   userName: currentUser.name,
//                   userImage: currentUser.profileImage,
//                 })),
//               }
//             : p
//         )
//       );
//     } catch (error) {
//       console.error('Failed to add comment:', error);
//     }
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

//   const renderCarousel = () => (
//     <div className="relative w-full mx-auto overflow-hidden">
//       {/* Add global style for hiding scrollbars */}
//       <style>
//         {scrollbarHideStyles}
//       </style>
      
//       {/* Navigation arrows - only show on desktop */}
//       {!isMobile && focusedIndex > 0 && (
//         <button 
//           onClick={() => smoothTransition(focusedIndex - 1)}
//           className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white h-12 w-12 rounded-full flex items-center justify-center hover:bg-black/50 transition-colors z-20"
//           aria-label="Previous post"
//         >
//           <span className="text-2xl">←</span>
//         </button>
//       )}
      
//       {!isMobile && focusedIndex < posts.length - 1 && (
//         <button 
//           onClick={() => smoothTransition(focusedIndex + 1)}
//           className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white h-12 w-12 rounded-full flex items-center justify-center hover:bg-black/50 transition-colors z-20"
//           aria-label="Next post"
//         >
//           <span className="text-2xl">→</span>
//         </button>
//       )}

//       <div 
//         ref={carouselRef}
//         className="relative overflow-hidden hide-scrollbar"
//         style={{ 
//           height: isMobile ? 'calc(100vh - 60px)' : '80vh',
//           scrollSnapType: 'x mandatory', 
//           scrollBehavior: 'smooth'
//         }}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//       >
//         <div 
//           className="flex transition-all duration-500 ease-out"
//           style={{ 
//             transform: isMobile 
//               ? `translateX(calc(-${focusedIndex * 100}%))`
//               : `translateX(calc(50% - ${focusedIndex * 33.33}% - 16.665%))`,
//             height: '100%',
//             willChange: 'transform'
//           }}
//         >
//           {posts.map((post, index) => {
//             const distance = Math.abs(index - focusedIndex);
//             // Scale and opacity more dramatic on desktop, subtler on mobile
//             const scale = isMobile 
//               ? (distance === 0 ? 1 : 0.9)
//               : 1 - distance * 0.1;
//             const opacity = isMobile
//               ? (distance === 0 ? 1 : 0.5)
//               : 1 - distance * 0.3;
//             const zIndex = posts.length - distance;
//             const isFollowing = following.has(post.user._id);
            
//             return (
//               <div
//                 key={post._id}
//                 className="flex-shrink-0 transition-all duration-500 px-4"
//                 style={{
//                   width: isMobile ? '100%' : '33.33%',
//                   transform: `scale(${scale})`,
//                   opacity,
//                   zIndex,
//                   position: 'relative',
//                   height: '100%',
//                   filter: distance > 0 ? `blur(${distance * (isMobile ? 0.5 : 1)}px)` : 'none',
//                   pointerEvents: distance > 0 ? 'none' : 'auto',
//                   scrollSnapAlign: index === focusedIndex ? 'center' : 'none'
//                 }}
//               >
//                 <PostCard
//                   post={post}
//                   isFocused={index === focusedIndex}
//                   onLike={handleLikePost}
//                   onComment={handleCommentPost}
//                   onSave={handleSavePost}
//                   onFollow={handleFollowUser}
//                   currentUserId={currentUser?._id || 'default-user-id'}
//                   onClick={() => smoothTransition(index)}
//                   isFollowing={isFollowing}
//                 />
                
//                 {/* Play button for non-focused posts - desktop only */}
//                 {!isMobile && distance > 0 && (
//                   <div 
//                     className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center cursor-pointer z-10"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       smoothTransition(index);
//                     }}
//                   >
//                     <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center">
//                       <span className="text-xl">▶</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
      
//       {/* Post indicators - more compact on mobile */}
//       <div className="flex justify-center mt-2 md:mt-6 space-x-2">
//         {posts.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => smoothTransition(i)}
//             className={`h-1.5 rounded-full transition-all duration-300 ${
//               i === focusedIndex 
//                 ? 'bg-primary w-6 md:w-8' 
//                 : 'bg-secondary/70 w-2 hover:bg-secondary hover:w-3 md:hover:w-4'
//             }`}
//             aria-label={`Go to post ${i + 1}`}
//           />
//         ))}
//       </div>
//     </div>
//   );

//   return (
//     <div className={`min-h-screen bg-gradient-to-b from-background to-muted ${isMobile ? 'pt-2' : 'py-12 px-4'}`}>
//       {isLoading ? (
//         <div className="flex justify-center items-center h-screen">
//           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
//         </div>
//       ) : posts.length === 0 ? (
//         <div className="text-center py-12 text-muted-foreground text-lg">No posts to show</div>
//       ) : (
//         renderCarousel()
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
//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkIsMobile = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     checkIsMobile();
//     window.addEventListener('resize', checkIsMobile);
//     return () => window.removeEventListener('resize', checkIsMobile);
//   }, []);

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
//       className={`bg-card rounded-xl md:rounded-2xl shadow-md overflow-hidden transition-all duration-300 h-full flex flex-col ${
//         isFocused ? 'scale-100 shadow-xl' : 'scale-95 shadow-md'
//       }`}
//       onClick={onClick}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between p-2 md:p-3 border-b border-border">
//         <div className="flex items-center space-x-2 md:space-x-3">
//           <img
//             src={post.user.profileImage || '/default-avatar.png'}
//             alt={post.user.name}
//             className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-border"
//           />
//           <div>
//             <h3 className="font-semibold text-foreground text-xs md:text-sm hover:underline cursor-pointer">
//               {post.user.name}
//             </h3>
//             <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
//           </div>
//         </div>
//         {currentUserId !== post.user._id && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onFollow?.(post.user._id);
//             }}
//             className={`text-xs md:text-sm font-medium px-2 py-1 md:px-3 md:py-1 rounded-full transition-all duration-200 ${
//               isFollowing
//                 ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
//                 : 'bg-primary text-primary-foreground hover:bg-primary/90'
//             }`}
//           >
//             {isFollowing ? 'Following' : 'Follow'}
//           </button>
//         )}
//       </div>

//       {/* Media/Content */}
//       <div className="relative flex-1 bg-muted" onTouchStart={handleDoubleTap} onDoubleClick={handleDoubleTap}>
//         {post.media?.length ? (
//           isVideo(post.media[0]) ? (
//             <video
//               src={post.media[0]}
//               controls
//               className="w-full h-full object-cover"
//               playsInline
//             />
//           ) : (
//             <img
//               src={post.media[0]}
//               alt={post.content}
//               className="w-full h-full object-cover"
//               loading="eager"
//             />
//           )
//         ) : (
//           <div className="w-full h-full flex items-center justify-center p-4">
//             <p className="text-muted-foreground text-center text-sm md:text-base">{post.content}</p>
//           </div>
//         )}
//         {likeAnimation && (
//           <Heart className="absolute inset-0 m-auto w-16 h-16 md:w-24 md:h-24 text-destructive fill-current animate-ping" />
//         )}
//       </div>

//       {/* Actions and Engagement Info */}
//       <div className="p-2 md:p-3">
//         <div className="flex items-center justify-between mb-2">
//           <div className="flex space-x-2 md:space-x-4">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onLike(post._id);
//               }}
//               className={`p-1 rounded-full hover:bg-muted transition-colors ${
//                 isLiked ? 'text-destructive' : 'text-muted-foreground'
//               }`}
//             >
//               <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isLiked ? 'fill-current' : ''}`} />
//             </button>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowComments(true);
//               }}
//               className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
//             >
//               <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
//             </button>
//             <button className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors">
//               <Send className="w-5 h-5 md:w-6 md:h-6" />
//             </button>
//           </div>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onSave(post._id);
//             }}
//             className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
//           >
//             <Bookmark className="w-5 h-5 md:w-6 md:h-6" />
//           </button>
//         </div>

//         {/* Engagement Info */}
//         <div className="space-y-1 mb-2">
//           <p className="text-xs md:text-sm font-semibold text-foreground">{post.likes.length} likes</p>
//           {post.content && (
//             <p className="text-xs md:text-sm text-foreground">
//               <span className="font-semibold hover:underline cursor-pointer">{post.user.name}</span>{' '}
//               {post.content.length > 100 && isMobile
//                 ? `${post.content.substring(0, 100)}...`
//                 : post.content}
//             </p>
//           )}
//           {post.comments.length > 0 && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowComments(true);
//               }}
//               className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
//             >
//               View all {post.comments.length} comments
//             </button>
//           )}
//         </div>

//         {/* Comment Input - Positioned Higher */}
//         <form
//           onSubmit={(e) => {
//             e.stopPropagation();
//             handleSubmitComment(e);
//           }}
//           className="flex items-center bg-card border-t border-border pt-1 pb-2 px-2 md:pt-1 md:pb-3 md:px-3"
//         >
//           <input
//             type="text"
//             value={commentText}
//             onChange={(e) => setCommentText(e.target.value)}
//             onClick={(e) => e.stopPropagation()}
//             placeholder="Add a comment..."
//             className="flex-1 bg-muted p-2 rounded-full text-xs md:text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary"
//           />
//           <button
//             type="submit"
//             disabled={!commentText.trim()}
//             className="ml-2 md:ml-3 text-primary font-medium text-xs md:text-sm disabled:text-muted-foreground hover:text-primary/80 transition-colors"
//           >
//             Post
//           </button>
//         </form>
//       </div>

//       {/* Comment Modal */}
//       {showComments && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
//           <div
//             ref={modalRef}
//             className="bg-card w-full max-w-md rounded-xl max-h-[80vh] flex flex-col overflow-hidden shadow-xl"
//           >
//             <div className="p-4 border-b border-border flex justify-between items-center">
//               <h3 className="font-semibold text-foreground">Comments</h3>
//               <button onClick={() => setShowComments(false)}>
//                 <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
//               </button>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 space-y-4">
//               {post.comments.map((comment) => (
//                 <div key={comment._id} className="flex items-start space-x-3">
//                   <img
//                     src={comment.userImage || '/default-avatar.png'}
//                     alt={comment.userName || 'User'}
//                     className="w-8 h-8 rounded-full object-cover"
//                   />
//                   <div className="flex-1">
//                     <p className="text-sm text-foreground">
//                       <span className="font-semibold hover:underline cursor-pointer">
//                         {comment.userName || 'User'}
//                       </span>{' '}
//                       {comment.commentText}
//                     </p>
//                     <div className="flex items-center space-x-3 mt-1">
//                       <p className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</p>
//                       <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">
//                         Like
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <form onSubmit={handleSubmitComment} className="p-4 border-t border-border flex items-center">
//               <input
//                 type="text"
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 placeholder="Add a comment..."
//                 className="flex-1 bg-muted p-2 rounded-full text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary"
//               />
//               <button
//                 type="submit"
//                 disabled={!commentText.trim()}
//                 className="ml-3 text-primary font-medium text-sm disabled:text-muted-foreground hover:text-primary/80 transition-colors"
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


import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Send, Bookmark, X } from 'lucide-react';
import postService from '../../services/post/postService';
import { Post, Comment as ServiceComment } from '../../types/post/post.types'; // Import service types

// Define interfaces
interface IUser {
  _id: string;
  name: string;
  email: string;
  contactNumber?: string;
  profileImage?: string;
  profession?: string;
  bio?: string;
  role?: 'entrepreneur' | 'investor';
  isPremium?: boolean;
  followers?: string[];
  following?: string[];
  savedPost?: string[];
  interests?: string[];
}

// Use the service's Comment type, but extend it to include optional userName and userImage
interface Comment extends ServiceComment {
  userName?: string;
  userImage?: string;
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
  onUnLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onSave: (postId: string) => void;
  onFollow?: (userId: string) => void;
  currentUserId: string;
  onClick?: () => void;
  isFollowing?: boolean;
};

// Add CSS class for hiding scrollbars
const scrollbarHideStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const SocialPost: React.FC = () => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const lastScrollTime = useRef(0);
  const scrollTimeout = useRef<number | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await postService.getCurrentUser();
        setCurrentUser({
          ...user,
          role: (user.role === 'entrepreneur' || user.role === 'investor') ? user.role : undefined,
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
        const userPosts: Post[] = await postService.getUsersPosts();
        const postsWithUsers: PostWithUser[] = await Promise.all(
          userPosts
            .filter((post): post is Post & { _id: string } => post._id !== undefined)
            .map(async (post: Post & { _id: string }) => {
              const userData = await postService.getUserById(post.userid);
              const enhancedComments = await Promise.all(
                post.comments
                  .filter((comment): comment is ServiceComment & { _id: string } => comment._id !== undefined)
                  .map(async (comment: ServiceComment & { _id: string }) => {
                    const commentUser = await postService.getUserById(comment.userId);
                    return {
                      ...comment,
                      userName: commentUser.name,
                      userImage: commentUser.profileImage,
                    } as Comment;
                  })
              );
              return {
                ...post,
                user: userData,
                comments: enhancedComments,
              } as PostWithUser;
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

  // Enhanced smooth transition with snap
  const smoothTransition = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= posts.length || focusedIndex === targetIndex) return;

      setIsTransitioning(true);
      setFocusedIndex(targetIndex);

      if (carouselRef.current) {
        const scrollContainer = carouselRef.current;
        const cardWidth = isMobile ? scrollContainer.offsetWidth : scrollContainer.offsetWidth * 0.3333;
        const targetPosition = targetIndex * cardWidth;

        scrollContainer.scrollTo({
          left: targetPosition,
          behavior: 'smooth',
        });
      }

      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    },
    [focusedIndex, posts.length, isMobile]
  );

  // Improved wheel event handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastScrollTime.current < 100) return;
      lastScrollTime.current = now;

      if (Math.abs(e.deltaY) > 10) {
        if (e.deltaY > 0 && focusedIndex < posts.length - 1) {
          smoothTransition(focusedIndex + 1);
        } else if (e.deltaY < 0 && focusedIndex > 0) {
          smoothTransition(focusedIndex - 1);
        }
      }

      if (Math.abs(e.deltaX) > 30) {
        if (e.deltaX > 0 && focusedIndex < posts.length - 1) {
          smoothTransition(focusedIndex + 1);
        } else if (e.deltaX < 0 && focusedIndex > 0) {
          smoothTransition(focusedIndex - 1);
        }
      }
    };

    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('wheel', handleWheel);
      }
      if (scrollTimeout.current) {
        window.clearTimeout(scrollTimeout.current);
      }
    };
  }, [focusedIndex, posts.length, smoothTransition]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && focusedIndex < posts.length - 1) {
        smoothTransition(focusedIndex + 1);
      } else if (e.key === 'ArrowLeft' && focusedIndex > 0) {
        smoothTransition(focusedIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, posts.length, smoothTransition]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 50 && focusedIndex < posts.length - 1) {
        smoothTransition(focusedIndex + 1);
      } else if (deltaX < -50 && focusedIndex > 0) {
        smoothTransition(focusedIndex - 1);
      }
    } else if (!isMobile && Math.abs(deltaY) > 50) {
      if (deltaY > 0 && focusedIndex < posts.length - 1) {
        smoothTransition(focusedIndex + 1);
      } else if (deltaY < 0 && focusedIndex > 0) {
        smoothTransition(focusedIndex - 1);
      }
    }
  };

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

  const handleUnLikePost = async (postId: string) => {
    try {
      const updatedPost = await postService.unLikePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, likes: updatedPost.likes, totalLikes: updatedPost.likes.length }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to unlike post:', error);
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      await postService.savePost(postId);
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  const handleCommentPost = async (postId: string, commentText: string) => {
    if (!commentText.trim() || !currentUser) return;
    try {
      const updatedPost = await postService.addComment(postId, commentText);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments: updatedPost.comments
                  .filter((c): c is ServiceComment & { _id: string } => c._id !== undefined)
                  .map((c: ServiceComment & { _id: string }) => ({
                    ...c,
                    userName: currentUser.name,
                    userImage: currentUser.profileImage,
                  })) as Comment[],
              }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleFollowUser = async (userId: string) => {
    try {
      const isFollowing = following.has(userId);
      const updatedFollowers = isFollowing
        ? await postService.unfollowUser(userId)
        : await postService.followUser(userId);
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

  const renderCarousel = () => (
    <div className="relative w-full mx-auto overflow-hidden">
      <style>{scrollbarHideStyles}</style>

      {!isMobile && focusedIndex > 0 && (
        <button
          onClick={() => smoothTransition(focusedIndex - 1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white h-12 w-12 rounded-full flex items-center justify-center hover:bg-black/50 transition-colors z-20"
          aria-label="Previous post"
        >
          <span className="text-2xl">←</span>
        </button>
      )}

      {!isMobile && focusedIndex < posts.length - 1 && (
        <button
          onClick={() => smoothTransition(focusedIndex + 1)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 text-white h-12 w-12 rounded-full flex items-center justify-center hover:bg-black/50 transition-colors z-20"
          aria-label="Next post"
        >
          <span className="text-2xl">→</span>
        </button>
      )}

      <div
        ref={carouselRef}
        className="relative overflow-hidden hide-scrollbar"
        style={{
          height: isMobile ? 'calc(100vh - 60px)' : '80vh',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-all duration-500 ease-out"
          style={{
            transform: isMobile
              ? `translateX(calc(-${focusedIndex * 100}%))`
              : `translateX(calc(50% - ${focusedIndex * 33.33}% - 16.665%))`,
            height: '100%',
            willChange: 'transform',
          }}
        >
          {posts.map((post: PostWithUser, index: number) => {
            const distance = Math.abs(index - focusedIndex);
            const scale = isMobile ? (distance === 0 ? 1 : 0.9) : 1 - distance * 0.1;
            const opacity = isMobile ? (distance === 0 ? 1 : 0.5) : 1 - distance * 0.3;
            const zIndex = posts.length - distance;
            const isFollowing = following.has(post.user._id);

            return (
              <div
                key={post._id}
                className="flex-shrink-0 transition-all duration-500 px-4"
                style={{
                  width: isMobile ? '100%' : '33.33%',
                  transform: `scale(${scale})`,
                  opacity,
                  zIndex,
                  position: 'relative',
                  height: '100%',
                  filter: distance > 0 ? `blur(${distance * (isMobile ? 0.5 : 1)}px)` : 'none',
                  pointerEvents: distance > 0 ? 'none' : 'auto',
                  scrollSnapAlign: index === focusedIndex ? 'center' : 'none',
                }}
              >
                <PostCard
                  post={post}
                  isFocused={index === focusedIndex}
                  onLike={handleLikePost}
                  onUnLike={handleUnLikePost}
                  onComment={handleCommentPost}
                  onSave={handleSavePost}
                  onFollow={handleFollowUser}
                  currentUserId={currentUser?._id || 'default-user-id'}
                  onClick={() => smoothTransition(index)}
                  isFollowing={isFollowing}
                />

                {!isMobile && distance > 0 && (
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center cursor-pointer z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      smoothTransition(index);
                    }}
                  >
                    <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center">
                      <span className="text-xl">▶</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center mt-2 md:mt-6 space-x-2">
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => smoothTransition(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === focusedIndex
                ? 'bg-primary w-6 md:w-8'
                : 'bg-secondary/70 w-2 hover:bg-secondary hover:w-3 md:hover:w-4'
            }`}
            aria-label={`Go to post ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-b from-background to-muted ${isMobile ? 'pt-2' : 'py-12 px-4'}`}>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-lg">No posts to show</div>
      ) : (
        renderCarousel()
      )}
    </div>
  );
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  isFocused,
  onLike,
  onUnLike,
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

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
      if (tapCount === 1 && !isLiked) {
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
    if (diffSec < 60) return 'Just now';
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
      className={`bg-card rounded-xl md:rounded-2xl shadow-md overflow-hidden transition-all duration-300 h-full flex flex-col ${
        isFocused ? 'scale-100 shadow-xl' : 'scale-95 shadow-md'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 md:p-3 border-b border-border">
        <div className="flex items-center space-x-2 md:space-x-3">
          <img
            src={post.user.profileImage || '/default-avatar.png'}
            alt={post.user.name}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-border"
          />
          <div>
            <h3 className="font-semibold text-foreground text-xs md:text-sm hover:underline cursor-pointer">
              {post.user.name}
            </h3>
            <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        {currentUserId !== post.user._id && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFollow?.(post.user._id);
            }}
            className={`text-xs md:text-sm font-medium px-2 py-1 md:px-3 md:py-1 rounded-full transition-all duration-200 ${
              isFollowing
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Media/Content */}
      <div className="relative flex-1 bg-muted" onTouchStart={handleDoubleTap} onDoubleClick={handleDoubleTap}>
        {post.media?.length ? (
          isVideo(post.media[0]) ? (
            <video src={post.media[0]} controls className="w-full h-full object-cover" playsInline />
          ) : (
            <img
              src={post.media[0]}
              alt={post.content}
              className="w-full h-full object-cover"
              loading="eager"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <p className="text-muted-foreground text-center text-sm md:text-base">{post.content}</p>
          </div>
        )}
        {likeAnimation && (
          <Heart className="absolute inset-0 m-auto w-16 h-16 md:w-24 md:h-24 text-destructive fill-current animate-ping" />
        )}
      </div>

      {/* Actions and Engagement Info */}
      <div className="p-2 md:p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex space-x-2 md:space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isLiked) {
                  onUnLike(post._id);
                } else {
                  onLike(post._id);
                }
              }}
              className={`p-1 rounded-full hover:bg-muted transition-colors ${
                isLiked ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors">
              <Send className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(post._id);
            }}
            className="p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
          >
            <Bookmark className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Engagement Info */}
        <div className="space-y-1 mb-2">
          <p className="text-xs md:text-sm font-semibold text-foreground">{post.likes.length} likes</p>
          {post.content && (
            <p className="text-xs md:text-sm text-foreground">
              <span className="font-semibold hover:underline cursor-pointer">{post.user.name}</span>{' '}
              {post.content.length > 100 && isMobile
                ? `${post.content.substring(0, 100)}...`
                : post.content}
            </p>
          )}
          {post.comments.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View all {post.comments.length} comments
            </button>
          )}
        </div>

        {/* Comment Input */}
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            handleSubmitComment(e);
          }}
          className="flex items-center bg-card border-t border-border pt-1 pb-2 px-2 md:pt-1 md:pb-3 md:px-3"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add a comment..."
            className="flex-1 bg-muted p-2 rounded-full text-xs md:text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="ml-2 md:ml-3 text-primary font-medium text-xs md:text-sm disabled:text-muted-foreground hover:text-primary/80 transition-colors"
          >
            Post
          </button>
        </form>
      </div>

      {/* Comment Modal */}
      {showComments && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={modalRef}
            className="bg-card w-full max-w-md rounded-xl max-h-[80vh] flex flex-col overflow-hidden shadow-xl"
          >
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Comments</h3>
              <button onClick={() => setShowComments(false)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex items-start space-x-3">
                  <img
                    src={comment.userImage || '/default-avatar.png'}
                    alt={comment.userName || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold hover:underline cursor-pointer">
                        {comment.userName || 'User'}
                      </span>{' '}
                      {comment.commentText}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</p>
                      <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                        Like
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmitComment} className="p-4 border-t border-border flex items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-muted p-2 rounded-full text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="ml-3 text-primary font-medium text-sm disabled:text-muted-foreground hover:text-primary/80 transition-colors"
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