/**
 * Razorpay webhook service (Logic layer — docs/04 §9). Runs ONLY after the
 * route has verified the signature on the raw body (docs/01 §2.3). Idempotent:
 * a re-delivered event is a no-op. This is the sole authority that grants
 * entitlement.
 *
 * NOTE: entitlement grant is sequenced after the paid-flip and guarded by the
 * `status != paid` condition + the event-id idempotency ledger. A follow-up
 * will wrap the flip + grant in a single MongoDB transaction (session) for
 * strict cross-collection atomicity once the Atlas replica set is confirmed.
 */
import { transactionRepository } from "../repositories/transaction.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { logger } from "../lib/logger.js";

interface RazorpayWebhookEvent {
  id?: string;
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
}

export const webhookService = {
  async handleEvent(event: RazorpayWebhookEvent): Promise<void> {
    const eventId = event.id ?? "";
    const type = event.event ?? "";
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;

    if (!orderId || !eventId) return; // not a payment event we track

    if (await transactionRepository.hasProcessedEvent(orderId, eventId)) return; // idempotent

    if (type === "payment.captured" && paymentId) {
      const grant = await transactionRepository.markPaid(orderId, paymentId, eventId);
      if (grant) {
        await userRepository.addEntitlement(grant.userId, grant.courseId);
        logger.info({ orderId, courseId: grant.courseId }, "entitlement granted");
      }
    } else if (type === "payment.failed") {
      await transactionRepository.markFailed(orderId, eventId);
    } else {
      await transactionRepository.recordEvent(orderId, eventId);
    }
  },
};
