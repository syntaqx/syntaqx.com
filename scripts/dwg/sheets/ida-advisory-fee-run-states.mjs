// An advisory fee run: the path from computed to posted in the accent, a
// custodian rejection that goes back to be fixed, and a refund after posting.
// Embedded in content/books/investing-and-digital-assets/advisor-platforms.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ifr", width: W });

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
  const computed = st(0, r1, "computed");
  const approved = st(1, r1, "approved");
  const submitted = st(2, r1, "submitted");
  const collected = st(3, r1, "collected");
  const posted = st(4, r1, "posted", { end: true, hl: true });
  const rejected = st(2, r2, "rejected", { fill: 1 });
  const refunded = st(4, r2, "refunded", { end: true, fill: 1 });

  s.comment("The path to a posted fee");
  s.connect(computed, approved, { hl: true });
  s.connect(approved, submitted, { hl: true });
  s.connect(submitted, collected, { hl: true });
  s.connect(collected, posted, { hl: true });

  s.comment("Exits");
  s.connect(submitted, rejected, {
    from: "b",
    to: "t",
    alt: true,
    label: "rejected by\ncustodian",
    side: "right",
  });
  s.connect(rejected, computed, {
    from: "l",
    to: "b",
    alt: true,
    label: "fix and resubmit",
    side: "below",
  });
  s.connect(posted, refunded, {
    from: "b",
    to: "t",
    alt: true,
    label: "termination\nor error",
    side: "left",
  });

  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path a fee should take" },
    { kind: "alt", label: "exception" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
