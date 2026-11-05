// A settlement obligation from trade date to settled, failed or bought in:
// the path to settled in the accent, dashed exits for a cancel and a fail.
// Embedded in content/books/investing-and-digital-assets/clearing-and-settlement.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ist", width: W });

  // Grid: three states on the main row, the exits below.
  const w = 120,
    h = 30,
    gap = 150;
  const x0 = (W - (3 * w + 2 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 24,
    r2 = 124;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const pending = st(0, r1, "pending");
  const affirmed = st(1, r1, "affirmed");
  const settled = st(2, r1, "settled", { end: true, hl: true });
  const canceled = st(0, r2, "canceled", { end: true, fill: 1 });
  const failed = st(1, r2, "failed");
  const boughtIn = st(2, r2, "bought_in", { end: true, fill: 1 });

  s.comment("The path to settled");
  s.connect(pending, affirmed, { hl: true, label: "matched, guaranteed" });
  s.connect(affirmed, settled, { hl: true, label: "delivered at DTC" });

  s.comment("Exits and the fail detour");
  s.connect(pending, canceled, {
    from: "b",
    to: "t",
    alt: true,
    label: "busted or\nnot affirmed",
    side: "right",
  });
  s.connect(affirmed, failed, {
    from: "b",
    to: "t",
    alt: true,
    label: "short on\nsettlement date",
    side: "left",
  });
  const lx = failed.x + failed.w * 0.85,
    my = r1 + h + (r2 - r1 - h) / 2;
  s.wire([[lx, r2], [lx, my], [settled.cx, my], settled.port("b")], {
    label: "late delivery",
    side: "above",
    seg: 1,
  });
  s.loop(failed, "b", { label: "marked to market,\nre-netted daily" });
  s.connect(failed, boughtIn, { alt: true, label: "buy-in\nexecuted", side: "above" });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 70, [
    { kind: "hl", label: "the path an obligation should take" },
    { kind: "alt", label: "exit or fail" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
