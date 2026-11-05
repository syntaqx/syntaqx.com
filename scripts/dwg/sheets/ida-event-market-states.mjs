// An event contract market from listing to settlement: the path to a settled
// market in the accent, a dashed withdrawal before trading, and a dashed
// re-determination loop when the resolution source is revised.
// Embedded in content/books/investing-and-digital-assets/prediction-markets.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "iem", width: W });

  // Grid: five states on the main row, the withdrawal below.
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
  const listed = st(0, r1, "listed");
  const open = st(1, r1, "open");
  const closed = st(2, r1, "closed");
  const determined = st(3, r1, "determined");
  const settled = st(4, r1, "settled", { end: true, hl: true });
  const withdrawn = st(0, r2, "withdrawn", { end: true, fill: 1 });

  s.comment("The path to a settled market");
  s.connect(listed, open, { hl: true });
  s.connect(open, closed, { hl: true });
  s.connect(closed, determined, { hl: true });
  s.connect(determined, settled, { hl: true });

  s.comment("Withdrawal before trading");
  s.connect(listed, withdrawn, {
    from: "b",
    to: "t",
    alt: true,
    label: "stay or 40.11 review",
    side: "right",
  });

  s.comment("Re-determination loop over the top");
  s.connect(determined, closed, {
    from: "t",
    to: "t",
    via: r1 - 26,
    alt: true,
    label: "source revised: re-determine",
    side: "above",
    seg: 1,
  });

  s.comment("Legend");
  const lg = s.legend(X(1), r2 + 6, [
    { kind: "hl", label: "the path a market should take" },
    { kind: "alt", label: "withdrawal or revision" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(Math.max(lg.y, r2 + h) + 20);
  return s.toString();
}
