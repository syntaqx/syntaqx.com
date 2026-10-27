// The commercial expense recovery year: estimates billed before it starts,
// then after close the pool's actual costs run through each lease's terms
// in a recorded order and the difference from the estimates posts as a
// true-up. Embedded in content/books/property-tech/commercial-property.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { label: "actuals", sub: ["pool costs", "from the GL"] },
  { label: "exclusions", sub: ["per lease"] },
  { label: "gross-up", sub: ["variable costs", "to an occupancy"] },
  { label: "base", sub: ["base year", "or stop"] },
  { label: "cap", sub: ["controllable;", "cumulative or not"] },
  { label: "admin fee", sub: ["per lease", "and pool"] },
  { label: "true-up", hl: true, sub: ["less estimates", "billed"] },
];

export default function draw() {
  const W = 760, w = 88, gap = 16, h = 28;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = W - 20 - total;
  const s = sheet({ prefix: "pt-crr", width: W });
  const X = (i) => x0 + i * (w + gap);

  s.comment("Before the year: budget and estimates");
  const r1 = 34;
  s.text(x0, r1 - 10, "before the year", "lt");
  const estimates = s.node(X(6) - 40, r1, w + 40, 40, "estimates", { sub: "monthly charges" });
  const budget = s.node(X(4) - 20, r1, w + 40, 40, "budget", { sub: "per pool" });
  s.connect(budget, estimates);

  s.comment("After year-end close: the lease's terms, in order");
  const r2 = 160;
  s.text(x0, r2 - 46, "after year-end close", "lt");
  s.span(X(1), X(5) + w, r2 - 18, "each lease's terms, in the recorded order", { above: true });
  const { nodes, bottoms } = s.pipeline(x0, r2, STAGES, { w, h, gap });
  const trueUp = nodes[6];
  s.wire([[trueUp.cx, estimates.y2], trueUp.port("t")], { label: "billed", side: "right" });

  s.comment("The statement the tenant checks");
  const st = s.node(trueUp.x2 - 160, bottoms[6] + 34, 160, 40, "statement", { kind: "store", hl: true, sub: "versioned; audit window" });
  s.wire([[trueUp.cx, bottoms[6] + 6], [trueUp.cx, st.y]], { hl: true });

  s.height = Math.ceil(st.y2 + 20);
  return s.toString();
}
