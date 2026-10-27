// The life of a unit as a state cycle: vacant, leased, occupied, on notice,
// turn and back, with down or off-market beside it. Embedded in
// content/books/property-tech/property-business.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-puc", width: W });

  const w = 128, h = 40, cols = 4;
  const gap = (W - 40 - cols * w) / (cols - 1);
  const X = (i) => 20 + i * (w + gap);
  const r0 = 20, r1 = r0 + h + 64, r2 = r1 + h + 64;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", ...o });

  s.comment("States");
  const down = st(0, r0, "down or\noff market", { fill: 1 });
  const vnl = st(0, r1, "vacant,\nnot leased");
  const vl = st(1, r1, "vacant,\nleased");
  const occ = st(2, r1, "occupied");
  const notice = st(3, r1, "on notice", { sub: "can be pre-leased" });
  const turn = st(3, r2, "turn", { sub: "inspect, deposit,\nmake-ready" });

  s.comment("The cycle");
  s.connect(vnl, vl, { hl: true, label: "lease\nsigned", side: "above" });
  s.connect(vl, occ, { hl: true, label: "move-in", side: "above" });
  s.connect(occ, notice, { hl: true, label: "notice", side: "above" });
  s.connect(notice, turn, { from: "b", to: "t", hl: true, label: "move-out", side: "right" });
  s.connect(turn, vnl, { from: "l", to: "b", at: [0.7, 0.5], hl: true, label: "ready, not yet leased", side: "below" });
  s.connect(turn, vl, { from: "l", to: "b", at: [0.3, 0.5], label: "ready, pre-leased", side: "above" });

  s.comment("Off the market");
  s.connect(vnl, down, { from: "t", to: "b", arrow: "both", label: "renovation, damage,\nmodel or office;\nback on the market", side: "right" });

  s.comment("Legend");
  const lg = s.legend(X(1), r0 + 14, [
    { kind: "hl", label: "the cycle a unit repeats" },
    { kind: "flow", label: "pre-leased or off the market" },
  ]);
  s.height = Math.ceil(Math.max(lg.y, turn.y2) + 20);
  return s.toString();
}
