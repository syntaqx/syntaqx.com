// A Travel Rule Protocol exchange for one withdrawal: identity, inquiry,
// resolution, the on-chain broadcast in the accent, then the confirmation.
// Embedded in content/books/investing-and-digital-assets/crypto-aml-and-travel-rule.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760,
    x = 20;
  const s = sheet({ prefix: "itr", width: W });
  const cw = (W - 2 * x) / 3;
  const CX = (i) => x + (i + 0.5) * cw;
  const [CHAIN, ORIG, BEN] = [CX(0), CX(1), CX(2)];
  const aw = 170,
    ah = 28,
    top = 20,
    step = 36;
  const Y = (i) => top + ah + 30 + i * step; // message rows
  const LL = [CHAIN, ORIG, BEN];

  s.comment("Lifelines");
  s.line(CHAIN, top + ah, CHAIN, Y(6), "ctr");
  s.line(ORIG, top + ah, ORIG, Y(7), "ctr");
  s.line(BEN, top + ah, BEN, Y(7), "ctr");

  s.comment("Parties");
  s.node(CHAIN - aw / 2, top, aw, ah, "the chain", { kind: "actor" });
  s.node(ORIG - aw / 2, top, aw, ah, "originating exchange");
  s.node(BEN - aw / 2, top, aw, ah, "beneficiary exchange", { kind: "actor" });

  const msg = (a, b, y, label, { hl = false, code = false } = {}) =>
    s.message(a, b, y, label, { hl, labelCls: code ? "tc" : "sl", lifelines: LL });

  s.comment("1. Who is the counterparty");
  msg(ORIG, BEN, Y(0), "GET /identity", { code: true });
  msg(BEN, ORIG, Y(1), "name, LEI, certificate");

  s.comment("2. The data, before the value");
  msg(ORIG, BEN, Y(2), "transfer inquiry + IVMS101");
  msg(BEN, ORIG, Y(3), "approved: address, callback");

  s.comment("3. The value moves");
  msg(ORIG, CHAIN, Y(4), "broadcast to approved address", { hl: true });
  msg(CHAIN, ORIG, Y(5), "confirmed");

  s.comment("4. Close the loop");
  msg(ORIG, BEN, Y(6), "confirmation: txid");

  const ny = Y(7) + 20;
  s.text(ORIG, ny, "nothing goes on chain until the counterparty approves", "vs", "middle");
  s.height = Math.ceil(ny + 18);
  return s.toString();
}
