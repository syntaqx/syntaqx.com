// The delinquency case as a standard diagram: stages from a balance past
// grace to an executed writ, the notice accented as the hinge, the holds
// that pause every path at once above, and the ways out below (paid and
// reinstated, a payment plan, collections after move-out). Embedded in
// content/books/property-tech/delinquency-and-eviction.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { label: "past grace", sub: ["reminders"] },
  { label: "late fee", sub: ["within the", "state's cap"] },
  { label: "notice", sub: ["period, content,", "proof of service"], hl: true },
  { label: "filing", sub: ["package to", "counsel"] },
  { label: "hearing", sub: ["or settlement"] },
  { label: "judgment", sub: ["possession,", "money or both"] },
  { label: "writ", sub: ["executed by", "an officer"] },
];
const HOLDS = ["bankruptcy stay", "servicemember", "rental assistance", "dispute or order"];

export default function draw() {
  const W = 760, w = 88, gap = (W - 40 - STAGES.length * w) / (STAGES.length - 1);
  const s = sheet({ prefix: "pt-dq", width: W });

  s.comment("Holds");
  const gy = 40, gh = 52;
  s.group(20, gy, W - 40, gh, "hold on the case", { sub: "pauses every path at once" });
  s.row(32, gy + 12, W - 64, HOLDS, { h: 28, gap: 16, kind: "ghost" });

  s.comment("Stages");
  const py = gy + gh + 34;
  const { nodes, bottoms, bottom } = s.pipeline(20, py, STAGES, { w, h: 28, gap });
  const X = (i) => nodes[i].cx;

  s.comment("Ways out");
  const oy = bottom + 40, oh = 50;
  const ow = 150;
  const paid = s.node(X(2) - ow - 12, oy, ow, oh, "paid in full", { sub: "reinstated", end: true });
  const plan = s.node(X(2) + 12, oy, ow, oh, "payment plan", { kind: "store", sub: ["signed; pauses", "what it says"] });
  s.wire([[X(2) - 6, bottoms[2] + 6], [X(2) - 6, oy - 14], [paid.cx, oy - 14], paid.port("t")], { alt: true });
  s.wire([[X(2) + 6, bottoms[2] + 6], [X(2) + 6, oy - 14], [plan.cx, oy - 14], plan.port("t")], { alt: true });
  const coll = s.node(W - 20 - 170, oy, 170, oh, "collection account", { kind: "store", sub: ["unpaid balance", "after move-out"] });
  s.wire([[X(6), bottoms[6] + 6], coll.port("t", (X(6) - coll.x) / coll.w)]);

  s.height = Math.ceil(oy + oh + 20);
  return s.toString();
}
