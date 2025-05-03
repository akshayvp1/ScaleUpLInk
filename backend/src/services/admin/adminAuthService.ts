import { inject, injectable } from "tsyringe";
import { IAdminAuthService } from "./interface/IAdminAuthService";
import AdminAuthRepository from "../../repositories/admin/adminAuthRepository";
import { ITokenPayload, generateToken } from "../../utils/jwt";
import bcrypt from "bcryptjs";
import { IAdmin } from "../../interfaces/IAdmin";

interface SignInResult {
  isMatch: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: Omit<IAdmin, "password">;
}

@injectable()
class AdminAuthService implements IAdminAuthService {
  constructor(
    @inject("AdminAuthRepository") private adminAuthRepository: AdminAuthRepository
  ) {}

  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
        
      const user = await this.adminAuthRepository.findByEmail(email);
      
      if (!user) {
        return { isMatch: false, message: "User not found." };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { isMatch: false, message: "Incorrect password." };
      }

      const payload: ITokenPayload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role as "entrepreneur" | "investor" | "admin",
      };
      

      const { accessToken, refreshToken } = generateToken(payload);

      const { password: _, ...safeUser } = user;

      return {
        isMatch: true,
        message: "Login successful.",
        accessToken,
        refreshToken,
        user: safeUser as Omit<IAdmin, "password">,
      };
    } catch (error) {
      console.error("Error during signIn:", error);
      return { isMatch: false, message: "Internal server error." };
    }
  }
  async checkActiveStatus(id: string): Promise<boolean> {
    try {
      const admin = await this.adminAuthRepository.findAdminById(id);
      console.log(admin,"🙈🙈🙈🙈")
      if (!admin) {
        throw new Error("Admin not found");
      }
      return admin.isActive;
    } catch (error) {
      throw error;
    }
  }
  
}

export default AdminAuthService;
