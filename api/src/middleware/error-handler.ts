/**
 * The one place errors become responses (docs/04 §1). Turns AppError, ZodError,
 * and anything unexpected into the standard error envelope. Never leaks stack
 * traces, secrets, or raw DB/internal errors to the client.
 */
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, type ErrorDetail } from "../lib/app-error.js";
import { logger } from "../lib/logger.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Zod validation failures → 422 VALIDATION_ERROR with field details.
  if (err instanceof ZodError) {
    const details: ErrorDetail[] = err.issues.map((i) => ({
      path: i.path.join("."),
      issue: i.message,
    }));
    res.status(422).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details,
        requestId: req.id,
      },
    });
    return;
  }

  // Known application errors → their mapped code/status.
  if (err instanceof AppError) {
    res.status(err.status).json({
      ok: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        requestId: req.id,
      },
    });
    return;
  }

  // Anything else is unexpected: log the real cause, return a generic 500.
  logger.error({ err, requestId: req.id }, "unhandled error");
  res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL",
      message: "Something went wrong",
      requestId: req.id,
    },
  });
}
