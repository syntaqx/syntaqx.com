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
  const W = 760, x = 20;
  const s = sheet({ prefix: "fo-atr", width: W });

  s.comment("Bars on a years axis, ticks only");
  const { bottom } = s.bars(x, 40, RECORDS.map(([label, value, text, alt]) => ({ label, value, text, alt })), {
    ax: 220, k: 84, ticks: [0, 1, 2, 3, 4, 5], tick: (yr) => (yr ? `${yr} yr` : "0"), head: "record",
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
