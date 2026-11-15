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
    const decoded = await verifyAccessToken(token);

    if (!decoded || typeof decoded !== "object" || !("id" in decoded) || !("role" in decoded)) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    req.user = decoded as ITokenPayload;
    next();
  } catch (error) {
    console.error("Token verification failed:", error instanceof Error ? error.message : error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorize = (...roles: string[]) => {
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
      console.error("Authorization check failed:", error instanceof Error ? error.message : error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
};