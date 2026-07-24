/**
 * Payment service (Logic layer — docs/04 §8). Resolves the price server-side
 * (never trusts the client), creates a Razorpay order, and records a `created`
 * transaction. Entitlement is NOT granted here — only the verified webhook
 * grants access (docs/04 §9).
 */
import { userRepository } from "../repositories/user.repository.js";
import { transactionRepository } from "../repositories/transaction.repository.js";
import { getCatalogCourse } from "../config/catalog.js";
import { createOrder } from "../lib/razorpay.js";
import { env } from "../config/env.js";
import { AppError } from "../lib/app-error.js";

export const paymentService = {
  async createOrder(
    userId: string,
    courseId: string,
  ): Promise<{ orderId: string; amount: number; currency: string; razorpayKeyId: string }> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("UNAUTHENTICATED", "User not found");
    if (user.entitlements.includes(courseId)) {
      throw new AppError("CONFLICT", "You already own this course");
    }
    const course = getCatalogCourse(courseId);
    if (!course) throw new AppError("NOT_FOUND", "Unknown course");

    const receipt = `rcpt_${userId}_${courseId}`.slice(0, 40);
    const order = await createOrder(course.priceInPaise, receipt);

    await transactionRepository.create({
      userId,
      courseId,
      orderId: order.id,
      amount: course.priceInPaise,
    });

    return {
      orderId: order.id,
      amount: course.priceInPaise,
      currency: "INR",
      // Publishable id only. Non-null here: this route is unmounted in
      // free-access mode, and createOrder above already required the keys.
      razorpayKeyId: env.RAZORPAY_KEY_ID ?? "",
    };
  },
};
