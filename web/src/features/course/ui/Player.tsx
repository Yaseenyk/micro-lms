/**
 * Player — Presentation (docs/01 §1.1). The "has access" state: a lesson rail +
 * a lesson stage. Local UI state only (which lesson is active); all persistence
 * goes through the saveProgress callback from useCourse. Resumes at the first
 * incomplete lesson.
 */
"use client";

import { useMemo, useState } from "react";
import { getCourseMeta } from "../catalog";
import type { CourseProgress, ProgressUpdate } from "@/lib/adapters/course-progress.adapter";
import { Button } from "@/components/ui";

function isDone(progress: CourseProgress | null, lessonId: string): boolean {
  return progress?.lessons.find((l) => l.lessonId === lessonId)?.completed ?? false;
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

  // Resume at the first incomplete lesson, else the first lesson.
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
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Rail */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-2xl border border-zinc-800 bg-white/[0.02]">
          <div className="border-b border-zinc-900 p-4">
            <h2 className="text-sm font-semibold text-zinc-100">{meta.title}</h2>
            <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
              <span>
                {completedCount}/{lessons.length} done
              </span>
              <span className="text-cyan">{percent}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-purple transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
          <ol className="max-h-[60vh] overflow-y-auto p-2">
            {lessons.map((l, i) => {
              const done = isDone(progress, l.id);
              const isActive = i === activeIndex;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isActive ? "bg-zinc-800/60" : "hover:bg-zinc-800/30"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${
                        done
                          ? "bg-cyan text-ink"
                          : isActive
                            ? "border border-cyan/60 text-cyan"
                            : "border border-zinc-800 text-zinc-500"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm ${isActive ? "text-zinc-100" : "text-zinc-300"}`}
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
      <section>
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-ink to-zinc-900">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,rgba(34,211,238,0.10),transparent_60%)]" />
          <div className="relative flex flex-col items-center gap-3 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full border border-cyan/40 bg-cyan/10 text-cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Lesson {activeIndex + 1} of {lessons.length}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">{active.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">{active.minutes} minutes · self-paced</p>
          </div>
          <Button variant={activeDone ? "ghost" : "primary"} onClick={toggleComplete}>
            {activeDone ? "Mark as incomplete" : "Mark complete"}
          </Button>
        </div>

        <p className="mt-5 max-w-2xl leading-relaxed text-zinc-400">
          This is where the lesson video and notes would render. Progress you record here is
          persisted through the API as a lean payload and re-derived on the server, so your
          completion and resume point stay in sync across devices.
        </p>

        <div className="mt-8 flex items-center justify-between border-t border-zinc-900 pt-6">
          <Button
            variant="ghost"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          >
            ← Previous
          </Button>
          <span className="text-xs text-zinc-600">
            {activeIndex + 1} / {lessons.length}
          </span>
          <Button
            variant="ghost"
            disabled={activeIndex === lessons.length - 1}
            onClick={() => setActiveIndex((i) => Math.min(lessons.length - 1, i + 1))}
          >
            Next →
          </Button>
        </div>
      </section>
    </div>
  );
}
