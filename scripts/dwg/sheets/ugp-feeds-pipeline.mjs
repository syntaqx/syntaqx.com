// The recommendation pipeline: several candidate sources joined into
// retrieval, light and heavy ranking, filtering and policy (the accent: after
// ranking and again at render), mixing, and the served page, whose log
// trains the next model. Embedded in
// content/books/user-generated-platforms/feeds-and-recommendations.md.
import { sheet } from "../kit.mjs";

const SOURCES = ["viewer's graph", "similar users", "nearest embeddings", "related items", "trending"];
const STAGES = [
  { label: "retrieve", sub: ["thousands", "of candidates"] },
  { label: "light rank", sub: ["to hundreds"] },
  { label: "heavy rank", sub: ["many predicted", "outcomes"] },
  { label: "filter", hl: true, sub: ["after ranking,", "again at render"] },
  { label: "mix", sub: ["diversity, ads,", "freshness"] },
  { label: "serve", sub: ["the page"] },
];

export default function draw() {
  const W = 760, gap = 16, sw = 140, trunk = 36, h = 36;
  const s = sheet({ prefix: "ugp-frp", width: W });
  const x0 = 20 + sw + trunk;
  const w = (W - 20 - x0 - 5 * gap) / 6;
  const X = (i) => x0 + i * (w + gap);

  s.comment("Candidate sources");
  const sh = 24, sg = 10, sy = 24;
  const srcs = SOURCES.map((l, i) => s.node(20, sy + i * (sh + sg), sw, sh, l));
  const cy = (srcs[0].y + srcs.at(-1).y2) / 2;

  s.comment("Stages");
  const { nodes, bottoms } = s.pipeline(x0, cy - h / 2, STAGES, { w, h, gap });
  s.fanIn(srcs, nodes[0], { via: 20 + sw + trunk / 2 });

  s.comment("The log trains the next model");
  const ly = Math.max(...bottoms) + 30;
  const log = s.node(X(5), ly, w, h, "page log", { kind: "store" });
  const next = s.node(X(2), ly, w, h, "next model", { kind: "ghost" });
  s.wire([[nodes[5].cx, bottoms[5] + 6], [nodes[5].cx, ly]]);
  s.connect(log, next, { from: "l", to: "r", label: "trained on what was shown", side: "below" });

  s.height = Math.ceil(Math.max(log.y2, srcs.at(-1).y2) + 24);
  return s.toString();
}
