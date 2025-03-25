// import { IUser } from "../../interfaces/IUser";
// import User from "../../models/userModel";

// class UserRepository {
//   static async createUser(userData: IUser) {
//     return User.create(userData);
//   }

//   static async findByEmail(email: string) {
//     return User.findOne({ email });
//   }

//   static async findById(id: string) {
//     return User.findById(id); // ✅ Fixes the error
//   }
// }

// export default UserRepository;



import { injectable, inject } from "tsyringe";
import { IUser } from "../../interfaces/IUser";
import { IUserRepository } from "../entrepreneur/interface/IUserRepository";
import { Model } from "mongoose";

@injectable() 
class UserRepository implements IUserRepository {
  private readonly model: Model<IUser>;

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
        investorDetails:
          userData.role === "investor" && userData.investorDetails
            ? {
                companyName: userData.investorDetails.companyName || "",
                companyFounded: userData.investorDetails.companyFounded || undefined,
                companyRegistration: userData.investorDetails.companyRegistration || undefined,
                investmentHistory: userData.investorDetails.investmentHistory || "",
              }
            : undefined,
      });

      await newUser.save();
      return newUser.toObject();
    } catch (error) {
      throw new Error("Error creating user: " + error);
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.model.findOne({ email }).lean();
    } catch (error) {
      throw new Error("Error finding user by email: " + error);
    }
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      return await this.model.findById(id).select("-password").lean();
    } catch (error) {
      throw new Error("Error finding user by ID: " + error);
    }
  }
}

export default UserRepository;

