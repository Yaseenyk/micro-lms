/** Numbered uppercase eyebrow heading each section: "01 — The Architecture". Ported from the portfolio. */
export function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-4 text-xs uppercase tracking-[0.25em] text-zinc-500">
      <span className="tabular-nums text-cyan">{index}</span>
      <span className="h-px w-10 bg-gradient-to-r from-cyan/60 to-transparent" />
      <span>{title}</span>
    </div>
  );
}
