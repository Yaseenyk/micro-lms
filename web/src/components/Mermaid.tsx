/**
 * Mermaid — Presentation. Renders a ```mermaid fenced block as an SVG diagram.
 *
 * Hydration rules this component exists to satisfy:
 *
 *  1. Mermaid touches `document`, so it must never run during the build-time
 *     prerender (`output: "export"` still prerenders every page). The library is
 *     imported dynamically INSIDE the effect, so it never reaches the server
 *     bundle — and its ~500KB never lands in the initial client bundle either.
 *  2. Server HTML and the first client render must match exactly, so the SVG is
 *     injected only AFTER mount. Both passes render the same placeholder.
 *  3. Mermaid's auto-generated ids are random, which would differ between
 *     renders. We pass a deterministic id derived from React's useId.
 *  4. React 18 StrictMode double-invokes effects in development, so the async
 *     render is cancellable — otherwise two renders race and can duplicate the
 *     diagram or set state after unmount.
 *  5. Invalid diagram syntax must not blank the lesson: on error we fall back to
 *     showing the original source.
 */
"use client";

import { useEffect, useId, useRef, useState } from "react";

type Status = "pending" | "ready" | "error";

export function Mermaid({ chart }: { chart: string }) {
  const reactId = useId();
  // useId produces ':r0:' style values; ':' is invalid in a DOM/SVG id.
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9-_]/g, "")}`;

  const [svg, setSvg] = useState<string>("");
  const [status, setStatus] = useState<Status>("pending");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        // Dynamic import: keeps mermaid out of the server bundle entirely and
        // off the critical path for pages with no diagrams.
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false, // we drive rendering imperatively
          theme: "dark",
          securityLevel: "strict",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          themeVariables: {
            background: "#05070A",
            primaryColor: "#0B0F16",
            primaryTextColor: "#e4e4e7",
            primaryBorderColor: "#22D3EE",
            lineColor: "#52525b",
            secondaryColor: "#1a1a1f",
            tertiaryColor: "#0B0F16",
            fontSize: "14px",
          },
        });

        const { svg: rendered } = await mermaid.render(diagramId, chart);
        if (!cancelled) {
          setSvg(rendered);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void render();

    return () => {
      cancelled = true;
      // Mermaid appends a temporary measuring node on failure; clean it up so
      // StrictMode's second pass starts from a clean DOM.
      document.getElementById(`d${diagramId}`)?.remove();
    };
  }, [chart, diagramId]);

  // Syntax error → show the source rather than an empty gap.
  if (status === "error") {
    return (
      <figure className="my-7">
        <div className="overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/[0.04]">
          <div className="border-b border-amber-500/20 px-4 py-1.5 font-mono text-xs text-amber-300/80">
            mermaid · could not render
          </div>
          <pre className="overflow-x-auto px-4 py-3.5">
            <code className="font-mono text-sm leading-relaxed text-zinc-300">{chart}</code>
          </pre>
        </div>
      </figure>
    );
  }

  return (
    <figure className="my-7">
      <div
        ref={containerRef}
        // Identical markup on server and first client render; the SVG is swapped
        // in only after mount, so there is nothing for React to mismatch.
        className="flex min-h-[8rem] items-center justify-center overflow-x-auto rounded-2xl border border-zinc-800 bg-white/[0.02] p-5 [&_svg]:h-auto [&_svg]:max-w-full"
        {...(status === "ready" ? { dangerouslySetInnerHTML: { __html: svg } } : {})}
      >
        {status === "pending" ? (
          <span className="text-xs text-zinc-600">Rendering diagram…</span>
        ) : null}
      </div>
    </figure>
  );
}
