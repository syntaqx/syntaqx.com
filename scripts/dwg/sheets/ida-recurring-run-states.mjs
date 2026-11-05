// One run of a recurring plan: the path from scheduled to allocated in the
// accent, dashed exits for a skipped run and a paused plan, and a dashed back
// edge when a batch misses its window.
// Embedded in content/books/investing-and-digital-assets/fractional-and-recurring.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "irr", width: W });

  const w = 112,
    h = 30,
    gap = 30;
  const x0 = (W - (5 * w + 4 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 56,
    r2 = 150;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const scheduled = st(0, r1, "scheduled");
  const funded = st(1, r1, "funded");
  const batched = st(2, r1, "batched");
  const filled = st(3, r1, "filled");
  const allocated = st(4, r1, "allocated", { end: true, hl: true });
  const skipped = st(0, r2, "skipped", { end: true, fill: 1 });
  const paused = st(1, r2, "paused", { end: true, fill: 1 });

  s.comment("The path to an allocation");
  s.connect(scheduled, funded, { hl: true });
  s.connect(funded, batched, { hl: true });
  s.connect(batched, filled, { hl: true });
  s.connect(filled, allocated, { hl: true });

  s.comment("Exits");
  s.connect(scheduled, skipped, {
    from: "b",
    to: "t",
    alt: true,
    label: "funds short",
    side: "left",
  });
  s.connect(funded, paused, {
    from: "b",
    to: "t",
    alt: true,
    label: "transfer\nreversed",
    side: "right",
  });

  s.comment("Missed window, over the top");
  s.connect(batched, scheduled, {
    from: "t",
    to: "t",
    via: r1 - 26,
    alt: true,
    label: "next window",
    side: "above",
    seg: 1,
  });

  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path a run should take" },
    { kind: "alt", label: "exit or retry" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
