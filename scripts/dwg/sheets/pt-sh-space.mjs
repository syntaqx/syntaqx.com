// Space in by-the-bed student housing as an indented tree with what each
// level carries: the unit turns and is metered, the bed is leased, priced,
// assigned and counted. A standard diagram. Embedded in
// content/books/property-tech/student-housing.md.
import { sheet } from "../kit.mjs";

const LEVELS = [
  ["property", "sells bed types: a floor plan and room configuration"],
  ["building", "the three levels of space sit under it"],
  ["unit", "front door, kitchen, shared utilities; turns, work orders, meters"],
  ["bedroom", "one bed or a shared two; a private bath is a priced feature"],
  ["bed", "leased, priced, assigned and counted; its own rentable status", true],
];

export default function draw() {
  const W = 760, x = 20, rowH = 40, h = 26;
  const s = sheet({ prefix: "pt-shs", width: W });
  const colWhat = 300, top = 44;

  s.comment("Column heads");
  s.text(x, 26, "level", "th");
  s.text(colWhat, 26, "what lives here", "th");
  s.line(x, 34, W - x, 34, "tbl");

  const root = LEVELS.reduceRight((child, [label, , hl]) => ({ label, hl, children: child ? [child] : [] }), null);
  const rows = s.tree(root, { x, y: top, w: 110, h, indent: 36, rowH });

  s.comment("What lives at each level");
  rows.forEach((n, i) => {
    const [, what, hl] = LEVELS[i];
    s.text(colWhat, n.cy + 3, what, hl ? "tc hl" : "tc");
    s.line(colWhat, n.y + h + (rowH - h) / 2, W - x, n.y + h + (rowH - h) / 2, "tbl");
  });

  const last = rows.at(-1);
  const fy = last.y + h + (rowH - h) / 2 + 22;
  s.text(W - x, fy, "before placement, a lease is signed against a bed type, not a bed", "sl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
