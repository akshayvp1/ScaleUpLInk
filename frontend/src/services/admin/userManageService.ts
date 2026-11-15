import { api } from '../../utils/axiosInterceptor';
import { IUser } from '../../types/auth/auth.types';

interface IUserManageService {
  getUsers(): Promise<IUser[]>;
  unblockUser(userId: string): Promise<void>
  blockUser(userId: string): Promise<void>
}

class UserManagementService implements IUserManageService {
    async getUsers(): Promise<IUser[]> {
        try {
          const response = await api.admin.get<IUser[]>('/get-users');
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