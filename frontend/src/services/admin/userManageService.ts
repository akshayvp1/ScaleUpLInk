import { api } from '../../utils/axiosInterceptor';

// Interface for user data (moved here for reusability)
interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  status: 'active' | 'blocked';
  eventsCount: number;
  imageUrl?: string;
}

interface IUserManageService {
  getUsers(): Promise<User[]>;
  unblockUser(userId: string): Promise<void>
  blockUser(userId: string): Promise<void>
}

class UserManagementService implements IUserManageService {
    async getUsers(): Promise<User[]> {
        try {
          const response = await api.admin.get<User[]>('/get-users');
          console.log(response.data, "Users with image");
          return response.data;
        } catch (error) {
          console.error('Error fetching users:', error);
          throw error;
        }
      }
      async blockUser(userId: string): Promise<void> {
        try {
          await api.admin.patch(`/block-user/${userId}`);
        } catch (error) {
          console.error('Error blocking user:', error);
          throw error;
        }
      }
    
      async unblockUser(userId: string): Promise<void> {
        try {
          await api.admin.patch(`/unblock-user/${userId}`);
          
        } catch (error) {
          console.error('Error unblocking user:', error);
          throw error;
        }
      }
      
}

// Export a singleton instance
export const userManageService = new UserManagementService();