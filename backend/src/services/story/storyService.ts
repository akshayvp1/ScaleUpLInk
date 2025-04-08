import { inject, injectable } from 'tsyringe';
import mongoose from 'mongoose';
import { IStoryService } from './interface/IStoryService';
import { IStoryRepository } from '../../repositories/story/interface/IStoryRepository';
import { IStory } from '../../interfaces/IStory';
import UserModel from '../../models/userModel';

@injectable()
class StoryService implements IStoryService {
  constructor(@inject('StoryRepository') private storyRepository: IStoryRepository) {}

  async addStory(userId: string, media: string, caption?: string): Promise<IStory> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    return await this.storyRepository.createStory({ userId: objectId, media, caption });
  }

  async getUserStories(userId: string): Promise<IStory[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    return await this.storyRepository.findStoriesByUser(objectId);
  }

  async getFollowedUsersStories(currentUserId: string): Promise<IStory[]> {
    const user = await UserModel.findById(currentUserId).select("following");
    if (!user) throw new Error("User not found");

    // Convert following list to ObjectIds
    const followedUserIds = user.following.map(id => new mongoose.Types.ObjectId(id));
    
    return await this.storyRepository.getFollowedUsersStories(followedUserIds);
  }
  async addStoryViewers(storyId: string, userId: string): Promise<void> {
    try {
        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(storyId) || !mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid story or user ID');
        }

        const story = await this.storyRepository.addStoryViewers(storyId, userId);
        if (!story) {
            throw new Error('Story not found');
        }
    } catch (error) {
        console.error('StoryService: Error adding viewer:', error);
        throw error instanceof Error ? error : new Error('Failed to add viewer');
    }
}
async getStoryById(storyId: string, userId?: string): Promise<IStory | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      throw new Error("Invalid story ID format");
    }
    
    const story = await this.storyRepository.getStoryById(storyId, userId);
    
    if (!story) {
      return null;
    }
    
    // Check if story has expired
    if (story.expiresAt < new Date()) {
      return null;
    }
    
    return story;
  } catch (error) {
    console.error("Error in getStoryById service:", error);
    throw error;
  }
}
}

export default StoryService;
