// Security deposit itemization deadlines by state as bars on a day axis,
// each with the event that starts its clock; Florida's notice-of-claim
// window is dashed because it is a notice deadline, not the return. A
// standard diagram: the values are the point, so they sit on the bars.
// Embedded in content/books/property-tech/move-in-and-move-out.md.
import { sheet } from "../kit.mjs";

// [state, days, value label, dashed, accented]
const ROWS = [
  ["New York", 14, "14 days from vacating", false, true],
  ["Florida, no claim", 15, "15 days from termination"],
  ["California", 21, "21 days from vacating"],
  ["Texas", 30, "30 days from surrender"],
  ["Washington", 30, "30 days from termination and vacation"],
  ["New Jersey", 30, "30 days from termination"],
  ["Florida, claim notice", 30, "30 days to notice a claim", true],
];

export default function draw() {
  const W = 760, x = 20;
  const s = sheet({ prefix: "pt-dd", width: W });

  s.comment("Bars on a days axis, ticks only");
  const { bottom } = s.bars(x, 40, ROWS.map(([label, value, text, alt, hl]) => ({ label, value, text, alt, hl })), {
    ax: 180, k: 9, ticks: [0, 7, 14, 21, 30], tick: (d) => (d ? `${d} d` : "0"), head: "jurisdiction",
  });

  s.comment("Footnotes");
  const fy = bottom + 24;
  s.legend(x, fy - 3, [
    { kind: "node", label: "itemize and return by" },
    { kind: "ghost", label: "notice of a claim, not the return" },
  ]);
  s.text(x, fy + 20, "a selection as of october 2026; each clock starts at the event named", "sl");
  s.height = Math.ceil(fy + 38);
  return s.toString();
}
