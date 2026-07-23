/**
 * LessonContent — Presentation (docs/01 §1.1). Renders the DB-stored content
 * blocks (docs/03 §4) as styled prose + SVG diagrams. No video. SVG blocks are
 * admin-seeded, trusted content (no public write path), rendered inline.
 */
"use client";

import { Fragment, type ReactNode } from "react";
import type { ContentBlock } from "../content.types";

/** Render `inline code` backtick spans inside paragraph/callout text. */
function inline(text: string): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code
        key={i}
        className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-ice"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

const calloutStyles = {
  info: "border-cyan/25 bg-cyan/[0.05] text-zinc-200",
  warn: "border-amber-500/30 bg-amber-500/[0.05] text-zinc-200",
  success: "border-emerald-500/30 bg-emerald-500/[0.05] text-zinc-200",
} as const;
const calloutDot = { info: "bg-cyan", warn: "bg-amber-400", success: "bg-emerald-400" } as const;

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-9 text-xl font-semibold tracking-tight text-zinc-50">{block.text}</h2>
      );
    case "paragraph":
      return <p className="mt-4 leading-relaxed text-zinc-300">{inline(block.text)}</p>;
    case "list":
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-zinc-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />
              <span className="leading-relaxed">{inline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <div className="mt-5 overflow-hidden rounded-xl border border-zinc-800 bg-ink/70">
          {block.language && (
            <div className="border-b border-zinc-900 px-4 py-1.5 font-mono text-xs text-zinc-600">
              {block.language}
            </div>
          )}
          <pre className="overflow-x-auto px-4 py-3.5">
            <code className="font-mono text-sm leading-relaxed text-zinc-200">{block.code}</code>
          </pre>
        </div>
      );
    case "callout":
      return (
        <div className={`mt-5 flex gap-3 rounded-xl border px-4 py-3.5 ${calloutStyles[block.tone]}`}>
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${calloutDot[block.tone]}`} />
          <p className="text-sm leading-relaxed">{inline(block.text)}</p>
        </div>
      );
    case "svg":
      return (
        <figure className="mt-6">
          <div
            className="overflow-hidden rounded-2xl border border-zinc-800 bg-white/[0.02] p-4 [&_svg]:h-auto [&_svg]:w-full"
            // Trusted, admin-seeded SVG (docs/03 §4 — no public write path).
            dangerouslySetInnerHTML={{ __html: block.svg }}
          />
          {block.caption && (
            <figcaption className="mt-2.5 text-center text-xs text-zinc-500">
              {block.caption}
            </figcaption>
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
