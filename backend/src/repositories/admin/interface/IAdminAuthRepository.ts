import { Request, Response } from "express";
import { IAdmin } from "../../../interfaces/IAdmin";
// import { IUser } from "../../../interfaces/IUser";
export interface IAdminAuthRepository{
    findByEmail(email: string): Promise<IAdmin | null>
    findAdminById(id: string): Promise<IAdmin | null>
}