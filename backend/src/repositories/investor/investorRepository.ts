import { injectable, inject } from "tsyringe";
import { IUser } from "../../interfaces/IUser";
import {IInvestorRepository } from "../investor/interface/IInvestorRepository";
import { Model } from "mongoose";


// @injectable()
// class InvestorRepository implements IInvestorRepository{
//     private readonly model:Model<IUser>

//     constructor(@inject("UserModel") model: Model<IUser>) {
//         this.model = model;
//       }

//       async createUser(userData: Partial<IUser>): Promise<IUser> {
//         try {
//           const newUser = new this.model({
//             ...userData,
//             isBlocked: false,
//             isPremium: userData.isPremium || false,
//             plan: userData.plan || "free",
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             followers: [],
//             following: [],
//             interests: [],
//             savedPost: [],
//             investorDetails:
//               userData.role === "investor" && userData.investorDetails
//                 ? {
//                     companyName: userData.investorDetails.companyName || "",
//                     companyFounded: userData.investorDetails.companyFounded || undefined,
//                     companyRegistration: userData.investorDetails.companyRegistration || undefined,
                    
//                   }
//                 : undefined,
//           });
//           console.log(newUser,"QQQQQQQQQQQQ")
//           await newUser.save();
//           return newUser.toObject();
//         } catch (error) {
//           throw new Error("Error creating user: " + error);
//         }
//       }
      
//       async findInvestorById(id: string): Promise<IUser | null> {
//         try {
//           return await this.model.findById(id).select("-password").lean();
//         } catch (error) {
//           throw new Error("Error finding user by ID: " + error);
//         }
//       }
//     }


// export default InvestorRepository



@injectable()
class InvestorRepository implements IInvestorRepository {
    private readonly model: Model<IUser>

    constructor(@inject("UserModel") model: Model<IUser>) {
        this.model = model;
    }

    async createUser(userData: Partial<IUser>): Promise<IUser> {
        try {
            const newUser = new this.model({
                ...userData,
                isBlocked: false,
                isPremium: userData.isPremium || false,
                plan: userData.plan || "free",
                createdAt: new Date(),
                updatedAt: new Date(),
                followers: [],
                following: [],
                interests: [],
                savedPost: [],
                isActive:true,
                investorDetails:
                    userData.role === "investor" && userData.investorDetails
                        ? {
                            companyName: userData.investorDetails.companyName || "",
                            companyFounded: userData.investorDetails.companyFounded
                                ? Number(userData.investorDetails.companyFounded)
                                : undefined,
                            companyRegistration: userData.investorDetails.companyRegistration
                                ? Number(userData.investorDetails.companyRegistration)
                                : undefined,
                            
                        }
                        : undefined,
            });
            console.log(newUser, "QQQQQQQQQQQQ");
            await newUser.save();
            return newUser.toObject();
        } catch (error) {
            throw new Error("Error creating user: " + error);
        }
    }

    async findInvestorById(id: string): Promise<IUser | null> {
        try {
            return await this.model.findById(id).select("-password").lean();
        } catch (error) {
            throw new Error("Error finding user by ID: " + error);
        }
    }
}

export default InvestorRepository