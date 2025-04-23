import { Request, Response } from "express";
import { IAdmin } from "../../../interfaces/IAdmin";

export interface IAdminAuthRepository{
    findByEmail(email: string): Promise<IAdmin | null>
}