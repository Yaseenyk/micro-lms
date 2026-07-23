/**
 * CourseSales — Presentation (docs/01 §1.1). The "no access yet" state: a real
 * sales layout (hero, outcomes, curriculum preview, sticky purchase panel) with
 * the checkout wired to entitlement-confirmation polling.
 */
"use client";

import { CheckoutButton } from "@/features/payment/ui/CheckoutButton";
import { getCourseMeta } from "../catalog";
import { Card, Alert } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { SectionLabel } from "@/components/SectionLabel";
import { PulseDot } from "@/components/PulseDot";

// Vite/Next inline this at build time: "development" under `npm run dev`,
// "production" in the exported build — so the bypass never ships to prod.
const DEV = process.env.NODE_ENV !== "production";

export function CourseSales({
  courseId,
  confirming,
  confirmTimedOut,
  onEntitled,
  onDevUnlock,
}: {
  courseId: string;
  confirming: boolean;
  confirmTimedOut: boolean;
  onEntitled: () => void | Promise<void>;
  onDevUnlock: () => void | Promise<void>;
}) {
  const meta = getCourseMeta(courseId);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      {/* Left: pitch */}
      <div>
        <SectionLabel index="01" title="Course" />
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-50 sm:text-5xl">
          {meta.title.split(" ").slice(0, -1).join(" ")}{" "}
          <GradientText>{meta.title.split(" ").slice(-1)}</GradientText>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-400">{meta.blurb}</p>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            What you&apos;ll be able to do
          </h2>
          <ul className="mt-4 space-y-3">
            {meta.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan/15 text-cyan">
                  ✓
                </span>
                {o}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Curriculum</h2>
          <ol className="mt-4 divide-y divide-zinc-900 overflow-hidden rounded-2xl border border-zinc-800">
            {meta.lessons.map((l, i) => (
              <li key={l.id} className="flex items-center justify-between gap-4 bg-white/[0.01] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-zinc-800 text-xs text-zinc-500">
                    {i + 1}
                  </span>
                  <span className="text-sm text-zinc-200">{l.title}</span>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-zinc-600">{l.minutes}m</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Right: sticky purchase panel */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <Card>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-semibold text-zinc-50">{meta.priceLabel}</div>
              <div className="mt-1 text-xs text-zinc-500">one-time · lifetime access</div>
            </div>
            <span className="rounded-full border border-zinc-800 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
              {meta.hours}
            </span>
          </div>

          <div className="mt-6">
            {confirming ? (
              <div className="flex items-center gap-3 rounded-lg border border-cyan/25 bg-cyan/[0.06] px-4 py-3 text-sm text-ice">
                <PulseDot color="bg-cyan" />
                Confirming your payment… this takes a few seconds.
              </div>
            ) : (
              <CheckoutButton
                courseId={courseId}
                priceLabel={meta.priceLabel}
                onEntitled={onEntitled}
              />
            )}
          </div>

          {confirmTimedOut && (
            <div className="mt-3">
              <Alert tone="info">
                Payment received — access is taking a moment to sync. It&apos;ll unlock
                automatically; refresh if it doesn&apos;t appear shortly.
              </Alert>
            </div>
          )}

          {DEV && !confirming && (
            <button
              onClick={() => void onDevUnlock()}
              className="mt-3 w-full rounded-lg border border-dashed border-amber-500/40 bg-amber-500/[0.04] px-4 py-2.5 text-xs font-medium text-amber-300/90 transition-colors hover:bg-amber-500/[0.08]"
            >
              ⚡ Dev only · skip payment &amp; unlock
            </button>
          )}

          <ul className="mt-6 space-y-2 text-xs text-zinc-500">
            <li>· {meta.lessons.length} lessons, self-paced</li>
            <li>· Progress synced across devices</li>
            <li>· Secure payments via Razorpay</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
