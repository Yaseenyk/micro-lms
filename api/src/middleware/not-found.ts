/**
 * Catch-all for unmatched routes → standard NOT_FOUND envelope (docs/04 §1).
 */
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error.js";

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError("NOT_FOUND", `No route for ${req.method} ${req.path}`));
}
