import { IUser } from "../../../interfaces/IUser";
import {
    InvestorSummary,
    UserView,
} from "../../../utils/userVisibility";

export interface googleSignInResult {
    user?: IUser;
    accessToken?: string;
    refreshToken?: string;
    partialUser: boolean;
  }

export interface InvestorListQuery {
    search?: string;
    sort?: "newest" | "name" | "company";
    page?: number;
    limit?: number;
}

export interface InvestorListResponse {
    investors: InvestorSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface InvestorProfileResponse {
    user: UserView;
    access: "full" | "limited";
    isConnected: boolean;
}

export default interface IInvestorService{
    completeProfile(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
    checkActiveStatus(id:string):Promise<boolean>
    listInvestors(query: InvestorListQuery, viewerId?: string): Promise<InvestorListResponse>;
    getInvestorProfile(viewerId: string, investorId: string): Promise<InvestorProfileResponse>;
}
