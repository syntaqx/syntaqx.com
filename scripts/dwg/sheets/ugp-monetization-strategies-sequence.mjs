// The typical order in which platforms add revenue models, as two
// pipelines in lanes: an attention platform from unmonetized through
// advertising to commerce and licensing, an inventory platform from the
// take rate to float (dashed: a consequence, never a reason). Embedded in
// content/books/user-generated-platforms/monetization-strategies.md.
import { sheet } from "../kit.mjs";

const ATTENTION = [
  { label: "unmonetized", sub: ["until engagement", "is proven"] },
  { head: "foundation", label: "advertising", sub: ["rented first, at", "scale in high-ARPU", "regions"] },
  { label: "premium tier", sub: ["for the most", "engaged users"] },
  { label: "creator money", sub: ["revenue share and", "fan payments"] },
  { label: "commerce,\nlicensing", sub: ["last, when the", "corpus is worth", "buying"] },
];

const INVENTORY = [
  { head: "foundation", label: "take rate", sub: ["from the first", "transaction, one", "side, all-in price"] },
  { label: "protection", sub: ["and deposits,", "once inventory", "is valuable"] },
  { label: "seller ads", sub: ["when search has", "more supply than", "top slots"] },
  { label: "seller plans", sub: ["for professional", "sellers"] },
  { label: "float", kind: "ghost", sub: ["a consequence", "of payout timing,", "never a reason"] },
];

export default function draw() {
  const W = 760, titleW = 130, gap = 16, h = 36;
  const s = sheet({ prefix: "ugp-ms", width: W });
  const laneH = 128;

  s.comment("Lanes");
  const [A, I] = s.lanes({ x: 20, y: 20, w: W - 40, titleW, lanes: [
    { label: "attention", sub: "posts, videos,\nstreams", h: laneH },
    { label: "inventory", sub: "listings,\nbookings", h: laneH },
  ] });

  s.comment("One sequence per lane");
  const w = (W - 20 - A.x0 - 4 * gap) / 5;
  s.pipeline(A.x0, A.y0 + 32, ATTENTION, { w, h, gap });
  s.pipeline(I.x0, I.y0 + 32, INVENTORY, { w, h, gap });

  s.comment("Legend");
  const lg = s.legend(20, I.y + I.h + 24, [
    { kind: "node", label: "model added, in order" },
    { kind: "ghost", label: "follows from the others" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
