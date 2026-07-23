/**
 * SiteNav — Presentation (docs/01 §1.1). The portfolio's floating glass pill
 * nav, made auth-aware: it reflects the store status and exposes the right
 * actions. Reads the useAuth hook; no direct data access.
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PulseDot } from "./PulseDot";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function SiteNav() {
  const { user, status, logout } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const links =
    status === "authenticated"
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/courses", label: "Courses" },
        ]
      : [{ href: "/courses", label: "Courses" }];

  return (
    <>
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="fixed left-1/2 top-6 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-2 rounded-full border border-zinc-800/60 bg-zinc-950/60 px-4 py-2.5 shadow-2xl shadow-cyan-900/20 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 pr-1">
            <span className="whitespace-nowrap text-sm font-bold tracking-tight text-zinc-50">
              Micro<span className="text-cyan">LMS</span>
            </span>
            <PulseDot />
          </Link>

          <span className="hidden h-4 w-px bg-zinc-800 sm:block" />

          <div className="hidden items-center gap-0.5 sm:flex" onMouseLeave={() => setHovered(null)}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
                className="relative whitespace-nowrap rounded-full px-3 py-1.5 text-sm"
              >
                {hovered === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-zinc-800/50"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={`relative transition-colors duration-200 ${
                    hovered === link.href ? "text-zinc-50" : "text-zinc-400"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <span className="hidden h-4 w-px bg-zinc-800 sm:block" />

          {/* Auth actions — neutral during "loading" so nothing flashes */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {status === "authenticated" ? (
              <button
                onClick={() => void logout()}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
              >
                Log out
              </button>
            ) : status === "anonymous" ? (
              <>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="whitespace-nowrap rounded-full bg-cyan px-3.5 py-1.5 text-sm font-semibold text-ink shadow-[0_0_20px_-6px_rgba(34,211,238,0.7)] transition-shadow hover:shadow-[0_0_26px_-4px_rgba(34,211,238,0.8)]"
                >
                  Get started
                </Link>
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex h-6 w-6 items-center justify-center text-zinc-300 transition-colors hover:text-zinc-50 sm:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <motion.path
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                animate={menuOpen ? { d: "M4 4 L16 16" } : { d: "M3 6 L17 6" }}
                transition={{ duration: 0.25 }}
              />
              <motion.path
                d="M3 10 L17 10"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                animate={{ opacity: menuOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.path
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                animate={menuOpen ? { d: "M4 16 L16 4" } : { d: "M3 14 L17 14" }}
                transition={{ duration: 0.25 }}
              />
            </svg>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="fixed right-6 top-24 z-[60] flex w-[min(80vw,18rem)] flex-col gap-y-2 rounded-2xl border border-zinc-800/60 bg-zinc-950/90 px-4 py-5 shadow-2xl shadow-cyan-900/20 backdrop-blur-md sm:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50 hover:text-zinc-50"
              >
                {link.label}
              </Link>
            ))}
            <span className="my-1 h-px w-full bg-zinc-800" />
            {status === "authenticated" ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
                className="block rounded-xl px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50 hover:text-zinc-50"
              >
                Log out{user ? ` · ${user.name}` : ""}
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50 hover:text-zinc-50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl bg-cyan px-4 py-2.5 text-sm font-semibold text-ink"
                >
                  Get started
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
