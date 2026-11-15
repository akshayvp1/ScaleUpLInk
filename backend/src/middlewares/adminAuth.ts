import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, ITokenPayload } from "../utils/jwt";

declare module "express-serve-static-core" {
  interface Request {
    user?: ITokenPayload;
  }
}

export const adminAuthenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }
  
    try {
      const decoded = (await verifyAccessToken(token)) as ITokenPayload;

      if (decoded.role !== "admin") {
        res.status(403).json({ message: "Access denied: Admins only" });
        return;
      }
  
      req.user = decoded;
      next();
    } catch (error) {
      console.error(
        "Token verification failed:",
        error instanceof Error ? error.message : error
      );
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
  
