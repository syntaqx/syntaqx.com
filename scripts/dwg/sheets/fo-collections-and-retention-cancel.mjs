// The cancellation flow as a standard diagram: request, optional reason, a
// skippable save offer, confirmation and the final bill; an accepted offer
// drops out and is logged. Embedded in
// content/books/field-operations/collections-and-retention.md.
import { sheet } from "../kit.mjs";

const STEPS = [
  { label: "cancel request" },
  { label: "reason, optional" },
  { label: "save offer", sub: "one click declines" },
  { label: "cancel confirmed", sub: "effective date set", hl: true },
  { label: "final bill, notice", sub: "future visits removed", hl: true },
];

export default function draw() {
  const W = 760, n = STEPS.length, w = 128, h = 28, gap = (W - 40 - n * w) / (n - 1);
  const s = sheet({ prefix: "fo-carc", width: W });
  const X = (i) => 20 + i * (w + gap);
  const y = 42;

  s.comment("Any channel the customer signed up through");
  s.text(20, y - 14, "any channel the customer signed up through", "lt");

  s.comment("The cancel path");
  const nodes = STEPS.map((st, i) => s.node(X(i), y, w, h, st.label, { hl: st.hl, fill: i === 2 ? 1 : undefined }));
  nodes.slice(1).forEach((nd, i) => s.connect(nodes[i], nd, { hl: STEPS[i].hl && STEPS[i + 1].hl }));
  const subY = y + h + 16;
  STEPS.forEach((st, i) => st.sub && s.text(nodes[i].cx, subY, st.sub, st.hl ? "sl hl" : "sl", "middle"));

  s.comment("Offer accepted");
  const offer = nodes[2];
  const acc = s.node(offer.x, subY + 34, w, h, "offer accepted", { kind: "ghost" });
  s.wire([[offer.cx, subY + 6], acc.port("t")], { alt: true });
  const ny = acc.y + h + 16;
  s.text(acc.cx, ny, "save logged with the offer, request closed", "sl", "middle");

  s.height = Math.ceil(ny + 20);
  return s.toString();
}
