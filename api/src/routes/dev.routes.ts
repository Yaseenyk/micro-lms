/**
 * DEV-ONLY routes (Presentation). Mounted exclusively outside production — see
 * routes/index.ts, which only wires this router when `!isProd`. These exist
 * purely for local development, e.g. bypassing the Razorpay flow to grant
 * entitlement so the course player can be exercised without a live payment.
 *
 * In production the verified webhook (docs/04 §9) remains the SOLE authority
 * that grants entitlement; this router does not exist there.
 */
import { Router } from "express";
import { z } from "zod";
import { getAuth, requireAuth } from "../middleware/require-auth.js";
import { userRepository } from "../repositories/user.repository.js";
import { getCatalogCourse } from "../config/catalog.js";
import { AppError } from "../lib/app-error.js";
import { sendOk } from "../lib/http.js";
import { logger } from "../lib/logger.js";

export const devRouter = Router();

const grantSchema = z.object({ courseId: z.string().min(1) });

/**
 * POST /api/dev/grant — grant the current (authenticated) user entitlement to a
 * catalog course, no payment required. Local bypass for the Razorpay checkout.
 */
devRouter.post("/dev/grant", requireAuth, async (req, res, next) => {
  try {
    const { courseId } = grantSchema.parse(req.body);
    if (!getCatalogCourse(courseId)) throw new AppError("NOT_FOUND", "Unknown course");
    const { userId } = getAuth(req);
    await userRepository.addEntitlement(userId, courseId);
    logger.warn({ userId, courseId }, "DEV bypass: entitlement granted without payment");
    sendOk(res, { granted: true, courseId });
  } catch (err) {
    next(err);
  }
});
