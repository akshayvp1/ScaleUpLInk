import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { X, Search, Check } from 'lucide-react';
import authService from '../../services/user/authService';
import postService from '../../services/post/postService';
import { IUser } from '../../types/auth/auth.types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
  followerIds: string[];
  followingIds: string[];
}

const getUserId = (user: Partial<IUser> | null | undefined): string | undefined =>
  user?._id ?? user?.id;

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, postId, followerIds, followingIds }) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Your full network to share with: followers + following, deduplicated.
  const targetIds = useMemo(
    () => Array.from(new Set([...(followerIds || []), ...(followingIds || [])])),
    [followerIds, followingIds]
  );
  const targetIdsKey = targetIds.join(',');

  useEffect(() => {
    if (!isOpen) return;

    setSelectedIds(new Set());
    setSearchTerm('');

    if (!targetIds.length) {
      setUsers([]);
      return;
    }

    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const fetchedUsers = await Promise.all(
          targetIds.map((id) => authService.getUserById(id).catch(() => null))
        );
        setUsers(fetchedUsers.filter((u): u is IUser => u !== null));
      } catch (error) {
        console.error('Error loading network for share:', error);
        toast.error('Failed to load your network');
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
    // targetIdsKey intentionally used instead of targetIds so this doesn't
    // re-run every render from a new array reference with the same ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetIdsKey]);

  const filteredUsers = users.filter((u) =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelected = (userId?: string) => {
    if (!userId) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSend = async () => {
    if (!postId || selectedIds.size === 0) return;
    setIsSending(true);
    try {
      await postService.shareToUsers(postId, Array.from(selectedIds));
      toast.success(
        selectedIds.size === 1 ? 'Post shared!' : `Post shared with ${selectedIds.size} people!`
      );
      onClose();
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Failed to share post');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 flex max-h-[80dvh] w-full max-w-md flex-col rounded-2xl border border-border bg-card p-6 shadow-float">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" type="button">
          <X className="h-5 w-5" />
        </button>
        <h3 className="mb-4 text-xl font-semibold text-foreground [font-family:var(--font-display)]">Share to</h3>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex-grow overflow-y-auto space-y-1 -mx-2 px-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">
              {targetIds.length === 0
                ? 'Follow people or gain followers to share posts with them.'
                : 'No matches found.'}
            </p>
          ) : (
            filteredUsers.map((user) => {
              const uid = getUserId(user);
              const isSelected = !!uid && selectedIds.has(uid);
              return (
                <button
                  type="button"
                  key={uid}
                  onClick={() => toggleSelected(uid)}
                  className={`flex w-full items-center rounded-xl p-2 transition-colors ${
                    isSelected ? 'bg-primary/5' : 'hover:bg-muted'
                  }`}
                >
                  <img
                    src={user.profileImage || 'https://via.placeholder.com/40'}
                    alt={user.name || 'User'}
                    className="mr-3 h-10 w-10 rounded-full object-cover ring-1 ring-border"
                  />
                  <div className="text-left flex-grow min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name || 'Unnamed User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.profession || user.role || ''}</p>
                  </div>
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={selectedIds.size === 0 || isSending}
          className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending
            ? 'Sending...'
            : selectedIds.size > 0
              ? `Send to ${selectedIds.size} ${selectedIds.size === 1 ? 'person' : 'people'}`
              : 'Select people to share with'}
        </button>
      </div>
    </div>
  );
};

export default ShareModal;