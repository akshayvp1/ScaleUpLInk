import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Send, Bookmark, X } from 'lucide-react';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import postService from '../../services/post/postService';
import { Post, Comment as ServiceComment } from '../../types/post/post.types';

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
  isFocused?: boolean;
  onLike: (postId: string) => void;
  onUnLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onSave: (postId: string) => void;
  onFollow?: (userId: string) => void;
  currentUserId: string;
  isFollowing?: boolean;
};

// Enhanced CSS styles
const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  @keyframes scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .post-card {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .post-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  }
  .media-container {
    background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.1));
  }
`;

const SocialPost: React.FC = () => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const postListRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Fetch user and posts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await postService.getCurrentUser();
        setCurrentUser({
          ...user,
          role: user.role && (user.role === 'entrepreneur' || user.role === 'investor') ? user.role : undefined,
        });
        if (user.following) setFollowing(new Set(user.following));
      } catch (error) {
        console.error('Failed to load current user:', error);
        setCurrentUser({
          _id: 'default-user-id',
          name: 'Default User',
          email: 'default@example.com',
          role: undefined,
          followers: [],
          following: [],
        });
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

  // Optimized scroll handler with debouncing
  const handleScroll = useCallback(() => {
    if (!postListRef.current) return;
    const now = Date.now();
    if (now - lastScrollTime.current < 100) return; // Debounce scroll events
    lastScrollTime.current = now;

    const container = postListRef.current;
    const scrollTop = container.scrollTop;
    const windowHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / windowHeight);
    if (newIndex !== selectedPostIndex) {
      setSelectedPostIndex(newIndex);
    }
  }, [selectedPostIndex]);

  useEffect(() => {
    const container = postListRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Smooth scroll to selected post
  useEffect(() => {
    if (selectedPostIndex !== null && postListRef.current) {
      postListRef.current.scrollTo({
        top: selectedPostIndex * postListRef.current.clientHeight,
        behavior: 'smooth',
      });
    }
  }, [selectedPostIndex]);

  // Interaction handlers
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
      alert('Failed to post comment. Please try again.');
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

  const renderExploreGrid = () => (
    <div className="container mx-auto px-4 py-6 bg-gradient-to-b from-background to-muted/20">
      <style>{styles}</style>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5">
        {posts.map((post, index) => (
          <div
            key={post._id}
            className="relative aspect-square overflow-hidden rounded-2xl cursor-pointer group post-card"
            onClick={() => setSelectedPostIndex(index)}
          >
            {post.media?.length ? (
              post.media[0].match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  src={post.media[0]}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  muted
                  playsInline
                  loop
                />
              ) : (
                <img
                  src={post.media[0]}
                  alt={post.content}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              )
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center p-4">
                <p className="text-muted-foreground text-sm text-center font-medium">{post.content}</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <div className="flex space-x-6 text-white">
                <span className="flex items-center font-semibold">
                  <Heart className="w-5 h-5 mr-2" /> {post.likes.length}
                </span>
                <span className="flex items-center font-semibold">
                  <MessageCircle className="w-5 h-5 mr-2" /> {post.comments.length}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFullScreenView = () => (
    <Dialog open={selectedPostIndex !== null} onOpenChange={() => setSelectedPostIndex(null)}>
      <DialogContent
        className="max-w-[100vw] w-full h-[100vh] p-0 bg-black/90 border-none flex items-center justify-center"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div
          ref={postListRef}
          className="w-full h-full overflow-y-auto hide-scrollbar"
          style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
        >
          {posts.map((post, index) => {
            const isFocused = index === selectedPostIndex;
            const isFollowing = following.has(post.user._id);
            return (
              <div
                key={post._id}
                className="min-h-screen flex items-center justify-center snap-start bg-gradient-to-b from-black/20 to-black/40"
              >
                <div
                  className={`w-full max-w-lg mx-auto transition-all duration-500 ${
                    isFocused ? 'scale-100 opacity-100' : 'scale-90 opacity-60'
                  } post-card`}
                >
                  <PostCard
                    post={post}
                    isFocused={isFocused}
                    onLike={handleLikePost}
                    onUnLike={handleUnLikePost}
                    onComment={handleCommentPost}
                    onSave={handleSavePost}
                    onFollow={handleFollowUser}
                    currentUserId={currentUser?._id || 'default-user-id'}
                    isFollowing={isFollowing}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-lg font-medium">No posts to show</div>
      ) : (
        <>
          {renderExploreGrid()}
          {renderFullScreenView()}
        </>
      )}
    </div>
  );
};

const PostCard: React.FC<PostCardProps> = ({
    post,
    isFocused = true,
    onLike,
    onUnLike,
    onComment,
    onSave,
    onFollow,
    currentUserId,
    isFollowing,
  }) => {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [likeAnimation, setLikeAnimation] = useState(false);
    const [tapCount, setTapCount] = useState(0);
    const modalRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
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
  
    const handleSubmitComment = (e: React.MouseEvent) => {
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
        className={`bg-card rounded-2xl overflow-hidden transition-all duration-300 flex flex-col w-full post-card ${
          isFocused ? 'animate-[scale-in_0.4s_cubic-bezier(0.4,0,0.2,1)]' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/95">
          <div className="flex items-center space-x-3">
            <img
              src={post.user.profileImage || '/default-avatar.png'}
              alt={post.user.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-primary/30 transition-transform duration-300 hover:scale-105"
            />
            <div>
              <h3 className="font-semibold text-foreground text-base hover:underline cursor-pointer">
                {post.user.name}
              </h3>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          {currentUserId !== post.user._id && (
            <Button
              variant={isFollowing ? 'secondary' : 'default'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFollow?.(post.user._id);
              }}
              className="rounded-full px-4 transition-all duration-300 hover:scale-105"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
  
        {/* Media/Content */}
        <div
          className="relative media-container"
          onTouchStart={handleDoubleTap}
          onDoubleClick={handleDoubleTap}
        >
          {post.media?.length ? (
            isVideo(post.media[0]) ? (
              <video
                src={post.media[0]}
                controls
                className="w-full h-auto max-h-[60vh] object-contain bg-black"
                playsInline
                autoPlay={isFocused}
                muted
                loop
              />
            ) : (
              <img
                src={post.media[0]}
                alt={post.content}
                className="w-full h-auto max-h-[60vh] object-contain bg-black"
                loading="eager"
              />
            )
          ) : (
            <div className="w-full h-[30vh] flex items-center justify-center p-6 bg-gradient-to-br from-muted to-muted/80">
              <p className="text-muted-foreground text-center text-base font-medium">{post.content}</p>
            </div>
          )}
          {likeAnimation && (
            <Heart
              className="absolute inset-0 m-auto w-32 h-32 text-destructive fill-current animate-[ping_0.8s_ease-out]"
            />
          )}
        </div>
  
        {/* Actions and Engagement Info */}
        <div className="p-4 bg-card/95 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex space-x-5">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isLiked) {
                    onUnLike(post._id);
                  } else {
                    onLike(post._id);
                  }
                }}
                className={`${
                  isLiked ? 'text-destructive' : 'text-muted-foreground'
                } hover:scale-110 transition-transform duration-200`}
              >
                <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(true);
                }}
                className="text-muted-foreground hover:scale-110 transition-transform duration-200"
              >
                <MessageCircle className="w-7 h-7" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:scale-110 transition-transform duration-200"
              >
                <Send className="w-7 h-7" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onSave(post._id);
              }}
              className="text-muted-foreground hover:scale-110 transition-transform duration-200"
            >
              <Bookmark className="w-7 h-7" />
            </Button>
          </div>
  
          {/* Engagement Info */}
          <div className="space-y-2 mb-3 flex-1">
            <p className="text-sm font-semibold text-foreground">{post.likes.length} likes</p>
            {post.content && (
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold hover:underline cursor-pointer">{post.user.name}</span>{' '}
                {post.content.length > 120 && isMobile
                  ? `${post.content.substring(0, 120)}...`
                  : post.content}
              </p>
            )}
            {post.comments.length > 0 && (
              <Button
                variant="link"
                className="text-sm text-muted-foreground hover:text-primary p-0 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(true);
                }}
              >
                View all {post.comments.length} comments
              </Button>
            )}
          </div>
  
          {/* Comment Input */}
          <div className="flex items-center bg-card border-t border-border pt-3 pb-4 px-4 sticky bottom-0 z-10">
            <Input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Add a comment..."
              className="flex-1 rounded-full text-sm border border-border/50 focus:ring-2 focus:ring-primary/20"
            />
            <Button
              variant="link"
              disabled={!commentText.trim()}
              onClick={handleSubmitComment}
              className="ml-4 text-primary text-sm font-semibold disabled:text-muted-foreground hover:scale-105 transition-transform duration-200"
            >
              Post
            </Button>
          </div>
        </div>
  
        {/* Comment Modal */}
        {showComments && (
          <Dialog open={showComments} onOpenChange={setShowComments}>
            <DialogContent className="max-w-md max-h-[80vh] flex flex-col p-0 rounded-2xl bg-card/95 relative z-50">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-foreground text-lg">Comments</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowComments(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
                {post.comments.map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-3">
                    <img
                      src={comment.userImage || '/default-avatar.png'}
                      alt={comment.userName || 'User'}
                      className="w-9 h-9 rounded-full object-cover border border-border/50"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-foreground leading-relaxed">
                        <span className="font-semibold hover:underline cursor-pointer">
                          {comment.userName || 'User'}
                        </span>{' '}
                        {comment.commentText}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.createdAt)}
                        </p>
                        <Button
                          variant="link"
                          className="text-xs text-muted-foreground hover:text-destructive p-0 font-medium"
                        >
                          Like
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border flex items-center sticky bottom-0 bg-card/95 z-10">
                <Input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-full text-sm border border-border/50 focus:ring-2 focus:ring-primary/20"
                />
                <Button
                  variant="link"
                  disabled={!commentText.trim()}
                  onClick={handleSubmitComment}
                  className="ml-4 text-primary text-sm font-semibold disabled:text-muted-foreground hover:scale-105 transition-transform duration-200"
                >
                  Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };
 

export default SocialPost;