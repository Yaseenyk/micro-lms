/**
 * LessonMarkdown — Presentation (docs/01 §1.1). Renders a GFM Markdown string
 * from the database (docs/03 §4 `markdown` block) with the site's typography.
 *
 *  - remark-gfm       → tables, strikethrough, task lists, autolinks
 *  - rehype-highlight → hljs-* classes on fenced code (themed in globals.css)
 *  - code override    → ```mermaid fences become SVG diagrams, everything else
 *                       falls through to a styled, highlighted code block
 *
 * Mermaid is loaded through next/dynamic with ssr:false so the library never
 * runs during the build-time prerender and never enters the server bundle.
 */
"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import dynamic from "next/dynamic";

const Mermaid = dynamic(() => import("@/components/Mermaid").then((m) => m.Mermaid), {
  ssr: false, // hydration rule 1: never prerender a DOM-dependent library
  loading: () => (
    <div className="my-7 flex min-h-[8rem] items-center justify-center rounded-2xl border border-zinc-800 bg-white/[0.02] p-5 text-xs text-zinc-600">
      Loading diagram…
    </div>
  ),
});

/** Flatten children to a string — code fence contents arrive as nodes. */
function toText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  return "";
}

const components: Components = {
  h1: (p) => (
    <h1 className="mt-2 scroll-mt-24 text-3xl font-semibold tracking-tight text-zinc-50" {...p} />
  ),
  h2: (p) => (
    <h2
      className="mt-12 scroll-mt-24 border-b border-zinc-900 pb-2 text-2xl font-semibold tracking-tight text-zinc-50"
      {...p}
    />
  ),
  h3: (p) => (
    <h3 className="mt-9 scroll-mt-24 text-xl font-semibold tracking-tight text-zinc-100" {...p} />
  ),
  h4: (p) => <h4 className="mt-7 text-base font-semibold text-zinc-100" {...p} />,
  p: (p) => <p className="mt-4 leading-[1.75] text-zinc-300" {...p} />,
  a: (p) => (
    <a
      className="font-medium text-ice underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-cyan"
      target="_blank"
      rel="noopener noreferrer"
      {...p}
    />
  ),
  strong: (p) => <strong className="font-semibold text-zinc-100" {...p} />,
  em: (p) => <em className="italic text-zinc-200" {...p} />,
  hr: () => <hr className="my-10 border-zinc-900" />,

  ul: (p) => <ul className="mt-4 space-y-2.5 pl-1" {...p} />,
  ol: (p) => <ol className="mt-4 list-decimal space-y-2.5 pl-6 marker:text-cyan" {...p} />,
  li: ({ children, ...rest }) => (
    <li className="leading-[1.75] text-zinc-300 [ul_&]:relative [ul_&]:pl-5" {...rest}>
      {/* Bullet for unordered lists; ordered lists use native markers. */}
      <span className="absolute left-0 top-[0.7em] hidden h-1.5 w-1.5 rounded-full bg-cyan [ul_&]:block" />
      {children}
    </li>
  ),

  blockquote: (p) => (
    <blockquote
      className="mt-6 rounded-r-xl border-l-2 border-cyan/60 bg-cyan/[0.04] py-3 pl-5 pr-4 text-zinc-300 [&>p]:mt-0 [&>p+p]:mt-3"
      {...p}
    />
  ),

  table: (p) => (
    // Wide tables scroll inside their own container, never the page.
    <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full border-collapse text-sm" {...p} />
    </div>
  ),
  thead: (p) => <thead className="bg-white/[0.03]" {...p} />,
  th: (p) => (
    <th
      className="border-b border-zinc-800 px-4 py-2.5 text-left font-semibold text-zinc-200"
      {...p}
    />
  ),
  td: (p) => <td className="border-b border-zinc-900 px-4 py-2.5 align-top text-zinc-300" {...p} />,

  // Block code: react-markdown v10 passes the fence through `pre > code`.
  pre: ({ children }) => <>{children}</>,

  code: ({ className, children, ...rest }: ComponentPropsWithoutRef<"code">) => {
    const language = /language-(\w+)/.exec(className ?? "")?.[1];

    // Inline code: no language class and no newline.
    const text = toText(children);
    if (!language && !text.includes("\n")) {
      return (
        <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-ice">
          {children}
        </code>
      );
    }

    // ```mermaid → SVG diagram instead of a code block.
    if (language === "mermaid") {
      return <Mermaid chart={text.trim()} />;
    }

    return (
      <figure className="mt-5">
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-ink/70">
          {language && (
            <div className="border-b border-zinc-900 px-4 py-1.5 font-mono text-xs text-zinc-600">
              {language}
            </div>
          )}
          <pre className="overflow-x-auto px-4 py-3.5">
            <code className={`font-mono text-sm leading-relaxed ${className ?? ""}`} {...rest}>
              {children}
            </code>
          </pre>
        </div>
      </figure>
    );
  },
};

export function LessonMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="lesson-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
