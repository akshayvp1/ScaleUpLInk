import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IInvestorController } from "../../controllers/investor/interface/IInvestorController";
import InvestorService from "../../services/investor/investorService";

@injectable()
class InvestorController implements IInvestorController {
    private investorService: InvestorService;

    constructor(@inject("InvestorService") investorService: InvestorService) {
        this.investorService = investorService;
    }

    completeProfile=async(req:Request,res:Response):Promise<void>=>{
        try{
           const userData = req.body
           console.log(userData,"userrrrrrdata")
           if (!userData) {
            res.status(400).json({ message: "Google credential is required." });
            return;
          }
          const result = await this.investorService.completeProfile(userData)
          console.log(result,"MMMMMM")
         
          const {user,accessToken,refreshToken}=result
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
          res.status(200).json({
            user,
            accessToken,
          });
          
      
        }catch(error){
          console.log(error)
        }
      }
      
}

export default InvestorController;
