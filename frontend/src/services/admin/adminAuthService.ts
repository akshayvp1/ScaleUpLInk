import { api } from "../../utils/axiosInterceptor";

interface SignInResponse {
  admin: {
    _id: string;
    email: string;
    role: "entrepreneur" | "investor" | "admin";
  };
  accessToken: string;
}

interface IAdminAuthService {
  signIn(email: string, password: string): Promise<SignInResponse>;
}

class AdminAuthService implements IAdminAuthService {
  async signIn(email: string, password: string): Promise<SignInResponse> {
    try {
      const response = await api.admin.post("/signin", { email, password });
      const { admin, accessToken } = response.data;
      return { admin, accessToken };
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  }
  async logout(): Promise<void> {
    try {
      await api.admin.post('/auth/signout'); 
     
    } catch (error) {
      console.error('Logout error:', error);
      throw error; 
    }
  }
}

export default new AdminAuthService();
