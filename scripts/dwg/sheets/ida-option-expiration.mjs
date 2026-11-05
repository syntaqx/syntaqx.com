// A long option position on expiration day: the path to an exercise in the
// accent, a dashed sell-out before the close and a dashed expiry after it.
// Embedded in content/books/investing-and-digital-assets/options-trading.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "iox", width: W });

  // Grid: four states on the main row, two terminal outcomes below.
  const w = 120,
    h = 30,
    gap = 80;
  const x0 = (W - (4 * w + 3 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 24,
    r2 = 120;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const open = st(0, r1, "open");
  const review = st(1, r1, "pre_close_review");
  const evaluated = st(2, r1, "evaluated");
  const exercised = st(3, r1, "exercised", { end: true, hl: true });
  const soldOut = st(1, r2, "sold_out", { end: true, fill: 1 });
  const expired = st(2, r2, "expired", { end: true, fill: 1 });

  s.comment("The path to an exercise");
  s.connect(open, review, { hl: true, label: "expiry day" });
  s.connect(review, evaluated, { hl: true, label: "close" });
  s.connect(evaluated, exercised, { hl: true, label: "in the\nmoney", side: "above" });

  s.comment("Exits");
  s.connect(review, soldOut, {
    from: "b",
    to: "t",
    alt: true,
    label: "can't fund\nexercise",
    side: "left",
  });
  s.connect(evaluated, expired, {
    from: "b",
    to: "t",
    alt: true,
    label: "out of the money\nor do not exercise",
    side: "right",
  });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 36, [
    { kind: "hl", label: "an in-the-money long, funded" },
    { kind: "alt", label: "closed or lapsed instead" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
