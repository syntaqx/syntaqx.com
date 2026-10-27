// Scoring doors as a pipeline: four sources joined on a property key, then
// features, a model and an area roll-up, with the legal filters last on the
// way to the rep's map. Embedded in
// content/books/field-operations/door-to-door-sales.md.
import { sheet } from "../kit.mjs";

const SOURCES = ["property records", "movers", "imagery", "knocks and sales"];
const STAGES = [
  { label: "match to key", sub: ["validated address"] },
  { label: "features", sub: ["licensed uses only"] },
  { label: "model", sub: ["calibrated"] },
  { label: "area roll-up", sub: ["grid cells,", "neighbor cells"] },
];

export default function draw() {
  const W = 760, x = 20, sw = 130, sh = 26, sgap = 8, w = 118, gap = 24;
  const s = sheet({ prefix: "fo-dsc", width: W });
  const top = 44;
  const px = W - x - (STAGES.length * w + (STAGES.length - 1) * gap);
  const bus = (x + sw + px) / 2;

  s.comment("Sources");
  const src = SOURCES.map((l, i) => s.node(x, top + i * (sh + sgap), sw, sh, l));
  const mid = (src[0].cy + src.at(-1).cy) / 2;

  s.comment("Per door, per area");
  const { nodes, bottom } = s.pipeline(px, mid - 14, STAGES, { w, h: 28, gap });
  for (const n of src) s.wire([n.port("r"), [bus, n.cy]], { arrow: "none" });
  s.line(bus, src[0].cy, bus, src.at(-1).cy, "flow");
  s.wire([[bus, mid], nodes[0].port("l")]);

  s.comment("Column heads");
  s.text(x, 26, "sources", "th");
  s.text(px, 26, "per door", "th");
  s.text(nodes[3].x, 26, "per area", "th");

  s.comment("Filters last");
  const fy = bottom + 30;
  const fw = 250;
  const filters = s.node(W - x - fw, fy, fw, 28, "filters: no-knock, permits, licenses", { fill: 1 });
  s.wire([[nodes[3].cx, bottom + 6], [nodes[3].cx, fy]]);
  const map = s.node(px, fy, 140, 28, "rep's map", { end: true, hl: true });
  s.connect(filters, map, { from: "l", to: "r", hl: true });

  const ty = fy + 28 + 30;
  s.text(x, ty, "holdout areas skip the score each season, to measure what it adds", "sl");
  s.height = Math.ceil(ty + 18);
  return s.toString();
}
