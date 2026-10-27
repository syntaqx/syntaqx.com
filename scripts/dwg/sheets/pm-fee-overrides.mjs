// Fee overrides down a platform's tree: each level overrides single fee
// lines, and one merchant's schedule resolves line by line from the nearest
// level that sets each. A standard diagram, with illustrative values.
// Embedded in content/books/payments/software-platforms.md.
import { sheet } from "../kit.mjs";

const LINES = ["card discount", "ACH fee", "chargeback fee"];
const LEVELS = [
  ["platform", ["2.90%", "$0.50", "$25.00"]],
  ["organization", ["2.60%", null, null]],
  ["sub-organization", [null, "$0.30", null]],
  ["merchant A", [null, null, "$15.00"], true],
  ["merchant B", [null, null, null]],
];
const RESOLVED = [["2.60%", "from organization"], ["$0.30", "from sub-organization"], ["$15.00", "from merchant A"]];

export default function draw() {
  const W = 760, x = 20, rowH = 40, h = 26, top = 44;
  const s = sheet({ prefix: "pm-fo", width: W });
  const cols = [340, 480, 620];

  s.comment("Column heads");
  s.text(x, 26, "level", "th");
  LINES.forEach((t, i) => s.text(cols[i], 26, t, "th"));
  s.line(x, 34, W - x, 34, "tbl");

  const [platform, org, sub, a, b] = LEVELS.map(([label, , hl]) => ({ label, hl, children: [] }));
  platform.children = [org];
  org.children = [sub];
  sub.children = [a, b];
  const rows = s.tree(platform, { x, y: top, w: 150, h, indent: 40, rowH });

  s.comment("What each level sets; blank lines inherit");
  rows.forEach((n, i) => {
    const [, values, hl] = LEVELS[i];
    values.forEach((v, j) => s.text(cols[j], n.cy + 3, v ?? "inherits", v ? (hl ? "tc hl" : "tc") : "sl"));
    const ry = n.y + h + (rowH - h) / 2;
    s.line(cols[0], ry, W - x, ry, "tbl");
  });

  s.comment("The schedule merchant A resolves to");
  const ty = rows.at(-1).y + h + (rowH - h) / 2 + 26;
  s.text(x, ty, "resolved for merchant A", "sl hl");
  RESOLVED.forEach(([v, from], j) => {
    s.text(cols[j], ty, v, "tc hl");
    s.text(cols[j], ty + 14, from, "sl");
  });

  const fy = ty + 40;
  s.text(W - x, fy, "frozen as one version and stamped on every payment it prices", "sl hl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
