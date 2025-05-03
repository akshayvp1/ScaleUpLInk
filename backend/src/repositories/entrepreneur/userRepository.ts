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
        isActive:true,
        investorDetails:
          userData.role === "investor" && userData.investorDetails
            ? {
                companyName: userData.investorDetails.companyName || "",
                companyFounded: userData.investorDetails.companyFounded || undefined,
                companyRegistration: userData.investorDetails.companyRegistration || undefined,
                
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

  async findUserById(id: string): Promise<IUser | null> {
    try {
      return await this.model.findById(id).select("-password").lean();
    } catch (error) {
      throw new Error("Error finding user by ID: " + error);
    }
  }
  async addInterests(
    email: string, 
    interests: string[], 
    profession?: string
  ): Promise<IUser | null> {
    console.log("i amd addinterest repository")

    try {
      const updateQuery: { 
        interests?: string[], 
        profession?: string 
      } = {};

      if (interests && interests.length > 0) {
        updateQuery.interests = interests;
      }

      if (profession) {
        updateQuery.profession = profession;
      }

      // return await this.model.findOneAndUpdate(
      //   { email },
      //   { $set: updateQuery },
      //   { new: true }
      // );
      return await this.model.findOneAndUpdate(
        { email },
        { 
          $addToSet: { interests: { $each: interests } }, 
          ...(profession && { profession }) 
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error in addInterests repository:', error);
      throw error;
    }
  }
  async findUserByEmail(email: string): Promise<IUser | null> {
    return await this.model.findOne({ email });
  }


  async updateData(data: {
    name?: string;
    contactNumber?: string;
    profileImage?: string;
    bio?: string;
    email: string;
  }): Promise<IUser | null> {
    console.log("Updating user data in repository");
  
    try {
      if (!data.email) {
        throw new Error("Email is required to update user data");
      }
  
      const existingUser = await this.model.findOne({ email: data.email });
      if (!existingUser) {
        throw new Error("User not found");
      }
  
      const allowedFields = ["name", "contactNumber", "profileImage", "bio"] as const;
const updateQuery: Partial<IUser> = {};

for (const field of allowedFields) {
  if (data[field as keyof typeof data]) {
    updateQuery[field as keyof IUser] = data[field as keyof typeof data];
  }
}
      return await this.model.findOneAndUpdate(
        { email: data.email },
        { $set: updateQuery },
        { new: true, runValidators: true }
      ).lean();
    } catch (error) {
      console.error("Error in updateData repository:", error);
      throw new Error("Failed to update user data");
    }
  }

  async updatePassword(email: string, hashedPassword: string): Promise<boolean> {
    try {
        const updatedUser = await this.model.findOneAndUpdate(
            { email: email },
            { $set: { password: hashedPassword } }, // Ensure password is updated
            { new: true, runValidators: true }
        ).lean();

        return !!updatedUser;
    } catch (error) {
        console.error("Error in updatePassword:", error);
        return false;
    }
}
async changeOldPassword(email: string, hashedNewPassword: string): Promise<boolean> {
  try {
    const updatedUser = await this.model.findOneAndUpdate(
      { email },
      { $set: { password: hashedNewPassword } },
      { new: true, runValidators: true }
    ).lean();

    console.log(updatedUser, "Password updated");
    return !!updatedUser;
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return false;
  }
}

  

}

export default UserRepository;

