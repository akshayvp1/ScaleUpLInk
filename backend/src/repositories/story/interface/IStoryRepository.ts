import { IStory } from '../../../interfaces/IStory';
import mongoose from 'mongoose';

export interface IStoryRepository {
  createStory(data: Partial<IStory>): Promise<IStory>;
  findStoriesByUser(userId: mongoose.Types.ObjectId): Promise<IStory[]>;
  getFollowedUsersStories(userIds: mongoose.Types.ObjectId[]): Promise<IStory[]>
  addStoryViewers(storyId: string, userId: string): Promise<IStory | null>
  getStoryById(storyId: string, userId?: string): Promise<IStory | null>
  
}