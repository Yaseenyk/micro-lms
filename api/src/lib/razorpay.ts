/**
 * Razorpay integration (docs/01 §2.3, docs/04 §8-9). Order creation via the
 * REST API (no SDK dependency); webhook verification via timing-safe HMAC on
 * the RAW request body.
 */
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { AppError } from "./app-error.js";

/**
 * Razorpay credentials are optional in the env schema because free-access mode
 * runs without them (docs/04 §0a). Every payment path goes through this guard,
 * so a misconfigured PAID deployment fails loudly at the call site rather than
 * silently signing with `undefined`.
 */
function requireKey(name: "RAZORPAY_KEY_ID" | "RAZORPAY_KEY_SECRET" | "RAZORPAY_WEBHOOK_SECRET"): string {
  const value = env[name];
  if (!value) {
    throw new AppError("INTERNAL", `${name} is not configured (payments are disabled)`);
  }
  return value;
}

/** Timing-safe HMAC-SHA256 verification of a Razorpay webhook (docs/01 §2.3). */
export function verifyWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
  const expected = crypto
    .createHmac("sha256", requireKey("RAZORPAY_WEBHOOK_SECRET"))
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature ?? "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

/** Create an order. Amount is server-resolved (docs/04 §8) and passed in. */
export async function createOrder(amountPaise: number, receipt: string): Promise<RazorpayOrder> {
  const auth = Buffer.from(
    `${requireKey("RAZORPAY_KEY_ID")}:${requireKey("RAZORPAY_KEY_SECRET")}`,
  ).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt, payment_capture: 1 }),
  });
  if (!res.ok) {
    throw new AppError("PAYMENT_ERROR", "Could not create payment order");
  }
  return (await res.json()) as RazorpayOrder;
}
