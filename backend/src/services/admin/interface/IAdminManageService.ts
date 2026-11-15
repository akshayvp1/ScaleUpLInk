import { IUser } from "../../../interfaces/IUser"
export interface IAdminManageService{
    getAllUsers(): Promise<IUser[]>
}