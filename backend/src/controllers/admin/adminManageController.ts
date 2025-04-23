import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IAdminManageController } from "./interface/IAdminManageController";
import AdminManageService from "../../services/admin/adminMangeService";

@injectable()
class AdminMangeControllers implements IAdminManageController {
  constructor(
    @inject("AdminManageService") private adminManageService: AdminManageService
  ) {}

  getUsers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.adminManageService.getAllUsers();
      console.log(users,"contorller")
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  blockUser=async(req:Request,res:Response):Promise<void>=>{
    try {
      const {userId} = req.params;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
  
      await this.adminManageService.blockUser(userId);
      res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
      console.error("Controller Error - blockUser:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  unblockUser=async(req:Request,res:Response):Promise<void>=>{
    try{
      const {userId} = req.params;
      console.log(userId,"oooo")
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
  
      await this.adminManageService.unBlockUser(userId);
      res.status(200).json({ message: "User unblocked successfully" });
    }catch(error){
      console.error("Controller Error - unblockUser:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
 
  getAllEvents = async (_req: Request, res: Response): Promise<void> => {
    try {
      const events = await this.adminManageService.getAllEvents();
      res.status(200).json({ data: events });
    } catch (error) {
      console.error('Error in getAllEvents controller:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  approveEvent = async(req:Request,res:Response):Promise<void>=>{
    try {
      const { eventId } = req.params;
      
      if (!eventId) {
        res.status(400).json({ message: "eventId is required" });
        return;
      }
  
      await this.adminManageService.approveEvent(eventId);
      res.status(200).json({ message: "approved successfully" });
    } catch(error) {
      console.error("Controller Error - approveEvent:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  unapproveEvent = async(req:Request,res:Response):Promise<void>=>{
    try {
      const { eventId } = req.params;
      console.log(eventId,"controlle aanutta")
      if (!eventId) {
        res.status(400).json({ message: "eventId is required" });
        return;
      }
  
      await this.adminManageService.unapproveEvent(eventId);
      res.status(200).json({ message: "Unapproved successfully" });
    } catch(error) {
      console.error("Controller Error - approveEvent:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
  
  
}

export default AdminMangeControllers;
