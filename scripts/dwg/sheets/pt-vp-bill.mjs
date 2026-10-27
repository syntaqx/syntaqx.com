// A vendor invoice from capture to payment run: split into one bill per
// paying entity, matched to the PO and receipt, checked for duplicates,
// approved under the stricter limit, paid in runs grouped by paying entity.
// Embedded in content/books/property-tech/vendors-and-payables.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "in", label: "capture", sub: ["keyed, outsourced,", "AI or e-invoice"] },
  { head: "per owner", label: "split", hl: true, sub: ["one bill per", "paying entity"] },
  { head: "check", label: "match", sub: ["PO, then receipt", "or work order"] },
  { label: "duplicates", sub: ["same number,", "or fuzzy match"] },
  { head: "approve", label: "route", sub: ["stricter limit;", "not the enterer"] },
  { head: "out", label: "payment run", sub: ["by paying entity", "and bank account"] },
];

export default function draw() {
  const W = 760, w = 100, gap = 20;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = (W - total) / 2;
  const s = sheet({ prefix: "pt-vpb", width: W });

  s.comment("Bill pipeline");
  const { nodes, bottoms } = s.pipeline(x0, 36, STAGES, { w, h: 28, gap });
  const match = nodes[2];

  s.comment("Outside tolerance goes to people");
  const q = s.node(match.cx - 70, bottoms[2] + 40, 140, 28, "exception queue", { kind: "store", fill: 1 });
  s.wire([[match.cx, bottoms[2] + 6], q.port("t")], { alt: true, label: "outside tolerance", side: "right" });

  s.height = Math.ceil(q.y2 + 20);
  return s.toString();
}
