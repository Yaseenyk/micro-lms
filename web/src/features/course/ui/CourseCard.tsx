/**
 * CourseCard — Presentation (docs/01 §1.1). A browse tile for one course. Pure
 * display from catalog meta; links into the course page.
 */
import Link from "next/link";
import { type CourseMeta, isPaidCourse } from "../catalog";
import { ArrowRightIcon } from "@/components/Icons";

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CourseCard({ course }: { course: CourseMeta }) {
  const paid = isPaidCourse(course);
  return (
    <Link
      href={`/course/${course.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-white/[0.02] p-6 transition-colors hover:border-zinc-700"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan/5 blur-3xl transition-opacity group-hover:bg-cyan/10" />
      <div className="flex items-center justify-between">
        {paid ? (
          <span className="rounded-full border border-cyan/30 bg-cyan/[0.08] px-2.5 py-0.5 text-xs font-semibold text-ice">
            Complete course
          </span>
        ) : (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
            Free
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
            paid ? "border-cyan/25 bg-cyan/[0.06] text-ice" : "border-zinc-800 bg-white/[0.03] text-zinc-400"
          }`}
        >
          {paid && <LockIcon />}
          {course.priceLabel}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug text-zinc-50">{course.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{course.tagline}</p>
      <div className="mt-5 flex items-center justify-between text-xs text-zinc-500">
        <span>
          {course.lessons.length} lessons · {course.hours}
        </span>
        <span className="inline-flex items-center gap-1 text-zinc-400 transition-colors group-hover:text-cyan">
          View
          <ArrowRightIcon width={14} height={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
