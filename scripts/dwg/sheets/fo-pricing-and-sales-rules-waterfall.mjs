// The field service price waterfall: cost and markup to pricebook, member,
// promotion and the rep's discount, an approval branch below the band, then
// the net price, tax and financing. Embedded in
// content/books/field-operations/pricing-and-sales-rules.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "margin matrix", label: "cost, markup" },
  { head: "versioned", label: "pricebook" },
  { head: "or contracted", label: "member" },
  { head: "scoped, dated", label: "promotion" },
  { head: "inside band", label: "rep discount" },
  { head: "final checks last", label: "net price", hl: true },
];

export default function draw() {
  const W = 760, x = 20, w = 106, h = 28, gap = (W - 2 * x - STAGES.length * w) / (STAGES.length - 1);
  const s = sheet({ prefix: "fo-psw", width: W });
  const y0 = 40, rowH = 50;

  s.comment("The waterfall");
  const { nodes } = s.pipeline(x, y0, STAGES, { w, h, gap });
  const rep = nodes[4], net = nodes[5];

  s.comment("Approval below the band");
  const approval = s.node(rep.x, y0 + rowH, w, h, "approval", { fill: 1 });
  s.connect(rep, approval, { from: "b", to: "t", label: "below band", side: "left" });
  s.connect(approval, net, { from: "r", to: "b", at: [0.5, 0.2] });

  s.comment("Tax, then financing");
  const tax = s.node(net.x, y0 + 2 * rowH, w, h, "tax");
  const fin = s.node(net.x, y0 + 3 * rowH, w, h, "financing");
  s.wire([net.port("b", 0.7), [net.x + 0.7 * w, tax.y]], { hl: true });
  s.wire([[net.x + 0.7 * w, tax.y + h], [net.x + 0.7 * w, fin.y]], { hl: true });

  s.comment("Notes");
  s.text(x, approval.cy + 3, "each step records its rule and adjustment", "sl");
  s.text(tax.x - 14, tax.cy + 3, "tax by item code and service location", "sl", "end");
  s.text(fin.x - 14, fin.cy + 3, "financing: the lender's payment, with its disclosure", "sl", "end");
  s.height = Math.ceil(fin.y + h + 20);
  return s.toString();
}
