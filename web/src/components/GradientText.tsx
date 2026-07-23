import type { ReactNode } from "react";

/** Animated Cyan→Purple gradient text (flows horizontally). Ported from the portfolio. */
export function GradientText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`text-gradient animate-gradient ${className}`}>{children}</span>;
}
