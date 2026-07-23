/**
 * useRequireAuth — Logic layer (docs/01 §1.2). Client-side route guard for a
 * static app: once the session has bootstrapped, an anonymous visitor on a
 * protected page is redirected to /login (optionally with a return path). While
 * the session is still resolving it returns "loading" so the page can splash.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export function useRequireAuth(returnTo?: string): "loading" | "authenticated" | "redirecting" {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") {
      const q = returnTo ? `?next=${encodeURIComponent(returnTo)}` : "";
      router.replace(`/login/${q}`);
    }
  }, [status, returnTo, router]);

  if (status === "authenticated") return "authenticated";
  if (status === "anonymous") return "redirecting";
  return "loading";
}
