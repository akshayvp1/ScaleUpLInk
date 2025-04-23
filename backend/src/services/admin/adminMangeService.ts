import { inject, injectable } from "tsyringe";
import { IAdminManageService } from "./interface/IAdminManageService";
import AdminManageRepository from "../../repositories/admin/adminManageRepository";
import UserRepository from "../../repositories/entrepreneur/userRepository";
import { EventDocument } from "../../interfaces/IEvent";
import { IUser } from "../../interfaces/IUser";

@injectable()
class AdminManageService implements IAdminManageService {
  constructor(
    @inject("AdminManageRepository") private adminManageRepository: AdminManageRepository,
    @inject("UserRepository") private userRepository: UserRepository
  ) {}

  async getAllUsers(): Promise<IUser[]> {
    try {
      const users = await this.adminManageRepository.getAllUsers();
      console.log(users,"Service")
      return users;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  async blockUser(userId:string):Promise<void>{
    try{
       const user = await this.userRepository.findUserById(userId)
       if (!user) {
        throw new Error("User not found");
      }

      await this.adminManageRepository.blockUser(userId);
    }catch(error){
      console.log(error)
    }
  }
  async unBlockUser(userId:string):Promise<void>{
    try{
      const user = await this.userRepository.findUserById(userId)
      if (!user) {
       throw new Error("User not found");
     }

     await this.adminManageRepository.unBlockUser(userId);
    }catch(error){
      console.log(error)
    }
  }
  
  async getAllEvents(): Promise<EventDocument[]> {
    try {
      const events = await this.adminManageRepository.getAllEvents();
      console.log(events,"Service")
      return events;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  async approveEvent(eventId: string): Promise<void> {
    try {
      
      const event = await this.adminManageRepository.findEventById(eventId);
      
      if (!event) {
        throw new Error("Event not found");
      }
      await this.adminManageRepository.approveEvent(eventId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async unapproveEvent(eventId: string): Promise<void> {
    try {
      console.log('haiiiii')
      const event = await this.adminManageRepository.findEventById(eventId);
      console.log(event,"service aanutta")
      if (!event) {
        throw new Error("Event not found");
      }
      await this.adminManageRepository.unapproveEvent(eventId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  
  
}

export default AdminManageService;
