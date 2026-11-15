import { IStoryService, Story } from '../../types/story/story.types';
import { api } from '../../utils/axiosInterceptor';

class StoryService implements IStoryService {
  async addStory(storyData: {
    media: string;
    caption: string;
    mediaType: 'image' | 'video';
    userId: string;
  }): Promise<Story> {
    try {
      const response = await api.shared.post('/stories', storyData);
      return response.data as Story;
    } catch (error) {
      console.error('StoryService: Error adding story:', error);
      throw new Error('Failed to add story');
    }
  }

  async getUserStories(userId: string): Promise<Story[]> {
    try {
      const response = await api.shared.get(`/stories/${userId}/users`);
      return (response.data as Story[]) || [];
    } catch (error) {
      console.error('StoryService: Error fetching user stories:', error);
      throw new Error('Failed to fetch user stories');
    }
  }

  async getFollowedUsersStories(currentUserId: string): Promise<Story[]> {
    try {
      const response = await api.shared.get(`/stories/${currentUserId}/followed`);
      return (response.data as Story[]) || [];
    } catch (error) {
      console.error('StoryService: Error fetching followed users stories:', error);
      throw new Error('Failed to fetch followed users stories');
    }
  }

  async addViewers(storyId: string, userId: string): Promise<void> {
    try {
      const response = await api.shared.post(`/stories/${storyId}/viewers`, { userId });
      return response.data; // Likely void, but keeping as-is for compatibility
    } catch (error) {
      console.error('StoryService: Error adding viewer:', error);
      throw error;
    }
  }

  async getStoryById(storyId: string): Promise<Story> {
    try {
      const response = await api.shared.get(`/stories/${storyId}`);
      console.log(response,"viewwwwwww")
      return response.data as Story;
    } catch (error) {
      console.error('StoryService: Error fetching story by ID:', error);
      throw new Error('Failed to fetch story by ID');
    }
  }
}

export default StoryService;