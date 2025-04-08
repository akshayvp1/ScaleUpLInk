import { IStory } from '../../../interfaces/IStory';
import mongoose from 'mongoose';

export interface IStoryService {
  addStory(userId: string, media: string, caption?: string): Promise<IStory> 
  getUserStories(userId: string): Promise<IStory[]>;
  getFollowedUsersStories(currentUserId: string): Promise<IStory[]> 
  addStoryViewers(StoryOwner:string,user:string):Promise<void>
  getStoryById(storyId: string, userId?: string): Promise<IStory | null>
}