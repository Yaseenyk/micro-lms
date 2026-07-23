/**
 * useAuth — Logic layer (docs/01 §1.2). Orchestrates the auth Data service and
 * the auth store, and exposes a clean async surface to Presentation. Components
 * never call the service or touch the token directly.
 */
"use client";

import { useCallback, useState } from "react";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import { ApiError } from "@/lib/api-client";

export function useAuth() {
  const { user, status, setSession, clear } = useAuthStore();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (fn: () => Promise<{ user: Parameters<typeof setSession>[0]; accessToken: string }>) => {
      setPending(true);
      setError(null);
      try {
        const result = await fn();
        setSession(result.user, result.accessToken);
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
        return false;
      } finally {
        setPending(false);
      }
    },
    [setSession],
  );

  const register = useCallback(
    (input: { email: string; password: string; name: string }) =>
      run(() => authService.register(input)),
    [run],
  );

  const login = useCallback(
    (input: { email: string; password: string }) => run(() => authService.login(input)),
    [run],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clear();
    }
  }, [clear]);

  return { user, status, pending, error, register, login, logout };
}
