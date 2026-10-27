// A priced estimate's states: inside the rep's band it goes straight to
// presented, below it waits for approval; presented ends accepted, declined
// or expired, and any edit re-prices. Embedded in
// content/books/field-operations/pricing-and-sales-rules.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, x = 20, w = 128, h = 28, gap = (W - 2 * x - 5 * w) / 4;
  const X = (i) => x + i * (w + gap);
  const s = sheet({ prefix: "fo-psa", width: W });
  const r1 = 66, r2 = r1 + 96, step = 40;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", ...o });

  s.comment("States");
  const draft = st(0, r1, "draft");
  const priced = st(1, r1, "priced");
  const presented = st(3, r1, "presented");
  const pending = st(1, r2, "pending approval", { fill: 1 });
  const approved = st(2, r2, "approved");
  const accepted = st(4, r1 - step, "accepted", { end: true, hl: true });
  const declined = st(4, r1, "declined", { end: true, fill: 1 });
  const expired = st(4, r1 + step, "expired", { end: true, fill: 1 });

  s.comment("Pricing");
  s.connect(draft, priced, { hl: true });
  s.connect(priced, presented, { hl: true, label: "inside band" });
  s.connect(priced, pending, { from: "b", to: "t", label: "below band", side: "right" });
  s.connect(pending, approved);
  s.connect(approved, presented, { from: "r", to: "b" });
  s.connect(pending, draft, { from: "l", to: "b", alt: true, label: "rejected", side: "below" });
  s.connect(presented, priced, { from: "t", to: "t", via: r1 - 26, alt: true, label: "any edit re-prices", side: "above" });

  s.comment("Outcomes");
  const mx = (presented.x + w + accepted.x) / 2;
  s.connect(presented, accepted, { via: mx, hl: true });
  s.connect(presented, declined);
  s.connect(presented, expired, { via: mx });

  const lg = s.legend(x, r2 + h + 34, [
    { kind: "hl", label: "the path to a sale" },
    { kind: "alt", label: "back to an earlier state" },
    { kind: "end", label: "final" },
  ]);
  const fy = lg.y + 20;
  s.text(x, fy, "an approval binds to a hash of the priced estimate; any change voids it", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
