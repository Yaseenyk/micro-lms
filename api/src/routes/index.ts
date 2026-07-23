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

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(courseRouter);
apiRouter.use(paymentRouter);
