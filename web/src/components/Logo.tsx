/**
 * Pith logo — the brand mark + wordmark (Presentation).
 *
 * The mark is a stem in cross-section: two rings of pulp with the pith lit at
 * the core. It doubles as the tittle over the "i" in the wordmark. The core is
 * the only element that ever takes colour (cyan). Ported from the brand identity
 * (LMS Brand Logo Design / Pith - Identity).
 */
import type { SVGProps } from "react";

/** The mark alone — app icon, avatar, favicon. Stays legible at 16px. */
export function PithMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" role="img" aria-label="Pith" {...props}>
      <circle cx="16" cy="16" r="14" stroke="#3f3f46" strokeWidth="2" />
      <circle cx="16" cy="16" r="8.5" stroke="#71717a" strokeWidth="2" />
      <circle cx="16" cy="16" r="4" fill="#22D3EE" />
    </svg>
  );
}

/** Mark + wordmark lockup for the nav and footer. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <PithMark className="h-6 w-6" />
      <span className="text-sm font-bold tracking-tight text-zinc-50">Pith</span>
    </span>
  );
}
