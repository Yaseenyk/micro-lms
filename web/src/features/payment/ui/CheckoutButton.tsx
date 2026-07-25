/**
 * CheckoutButton — Presentation (docs/01 §1.1). A thin trigger over useCheckout.
 * The parent passes `onEntitled` (which polls access until the webhook lands);
 * this component only opens Checkout and surfaces errors.
 */
"use client";

import { useCheckout } from "../hooks/useCheckout";
import { Alert, Button, Spinner } from "@/components/ui";

export function CheckoutButton({
  courseId,
  courseTitle,
  priceLabel,
  onEntitled,
}: {
  courseId: string;
  courseTitle: string;
  priceLabel: string;
  onEntitled: () => void | Promise<void>;
}) {
  const { start, pending, error } = useCheckout(courseId, courseTitle, onEntitled);
  return (
    <div className="space-y-3">
      <Button onClick={() => void start()} disabled={pending} className="w-full">
        {pending ? (
          <>
            <Spinner /> Opening secure checkout…
          </>
        ) : (
          `Get lifetime access · ${priceLabel}`
        )}
      </Button>
      {error && <Alert>{error}</Alert>}
    </div>
  );
}
