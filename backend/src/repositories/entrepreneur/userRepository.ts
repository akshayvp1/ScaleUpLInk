
import { injectable, inject } from "tsyringe";
import { IUser } from "../../interfaces/IUser";
import { IUserRepository } from "../entrepreneur/interface/IUserRepository";
import { Model } from "mongoose";

@injectable()
class UserRepository implements IUserRepository {
  private readonly model: Model<IUser>;

  constructor(
    @inject("UserModel") model: Model<IUser>
  ) {
    this.model = model;
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const newUser = new this.model({
        ...userData,
        isBlocked: false,
        isPremium: userData.isPremium || false,
        plan: userData.plan || { type: "free" },
        createdAt: new Date(),
        updatedAt: new Date(),
        followers: [],
        following: [],
        interests: [],
        savedPost: [],
        isActive: true,

        investorDetails:
          userData.role === "investor" && userData.investorDetails
            ? {
                companyName:
                  userData.investorDetails.companyName || "",
                companyFounded:
                  userData.investorDetails.companyFounded || undefined,
                companyRegistration:
                  userData.investorDetails.companyRegistration || undefined
              }
            : undefined
      });

      await newUser.save();

      return newUser;
    } catch (error) {
      throw new Error("Error creating user: " + error);
    }
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await this.model.findOne({ email });

      return user as IUser | null;
    } catch (error) {
      throw new Error("Error finding user by email: " + error);
    }
  }

  async findUserById(id: string): Promise<IUser | null> {
    try {
      const user = await this.model
        .findById(id)
        .select("-password");

      return user as unknown as IUser | null;
    } catch (error) {
      throw new Error("Error finding user by ID: " + error);
    }
  }

  async addInterests(
    email: string,
    interests: string[],
    profession?: string
  ): Promise<IUser | null> {
    try {
      const user = await this.model.findOneAndUpdate(
        { email },
        {
          $addToSet: {
            interests: {
              $each: interests
            }
          },
          ...(profession && { profession })
        },
        { new: true }
      ).select("-password");

      return user as unknown as IUser | null;
    } catch (error) {
      console.error("Error in addInterests repository:", error);
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await this.model.findOne({ email });

    return user as IUser | null;
  }

  async updateData(
    data: {
      name?: string;
      contactNumber?: string;
      profileImage?: string;
      bio?: string;
      email: string;
    }
  ): Promise<IUser | null> {
    try {
      if (!data.email) {
        throw new Error("Email is required");
      }

      const allowedFields = [
        "name",
        "contactNumber",
        "profileImage",
        "bio"
      ] as const;

      const updateQuery: Partial<IUser> = {};

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          updateQuery[field] = data[field] as never;
        }
      }

      const user = await this.model.findOneAndUpdate(
        { email: data.email },
        { $set: updateQuery },
        {
          new: true,
          runValidators: true
        }
      ).select("-password");

      return user as unknown as IUser | null;
    } catch (error) {
      console.error("Error updateData:", error);
      throw new Error("Failed to update user data");
    }
  }

  async updatePassword(
    email: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const user = await this.model.findOneAndUpdate(
        { email },
        {
          $set: {
            password: hashedPassword
          }
        },
        {
          new: true,
          runValidators: true
        }
      );

      return !!user;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  }

  async changeOldPassword(
    email: string,
    hashedNewPassword: string
  ): Promise<boolean> {
    try {
      const user = await this.model.findOneAndUpdate(
        { email },
        {
          $set: {
            password: hashedNewPassword
          }
        },
        {
          new: true,
          runValidators: true
        }
      );

      return !!user;
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  }
}

export default UserRepository;
