/**
 * CourseSales — Presentation (docs/01 §1.1). The course overview shown to
 * visitors who cannot read it yet. The platform runs free (docs/04 §0a), so the
 * only thing between a reader and the lessons is an account: the panel invites
 * them to create one rather than to pay.
 */
"use client";

import { getCourseMeta } from "../catalog";
import { Card, ButtonLink } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { SectionLabel } from "@/components/SectionLabel";
import { PulseDot } from "@/components/PulseDot";
import { CheckIcon } from "@/components/Icons";

export function CourseSales({ courseId, authed }: { courseId: string; authed: boolean }) {
  const meta = getCourseMeta(courseId);
  const nextParam = `?next=/course/${courseId}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      {/* Left: what the course is */}
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-1.5 text-xs font-medium text-emerald-300">
          <PulseDot color="bg-emerald-400" />
          Free · text-first · read at your pace
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

      {/* Right: sticky panel */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <Card>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-semibold text-zinc-50">Free</div>
              <div className="mt-1 text-xs text-zinc-500">every lesson, no payment</div>
            </div>
            <span className="rounded-full border border-zinc-800 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
              {meta.hours}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {!authed ? (
              <>
                <ButtonLink href={`/register${nextParam}`} className="w-full">
                  Create free account
                </ButtonLink>
                <ButtonLink href={`/login${nextParam}`} variant="ghost" className="w-full">
                  I already have an account
                </ButtonLink>
                <p className="pt-1 text-center text-xs text-zinc-500">
                  An account only saves your progress
                </p>
              </>
            ) : (
              <ButtonLink href={`/course/${courseId}`} className="w-full">
                Start reading
              </ButtonLink>
            )}
          </div>

          <ul className="mt-6 space-y-2 text-xs text-zinc-500">
            <li className="flex items-center gap-2">
              <CheckIcon width={13} height={13} className="text-cyan" /> {meta.lessons.length} lessons, self-paced
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon width={13} height={13} className="text-cyan" /> Detailed writing + diagrams
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon width={13} height={13} className="text-cyan" /> Progress synced across devices
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
