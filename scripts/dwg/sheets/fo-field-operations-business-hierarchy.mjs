// The field operations business hierarchy as an indented tree, with what
// lives at each level and who works it in two columns. A standard diagram.
// Embedded in content/books/field-operations/field-operations-business.md.
import { sheet } from "../kit.mjs";

const LEVELS = [
  ["company or brand", "brands, price lists, policy", "owner, finance"],
  ["region", "P&L rollup, state rules", "regional manager"],
  ["branch", "licenses, stock, office, P&L", "branch manager, CSRs", true],
  ["territory or route", "zip codes, route days", "dispatcher"],
  ["technician, van", "skills, license, stock", "technician"],
];

export default function draw() {
  const W = 760, x = 20, rowH = 40, h = 26;
  const s = sheet({ prefix: "fo-fbh", width: W });
  const colWhat = 430, colWho = 610, top = 44;

  s.comment("Column heads");
  s.text(x, 26, "level", "th");
  s.text(colWhat, 26, "what lives here", "th");
  s.text(colWho, 26, "who works it", "th");
  s.line(x, 34, W - x, 34, "tbl");

  // A chain: each level is the only child of the one above.
  const root = LEVELS.reduceRight((child, [label, , , hl]) => ({ label, hl, children: child ? [child] : [] }), null);
  const rows = s.tree(root, { x, y: top, w: 160, h, indent: 50, rowH });

  // Values keep their case (tc): caps lettering would turn CSRs into CSRS.
  s.comment("What lives here, who works it");
  rows.forEach((n, i) => {
    const [, what, who, hl] = LEVELS[i];
    s.text(colWhat, n.cy + 3, what, hl ? "tc hl" : "tc");
    s.text(colWho, n.cy + 3, who, "tc");
    s.line(colWhat, n.y + h + (rowH - h) / 2, W - x, n.y + h + (rowH - h) / 2, "tbl");
  });

  const last = rows.at(-1);
  const fy = last.y + h + (rowH - h) / 2 + 22;
  s.text(W - x, fy, "the branch is the unit that makes or loses money", "sl hl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
