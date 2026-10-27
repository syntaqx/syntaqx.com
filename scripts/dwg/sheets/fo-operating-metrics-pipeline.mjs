// The metrics pipeline: platform database to change capture, a raw layer and
// staging, then marts, one set of metric definitions, and the consumers that
// all read it. Embedded in content/books/field-operations/operating-metrics.md.
import { sheet } from "../kit.mjs";

const ROW1 = [
  { label: "platform database", sub: ["no reporting queries"] },
  { label: "CDC from the log", sub: ["every change,", "deletes too"] },
  { label: "raw, append-only", sub: ["replayable"] },
  { label: "staging", sub: ["renamed, typed,", "one per source"] },
];
const CONSUMERS = ["dashboards", "commission runs", "in-app scorecards", "customer exports"];

export default function draw() {
  const W = 760, x = 20, w = 150, gap = (W - 2 * x - 4 * w) / 3;
  const s = sheet({ prefix: "fo-omp", width: W });

  s.comment("Out of the platform, into the warehouse");
  const { nodes, bottom } = s.pipeline(x, 40, ROW1, { w, h: 28, gap });
  s.text(nodes[0].x, 24, "the platform", "th");
  s.text(nodes[2].x, 24, "the warehouse", "th");

  s.comment("Marts, definitions, consumers");
  const y2 = bottom + 52;
  const ch = 24, cgap = 8, cn = CONSUMERS.length;
  const block = cn * ch + (cn - 1) * cgap;
  const cy = y2 + block / 2;
  const marts = s.node(nodes[0].x, cy - 14, w, 28, "marts: visits, routes");
  const defs = s.node(nodes[1].x, cy - 18, w, 36, "metric definitions", { hl: true, sub: "versioned, reviewed" });
  const my = (bottom + y2) / 2 + 4;
  s.wire([[nodes[3].cx, bottom + 6], [nodes[3].cx, my], [marts.cx, my], marts.port("t")]);
  s.connect(marts, defs, { hl: true });
  const cons = CONSUMERS.map((l, i) => s.node(nodes[2].x, y2 + i * (ch + cgap), w, ch, l));
  const trunk = (defs.x + defs.w + cons[0].x) / 2;
  cons.forEach((c) => s.connect(defs, c, { via: trunk, hl: true }));
  s.text(nodes[3].x + 6, cy - 2, "one number,", "sl");
  s.text(nodes[3].x + 6, cy + 10, "everywhere it appears", "sl");
  s.height = Math.ceil(y2 + block + 20);
  return s.toString();
}
