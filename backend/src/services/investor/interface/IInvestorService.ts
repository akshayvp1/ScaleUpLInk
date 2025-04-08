import { IUser } from "../../../interfaces/IUser";

export interface googleSignInResult {
    user?: IUser;
    accessToken?: string;
    refreshToken?: string;
    partialUser: boolean;
  }
export default interface IInvestorService{
    completeProfile(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
    checkActiveStatus(id:string):Promise<boolean>
}