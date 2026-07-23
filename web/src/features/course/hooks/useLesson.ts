/**
 * useLesson — Logic layer (docs/01 §1.2). Fetches a single lesson's content when
 * the active lesson changes, exposing a small phase machine to Presentation. A
 * tiny cache avoids re-fetching lessons already loaded this session.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { courseService } from "../services/course.service";
import type { LessonContent } from "../content.types";
import { ApiError } from "@/lib/api-client";

type Phase = "loading" | "ready" | "error";

export function useLesson(courseId: string, lessonId: string) {
  const cache = useRef<Map<string, LessonContent>>(new Map());
  const [phase, setPhase] = useState<Phase>("loading");
  const [content, setContent] = useState<LessonContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const key = `${courseId}/${lessonId}`;
    const cached = cache.current.get(key);
    if (cached) {
      setContent(cached);
      setPhase("ready");
      return;
    }
    setPhase("loading");
    setError(null);
    courseService
      .getLesson(courseId, lessonId)
      .then((c) => {
        if (cancelled) return;
        cache.current.set(key, c);
        setContent(c);
        setPhase("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load this lesson.");
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  return { phase, content, error };
}
