// The self-storage lien sequence every state act prescribes, with the
// military-service check before advertising and redemption stopping it.
// Embedded in content/books/property-tech/self-storage.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, h = 44, gap = 24;
  const s = sheet({ prefix: "pt-ssl", width: W });

  s.comment("Row 1: default to lien");
  const r1 = 20;
  const row1 = s.row(20, r1, 720, [
    { label: "default", sub: "rent unpaid" },
    { label: "deny access", sub: "gate, overlock" },
    { label: "first notice", sub: "preliminary lien" },
    { label: "cure period", sub: "time to pay" },
    { label: "lien attaches" },
  ], { h, gap, arrows: true });

  s.comment("Row 2: sale");
  const r2 = r1 + h + 56;
  const nw = (720 - 4 * gap) / 5;
  const X = (i) => 20 + i * (nw + gap);
  const sale1 = s.node(X(0), r2, nw, h, "notice of sale", { sub: "delivery evidence" });
  const check = s.node(X(1) + 6, r2 - 8, nw - 12, h + 16, "in service?", { kind: "decision", hl: true });
  const adv = s.node(X(2), r2, nw, h, "advertise", { sub: "proof of publication" });
  const sale = s.node(X(3), r2, nw, h, "sale", { sub: "often online" });
  const surplus = s.node(X(4), r2, nw, h, "surplus", { kind: "store", sub: "owed to occupant" });
  const last = row1.at(-1);
  const my = r1 + h + 28;
  s.wire([last.port("b"), [last.cx, my], [sale1.cx, my], sale1.port("t")]);
  s.connect(sale1, check);
  s.connect(check, adv, { label: "no", side: "above" });
  s.connect(adv, sale);
  s.connect(sale, surplus);

  s.comment("Exits");
  const r3 = r2 + h + 56;
  const court = s.node(X(1), r3, nw, h, "court order", { sub: "or hold" });
  const redeemed = s.node(X(3) - nw / 2 - gap / 2, r3, nw * 2 + gap, h + 8, "redeemed", { end: true, sub: ["cancel listing, restore access,", "remove overlock: one outcome"] });
  s.connect(check, court, { from: "b", to: "t", hl: true, label: "yes: SCRA", side: "right" });
  s.wire([[sale.x + 14, sale.y2], [sale.x + 14, redeemed.y]], { alt: true, label: "paid in full\nbefore the sale", side: "left" });

  s.height = Math.ceil(redeemed.y2 + 20);
  return s.toString();
}
