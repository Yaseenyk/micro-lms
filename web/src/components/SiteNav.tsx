/**
 * SiteNav — Presentation (docs/01 §1.1). Reflects auth state from the store and
 * exposes login/logout. Reads the hook; no direct data access.
 */
"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "./ui";

export function SiteNav() {
  const { user, status, logout } = useAuth();
  return (
    <header className="border-b border-line/70">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
        <a href="/" className="text-sm font-bold tracking-tight text-slate-100">
          Micro<span className="text-cyan">LMS</span>
        </a>
        <nav className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <span className="hidden text-xs text-slate-400 sm:inline">{user?.email}</span>
              <Button variant="ghost" onClick={() => void logout()}>Log out</Button>
            </>
          ) : (
            <>
              <a href="/login/"><Button variant="ghost">Log in</Button></a>
              <a href="/register/"><Button>Get started</Button></a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
