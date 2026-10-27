// Allotment file reconciliation for privatized military housing: start and
// stop per lease, import, match, post, close; unmatched lines and amounts
// that differ from rent go to people, never to a guess or a write-off.
// Embedded in content/books/property-tech/military-and-specialty-housing.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "per lease", label: "start, stop", sub: ["signing starts,", "move-out stops"] },
  { head: "per file", label: "import", sub: ["kept as received;", "re-import: no-op"] },
  { head: "where it breaks", headHl: true, label: "match", hl: true, sub: ["line to member", "to lease"] },
  { label: "post", sub: ["applied to the", "period's rent"] },
  { label: "close", sub: ["total ties to", "the deposit"] },
];

export default function draw() {
  const W = 760, w = 120, gap = 30, h = 28;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = (W - total) / 2;
  const s = sheet({ prefix: "pt-mal", width: W });

  const { nodes, bottoms } = s.pipeline(x0, 40, STAGES, { w, h, gap });
  const match = nodes[2], post = nodes[3];

  s.comment("Exceptions go to people");
  const qy = Math.max(bottoms[2], bottoms[3]) + 40;
  const q = s.node(match.x, qy, w, 40, "exceptions", { kind: "store", sub: "no guesses" });
  const bal = s.node(post.x, qy, w, 40, "balance", { kind: "store", sub: "on the lease" });
  s.wire([[match.cx, bottoms[2] + 6], q.port("t")], { alt: true });
  s.wire([[post.cx, bottoms[3] + 6], bal.port("t")], { alt: true });
  s.note(q, "no exact match", { dy: 18 });
  s.note(bal, "allotment differs from rent", { dy: 18 });

  s.height = Math.ceil(q.y2 + 40);
  return s.toString();
}
