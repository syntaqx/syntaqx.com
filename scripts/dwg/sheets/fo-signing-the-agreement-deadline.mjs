// The FTC cooling-off deadline as a calendar: four rows, one per worked
// example, day columns across two weeks. Counted days are numbered, the
// third (the deadline) takes the accent, skipped days are dashed. Embedded
// in content/books/field-operations/signing-the-agreement.md.
import { sheet } from "../kit.mjs";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "mon", "tue", "wed"];

// Each row: its label, the column of the sale, then the days after it.
const ROWS = [
  ["monday sale", 0, ["1", "2", "3"]],
  ["monday sale, tue holiday", 0, ["hol", "1", "2", "3"]],
  ["friday sale", 4, ["1", "skip", "2", "3"]],
  ["friday sale, mon holiday", 4, ["1", "skip", "hol", "2", "3"]],
];

export default function draw() {
  const W = 760, cw = 48, gap = 4, ch = 24, rowGap = 8;
  const x0 = W - 20 - (DAYS.length * cw + (DAYS.length - 1) * gap); // the row labels take the left
  const X = (i) => x0 + i * (cw + gap);
  const s = sheet({ prefix: "fo-sad", width: W });

  s.comment("Day columns");
  DAYS.forEach((d, i) => s.text(X(i) + cw / 2, 30, d, "sl", "middle"));

  s.comment("One row per worked example");
  let y = 44;
  for (const [label, sale, after] of ROWS) {
    s.text(20, y + ch / 2 + 3, label, "sl ink");
    s.node(X(sale), y, cw, ch, "sale", { fill: 1 });
    after.forEach((d, i) => {
      const skipped = d === "hol" || d === "skip";
      s.node(X(sale + 1 + i), y, cw, ch, d, { kind: skipped ? "ghost" : "process", hl: d === "3" });
    });
    y += ch + rowGap;
  }

  s.comment("Legend and the closing time");
  const lg = s.legend(20, y + 16, [
    { kind: "node", label: "counted day" },
    { kind: "ghost", label: "sunday or federal holiday, not counted" },
    { kind: "node", hl: true, label: "deadline: midnight, buyer's local time" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
