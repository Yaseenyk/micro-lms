/**
 * CoursePlayer — Presentation (docs/01 §1.1). Orchestrates the course states
 * from useCourse + the auth store:
 *   not signed in → gate · signed in, no access → sales · access → player.
 * It calls hook methods only; no fetch, adapter, or token here.
 */
"use client";

import { useCourse } from "../hooks/useCourse";
import { getCourseMeta } from "../catalog";
import { CourseSales } from "./CourseSales";
import { Player } from "./Player";
import { useAuthStore } from "@/stores/auth.store";
import { Card, Button, ButtonLink, Alert } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { PageSplash } from "@/components/PageSplash";

export function CoursePlayer({ courseId }: { courseId: string }) {
  const status = useAuthStore((s) => s.status);
  const {
    phase,
    access,
    progress,
    error,
    confirming,
    confirmTimedOut,
    reload,
    saveProgress,
    confirmEntitlement,
    devUnlock,
  } = useCourse(courseId);
  const meta = getCourseMeta(courseId);

  // Session still resolving.
  if (status === "loading") return <PageSplash label="Loading course…" />;

  // Signed out → gate.
  if (status === "anonymous") {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Sign in to open <GradientText>{meta.title}</GradientText>
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            You need an account to check access and track your progress.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`/login?next=/course/${courseId}`} className="flex-1">
              Log in
            </ButtonLink>
            <ButtonLink href={`/register?next=/course/${courseId}`} variant="ghost" className="flex-1">
              Create account
            </ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  if (phase === "loading") return <PageSplash label="Checking your access…" />;

  if (phase === "error") {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <Alert>{error ?? "Something went wrong."}</Alert>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => void reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!access) {
    return (
      <CourseSales
        courseId={courseId}
        confirming={confirming}
        confirmTimedOut={confirmTimedOut}
        onEntitled={confirmEntitlement}
        onDevUnlock={devUnlock}
      />
    );
  }

  return <Player courseId={courseId} progress={progress} onSave={saveProgress} />;
}
