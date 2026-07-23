/**
 * Auth store — Logic layer runtime source of truth (docs/01 §1.2).
 *
 * Token handling (docs/01 §2.2):
 *  - The access token lives **in memory only** — never localStorage, never a
 *    readable cookie.
 *  - The refresh token is an httpOnly cookie JS can't see.
 *  - Only the *public* user profile (id/email/name/role — data already rendered
 *    in the UI, no secret) is persisted to localStorage so the app can show the
 *    right chrome instantly on reload while it re-mints an access token from the
 *    refresh cookie (see useSessionBootstrap). This keeps "stay logged in"
 *    without ever persisting a credential.
 *
 * This store is the only writer of the api-client's token registry, so the Data
 * layer never imports back into Logic.
 */
import { create } from "zustand";
import { setAccessToken } from "@/lib/api-client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
}

const PROFILE_KEY = "mlms.user";

function persistProfile(user: AuthUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) window.localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* storage disabled — non-fatal, session just won't survive reloads */
  }
}

export function readPersistedProfile(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

type Status = "loading" | "anonymous" | "authenticated";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: Status;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  resolveAnonymous: () => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "loading", // resolved by useSessionBootstrap on mount
  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    persistProfile(user);
    set({ user, accessToken, status: "authenticated" });
  },
  setAccessToken: (accessToken) => {
    setAccessToken(accessToken);
    set({ accessToken });
  },
  resolveAnonymous: () => {
    setAccessToken(null);
    persistProfile(null);
    set({ user: null, accessToken: null, status: "anonymous" });
  },
  clear: () => {
    setAccessToken(null);
    persistProfile(null);
    set({ user: null, accessToken: null, status: "anonymous" });
  },
}));
