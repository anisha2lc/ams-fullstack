import { NextFunction, Request, Response } from "express";

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

// Global error handler
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(err);

  const statusCode = err.statusCode && Number.isInteger(err.statusCode)
    ? err.statusCode
    : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message ?? "Internal server error",
  });
};

export default errorHandler;
