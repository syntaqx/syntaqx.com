// A surveillance alert from generation to a documented close or a referral:
// the escalation path in the accent, the dashed close without escalation below.
// Embedded in content/books/investing-and-digital-assets/market-surveillance.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "isa", width: W });

  // Grid: four states on the main row, the two closes below.
  const w = 130,
    h = 30,
    gap = 64;
  const x0 = (W - (4 * w + 3 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 56,
    r2 = 156;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const open = st(0, r1, "open");
  const review = st(1, r1, "in_review");
  const escalated = st(2, r1, "escalated");
  const referred = st(3, r1, "case_opened", { end: true, hl: true });
  const closed = st(1, r2, "closed_no_action", { end: true, fill: 1 });
  const principalClosed = st(2, r2, "closed_by_principal", { end: true, fill: 1 });

  s.comment("The escalation path");
  s.connect(open, review, { hl: true, label: "assigned" });
  s.connect(review, escalated, { hl: true, label: "pattern\nconfirmed", side: "above" });
  s.connect(escalated, referred, { hl: true, label: "case" });

  s.comment("Closes and the loop for more data");
  s.loop(review, "t", { label: "more orders, more days" });
  s.connect(review, closed, {
    from: "b",
    to: "t",
    alt: true,
    label: "rationale\nrecorded",
    side: "right",
  });
  s.connect(escalated, principalClosed, {
    from: "b",
    to: "t",
    alt: true,
    label: "principal\ncloses",
    side: "right",
  });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 40, [
    { kind: "hl", label: "escalation to a case" },
    { kind: "alt", label: "closed with a documented reason" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
