/**
 * CourseSummaryCard — Presentation (docs/01 §1.1). A compact course tile for the
 * dashboard: reads useCourse for the access decision + progress and renders
 * either a "continue" state with a progress bar or an "unlock" upsell.
 */
"use client";

import { useCourse } from "../hooks/useCourse";
import { getCourseMeta } from "../catalog";
import { Card, ButtonLink } from "@/components/ui";

export function CourseSummaryCard({ courseId }: { courseId: string }) {
  const meta = getCourseMeta(courseId);
  const { phase, access, progress } = useCourse(courseId);

  const percent = progress?.progressPercent ?? 0;
  const completed = progress?.lessons.filter((l) => l.completed).length ?? 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-purple/10 blur-3xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-zinc-50">{meta.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{meta.tagline}</p>
        </div>
        <span className="shrink-0 rounded-full border border-zinc-800 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
          {meta.lessons.length} lessons
        </span>
      </div>

      {phase === "loading" ? (
        <div className="mt-6 h-2 w-full animate-pulse rounded-full bg-zinc-800" />
      ) : access ? (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>
              {completed} of {meta.lessons.length} lessons complete
            </span>
            <span className="text-cyan">{percent}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-purple transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <ButtonLink href={`/course/${courseId}`} className="mt-6">
            {percent > 0 ? "Continue learning" : "Start course"}
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm text-zinc-400">
            You don&apos;t own this course yet. Unlock lifetime access for {meta.priceLabel}.
          </p>
          <ButtonLink href={`/course/${courseId}`} className="mt-5">
            Unlock course
          </ButtonLink>
        </div>
      )}
    </Card>
  );
}
