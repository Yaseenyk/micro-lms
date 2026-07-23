/**
 * useSessionBootstrap — Logic layer (docs/01 §1.2). Runs once on app mount to
 * resolve the initial auth state:
 *
 *  1. If a public profile was persisted from a previous session, try to re-mint
 *     an access token from the httpOnly refresh cookie (/auth/refresh).
 *  2. Success → restore an authenticated session (profile + fresh token).
 *  3. No profile, or refresh fails (cookie expired/rotated) → resolve anonymous.
 *
 * Until this settles, the store status is "loading" and the app shows a splash,
 * so protected UI never flashes the signed-out state on reload.
 */
"use client";

import { useEffect } from "react";
import { authService } from "../services/auth.service";
import { readPersistedProfile, useAuthStore } from "@/stores/auth.store";

export function useSessionBootstrap(): void {
  const setSession = useAuthStore((s) => s.setSession);
  const resolveAnonymous = useAuthStore((s) => s.resolveAnonymous);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap(): Promise<void> {
      const profile = readPersistedProfile();
      if (!profile) {
        resolveAnonymous();
        return;
      }
      try {
        const { accessToken } = await authService.refresh();
        if (!cancelled) setSession(profile, accessToken);
      } catch {
        if (!cancelled) resolveAnonymous();
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setSession, resolveAnonymous]);
}
