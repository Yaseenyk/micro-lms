/**
 * Dumb, prop-driven Presentation primitives (docs/01 §1.1). No business logic,
 * no data access — just markup + styling. Shared across features.
 */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-5">{children}</div>;
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-panel/60 p-6 shadow-lg shadow-black/30">
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-cyan text-ink hover:brightness-110"
      : "border border-line text-slate-200 hover:bg-white/5";
  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}

export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-300">{label}</span>
      <input
        className="w-full rounded-xl border border-line bg-ink/70 px-3.5 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan/60"
        {...props}
      />
    </label>
  );
}

export function Alert({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200">
      {children}
    </p>
  );
}
