// Funds flow for a payment provider as a standard diagram: card and ACH
// roads into the sponsor bank, then the account held for merchants, then
// payouts and fees; the account's ledger as a T-account. Embedded in
// content/books/payments/comparing-the-rails.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, h = 28;
  const s = sheet({ prefix: "ff", width: W });

  // Columns left to right; rows: card road, sponsor bank between, ACH road.
  const c1 = 70, c2 = 206, c3 = 350, c4 = 530, nw = 106;
  const yCard = 28, ySpon = 82, yAch = 136, yOut = 200;

  s.comment("Roads in");
  s.text(20, yCard + h / 2 + 3.5, "card", "lt");
  s.text(20, yAch + h / 2 + 3.5, "ach", "lt");
  const issuer = s.node(c1, yCard, nw, h, "issuer");
  const network = s.node(c2, yCard, nw, h, "network");
  const payer = s.node(c1, yAch, nw, h, "payer's bank");
  const operator = s.node(c2, yAch, nw, h, "ACH operator");
  const sponsor = s.node(c3, ySpon - 4, 130, h + 8, "sponsor bank", { sub: "acquirer and ODFI" });
  s.connect(issuer, network);
  s.connect(payer, operator);
  s.connect(network, sponsor, { at: [0.5, 0.3] });
  s.connect(operator, sponsor, { at: [0.5, 0.7] });

  s.comment("Held for merchants");
  const fbo = s.node(c4, ySpon - 4, W - 20 - c4, h + 8, "FBO account", { kind: "store", hl: true, sub: "held for merchants" });
  s.connect(sponsor, fbo, { hl: true });

  s.comment("Out: payouts and fees");
  const banks = s.node(c4, yOut, 120, h, "merchant banks");
  const operating = s.node(W - 20 - 84, yOut, 84, h, "operating", { kind: "ghost" });
  // Two parallel drops this close leave no room for side labels: name them
  // under their targets instead.
  s.wire([[banks.cx, fbo.y + fbo.h], banks.port("t")], { hl: true });
  s.wire([[operating.cx, fbo.y + fbo.h], operating.port("t")], { alt: true });
  s.text(banks.cx, yOut + h + 16, "payouts", "sl hl", "middle");
  s.text(operating.cx, yOut + h + 16, "earned fees", "sl", "middle");

  s.comment("The ledger");
  const t = s.tAccount(c1, yOut + 2, 330, "Ledger · who owns what", ["card settlement", "ACH debits"], ["payouts to merchants", "earned fees to operating"]);

  s.height = Math.ceil(Math.max(t.y, yOut + h + 16) + 24);
  return s.toString();
}
