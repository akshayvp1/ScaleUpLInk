import { Request, Response } from 'express';

export interface IStoryController {
  createStory(req: Request, res: Response): Promise<void>;
  getUserStories(req: Request, res: Response): Promise<void>;
  addStoryViewers(req:Request,res:Response):Promise<void>
  getStoryById(req:Request,res:Response):Promise<void>
}