/** `transactions` collection (docs/03 §2). Audit trail + idempotency anchor
 *  for Razorpay. Status is driven by the verified webhook only. */
import { Schema, model, type Types } from "mongoose";

export type TransactionStatus = "created" | "paid" | "failed" | "refunded";

export interface TransactionDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  courseId: string;
  orderId: string;
  paymentId: string | null;
  amount: number; // paise
  currency: string;
  status: TransactionStatus;
  webhookEventIds: string[]; // idempotency ledger
  sv: number;
  createdAt: number;
  updatedAt: number;
}

const transactionSchema = new Schema<TransactionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: String, required: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created" },
    webhookEventIds: { type: [String], default: [] },
    sv: { type: Number, default: 1 },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
  },
  { versionKey: false },
);

transactionSchema.index({ paymentId: 1 }, { unique: true, sparse: true });
transactionSchema.index({ userId: 1, courseId: 1 });

export const TransactionModel = model<TransactionDoc>("Transaction", transactionSchema, "transactions");
