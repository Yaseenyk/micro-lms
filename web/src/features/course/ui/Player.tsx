/**
 * Player — Presentation (docs/01 §1.1). The "has access" state: a lesson rail +
 * a lesson stage designed to feel like a real course player. Local UI state only
 * (which lesson is active); all persistence goes through the saveProgress
 * callback from useCourse. Resumes at the first incomplete lesson.
 */
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { getCourseMeta } from "../catalog";
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
                        <span className="text-xs text-zinc-600">{l.minutes} min</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Stage */}
        <section className="order-1 lg:order-2">
          {/* Video surface */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-800 bg-ink">
            {/* layered ambience */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-ink to-zinc-950" />
            <div className="absolute inset-0 bg-dotgrid opacity-40" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(38rem_18rem_at_50%_-10%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(30rem_16rem_at_90%_120%,rgba(168,85,247,0.12),transparent_60%)]" />

            {/* chapter tag */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300 backdrop-blur-sm">
              <span className="tabular-nums text-cyan">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-zinc-600">/</span>
              <span>{String(lessons.length).padStart(2, "0")}</span>
            </div>
            {activeDone && (
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs font-medium text-cyan backdrop-blur-sm">
                <CheckIcon /> Completed
              </div>
            )}

            {/* play button */}
            <AnimatePresence mode="wait">
              <motion.button
                key={active.id}
                onClick={toggleComplete}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute inset-0 z-10 grid place-items-center"
                aria-label="Play lesson"
              >
                <span className="relative grid h-20 w-20 place-items-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan/20" />
                  <span className="relative grid h-20 w-20 place-items-center rounded-full border border-cyan/40 bg-cyan/15 text-cyan shadow-[0_0_40px_-8px_rgba(34,211,238,0.6)] backdrop-blur-sm transition-transform duration-200 hover:scale-105">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </motion.button>
            </AnimatePresence>

            {/* faux control bar */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3.5 pt-10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-200" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-0 rounded-full bg-cyan" />
              </div>
              <span className="text-xs tabular-nums text-zinc-300">
                0:00 / {active.minutes}:00
              </span>
            </div>
          </div>

          {/* Lesson meta */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Lesson {activeIndex + 1}
                  </p>
                  <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                    {active.title}
                  </h1>
                  <p className="mt-1.5 text-sm text-zinc-500">{active.minutes} minutes · self-paced</p>
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

              <p className="mt-5 max-w-2xl leading-relaxed text-zinc-400">
                This is where the lesson video and notes would render. Progress you record here is
                persisted through the API as a lean payload and re-derived on the server, so your
                completion and resume point stay in sync across devices.
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next */}
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-zinc-900 pt-6">
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
