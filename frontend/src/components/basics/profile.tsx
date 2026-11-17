import React, { useState, useRef, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, User, Plus, UploadCloud,
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ChevronLeft, ChevronRight, Settings, X, Trash2,
  UserPlus, Clock, Check
} from 'lucide-react';
import axios from 'axios';
import authService from '../../services/user/authService';
import { IUser, UserRole } from '../../types/auth/auth.types';
import postService, { ConnectionRecord, ConnectionStatusResult } from '../../services/post/postService';
import { Post, Comment } from '../../types/post/post.types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/app/store';
import { setTempUser } from '../../redux/features/auth/tempSlice';
import { setSelectedContact } from '../../redux/features/chat/chatSlice';
import { setSelectedGroup } from '../../redux/features/chat/groupSlice';
import type { UserList } from '../../types/chat/types';
import ShareModal from '../../components/basics/ShareModal';

// Extend ProfileData from IUser and ensure 'type' is required
interface ProfileData extends IUser {
  type: UserRole;
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Minimal shape needed to render a row in the connections list modal —
// works for both full IUser results and the lighter requester/recipient
// objects that come back on a ConnectionRecord.
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

// ---- Helpers ----------------------------------------------------------
// Backend returns Mongo documents with `_id`, not `id`. Centralizing the
// lookup here avoids scattering `.id` / `._id` guesses across the file.
const getUserId = (user: Partial<IUser> | null | undefined): string | undefined =>
  user?._id ?? user?.id;

// Post.userid comes back either populated (object) or as a raw id string
// depending on the endpoint. Centralize the lookup the same way as users.
const getPostOwnerId = (post: Pick<Post, 'userid'> | null | undefined): string | undefined => {
  if (!post) return undefined;
  return typeof post.userid === 'object' ? post.userid._id : (post.userid as unknown as string);
};

// Comment.userId is populated on endpoints that return it (getComments) —
// this pulls the displayable user out when it is, undefined otherwise.
const getCommentUser = (comment: Comment) =>
  typeof comment.userId === 'object' ? comment.userId : undefined;

// Given a connection record and the profile page's owner id, returns
// whichever side of the connection is the OTHER person — i.e. the one
// that should show up in the "Connections" list, not the profile owner.
const getOtherPartyInConnection = (connection: ConnectionRecord, profileId: string): ProfileListUser =>
  connection.requester._id === profileId ? connection.recipient : connection.requester;
// -------------------------------------------------------------------------

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      toast.error('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changeOldPassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please check your current password.');
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border/70 bg-card p-5 shadow-2xl sm:p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold text-foreground mb-6">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              required
            />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, title, users, isLoading }) => {
  const navigate = useNavigate();

  const handleUserClick = (userId?: string) => {
    if (!userId) return;
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border/70 bg-card p-5 shadow-2xl sm:p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold text-foreground mb-6">{title}</h3>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground text-center">No {title.toLowerCase()} yet.</p>
        ) : (
          <div className="space-y-4 max-h-[60dvh] overflow-y-auto">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => handleUserClick(user._id)}
              >
                <img
                  src={user.profileImage || 'https://via.placeholder.com/40'}
                  alt={user.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover mr-3"
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

const ProfileComponent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetPostId, setShareTargetPostId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Connection state (replaces isFollowing / isFollowBusy) -----------
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusResult>({ status: 'none' });
  const [isConnectionBusy, setIsConnectionBusy] = useState(false);
  const [connectionsList, setConnectionsList] = useState<ConnectionRecord[]>([]);
  const [isConnectionsLoading, setIsConnectionsLoading] = useState(false);
  // -------------------------------------------------------------------------

  const currentTempUser = useSelector((state: RootState) => state.tempUser.tempUser) as IUser | null;

  const defaultProfileData: ProfileData = {
    type: UserRole.ENTREPRENEUR,
    name: 'Guest User',
    email: '',
    followers: [],
    following: [],
  };

  const [profileData, setProfileData] = useState<ProfileData>(
    currentTempUser ? { ...currentTempUser, type: currentTempUser.role ?? UserRole.ENTREPRENEUR } : defaultProfileData
  );
  const [editableProfile, setEditableProfile] = useState<ProfileData>(profileData);

  useEffect(() => {
    if (currentTempUser) {
      setProfileData({ ...currentTempUser, type: currentTempUser.role ?? UserRole.ENTREPRENEUR });
      setEditableProfile({ ...currentTempUser, type: currentTempUser.role ?? UserRole.ENTREPRENEUR });
    }
  }, [currentTempUser]);

  // Scoped to the profile actually being viewed, re-runs whenever that
  // profile changes.
  useEffect(() => {
    const ownerId = getUserId(profileData);
    if (!ownerId) {
      setPosts([]);
      return;
    }

    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedPosts = await postService.getPostByUserId(ownerId);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts');
        toast.error('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
    setImageError(false);
  }, [profileData._id]);

  // Load the connection status between the viewer and this profile, plus
  // this profile's accepted connections (for the stat + list modal).
  useEffect(() => {
    const ownerId = getUserId(profileData);
    if (!ownerId) {
      setConnectionStatus({ status: 'none' });
      setConnectionsList([]);
      return;
    }

    const fetchConnectionStatus = async () => {
      try {
        const status = await postService.getConnectionStatus(ownerId);
        setConnectionStatus(status);
      } catch (err) {
        console.error('Error fetching connection status:', err);
      }
    };

    const fetchConnectionsList = async () => {
      setIsConnectionsLoading(true);
      try {
        const list = await postService.getConnectionsForUser(ownerId);
        setConnectionsList(list);
      } catch (err) {
        console.error('Error fetching connections list:', err);
      } finally {
        setIsConnectionsLoading(false);
      }
    };

    fetchConnectionStatus();
    fetchConnectionsList();
  }, [profileData._id]);

  useEffect(() => {
    setIsPostMenuOpen(false);
  }, [selectedPost?._id]);

  // Comments aren't embedded in the post payload — load them separately
  // whenever a different post is opened in the modal.
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
      } catch (error) {
        console.error('Error fetching comments:', error);
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ad-upload");
      formData.append("folder", "scaleuplink/profile");
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dedrcfbxf/image/upload`,
        formData
      );
      
      setEditableProfile(prev => ({
        ...prev,
        profileImage: response.data.secure_url
      }));
      toast.success("Profile image uploaded successfully!");
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!editableProfile.name) {
        toast.error("Name cannot be empty");
        return;
      }

      const updateData = {
        name: editableProfile.name,
        contactNumber: editableProfile.contactNumber,
        profileImage: editableProfile.profileImage,
        bio: editableProfile.bio,
        email: editableProfile.email
      };
      
      await authService.updateDetail(updateData);
      setProfileData(editableProfile);
      dispatch(setTempUser({ tempUser: editableProfile }));
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
    }
  };

  // ---- Like / Unlike -----------------------------------------------------
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

      toast.success(currentlyLiked ? 'Post unliked!' : 'Post liked!');
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like');
    }
  };
  // -------------------------------------------------------------------------

  // ---- Delete ---------------------------------------------------------
  const deletePostRequest = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
      }
      toast.success('Post deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // Replaces window.confirm with an in-app toast that has explicit
  // Delete / Cancel actions, matching the rest of the app's react-hot-toast
  // based feedback instead of a native browser alert.
  const handleDeletePost = (postId: string) => {
    toast((t) => (
      <div className="flex gap-3 w-[340px] max-w-full">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-sm font-semibold text-foreground">Delete this post?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            This action can't be undone. The post will be permanently removed.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium rounded-md border border-border text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                deletePostRequest(postId);
              }}
              className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-white hover:bg-destructive/90 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: 8000,
      style: {
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.25)',
        maxWidth: 'none',
        background: 'var(--background)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
      },
    });
  };
  // -------------------------------------------------------------------------

  // ---- Save / Unsave ---------------------------------------------------
  const handleSavePost = async (postId: string) => {
    const previousSavedPost = profileData.savedPost ?? [];
    const currentlySaved = previousSavedPost.includes(postId);

    const optimisticSavedPost = currentlySaved
      ? previousSavedPost.filter(id => id !== postId)
      : [...previousSavedPost, postId];

    setProfileData(prev => ({ ...prev, savedPost: optimisticSavedPost }));

    try {
      const { savedPost } = await postService.savePost(postId);

      setProfileData(prev => ({ ...prev, savedPost }));
      setEditableProfile(prev => ({ ...prev, savedPost }));

      if (currentTempUser) {
        dispatch(setTempUser({ tempUser: { ...currentTempUser, savedPost } }));
      }

      toast.success(currentlySaved ? 'Removed from saved' : 'Post saved');
    } catch (error) {
      console.error('Error saving post:', error);
      // Roll back the optimistic update on failure.
      setProfileData(prev => ({ ...prev, savedPost: previousSavedPost }));
      toast.error('Failed to update saved post');
    }
  };
  // -------------------------------------------------------------------------

  // ---- Share ------------------------------------------------------------
  const handleOpenShareModal = (postId: string) => {
    setShareTargetPostId(postId);
    setIsShareModalOpen(true);
  };
  // -------------------------------------------------------------------------

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPost?._id || !currentTempUser) return;

    try {
      const newComment = await postService.addComment(selectedPost._id, commentText);
      setPostComments(prev => [...prev, newComment]);
      setPosts(prev =>
        prev.map(p => (p._id === selectedPost._id ? { ...p, totalComments: p.totalComments + 1 } : p))
      );
      setSelectedPost(prev => (prev ? { ...prev, totalComments: prev.totalComments + 1 } : prev));
      setCommentText('');
      toast.success("Comment added!");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // ✅ Message button handler – opens chat with this profile's owner.
  // Only reachable once connectionStatus.status === 'accepted' (see
  // renderConnectionAction below) — nobody can jump into a chat with
  // someone who hasn't accepted a connection request.
  const handleMessageClick = () => {
    const targetId = getUserId(profileData);
    if (!targetId) return;

    const contact: UserList = {
      _id: targetId,
      name: profileData.name || 'User',
      email: profileData.email || '',
    };

    dispatch(setSelectedGroup(null));
    dispatch(setSelectedContact(contact));

    navigate(`/chat?userId=${encodeURIComponent(targetId)}`);
  };

  // ---- Connection actions -------------------------------------------------
  const isOwnProfile = getUserId(currentTempUser) === getUserId(profileData) || !profileData._id;

  const handleConnect = async () => {
    const targetUserId = getUserId(profileData);
    if (!targetUserId) return;
    if (!currentTempUser) {
      toast.error('You must be logged in');
      return;
    }

    setIsConnectionBusy(true);
    try {
      const created = await postService.sendConnectionRequest(targetUserId);
      setConnectionStatus({ status: 'pending', connectionId: created._id, isRequester: true });
      toast.success(`Connection request sent to ${profileData.name || 'user'}`);
    } catch (error) {
      console.error('Error sending connection request:', error);
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
    } catch (error) {
      console.error('Error cancelling connection request:', error);
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
      toast.success(accept ? `You're now connected with ${profileData.name || 'this user'}` : 'Request ignored');
    } catch (error) {
      console.error('Error responding to connection request:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsConnectionBusy(false);
    }
  };
  // -------------------------------------------------------------------------

  const connectionListUsers: ProfileListUser[] = connectionsList.map((c) =>
    getOtherPartyInConnection(c, getUserId(profileData) as string)
  );

  // ---- Connection button (Connect / Pending / Accept+Ignore / Message) ---
  const renderConnectionAction = () => {
    if (connectionStatus.status === 'accepted') {
      return (
        <button
          onClick={handleMessageClick}
          className="p-1.5 rounded-md border border-border hover:bg-accent"
          type="button"
          aria-label="Message"
          title="Send message"
        >
          <MessageCircle className="w-5 h-5 text-foreground" />
        </button>
      );
    }

    if (connectionStatus.status === 'pending' && connectionStatus.isRequester) {
      return (
        <button
          onClick={handleCancelRequest}
          disabled={isConnectionBusy}
          className="flex items-center gap-1.5 px-4 py-1 rounded-md border border-border text-muted-foreground hover:bg-accent font-medium text-sm disabled:opacity-50"
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
        className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
            type="button"
          >
            <Check className="w-4 h-4" /> Accept
          </button>
          <button
            onClick={() => handleRespondToRequest(false)}
            disabled={isConnectionBusy}
            className="flex items-center gap-1.5 px-4 py-1 rounded-md border border-border text-foreground hover:bg-accent font-medium text-sm disabled:opacity-50"
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
        className="flex items-center gap-1.5 px-4 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-sm disabled:opacity-50"
        type="button"
      >
        <UserPlus className="w-4 h-4" /> Connect
      </button>
    );
  };
  // -------------------------------------------------------------------------

  const renderProfileHeader = () => (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
      <div className="relative h-28 bg-gradient-to-r from-sidebar via-sidebar to-primary/80 sm:h-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.35),transparent_45%)]" />
      </div>
      <div className="px-5 pb-7 sm:px-8">
        <div className="flex flex-col items-center md:flex-row md:items-end md:gap-8">
          <div className="-mt-14 shrink-0 sm:-mt-16">
            {profileData.profileImage && !imageError ? (
              <img
                src={profileData.profileImage}
                alt={profileData.name || 'User'}
                className="h-28 w-28 rounded-full border-4 border-card object-cover shadow-lg sm:h-36 sm:w-36"
                onError={() => setImageError(true)}
              />
            ) : (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-card bg-muted shadow-lg transition-colors hover:bg-muted/80 sm:h-36 sm:w-36"
                type="button"
              >
                <Plus className="h-10 w-10 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="mt-4 flex min-w-0 flex-grow flex-col gap-5 text-center md:mt-0 md:pb-1 md:text-left">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground [font-family:var(--font-display)]">
                  {profileData.name || 'Unnamed User'}
                </h1>
                <p className="mt-1 text-sm font-medium text-primary">
                  {profileData.profession || profileData.role || ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                      type="button"
                    >
                      Edit profile
                    </button>
                    <button
                      onClick={() => setIsChangePasswordModalOpen(true)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      type="button"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  renderConnectionAction()
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <div className="rounded-lg bg-muted/60 px-3 py-1.5">
                <span className="text-sm font-bold text-foreground">{posts.length}</span>
                <span className="ml-1 text-xs text-muted-foreground">posts</span>
              </div>
              <button
                className="rounded-lg bg-muted/60 px-3 py-1.5 transition-colors hover:bg-accent"
                onClick={() => setIsConnectionsModalOpen(true)}
                type="button"
              >
                <span className="text-sm font-bold text-foreground">{connectionsList.length}</span>
                <span className="ml-1 text-xs text-muted-foreground">connections</span>
              </button>
            </div>
            <p className="mx-auto max-w-2xl whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground md:mx-0">
              {profileData.bio || 'No bio yet.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isEditModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
      <div className="relative mx-4 max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border/70 bg-card p-5 shadow-2xl sm:p-6">
        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold text-foreground mb-6">Edit Profile</h3>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="flex justify-center mb-6 md:mb-0">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
            {editableProfile.profileImage && !imageError ? (
              <div className="relative">
                <img 
                  src={editableProfile.profileImage}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-2 border-border cursor-pointer"
                  onError={() => setImageError(true)}
                  onClick={() => fileInputRef.current?.click()}
                />
                <span className="absolute bottom-2 right-2 bg-muted text-foreground text-xs px-2 py-1 rounded">Change</span>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-full border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center hover:bg-muted/80"
                disabled={isUploading}
                type="button"
              >
                {isUploading ? (
                  <UploadCloud className="w-12 h-12 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload Photo</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="space-y-4 flex-grow">
            <div>
              <label className="block text-sm font-medium text-foreground">Name</label>
              <input 
                type="text" 
                value={editableProfile.name || ''} 
                onChange={(e) => setEditableProfile(prev => ({ ...prev, name: e.target.value || null }))}
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={editableProfile.bio || ''}
                onChange={(e) => setEditableProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
                rows={3}
                maxLength={150}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Contact Number</label>
              <input 
                type="text" 
                value={editableProfile.contactNumber || ''}
                onChange={(e) => setEditableProfile(prev => ({ ...prev, contactNumber: e.target.value }))}
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-4">
          <button 
            onClick={() => setIsEditModalOpen(false)}
            className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-md"
            type="button"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveProfile}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            type="button"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderPostModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${selectedPost ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
      <div className="relative mx-4 flex max-h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl md:flex-row">
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
          <div className="flex items-center p-4 border-b border-border">
            <img 
              src={typeof selectedPost?.userid === 'object' ? selectedPost.userid.profileImage || 'https://via.placeholder.com/32' : 'https://via.placeholder.com/32'}
              alt={typeof selectedPost?.userid === 'object' ? selectedPost.userid.name ?? 'User' : 'User'}
              className="w-8 h-8 rounded-full mr-3 object-cover"
            />
            <p className="font-semibold text-sm text-foreground flex-grow">
              {typeof selectedPost?.userid === 'object' ? selectedPost.userid.name ?? 'User' : 'User'}
            </p>
            {getPostOwnerId(selectedPost) === getUserId(currentTempUser) && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPostMenuOpen(prev => !prev)}
                >
                  <MoreHorizontal className="w-5 h-5 text-foreground" />
                </button>
                {isPostMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-background border border-border rounded-md shadow-lg z-10">
                    <button
                      type="button"
                      onClick={() => selectedPost?._id && handleDeletePost(selectedPost._id)}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted rounded-md"
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex-grow overflow-y-auto p-4">
            {selectedPost && (
              <div className="mb-4">
                <div className="flex mb-3">
                  <img 
                    src={typeof selectedPost.userid === 'object' ? selectedPost.userid.profileImage || 'https://via.placeholder.com/32' : 'https://via.placeholder.com/32'}
                    alt={typeof selectedPost.userid === 'object' ? selectedPost.userid.name ?? 'User' : 'User'}
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <p>
                      <span className="font-semibold text-sm text-foreground">
                        {typeof selectedPost.userid === 'object' ? selectedPost.userid.name ?? 'User' : 'User'}
                      </span>{' '}
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
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
                      className="w-8 h-8 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p>
                        <span className="font-semibold text-sm text-foreground">
                          {commentUser?.name ?? 'Unknown'}
                        </span>{' '}
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
                <button type="button" className="text-foreground hover:text-primary">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => selectedPost?._id && handleOpenShareModal(selectedPost._id)}
                  className="text-foreground hover:text-primary"
                >
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => selectedPost?._id && handleSavePost(selectedPost._id)}
                className="text-foreground hover:text-primary"
              >
                <Bookmark className={`w-6 h-6 ${profileData.savedPost?.includes(selectedPost?._id || '') ? 'fill-current' : ''}`} />
              </button>
            </div>
            <p className="font-semibold text-sm text-foreground mb-2">{selectedPost?.totalLikes || 0} likes</p>
            <p className="font-semibold text-sm text-foreground mb-2">{selectedPost?.totalComments || 0} comments</p>
            {!!selectedPost?.totalShare && (
              <p className="font-semibold text-sm text-foreground mb-2">{selectedPost.totalShare} shares</p>
            )}
            <form onSubmit={handleComment} className="flex mt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-grow bg-transparent focus:outline-none text-sm text-foreground"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={`text-primary font-semibold text-sm ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Post
              </button>
            </form>
          </div>
        </div>
        <button 
          onClick={() => setSelectedPost(null)}
          className="absolute top-4 right-4 p-1 rounded-full bg-background text-foreground hover:bg-muted"
          type="button"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const renderPosts = () => {
    if (isLoading) return <div className="text-center py-10 text-muted-foreground">Loading posts...</div>;
    if (error) return <div className="text-center py-10 text-destructive">Error: {error}</div>;
    if (!posts.length) return <div className="text-center py-10 text-muted-foreground">No posts available yet.</div>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post) => {
          const isOwnPost = getPostOwnerId(post) === getUserId(currentTempUser);
          return (
            <div 
              key={post._id} 
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft transition-all hover:shadow-float"
              onClick={() => setSelectedPost(post)}
            >
              {post.media?.length ? (
                <img
                  src={post.media[0]}
                  alt={post.content || 'Post Image'}
                  className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300?text=Image+Not+Found'}
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center bg-muted p-4">
                  <p className="line-clamp-4 text-center text-sm text-muted-foreground">
                    {post.content || 'No Image'}
                  </p>
                </div>
              )}
              {post.isLiked && (
                <Heart className="absolute top-2 right-2 w-5 h-5 fill-current text-destructive drop-shadow" />
              )}
              {isOwnPost && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (post._id) handleDeletePost(post._id);
                  }}
                  className="absolute top-2 left-2 rounded-full bg-black/50 p-1.5 text-white opacity-100 transition-opacity hover:bg-destructive/90 md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-3 pb-10 sm:px-5">
      {renderProfileHeader()}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-soft">
        <div className="flex border-b border-border/70">
          <button
            onClick={() => setActiveTab('posts')}
            className={`relative flex-1 py-3.5 text-center text-sm font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            type="button"
          >
            Posts
            {activeTab === 'posts' && (
              <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`relative flex-1 py-3.5 text-center text-sm font-semibold transition-colors ${
              activeTab === 'about'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            type="button"
          >
            About
            {activeTab === 'about' && (
              <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-primary" />
            )}
          </button>
        </div>
        <div className="space-y-6 p-5 sm:p-6">
          {activeTab === 'about' ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-6">
                <h2 className="mb-5 flex items-center text-lg font-semibold text-foreground">
                  <User className="mr-3 h-5 w-5 text-primary" />Basic Information
                </h2>
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <p className="text-foreground"><span className="font-medium">Bio:</span> {profileData.bio || 'No bio'}</p>
                  <p className="text-foreground"><span className="font-medium">Profession:</span> {profileData.profession || 'Not specified'}</p>
                  <p className="text-foreground"><span className="font-medium">Contact:</span> {profileData.contactNumber || 'Not specified'}</p>
                  <p className="text-foreground"><span className="font-medium">Email:</span> {profileData.email || 'Not specified'}</p>
                </div>
              </div>
              {profileData.role === UserRole.INVESTOR && (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-6">
                  <h2 className="mb-5 flex items-center text-lg font-semibold text-foreground">
                    <Briefcase className="mr-3 h-5 w-5 text-primary" />Company Information
                  </h2>
                  <div className="grid gap-4 text-sm sm:grid-cols-2">
                    <p className="text-foreground"><span className="font-medium">Company:</span> {profileData.investorDetails?.companyName || 'N/A'}</p>
                    <p className="text-foreground"><span className="font-medium">Founded:</span> {profileData.investorDetails?.companyFounded || 'N/A'}</p>
                    <p className="text-foreground"><span className="font-medium">Registration:</span> {profileData.investorDetails?.companyRegistration || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            renderPosts()
          )}
        </div>
      </div>
      {renderEditModal()}
      {renderPostModal()}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
      <UserListModal
        isOpen={isConnectionsModalOpen}
        onClose={() => setIsConnectionsModalOpen(false)}
        title="Connections"
        users={connectionListUsers}
        isLoading={isConnectionsLoading}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setShareTargetPostId(null);
        }}
        postId={shareTargetPostId}
        followerIds={connectionListUsers.map((u) => u._id)}
        followingIds={connectionListUsers.map((u) => u._id)}
      />
    </div>
  );
};

export default ProfileComponent;