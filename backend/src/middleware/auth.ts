import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secure_jwt_secret_key_laxmi_toyota";

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    email?: string;
    phone?: string;
    role: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const bearer = req.headers.authorization;

  const bearerToken = bearer?.startsWith("Bearer ")
    ? bearer.split(" ")[1]
    : null;

  const token = bearerToken || req.cookies?.admin_session || req.cookies?.token;

  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId || decoded.id;
    decoded.id = userId;
    decoded.userId = userId;

    req.admin = decoded;
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    if (!roles.includes(req.admin.role)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }
    next();
  };
}

