import { Request, Response } from "express";

export interface ISearchController {
  searchUsers(req: Request, res: Response): Promise<void>;
}