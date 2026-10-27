// The guarantee case lifecycle as a standard diagram: the six steps
// (contact, wait, escalate, decide, remedy, appeal) over the case's states,
// the remedy into closed in the accent, the appeal back to review, and a
// dashed exit when a chargeback supersedes the case. Embedded in
// content/books/user-generated-platforms/cancellations-and-disputes.md.
import { sheet } from "../kit.mjs";

const STEPS = ["1 · contact", "2 · wait", "3 · escalate", "4 · decide", "5 · remedy"];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-cd", width: W });

  const w = 120, h = 30, gap = (W - 40 - 5 * w) / 4;
  const X = (i) => 20 + i * (w + gap);
  const r1 = 44, r2 = 154;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("Steps over the main row");
  STEPS.forEach((t, i) => s.text(X(i) + w / 2, r1 - 12, t, i === 4 ? "sl hl" : "sl", "middle"));

  s.comment("States");
  const opened = st(0, r1, "opened");
  const awaiting = st(1, r1, "awaiting_respondent");
  const escalated = st(2, r1, "escalated");
  const review = st(3, r1, "in_review");
  const decided = st(4, r1, "decided");
  const appealed = st(3, r2, "appealed");
  // closed is narrower and flush right, so the appeal drops past its left side
  const cw = 80;
  const closed = s.node(X(4) + w - cw, r2, cw, h, "closed", { kind: "state", code: true, end: true, hl: true });
  const supW = 160;
  const superseded = s.node((awaiting.cx + escalated.cx) / 2 - supW / 2, r2, supW, h, "superseded_by_chargeback", { kind: "state", code: true, end: true, fill: 1 });

  s.comment("The main row");
  for (const [a, b] of [[opened, awaiting], [awaiting, escalated], [escalated, review], [review, decided]]) s.connect(a, b);

  s.comment("Remedy and appeal");
  const rx = decided.x + w * 0.75;
  s.wire([[rx, r1 + h], [rx, r2]], { hl: true, label: "remedy", side: "left" });
  s.wire([decided.port("b", 0.12), [decided.x + w * 0.12, appealed.cy], appealed.port("r")], { label: "6 · appeal", side: "left", seg: 0 });
  s.connect(appealed, review, { from: "t", to: "b", label: "second\ndecision", side: "left" });

  s.comment("One remedy: a chargeback takes over");
  s.fanIn([awaiting, escalated], superseded, { from: "b", to: "t", alt: true, label: "chargeback on the payment", side: "right" });

  s.comment("Notes");
  s.note(closed, "refund, partial refund, return and\nrefund, rebooking or denial", { anchor: "right" });
  const ny = s.note(superseded, "the dispute process\ntakes the case's evidence", { anchor: "center" });

  s.comment("Legend");
  const lg = s.legend(20, ny + 28, [
    { kind: "hl", label: "remedy applied" },
    { kind: "alt", label: "superseded" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
