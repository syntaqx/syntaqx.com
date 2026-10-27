// The test pyramid as a standard diagram: three levels over a static
// foundation, contract tests beside it, a time-to-run ruler on the left and
// how many / what a failure names in a ruled table on the right. Unit tests
// are accented. Embedded in content/docs/quality/testing.md.
import { sheet } from "../kit.mjs";

const LEVELS = [
  ["end to end", "a handful", "a broken journey"],
  ["integration", "fewer", "a service's wiring"],
  ["unit", "most", "the function and input", true],
];
const BANDS = [
  ["static: types, linting, formatting", "everything", "a line and a rule"],
  ["contract: beside it, at every boundary", "every boundary", "a broken agreement"],
];

export default function draw() {
  const W = 760, x = 20, top = 44, lh = 44, bh = 26, half = 150;
  const s = sheet({ prefix: "tp", width: W });
  const ruleX = 70, cx = ruleX + 54 + half + 8;
  const colMany = 500, colNames = 600, tblX = colMany - 12;
  const base = top + LEVELS.length * lh;
  const hw = (y) => ((y - top) / (base - top)) * half; // half width at y

  s.comment("Column heads");
  s.text(colMany, top - 10, "how many", "th");
  s.text(colNames, top - 10, "a failure names", "th");
  s.line(tblX, top, W - x, top, "tbl");

  const rowOut = (cy, many, names, hl, edge) => {
    s.line(edge + 8, cy, tblX - 8, cy, "leader");
    s.text(colMany, cy + 3, many, hl ? "tc hl" : "tc");
    s.text(colNames, cy + 3, names, hl ? "tc hl" : "tc");
  };

  s.comment("The pyramid");
  LEVELS.forEach(([label, many, names, hl], i) => {
    const y0 = top + i * lh, y1 = y0 + lh;
    const d = i === 0
      ? `M${cx},${y0}L${cx + hw(y1)},${y1}L${cx - hw(y1)},${y1}Z`
      : `M${cx - hw(y0)},${y0}L${cx + hw(y0)},${y0}L${cx + hw(y1)},${y1}L${cx - hw(y1)},${y1}Z`;
    s.path(d, hl ? "obj hl" : "obj fill-2");
    const ty = i === 0 ? y0 + lh * 0.82 : (y0 + y1) / 2 + 3;
    s.text(cx, ty, label, hl ? "sl ink hl" : "sl ink", "middle");
    const cy = (y0 + y1) / 2 + (i === 0 ? 10 : 0);
    rowOut(cy, many, names, hl, cx + hw(cy));
    s.line(tblX, y1, W - x, y1, "tbl");
  });

  s.comment("Foundation and contracts");
  const bx = cx - half - 8, bw = 2 * half + 16;
  const sy = base, cy2 = base + bh + 14;
  s.node(bx, sy, bw, bh, BANDS[0][0], { fill: 1 });
  s.node(bx, cy2, bw, bh, BANDS[1][0], { kind: "ghost" });
  rowOut(sy + bh / 2, BANDS[0][1], BANDS[0][2], false, bx + bw);
  s.line(tblX, sy + bh + 7, W - x, sy + bh + 7, "tbl");
  rowOut(cy2 + bh / 2, BANDS[1][1], BANDS[1][2], false, bx + bw);
  s.line(tblX, cy2 + bh + 7, W - x, cy2 + bh + 7, "tbl");

  s.comment("Time to run");
  s.wire([[ruleX, sy + bh], [ruleX, top]]);
  s.line(ruleX - 6, sy + bh, ruleX + 6, sy + bh, "leader");
  s.text(ruleX, top - 10, "minutes", "sl", "middle");
  s.text(ruleX, sy + bh + 16, "instant", "sl", "middle");
  const my = (top + sy + bh) / 2;
  s.text(ruleX - 10, my, "time to run", "sl", "middle", { transform: `rotate(-90 ${ruleX - 10} ${my})` });

  s.height = Math.ceil(cy2 + bh + 24);
  return s.toString();
}
