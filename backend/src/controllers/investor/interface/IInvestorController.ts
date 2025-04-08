import { Request, Response } from "express";

export interface IInvestorController {
    completeProfile(req: Request, res: Response): Promise<void>;
}