/**
 * Dumb, prop-driven Presentation primitives (docs/01 §1.1), skinned to match the
 * portfolio: ink glass surfaces, the cyan glow CTA, ice-hover ghost buttons.
 * No business logic, no data access.
 */
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-white/[0.02] p-6 shadow-2xl shadow-black/40 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

const PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-cyan px-6 py-3 text-sm font-semibold text-ink shadow-[0_0_24px_-4px_rgba(34,211,238,0.6)] transition-all duration-300 hover:shadow-[0_0_30px_-2px_rgba(34,211,238,0.7)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none";
const GHOST =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-200 transition-colors duration-300 hover:border-ice/60 hover:text-ice active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button className={`${variant === "primary" ? PRIMARY : GHOST} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  variant = "primary",
  className = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "primary" | "ghost" }) {
  return (
    <a className={`${variant === "primary" ? PRIMARY : GHOST} ${className}`} {...props}>
      {children}
    </a>
  );
}

export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      <input
        className="w-full rounded-lg border border-zinc-800 bg-ink/60 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan/60 focus:ring-2 focus:ring-cyan/10"
        {...props}
      />
      {hint && <span className="mt-1.5 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function Alert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" }) {
  const styles =
    tone === "error"
      ? "border-rose-500/30 bg-rose-500/[0.08] text-rose-200"
      : "border-cyan/25 bg-cyan/[0.06] text-ice";
  return <p className={`rounded-lg border px-3.5 py-2.5 text-sm ${styles}`}>{children}</p>;
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "cyan" | "emerald";
}) {
  const styles = {
    neutral: "border-zinc-800 bg-white/[0.03] text-zinc-300",
    cyan: "border-cyan/30 bg-cyan/[0.06] text-ice",
    emerald: "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${styles}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink ${className}`}
      aria-hidden
    />
  );
}
