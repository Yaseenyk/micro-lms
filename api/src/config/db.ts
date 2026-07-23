/** MongoDB connection (Data layer infra). Least-privilege user + TLS are
 *  enforced at the Atlas/connection-string level (docs/01 §2.4). */
import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../lib/logger.js";

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  logger.info("MongoDB connected");
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
