/**
 * Auth Data service (docs/01 §1.3). Wraps the auth endpoints from docs/04 §2–5
 * behind typed calls. No UI, no store — just transport shapes in and out.
 */
import { apiClient } from "@/lib/api-client";
import type { AuthUser } from "@/stores/auth.store";

interface AuthResult {
  user: AuthUser;
  accessToken: string;
}

export const authService = {
  register(input: { email: string; password: string; name: string }): Promise<AuthResult> {
    // skipAuthRefresh: a 401 here is a real credential failure, not a stale token.
    return apiClient.post<AuthResult>("/auth/register", input, { skipAuthRefresh: true });
  },

  login(input: { email: string; password: string }): Promise<AuthResult> {
    return apiClient.post<AuthResult>("/auth/login", input, { skipAuthRefresh: true });
  },

  logout(): Promise<{ loggedOut: boolean }> {
    return apiClient.post<{ loggedOut: boolean }>("/auth/logout", undefined, {
      skipAuthRefresh: true,
    });
  },

  /** Mint a fresh access token from the httpOnly refresh cookie (docs/04 §4). */
  refresh(): Promise<{ accessToken: string }> {
    return apiClient.post<{ accessToken: string }>("/auth/refresh", undefined, {
      skipAuthRefresh: true,
    });
  },
};
