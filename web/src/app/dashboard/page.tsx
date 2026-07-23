/**
 * Dashboard — authenticated home (Presentation). Guarded client-side by
 * useRequireAuth: while the session resolves it splashes, and an anonymous
 * visitor is redirected to /login?next=/dashboard.
 */
"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import { CourseSummaryCard } from "@/features/course/ui/CourseSummaryCard";
import { Container } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { PageSplash } from "@/components/PageSplash";

export default function DashboardPage() {
  const gate = useRequireAuth("/dashboard");
  const user = useAuthStore((s) => s.user);

  if (gate !== "authenticated") {
    return <PageSplash label={gate === "redirecting" ? "Redirecting to sign in…" : "Loading your dashboard…"} />;
  }

  return (
    <Container className="py-6 sm:py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Your dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Welcome back, <GradientText>{user?.name ?? "learner"}</GradientText>.
        </h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Pick up your course below. Progress is saved as you go and resumes on any device.
        </p>
      </header>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <CourseSummaryCard courseId="course_abc" />

        <div className="rounded-2xl border border-zinc-800 bg-white/[0.02] p-6">
          <h2 className="text-sm font-semibold text-zinc-200">Account</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Name</dt>
              <dd className="text-zinc-200">{user?.name}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Email</dt>
              <dd className="text-zinc-200">{user?.email}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-zinc-500">Plan</dt>
              <dd className="capitalize text-zinc-200">{user?.role}</dd>
            </div>
          </dl>
        </div>
      </section>
    </Container>
  );
}
