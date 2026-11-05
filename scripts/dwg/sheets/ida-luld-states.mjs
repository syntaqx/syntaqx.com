// One NMS stock under the Limit Up-Limit Down plan: trading, the limit state,
// the five-minute pause and the reopening, with the path into a pause accented.
// Embedded in content/books/investing-and-digital-assets/pre-trade-risk-and-halts.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ilu", width: W });

  // Grid: four states in one row, back edges above and below.
  const w = 120,
    h = 30,
    gap = 80;
  const x0 = (W - (4 * w + 3 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 64;
  const st = (i, label, o = {}) =>
    s.node(X(i), r1, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const trading = st(0, "trading");
  const limit = st(1, "limit_state");
  const paused = st(2, "paused", { hl: true });
  const reopening = st(3, "reopening");

  s.comment("Into a pause");
  s.connect(trading, limit, { label: "at the\nband", side: "below" });
  s.connect(limit, paused, { hl: true, label: "15 s,\nno exit", side: "below" });
  s.connect(paused, reopening, { label: "5 min", side: "below" });

  s.comment("Back to trading");
  s.connect(limit, trading, {
    from: "t",
    to: "t",
    via: r1 - 30,
    label: "exits within 15 s",
    side: "above",
    seg: 1,
  });
  s.connect(reopening, trading, {
    from: "b",
    to: "b",
    via: r1 + h + 40,
    label: "reopening auction prints",
    side: "below",
    seg: 1,
  });

  s.comment("Legend");
  const lg = s.legend(x0, r1 + h + 90, [
    { kind: "hl", label: "the pause" },
    { kind: "state", label: "state of one stock" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
