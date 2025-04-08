// // types/story/story.types.ts
// export interface IStoryService {
//     addStory(storyData: {
//       media: string;
//       caption: string;
//       mediaType: 'image' | 'video';
//       userId: string;
//     }): Promise<Story>;
//     getUserStories(userId: string): Promise<Story[]>;
//   }
  
//   export interface Story {
//     id: string;
//     userId: string;
//     media: string;
//     caption?: string;
//     mediaType: 'image' | 'video';
//     createdAt: string;
//     expiresAt?: string;
//   }


export interface Story {
  id: string;
  userId: string | { _id: string; name?: string; profileImage?: string };
  media: string;
  caption?: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  _id?: string;
  views: number; // Required field
  viewers?: string[]; // Optional, if returned by backend
}

export interface IStoryService {
  addStory(storyData: {
    media: string;
    caption: string;
    mediaType: 'image' | 'video';
    userId: string;
  }): Promise<Story>;
  getUserStories(userId: string): Promise<Story[]>;
  getFollowedUsersStories(currentUserId: string): Promise<Story[]>;
  addViewers(storyId: string, userId: string): Promise<void>;
  getStoryById(storyId: string): Promise<Story>; // Added
}