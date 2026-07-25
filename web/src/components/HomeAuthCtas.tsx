/**
 * Auth-aware home CTAs (Presentation). The landing page is static marketing, but
 * a signed-in visitor should not be pitched to "start for free" / sign up — these
 * client components read the auth store and swap the hero + final-CTA actions to
 * a "welcome back → dashboard" flow. During bootstrap ("loading") they show the
 * anonymous copy, the safe default for the majority (and for the prerendered SEO
 * markup).
 */
"use client";

import { useAuthStore } from "@/stores/auth.store";
import { ButtonLink } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { ArrowRightIcon } from "@/components/Icons";

export function HeroActions({ starterId }: { starterId: string }) {
  const authed = useAuthStore((s) => s.status) === "authenticated";
  return (
    <div className="mt-9 flex flex-wrap items-center gap-4">
      {authed ? (
        <>
          <ButtonLink href="/dashboard">
            Go to your dashboard
            <ArrowRightIcon width={16} height={16} />
          </ButtonLink>
          <ButtonLink href="/courses" variant="ghost">
            Browse all courses
          </ButtonLink>
        </>
      ) : (
        <>
          <ButtonLink href={`/course/${starterId}`}>
            Start the complete course
            <ArrowRightIcon width={16} height={16} />
          </ButtonLink>
          <ButtonLink href="/courses" variant="ghost">
            Browse all 10 courses
          </ButtonLink>
        </>
      )}
    </div>
  );
}

export function FinalCta({
  starterId,
  starterTitle,
  courseCount,
}: {
  starterId: string;
  starterTitle: string;
  courseCount: number;
}) {
  const authed = useAuthStore((s) => s.status) === "authenticated";
  return (
    <div className="relative">
      <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        {authed ? (
          <>
            Pick up where you <GradientText>left off</GradientText>.
          </>
        ) : (
          <>
            Every course, <GradientText>free</GradientText>.
          </>
        )}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-zinc-400">
        {authed
          ? "Your progress is saved and synced across devices. Jump back into any course, or explore something new."
          : "No paywall, no trial, no card. Create an account so your progress saves, then read anything in the catalog."}
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        {authed ? (
          <ButtonLink href="/dashboard">
            Go to your dashboard
            <ArrowRightIcon width={16} height={16} />
          </ButtonLink>
        ) : (
          <ButtonLink href={`/course/${starterId}`}>
            Start with {starterTitle}
            <ArrowRightIcon width={16} height={16} />
          </ButtonLink>
        )}
        <ButtonLink href="/courses" variant="ghost">
          Browse all {courseCount} courses
        </ButtonLink>
      </div>
    </div>
  );
}
