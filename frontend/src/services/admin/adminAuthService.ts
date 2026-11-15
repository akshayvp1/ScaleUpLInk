import { api } from "../../utils/axiosInterceptor";
import { store } from "../../redux/app/store";
import { signIn, signOut } from "../../redux/features/auth/authSlice";
import { setTempUser } from "../../redux/features/auth/tempSlice";
import { IUser, UserRole } from "../../types/auth/auth.types";

interface SignInResponse {
  user: IUser;
  accessToken: string;
}

interface IAdminAuthService {
  signIn(email: string, password: string): Promise<SignInResponse>;
  logout(): Promise<void>;
}

class AdminAuthService implements IAdminAuthService {
  async signIn(email: string, password: string): Promise<SignInResponse> {
    try {
      const response = await api.admin.post("/signin", { email, password });
      const { user, accessToken } = response.data as {
        user: IUser;
        accessToken: string;
      };

      const authenticatedUser: IUser = {
        ...user,
        token: accessToken,
      };

      store.dispatch(
        signIn({
          email: user.email,
          role: (user.role ?? UserRole.ADMIN) as UserRole,
          token: accessToken,
          user: authenticatedUser,
        })
      );
      store.dispatch(setTempUser({ tempUser: authenticatedUser }));

      return { user: authenticatedUser, accessToken };
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.admin.post("/auth/signout");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      store.dispatch(signOut());
    }
  }
}

export default new AdminAuthService();
