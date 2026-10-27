// The recurring billing run as a standard diagram: what comes due (plan,
// period, draft, tax quote), then what gets collected (finalize, autopay,
// apply, accounting sync), with the no-payment-method exit. Embedded in
// content/books/field-operations/billing-recurring-service.md.
import { sheet } from "../kit.mjs";

const DUE = ["billing plan", "period comes due", "draft invoice", "tax quote"];
const COLLECT = [
  { label: "finalize", sub: "numbered, then locked", hl: true },
  { label: "autopay charge" },
  { label: "apply payment", sub: "balance, then aging" },
  { label: "accounting sync", sub: "journal or detail" },
];

export default function draw() {
  const W = 760, w = 150, h = 28, gap = (W - 40 - 4 * w) / 3;
  const s = sheet({ prefix: "fo-brs", width: W });
  const X = (i) => 20 + i * (w + gap);
  const y1 = 40, y2 = 112;

  s.comment("What comes due");
  s.text(20, y1 - 12, "what comes due", "lt");
  const due = DUE.map((l, i) => s.node(X(i), y1, w, h, l));
  due.slice(1).forEach((n, i) => s.connect(due[i], n, { hl: true }));

  s.comment("Down to the collection row");
  const my = (y1 + h + y2) / 2;
  const last = due.at(-1);

  s.comment("What gets collected");
  const col = COLLECT.map((c, i) => s.node(X(i), y2, w, h, c.label, { hl: c.hl }));
  s.wire([last.port("b"), [last.cx, my], [col[0].cx, my], col[0].port("t")], { hl: true });
  col.slice(1).forEach((n, i) => s.connect(col[i], n, { hl: true }));
  const subY = y2 + h + 16;
  COLLECT.forEach((c, i) => c.sub && s.text(col[i].cx, subY, c.sub, c.hl ? "sl hl" : "sl", "middle"));

  s.comment("No payment method on file");
  const auto = col[1];
  const link = s.node(auto.x, subY + 26, w, h, "send payment link", { kind: "ghost" });
  s.wire([auto.port("b"), link.port("t")], { alt: true, label: "no method on file", side: "right" });

  s.height = Math.ceil(link.y + h + 20);
  return s.toString();
}
