/**
 * CoursePlayer — Presentation (docs/01 §1.1). Orchestrates the course states
 * from useCourse + the auth store:
 *   not signed in → sales pitch (sign-in CTA) · signed in, no access → sales
 *   (checkout) · access → player.
 * It calls hook methods only; no fetch, adapter, or token here.
 */
"use client";

import { useCourse } from "../hooks/useCourse";
import { CourseSales } from "./CourseSales";
import { Player } from "./Player";
import { useAuthStore } from "@/stores/auth.store";
import { Card, Button, Alert } from "@/components/ui";
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

  // Session still resolving.
  if (status === "loading") return <PageSplash label="Loading course…" />;

  // Signed out → show the full course pitch with sign-in CTAs (not a dead-end box).
  if (status === "anonymous") {
    return <CourseSales courseId={courseId} authed={false} />;
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
        authed
        confirming={confirming}
        confirmTimedOut={confirmTimedOut}
        onEntitled={confirmEntitlement}
        onDevUnlock={devUnlock}
      />
    );
  }

  return <Player courseId={courseId} progress={progress} onSave={saveProgress} />;
}
