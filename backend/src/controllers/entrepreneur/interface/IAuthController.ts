import { Request, Response } from "express";

export interface IAuthController {
  register(req: Request, res: Response): Promise<void>;
  verifyOTP(req: Request, res: Response): Promise<void>;
  resendOtp(req: Request, res: Response): Promise<void>;
  signIn(req:Request,res:Response):Promise<void>;
  googleSignIn(req: Request, res: Response): Promise<void>;
  setEntrepreneurRole(req:Request,res:Response):Promise<void>;
  addInterests (req: Request, res: Response): Promise<void>
  updateData(req:Request,res:Response):Promise<void>
}