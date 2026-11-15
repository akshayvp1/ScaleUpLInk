import { Request, Response } from "express";

export interface IChatController {
  getMessages(req: Request, res: Response): Promise<void>;
  getUsers(req: Request, res: Response): Promise<Response>;
}
