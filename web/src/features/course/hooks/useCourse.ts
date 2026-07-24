/**
 * useCourse — Logic layer (docs/01 §1.2). Owns the runtime course state: the
 * access decision, resume progress, and saving progress.
 *
 * The platform currently runs in free-access mode (docs/04 §0a), so any
 * signed-in user is entitled to every catalog course. The access flag is still
 * read from the API rather than assumed, so re-enabling payments needs no
 * change here.
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
    if (status === "authenticated") void load();
    else if (status === "anonymous") setPhase("ready");
    // status "loading" → keep the loading phase until the session resolves
  }, [status, load]);

  const saveProgress = useCallback(async (update: ProgressUpdate) => {
    const next = await courseService.saveProgress(update);
    if (next) setProgress(next);
  }, []);

  return {
    phase,
    access,
    progress,
    error,
    reload: load,
    saveProgress,
  };
}
