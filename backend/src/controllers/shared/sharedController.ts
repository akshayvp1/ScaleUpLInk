// import { Request, Response, NextFunction } from "express";
// import IAuthService from "../../services/entrepreneur/interface/IAuthService";
// import IInvestorService from "../../services/investor/interface/IInvestorService";
// import { ITokenPayload } from "../../utils/jwt";

// export const checkUserStatus = (
//   authService: IAuthService,
//   investorService: IInvestorService
// ) => {
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const user = req.user as ITokenPayload;

//       if (!user || !user.id) {
//          res.status(401).json({ success: false, message: "Unauthorized" });
//          return
//       }

//       let isActive = true;

//       if (user.role === "entrepreneur") {
//         isActive = await authService.checkActiveStatus(user.id);
//       } else if (user.role === "investor") {
//         isActive = await investorService.checkActiveStatus(user.id);
//       }

//       if (!isActive) {
//          res.status(403).json({ success: false, message: "User is Blocked" });
//          return
//       }

//       res.status(200).json({ success: true, message: "User is Active" });
//     } catch (error) {
//       console.error("Error in checkUserStatus:", error);
//       next(error);
//     }
//   };
// };



import { Request, Response, NextFunction } from "express";
import IAuthService from "../../services/entrepreneur/interface/IAuthService";
import IInvestorService from "../../services/investor/interface/IInvestorService";
import { ITokenPayload } from "../../utils/jwt";

export const checkUserStatus = (
  authService: IAuthService,
  investorService: IInvestorService
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as ITokenPayload;

      if (!user || !user.id) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      let isActive = true;

      if (user.role === "entrepreneur") {
        isActive = await authService.checkActiveStatus(user.id);
      } else if (user.role === "investor") {
        isActive = await investorService.checkActiveStatus(user.id);
      }

      if (!isActive) {
        res.status(403).json({ success: false, message: "User is Blocked" });
        return;
      }

      res.status(200).json({ success: true, message: "User is Active" });
    } catch (error) {
      console.error("Error in checkUserStatus:", error);
      next(error);
    }
  };
};
