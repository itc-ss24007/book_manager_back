import { Request, Response, NextFunction } from "express";

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated?.()) return next();
  return res.status(401).json({ message: "ログインが必要です" });
};

export const ensureAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated?.() && (req.user as any)?.is_admin) {
    return next();
  }
  return res.status(403).json({ message: "管理者権限が必要です" });
};