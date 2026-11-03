// A business workflow as a state machine: an approval step with a deadline
// that escalates, fulfillment steps, and compensation when a step fails after
// others succeeded. Embedded in content/docs/building-blocks/workflows.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "wf", width: W });

  const w = 108,
    h = 30,
    gap = 58;
  const x0 = Math.round((W - (4 * w + 3 * gap)) / 2);
  const X = (i) => x0 + i * (w + gap);
  const r1 = 64,
    r2 = 144;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const submitted = st(0, r1, "submitted");
  const review = st(1, r1, "in_review");
  const fulfilling = st(2, r1, "fulfilling");
  const completed = st(3, r1, "completed", { end: true, hl: true });
  const rejected = st(1, r2, "rejected", { end: true, fill: 1 });
  const compensating = st(2, r2, "compensating");
  const reversed = st(3, r2, "reversed", { end: true, fill: 1 });

  s.comment("The path it should take");
  s.connect(submitted, review, { hl: true, label: "assigned" });
  s.connect(review, fulfilling, { hl: true, label: "approved" });
  s.connect(fulfilling, completed, { hl: true, label: "all steps\ndone" });

  s.comment("Deadline on the human step");
  s.loop(review, "t", { label: "deadline passed:\nremind, escalate" });

  s.comment("Exits and compensation");
  s.connect(review, rejected, { from: "b", to: "t", alt: true, label: "rejected", side: "left" });
  s.connect(fulfilling, compensating, {
    from: "b",
    to: "t",
    alt: true,
    label: "step failed",
    side: "right",
  });
  s.connect(compensating, reversed, { alt: true, label: "undone" });

  s.comment("Legend");
  const lg = s.legend(X(0), r2 + h + 34, [
    { kind: "hl", label: "the path it should take" },
    { kind: "alt", label: "rejection or compensation" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
