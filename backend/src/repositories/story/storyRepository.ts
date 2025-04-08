import { inject, injectable } from 'tsyringe';
import { IStoryRepository } from './interface/IStoryRepository';
import { IStory } from '../../interfaces/IStory';
import mongoose, { Model } from 'mongoose';

@injectable()
class StoryRepository implements IStoryRepository {
  constructor(@inject('StoryModel') private readonly storyModel: Model<IStory>) {}

  async createStory(data: Partial<IStory>): Promise<IStory> {
    return await this.storyModel.create(data);
  }

  async findStoriesByUser(userId: mongoose.Types.ObjectId): Promise<IStory[]> {
    return await this.storyModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async getFollowedUsersStories(userIds: mongoose.Types.ObjectId[]): Promise<IStory[]> {
    return await this.storyModel.find({ userId: { $in: userIds } })
      .populate("userId", "name profileImage") 
      .sort({ createdAt: -1 }) 
      .exec();
  }

  async addStoryViewers(storyId: string, userId: string): Promise<IStory | null> {
    const story = await this.storyModel.findById(storyId);
    if (!story) return null;

    // Check if user has already viewed
    if (!story.viewers.some(viewer => viewer.toString() === userId)) {
        story.viewers.push(new mongoose.Types.ObjectId(userId));
        await story.save();
    }
    return story;
  }

  async getStoryById(storyId: string, userId?: string): Promise<IStory | null> {
    try {
      const story = await this.storyModel.findById(storyId)
        .populate("userId", "name profileImage") // Populate user details
        .exec();
      
      if (!story) return null;
      
      // If userId is provided, mark the story as viewed by this user
      if (userId && story) {
        // Check if user has already viewed
        if (!story.viewers.some(viewer => viewer.toString() === userId)) {
          story.viewers.push(new mongoose.Types.ObjectId(userId));
          await story.save();
        }
      }
      
      return story;
    } catch (error) {
      console.error("Error in getStoryById:", error);
      throw error;
    }
  }
}

export default StoryRepository;