/**
 * Rate limiters (docs/01 §2.4). A permissive baseline for all traffic, plus a
 * strict factory for sensitive routes (auth, payment) to be applied when those
 * routes are added. Exceeding a limit returns the standard RATE_LIMITED
 * envelope (docs/04 §1).
 */
import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import type { Request, Response } from "express";

function rateLimitedResponse(req: Request, res: Response): void {
  res.status(429).json({
    ok: false,
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests, please retry shortly",
      requestId: req.id,
    },
  });
}

/** Baseline limiter for the whole API. */
export const baselineLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: rateLimitedResponse,
});

/** Stricter limiter for auth/payment routes (apply per-route later). */
export function strictLimiter(limit = 10): RateLimitRequestHandler {
  return rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: rateLimitedResponse,
  });
}
