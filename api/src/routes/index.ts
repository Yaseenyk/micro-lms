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
import { isProd } from "../config/env.js";
import { logger } from "../lib/logger.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(courseRouter);
apiRouter.use(paymentRouter);

// Local development only: an entitlement bypass so the player can be exercised
// without a live Razorpay payment. Never mounted in production, where the
// verified webhook is the sole entitlement authority (docs/04 §9).
if (!isProd) {
  apiRouter.use(devRouter);
  logger.warn("DEV routes enabled at /api/dev/* — entitlement bypass active. Never in production.");
}
