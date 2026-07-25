/**
 * CourseSales — Presentation (docs/01 §1.1). The course overview shown to
 * visitors who cannot read a course yet. Four states from two axes — the
 * course's price (free vs paid) and the viewer (anonymous vs signed-in):
 *
 *   free  + anyone      → "create a free account" (account only saves progress)
 *   paid  + anonymous   → "sign in to buy" (purchase needs an account)
 *   paid  + signed-in   → Razorpay checkout, with post-pay entitlement polling
 *
 * Entitlement is granted by the verified webhook (docs/04 §9); the checkout
 * success callback only triggers the polling, never access itself.
 */
"use client";

import { CheckoutButton } from "@/features/payment/ui/CheckoutButton";
import { getCourseMeta, isPaidCourse } from "../catalog";
import { Card, Alert, ButtonLink } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { SectionLabel } from "@/components/SectionLabel";
import { PulseDot } from "@/components/PulseDot";
import { CheckIcon } from "@/components/Icons";

// "development" under `npm run dev`, "production" in the exported build — so the
// bypass button never ships to production.
const DEV = process.env.NODE_ENV !== "production";

export function CourseSales({
  courseId,
  authed,
  confirming = false,
  confirmTimedOut = false,
  onEntitled,
  onDevUnlock,
}: {
  courseId: string;
  authed: boolean;
  confirming?: boolean;
  confirmTimedOut?: boolean;
  onEntitled?: () => void | Promise<void>;
  onDevUnlock?: () => void | Promise<void>;
}) {
  const meta = getCourseMeta(courseId);
  const paid = isPaidCourse(meta);
  const nextParam = `?next=/course/${courseId}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      {/* Left: what the course is */}
      <div>
        <div
          className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${
            paid
              ? "border-cyan/30 bg-cyan/[0.06] text-ice"
              : "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300"
          }`}
        >
          <PulseDot color={paid ? "bg-cyan" : "bg-emerald-400"} />
          {paid ? "Complete course · lifetime access" : "Free · text-first · read at your pace"}
        </div>
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
                  <CheckIcon width={12} height={12} />
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

      {/* Right: sticky purchase / access panel */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <Card>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-semibold text-zinc-50">{paid ? meta.priceLabel : "Free"}</div>
              <div className="mt-1 text-xs text-zinc-500">
                {paid ? "one-time · lifetime access" : "every lesson, no payment"}
              </div>
            </div>
            <span className="rounded-full border border-zinc-800 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
              {meta.hours}
            </span>
          </div>

          <div className="mt-6">
            {!paid ? (
              // FREE course: an account only saves progress.
              authed ? (
                <ButtonLink href={`/course/${courseId}`} className="w-full">
                  Start reading
                </ButtonLink>
              ) : (
                <div className="space-y-3">
                  <ButtonLink href={`/register${nextParam}`} className="w-full">
                    Create free account
                  </ButtonLink>
                  <ButtonLink href={`/login${nextParam}`} variant="ghost" className="w-full">
                    I already have an account
                  </ButtonLink>
                  <p className="pt-1 text-center text-xs text-zinc-500">
                    An account only saves your progress
                  </p>
                </div>
              )
            ) : !authed ? (
              // PAID course, anonymous: purchase needs an account.
              <div className="space-y-3">
                <ButtonLink href={`/register${nextParam}`} className="w-full">
                  Sign up to unlock · {meta.priceLabel}
                </ButtonLink>
                <ButtonLink href={`/login${nextParam}`} variant="ghost" className="w-full">
                  I already have an account
                </ButtonLink>
                <p className="pt-1 text-center text-xs text-zinc-500">
                  One-time payment · lifetime access
                </p>
              </div>
            ) : confirming ? (
              <div className="flex items-center gap-3 rounded-lg border border-cyan/25 bg-cyan/[0.06] px-4 py-3 text-sm text-ice">
                <PulseDot color="bg-cyan" />
                Confirming your payment… this takes a few seconds.
              </div>
            ) : (
              // PAID course, signed-in, no entitlement: checkout.
              onEntitled && (
                <CheckoutButton
                  courseId={courseId}
                  courseTitle={meta.title}
                  priceLabel={meta.priceLabel}
                  onEntitled={onEntitled}
                />
              )
            )}
          </div>

          {paid && authed && confirmTimedOut && (
            <div className="mt-3">
              <Alert tone="info">
                Payment received — access is taking a moment to sync. It&apos;ll unlock
                automatically; refresh if it doesn&apos;t appear shortly.
              </Alert>
            </div>
          )}

          {paid && authed && DEV && !confirming && onDevUnlock && (
            <button
              onClick={() => void onDevUnlock()}
              className="mt-3 w-full rounded-lg border border-dashed border-amber-500/40 bg-amber-500/[0.04] px-4 py-2.5 text-xs font-medium text-amber-300/90 transition-colors hover:bg-amber-500/[0.08]"
            >
              ⚡ Dev only · skip payment &amp; unlock
            </button>
          )}

          <ul className="mt-6 space-y-2 text-xs text-zinc-500">
            <li className="flex items-center gap-2">
              <CheckIcon width={13} height={13} className="text-cyan" /> {meta.lessons.length} lessons, self-paced
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon width={13} height={13} className="text-cyan" /> Detailed writing + diagrams
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon width={13} height={13} className="text-cyan" />
              {paid ? " Secure payment via Razorpay" : " Progress synced across devices"}
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
