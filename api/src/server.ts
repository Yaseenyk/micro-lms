/**
 * Express application assembly (docs/01 §2.4). Wires the standard security
 * middleware and mounts the API router. This file contains no business logic —
 * it is composition only.
 *
 * NOTE for a later step: the Razorpay webhook (docs/01 §2.3) must receive the
 * RAW request body for signature verification. When it is added it must be
 * mounted with `express.raw(...)` BEFORE the global `express.json()` parser
 * below, or on a path excluded from JSON parsing. See the marked line.
 */
import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { requestId } from "./middleware/request-id.js";
import { baselineLimiter } from "./middleware/rate-limit.js";
import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/index.js";
import { razorpayWebhookHandler } from "./routes/webhooks.razorpay.js";

export function createServer(): Express {
  const app = express();

  // Trust Railway's proxy so client IPs / protocol are correct (rate-limit, secure cookies).
  app.set("trust proxy", 1);

  // Security headers.
  app.use(helmet());

  // CORS restricted to the known frontend origin (never "*"). Credentials on
  // for the httpOnly refresh cookie used by auth (added later).
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  // Correlation id + structured request logging (reusing the same id).
  app.use(requestId);
  app.use(pinoHttp({ logger, genReqId: (req) => (req as { id?: string }).id ?? "" }));

  // Baseline rate limiting across the whole API.
  app.use(baselineLimiter);

  // Razorpay webhook — RAW body, mounted BEFORE express.json so the signature
  // can be verified over the exact bytes Razorpay signed (docs/01 §2.3).
  app.post(
    "/api/webhooks/razorpay",
    express.raw({ type: "*/*", limit: "1mb" }),
    razorpayWebhookHandler,
  );

  // Cookies (httpOnly refresh token) + JSON body parsing for the rest of the API.
  app.use(cookieParser());
  app.use(express.json({ limit: "256kb" }));

  // Feature routes.
  app.use("/api", apiRouter);

  // Unmatched routes + centralized error envelope (order matters: last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
