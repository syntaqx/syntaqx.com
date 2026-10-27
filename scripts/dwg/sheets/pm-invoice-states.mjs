// The invoice state machine as a standard diagram: finalize, then paid in
// full on the accent path; partial payments, write-offs and voids beside it;
// a returned payment reopens a paid invoice. Embedded in
// content/books/payments/checkout-and-invoicing.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pmis", width: W });

  // Grid: four columns on the main row, a channel above it for the
  // paid-in-full edge, and a row below for the exits.
  const w = 120, h = 30, gap = 64;
  const x0 = Math.round((W - (4 * w + 3 * gap)) / 2);
  const X = (i) => x0 + i * (w + gap);
  const r1 = 74, r2 = 184;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const draft = st(0, r1, "draft");
  const open = st(1, r1, "open");
  const partial = st(2, r1, "partially_paid");
  const paid = st(3, r1, "paid", { hl: true });
  const voided = st(1, r2, "void", { end: true, fill: 1 });
  const uncollectible = st(2, r2, "uncollectible", { fill: 1 });

  s.comment("The path an invoice should take");
  s.connect(draft, open, { hl: true, label: "finalize" });
  s.connect(open, paid, { from: "t", to: "t", via: r1 - 34, hl: true, label: "paid in full", side: "above" });

  s.comment("Partial payments, and a returned payment reopening a paid invoice");
  s.connect(open, partial, { label: "part paid" });
  s.connect(partial, paid, { at: [0.3, 0.3], label: "balance 0", side: "above" });
  s.connect(paid, partial, { from: "l", to: "r", at: [0.7, 0.7], alt: true, label: "returned", side: "below" });

  s.comment("Exits");
  s.connect(open, voided, { from: "b", to: "t", alt: true, label: "voided", side: "left" });
  s.connect(partial, uncollectible, { from: "b", to: "t", alt: true, label: "written off", side: "left" });
  s.connect(uncollectible, paid, { from: "r", to: "b", label: "paid late", side: "right" });

  s.comment("Legend");
  const lg = s.legend(X(0), r2 + h + 34, [
    { kind: "hl", label: "the path an invoice should take" },
    { kind: "flow", label: "payment applied" },
    { kind: "alt", label: "exit or reversal" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
