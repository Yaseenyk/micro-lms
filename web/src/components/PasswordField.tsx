/**
 * PasswordField — Presentation (docs/01 §1.1). A password input with a show/hide
 * eye toggle. Mirrors the shared Field styling; local UI state only (visibility).
 */
"use client";

import { useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons";

export function PasswordField({
  label,
  hint,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; hint?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          className="w-full rounded-lg border border-zinc-800 bg-ink/60 px-3.5 py-2.5 pr-11 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan/60 focus:ring-2 focus:ring-cyan/10"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-zinc-500 transition-colors hover:text-zinc-200"
          tabIndex={-1}
        >
          {visible ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
        </button>
      </div>
      {hint && <span className="mt-1.5 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}
