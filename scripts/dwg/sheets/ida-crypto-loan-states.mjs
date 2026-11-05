// One crypto loan: requested to repaid in the accent, a margin call that
// returns to active when cured, and liquidation when it isn't.
// Embedded in content/books/investing-and-digital-assets/crypto-prime-and-lending.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "icl", width: W });

  const w = 120,
    h = 30,
    gap = 160;
  const x0 = (W - (3 * w + 2 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 40,
    r2 = 150,
    r3 = 260;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const requested = st(0, r1, "requested");
  const active = st(1, r1, "active");
  const repaid = st(2, r1, "repaid", { end: true, hl: true });
  const call = st(1, r2, "margin_call");
  const liquidating = st(1, r3, "liquidating");
  const liquidated = st(2, r3, "liquidated", { end: true, fill: 1 });

  s.comment("The path a loan should take");
  s.connect(requested, active, { hl: true, label: "funded" });
  s.connect(active, repaid, { hl: true, label: "repaid" });

  s.comment("Margin call and cure, on separate ports");
  s.connect(active, call, {
    from: "b",
    to: "t",
    at: [0.3, 0.3],
    alt: true,
    label: "LTV over\ncall line",
    side: "left",
  });
  s.connect(call, active, {
    from: "t",
    to: "b",
    at: [0.7, 0.7],
    alt: true,
    label: "cured: collateral\nor repayment",
    side: "right",
  });

  s.comment("Liquidation");
  s.connect(call, liquidating, {
    from: "b",
    to: "t",
    alt: true,
    label: "not cured, or LTV\nover liquidation line",
    side: "right",
  });
  s.connect(liquidating, liquidated, {
    alt: true,
    label: "debt and fee repaid,\nexcess returned",
    side: "above",
  });

  const lg = s.legend(x0, r3 + h + 34, [
    { kind: "hl", label: "the path a loan should take" },
    { kind: "alt", label: "call, cure or liquidation" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
