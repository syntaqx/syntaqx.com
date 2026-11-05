// An indirect (60-day) rollover: the path from distributed to completed in the
// accent, and dashed exits when the clock runs out or only part is rolled over.
// Embedded in content/books/investing-and-digital-assets/retirement-accounts.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "iro", width: W });

  const w = 120,
    h = 30,
    gap = 40;
  const x0 = (W - (4 * w + 3 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 40,
    r2 = 150;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const distributed = st(0, r1, "distributed");
  const received = st(1, r1, "received");
  const deposited = st(2, r1, "deposited");
  const completed = st(3, r1, "completed", { end: true, hl: true });
  const taxable = st(1, r2, "taxable", { end: true, fill: 1 });
  const partly = st(2, r2, "partly_taxable", { end: true, fill: 1 });

  s.comment("The path to a completed rollover");
  s.connect(distributed, received, { hl: true });
  s.connect(received, deposited, { hl: true });
  s.connect(deposited, completed, { hl: true });

  s.comment("Exits");
  s.connect(received, taxable, {
    from: "b",
    to: "t",
    alt: true,
    label: "60 days\npassed",
    side: "left",
  });
  s.connect(deposited, partly, {
    from: "b",
    to: "t",
    alt: true,
    label: "partial",
    side: "right",
  });

  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path to a rollover" },
    { kind: "alt", label: "taxed instead" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
