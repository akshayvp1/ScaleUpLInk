// import bycrypt from 'bcryptjs'
// import { IUser } from '../../interfaces/IUser'
import IInvestorService, {
    InvestorListQuery,
    InvestorListResponse,
    InvestorProfileResponse,
} from './interface/IInvestorService'
import { inject,injectable } from 'tsyringe'
import { Types } from "mongoose";
import InvestorRepository from '../../repositories/investor/investorRepository'
import ConnectionService from '../connection/connectionService';
import {
    buildInvestorSummary,
    buildUserView,
} from "../../utils/userVisibility";
import { generateToken,ITokenPayload } from "../../utils/jwt";
// import { OAuth2Client } from "google-auth-library";
// import { googleSignInResult } from "../../services/entrepreneur/interface/IAuthService";
import redisClient from "../../config/redisConfig";
import { IUser } from "../../interfaces/IUser";
import { sanitizeUser } from "../../utils/sanitizeUser";

@injectable()
class InvestorService implements IInvestorService{
    constructor(
        @inject("InvestorRepository") private investorRepository:InvestorRepository,
        @inject("ConnectionService") private connectionService: ConnectionService
    ){}
   

    async completeProfile(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
        try {
            const { userData } = input;
            if (!userData) {
                throw new Error("Invalid input: userData is missing");
            }

            const googleDataString = await redisClient.get(`google:${userData.email}`);
            const googleData = googleDataString ? JSON.parse(googleDataString) : null;

            const updatedUserData: Partial<IUser> = {
                ...googleData,
                ...userData,
                isBlocked: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                
                investorDetails: userData.role === "investor" ? {
                    companyName: userData.investorDetails?.companyName || userData.companyName || "",
                    companyFounded: userData.investorDetails?.companyFounded || 
                                   (userData.companyFounded ? Number(userData.companyFounded) : undefined),
                    companyRegistration: userData.investorDetails?.companyRegistration || 
                                       (userData.businessRegNumber ? Number(userData.businessRegNumber) : undefined),
                } : undefined,
            };

            if (!updatedUserData.email || !updatedUserData.name) {
                console.error("Validation Error: Missing required fields", updatedUserData);
                throw new Error("Email and Name are required to complete profile.");
            }

            const createdUser = await this.investorRepository.createUser(updatedUserData as IUser);
            if (!createdUser) {
                throw new Error("Failed to create user");
            }

            const jwtPayload: ITokenPayload = {
                id: createdUser._id!.toString(),
                email: createdUser.email,
                role: createdUser.role,
            };

            const { accessToken, refreshToken } = generateToken(jwtPayload);

            if (googleData) {
                await redisClient.del(`google:${userData.email}`);
            }

            return {
                user: sanitizeUser(createdUser) as IUser,
                accessToken,
                refreshToken,
            };
        } catch (error) {
            console.error("Complete Profile Error:", error);
            throw new Error(`Failed to complete profile: ${(error as Error).message}`);
        }
    }

    async checkActiveStatus(id:string):Promise<boolean>{
        try{
          const user = await this.investorRepository.findInvestorById(id)
          if(!user){
            throw new Error("error")
          }
          return user.isActive
        }catch(error){
          throw error
        }
      }

    async listInvestors(
        query: InvestorListQuery,
        viewerId?: string
    ): Promise<InvestorListResponse> {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(query.limit) || 12));
        const sort =
            query.sort === "name" || query.sort === "company"
                ? query.sort
                : "newest";

        const excludeId =
            viewerId && Types.ObjectId.isValid(viewerId)
                ? viewerId
                : undefined;

        const { investors, total } = await this.investorRepository.listInvestors({
            search: query.search,
            sort,
            page,
            limit,
            excludeId,
        });

        return {
            investors: investors.map(buildInvestorSummary),
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    async getInvestorProfile(
        viewerId: string,
        investorId: string
    ): Promise<InvestorProfileResponse> {
        if (!Types.ObjectId.isValid(investorId)) {
            throw new Error("NOT_FOUND");
        }

        const investor = await this.investorRepository.findInvestorById(investorId);

        if (!investor || investor.role !== "investor" || !investor.isActive) {
            throw new Error("NOT_FOUND");
        }

        const isSelf = viewerId === investorId;
        const isConnected =
            isSelf ||
            (Types.ObjectId.isValid(viewerId) &&
                (await this.connectionService.areConnected(viewerId, investorId)));

        return {
            user: buildUserView(investor, isConnected),
            access: isConnected ? "full" : "limited",
            isConnected,
        };
    }

}


export default InvestorService