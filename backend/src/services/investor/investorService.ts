// import bycrypt from 'bcryptjs'
// import { IUser } from '../../interfaces/IUser'
import IInvestorService from './interface/IInvestorService'
import { inject,injectable } from 'tsyringe'
import InvestorRepository from '../../repositories/investor/investorRepository'
import { generateToken,ITokenPayload } from "../../utils/jwt";
// import { OAuth2Client } from "google-auth-library";
// import { googleSignInResult } from "../../services/entrepreneur/interface/IAuthService";
import redisClient from "../../config/redisConfig";
import { IUser } from "../../interfaces/IUser";

@injectable()
class InvestorService implements IInvestorService{
    constructor(@inject("InvestorRepository") private investorRepository:InvestorRepository){}
   

    async completeProfile(input: { userData: Partial<IUser> }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
        try {
            const { userData } = input;
            if (!userData) {
                throw new Error("Invalid input: userData is missing");
            }
            console.log("Received User Data:", userData);

            const googleDataString = await redisClient.get(`google:${userData.email}`);
            const googleData = googleDataString ? JSON.parse(googleDataString) : null;
            console.log("Google Data:", googleData);

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

            console.log("Updated User Data:", updatedUserData);

            if (!updatedUserData.email || !updatedUserData.name) {
                console.error("Validation Error: Missing required fields", updatedUserData);
                throw new Error("Email and Name are required to complete profile.");
            }

            const createdUser = await this.investorRepository.createUser(updatedUserData as IUser);
            if (!createdUser) {
                throw new Error("Failed to create user");
            }

            console.log("Created User:", createdUser);

            const jwtPayload: ITokenPayload = {
                id: createdUser._id!.toString(),
                email: createdUser.email,
                role: createdUser.role,
            };

            const { accessToken, refreshToken } = generateToken(jwtPayload);

            if (googleData) {
                await redisClient.del(`google:${userData.email}`);
            }

            return { user: createdUser, accessToken, refreshToken };
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

}


export default InvestorService