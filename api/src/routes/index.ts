/**
 * Route aggregation (Presentation layer). Feature routers mount here under the
 * `/api` prefix. The Razorpay webhook is NOT here — it needs a raw body parser
 * and is mounted directly in server.ts before express.json (docs/01 §2.3).
 */
import { Router } from "express";
import { healthRouter } from "./health.js";
import { authRouter } from "./auth.routes.js";
import { courseRouter } from "./course.routes.js";
import { paymentRouter } from "./payment.routes.js";
import { devRouter } from "./dev.routes.js";
import { isPaymentsEnabled, isProd } from "../config/env.js";
import { logger } from "../lib/logger.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(courseRouter);

// The order endpoint exists only when payments are configured (docs/04 §0a).
// Paid courses still show a paywall without it; they just cannot be bought.
if (isPaymentsEnabled) {
  apiRouter.use(paymentRouter);
} else {
  logger.warn("Razorpay keys absent — /api/payment/order not mounted; paid courses cannot be purchased.");
}

// Local development only: an entitlement bypass so the player can be exercised
// without a live Razorpay payment. Never mounted in production, where the
// verified webhook is the sole entitlement authority (docs/04 §9).
if (!isProd) {
  apiRouter.use(devRouter);
  logger.warn("DEV routes enabled at /api/dev/* — entitlement bypass active. Never in production.");
}
