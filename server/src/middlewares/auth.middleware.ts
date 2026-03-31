import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { queryOne } from "../config/db";

export type UserRole = "super_admin" | "artist_manager" | "artist";

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: "m" | "f" | "o";
  address: string;
  role: UserRole;
  created_at: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

interface TokenPayload {
  id: number;
  role: UserRole;
}

export const verifyJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;

    const user = await queryOne<AuthUser>(
      `SELECT id, first_name, last_name, email, phone, dob, gender, address, role, created_at
       FROM users
       WHERE id = $1 AND is_active = true`,
      [decoded.id],
    );

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const verifyAuthorizationRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions",
      });
      return;
    }

    next();
  };
};
