import { Request, Response, NextFunction } from "express";
import IAuthService from "../services/entrepreneur/interface/IAuthService";
import { ITokenPayload } from "../utils/jwt";
import IInvestorService from "../services/investor/interface/IInvestorService";

export const isUserActive = (authService: IAuthService, investorService: IInvestorService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as ITokenPayload;

      if (!user || !user.id) {
        res.status(401).json({ message: "Unauthenticated" });
        return;
      }

      // Admins are never blocked through this check — they have their own
      // adminAuthenticate flow, so they simply fall through with isActive = true.
      let isActive = true;
      if (user.role === "entrepreneur") {
        isActive = await authService.checkActiveStatus(user.id);
      } else if (user.role === "investor") {
        isActive = await investorService.checkActiveStatus(user.id);
      }

      if (!isActive) {
        res.status(403).json({ message: "Your account is blocked" });
        return;
      }

      next();
    } catch (error) {
      console.error("Error in isUserActive middleware:", error instanceof Error ? error.message : error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};