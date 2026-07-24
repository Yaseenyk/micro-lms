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

    // Access model (docs/04 §0a). Free by default: every catalog course is open
    // to any signed-in user and the payment surface is not mounted. Set
    // FREE_ACCESS=false to restore the paid Razorpay flow.
    FREE_ACCESS: z
      .string()
      .optional()
      .transform((v) => v !== "false"),

    // Payments (docs/01 §2.3) — required only when FREE_ACCESS is false.
    RAZORPAY_KEY_ID: z.string().min(1).optional(),
    RAZORPAY_KEY_SECRET: z.string().min(1).optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional(),

    // Security (docs/01 §2.4) — restrict CORS to the known frontend origin.
    CORS_ORIGIN: z.string().url(),
  })
  .superRefine((cfg, ctx) => {
    // Fail fast (docs/01 §2.1): a paid deployment must carry its payment keys.
    if (cfg.FREE_ACCESS) return;
    for (const key of ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"] as const) {
      if (!cfg[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: "is required when FREE_ACCESS is false",
        });
      }
    }
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

/** Every catalog course is open to any signed-in user (docs/04 §0a). */
export const isFreeAccess = env.FREE_ACCESS;
