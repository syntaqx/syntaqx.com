// Revenue management guardrails as a standard diagram: four kinds of input,
// the runtime guard that admits only sources cleared for runtime (pooled
// nonpublic competitor data stops there), then the engine, the landlord's
// symmetric band, the legal rent limit and a person's decision. Embedded in
// content/books/property-tech/revenue-management.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { label: "runtime guard", sub: ["cleared", "sources only"], hl: true },
  { label: "engine", sub: ["recommends,", "logs sources"] },
  { label: "band", sub: ["symmetric,", "set by", "the landlord"] },
  { label: "rent limit", sub: ["clamps to", "the legal", "maximum"] },
  { label: "decision", sub: ["a person's;", "overrides", "are free"] },
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-pg", width: W });

  s.comment("Inputs");
  const iw = 130, ih = 26, ig = 12, top = 24;
  const inputs = ["own data", "public listings", "licensed data"].map((l, i) => s.node(20, top + i * (ih + ig), iw, ih, l));
  const pooled = s.node(20, top + 3 * (ih + ig), iw, ih, "pooled nonpublic", { kind: "ghost" });
  const midY = (inputs[0].y + inputs[2].y2) / 2;

  s.comment("Pipeline");
  const n = STAGES.length, h = 62, gap = 18;
  const w = Math.floor((W - 20 - (20 + iw + 40) - (n - 1) * gap) / n);
  const x0 = W - 20 - (n * w + (n - 1) * gap);
  const nodes = STAGES.map((st, i) => s.node(x0 + i * (w + gap), midY - h / 2, w, h, st.label, { sub: st.sub, hl: st.hl }));
  nodes.slice(1).forEach((nd, i) => s.connect(nodes[i], nd));
  const guard = nodes[0];
  s.fanIn(inputs, guard, { via: (20 + iw + x0) / 2 });
  s.wire([pooled.port("r"), [guard.cx, pooled.cy], guard.port("b")], { alt: true, seg: 0, label: "rejected", side: "below" });

  s.comment("Legend");
  const lg = s.legend(20, Math.max(pooled.y2, guard.y2) + 28, [
    { kind: "ghost", label: "competitors' nonpublic data" },
    { kind: "alt", label: "never read at runtime" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
