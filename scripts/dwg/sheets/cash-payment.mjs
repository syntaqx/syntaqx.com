// A retail cash payment as a sequence, top to bottom in time: the store's
// register asks the network, the network asks the platform, and the
// network's confirmation (the accent) is what the platform posts on.
// Embedded in content/books/payments/cash-payments.md.
import { sheet } from "../kit.mjs";

const PARTIES = [
  ["payer", "actor"],
  ["store register", "actor"],
  ["network", "actor"],
  ["platform", "process"],
];

export default function draw() {
  const W = 760, x = 20, nh = 28, nw = 130, step = 32;
  const s = sheet({ prefix: "cash", width: W });
  const cw = (W - 2 * x) / PARTIES.length;
  const CX = (i) => x + (i + 0.5) * cw;
  const [PAYER, REG, NET, PLAT] = PARTIES.map((_, i) => CX(i));
  const top = 20;
  const Y = (i) => top + nh + 34 + i * step;
  const end = Y(4) + 18;

  s.comment("Lifelines");
  for (const cx of [PAYER, REG]) s.line(cx, top + nh, cx, Y(cx === PAYER ? 0 : 1), "ctr");
  for (const cx of [NET, PLAT]) s.line(cx, top + nh, cx, end, "ctr");

  s.comment("Parties");
  PARTIES.forEach(([name, kind], i) => s.node(CX(i) - nw / 2, top, nw, nh, name, { kind }));

  s.comment("Messages, in seconds");
  s.wire([[PAYER, Y(0)], [REG, Y(0)]], { start: "dot", label: "barcode and cash" });
  s.wire([[REG, Y(1)], [NET, Y(1)]], { start: "dot", label: "authorize" });
  s.wire([[NET, Y(2)], [PLAT, Y(2)]], { start: "dot", label: "validate account and amount" });
  s.wire([[PLAT, Y(3)], [NET, Y(3)]], { start: "dot", label: "accept, within the deadline" });
  s.wire([[NET, Y(4)], [PLAT, Y(4)]], { start: "dot", hl: true, label: "confirmed: post it" });

  const fy = end + 22;
  s.text(W - x, fy, "all of this in seconds; settlement, net of fees, follows days later", "sl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
