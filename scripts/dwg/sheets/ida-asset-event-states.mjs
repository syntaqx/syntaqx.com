// An asset event (corporate action or chain event) on the platform's side:
// the path to a reconciled event in the accent, dashed cancellations, and a
// dashed revision loop that reverses the posting and runs the event again.
// Embedded in content/books/investing-and-digital-assets/corporate-actions.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "iae", width: W });

  // Grid: five states on the main row, the cancellation below.
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
  const announced = st(0, r1, "announced");
  const confirmed = st(1, r1, "confirmed");
  const entitled = st(2, r1, "entitled");
  const processed = st(3, r1, "processed");
  const reconciled = st(4, r1, "reconciled", { end: true, hl: true });
  const canceled = st(1, r2, "canceled", { end: true, fill: 1 });

  s.comment("The path to a reconciled event");
  s.connect(announced, confirmed, { hl: true });
  s.connect(confirmed, entitled, { hl: true });
  s.connect(entitled, processed, { hl: true });
  s.connect(processed, reconciled, { hl: true });

  s.comment("Cancellations");
  s.connect(announced, canceled, {
    from: "b",
    to: "l",
    alt: true,
    label: "withdrawn",
    side: "left",
  });
  s.connect(confirmed, canceled, {
    from: "b",
    to: "t",
    alt: true,
    label: "terminated",
    side: "right",
  });

  s.comment("Revision loop over the top");
  s.connect(processed, confirmed, {
    from: "t",
    to: "t",
    via: r1 - 26,
    alt: true,
    label: "revised terms: reverse, recompute",
    side: "above",
    seg: 1,
  });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path an event should take" },
    { kind: "alt", label: "cancellation or revision" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
