/**
 * CoursePlayer — Presentation (docs/01 §1.1). Renders one of three states from
 * the useCourse hook: not-signed-in, no-access (with checkout), or the player
 * with a lesson list + resume state. It calls hook methods only; no fetch, no
 * adapter, no token here.
 */
"use client";

import { useMemo } from "react";
import { useCourse } from "../hooks/useCourse";
import { CheckoutButton } from "@/features/payment/ui/CheckoutButton";
import { useAuthStore } from "@/stores/auth.store";
import { Alert, Button, Card } from "@/components/ui";
import type { LessonProgress } from "@/lib/adapters/course-progress.adapter";

// The catalog course used by the demo (mirrors the API catalog: 12 lessons).
const TOTAL_LESSONS = 12;
const LESSON_IDS = Array.from({ length: TOTAL_LESSONS }, (_, i) => `les_${i + 1}`);
const PRICE_LABEL = "₹499";

function lessonState(progress: LessonProgress[] | undefined, id: string): LessonProgress {
  return progress?.find((l) => l.lessonId === id) ?? { lessonId: id, completed: false, lastPositionSec: 0 };
}

export function CoursePlayer({ courseId }: { courseId: string }) {
  const status = useAuthStore((s) => s.status);
  const { phase, access, progress, error, reload, saveProgress } = useCourse(courseId);

  const lessons = useMemo(() => progress?.lessons ?? [], [progress]);

  if (status !== "authenticated") {
    return (
      <Card>
        <h1 className="text-xl font-bold text-slate-100">Sign in to open this course</h1>
        <p className="mt-1 text-sm text-slate-400">
          You need an account to check access and track progress.
        </p>
        <div className="mt-4 flex gap-3">
          <a href="/login/"><Button>Log in</Button></a>
          <a href="/register/"><Button variant="ghost">Create account</Button></a>
        </div>
      </Card>
    );
  }

  if (phase === "loading") {
    return <Card><p className="text-sm text-slate-400">Loading course…</p></Card>;
  }

  if (phase === "error") {
    return (
      <Card>
        <Alert>{error ?? "Something went wrong."}</Alert>
        <div className="mt-4"><Button variant="ghost" onClick={() => void reload()}>Retry</Button></div>
      </Card>
    );
  }

  if (!access) {
    return (
      <Card>
        <h1 className="text-xl font-bold text-slate-100">Full-Stack Foundations</h1>
        <p className="mt-1 text-sm text-slate-400">
          {TOTAL_LESSONS} lessons · lifetime access. You don’t own this course yet.
        </p>
        <div className="mt-5">
          <CheckoutButton courseId={courseId} priceLabel={PRICE_LABEL} onEntitled={reload} />
          <p className="mt-3 text-xs text-slate-500">
            Access is granted by our verified payment webhook — it may take a few seconds after
            paying. Hit retry if it isn’t instant.
          </p>
        </div>
      </Card>
    );
  }

  const percent = progress?.progressPercent ?? 0;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Full-Stack Foundations</h1>
        <span className="text-sm text-cyan">{percent}% complete</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-cyan transition-all" style={{ width: `${percent}%` }} />
      </div>

      <ul className="mt-5 divide-y divide-line/70">
        {LESSON_IDS.map((id, i) => {
          const st = lessonState(lessons, id);
          return (
            <li key={id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                    st.completed ? "bg-cyan text-ink" : "border border-line text-slate-400"
                  }`}
                >
                  {st.completed ? "✓" : i + 1}
                </span>
                <span className="text-sm text-slate-200">Lesson {i + 1}</span>
              </div>
              <Button
                variant="ghost"
                onClick={() =>
                  void saveProgress({
                    courseId,
                    lessonId: id,
                    completed: !st.completed,
                    lastPositionSec: st.lastPositionSec,
                    watchedSec: st.lastPositionSec,
                  })
                }
              >
                {st.completed ? "Mark incomplete" : "Mark complete"}
              </Button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
