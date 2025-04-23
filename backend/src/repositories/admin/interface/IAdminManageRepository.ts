// import { Request,Response } from "express"
// import { IUser } from "../../../interfaces/IUser"
// export interface IAdminManageRepository{
// getAllUsers(): Promise<IUser[]>
// }



import { IUser } from "../../../interfaces/IUser";
import { EventDocument } from "../../../interfaces/IEvent";

export interface IAdminManageRepository {
  getAllUsers(): Promise<IUser[]>;
  blockUser(userId: string): Promise<void>;
  unBlockUser(userId: string): Promise<void>;
  getAllEvents(): Promise<EventDocument[]>;
}