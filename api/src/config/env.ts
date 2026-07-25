/**
 * The single source of validated configuration (docs/01 §2.1).
 *
 * All config comes from environment variables. This module validates them ONCE
 * at process start; if a required variable is missing or malformed the process
 * refuses to start with a clear error. Nothing else in the codebase reads
 * `process.env` directly — everything imports `env` from here.
 */
import { z } from "zod";

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(8080),

    // Data
    MONGODB_URI: z.string().url(),

    // Auth (docs/01 §2.2)
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    JWT_EXPIRES_IN: z.string().default("15m"),

    // Payments (docs/01 §2.3, docs/04 §0a). Optional so the API boots without
    // them; when all three are present the payment surface (order + webhook)
    // is mounted. Access itself is decided per course by price, independent of
    // whether payments are configured — a paid course simply cannot be
    // purchased until the keys are set (the dev bypass covers local testing).
    RAZORPAY_KEY_ID: z.string().min(1).optional(),
    RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),

    // Security (docs/01 §2.4) — restrict CORS to the known frontend origin.
    CORS_ORIGIN: z.string().url(),
  });

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    // Fail fast, loudly, without printing any values.
    console.error(
      `\nInvalid environment configuration. The API cannot start.\n${issues}\n\n` +
        `See .env.example for the required variables.\n`,
    );
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();

export const isProd = env.NODE_ENV === "production";

/**
 * Payments are live only when all three Razorpay secrets are present. Gates
 * mounting of /api/payment/order and the webhook (docs/04 §0a). When false, a
 * paid course still shows its paywall but cannot be purchased.
 */
export const isPaymentsEnabled = Boolean(
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_WEBHOOK_SECRET,
);
