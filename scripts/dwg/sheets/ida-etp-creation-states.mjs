// One ETP creation order: the path from received to issued in the accent,
// a dashed exit to rejected before acceptance and to canceled when the trust
// can't complete the trade by settlement.
// Embedded in content/books/investing-and-digital-assets/crypto-etps.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "iec", width: W });

  const w = 112,
    h = 30,
    gap = 30;
  const x0 = (W - (5 * w + 4 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 40,
    r2 = 140;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const received = st(0, r1, "received");
  const accepted = st(1, r1, "accepted");
  const priced = st(2, r1, "priced");
  const delivered = st(3, r1, "delivered");
  const issued = st(4, r1, "issued", { end: true, hl: true });
  const rejected = st(0, r2, "rejected", { end: true, fill: 1 });
  const canceled = st(3, r2, "canceled", { end: true, fill: 1 });

  s.comment("The path to issued shares");
  s.connect(received, accepted, { hl: true });
  s.connect(accepted, priced, { hl: true });
  s.connect(priced, delivered, { hl: true });
  s.connect(delivered, issued, { hl: true });

  s.comment("Exits");
  s.connect(received, rejected, {
    from: "b",
    to: "t",
    alt: true,
    label: "after cutoff\nor incomplete",
    side: "right",
  });
  s.connect(delivered, canceled, {
    from: "b",
    to: "t",
    alt: true,
    label: "trade not done by\nsettlement: AP cancels",
    side: "right",
  });

  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path an order should take" },
    { kind: "alt", label: "ends it early" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
