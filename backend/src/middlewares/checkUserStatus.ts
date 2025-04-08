import { Request, Response, NextFunction } from "express";
import IAuthService from "../services/entrepreneur/interface/IAuthService";
import { ITokenPayload } from "../utils/jwt";
import IInvestorService from "../services/investor/interface/IInvestorService";

export const isUserActive = (authService: IAuthService, investorService: IInvestorService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as ITokenPayload;
      console.log(user,"ZZZZZZZZZZZZ")
      if (!user || !user.id) {
        res.status(401).json({ message: "Unauthenticated" });
        return;
      }

      // Skip active check if user is an admin
      // if (user.role === "admin") {
      //   return next();
      // }

      // Check active status for entrepreneurs and investors
      let isActive: boolean = true;
      if (user.role === "entrepreneur") {
        isActive = await authService.checkActiveStatus(user.id);
      }
      if (user.role === "investor") {
        isActive = await investorService.checkActiveStatus(user.id);
      }

      if (!isActive) {
        res.status(403).json({ message: "Your account is blocked" });
        return;
      }

      next();
    } catch (error) {
      console.error("Error in isUserActive middleware:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};
