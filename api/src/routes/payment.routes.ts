/**
 * Payment routes (Presentation — docs/04 §8). Creates a Razorpay order. Price
 * is resolved server-side in the service; the client only sends a courseId.
 */
import { Router } from "express";
import { z } from "zod";
import { paymentService } from "../services/payment.service.js";
import { sendOk } from "../lib/http.js";
import { getAuth, requireAuth } from "../middleware/require-auth.js";
import { strictLimiter } from "../middleware/rate-limit.js";

export const paymentRouter = Router();

const orderSchema = z.object({ courseId: z.string().min(1) });
paymentRouter.post("/payment/order", requireAuth, strictLimiter(), async (req, res, next) => {
  try {
    const { courseId } = orderSchema.parse(req.body);
    const { userId } = getAuth(req);
    const order = await paymentService.createOrder(userId, courseId);
    sendOk(res, order, 201);
  } catch (err) {
    next(err);
  }
});
