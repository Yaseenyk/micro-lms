/**
 * Dashboard — authenticated home (Presentation). Guarded client-side by
 * useRequireAuth. Shows the catalog with per-course progress + an account strip.
 */
"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import { CourseSummaryCard } from "@/features/course/ui/CourseSummaryCard";
import { getAllCourses } from "@/features/course/catalog";
import { Container } from "@/components/ui";
import { GradientText } from "@/components/GradientText";
import { PageSplash } from "@/components/PageSplash";

export default function DashboardPage() {
  const gate = useRequireAuth("/dashboard");
  const user = useAuthStore((s) => s.user);
  const courses = getAllCourses();

  if (gate !== "authenticated") {
    return <PageSplash label={gate === "redirecting" ? "Redirecting to sign in…" : "Loading your dashboard…"} />;
  }

  return (
    <Container className="py-6 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Your dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Welcome back, <GradientText>{user?.name ?? "learner"}</GradientText>.
          </h1>
          <p className="mt-3 max-w-xl text-zinc-400">
            Continue any course below — progress saves as you go and resumes on any device.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-white/[0.02] px-5 py-4 text-sm">
          <div className="text-zinc-200">{user?.name}</div>
          <div className="mt-0.5 text-xs text-zinc-500">{user?.email}</div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs capitalize text-zinc-400">
            {user?.role} plan
          </div>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          All courses
        </h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {courses.map((c) => (
            <CourseSummaryCard key={c.id} courseId={c.id} />
          ))}
        </div>
      </section>
    </Container>
  );
}
