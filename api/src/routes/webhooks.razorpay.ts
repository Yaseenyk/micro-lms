/**
 * Razorpay webhook (Presentation — docs/01 §2.3, docs/04 §9). Mounted in
 * server.ts with a RAW body parser BEFORE express.json. Verifies the signature
 * on the raw bytes before trusting anything; then delegates to the service.
 */
import type { NextFunction, Request, Response } from "express";
import { verifyWebhookSignature } from "../lib/razorpay.js";
import { webhookService } from "../services/webhook.service.js";
import { logger } from "../lib/logger.js";

export async function razorpayWebhookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const raw = req.body as Buffer; // express.raw → Buffer
    const signature = req.header("x-razorpay-signature");

    if (!Buffer.isBuffer(raw) || !verifyWebhookSignature(raw, signature)) {
      logger.warn({ requestId: req.id }, "razorpay webhook signature verification failed");
      res.status(400).json({
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid signature", requestId: req.id },
      });
      return;
    }

    const event = JSON.parse(raw.toString("utf8")) as unknown;
    await webhookService.handleEvent(event as Parameters<typeof webhookService.handleEvent>[0]);

    // Always 200 once the signature is valid so Razorpay stops retrying.
    res.status(200).json({ ok: true, data: { received: true } });
  } catch (err) {
    next(err);
  }
}
