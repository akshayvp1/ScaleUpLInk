import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Plus, X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { StoryModal } from './StoryModal';
import StoryService from '../../services/story/storyService';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/app/store';
import { IUser } from '../../types/auth/auth.types';
import { Story as StoryType } from '../../types/story/story.types'; // Use the exported Story type

interface ExtendedIUser extends IUser {
  _id?: string;
}

export interface StoryUser {
  id: string;
  username: string;
  avatar?: string;
  hasUnseenStory?: boolean;
  gradientBorder?: string;
}

interface StoriesProps {
  users: StoryUser[];
  onStoryClick?: (userId: string) => void;
  className?: string;
}

const STORY_DURATION = 5000;
const STORY_CARD_SIZE = 'w-[360px] h-[640px]';
const VIEWED_STORIES_KEY = 'viewedStories';

const Stories: React.FC<StoriesProps> = ({ users, onStoryClick, className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentStories, setCurrentStories] = useState<StoryType[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [stories, setStories] = useState<StoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const storyService = new StoryService();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [viewedStories, setViewedStories] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(VIEWED_STORIES_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const authenticatedUser = useSelector((state: RootState) => state.tempUser.tempUser) as ExtendedIUser | null;

  const getUserId = (user: ExtendedIUser | null): string | undefined => user?.id ?? user?._id;

  const extractUserId = (userId: string | { _id: string; name?: string; profileImage?: string }): string => {
    if (typeof userId === 'string') return userId;
    return userId._id;
  };

  const extractUserInfo = (userId: string | { _id: string; name?: string; profileImage?: string }) => {
    if (typeof userId === 'string') return null;
    return { id: userId._id, name: userId.name || 'Unknown', profileImage: userId.profileImage };
  };

  const normalizeStory = (story: any): StoryType => {
    let mediaType = story.mediaType;
    if (!mediaType) {
      const mediaUrl = story.media.toLowerCase();
      mediaType = (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.mov') || mediaUrl.includes('video')) ? 'video' : 'image';
    }

    return {
      id: story.id || story._id,
      userId: story.userId,
      media: story.media,
      caption: story.caption,
      mediaType: mediaType,
      createdAt: story.createdAt,
      _id: story._id,
      views: story.views ?? (story.viewers ? story.viewers.length : 0), // Handle both cases
    };
  };

  const fetchAllStories = async () => {
    const userId = getUserId(authenticatedUser);
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [currentUserStories, followedUserStories] = await Promise.all([
        storyService.getUserStories(userId),
        storyService.getFollowedUsersStories(userId),
      ]);

      const normalizedCurrentUserStories = currentUserStories.map(normalizeStory);
      const normalizedFollowedUserStories = followedUserStories.map(normalizeStory);

      const allStories = [...normalizedCurrentUserStories, ...normalizedFollowedUserStories].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setStories(allStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStories();
  }, [authenticatedUser]);

  const addStoryView = async (storyId: string) => {
    const userId = getUserId(authenticatedUser);
    if (!userId || viewedStories.has(storyId)) return;

    try {
      await storyService.addViewers(storyId, userId);
      setViewedStories((prev) => {
        const newSet = new Set(prev).add(storyId);
        localStorage.setItem(VIEWED_STORIES_KEY, JSON.stringify([...newSet]));
        return newSet;
      });

      const updatedStory = await storyService.getStoryById(storyId);
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId ? { ...story, views: updatedStory.views } : story
        )
      );
    } catch (error) {
      console.error('Error adding story view:', error);
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId ? { ...story, views: story.views + 1 } : story
        )
      );
    }
  };

  const myUserId = getUserId(authenticatedUser);
  const hasOwnStory = stories.some((story) => extractUserId(story.userId) === myUserId);

  const areAllStoriesViewed = (userId: string) => {
    const userStories = stories.filter((story) => extractUserId(story.userId) === userId);
    return userStories.length > 0 && userStories.every((story) => viewedStories.has(story.id));
  };

  const userStoriesMap: Record<string, { username: string; avatar?: string; stories: StoryType[] }> = {};
  if (myUserId) {
    userStoriesMap[myUserId] = {
      username: authenticatedUser?.name || 'You',
      avatar: authenticatedUser?.profileImage,
      stories: [],
    };
  }

  users.forEach((user) => {
    userStoriesMap[user.id] = {
      username: user.username,
      avatar: user.avatar,
      stories: [],
    };
  });

  stories.forEach((story) => {
    const userId = extractUserId(story.userId);
    const userInfo = extractUserInfo(story.userId);
    if (userInfo && !userStoriesMap[userId]) {
      userStoriesMap[userId] = {
        username: userInfo.name,
        avatar: userInfo.profileImage,
        stories: [],
      };
    }
    if (userStoriesMap[userId]) {
      userStoriesMap[userId].stories.push(story);
    }
  });

  const visibleUsers = Object.entries(userStoriesMap)
    .filter(([_, userData]) => _ === myUserId || userData.stories.length > 0)
    .map(([id, userData]) => ({
      id,
      username: userData.username,
      avatar: userData.avatar,
      hasStories: userData.stories.length > 0,
      allViewed: areAllStoriesViewed(id),
    }))
    .sort((a, b) => (a.id === myUserId ? -1 : b.id === myUserId ? 1 : 0));

  const startStoryTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (currentStoryIndex < currentStories.length - 1) {
        setCurrentStoryIndex((prev) => prev + 1);
      } else {
        goToNextUser();
      }
    }, STORY_DURATION);
  }, [currentStories.length, currentStoryIndex, currentUserIndex, visibleUsers]);

  const goToNextUser = () => {
    const nextUserIndex = currentUserIndex + 1;
    if (nextUserIndex < visibleUsers.length) {
      const nextUser = visibleUsers[nextUserIndex];
      const nextUserStories = stories.filter((story) => extractUserId(story.userId) === nextUser.id);
      if (nextUserStories.length > 0) {
        setCurrentStories(nextUserStories);
        setCurrentStoryIndex(0);
        setCurrentUserIndex(nextUserIndex);
        setIsPaused(false);
      } else {
        closeStoryViewer();
      }
    } else {
      closeStoryViewer();
    }
  };

  useEffect(() => {
    if (isViewerOpen && currentStories.length > 0) {
      const currentStory = currentStories[currentStoryIndex];
      addStoryView(currentStory.id);

      if (currentStory.mediaType === 'video' && videoRef.current) {
        videoRef.current.play().catch((err) => console.error('Video play error:', err));
      }

      if (!isPaused) startStoryTimer();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isViewerOpen, currentStoryIndex, currentStories, isPaused, startStoryTimer]);

  const handleStorySubmit = async (file: File, caption: string) => {
    const userId = getUserId(authenticatedUser);
    if (!userId) {
      alert('Please log in to post a story');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ad-upload');

      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dedrcfbxf/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Cloudinary upload failed');

      const uploadData = await uploadResponse.json();
      const mediaUrl = uploadData.secure_url;
      const mediaType: 'image' | 'video' = file.type.startsWith('video') ? 'video' : 'image';
      const storyData = { media: mediaUrl, caption, mediaType, userId };

      const createdStory = await storyService.addStory(storyData);
      const newStory: StoryType = {
        ...storyData,
        id: createdStory.id || createdStory.id,
        _id: createdStory._id,
        createdAt: new Date().toISOString(),
        views: 0,
      };

      setStories((prev) => [newStory, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error in handleStorySubmit:', error);
      alert('Failed to post story');
    }
  };

  const openStoryViewer = (userId: string, userIndex: number) => {
    const userStories = stories.filter((story) => extractUserId(story.userId) === userId);
    if (userStories.length > 0) {
      setCurrentStories(userStories);
      setCurrentStoryIndex(0);
      setCurrentUserIndex(userIndex);
      setIsViewerOpen(true);
      setIsPaused(false);
      onStoryClick?.(userId);
    }
  };

  const closeStoryViewer = () => {
    setIsViewerOpen(false);
    setCurrentStories([]);
    setCurrentStoryIndex(0);
    setCurrentUserIndex(0);
    setIsPaused(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (videoRef.current) videoRef.current.pause();
  };

  const nextStory = () => {
    if (currentStoryIndex < currentStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setIsPaused(false);
    } else {
      goToNextUser();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => {
      if (prev) {
        startStoryTimer();
        if (videoRef.current && currentStories[currentStoryIndex].mediaType === 'video') {
          videoRef.current.play();
        }
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (videoRef.current && currentStories[currentStoryIndex].mediaType === 'video') {
          videoRef.current.pause();
        }
      }
      return !prev;
    });
  };

  if (isLoading) {
    return (
      <div className={cn('w-full p-2', className)}>
        <div className="flex space-x-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <div className="h-[68px] w-[68px] rounded-full bg-gray-200" />
              <div className="h-3 w-12 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!authenticatedUser || !myUserId) {
    return (
      <div className={cn('w-full p-2', className)}>
        <p className="text-center text-gray-500">Please log in to view or post stories.</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn('w-full overflow-x-auto pb-1 scrollbar-none', className)}>
        <div className="flex space-x-4 p-2">
          {visibleUsers.map((user, index) => (
            <div
              key={user.id}
              className="flex flex-col items-center space-y-1 cursor-pointer transition-transform hover:scale-105"
              onClick={() =>
                user.hasStories
                  ? openStoryViewer(user.id, index)
                  : user.id === myUserId && setIsModalOpen(true)
              }
            >
              <div className="relative">
                <div
                  className={cn(
                    'h-[68px] w-[68px] rounded-full flex items-center justify-center transition-all duration-300',
                    user.hasStories && !user.allViewed
                      ? user.id === myUserId
                        ? 'bg-gradient-to-tr from-green-400 via-blue-500 to-indigo-600'
                        : 'bg-gradient-to-tr from-teal-400 via-cyan-500 to-blue-600'
                      : 'bg-gray-300 opacity-70'
                  )}
                >
                  <Avatar className="h-16 w-16 border-2 border-white">
                    {user.avatar || (user.id === myUserId && authenticatedUser.profileImage) ? (
                      <AvatarImage
                        src={user.avatar || (user.id === myUserId && authenticatedUser.profileImage) || ''}
                        alt={user.username}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                {user.id === myUserId && !hasOwnStory && (
                  <div className="absolute bottom-0 right-0 bg-teal-500 text-white rounded-full h-6 w-6 flex items-center justify-center border-2 border-white shadow-md">
                    <Plus className="h-4 w-4" />
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-600 font-medium truncate max-w-[70px]">{user.username}</span>
            </div>
          ))}
        </div>
      </div>

      <StoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleStorySubmit} />

      <Dialog open={isViewerOpen} onOpenChange={closeStoryViewer}>
        <DialogContent className="p-0 bg-black border-none w-[360px] h-[640px] rounded-lg overflow-hidden">
          {currentStories.length > 0 && (
            <div className="relative w-full h-full flex flex-col">
              <button
                className="absolute top-2 right-2 text-white z-20 hover:bg-gray-800 rounded-full p-1"
                onClick={closeStoryViewer}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute top-2 left-2 right-2 flex space-x-1 z-10">
                {currentStories.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1 flex-1 rounded-full bg-gray-600 transition-all duration-300',
                      index < currentStoryIndex && 'bg-white',
                      index === currentStoryIndex && !isPaused && 'bg-white animate-progress',
                      index === currentStoryIndex && isPaused && 'bg-white w-1/2'
                    )}
                  />
                ))}
              </div>

              <button
                className={cn(
                  'absolute left-2 top-1/2 transform -translate-y-1/2 text-white z-20 opacity-50 hover:opacity-100 transition-opacity',
                  currentStoryIndex === 0 && 'opacity-20 cursor-not-allowed'
                )}
                onClick={prevStory}
                disabled={currentStoryIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className={cn(
                  'absolute right-2 top-1/2 transform -translate-y-1/2 text-white z-20 opacity-50 hover:opacity-100 transition-opacity',
                  currentStoryIndex === currentStories.length - 1 && 'opacity-20 cursor-not-allowed'
                )}
                onClick={nextStory}
                disabled={currentStoryIndex === currentStories.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div className="w-full h-full relative">
                {currentStories[currentStoryIndex].mediaType === 'image' ? (
                  <img
                    src={currentStories[currentStoryIndex].media}
                    alt={currentStories[currentStoryIndex].caption || 'Story'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={currentStories[currentStoryIndex].media}
                    autoPlay={!isPaused}
                    controls={false}
                    className="w-full h-full object-cover"
                    onEnded={nextStory}
                  />
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-white">
                      {(() => {
                        const currentStory = currentStories[currentStoryIndex];
                        const storyUserId = extractUserId(currentStory.userId);
                        const userInfo = extractUserInfo(currentStory.userId);
                        const avatarSrc =
                          userInfo?.profileImage || (storyUserId === myUserId && authenticatedUser.profileImage);
                        return avatarSrc ? (
                          <AvatarImage src={avatarSrc} alt="User" />
                        ) : (
                          <AvatarFallback className="bg-gray-200 text-gray-500">
                            {(authenticatedUser?.name || 'U').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        );
                      })()}
                    </Avatar>
                    <div>
                      <span className="text-white font-semibold text-sm">
                        {(() => {
                          const currentStory = currentStories[currentStoryIndex];
                          const storyUserId = extractUserId(currentStory.userId);
                          const userInfo = extractUserInfo(currentStory.userId);
                          return storyUserId === myUserId
                            ? authenticatedUser?.name || 'You'
                            : userInfo?.name || users.find((u) => u.id === storyUserId)?.username || 'Unknown';
                        })()}
                      </span>
                      {currentStories[currentStoryIndex].caption && (
                        <p className="text-white text-xs line-clamp-1">{currentStories[currentStoryIndex].caption}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-white text-xs">{currentStories[currentStoryIndex].views} views</span>
                </div>

                <div className="flex items-center space-x-2">
                  {extractUserId(currentStories[currentStoryIndex].userId) !== myUserId ? (
                    <input
                      type="text"
                      placeholder="Send a message..."
                      className="flex-1 bg-gray-800/50 border border-gray-600 rounded-full py-1 px-3 text-white text-sm focus:outline-none placeholder-gray-400"
                      disabled
                    />
                  ) : (
                    <button
                      className="bg-teal-500 text-white rounded-full p-1 hover:bg-teal-600 transition-colors"
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    className="bg-gray-800/50 text-white rounded-full p-1 hover:bg-gray-700 transition-colors"
                    onClick={togglePause}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const styles = `
  @keyframes progress {
    0% { width: 0%; }
    100% { width: 100%; }
  }
  .animate-progress {
    animation: progress ${STORY_DURATION / 1000}s linear forwards;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Stories;