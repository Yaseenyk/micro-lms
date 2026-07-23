/**
 * Transaction repository (Data layer). The only place `TransactionModel` is
 * queried. Drives the idempotent, webhook-authoritative payment state
 * (docs/03 §2, docs/04 §9). Returns plain data, never Mongoose documents.
 */
import { TransactionModel } from "../models/transaction.model.js";
import { nowUnix } from "../lib/time.js";

export const transactionRepository = {
  async create(input: {
    userId: string;
    courseId: string;
    orderId: string;
    amount: number;
  }): Promise<void> {
    const now = nowUnix();
    await TransactionModel.create({
      userId: input.userId,
      courseId: input.courseId,
      orderId: input.orderId,
      paymentId: null,
      amount: input.amount,
      currency: "INR",
      status: "created",
      webhookEventIds: [],
      sv: 1,
      createdAt: now,
      updatedAt: now,
    });
  },

  /** Idempotency guard (docs/01 §2.3): has this event already been applied? */
  async hasProcessedEvent(orderId: string, eventId: string): Promise<boolean> {
    const exists = await TransactionModel.exists({ orderId, webhookEventIds: eventId });
    return exists !== null;
  },

  /** Flip to paid exactly once; returns the grant target, or null if already paid/missing. */
  async markPaid(
    orderId: string,
    paymentId: string,
    eventId: string,
  ): Promise<{ userId: string; courseId: string } | null> {
    const doc = await TransactionModel.findOneAndUpdate(
      { orderId, status: { $ne: "paid" } },
      {
        $set: { status: "paid", paymentId, updatedAt: nowUnix() },
        $addToSet: { webhookEventIds: eventId },
      },
      { new: true },
    );
    return doc ? { userId: doc.userId.toString(), courseId: doc.courseId } : null;
  },

  async markFailed(orderId: string, eventId: string): Promise<void> {
    await TransactionModel.updateOne(
      { orderId },
      { $set: { status: "failed", updatedAt: nowUnix() }, $addToSet: { webhookEventIds: eventId } },
    );
  },

  async recordEvent(orderId: string, eventId: string): Promise<void> {
    await TransactionModel.updateOne(
      { orderId },
      { $addToSet: { webhookEventIds: eventId }, $set: { updatedAt: nowUnix() } },
    );
  },
};
