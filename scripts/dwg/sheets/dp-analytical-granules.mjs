// One MergeTree part as a plan view: six column files by eight granules, the
// sparse index above, and the cells a filtered query reads. Embedded in
// content/docs/data/analytical-databases.md.
import { sheet, widthOf } from "../kit.mjs";

const COLS = ["tenant_id", "occurred_at", "type", "match_id", "region", "payload"];
const GRANULES = 8;
const READ = [2, 3]; // granules 3 and 4 (zero-based)
const OPENED = 3; // the first three column files

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "dp-gr", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "One mark per granule, held in memory; the sort key (tenant_id, occurred_at) finds granules 3 and 4."],
    [2, "G1 is the ClickHouse default; the part size and the query are illustrative."],
    [3, "C1: the query filters on tenant and time and groups by type; other columns stay closed."],
    [0, "Not to scale; values in rows. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: one part ----
  s.comment("Plan view: one MergeTree part");
  const cw = 60, ch = 24;
  const gw = GRANULES * cw, gh = COLS.length * ch;
  const x0 = CX - gw / 2;
  const X = (g) => x0 + g * cw;
  const dimY = ny + 40;
  const idxY = dimY + 30;
  const top = idxY + 20, bot = top + gh;

  // Dimensions above: one granule, and the rows read.
  s.dimH(X(0), X(1), dimY, "G1", { from: [idxY - 6, idxY - 6] });
  s.nb(X(0.5) + 18, dimY - 7.5, 2);
  s.dimH(X(READ[0]), X(READ[1] + 1), dimY, "R1", { from: [idxY - 6, idxY - 6], hl: true });

  // Sparse index: one mark per granule.
  s.text(x0 - 10, idxY + 3, "index", "sl ink", "end");
  s.nb(x0 - 10 - widthOf("index", "sl") - 12, idxY, 1);
  s.line(x0, idxY, X(GRANULES), idxY, "ext");
  for (let g = 0; g < GRANULES; g++) s.add(`<circle class="dot" cx="${X(g + 0.5)}" cy="${idxY}" r="2.2"/>`);

  // The part: column files by granules; the cells the query reads in accent.
  COLS.forEach((c, r) => {
    const y = top + r * ch;
    s.text(x0 - 10, y + ch / 2 + 3, c, "tc", "end");
    for (let g = 0; g < GRANULES; g++) s.rect(X(g), y, cw, ch, "obj fill-2");
  });
  // Accent cells last so their outline is not covered by neighbours.
  for (let r = 0; r < OPENED; r++) for (const g of READ) s.rect(X(g), top + r * ch, cw, ch, "obj hl");

  // Granule numbers under the grid.
  for (let g = 0; g < GRANULES; g++) s.text(X(g + 0.5), bot + 13, String(g + 1), "vs", "middle");

  // Columns opened, right of the grid.
  const cx = X(GRANULES) + 22;
  s.dimV(top, top + OPENED * ch, cx, "C1", { from: [X(GRANULES), X(GRANULES)], side: "r" });
  s.nb(cx + 30, top + (OPENED * ch) / 2, 3);

  // The whole part below.
  const py = bot + 34;
  s.dimH(X(0), X(GRANULES), py, "P1", { from: [bot + 18, bot + 18], below: true });

  s.viewTitle(CX, py + 46, "Plan view · one MergeTree part", "Not to scale · column files as rows · granules 1 to 8 as columns");
  const viewBottom = py + 46 + 13;

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["G1", "rows per granule, index_granularity default", "8,192"],
    ["P1", "rows in the part", "8 x G1 = 65,536"],
    ["R1", "rows read, granules 3 and 4", "2 x G1 = 16,384"],
    ["C1", "column files opened, of 6", "3"],
    ["F1", "fraction read", "(2 x 3) / (8 x 6) = 12.5 %"],
  ];
  const ws = [40, 250, 160];
  const tx = CX - ws.reduce((a, b) => a + b, 0) / 2;
  const tb = s.table(tx, viewBottom + 52, "Variables · rows", rows, { widths: ws });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
