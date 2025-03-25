
import { IUser } from "../../../interfaces/IUser";

export interface googleSignInResult {
  user?: IUser;
  accessToken?: string;
  refreshToken?: string;
  partialUser: boolean;
}

export default interface IAuthService {
  register(userData: Partial<IUser>): Promise<{ message: string }>;
  resendOtp(email: string): Promise<boolean>;
  signIn(
    email: string,
    password: string
  ): Promise<{ isMatch: boolean; message: string; accessToken?: string; user?: IUser }>;
  verifyOTP(email: string, otp: string): Promise<{ user: IUser }>;
  googleSignIn(credential:string):Promise<googleSignInResult>
  completeProfile(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
  setEntrepreneurRole(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
}
