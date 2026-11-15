import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Send, Bookmark, X, UserPlus, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import postService, { ConnectionStatusResult } from '../../services/post/postService';
import { Post, Comment } from '../../types/post/post.types';
import ShareModal from '../../components/basics/ShareModal';

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

interface PostWithUser extends Omit<Post, 'userid'> {
  user: IUser;
}

type PostCardProps = {
  post: PostWithUser;
  isFocused: boolean;
  mediaHeight: number;
  onLike: (postId: string) => void;
  onUnLike: (postId: string) => void;
  onCommentCountChange: (postId: string, delta: number) => void;
  onSave: (postId: string) => void;
  onShare?: (postId: string) => void;
  connectionStatus: ConnectionStatusResult;
  isConnectionBusy: boolean;
  onConnect: (userId: string) => Promise<void>;
  onCancelRequest: (connectionId: string) => Promise<void>;
  onRespondToRequest: (connectionId: string, accept: boolean) => Promise<void>;
  currentUserId: string;
  onClick?: () => void;
  isSaved?: boolean;
};

const scrollbarHideStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// How many cards should be visible in the viewport at once.
const VISIBLE_CARDS = 3;
const CARD_GAP_PX = 16;
// How much smaller each card is than the "exactly fills the row" width.
// Lower this to make cards smaller, raise it (max 1) to make them larger.
const CARD_SIZE_SCALE = 0.85;
// Media height is intentionally decoupled from card width (see MEDIA_HEIGHT_SCALE
// below) so that widening/narrowing the card never changes its height.
const MEDIA_HEIGHT_SCALE = 0.54; // equivalent to the previous 0.72-width / 4:3 card

// Post.userid comes back either as a populated object or a raw id string
// depending on the endpoint — this is the only place SocialPost needs it.
const getUserIdString = (u: string | { _id: string }): string =>
  typeof u === 'string' ? u : u._id;

// Centralized "go to a profile" navigation helper. Own profile always goes
// to /profile (no id in the URL); anyone else's goes to /profile/:id.
// Both PostCard's header and the comment list route through this so the
// behavior stays consistent everywhere a user's identity is clickable.
const goToProfile = (
  navigate: ReturnType<typeof useNavigate>,
  targetUserId: string | undefined,
  currentUserId: string
) => {
  if (!targetUserId) return;
  if (targetUserId === currentUserId) {
    navigate('/profile');
  } else {
    navigate(`/profile/${targetUserId}`);
  }
};

const SocialPost: React.FC = () => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatusResult>>({});
  const [connectionBusy, setConnectionBusy] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetPostId, setShareTargetPostId] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafId = useRef<number | null>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollEndTimer = useRef<number | null>(null);

  const [cardWidth, setCardWidth] = useState(0);
  const [mediaHeight, setMediaHeight] = useState(0);
  const [sidePadding, setSidePadding] = useState(0);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      const container = carouselRef.current;
      if (!container) return;
      const visible = isMobile ? Math.min(VISIBLE_CARDS, 1.3) : VISIBLE_CARDS;
      const totalGap = CARD_GAP_PX * (visible - 1);
      const rawWidth = (container.clientWidth - totalGap) / visible;
      const width = Math.max(rawWidth * CARD_SIZE_SCALE, 110);
      setCardWidth(width);
      setMediaHeight(Math.max(rawWidth * MEDIA_HEIGHT_SCALE, 90));
      setSidePadding(Math.max((container.clientWidth - width) / 2, 0));
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [posts.length, isMobile]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await postService.getCurrentUser();
        setCurrentUser({
          ...user,
          role: (user.role === 'entrepreneur' || user.role === 'investor') ? user.role : undefined,
        });

        if (user.savedPost) setSavedPosts(new Set(user.savedPost));
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
              const userData = await postService.getUserById(getUserIdString(post.userid));
              return { ...post, user: userData } as PostWithUser;
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

  // Load connection status for every post author.
  useEffect(() => {
    if (!currentUser?._id || posts.length === 0) return;

    const loadConnectionStatuses = async () => {
      const results = await Promise.all(
        posts.map(async (post) => {
          const userId = post.user._id;
          if (!userId || userId === currentUser._id) return null;

          try {
            const status = await postService.getConnectionStatus(userId);
            return { userId, status };
          } catch (error) {
            console.error(`Failed to get connection status for ${userId}:`, error);
            return { userId, status: { status: 'none' } as ConnectionStatusResult };
          }
        })
      );

      setConnectionStatuses((previous) => {
        const next = { ...previous };
        results.forEach((result) => {
          if (result) next[result.userId] = result.status;
        });
        return next;
      });
    };

    loadConnectionStatuses();
  }, [posts, currentUser?._id]);

  const handleConnect = async (userId: string) => {
    setConnectionBusy((previous) => ({ ...previous, [userId]: true }));
    try {
      const created = await postService.sendConnectionRequest(userId);
      setConnectionStatuses((previous) => ({
        ...previous,
        [userId]: { status: 'pending', connectionId: created._id, isRequester: true },
      }));
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setConnectionBusy((previous) => ({ ...previous, [userId]: false }));
    }
  };

  const handleCancelRequest = async (userId: string, connectionId: string) => {
    setConnectionBusy((previous) => ({ ...previous, [userId]: true }));
    try {
      await postService.cancelConnectionRequest(connectionId);
      setConnectionStatuses((previous) => ({ ...previous, [userId]: { status: 'none' } }));
    } catch (error) {
      console.error('Error cancelling connection request:', error);
    } finally {
      setConnectionBusy((previous) => ({ ...previous, [userId]: false }));
    }
  };

  const handleRespondToRequest = async (userId: string, connectionId: string, accept: boolean) => {
    setConnectionBusy((previous) => ({ ...previous, [userId]: true }));
    try {
      await postService.respondToConnectionRequest(connectionId, accept);
      setConnectionStatuses((previous) => ({
        ...previous,
        [userId]: { status: accept ? 'accepted' : 'rejected' },
      }));
    } catch (error) {
      console.error('Error responding to connection request:', error);
    } finally {
      setConnectionBusy((previous) => ({ ...previous, [userId]: false }));
    }
  };

  const smoothTransition = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= posts.length) return;
      const card = cardRefs.current[targetIndex];
      const container = carouselRef.current;
      if (!card || !container) return;

      isProgrammaticScroll.current = true;
      const offset = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
      container.scrollTo({ left: offset, behavior: 'smooth' });
      setFocusedIndex(targetIndex);

      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = window.setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 350);
    },
    [posts.length]
  );

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    const handleScrollEnd = () => {
      isProgrammaticScroll.current = false;
      if (scrollEndTimer.current) {
        window.clearTimeout(scrollEndTimer.current);
        scrollEndTimer.current = null;
      }
    };
    container.addEventListener('scrollend', handleScrollEnd);
    return () => container.removeEventListener('scrollend', handleScrollEnd);
  }, []);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) return;

      const canScrollRight = container.scrollLeft + container.clientWidth < container.scrollWidth - 1;
      const canScrollLeft = container.scrollLeft > 1;

      if ((delta > 0 && canScrollRight) || (delta < 0 && canScrollLeft)) {
        e.preventDefault();
        container.scrollLeft += delta;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const container = carouselRef.current;
      if (!container) return;
      const containerCenter = container.scrollLeft + container.clientWidth / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setFocusedIndex((prev) => (prev === closestIndex ? prev : closestIndex));
    });
  }, []);

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

  const handleLikePost = async (postId: string) => {
    try {
      const result = await postService.likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, isLiked: result.liked, totalLikes: result.totalLikes } : p
        )
      );
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleUnLikePost = async (postId: string) => {
    try {
      const result = await postService.unLikePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, isLiked: result.liked, totalLikes: result.totalLikes } : p
        )
      );
    } catch (error) {
      console.error('Failed to unlike post:', error);
    }
  };

  // ---- Save / Unsave ------------------------------------------------------
  // Optimistic toggle first (snappy UI), then reconcile with whatever the
  // server actually says is saved, and roll back cleanly on failure.
  const handleSavePost = async (postId: string) => {
    const wasSaved = savedPosts.has(postId);

    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (wasSaved) next.delete(postId);
      else next.add(postId);
      return next;
    });

    try {
      const { savedPost } = await postService.savePost(postId);
      setSavedPosts(new Set(savedPost));
    } catch (error) {
      console.error('Failed to save post:', error);
      setSavedPosts((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.add(postId);
        else next.delete(postId);
        return next;
      });
    }
  };
  // -------------------------------------------------------------------------

  // ---- Share ---------------------------------------------------------------
  const handleOpenShareModal = (postId: string) => {
    setShareTargetPostId(postId);
    setIsShareModalOpen(true);
  };
  // ---------------------------------------------------------------------------

  // Comments live inside PostCard now (fetched lazily, only when the
  // comment sheet opens). This just keeps the card's totalComments count
  // in sync with everyone else's copy of the post.
  const handleCommentCountChange = (postId: string, delta: number) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, totalComments: p.totalComments + delta } : p))
    );
  };

  const renderCarousel = () => (
    <div className="relative w-full mx-auto overflow-hidden">
      <style>{scrollbarHideStyles}</style>

      {!isMobile && focusedIndex > 0 && (
        <button
          onClick={() => smoothTransition(focusedIndex - 1)}
          className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/35 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-slate-950/55"
          aria-label="Previous post"
        >
          <span className="text-2xl">←</span>
        </button>
      )}

      {!isMobile && focusedIndex < posts.length - 1 && (
        <button
          onClick={() => smoothTransition(focusedIndex + 1)}
          className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-slate-950/35 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-slate-950/55"
          aria-label="Next post"
        >
          <span className="text-2xl">→</span>
        </button>
      )}

      <div
        ref={carouselRef}
        onScroll={handleScroll}
        className="flex items-center overflow-x-auto overflow-y-hidden hide-scrollbar py-1"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          overscrollBehaviorX: 'contain',
          paddingLeft: CARD_GAP_PX,
          paddingRight: sidePadding,
          gap: CARD_GAP_PX,
        }}
      >
        {posts.map((post: PostWithUser, index: number) => {
          const distance = Math.abs(index - focusedIndex);
          const scale = distance === 0 ? 1 : Math.max(1 - distance * 0.08, 0.85);
          const opacity = distance === 0 ? 1 : Math.max(1 - distance * 0.3, 0.5);

          return (
            <div
              key={post._id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className="flex-shrink-0"
              style={{
                width: cardWidth || undefined,
                scrollSnapAlign: 'center',
                transform: `scale(${scale})`,
                opacity,
                transition: 'transform 120ms ease-out, opacity 120ms ease-out',
              }}
            >
              <PostCard
                post={post}
                isFocused={index === focusedIndex}
                mediaHeight={mediaHeight}
                onLike={handleLikePost}
                onUnLike={handleUnLikePost}
                onCommentCountChange={handleCommentCountChange}
                onSave={handleSavePost}
                onShare={handleOpenShareModal}
                currentUserId={currentUser?._id || 'default-user-id'}
                onClick={() => smoothTransition(index)}
                connectionStatus={
                  currentUser?._id === post.user._id
                    ? { status: 'accepted' }
                    : connectionStatuses[post.user._id] || { status: 'none' }
                }
                isConnectionBusy={connectionBusy[post.user._id] || false}
                onConnect={handleConnect}
                onCancelRequest={(connectionId) => handleCancelRequest(post.user._id, connectionId)}
                onRespondToRequest={(connectionId, accept) =>
                  handleRespondToRequest(post.user._id, connectionId, accept)
                }
                isSaved={post._id ? savedPosts.has(post._id) : false}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-1 space-x-2">
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
    <div className="surface-gradient w-full">
      {isLoading ? (
        <div className="flex min-h-[50dvh] items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-foreground">No posts to show</p>
          <p className="mt-1 text-sm text-muted-foreground">New community posts will appear here.</p>
        </div>
      ) : (
        renderCarousel()
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareTargetPostId(null);
        }}
        postId={shareTargetPostId}
        followerIds={(currentUser?.followers as unknown as string[]) ?? []}
        followingIds={(currentUser?.following as unknown as string[]) ?? []}
      />
    </div>
  );
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  isFocused,
  mediaHeight,
  onLike,
  onUnLike,
  onCommentCountChange,
  onSave,
  onShare,
  currentUserId,
  onClick,
  connectionStatus,
  isConnectionBusy,
  onConnect,
  onCancelRequest,
  isSaved,
}) => {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const isLiked = post.isLiked;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setShowComments(false);
    };
    if (showComments) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showComments]);

  // Comments aren't embedded in the post payload anymore — fetch them the
  // first time the sheet opens, and cache locally after that.
  const loadComments = async () => {
    if (commentsLoaded || isLoadingComments || !post._id) return;
    setIsLoadingComments(true);
    try {
      const fetched = await postService.getComments(post._id);
      setComments(fetched);
      setCommentsLoaded(true);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const openComments = () => {
    setShowComments(true);
    loadComments();
  };

  const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setTapCount((prev) => prev + 1);
    setTimeout(() => {
      if (tapCount === 1 && !isLiked && post._id) {
        setLikeAnimation(true);
        onLike(post._id);
        setTimeout(() => setLikeAnimation(false), 800);
      }
      setTapCount(0);
    }, 300);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post._id) return;
    try {
      const newComment = await postService.addComment(post._id, commentText);
      setComments((prev) => [...prev, newComment]);
      setCommentsLoaded(true);
      onCommentCountChange(post._id, 1);
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Takes the visitor to the post author's profile — own profile goes to
  // /profile, anyone else's goes to /profile/:id. stopPropagation matters
  // here because the whole card also has its own onClick (carousel focus) —
  // without it, clicking the name would both navigate away AND scroll the
  // carousel to this card right before the page changes.
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToProfile(navigate, post.user._id, currentUserId);
  };

  // Same idea, but for whoever left a comment. Comments render inside a
  // modal that already stops propagation on its outer overlay, so no extra
  // stopPropagation is needed on the click itself.
  const handleCommentUserClick = (userId?: string) => {
    goToProfile(navigate, userId, currentUserId);
  };

  const formatTimeAgo = (date?: Date) => {
    if (!date) return '';
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

  const getCommentUser = (comment: Comment) =>
    typeof comment.userId === 'object' ? comment.userId : undefined;

  const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <div
      ref={cardRef}
      className={`flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 ${
        isFocused ? 'shadow-float' : 'shadow-soft'
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 p-3 md:p-3.5">
        <div className="flex items-center space-x-2.5 md:space-x-3">
          <img
            src={post.user.profileImage || '/default-avatar.png'}
            alt={post.user.name}
            onClick={handleProfileClick}
            className="h-9 w-9 cursor-pointer rounded-full object-cover ring-2 ring-primary/20 md:h-10 md:w-10"
          />
          <div>
            <h3
              onClick={handleProfileClick}
              className="cursor-pointer text-xs font-semibold text-foreground hover:text-primary md:text-sm"
            >
              {post.user.name}
            </h3>
            <p className="text-[11px] text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
          </div>
        </div>
        {currentUserId !== post.user._id && (
          <>
            {connectionStatus.status === 'accepted' ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
              >
                <Check className="w-4 h-4" />
                <span>Connected</span>
              </div>
            ) : connectionStatus.status === 'pending' && connectionStatus.isRequester ? (
              <button
                type="button"
                disabled={isConnectionBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  if (connectionStatus.connectionId) {
                    onCancelRequest(connectionStatus.connectionId);
                  }
                }}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <Clock className="w-4 h-4" />
                <span>Pending</span>
              </button>
            ) : connectionStatus.status === 'pending' ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
              >
                <Clock className="w-4 h-4" />
                <span>Pending</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={isConnectionBusy}
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect(post.user._id);
                }}
                className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isConnectionBusy ? 'Connecting...' : 'Connect'}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Media/Content */}
      <div
        className="relative overflow-hidden bg-muted"
        style={{ height: mediaHeight || undefined }}
        onTouchStart={handleDoubleTap}
        onDoubleClick={handleDoubleTap}
      >
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
      <div className="p-3 md:p-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex space-x-1 md:space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!post._id) return;
                if (isLiked) {
                  onUnLike(post._id);
                } else {
                  onLike(post._id);
                }
              }}
              className={`rounded-full p-1.5 transition-colors hover:bg-accent ${
                isLiked ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openComments();
              }}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (post._id) onShare?.(post._id);
              }}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Send className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (post._id) onSave(post._id);
            }}
            className={`rounded-full p-1.5 transition-colors hover:bg-accent ${
              isSaved ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Bookmark className={`w-5 h-5 md:w-6 md:h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Engagement Info */}
        <div className="space-y-1 mb-2">
          <p className="text-xs md:text-sm font-semibold text-foreground">{post.totalLikes} likes</p>
          {post.content && (
            <p className="text-xs md:text-sm text-foreground">
              <span onClick={handleProfileClick} className="font-semibold hover:underline cursor-pointer">
                {post.user.name}
              </span>{' '}
              {post.content.length > 100 && isMobile
                ? `${post.content.substring(0, 100)}...`
                : post.content}
            </p>
          )}
          {post.totalComments > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openComments();
              }}
              className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View all {post.totalComments} comments
            </button>
          )}
          {!!post.totalShare && (
            <p className="text-xs md:text-sm text-muted-foreground">{post.totalShare} shares</p>
          )}
        </div>

        {/* Comment Input */}
        <form
          onSubmit={(e) => {
            e.stopPropagation();
            handleSubmitComment(e);
          }}
          className="mt-2 flex items-center gap-2 border-t border-border/60 pt-3"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add a comment..."
            className="flex-1 rounded-full border border-border/60 bg-muted/50 px-3 py-2 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-card md:text-sm"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="rounded-full px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:text-muted-foreground md:text-sm"
          >
            Post
          </button>
        </form>
      </div>

      {/* Comment Modal */}
      {showComments && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={modalRef}
            className="flex max-h-[80dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl"
          >
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-foreground">Comments</h3>
              <button onClick={() => setShowComments(false)}>
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No comments yet.</p>
              ) : (
                comments.map((comment) => {
                  const commentUser = getCommentUser(comment);
                  return (
                    <div key={comment._id} className="flex items-start space-x-3">
                      <img
                        src={commentUser?.profileImage || '/default-avatar.png'}
                        alt={commentUser?.name || 'User'}
                        onClick={() => handleCommentUserClick(commentUser?._id)}
                        className="w-8 h-8 rounded-full object-cover cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          <span
                            onClick={() => handleCommentUserClick(commentUser?._id)}
                            className="font-semibold hover:underline cursor-pointer"
                          >
                            {commentUser?.name || 'User'}
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
                  );
                })
              )}
            </div>
            <form onSubmit={handleSubmitComment} className="flex items-center gap-2 border-t border-border/70 p-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-full border border-border/60 bg-muted/50 px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-card"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="rounded-full px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:text-muted-foreground"
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