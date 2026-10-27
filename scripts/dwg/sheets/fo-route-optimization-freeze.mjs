// The freeze window as a standard diagram: one technician's day as a row of
// stops, a frozen region up to now plus the freeze window, the freeze edge
// in the accent, and the stops after it open to the solver. Embedded in
// content/books/field-operations/route-optimization.md.
import { sheet } from "../kit.mjs";

const FROZEN = [
  { label: "done", kind: "ghost" },
  { label: "done", kind: "ghost" },
  { label: "on site", fill: 1 },
  { label: "next, told", fill: 1 },
];
const OPEN = [{ label: "movable" }, { label: "pinned", end: true }, { label: "movable" }];

export default function draw() {
  const W = 760, w = 88, h = 28, gap = 10, pad = 10, edgeGap = 36;
  const x0 = 20 + pad; // the frozen group's boundary sits on the 20 margin
  const s = sheet({ prefix: "fo-rofz", width: W });
  const top = 44, ny = top + 18;

  s.comment("One technician's day");
  const frozen = FROZEN.map((o, i) => s.node(x0 + i * (w + gap), ny, w, h, o.label, o));
  const ox = frozen[3].x + w + edgeGap;
  const open = OPEN.map((o, i) => s.node(ox + i * (w + gap), ny, w, h, o.label, o));

  s.comment("Frozen region");
  const gb = ny + h + 18;
  s.group(x0 - pad, top, frozen[3].x + w + pad - (x0 - pad), gb - top, "frozen: the past plus the freeze window");
  s.text(ox, top - 7, "open to the solver", "lt hl");

  s.comment("Now and the freeze edge");
  const ly = gb + 26;
  s.line(frozen[2].cx, ny + h + 6, frozen[2].cx, ly, "leader");
  s.text(frozen[2].cx, ly + 13, "now", "sl ink", "middle");
  const ex = frozen[3].x + w + edgeGap / 2;
  s.wire([[ex, top - 22], [ex, ly]], { hl: true, alt: true, arrow: "none" });
  s.text(ex, ly + 13, "now + freeze window", "sl hl", "middle");

  s.comment("Pinned");
  s.text(open[1].cx, ny + h + 16, "keeps time and tech", "sl", "middle");

  s.comment("Footer");
  const fy = ly + 44;
  s.text(x0 - pad, fy, "done and on-site work is history; the next stop's customer already has an ETA, so it stays", "sl");
  s.text(x0 - pad, fy + 14, "after the edge, movable stops can be reordered or moved to another technician", "sl");
  s.height = Math.ceil(fy + 14 + 18);
  return s.toString();
}
