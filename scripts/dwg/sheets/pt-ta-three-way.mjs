// Three-way reconciliation of a trust account: the adjusted bank balance,
// the book balance and the beneficiary total must agree with no negative
// beneficiary; a difference blocks money out. Embedded in
// content/books/property-tech/trust-accounting.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-ta3", width: W });

  s.comment("The three numbers");
  const top = 40;
  const legs = s.row(20, top, W - 40, [
    { label: "1 · adjusted bank balance", sub: ["statement, plus deposits in transit,", "less outstanding checks"] },
    { label: "2 · book balance", sub: ["the trust account's cash", "in the ledger"] },
    { label: "3 · beneficiary total", sub: ["every owner, resident and", "other balance, as of the date"] },
  ], { h: 54, gap: 40, kind: "store" });
  s.text(legs[0].cx, top - 10, "matched line by line", "sl", "middle");
  s.text(legs[1].cx, top - 10, "from the ledger", "sl", "middle");
  s.text(legs[2].cx, top - 10, "a query, not an export", "sl", "middle");

  s.comment("The test");
  const dw = 220, dh = 70, dy = legs.bottom + 50;
  const test = s.node(W / 2 - dw / 2, dy, dw, dh, "1 = 2 = 3, and no\nnegative beneficiary?", { kind: "decision" });
  s.fanIn(legs, test, { from: "b", to: "t", via: legs.bottom + 24 });

  s.comment("Outcomes");
  const ow = 190, oh = 44;
  const ok = s.node(W - 20 - ow, test.cy - oh / 2, ow, oh, "signed reconciliation", { kind: "store", hl: true, sub: "preparer, reviewer, evidence" });
  const brk = s.node(20, test.cy - oh / 2, ow, oh, "break", { sub: "an owner and a deadline" });
  s.connect(test, ok, { hl: true, label: "yes", side: "above" });
  s.connect(test, brk, { from: "l", to: "r", alt: true, label: "no", side: "above" });

  const ry = ok.y2 + 40;
  const out = s.node(ok.x, ry, ow, 48, "money out allowed", { sub: "distributions, payments" });
  const held = s.node(brk.x, ry, ow, 48, "money out blocked", { fill: 1, sub: ["until the difference", "is explained"] });
  s.connect(ok, out, { from: "b", to: "t", hl: true });
  s.connect(brk, held, { from: "b", to: "t", alt: true });

  s.height = Math.ceil(Math.max(out.y2, test.y2) + 20);
  return s.toString();
}
