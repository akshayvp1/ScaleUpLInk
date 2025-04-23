import { Request,Response } from "openai/_shims/auto/types"
import { IUser } from "../../../interfaces/IUser"
export interface IAdminManageService{
    getAllUsers(): Promise<IUser[]>
}