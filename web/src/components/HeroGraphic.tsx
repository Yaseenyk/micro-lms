/**
 * HeroGraphic — Presentation. A self-contained animated SVG of the Trinity
 * request lifecycle (Presentation → Logic → Data and back), with packets that
 * flow along the spine. It's the marketing visual: "you're using the final
 * project." Pure decoration; no data, no props.
 */
"use client";

import { motion } from "framer-motion";
import { LayersIcon, RouteIcon, DatabaseIcon } from "./Icons";

const NODES = [
  { key: "presentation", label: "Presentation", sub: "React · routes", Icon: LayersIcon, accent: "#22D3EE" },
  { key: "logic", label: "Logic", sub: "hooks · services", Icon: RouteIcon, accent: "#67E8F9" },
  { key: "data", label: "Data", sub: "adapters · API", Icon: DatabaseIcon, accent: "#A855F7" },
];

export function HeroGraphic() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(20rem_16rem_at_60%_20%,rgba(34,211,238,0.14),transparent_60%),radial-gradient(18rem_14rem_at_20%_90%,rgba(168,85,247,0.14),transparent_60%)]" />

      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-white/[0.02] p-6 backdrop-blur-sm">
        {/* window chrome */}
        <div className="mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="ml-3 font-mono text-[11px] text-zinc-600">GET /course/access</span>
        </div>

        <div className="relative">
          {/* spine */}
          <div className="absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-cyan/50 via-ice/30 to-purple/50" />
          {/* flowing packets */}
          {[0, 1.3].map((delay) => (
            <motion.span
              key={delay}
              className="absolute left-[23px] h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_12px_2px_rgba(34,211,238,0.7)]"
              initial={{ top: 22, opacity: 0 }}
              animate={{ top: [22, 150, 22], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay, times: [0, 0.5, 0.5, 1] }}
            />
          ))}

          <div className="space-y-3">
            {NODES.map((n, i) => (
              <motion.div
                key={n.key}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * i, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="relative flex items-center gap-4 rounded-2xl border border-zinc-800 bg-ink/50 p-3.5"
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border"
                  style={{ borderColor: `${n.accent}55`, backgroundColor: `${n.accent}14`, color: n.accent }}
                >
                  <n.Icon width={20} height={20} />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-100">{n.label}</div>
                  <div className="font-mono text-xs text-zinc-500">{n.sub}</div>
                </div>
                <motion.span
                  className="ml-auto h-2 w-2 rounded-full"
                  style={{ backgroundColor: n.accent }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.4 * i }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-cyan/20 bg-cyan/[0.04] px-4 py-2.5">
          <span className="font-mono text-xs text-ice">200 · access granted</span>
          <span className="text-xs text-zinc-500">~40ms</span>
        </div>
      </div>
    </div>
  );
}
