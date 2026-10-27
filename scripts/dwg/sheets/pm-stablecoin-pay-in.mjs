// A stablecoin pay-in as a pipeline: the payer's wallet, the transfer on
// chain, the provider's deposit address, the off-ramp, the provider's
// settlement account and the merchant's bank. Numbered balloons mark the
// three finality points, explained in the table under it; the accent is
// on-chain finality, the point the provider credits the payment.
// Embedded in content/books/payments/stablecoins.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "payer", label: "wallet", sub: ["self-custody", "or an exchange"] },
  { head: "blockchain", label: "transfer", sub: ["in a block,", "then final"] },
  { head: "provider", label: "deposit\naddress", sub: ["screened, matched", "to the payment"], hl: true },
  { head: "ramp or issuer", label: "off-ramp", sub: ["stablecoin in,", "dollars out"] },
  { head: "provider", label: "settlement", sub: ["FBO account,", "ledger posts"] },
  { head: "merchant", label: "bank\naccount", sub: ["ACH or wire", "payout"] },
];

// Finality points: the gap (arrow index) each balloon sits on, and its row.
const POINTS = [
  { gap: 1, row: ["1", "final on chain", "seconds to about 19 minutes, by chain", "a reorg can no longer undo it"] },
  { gap: 3, row: ["2", "dollars at the provider", "same day to a few business days", "the ramp's wire or ACH has settled"] },
  { gap: 4, row: ["3", "payout settled", "next banking day, or same day", "an ACH credit can still come back"] },
];

export default function draw() {
  const W = 760, w = 100, gap = 24, h = 36;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = (W - total) / 2;
  const s = sheet({ prefix: "pm-sc", width: W });

  s.comment("Pipeline");
  const { nodes, bottom } = s.pipeline(x0, 44, STAGES, { w, h, gap, hlArrows: [1] });

  s.comment("Finality balloons over the arrows");
  for (const p of POINTS) {
    const a = nodes[p.gap], b = nodes[p.gap + 1];
    s.nb((a.x + a.w + b.x) / 2, a.cy - 12, p.row[0]);
  }

  s.comment("What each point means");
  const g = s.grid(x0, bottom + 40, "Finality points", ["#", "point", "typically", "after it"], POINTS.map((p) => p.row), {
    widths: [30, 150, 230, total - 410],
    rowH: 22,
    align: ["middle", "start", "start", "start"],
    hl: [0],
  });

  s.height = Math.ceil(g.y + 20);
  return s.toString();
}
