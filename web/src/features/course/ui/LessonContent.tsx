/**
 * LessonContent — Presentation (docs/01 §1.1). Renders the DB-stored content
 * blocks (docs/03 §4) as a real lesson: objectives, prose, worked code, SVG
 * diagrams, callouts, exercises, and a recap. No video. SVG blocks are
 * admin-seeded, trusted content (no public write path), rendered inline.
 */
"use client";

import { Fragment, type ReactNode } from "react";
import type { ContentBlock } from "../content.types";

/**
 * Inline markdown: `code`, **bold**, *italic*. Split on all three at once so a
 * literal asterisk never leaks into the page (it used to render as "*right*").
 */
function inline(text: string): ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-ice">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic text-zinc-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const calloutStyles = {
  info: "border-cyan/25 bg-cyan/[0.05]",
  warn: "border-amber-500/30 bg-amber-500/[0.05]",
  success: "border-emerald-500/30 bg-emerald-500/[0.05]",
} as const;
const calloutDot = { info: "bg-cyan", warn: "bg-amber-400", success: "bg-emerald-400" } as const;
const calloutLabel = { info: "Note", warn: "Watch out", success: "Rule of thumb" } as const;

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return <h2 className="mt-10 text-xl font-semibold tracking-tight text-zinc-50">{block.text}</h2>;

    case "paragraph":
      return <p className="mt-4 leading-[1.75] text-zinc-300">{inline(block.text)}</p>;

    case "list":
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
              <span className="leading-[1.75]">{inline(item)}</span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol className="mt-5 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3.5 text-zinc-300">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-cyan/40 bg-cyan/[0.08] text-xs font-semibold tabular-nums text-cyan">
                {i + 1}
              </span>
              <span className="leading-[1.75]">{inline(item)}</span>
            </li>
          ))}
        </ol>
      );

    case "objectives":
      return (
        <section className="mt-6 rounded-2xl border border-zinc-800 bg-white/[0.02] p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan">
            What you&apos;ll learn
          </h2>
          <ul className="mt-3.5 space-y-2">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-1 shrink-0 text-cyan" aria-hidden>
                  <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="leading-relaxed">{inline(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      );

    case "code":
      return (
        <figure className="mt-5">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-ink/70">
            {block.language && (
              <div className="border-b border-zinc-900 px-4 py-1.5 font-mono text-xs text-zinc-600">
                {block.language}
              </div>
            )}
            <pre className="overflow-x-auto px-4 py-3.5">
              <code className="font-mono text-sm leading-relaxed text-zinc-200">{block.code}</code>
            </pre>
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-xs text-zinc-500">{inline(block.caption)}</figcaption>
          )}
        </figure>
      );

    case "callout":
      return (
        <aside className={`mt-6 rounded-xl border px-4 py-3.5 ${calloutStyles[block.tone]}`}>
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${calloutDot[block.tone]}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {calloutLabel[block.tone]}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{inline(block.text)}</p>
        </aside>
      );

    case "exercise":
      return (
        <section className="mt-8 rounded-2xl border border-violet-500/30 bg-violet-500/[0.04] p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-purple">
            {block.title ?? "Your turn"}
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-300">{inline(block.text)}</p>
          {block.hint && (
            <details className="group mt-3">
              <summary className="cursor-pointer list-none text-xs font-medium text-purple hover:text-zinc-200">
                Show a hint
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{inline(block.hint)}</p>
            </details>
          )}
        </section>
      );

    case "summary":
      return (
        <section className="mt-10 rounded-2xl border border-zinc-800 bg-gradient-to-b from-white/[0.03] to-transparent p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Key takeaways
          </h2>
          <ul className="mt-3.5 space-y-2.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-cyan to-purple" />
                <span className="leading-relaxed">{inline(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      );

    case "svg":
      return (
        <figure className="mt-7">
          <div
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-white/[0.02] p-4 [&_svg]:h-auto [&_svg]:w-full"
            // Trusted, admin-seeded SVG (docs/03 §4 — no public write path).
            dangerouslySetInnerHTML={{ __html: block.svg }}
          />
          {block.caption && (
            <figcaption className="mt-2.5 text-center text-xs text-zinc-500">{block.caption}</figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}

export function LessonContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <article>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </article>
  );
}
