import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Send, Bookmark, X, MoreHorizontal, Grid3x3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import postService, { ConnectionStatusResult } from '../../services/post/postService';
import { Post, Comment } from '../../types/post/post.types';
import ShareModal from '../../components/basics/ShareModal';
import { setSelectedContact } from '../../redux/features/chat/chatSlice';
import { setSelectedGroup } from '../../redux/features/chat/groupSlice';
import type { UserList } from '../../types/chat/types';

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
  onLike: (postId: string) => void;
  onUnLike: (postId: string) => void;
  onCommentCountChange: (postId: string, delta: number) => void;
  onSave: (postId: string) => void;
  onShare?: (postId: string) => void;
  onConnect: (userId: string) => void;
  onCancelRequest: (userId: string) => void;
  onRespondToRequest: (userId: string, accept: boolean) => void;
  onMessage: (user: IUser) => void;
  currentUserId: string;
  connectionStatus: ConnectionStatusResult;
  isConnectionBusy: boolean;
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
  @keyframes heart-pop {
    0% { transform: scale(0); opacity: 0; }
    15% { transform: scale(1.2); opacity: 1; }
    30% { transform: scale(0.95); }
    45% { transform: scale(1); }
    80% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1); opacity: 0; }
  }
  .animate-heart-pop {
    animation: heart-pop 0.9s ease-out forwards;
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.2s ease-out forwards;
  }
`;

// Post.userid comes back either as a populated object or a raw id string
// depending on the endpoint — this is the only place SocialPost needs it.
const getUserIdString = (u: string | { _id: string }): string =>
  typeof u === 'string' ? u : u._id;

// Centralized "go to a profile" navigation helper. Own profile always goes
// to /profile (no id in the URL); anyone else's goes to /profile/:id.
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

const formatTimeAgo = (date?: Date) => {
  if (!date) return '';
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  const diffWeek = Math.floor(diffDay / 7);
  return `${diffWeek}w`;
};

const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

const SocialPost: React.FC = () => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetPostId, setShareTargetPostId] = useState<string | null>(null);

  // ---- Connection state (replaces the "following" Set) --------------------
  // Keyed by the *other* user's id, since a single feed can show posts from
  // many different authors at once.
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, ConnectionStatusResult>>({});
  const [connectionBusyIds, setConnectionBusyIds] = useState<Set<string>>(new Set());
  // -------------------------------------------------------------------------

  // Grid tile that was tapped -> which post the full-screen scroll view
  // should open on. null means the grid is showing, not the scroll view.
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const feedRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await postService.getCurrentUser();
        setCurrentUser({
          ...user,
          role: user.role === 'entrepreneur' || user.role === 'investor' ? user.role : undefined,
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

        // Fetch each unique author's connection status in parallel, once,
        // rather than re-fetching per post.
        const uniqueAuthorIds = Array.from(new Set(postsWithUsers.map((p) => p.user._id)));
        const statusEntries = await Promise.all(
          uniqueAuthorIds.map(async (authorId) => {
            try {
              const status = await postService.getConnectionStatus(authorId);
              return [authorId, status] as const;
            } catch (error) {
              console.error('Failed to load connection status for', authorId, error);
              return [authorId, { status: 'none' } as ConnectionStatusResult] as const;
            }
          })
        );
        setConnectionStatuses(Object.fromEntries(statusEntries));
      } catch (error) {
        console.error('Failed to load user posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUserPosts();
  }, []);

  // Open the full-screen scroll view on a specific post, then jump the
  // scroll container straight to that card (no animation — it should feel
  // like the grid tile expanded into place, not like a scroll happened).
  const openPostAt = (index: number) => {
    setFocusedIndex(index);
    setOpenIndex(index);
  };

  useEffect(() => {
    if (openIndex === null) return;
    const card = cardRefs.current[openIndex];
    const container = feedRef.current;
    if (card && container) {
      container.scrollTo({ top: card.offsetTop, behavior: 'auto' });
    }
  }, [openIndex]);

  // Lock page scroll while the full-screen view is open.
  useEffect(() => {
    if (openIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [openIndex]);

  // Tracks which card is centered in the snap feed so we can highlight it
  // (subtle scale/opacity) and only autoplay its video.
  const handleScroll = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const container = feedRef.current;
      if (!container) return;
      const containerCenter = container.scrollTop + container.clientHeight / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCenter = card.offsetTop + card.clientHeight / 2;
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
    const container = feedRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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

  const handleOpenShareModal = (postId: string) => {
    setShareTargetPostId(postId);
    setIsShareModalOpen(true);
  };

  // Comments live inside PostCard now (fetched lazily, only when the
  // comment sheet opens). This just keeps the card's totalComments count
  // in sync with everyone else's copy of the post.
  const handleCommentCountChange = (postId: string, delta: number) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, totalComments: p.totalComments + delta } : p))
    );
  };

  // ---- Connection actions (replaces handleFollowUser) ----------------------
  const withConnectionBusy = async (userId: string, action: () => Promise<void>) => {
    setConnectionBusyIds((prev) => new Set(prev).add(userId));
    try {
      await action();
    } catch (error) {
      console.error('Connection action failed:', error);
    } finally {
      setConnectionBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleConnect = (userId: string) =>
    withConnectionBusy(userId, async () => {
      const created = await postService.sendConnectionRequest(userId);
      setConnectionStatuses((prev) => ({
        ...prev,
        [userId]: { status: 'pending', connectionId: created._id, isRequester: true },
      }));
    });

  const handleCancelRequest = (userId: string) =>
    withConnectionBusy(userId, async () => {
      const connectionId = connectionStatuses[userId]?.connectionId;
      if (!connectionId) return;
      await postService.cancelConnectionRequest(connectionId);
      setConnectionStatuses((prev) => ({ ...prev, [userId]: { status: 'none' } }));
    });

  const handleRespondToRequest = (userId: string, accept: boolean) =>
    withConnectionBusy(userId, async () => {
      const connectionId = connectionStatuses[userId]?.connectionId;
      if (!connectionId) return;
      await postService.respondToConnectionRequest(connectionId, accept);
      setConnectionStatuses((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], status: accept ? 'accepted' : 'rejected' },
      }));
    });

  // Opens a chat with a post author — only reachable once the two users are
  // connected (see PostCard's connection button below).
  const handleMessageUser = (user: IUser) => {
    const contact: UserList = {
      _id: user._id,
      name: user.name || 'User',
      email: user.email || '',
    };

    dispatch(setSelectedGroup(null));
    dispatch(setSelectedContact(contact));

    navigate('/chat');
  };
  // -------------------------------------------------------------------------

  // ---- Explore grid (3 columns, tap to open) -------------------------------
  const renderGrid = () => (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-4 flex items-center justify-between border-b border-border/70 px-3 py-5 md:px-0">
        <div className="flex items-center gap-2.5 text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Grid3x3 className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-wide">Explore posts</span>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {posts.length} posts
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 min-[480px]:grid-cols-3 sm:grid-cols-4 md:gap-2 lg:grid-cols-5">
        {posts.map((post, index) => (
          <button
            key={post._id}
            onClick={() => openPostAt(index)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 md:rounded-xl"
          >
            {post.media?.length ? (
              isVideo(post.media[0]) ? (
                <video src={post.media[0]} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img
                  src={post.media[0]}
                  alt={post.content}
                  className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  loading="lazy"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2 bg-gradient-to-br from-muted to-muted/70">
                <p className="text-foreground text-[9px] md:text-[10px] text-center line-clamp-4 leading-tight">{post.content}</p>
              </div>
            )}
            {post.media && post.media.length > 1 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 text-white drop-shadow">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M4 4h12v2H6v10H4V4zm4 4h12v12H8V8zm2 2v8h8v-8h-8z" />
                </svg>
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 hidden sm:flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <span className="flex items-center gap-1 text-white text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 fill-white" /> {post.totalLikes}
              </span>
              <span className="flex items-center gap-1 text-white text-xs font-semibold">
                <MessageCircle className="w-3.5 h-3.5 fill-white" /> {post.totalComments}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ---- Full-screen, snap-scroll card view ----------------------------------
  const renderFullScreenFeed = () => (
    <div className="fixed inset-0 z-50 flex animate-fade-in flex-col bg-background">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-xl">
        <span className="text-foreground text-sm font-semibold tracking-wide">
          {focusedIndex + 1} / {posts.length}
        </span>
        <button
          onClick={() => setOpenIndex(null)}
          className="text-foreground rounded-full p-2 hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div
        ref={feedRef}
        className="flex-1 min-h-0 overflow-y-auto hide-scrollbar"
        style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
      >
        {posts.map((post, index) => (
          <div
            key={post._id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="h-full w-full flex items-center justify-center px-0 sm:px-6 py-2 sm:py-4"
            style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
          >
            <PostCard
              post={post}
              isFocused={index === focusedIndex}
              onLike={handleLikePost}
              onUnLike={handleUnLikePost}
              onCommentCountChange={handleCommentCountChange}
              onSave={handleSavePost}
              onShare={handleOpenShareModal}
              onConnect={handleConnect}
              onCancelRequest={handleCancelRequest}
              onRespondToRequest={handleRespondToRequest}
              onMessage={handleMessageUser}
              currentUserId={currentUser?._id || 'default-user-id'}
              connectionStatus={connectionStatuses[post.user._id] ?? { status: 'none' }}
              isConnectionBusy={connectionBusyIds.has(post.user._id)}
              isSaved={post._id ? savedPosts.has(post._id) : false}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="surface-gradient w-full">
      <style>{scrollbarHideStyles}</style>

      {isLoading ? (
        <div className="flex min-h-[60dvh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/70 bg-card shadow-soft">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-foreground text-lg font-semibold">No posts yet</p>
          <p className="text-muted-foreground text-sm mt-1">When people share posts, they'll show up here.</p>
        </div>
      ) : (
        renderGrid()
      )}

      {openIndex !== null && renderFullScreenFeed()}

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
  onLike,
  onUnLike,
  onCommentCountChange,
  onSave,
  onShare,
  onConnect,
  onCancelRequest,
  onRespondToRequest,
  onMessage,
  currentUserId,
  connectionStatus,
  isConnectionBusy,
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const isLiked = post.isLiked;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setShowComments(false);
    };
    if (showComments) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showComments]);

  // Video posts autoplay (muted) only while their card is the one snapped
  // into focus, and pause the moment the feed moves on — same idea as
  // Instagram/Reels-style card feeds.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isFocused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isFocused]);

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
      if (tapCount === 1 && post._id) {
        setLikeAnimation(true);
        if (!isLiked) onLike(post._id);
        setTimeout(() => setLikeAnimation(false), 900);
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
  // /profile, anyone else's goes to /profile/:id.
  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    goToProfile(navigate, post.user._id, currentUserId);
  };

  const handleCommentUserClick = (userId?: string) => {
    goToProfile(navigate, userId, currentUserId);
  };

  const getCommentUser = (comment: Comment) =>
    typeof comment.userId === 'object' ? comment.userId : undefined;

  // ---- Connection button (Connect / Pending / Accept+Ignore / Message) ---
  // Same pill shape/size/colors as the original Follow/Following button —
  // only the label, color-per-state, and click behavior change.
  const renderConnectionAction = () => {
    if (connectionStatus.status === 'accepted') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMessage(post.user);
          }}
          className="text-xs font-semibold px-3 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          type="button"
        >
          Message
        </button>
      );
    }

    if (connectionStatus.status === 'pending' && connectionStatus.isRequester) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancelRequest(post.user._id);
          }}
          disabled={isConnectionBusy}
          className="text-xs font-semibold px-3 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
          type="button"
        >
          Pending
        </button>
      );
    }

    if (connectionStatus.status === 'pending' && !connectionStatus.isRequester) {
      return (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRespondToRequest(post.user._id, true);
            }}
            disabled={isConnectionBusy}
            className="text-xs font-semibold px-3 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
            type="button"
          >
            Accept
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRespondToRequest(post.user._id, false);
            }}
            disabled={isConnectionBusy}
            className="text-xs font-semibold px-3 py-1 rounded-lg text-primary hover:opacity-70 transition-colors disabled:opacity-50"
            type="button"
          >
            Ignore
          </button>
        </div>
      );
    }

    // status === 'none' or 'rejected' -> can (re)send a request
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConnect(post.user._id);
        }}
        disabled={isConnectionBusy}
        className="text-xs font-semibold px-3 py-1 rounded-lg text-primary hover:opacity-70 transition-colors disabled:opacity-50"
        type="button"
      >
        Connect
      </button>
    );
  };
  // -------------------------------------------------------------------------

  return (
    <article className="flex h-full w-full max-w-[560px] flex-col overflow-hidden border border-border/70 bg-card shadow-soft sm:rounded-2xl">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/50 px-3 py-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={post.user.profileImage || '/default-avatar.png'}
            alt={post.user.name}
            onClick={handleProfileClick}
            className="h-9 w-9 cursor-pointer rounded-full object-cover ring-2 ring-primary/20 ring-offset-1 ring-offset-card"
          />
          <div className="flex items-center gap-1.5">
            <h3
              onClick={handleProfileClick}
              className="font-semibold text-foreground text-sm leading-none hover:opacity-70 cursor-pointer"
            >
              {post.user.name}
            </h3>
            <span className="text-muted-foreground text-xs leading-none">· {formatTimeAgo(post.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentUserId !== post.user._id && renderConnectionAction()}
          <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media/Content — takes up remaining space in the card */}
      <div
        className="relative bg-black w-full flex-1 min-h-0 select-none"
        onTouchStart={handleDoubleTap}
        onDoubleClick={handleDoubleTap}
      >
        {post.media?.length ? (
          isVideo(post.media[0]) ? (
            <video
              ref={videoRef}
              src={post.media[0]}
              className="w-full h-full object-contain"
              playsInline
              muted
              loop
            />
          ) : (
            <img
              src={post.media[0]}
              alt={post.content}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-muted to-muted/70">
            <p className="text-foreground text-center text-base font-medium">{post.content}</p>
          </div>
        )}
        {likeAnimation && (
          <Heart className="absolute inset-0 m-auto w-24 h-24 text-white fill-current drop-shadow-lg animate-heart-pop pointer-events-none" />
        )}
      </div>

      {/* Action row + caption + composer */}
      <div className="px-3 md:px-4 pt-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center -ml-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!post._id) return;
                if (isLiked) onUnLike(post._id);
                else onLike(post._id);
              }}
              className={`rounded-full p-1.5 transition-colors hover:bg-accent ${
                isLiked ? 'text-destructive' : 'text-foreground'
              }`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openComments();
              }}
              className="rounded-full p-1.5 text-foreground transition-colors hover:bg-accent"
              aria-label="Comment"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (post._id) onShare?.(post._id);
              }}
              className="rounded-full p-1.5 text-foreground transition-colors hover:bg-accent"
              aria-label="Share"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (post._id) onSave(post._id);
            }}
            className={`rounded-full p-1.5 transition-colors hover:bg-accent ${
              isSaved ? 'text-primary' : 'text-foreground'
            }`}
            aria-label={isSaved ? 'Unsave' : 'Save'}
          >
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="space-y-1 mt-1 pb-2">
          <p className="text-sm font-semibold text-foreground">{post.totalLikes} likes</p>
          {post.content && (
            <p className="text-sm text-foreground leading-snug line-clamp-2">
              <span onClick={handleProfileClick} className="font-semibold hover:opacity-70 cursor-pointer">
                {post.user.name}
              </span>{' '}
              {post.content}
            </p>
          )}
          {post.totalComments > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openComments();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
            >
              View all {post.totalComments} comments
            </button>
          )}
          {!!post.totalShare && <p className="text-xs text-muted-foreground">{post.totalShare} shares</p>}
        </div>

        <form
          onSubmit={(e) => {
            e.stopPropagation();
            handleSubmitComment(e);
          }}
          className="-mx-3 flex items-center border-t border-border/60 px-3 py-2.5 md:-mx-4 md:px-4"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="ml-2 rounded-full px-2.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:text-muted-foreground/50"
          >
            Post
          </button>
        </form>
      </div>

      {/* Comment modal */}
      {showComments && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={modalRef}
            className="flex h-full w-full flex-col overflow-hidden bg-card shadow-2xl sm:h-auto sm:max-h-[80dvh] sm:max-w-md sm:rounded-2xl sm:border sm:border-border/70"
          >
            <div className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
              <h3 className="font-semibold text-foreground">Comments</h3>
              <button onClick={() => setShowComments(false)} aria-label="Close comments">
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
              {isLoadingComments ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first to comment.</p>
              ) : (
                comments.map((comment) => {
                  const commentUser = getCommentUser(comment);
                  return (
                    <div key={comment._id} className="flex items-start space-x-3">
                      <img
                        src={commentUser?.profileImage || '/default-avatar.png'}
                        alt={commentUser?.name || 'User'}
                        onClick={() => handleCommentUserClick(commentUser?._id)}
                        className="w-8 h-8 rounded-full object-cover cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          <span
                            onClick={() => handleCommentUserClick(commentUser?._id)}
                            className="font-semibold hover:opacity-70 cursor-pointer"
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
            <form onSubmit={handleSubmitComment} className="flex flex-shrink-0 items-center gap-2 border-t border-border/70 p-4">
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
    </article>
  );
};

export default SocialPost;