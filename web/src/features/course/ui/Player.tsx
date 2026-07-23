/**
 * Player — Presentation (docs/01 §1.1). The "has access" state: a lesson rail +
 * the lesson's textual/SVG content (fetched from the DB via useLesson). No video.
 * Local UI state only (which lesson is active); persistence goes through the
 * saveProgress callback from useCourse. Resumes at the first incomplete lesson.
 */
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { getCourseMeta } from "../catalog";
import { useLesson } from "../hooks/useLesson";
import { LessonContent } from "./LessonContent";
import type { CourseProgress, ProgressUpdate } from "@/lib/adapters/course-progress.adapter";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

function isDone(progress: CourseProgress | null, lessonId: string): boolean {
  return progress?.lessons.find((l) => l.lessonId === lessonId)?.completed ?? false;
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ContentSkeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-4">
      <div className="h-4 w-3/4 rounded bg-zinc-800" />
      <div className="h-4 w-full rounded bg-zinc-900" />
      <div className="h-4 w-5/6 rounded bg-zinc-900" />
      <div className="mt-6 h-40 w-full rounded-2xl bg-zinc-900" />
      <div className="h-4 w-2/3 rounded bg-zinc-900" />
    </div>
  );
}

export function Player({
  courseId,
  progress,
  onSave,
}: {
  courseId: string;
  progress: CourseProgress | null;
  onSave: (u: ProgressUpdate) => void | Promise<void>;
}) {
  const meta = getCourseMeta(courseId);
  const lessons = meta.lessons;

  const resumeIndex = useMemo(() => {
    const idx = lessons.findIndex((l) => !isDone(progress, l.id));
    return idx === -1 ? 0 : idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // resume target computed once on mount
  const [activeIndex, setActiveIndex] = useState(resumeIndex);

  const active = lessons[activeIndex]!;
  const activeDone = isDone(progress, active.id);
  const percent = progress?.progressPercent ?? 0;
  const completedCount = progress?.lessons.filter((l) => l.completed).length ?? 0;
  const prev = activeIndex > 0 ? lessons[activeIndex - 1]! : null;
  const next = activeIndex < lessons.length - 1 ? lessons[activeIndex + 1]! : null;

  const { phase, content, error } = useLesson(courseId, active.id);

  function toggleComplete() {
    void onSave({
      courseId,
      lessonId: active.id,
      completed: !activeDone,
      lastPositionSec: active.minutes * 60,
      watchedSec: active.minutes * 60,
    });
  }

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-zinc-500 transition-colors hover:text-zinc-300">
            Dashboard
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-200">{meta.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            {completedCount}/{lessons.length} complete
          </span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-purple transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-cyan">{percent}%</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Rail */}
        <aside className="order-2 lg:order-1 lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-white/[0.02]">
            <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3.5">
              <h2 className="text-sm font-semibold text-zinc-100">Lessons</h2>
              <span className="rounded-full border border-zinc-800 bg-white/[0.03] px-2.5 py-0.5 text-xs text-zinc-400">
                {lessons.length}
              </span>
            </div>
            <ol className="scrollbar-thin max-h-[64vh] space-y-0.5 overflow-y-auto p-2">
              {lessons.map((l, i) => {
                const done = isDone(progress, l.id);
                const isActive = i === activeIndex;
                return (
                  <li key={l.id}>
                    <button
                      onClick={() => setActiveIndex(i)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        isActive ? "bg-cyan/[0.07]" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="rail-active"
                          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-gradient-to-b from-cyan to-purple"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-medium transition-colors ${
                          done
                            ? "bg-cyan text-ink"
                            : isActive
                              ? "border border-cyan/60 text-cyan"
                              : "border border-zinc-800 text-zinc-500 group-hover:border-zinc-700"
                        }`}
                      >
                        {done ? <CheckIcon /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm transition-colors ${
                            isActive ? "text-zinc-50" : "text-zinc-300 group-hover:text-zinc-100"
                          }`}
                        >
                          {l.title}
                        </span>
                        <span className="text-xs text-zinc-600">{l.minutes} min read</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Article */}
        <section className="order-1 min-w-0 lg:order-2">
          {/* Lesson header */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-900 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                <span className="tabular-nums text-cyan">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-zinc-700">/</span>
                <span>{String(lessons.length).padStart(2, "0")}</span>
                <span className="text-zinc-700">·</span>
                <span>{active.minutes} min read</span>
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
                {active.title}
              </h1>
            </div>
            <button
              onClick={toggleComplete}
              className={
                activeDone
                  ? "inline-flex items-center gap-2 rounded-lg border border-cyan/40 bg-cyan/10 px-5 py-2.5 text-sm font-semibold text-cyan transition-colors hover:bg-cyan/15"
                  : "inline-flex items-center gap-2 rounded-lg bg-cyan px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_0_24px_-4px_rgba(34,211,238,0.6)] transition-all hover:shadow-[0_0_30px_-2px_rgba(34,211,238,0.7)] active:scale-[0.98]"
              }
            >
              {activeDone ? (
                <>
                  <CheckIcon /> Completed
                </>
              ) : (
                "Mark complete"
              )}
            </button>
          </div>

          {/* Lesson body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {phase === "loading" && <ContentSkeleton />}
              {phase === "error" && (
                <p className="mt-8 rounded-lg border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200">
                  {error ?? "Could not load this lesson."}
                </p>
              )}
              {phase === "ready" && content && <LessonContent blocks={content.blocks} />}
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next */}
          <div className="mt-10 grid grid-cols-2 gap-3 border-t border-zinc-900 pt-6">
            <button
              disabled={!prev}
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-white/[0.02] px-4 py-3 text-left transition-colors enabled:hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="text-zinc-500 transition-colors group-enabled:group-hover:text-cyan">←</span>
              <span className="min-w-0">
                <span className="block text-xs text-zinc-600">Previous</span>
                <span className="block truncate text-sm text-zinc-300">
                  {prev ? prev.title : "You're at the start"}
                </span>
              </span>
            </button>
            <button
              disabled={!next}
              onClick={() => setActiveIndex((i) => Math.min(lessons.length - 1, i + 1))}
              className="group flex items-center justify-end gap-3 rounded-xl border border-zinc-800 bg-white/[0.02] px-4 py-3 text-right transition-colors enabled:hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="min-w-0">
                <span className="block text-xs text-zinc-600">Next</span>
                <span className="block truncate text-sm text-zinc-300">
                  {next ? next.title : "Course complete"}
                </span>
              </span>
              <span className="text-zinc-500 transition-colors group-enabled:group-hover:text-cyan">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
