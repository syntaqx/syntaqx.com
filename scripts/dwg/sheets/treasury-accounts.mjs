// The accounts a payment provider runs at its sponsor bank and the daily
// moves between them: settlement in, payouts out, reserve held back, fees
// swept, prefunding when payouts lead settlement. A standard money flow.
// Embedded in content/books/payments/treasury.md.
import { sheet } from "../kit.mjs";

const ACCOUNTS = [
  ["reserve", "held against disputes,", "refunds and losses"],
  ["FBO / custodial", "merchants' money, titled", "for their benefit"],
  ["operating", "your money: fees earned,", "payroll, every expense"],
];

export default function draw() {
  const W = 760, bw = 170, bh = 64, gap = 90, pad = 12, nh = 28;
  const s = sheet({ prefix: "tr", width: W });
  const x0 = (W - (3 * bw + 2 * gap)) / 2;
  const gTop = 112, boxY = gTop + pad;

  s.comment("Sponsor bank");
  s.group(x0 - pad, gTop, 3 * bw + 2 * gap + 2 * pad, bh + 2 * pad, "sponsor bank: one bank, separate accounts");
  const [reserve, fbo, operating] = ACCOUNTS.map(([label, ...sub], i) =>
    s.node(x0 + i * (bw + gap), boxY, bw, bh, label, { kind: "store", hl: i === 1, sub }),
  );

  s.comment("Settlement in");
  const acq = s.node(fbo.cx - 60, 20, 120, nh, "acquirers", { kind: "actor" });
  s.connect(acq, fbo, { from: "b", to: "t", hl: true, label: "settles daily,\nnet or gross of fees", side: "left", shift: -0.35 });

  s.comment("Moves out of the custodial account");
  s.connect(fbo, reserve, { from: "l", to: "r", label: "held back" });
  s.connect(fbo, operating, { label: "only earned\nfees, swept" });
  s.connect(operating, fbo, { from: "t", to: "t", at: [0.5, 0.8], via: gTop - 18, alt: true, label: "prefund when payouts lead settlement" });

  s.comment("Payouts out");
  const banks = s.node(fbo.cx - 75, gTop + bh + 2 * pad + 34, 150, nh, "merchants' banks");
  s.connect(fbo, banks, { from: "b", to: "t", hl: true, label: "payouts", side: "right" });

  s.height = Math.ceil(banks.y + nh + 20);
  return s.toString();
}
