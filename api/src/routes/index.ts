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
import { isFreeAccess, isProd } from "../config/env.js";
import { logger } from "../lib/logger.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(courseRouter);

// Payments are only part of the API when the platform is not free (docs/04
// §0a). In free-access mode every catalog course is open to any signed-in
// user, so there is nothing to sell and no Razorpay surface to expose.
if (!isFreeAccess) {
  apiRouter.use(paymentRouter);
} else {
  logger.info("FREE_ACCESS is on — all courses are open; payment routes not mounted.");
}

// Local development only: an entitlement bypass so the player can be exercised
// without a live Razorpay payment. Never mounted in production, where the
// verified webhook is the sole entitlement authority (docs/04 §9).
if (!isProd) {
  apiRouter.use(devRouter);
  logger.warn("DEV routes enabled at /api/dev/* — entitlement bypass active. Never in production.");
}
