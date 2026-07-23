/**
 * useCheckout — Logic layer (docs/01 §1.2). Orchestrates the purchase flow:
 * create a server-priced order, open Razorpay Checkout, and — crucially — treat
 * the success callback as a *UI signal only*. Entitlement is granted by the
 * verified webhook (docs/04 §9), never here. On the client "success" we simply
 * re-check access with the API until the webhook has landed.
 */
"use client";

import { useCallback, useState } from "react";
import { paymentService } from "../services/payment.service";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";

// Minimal shape of the Razorpay Checkout global loaded via CDN script.
interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: unknown) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
}
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useCheckout(courseId: string, onEntitled: () => void | Promise<void>) {
  const user = useAuthStore((s) => s.user);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) throw new Error("Could not load the payment window.");

      const order = await paymentService.createOrder(courseId);

      const rzp = new window.Razorpay({
        key: order.razorpayKeyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Micro-LMS",
        description: courseId,
        ...(user ? { prefill: { name: user.name, email: user.email } } : {}),
        theme: { color: "#22D3EE" },
        handler: () => {
          // UI signal only — the webhook is the source of truth. Re-poll access.
          void onEntitled();
        },
        modal: { ondismiss: () => setPending(false) },
      });
      rzp.open();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Payment could not be started.",
      );
    } finally {
      setPending(false);
    }
  }, [courseId, user, onEntitled]);

  return { start, pending, error };
}
