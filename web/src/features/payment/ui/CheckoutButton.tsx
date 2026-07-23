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
  priceLabel,
  onEntitled,
  disabled,
}: {
  courseId: string;
  priceLabel: string;
  onEntitled: () => void | Promise<void>;
  disabled?: boolean;
}) {
  const { start, pending, error } = useCheckout(courseId, onEntitled);
  return (
    <div className="space-y-3">
      <Button onClick={() => void start()} disabled={pending || disabled} className="w-full">
        {pending ? (
          <>
            <Spinner /> Opening secure checkout…
          </>
        ) : (
          `Unlock course · ${priceLabel}`
        )}
      </Button>
      {error && <Alert>{error}</Alert>}
    </div>
  );
}
