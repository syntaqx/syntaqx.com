// Reservation risk scoring as a standard diagram: five checkpoints along a
// booking's life feed one decision record, late labels join it back, and
// the outcomes restrict rather than only block. Embedded in
// content/books/user-generated-platforms/marketplace-fraud.md.
import { sheet } from "../kit.mjs";

const CHECKPOINTS = [
  { label: "booking request", head: "before the host sees it" },
  { label: "confirmation" },
  { label: "before the trip", head: "new driver, failing card" },
  { label: "payout release" },
  { label: "claim" },
];

export default function draw() {
  const W = 760, gap = 16, h = 30;
  const w = (W - 40 - 4 * gap) / 5;
  const s = sheet({ prefix: "ugp-mf", width: W });

  s.comment("Checkpoints along the booking");
  const { nodes } = s.pipeline(20, 40, CHECKPOINTS, { w, h, gap });

  s.comment("One decision record");
  const rw = 170, ry = 148, sw = 210;
  // the outcomes box sets the row's height
  const out = s.node(W - 20 - sw, ry, sw, null, "restrict, not only block", { sub: ["higher deposit, second driver,", "protection tier, host approval,", "shorter booking window"] });
  const rec = s.node(W / 2 - rw / 2, ry, rw, out.h, "risk_decisions", { kind: "store", code: true, hl: true, sub: "inputs, versions, outcome" });
  s.fanIn(nodes, rec, { from: "b", to: "t", via: (40 + h + ry) / 2, hl: true, label: "score", side: "right" });

  s.comment("Late labels and outcomes");
  const late = s.node(20, ry, sw - 40, out.h, "late labels", { kind: "ghost", sub: ["a claim weeks later,", "a chargeback", "months later"] });
  s.connect(late, rec, { label: "joined\nback", side: "above" });
  s.connect(rec, out);

  s.height = Math.ceil(Math.max(out.y2, rec.y2, late.y2) + 20);
  return s.toString();
}
