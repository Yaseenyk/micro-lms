/**
 * Structured logger (docs/01 §2.4). Errors are logged with correlation ids,
 * never with secrets or full sensitive payloads. Redaction is enforced here so
 * tokens/keys/authorization headers can never leak into logs.
 */
import { pino } from "pino";
import { env, isProd } from "../config/env.js";

export const logger = pino({
  level: isProd ? "info" : "debug",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
      "*.pwdHash",
      "*.RAZORPAY_KEY_SECRET",
      "*.JWT_SECRET",
    ],
    censor: "[redacted]",
  },
  ...(isProd
    ? {}
    : { transport: { target: "pino-pretty", options: { colorize: true } } }),
  base: { env: env.NODE_ENV },
});
