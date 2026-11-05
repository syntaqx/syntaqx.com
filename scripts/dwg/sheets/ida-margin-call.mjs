// A margin call from detection to its end: met in the accent, a dashed path
// to liquidation when the deadline passes or equity hits the floor.
// Embedded in content/books/investing-and-digital-assets/margin-and-short-selling.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "imc", width: W });

  // Grid: three states on the main row, liquidation below the middle.
  const w = 130,
    h = 30,
    gap = 90;
  const x0 = (W - (3 * w + 2 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 24,
    r2 = 120;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const detected = st(0, r1, "detected");
  const issued = st(1, r1, "issued");
  const met = st(2, r1, "met", { end: true, hl: true });
  const liquidating = st(1, r2, "liquidating");
  const liquidated = st(2, r2, "liquidated", { end: true, fill: 1 });

  s.comment("The path to a met call");
  s.connect(detected, issued, { hl: true, label: "notice sent" });
  s.connect(issued, met, { hl: true, label: "deposit or\nprice recovers", side: "above" });

  s.comment("Liquidation");
  s.connect(issued, liquidating, {
    from: "b",
    to: "t",
    alt: true,
    label: "due date passes",
    side: "right",
  });
  s.connect(detected, liquidating, {
    from: "b",
    to: "l",
    alt: true,
    label: "below the house floor",
    side: "left",
    seg: 0,
  });
  s.connect(liquidating, liquidated, { label: "covered" });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 36, [
    { kind: "hl", label: "the path a call should take" },
    { kind: "alt", label: "the firm sells instead" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
