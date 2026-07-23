/**
 * Process entry point.
 *
 * Load order matters: dotenv populates process.env FIRST, then `env` validates
 * it at import time (docs/01 §2.1) and the process exits if anything is missing
 * or malformed — before we connect a database or open a socket.
 */
import "dotenv/config";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  await connectDb();

  const app = createServer();
  const server = app.listen(env.PORT, () => {
    logger.info(`micro-lms API listening on :${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => {
      void disconnectDb().finally(() => process.exit(0));
    });
  };
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.on(signal, () => shutdown(signal));
  }
}

process.on("unhandledRejection", (reason) => logger.error({ reason }, "unhandledRejection"));
process.on("uncaughtException", (err) => {
  logger.error({ err }, "uncaughtException");
  process.exit(1);
});

main().catch((err) => {
  logger.error({ err }, "startup failed");
  process.exit(1);
});
