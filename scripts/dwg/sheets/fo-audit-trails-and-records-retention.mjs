// Minimum retention periods by record type as bars on a five-year axis,
// each with its value beside it; the do-not-call bar is dashed because it
// is an honoring period, not retention. A standard diagram: the values are
// the point, so they sit on the bars rather than in a code table. Embedded
// in content/books/field-operations/audit-trails-and-records.md.
import { sheet } from "../kit.mjs";

// [record, years, value label, dashed]
const RECORDS = [
  ["vehicle inspection reports", 0.25, "3 months"],
  ["hours-of-service logs", 0.5, "6 months"],
  ["time cards, billing", 2, "2 years"],
  ["restricted-use pesticide", 2, "2 years, federal floor"],
  ["Regulation Z evidence", 2, "2 years"],
  ["payroll records", 3, "3 years"],
  ["refrigerant leak repair", 3, "3 years"],
  ["collection records, calls", 3, "3 years"],
  ["CA renewal consent", 3, "3 years or more"],
  ["TCPA consent records", 4, "4 years after last call"],
  ["employment tax", 4, "4 years"],
  ["OSHA injury logs", 5, "5 years"],
  ["MN pest control records", 5, "5 years"],
  ["do-not-call (honor only)", 5, "5 years", true],
];

export default function draw() {
  const W = 760, x = 20, rowH = 22, barH = 10;
  const s = sheet({ prefix: "fo-atr", width: W });
  const ax = 220, k = 84; // axis origin and sheet units per year
  const top = 40, bottom = top + RECORDS.length * rowH + 4;

  s.comment("Axis: years");
  s.text(x, 26, "record", "th");
  for (let yr = 0; yr <= 5; yr++) {
    const gx = ax + yr * k;
    s.text(gx, 26, yr ? `${yr} yr` : "0", "th", "middle");
    // Ticks only: gridlines would run through the value labels.
    s.line(gx, top - 10, gx, top - 4, "obj");
    s.line(gx, bottom, gx, bottom + 6, "obj");
  }

  s.line(ax, top - 4, ax + 5 * k, top - 4, "obj");
  s.line(ax, bottom, ax + 5 * k, bottom, "obj");
  s.line(ax, top - 4, ax, bottom, "obj");

  s.comment("Bars");
  RECORDS.forEach(([name, years, value, dashed], i) => {
    const cy = top + i * rowH + rowH / 2;
    s.text(x, cy + 3.2, name, "tc");
    s.rect(ax, cy - barH / 2, years * k, barH, dashed ? "slot" : "obj fill-2");
    s.text(ax + years * k + 8, cy + 3.2, value, "tc");
  });

  s.comment("Footnotes");
  const fy = bottom + 24;
  s.legend(x, fy - 3, [
    { kind: "node", label: "minimum retention" },
    { kind: "ghost", label: "how long a request is honored, not a retention period" },
  ]);
  s.text(x, fy + 20, "minimums: clocks start at different events, state rules are often longer, holds override all", "sl");
  s.height = Math.ceil(fy + 38);
  return s.toString();
}
