import { Request,Response } from "express";
import { ITokenPayload } from "../../../utils/jwt";
export interface IPostController{
    addPost(req: Request & { user?: ITokenPayload }, res: Response): Promise<void>
    getPost(req: Request & { user?: ITokenPayload }, res: Response): Promise<void>
    getUserPosts(req: Request & { user?: ITokenPayload }, res: Response): Promise<void>
    
}