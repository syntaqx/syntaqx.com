// How network rules reach a merchant: two contract chains (cards and ACH),
// rules flowing down, evidence flowing up, law under every level. Neutral
// roles only; the caption and alt text name the networks and regulators.
// Embedded in content/books/payments/payments-rulebook.md.
import { sheet } from "../kit.mjs";

const CHAINS = [
  {
    head: "cards",
    side: "left",
    levels: [
      ["card networks", "brand rules, security standard"],
      ["acquiring bank", null, "acquirer agreement"],
      ["payfac or platform", null, "payfac agreement"],
      ["merchant", "listed if terminated", "merchant terms"],
    ],
  },
  {
    head: "ach",
    side: "right",
    levels: [
      ["ACH rules body", "operating rules"],
      ["ODFI", null, "origination agreement"],
      ["third-party sender", null, "registered by the ODFI"],
      ["originator", null, "origination terms"],
    ],
  },
];

export default function draw() {
  const W = 760, x = 20, w = 200, h = 34, gap = 26, top = 56;
  const s = sheet({ prefix: "rc", width: W });
  const CX = [260, 500];
  const Y = (i) => top + i * (h + gap);
  const chainBot = Y(3) + h;

  CHAINS.forEach((c, k) => {
    s.comment(`${c.head} chain`);
    s.text(CX[k], top - 12, c.head, "lt", "middle");
    const nodes = c.levels.map(([label, sub], i) =>
      s.node(CX[k] - w / 2, Y(i), w, h, label, { sub: sub ?? undefined, fill: i === 0 ? 1 : 2 }),
    );
    nodes.slice(1).forEach((n, i) => s.connect(nodes[i], n, { from: "b", to: "t", label: c.levels[i + 1][2], side: c.side }));
  });

  s.comment("Rules down, evidence up");
  const dx = 40, ux = W - 40;
  s.text(dx - 8, 22, "rules, fines, termination", "sl hl");
  s.wire([[dx, 32], [dx, chainBot]], { hl: true });
  s.text(ux + 8, 22, "evidence: attestations, proof of authorization", "sl", "end");
  s.wire([[ux, chainBot], [ux, 32]]);

  s.comment("Law at every level");
  const lawY = chainBot + 20;
  s.node(x, lawY, W - 2 * x, 40, "law applies at every level, signed or not", {
    fill: 1,
    sub: "consumer protection, anti-money-laundering, sanctions and state regulators",
  });

  s.height = Math.ceil(lawY + 40 + 20);
  return s.toString();
}
