/**
 * AuthShell — Presentation. Wraps the auth form in a two-column layout with a
 * narrative brand panel, so login/register have context and craft instead of a
 * cold floating box. The panel collapses on mobile.
 */
import type { ReactNode } from "react";
import { GradientText } from "./GradientText";
import { PulseDot } from "./PulseDot";
import { CheckIcon } from "./Icons";

const POINTS = [
  "Ten text-first courses across the AI stack",
  "Detailed writing and clear diagrams — no video",
  "Progress that saves and resumes anywhere",
];

export function AuthShell({ mode, children }: { mode: "register" | "login"; children: ReactNode }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Narrative panel */}
      <div className="hidden lg:block">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-white/[0.03] px-4 py-1.5 text-xs text-zinc-300">
          <PulseDot color="bg-emerald-400" />
          {mode === "register" ? "Free account · unlock when ready" : "Welcome back"}
        </div>
        <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-50">
          {mode === "register" ? (
            <>
              Start building <GradientText>real</GradientText> full-stack.
            </>
          ) : (
            <>
              Pick up right where you <GradientText>left off</GradientText>.
            </>
          )}
        </h2>
        <p className="mt-5 max-w-md text-zinc-400">
          {mode === "register"
            ? "Create an account to explore the course for free. Your progress saves automatically and syncs across devices."
            : "Your lessons, progress, and resume point are waiting exactly where you left them."}
        </p>
        <ul className="mt-8 space-y-3.5">
          {POINTS.map((p) => (
            <li key={p} className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan/15 text-cyan">
                <CheckIcon width={12} height={12} />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Form */}
      <div>{children}</div>
    </div>
  );
}
