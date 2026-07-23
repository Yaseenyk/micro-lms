/**
 * JWT validation for protected routes (docs/01 §2.2). Validates signature,
 * expiry, issuer, and audience with a pinned algorithm, then attaches a typed
 * `req.auth`. Handlers never parse tokens themselves. Authorization decisions
 * (role/ownership) belong in the Logic layer, not here.
 */
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../lib/app-error.js";

export const JWT_ISSUER = "micro-lms";
export const JWT_AUDIENCE = "micro-lms-web";

function extractBearer(req: Request): string | null {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

/** Read the authenticated context set by requireAuth; throws if absent. */
export function getAuth(req: Request): { userId: string; role: "student" | "admin" } {
  if (!req.auth) throw new AppError("UNAUTHENTICATED", "Not authenticated");
  return req.auth;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearer(req);
  if (!token) return next(new AppError("UNAUTHENTICATED", "Missing bearer token"));
  try {
    const claims = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"], // pinned — reject alg:none / confusion
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as jwt.JwtPayload;

    const userId = claims.sub;
    const role = claims.role;
    if (typeof userId !== "string" || (role !== "student" && role !== "admin")) {
      return next(new AppError("INVALID_TOKEN", "Malformed token claims"));
    }
    req.auth = { userId, role };
    next();
  } catch {
    next(new AppError("INVALID_TOKEN", "Invalid or expired token"));
  }
}
