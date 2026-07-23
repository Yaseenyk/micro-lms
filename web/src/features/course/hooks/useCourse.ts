/**
 * useCourse — Logic layer (docs/01 §1.2). Owns the runtime course state: the
 * access decision, resume progress, and the orchestration of a progress save
 * (optimistic-ish: it trusts the server's re-derived progress as truth). It is
 * the source of truth the player UI renders from.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { courseService } from "../services/course.service";
import type { CourseProgress, ProgressUpdate } from "@/lib/adapters/course-progress.adapter";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";

type Phase = "loading" | "ready" | "error";

export function useCourse(courseId: string) {
  const status = useAuthStore((s) => s.status);
  const [phase, setPhase] = useState<Phase>("loading");
  const [access, setAccess] = useState(false);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPhase("loading");
    setError(null);
    try {
      const result = await courseService.getAccess(courseId);
      setAccess(result.access);
      setProgress(result.progress);
      setPhase("ready");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load this course.");
      setPhase("error");
    }
  }, [courseId]);

  useEffect(() => {
    // Only attempt the protected access call once we hold a session; otherwise
    // the page shows the sign-in prompt without a doomed 401 round-trip.
    if (status === "authenticated") void load();
    else setPhase("ready");
  }, [status, load]);

  const saveProgress = useCallback(
    async (update: ProgressUpdate) => {
      const next = await courseService.saveProgress(update);
      if (next) setProgress(next);
    },
    [],
  );

  return { phase, access, progress, error, reload: load, saveProgress };
}
