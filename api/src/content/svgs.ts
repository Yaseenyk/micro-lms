/**
 * Brand-styled inline SVG diagrams (docs/03 §4 svg blocks). Flat vector on
 * transparent ink, cyan/violet/ice only — no glows, no raster. Stored verbatim
 * in courseContent and rendered by the client. Authored here (trusted content;
 * no public write path).
 */
const C = "#22D3EE"; // cyan
const V = "#A855F7"; // violet
const I = "#67E8F9"; // ice
const T = "#a1a1aa"; // zinc-400 text
const L = "#27272a"; // zinc-800 line

const wrap = (inner: string) =>
  `<svg viewBox="0 0 640 240" fill="none" xmlns="http://www.w3.org/2000/svg" font-family="ui-sans-serif, system-ui" role="img">${inner}</svg>`;

const box = (x: number, y: number, w: number, h: number, stroke: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" stroke="${stroke}" stroke-width="1.5" fill="${stroke}14"/>`;

const label = (x: number, y: number, text: string, fill = T, size = 14, weight = 500) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" text-anchor="middle">${text}</text>`;

const arrow = (x1: number, y1: number, x2: number, y2: number, stroke = L) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.5" marker-end="url(#ah)"/>`;

const defs = `<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M1 1 L7 4.5 L1 8" stroke="${T}" stroke-width="1.4" fill="none"/></marker></defs>`;

export const SVGS: Record<string, string> = {
  // Generic 3-stage pipeline A → B → C
  pipeline: wrap(
    defs +
      box(40, 90, 150, 60, C) + label(115, 126, "Input", C) +
      box(245, 90, 150, 60, I) + label(320, 126, "Process", I) +
      box(450, 90, 150, 60, V) + label(525, 126, "Output", V) +
      arrow(190, 120, 245, 120) + arrow(395, 120, 450, 120),
  ),

  // Three stacked architecture layers
  layers: wrap(
    box(160, 40, 320, 46, C) + label(320, 69, "Presentation", C) +
      box(160, 100, 320, 46, I) + label(320, 129, "Logic", I) +
      box(160, 160, 320, 46, V) + label(320, 189, "Data", V),
  ),

  // Agent think → act → observe loop
  loop: wrap(
    defs +
      `<circle cx="320" cy="120" r="82" stroke="${L}" stroke-width="1.5" stroke-dasharray="4 6"/>` +
      box(255, 20, 130, 44, C) + label(320, 47, "Reason", C) +
      box(470, 98, 130, 44, I) + label(535, 125, "Act", I) +
      box(255, 176, 130, 44, V) + label(320, 203, "Observe", V) +
      box(40, 98, 130, 44, T) + label(105, 125, "Tools", T) +
      arrow(385, 44, 470, 104) + arrow(470, 130, 385, 190) +
      arrow(255, 198, 170, 130) + arrow(170, 114, 255, 48),
  ),

  // Vector space: query + nearest neighbours
  vectors: wrap(
    `<circle cx="120" cy="70" r="6" fill="${T}"/><circle cx="180" cy="150" r="6" fill="${T}"/>` +
      `<circle cx="90" cy="170" r="6" fill="${T}"/><circle cx="470" cy="60" r="6" fill="${T}"/>` +
      `<circle cx="520" cy="140" r="6" fill="${T}"/><circle cx="300" cy="120" r="9" fill="${C}"/>` +
      `<circle cx="345" cy="95" r="6" fill="${I}"/><circle cx="355" cy="150" r="6" fill="${I}"/>` +
      `<circle cx="260" cy="160" r="6" fill="${I}"/>` +
      `<line x1="300" y1="120" x2="345" y2="95" stroke="${C}" stroke-width="1.3"/>` +
      `<line x1="300" y1="120" x2="355" y2="150" stroke="${C}" stroke-width="1.3"/>` +
      `<line x1="300" y1="120" x2="260" y2="160" stroke="${C}" stroke-width="1.3"/>` +
      label(300, 210, "query + nearest neighbours", T, 13),
  ),

  // Retrieval flow: query → store → top-k → LLM → answer
  retrieval: wrap(
    defs +
      box(20, 95, 120, 50, C) + label(80, 125, "Query", C) +
      box(180, 95, 130, 50, I) + label(245, 118, "Vector", I) + label(245, 136, "store", I) +
      box(350, 95, 120, 50, I) + label(410, 125, "Top-k", I) +
      box(510, 95, 110, 50, V) + label(565, 125, "LLM", V) +
      arrow(140, 120, 180, 120) + arrow(310, 120, 350, 120) + arrow(470, 120, 510, 120),
  ),

  // Simple feed-forward network
  network: wrap(
    (() => {
      const cols = [
        { x: 130, ys: [70, 120, 170], c: C },
        { x: 320, ys: [50, 100, 150, 200], c: I },
        { x: 510, ys: [95, 145], c: V },
      ];
      let s = "";
      for (let a = 0; a < cols.length - 1; a++)
        for (const y1 of cols[a]!.ys)
          for (const y2 of cols[a + 1]!.ys)
            s += `<line x1="${cols[a]!.x}" y1="${y1}" x2="${cols[a + 1]!.x}" y2="${y2}" stroke="${L}" stroke-width="1"/>`;
      for (const col of cols)
        for (const y of col.ys) s += `<circle cx="${col.x}" cy="${y}" r="9" fill="${col.c}22" stroke="${col.c}" stroke-width="1.5"/>`;
      return s;
    })(),
  ),

  // Funnel: many docs → filtered → few
  funnel: wrap(
    defs +
      label(90, 40, "corpus", T, 13) +
      `<circle cx="60" cy="70" r="5" fill="${T}"/><circle cx="90" cy="60" r="5" fill="${T}"/><circle cx="120" cy="75" r="5" fill="${T}"/><circle cx="70" cy="100" r="5" fill="${T}"/><circle cx="110" cy="105" r="5" fill="${T}"/>` +
      `<path d="M200 60 L440 60 L360 130 L360 190 L280 190 L280 130 Z" stroke="${C}" stroke-width="1.5" fill="${C}10"/>` +
      label(320, 100, "rank + filter", C, 13) +
      box(500, 95, 110, 50, V) + label(555, 125, "context", V) +
      arrow(150, 85, 200, 85) + arrow(440, 120, 500, 120),
  ),

  // Eval / feedback loop
  evalloop: wrap(
    defs +
      box(60, 95, 140, 50, C) + label(130, 125, "Prompt", C) +
      box(260, 95, 140, 50, I) + label(330, 125, "Output", I) +
      box(460, 95, 140, 50, V) + label(530, 125, "Score", V) +
      arrow(200, 120, 260, 120) + arrow(400, 120, 460, 120) +
      `<path d="M530 145 C530 200, 130 200, 130 145" stroke="${L}" stroke-width="1.5" stroke-dasharray="4 6" marker-end="url(#ah)"/>` +
      label(330, 195, "refine", T, 12),
  ),
};

export function svg(name: keyof typeof SVGS): string {
  return SVGS[name] ?? SVGS.pipeline!;
}
