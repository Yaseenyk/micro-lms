/**
 * Auth store — Logic layer runtime source of truth (docs/01 §1.2).
 *
 * The access token is held **in memory only** (docs/01 §2.2): never
 * localStorage, never a cookie we can read. On a hard refresh it is gone and
 * the app silently re-mints one from the httpOnly refresh cookie via
 * /auth/refresh (handled in the api-client). The refresh token itself is never
 * visible to JS.
 *
 * This store is the only writer of the api-client's token registry, keeping the
 * Data layer free of any import back into Logic.
 */
import { create } from "zustand";
import { setAccessToken } from "@/lib/api-client";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: "anonymous" | "authenticated";
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "anonymous",
  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    set({ user, accessToken, status: "authenticated" });
  },
  setAccessToken: (accessToken) => {
    setAccessToken(accessToken);
    set({ accessToken });
  },
  clear: () => {
    setAccessToken(null);
    set({ user: null, accessToken: null, status: "anonymous" });
  },
}));
