/**
 * CheckoutButton — Presentation (docs/01 §1.1). A thin trigger over the
 * useCheckout hook. It renders a price and a button; all payment orchestration
 * lives in the hook.
 */
"use client";

import { useCheckout } from "../hooks/useCheckout";
import { Alert, Button } from "@/components/ui";

export function CheckoutButton({
  courseId,
  priceLabel,
  onEntitled,
}: {
  courseId: string;
  priceLabel: string;
  onEntitled: () => void | Promise<void>;
}) {
  const { start, pending, error } = useCheckout(courseId, onEntitled);
  return (
    <div className="space-y-3">
      <Button onClick={() => void start()} disabled={pending}>
        {pending ? "Opening…" : `Buy this course · ${priceLabel}`}
      </Button>
      {error && <Alert>{error}</Alert>}
    </div>
  );
}
