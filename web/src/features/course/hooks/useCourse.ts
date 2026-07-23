/**
 * useCourse — Logic layer (docs/01 §1.2). Owns the runtime course state: the
 * access decision, resume progress, saving progress, and confirming entitlement
 * after checkout.
 *
 * Entitlement is granted by the verified webhook (docs/04 §9), not the client's
 * Razorpay success callback — so after checkout we *poll* /course/access until
 * access flips true (or we give up), rather than trusting the callback.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { courseService } from "../services/course.service";
import type { CourseProgress, ProgressUpdate } from "@/lib/adapters/course-progress.adapter";
import { ApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth.store";

type Phase = "loading" | "ready" | "error";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const CONFIRM_ATTEMPTS = 8;
const CONFIRM_INTERVAL_MS = 2500;

export function useCourse(courseId: string) {
  const status = useAuthStore((s) => s.status);
  const [phase, setPhase] = useState<Phase>("loading");
  const [access, setAccess] = useState(false);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmTimedOut, setConfirmTimedOut] = useState(false);

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

  /** Poll access after a checkout success until the webhook grants entitlement. */
  const confirmEntitlement = useCallback(async () => {
    setConfirming(true);
    setConfirmTimedOut(false);
    try {
      for (let attempt = 0; attempt < CONFIRM_ATTEMPTS; attempt += 1) {
        const result = await courseService.getAccess(courseId).catch(() => null);
        if (result?.access) {
          setAccess(true);
          setProgress(result.progress);
          setConfirming(false);
          return;
        }
        await delay(CONFIRM_INTERVAL_MS);
      }
      setConfirmTimedOut(true);
    } finally {
      setConfirming(false);
    }
  }, [courseId]);

  return {
    phase,
    access,
    progress,
    error,
    confirming,
    confirmTimedOut,
    reload: load,
    saveProgress,
    confirmEntitlement,
  };
}
