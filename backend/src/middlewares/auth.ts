// import { Request, Response, NextFunction } from "express";
// import { verifyAccessToken, ITokenPayload } from "../utils/jwt";

// declare module "express-serve-static-core" {
//   interface Request {
//     user?: ITokenPayload;
//   }
// }

// export const authenticate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader?.split(" ")[1];
//   console.log(token,"NUUUU")

//   if (!token) {
//     res.status(401).json({ message: "No token provided" });
//     return;
//   }

//   try {
//     const decoded = (await verifyAccessToken(token)) as ITokenPayload;
//     console.log("datammmmmm",decoded)
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// export const authorize = (...roles: string[]) => {
//   console.log(roles,"VVVVVVVVV")
//   return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       if (!req.user) {
//         res.status(401).json({ message: "Authentication required" });
//         return;
//       }

//       if (roles.length && !roles.includes(req.user.role)) {
//         res.status(403).json({ message: "Access denied" });
//         return;
//       }

//       next();
//     } catch (error) {
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   };
// };

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, ITokenPayload } from "../utils/jwt";

declare module "express-serve-static-core" {
  interface Request {
    user?: ITokenPayload;
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  console.log("Auth Header:", authHeader); 
  const token = authHeader?.split(" ")[1];
  console.log("Token:", token, "NUUUU");

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = (await verifyAccessToken(token)) as ITokenPayload;
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorize = (...roles: string[]) => {
  console.log("Authorized roles:", roles, "VVVVVVVVV");
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      if (roles.length && !roles.includes(req.user.role)) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};
