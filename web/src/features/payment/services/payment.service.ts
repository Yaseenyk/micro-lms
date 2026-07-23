/**
 * Payment Data service (docs/01 §1.3, docs/04 §8). Creates a Razorpay order via
 * the API. The amount is resolved *server-side* from the catalog — the client
 * never sends or trusts a price. Returns only publishable fields.
 */
import { apiClient } from "@/lib/api-client";

export interface OrderResult {
  orderId: string;
  amount: number; // paise, server-resolved
  currency: string;
  razorpayKeyId: string; // publishable key only
}

export const paymentService = {
  createOrder(courseId: string): Promise<OrderResult> {
    return apiClient.post<OrderResult>("/payment/order", { courseId });
  },
};
