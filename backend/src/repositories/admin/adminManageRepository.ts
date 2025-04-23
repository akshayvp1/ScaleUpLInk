// import { injectable, inject } from "tsyringe";
// import { IAdminManageRepository } from "./interface/IAdminManageRepository";
// // import { IAdmin } from "../../interfaces/IAdmin";
// import { IUser } from "../../interfaces/IUser";
// import { Model } from "mongoose";

// @injectable()
// class AdminManageRepository implements IAdminManageRepository {
//   // private readonly adminModel: Model<IAdmin>;
//   private readonly userModel: Model<IUser>;

//   constructor(
//     // @inject("AdminModel") adminModel: Model<IAdmin>,
//     @inject("UserModel") userModel: Model<IUser>
//   ) {
//     // this.adminModel = adminModel;
//     this.userModel = userModel;
//   }

//   async getAllUsers(): Promise<IUser[]> {
//     try {
//       return await this.userModel.find({});
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       return [];
//     }
//   }
//   async blockUser(userId: string): Promise<void> {
//     try {
//       await this.userModel.findByIdAndUpdate(userId, { isActive: false });
//     } catch (error) {
//       console.error("Repository Error - blockUser:", error);
//       throw error;
//     }
//   }
//   async unBlockUser(userId:string):Promise<void>{
//     try{
//      await this.userModel.findByIdAndUpdate(userId,{isActive:true})
//     }catch(error){
//       console.log(error)
//       throw error
//     }
//   }
  
// }

// export default AdminManageRepository;




import { injectable, inject } from "tsyringe";
import { IAdminManageRepository } from "./interface/IAdminManageRepository";
import { IUser } from "../../interfaces/IUser";
import { EventDocument } from "../../interfaces/IEvent";
import { Model } from "mongoose";

@injectable()
class AdminManageRepository implements IAdminManageRepository {
  private readonly userModel: Model<IUser>;
  private readonly eventModel: Model<EventDocument>;

  constructor(
    @inject("UserModel") userModel: Model<IUser>,
    @inject("EventModel") eventModel: Model<EventDocument>
  ) {
    this.userModel = userModel;
    this.eventModel = eventModel; // Corrected typo from evnetModel
  }

  async getAllUsers(): Promise<IUser[]> {
    try {
      return await this.userModel.find({}).exec();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  async blockUser(userId: string): Promise<void> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      ).exec();
      if (!user) {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Repository Error - blockUser:", error);
      throw new Error(`Failed to block user`);
    }
  }

  async unBlockUser(userId: string): Promise<void> {
    try {
      console.log("looooooooo")
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { isActive: true },
        { new: true }
      ).exec();
      console.log(user,"repository user ")
      if (!user) {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Repository Error - unBlockUser:", error);
      throw new Error(`Failed to unblock user: `);
    }
  }

  async getAllEvents(): Promise<EventDocument[]> {
    try {
      return await this.eventModel
        .find({})
        .populate('user_id', 'name image') // Include necessary fields from the user
        .exec();
    } catch (error) {
      console.error("Error fetching events:", error);
      throw new Error("Failed to fetch events");
    }
  }
  async findEventById(eventId: string): Promise<EventDocument | null> {
    try {
      const event = await this.eventModel.findById(eventId).exec();
      return event;
    } catch (error) {
      console.error("Repository Error - findEventById:", error);
      throw new Error("Failed to fetch event");
    }
  }
  async approveEvent(eventId: string): Promise<void> {
    try {
      console.log("respository")
      const updated = await this.eventModel.findByIdAndUpdate(
        eventId,
        { eventStatus: "approve" },
        { new: true }
      ).exec();
  
      if (!updated) {
        throw new Error("Event not found");
      }
    } catch (error) {
      console.error("Repository Error - approveEvent:", error);
      throw new Error("Failed to approve event");
    }
  }
  async unapproveEvent(eventId: string): Promise<void> {
    try {
      console.log("respository")
      const updated = await this.eventModel.findByIdAndUpdate(
        eventId,
        { eventStatus: "cancelled" },
        { new: true }
      ).exec();
  
      if (!updated) {
        throw new Error("Event not found");
      }
    } catch (error) {
      console.error("Repository Error - approveEvent:", error);
      throw new Error("Failed to approve event");
    }
  }
  
  
  
}

export default AdminManageRepository;
