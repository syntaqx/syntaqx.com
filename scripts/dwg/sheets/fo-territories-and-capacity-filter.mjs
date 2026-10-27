// The availability filter as a standard diagram: a funnel of narrowing
// boxes from every resource in the tenant through five hard rules to the
// graded candidates (accented), with brackets marking the hard and soft
// rules. Embedded in content/books/field-operations/territories-and-capacity.md.
import { sheet } from "../kit.mjs";

const RULES = [
  "territory: a polygon covers the address",
  "membership: assigned there on that date",
  "availability: shift, hours, absences",
  "eligibility: skills, level, license",
  "capacity: room left in the slot",
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-tcf", width: W });

  const h = 24, step = 40, top = 20, wMax = 560, shrink = 60;
  const left = (W - (wMax + 16 + 12 + 90)) / 2; // the funnel, its brackets and their labels, centered
  const cx = left + wMax / 2;
  const box = (i, label, o) => s.node(cx - (wMax - i * shrink) / 2, top + i * step, wMax - i * shrink, h, label, o);

  s.comment("The funnel: each step removes resources");
  const all = box(0, "every resource in the tenant", { kind: "ghost" });
  const rules = RULES.map((t, i) => box(i + 1, t));
  const cand = box(RULES.length + 1, "candidates, graded", { hl: true });
  [all, ...rules, cand].slice(1).forEach((n, i, arr) => {
    const prev = i ? arr[i - 1] : all;
    s.wire([prev.port("b"), n.port("t")], { hl: n === cand });
  });

  s.comment("Hard and soft");
  const bx = cx + wMax / 2 + 16;
  const bracket = (y1, y2, cls) => s.path(`M${bx - 6},${y1}H${bx}V${y2}H${bx - 6}`, cls);
  const r0 = rules[0], r4 = rules.at(-1);
  bracket(r0.y, r4.y + h, "flow");
  s.text(bx + 12, (r0.y + r4.y + h) / 2 - 2, "hard rules:", "sl");
  s.text(bx + 12, (r0.y + r4.y + h) / 2 + 10, "pass or fail", "sl");
  bracket(cand.y, cand.y + h, "flow hl");
  s.text(bx + 12, cand.cy + 3, "soft: scored", "sl hl");

  s.comment("Footer");
  const fy = cand.y + h + 30;
  s.text(left, fy, "the same filter answers the phone agent, the portal, the voice agent and the nightly batch", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
