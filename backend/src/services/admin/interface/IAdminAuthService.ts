import { Request, Response } from "express";

export interface IAdminAuthService{
    checkActiveStatus(id:string):Promise<boolean>
}