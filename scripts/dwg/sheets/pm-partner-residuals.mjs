// One card payment's revenue split up a partner tree: each level buys at its
// parent's sell rate and keeps the difference, and the shares plus the cost
// of acceptance add up to the merchant's fee. A standard diagram, with
// illustrative values. Embedded in content/books/payments/partners-and-residuals.md.
import { sheet } from "../kit.mjs";

const HEADS = ["buys at", "sells at", "keeps"];
const LEVELS = [
  ["provider", ["cost", "cost + 0.15% + $0.05", "$0.20"]],
  ["ISO", ["cost + 0.15% + $0.05", "cost + 0.35% + $0.08", "$0.23"]],
  ["sub-ISO", ["cost + 0.35% + $0.08", "cost + 0.50% + $0.10", "$0.17"]],
  ["agent", ["cost + 0.50% + $0.10", "2.90% + $0.30", "$0.55"]],
  ["merchant", ["2.90% + $0.30", null, "pays $3.20"]],
];

export default function draw() {
  const W = 760, x = 20, rowH = 40, h = 26, top = 44;
  const s = sheet({ prefix: "pm-pr", width: W });
  const cols = [270, 440, 640];

  s.comment("Column heads");
  s.text(x, 26, "one $100.00 card payment", "th");
  HEADS.forEach((t, i) => s.text(cols[i], 26, t, "th"));
  s.line(x, 34, W - x, 34, "tbl");

  const nodes = LEVELS.map(([label]) => ({ label, children: [] }));
  nodes.slice(0, -1).forEach((n, i) => { n.children = [nodes[i + 1]]; });
  const rows = s.tree(nodes[0], { x, y: top, w: 110, h, indent: 30, rowH });

  s.comment("Each level's buy rate is its parent's sell rate; it keeps the difference");
  rows.forEach((n, i) => {
    const [, [buy, sell, keep]] = LEVELS[i];
    s.text(cols[0], n.cy + 3, buy, "tc");
    s.text(cols[1], n.cy + 3, sell ?? "", "tc");
    s.text(cols[2], n.cy + 3, keep, i < LEVELS.length - 1 ? "tc hl" : "tc");
    const ry = n.y + h + (rowH - h) / 2;
    s.line(cols[0], ry, W - x, ry, "tbl");
  });

  s.comment("The split reconciles to the fee");
  const ty = rows.at(-1).y + h + (rowH - h) / 2 + 26;
  s.text(x, ty, "cost of acceptance", "sl");
  s.text(cols[0], ty, "$2.05", "tc");
  s.text(cols[1], ty, "interchange, network and processing", "sl");
  const fy = ty + 28;
  s.text(x, fy, "$2.05 + $0.20 + $0.23 + $0.17 + $0.55 = $3.20, the merchant's fee to the cent", "sl hl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
