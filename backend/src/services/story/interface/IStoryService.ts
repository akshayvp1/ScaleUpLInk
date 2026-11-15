import { IStory } from '../../../interfaces/IStory';

export interface IStoryService {
  addStory(userId: string, media: string, caption?: string, mediaType?: 'image' | 'video'): Promise<IStory> 
  getUserStories(userId: string): Promise<IStory[]>;
  getFollowedUsersStories(currentUserId: string): Promise<IStory[]> 
  addStoryViewers(StoryOwner:string,user:string):Promise<void>
  getStoryById(storyId: string, userId?: string): Promise<IStory | null>
}