import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IInvestorController } from "../../controllers/investor/interface/IInvestorController";
import InvestorService from "../../services/investor/investorService";
import { InvestorListQuery } from "../../services/investor/interface/IInvestorService";
import { IUser } from "../../interfaces/IUser";
import { refreshCookieOptions } from "../../utils/refreshCookie";

@injectable()
class InvestorController implements IInvestorController {
    private investorService: InvestorService;

    constructor(@inject("InvestorService") investorService: InvestorService) {
        this.investorService = investorService;
    }

    completeProfile=async(req:Request,res:Response):Promise<void>=>{
        try{
          const { userData } = req.body as { userData?: Partial<IUser> };

          if (!userData) {
            res.status(400).json({ message: "User data is required." });
            return;
          }

          const result = await this.investorService.completeProfile({ userData });
          const {user,accessToken,refreshToken}=result;

          res.cookie(
            "refreshToken",
            refreshToken,
            refreshCookieOptions(7 * 24 * 60 * 60 * 1000)
          );
          res.status(200).json({
            user,
            accessToken,
          });
        }catch(error){
          console.error("Complete profile error:", error);
          res.status(400).json({
            message:
              error instanceof Error
                ? error.message
                : "Failed to complete profile",
          });
        }
      }

    listInvestors = async (req: Request, res: Response): Promise<void> => {
      try {
        const query: InvestorListQuery = {
          search: typeof req.query.search === "string" ? req.query.search : undefined,
          sort:
            req.query.sort === "name" || req.query.sort === "company"
              ? req.query.sort
              : "newest",
          page: req.query.page ? Number(req.query.page) : 1,
          limit: req.query.limit ? Number(req.query.limit) : 12,
        };

        const result = await this.investorService.listInvestors(
          query,
          req.user?.id
        );

        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        console.error("List investors error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to load investors",
        });
      }
    };

    getInvestorById = async (req: Request, res: Response): Promise<void> => {
      try {
        const viewerId = req.user?.id;
        const investorId = req.params.investorId;

        if (!viewerId) {
          res.status(401).json({ success: false, message: "Unauthorized" });
          return;
        }

        if (typeof investorId !== "string" || !investorId.trim()) {
          res.status(400).json({ success: false, message: "Invalid investor id" });
          return;
        }

        const result = await this.investorService.getInvestorProfile(
          viewerId,
          investorId
        );

        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";

        res.status(message === "NOT_FOUND" ? 404 : 500).json({
          success: false,
          message:
            message === "NOT_FOUND"
              ? "Investor not found"
              : "Failed to load investor profile",
        });
      }
    };
}

export default InvestorController;
