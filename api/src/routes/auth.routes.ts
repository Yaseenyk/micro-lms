/**
 * Auth routes (Presentation — docs/04 §2-5). Thin: validate input, delegate to
 * the service, shape the response. The refresh token lives in an httpOnly,
 * SameSite=strict, Secure(prod) cookie scoped to /api/auth (docs/01 §2.2).
 */
import { Router, type Response } from "express";
import { z } from "zod";
import { authService, type AuthResult } from "../services/auth.service.js";
import { sendOk } from "../lib/http.js";
import { isProd } from "../config/env.js";
import { getAuth, requireAuth } from "../middleware/require-auth.js";
import { strictLimiter } from "../middleware/rate-limit.js";

export const authRouter = Router();

const REFRESH_COOKIE = "rt";
const REFRESH_PATH = "/api/auth";
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function setRefreshCookie(res: Response, value: string): void {
  res.cookie(REFRESH_COOKIE, value, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: REFRESH_PATH,
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

function respondWithAuth(res: Response, status: number, result: AuthResult): void {
  setRefreshCookie(res, result.refreshToken);
  sendOk(res, { user: result.user, accessToken: result.accessToken }, status);
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(120),
});
authRouter.post("/auth/register", strictLimiter(), async (req, res, next) => {
  try {
    respondWithAuth(res, 201, await authService.register(registerSchema.parse(req.body)));
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
authRouter.post("/auth/login", strictLimiter(), async (req, res, next) => {
  try {
    respondWithAuth(res, 200, await authService.login(loginSchema.parse(req.body)));
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/refresh", strictLimiter(20), async (req, res, next) => {
  try {
    const cookies = req.cookies as Record<string, string> | undefined;
    const result = await authService.refresh(cookies?.[REFRESH_COOKIE]);
    setRefreshCookie(res, result.refreshToken);
    sendOk(res, { accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/auth/logout", requireAuth, async (req, res, next) => {
  try {
    await authService.logout(getAuth(req).userId);
    res.clearCookie(REFRESH_COOKIE, { path: REFRESH_PATH });
    sendOk(res, { loggedOut: true });
  } catch (err) {
    next(err);
  }
});
