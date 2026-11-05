// One rebalance run for one account: the path from scheduled to booked in the
// accent, dashed exits for no action and a deferral, and a dashed back edge
// when a partial fill sends the remainder back to planning.
// Embedded in content/books/investing-and-digital-assets/robo-advisors.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "irb", width: W });

  const w = 100,
    h = 30,
    gap = 24;
  const x0 = (W - (6 * w + 5 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 56,
    r2 = 150;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const scheduled = st(0, r1, "scheduled");
  const evaluated = st(1, r1, "evaluated");
  const planned = st(2, r1, "planned");
  const submitted = st(3, r1, "submitted");
  const filled = st(4, r1, "filled");
  const booked = st(5, r1, "booked", { end: true, hl: true });
  const noAction = st(1, r2, "no_action", { end: true, fill: 1 });
  const deferred = st(2, r2, "deferred", { end: true, fill: 1 });

  s.comment("The path to a booked rebalance");
  s.connect(scheduled, evaluated, { hl: true });
  s.connect(evaluated, planned, { hl: true });
  s.connect(planned, submitted, { hl: true });
  s.connect(submitted, filled, { hl: true });
  s.connect(filled, booked, { hl: true });

  s.comment("Exits");
  s.connect(evaluated, noAction, {
    from: "b",
    to: "t",
    alt: true,
    label: "within\nbands",
    side: "left",
  });
  s.connect(planned, deferred, {
    from: "b",
    to: "t",
    alt: true,
    label: "blocked",
    side: "right",
  });

  s.comment("Partial fill, over the top");
  s.connect(submitted, planned, {
    from: "t",
    to: "t",
    via: r1 - 26,
    alt: true,
    label: "partial fill",
    side: "above",
    seg: 1,
  });

  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path that trades" },
    { kind: "alt", label: "exit or replan" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
