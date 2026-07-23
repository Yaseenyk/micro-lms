"use client";

import type { ReactNode } from "react";
import { useSessionBootstrap } from "@/features/auth/hooks/useSessionBootstrap";

/**
 * Runs the one-shot session bootstrap for the whole app (docs/01 §1.2 Logic via
 * a hook). It does not block rendering — public pages paint immediately; guarded
 * pages read the resolving status themselves.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  useSessionBootstrap();
  return <>{children}</>;
}
