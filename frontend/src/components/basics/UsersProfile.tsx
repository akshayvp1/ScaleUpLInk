import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  Briefcase, User, MessageCircle, Heart, MoreHorizontal,
  ChevronLeft, ChevronRight, X, ArrowLeft, UserPlus, UserMinus, Clock, Check, Lock
} from 'lucide-react';
import authService from '../../services/user/authService';
import { IUser, UserRole } from '../../types/auth/auth.types';
import postService, { ConnectionRecord, ConnectionStatusResult } from '../../services/post/postService';
import { Post, Comment } from '../../types/post/post.types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/app/store';
import { setSelectedContact } from '../../redux/features/chat/chatSlice';
import { setSelectedGroup } from '../../redux/features/chat/groupSlice';
import type { UserList } from '../../types/chat/types';

// Minimal shape needed to render a row in the list modal — works for both
// full IUser results and the lighter requester/recipient objects that come
// back on a ConnectionRecord.
interface ProfileListUser {
  _id: string;
  name?: string;
  profileImage?: string;
  profession?: string;
  role?: string;
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: ProfileListUser[];
  isLoading: boolean;
}

const getCommentUser = (comment: Comment) =>
  typeof comment.userId === 'object' ? comment.userId : undefined;

// Given a connection record and the profile page's owner id, returns
// whichever side of the connection is the OTHER person — i.e. the one
// that should show up in the "Connections" list, not the profile owner.
const getOtherPartyInConnection = (connection: ConnectionRecord, profileId: string): ProfileListUser =>
  connection.requester._id === profileId ? connection.recipient : connection.requester;

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, title, users, isLoading }) => {
  const navigate = useNavigate();

  const handleUserClick = (userId: string) => {
    onClose();
    navigate(`/profile/${userId}`);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-float">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <h3 className="mb-6 text-xl font-semibold text-foreground [font-family:var(--font-display)]">{title}</h3>
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">No {title.toLowerCase()} yet.</p>
        ) : (
          <div className="max-h-[60dvh] space-y-1 overflow-y-auto">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex cursor-pointer items-center rounded-xl p-2 transition-colors hover:bg-muted"
                onClick={() => handleUserClick(user._id)}
              >
                <img
                  src={user.profileImage || 'https://via.placeholder.com/40'}
                  alt={user.name || 'User'}
                  className="mr-3 h-10 w-10 rounded-full object-cover ring-1 ring-border"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name || 'Unnamed User'}</p>
                  <p className="text-xs text-muted-foreground">{user.profession || user.role || 'No profession'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const OtherProfileComponent: React.FC = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentTempUser = useSelector((state: RootState) => state.tempUser.tempUser) as IUser | null;

  const [profileData, setProfileData] = useState<IUser | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // ---- Connection state (replaces isFollowing / isFollowBusy) -----------
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusResult>({ status: 'none' });
  const [isConnectionBusy, setIsConnectionBusy] = useState(false);
  const [connectionsList, setConnectionsList] = useState<ConnectionRecord[]>([]);
  const [isConnectionsLoading, setIsConnectionsLoading] = useState(false);
  // -------------------------------------------------------------------------

  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);

  // Load the target user's profile.
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);
      setImageError(false);
      try {
        const user = await authService.getUserById(userId);
        if (!user) {
          setProfileError('This profile could not be found.');
          return;
        }
        setProfileData(user);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfileError('Failed to load this profile.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Load the target user's posts.
  useEffect(() => {
    if (!userId) return;

    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      setPostsError(null);
      try {
        const fetchedPosts: Post[] = await postService.getPostByUserId(userId);
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setPostsError('Failed to load posts');
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [userId]);

  // Load the connection status between the viewer and this profile, plus
  // this profile's accepted connections (for the stat + list modal).
  useEffect(() => {
    if (!userId) return;

    const fetchConnectionStatus = async () => {
      try {
        const status = await postService.getConnectionStatus(userId);
        setConnectionStatus(status);
      } catch (err) {
        console.error('Error fetching connection status:', err);
      }
    };

    const fetchConnectionsList = async () => {
      setIsConnectionsLoading(true);
      try {
        const list = await postService.getConnectionsForUser(userId);
        setConnectionsList(list);
      } catch (err) {
        console.error('Error fetching connections list:', err);
      } finally {
        setIsConnectionsLoading(false);
      }
    };

    fetchConnectionStatus();
    fetchConnectionsList();
  }, [userId]);

  // Comments
  useEffect(() => {
    if (!selectedPost?._id) {
      setPostComments([]);
      return;
    }

    let cancelled = false;
    const loadComments = async () => {
      setIsLoadingComments(true);
      try {
        const comments = await postService.getComments(selectedPost._id!);
        if (!cancelled) setPostComments(comments);
      } catch (err) {
        console.error('Error fetching comments:', err);
        if (!cancelled) toast.error('Failed to load comments');
      } finally {
        if (!cancelled) setIsLoadingComments(false);
      }
    };

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [selectedPost?._id]);

  // ✅ Message button handler – opens chat with this user.
  // Only reachable once connectionStatus.status === 'accepted' (see the
  // button rendering below) — nobody can jump into a chat with someone
  // who hasn't accepted a connection request.
  const handleMessageClick = () => {
    if (!profileData) return;

    const contact: UserList = {
      _id: (profileData._id || profileData.id || userId) as string,
      name: profileData.name || 'User',
      email: profileData.email || '',
    };

    dispatch(setSelectedGroup(null));
    dispatch(setSelectedContact(contact));

    navigate('/chat');
  };

  // ---- Connection actions -------------------------------------------------
  const handleConnect = async () => {
    if (!userId) return;
    if (!currentTempUser?._id) {
      toast.error('Please log in to connect with people');
      return;
    }

    setIsConnectionBusy(true);
    try {
      const created = await postService.sendConnectionRequest(userId);
      setConnectionStatus({ status: 'pending', connectionId: created._id, isRequester: true });
      toast.success(`Connection request sent to ${profileData?.name || 'user'}`);
    } catch (err) {
      console.error('Error sending connection request:', err);
      toast.error('Could not send request. Please try again.');
    } finally {
      setIsConnectionBusy(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!connectionStatus.connectionId) return;
    setIsConnectionBusy(true);
    try {
      await postService.cancelConnectionRequest(connectionStatus.connectionId);
      setConnectionStatus({ status: 'none' });
    } catch (err) {
      console.error('Error cancelling connection request:', err);
      toast.error('Could not cancel the request.');
    } finally {
      setIsConnectionBusy(false);
    }
  };

  const handleRespondToRequest = async (accept: boolean) => {
    if (!connectionStatus.connectionId) return;
    setIsConnectionBusy(true);
    try {
      await postService.respondToConnectionRequest(connectionStatus.connectionId, accept);
      setConnectionStatus((prev) => ({ ...prev, status: accept ? 'accepted' : 'rejected' }));
      toast.success(accept ? `You're now connected with ${profileData?.name || 'this user'}` : 'Request ignored');
    } catch (err) {
      console.error('Error responding to connection request:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsConnectionBusy(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!userId) return;

    if (
      !window.confirm(
        'Remove this connection? You will need to send a new request to reconnect.'
      )
    ) {
      return;
    }

    setIsConnectionBusy(true);
    try {
      await postService.removeConnection(userId);
      setConnectionStatus({ status: 'none' });
      toast.success('Connection removed');
    } catch (err) {
      console.error('Error removing connection:', err);
      toast.error('Could not remove the connection. Please try again.');
    } finally {
      setIsConnectionBusy(false);
    }
  };
  // -------------------------------------------------------------------------

  const handleLikePost = async (postId: string) => {
    const targetPost = posts.find(p => p._id === postId);
    const currentlyLiked = targetPost?.isLiked ?? false;

    try {
      const result = currentlyLiked
        ? await postService.unLikePost(postId)
        : await postService.likePost(postId);

      setPosts(prev =>
        prev.map(p => (p._id === postId ? { ...p, isLiked: result.liked, totalLikes: result.totalLikes } : p))
      );
      setSelectedPost(prev =>
        prev && prev._id === postId ? { ...prev, isLiked: result.liked, totalLikes: result.totalLikes } : prev
      );
    } catch (err) {
      console.error('Error liking post:', err);
      toast.error('Failed to like post');
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (profileError || !profileData) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-2 font-medium text-foreground">{profileError || 'Profile not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 rounded-lg border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
          type="button"
        >
          Go back
        </button>
      </div>
    );
  }

  // ---- Connection button (Connect / Pending / Accept+Ignore / Message) ---
  const renderConnectionAction = () => {
    if (connectionStatus.status === 'accepted') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={handleMessageClick}
            className="rounded-lg border border-border p-2 transition-colors hover:bg-accent"
            type="button"
            aria-label="Message"
            title="Send message"
          >
            <MessageCircle className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={handleRemoveConnection}
            disabled={isConnectionBusy}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            type="button"
            aria-label="Remove connection"
            title="Remove connection"
          >
            <UserMinus className="w-5 h-5" />
          </button>
        </div>
      );
    }

    if (connectionStatus.status === 'pending' && connectionStatus.isRequester) {
      return (
        <button
          onClick={handleCancelRequest}
          disabled={isConnectionBusy}
          className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
          type="button"
        >
          <Clock className="w-4 h-4" /> Pending
        </button>
      );
    }

    if (connectionStatus.status === 'pending' && !connectionStatus.isRequester) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleRespondToRequest(true)}
            disabled={isConnectionBusy}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            type="button"
          >
            <Check className="w-4 h-4" /> Accept
          </button>
          <button
            onClick={() => handleRespondToRequest(false)}
            disabled={isConnectionBusy}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            type="button"
          >
            <X className="w-4 h-4" /> Ignore
          </button>
        </div>
      );
    }

    // status === 'none' or 'rejected' -> can (re)send a request
    return (
      <button
        onClick={handleConnect}
        disabled={isConnectionBusy}
        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
        type="button"
      >
        <UserPlus className="w-4 h-4" /> Connect
      </button>
    );
  };
  // -------------------------------------------------------------------------

  const connectionListUsers: ProfileListUser[] = connectionsList.map((c) =>
    getOtherPartyInConnection(c, (profileData._id || profileData.id || userId) as string)
  );

  return (
    <div className="mx-auto max-w-4xl bg-background pb-12">
      <div className="px-4 pt-6 md:px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          type="button"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </button>
      </div>

      <div className="px-4 pt-4 md:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
          <div className="px-6 pb-8">
            <div className="flex flex-col items-center md:flex-row md:items-start md:gap-8">
              <div className="-mt-14 mb-4 flex-shrink-0 md:mb-0">
                {profileData.profileImage && !imageError ? (
                  <img
                    src={profileData.profileImage}
                    alt={profileData.name || 'User'}
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-card shadow-lg md:h-36 md:w-36"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted ring-4 ring-card shadow-lg md:h-36 md:w-36">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-grow pt-2 text-center md:text-left">
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4">
                  <h1 className="mb-2 break-words text-2xl font-bold text-foreground [font-family:var(--font-display)] md:mb-0">
                    {profileData.name || 'Unnamed User'}
                  </h1>
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    {renderConnectionAction()}
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap justify-center gap-2 md:justify-start">
                  <div className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm">
                    <span className="font-semibold text-foreground">{posts.length}</span>
                    <span className="ml-1 text-muted-foreground">posts</span>
                  </div>
                  <button
                    type="button"
                    className="cursor-pointer rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm transition-colors hover:border-primary/30 hover:text-primary"
                    onClick={() => setIsConnectionsModalOpen(true)}
                  >
                    <span className="font-semibold text-foreground">{connectionsList.length}</span>
                    <span className="ml-1 text-muted-foreground">connections</span>
                  </button>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-foreground">{profileData.profession || profileData.role || ''}</p>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">{profileData.bio || 'No bio yet.'}</p>
                  {profileData.role === UserRole.INVESTOR &&
                    connectionStatus.status !== 'accepted' && (
                      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Lock className="h-3.5 w-3.5" />
                        Connect to unlock full investor details and messaging
                      </p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 md:px-6">
        <div className="flex gap-1 rounded-xl bg-muted/70 p-1">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              activeTab === 'posts' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            type="button"
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              activeTab === 'about' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
            type="button"
          >
            About
          </button>
        </div>
      </div>

      <div className="space-y-6 p-4 md:p-6">
        {activeTab === 'about' ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="mb-4 flex items-center text-lg font-semibold text-foreground">
                <User className="mr-3 text-primary" />Basic Information
              </h2>
              <div className="space-y-3 text-sm">
                <p className="text-foreground"><span className="font-medium">Bio:</span> {profileData.bio || 'No bio'}</p>
                <p className="text-foreground"><span className="font-medium">Profession:</span> {profileData.profession || 'Not specified'}</p>
              </div>
            </div>
            {profileData.role === UserRole.INVESTOR && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="mb-4 flex items-center text-lg font-semibold text-foreground">
                  <Briefcase className="mr-3 text-primary" />Company Information
                </h2>
                <div className="space-y-3 text-sm">
                  <p className="text-foreground"><span className="font-medium">Company:</span> {profileData.investorDetails?.companyName || 'N/A'}</p>
                  <p className="text-foreground"><span className="font-medium">Founded:</span> {profileData.investorDetails?.companyFounded || 'N/A'}</p>
                  {profileData.investorDetails?.companyRegistration ? (
                    <p className="text-foreground"><span className="font-medium">Registration:</span> {profileData.investorDetails.companyRegistration}</p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      Company registration unlocks after you connect.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : isLoadingPosts ? (
          <div className="py-10 text-center text-muted-foreground">Loading posts...</div>
        ) : postsError ? (
          <div className="py-10 text-center text-destructive">Error: {postsError}</div>
        ) : !posts.length ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">No posts yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post._id}
                className="cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-float"
                onClick={() => { setSelectedPost(post); setCurrentImageIndex(0); }}
              >
                {post.media?.length ? (
                  <img
                    src={post.media[0]}
                    alt={post.content || 'Post Image'}
                    className="h-64 w-full object-cover"
                    onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300?text=Image+Not+Found'}
                  />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center bg-muted">
                    <p className="text-muted-foreground">No Image</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post detail modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${selectedPost ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
        <div className="relative mx-4 flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float md:flex-row">
          <div className="relative flex h-56 w-full shrink-0 items-center justify-center bg-black sm:h-72 md:h-auto md:w-3/5">
            {selectedPost?.media && selectedPost.media.length > 0 ? (
              <img
                src={selectedPost.media[currentImageIndex]}
                alt="Post"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <p className="text-muted-foreground">No Image Available</p>
            )}
            {selectedPost?.media && selectedPost.media.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? selectedPost.media!.length - 1 : prev - 1)}
                  className="absolute left-2 p-2 rounded-full bg-black/50 text-foreground hover:bg-black/70"
                  type="button"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev === selectedPost.media!.length - 1 ? 0 : prev + 1)}
                  className="absolute right-2 p-2 rounded-full bg-black/50 text-foreground hover:bg-black/70"
                  type="button"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          <div className="flex min-h-0 w-full flex-1 flex-col md:w-2/5 md:flex-none">
            <div className="flex items-center border-b border-border p-4">
              <img
                src={profileData.profileImage || 'https://via.placeholder.com/32'}
                alt={profileData.name ?? 'User'}
                className="mr-3 h-8 w-8 rounded-full object-cover ring-1 ring-border"
              />
              <p className="font-semibold text-sm text-foreground flex-grow">{profileData.name ?? 'User'}</p>
              <button type="button">
                <MoreHorizontal className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              {selectedPost && (
                <div className="mb-4">
                  <div className="flex mb-3">
                    <img
                      src={profileData.profileImage || 'https://via.placeholder.com/32'}
                      alt={profileData.name ?? 'User'}
                      className="mr-3 h-8 w-8 rounded-full object-cover ring-1 ring-border"
                    />
                    <div>
                      <p>
                        <span className="font-semibold text-sm text-foreground">{profileData.name ?? 'User'}</span>{' '}
                        <span className="text-sm text-foreground">{selectedPost.content}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {isLoadingComments ? (
                <div className="flex justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
                </div>
              ) : postComments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
              ) : (
                postComments.map((comment) => {
                  const commentUser = getCommentUser(comment);
                  return (
                    <div key={comment._id} className="flex mb-4">
                      <img
                        src={commentUser?.profileImage || 'https://via.placeholder.com/32'}
                        alt={commentUser?.name ?? 'Commenter'}
                        className="mr-3 h-8 w-8 rounded-full object-cover ring-1 ring-border"
                      />
                      <div>
                        <p>
                          <span className="font-semibold text-sm text-foreground">{commentUser?.name ?? 'Unknown'}</span>{' '}
                          <span className="text-sm text-foreground">{comment.commentText}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex justify-between mb-3">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => selectedPost?._id && handleLikePost(selectedPost._id)}
                    className="text-foreground hover:text-destructive"
                  >
                    <Heart
                      className={`w-6 h-6 ${selectedPost?.isLiked ? 'fill-current text-destructive' : ''}`}
                    />
                  </button>
                </div>
              </div>
              <p className="font-semibold text-sm text-foreground mb-2">{selectedPost?.totalLikes || 0} likes</p>
              <p className="font-semibold text-sm text-foreground mb-2">{selectedPost?.totalComments || 0} comments</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute right-4 top-4 rounded-full bg-background/90 p-1.5 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <UserListModal
        isOpen={isConnectionsModalOpen}
        onClose={() => setIsConnectionsModalOpen(false)}
        title="Connections"
        users={connectionListUsers}
        isLoading={isConnectionsLoading}
      />
    </div>
  );
};

export default OtherProfileComponent;