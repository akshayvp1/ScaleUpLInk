
import { IUser } from "../../../interfaces/IUser";
import { ITokenPayload } from "../../../utils/jwt";

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
  
  setEntrepreneurRole(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
  checkActiveStatus(id:string):Promise<boolean>
  addInterests(
    data: {
      email?: string;
      profession?: string;
      interest?: string[];
    },
    user?: ITokenPayload
  ): Promise<IUser | null>

  updateData(
    data: {
      name:string,
      contactNumber ?: string,
      profileImage ?: string,
      bio ?: string,
      email?:string
    },
    user?: ITokenPayload
  ): Promise<IUser | null>
  
}
