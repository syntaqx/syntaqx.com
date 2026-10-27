// The assisted rent ledger's two payers as a standard diagram: the
// certification splits rent into the tenant rent and the assistance
// payment, each posted with its own ledger party and paid by its own
// payer; delinquency runs on the resident's portion only. Embedded in
// content/books/property-tech/affordable-housing.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-a2", width: W });

  const h = 40, rowGap = 40, top = 24;
  const y1 = top, y2 = top + h + rowGap;
  const cw = 150, chw = 190, pw = 124;
  const cx = 20, chx = cx + cw + 44, px = chx + chw + 80;
  const tx = px + pw + 3 + 24;

  s.comment("The certification splits rent");
  const cert = s.node(cx, (y1 + y2 + h) / 2 - 30, cw, 60, "certification", { kind: "store", sub: ["tenant rent and", "assistance computed"] });
  const res = s.node(chx, y1, chw, h, "tenant rent", { kind: "store", hl: true });
  s.note(res, "ledger_party = 'resident'", { cls: "tc", dy: 16 });
  const sub = s.node(chx, y2, chw, h, "assistance payment", { kind: "store" });
  s.note(sub, "ledger_party = 'subsidy'", { cls: "tc", dy: 16 });
  s.fanOut(cert, [res, sub], { hl: 0 });

  s.comment("Two payers");
  const hh = s.node(px, y1, pw, h, "household", { kind: "actor" });
  const ag = s.node(px, y2, pw, h, "agency", { kind: "actor", sub: "HUD or authority" });
  s.connect(hh, res, { from: "l", to: "r", hl: true, label: "pays", side: "above" });
  s.connect(ag, sub, { from: "l", to: "r", label: "HAP voucher", side: "above", labelCls: "tc" });

  s.comment("What runs on each portion");
  s.text(tx, res.cy - 2, "late fees, notices,", "sl hl");
  s.text(tx, res.cy + 10, "eviction: only here", "sl hl");
  s.text(tx, sub.cy - 2, "reconciled against", "sl");
  s.text(tx, sub.cy + 10, "what was paid", "sl");

  s.height = Math.ceil(Math.max(sub.y2 + 16, cert.y2) + 20);
  return s.toString();
}
