import { inject, injectable } from 'tsyringe';
import { Request, Response } from 'express';
import { IStoryController } from './interface/IStoryControlller';
import { IStoryService } from '../../services/story/interface/IStoryService';

@injectable()
class StoryController implements IStoryController {
  constructor(@inject('StoryService') private storyService: IStoryService) {}

  async createStory(req: Request, res: Response): Promise<void> {
    try {
      const { media, caption } = req.body;
      const authUserId = req.user?.id; 

      if (!authUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!media) {
        res.status(400).json({ error: 'Media is required' });
        return;
      }

      const story = await this.storyService.addStory(authUserId, media, caption);
      res.status(200).json({ message: 'Story created successfully', story });
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ error: 'Failed to create story' });
    }
  }

  async getUserStories(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({ error: 'User ID is required' });
        return;
      }

      const stories = await this.storyService.getUserStories(userId);
      res.status(200).json(stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      res.status(500).json({ error: 'Failed to fetch stories' });
    }
  }

  async getFollowingUserStories(req: Request, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stories = await this.storyService.getFollowedUsersStories(currentUserId);
      res.status(200).json(stories);
    } catch (error) {
      console.error('Error fetching followed users\' stories:', error);
      res.status(500).json({ error: 'Failed to fetch followed users\' stories' });
    }
  }
  // storyController.ts (Backend)
async addStoryViewers(req: Request, res: Response): Promise<void> {
  try {
      const { storyId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
      }

      await this.storyService.addStoryViewers(storyId as string, userId);
      res.status(200).json({ message: 'Viewer added successfully' });
  } catch (error) {
      console.error('Error adding story viewer:', error);
      res.status(500).json({ error: 'Failed to add viewer' });
  }
}
async getStoryById(req: Request, res: Response): Promise<void> {
  try {
    console.log("njnjnnjnjnjnjnjn 😍😍😍😍😍");
    
    const { storyId } = req.params;
    const userId = req.user?.id;
    
    if (!storyId) {
      res.status(400).json({ message: "Story ID is required" });
      return;
    }
    
    const response = await this.storyService.getStoryById(storyId, userId as string);
    
    
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getStoryById controller:", error);
    res.status(500).json({ message: "Internal server error", error: (error as Error).message });
  }
}
}

export default StoryController;
