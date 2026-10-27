// An owner distribution run as a pipeline: the owner's cash in trust, less
// what isn't the owner's to take, then holds, shares and payout; below it,
// what happens when a bill would take the owner's balance below zero.
// Embedded in content/books/property-tech/owners-and-management-agreements.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "start", label: "cash in trust", sub: ["collected less paid", "per owner"] },
  { head: "less", label: "held amounts", sub: ["deposits, prepaid,", "reserve, payables,", "pending items"] },
  { head: "result", label: "available", sub: ["never below zero"] },
  { head: "check", label: "holds", sub: ["dispute, unverified", "account, sale"] },
  { head: "split", label: "by shares", sub: ["shares in force,", "residue by rule"] },
  { head: "pay", label: "payout", sub: ["ACH, wire or check,", "account verified"] },
];

export default function draw() {
  const W = 760, w = 106, gap = 16;
  const x0 = (W - (STAGES.length * w + (STAGES.length - 1) * gap)) / 2;
  const s = sheet({ prefix: "pt-omd", width: W });

  s.comment("The run");
  const { nodes, bottoms, bottom } = s.pipeline(x0, 36, STAGES, { w, h: 28, gap, hlArrows: true });
  const holds = nodes[3];
  const skip = s.node(holds.cx - 90, bottom + 30, 180, 28, "skipped, reason recorded", { fill: 1 });
  s.wire([[holds.cx, bottoms[3] + 6], skip.port("t")], { alt: true });

  s.comment("A bill larger than the owner's balance");
  const ry = skip.y2 + 56;
  s.text(20, ry - 22, "when a bill exceeds the owner's balance", "lt");
  const bill = s.node(20, ry + 30, 150, 34, "owner bill", { sub: "would go negative" });
  const ow = 200, ox = W - 20 - ow, oh = 34, og = 14;
  const outs = [
    s.node(ox, ry, ow, oh, "blocked", { sub: "the default" }),
    s.node(ox, ry + oh + og, ow, oh, "owner contribution", { sub: "not income, not in fee basis" }),
    s.node(ox, ry + 2 * (oh + og), ow, oh, "manager advance", { sub: "from its own funds, recorded" }),
  ];
  s.fanOut(bill, outs, { via: (bill.x2 + ox) / 2 });

  s.height = Math.ceil(outs[2].y2 + 20);
  return s.toString();
}
