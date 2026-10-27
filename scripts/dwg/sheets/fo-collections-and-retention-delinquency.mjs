// An account's delinquency states as a standard state diagram: forward
// steps on policy days, the agency hand-off dashed, and the accented return
// to current when a payment clears the balance. Embedded in
// content/books/field-operations/collections-and-retention.md.
import { sheet } from "../kit.mjs";

const STATES = [
  { label: "current", what: ["autopay runs", "visits booked"], hl: true },
  { label: "past due", what: ["retries, notices", "service continues"], fill: 1 },
  { label: "on hold", what: ["no new visits", "billing paused"], fill: 1 },
  { label: "written off", what: ["bad-debt entry", "still owed"], fill: 1 },
  { label: "with agency", what: ["placement file", "Reg F applies"], end: true },
];

export default function draw() {
  const W = 760, n = STATES.length, w = 120, h = 28, gap = (W - 40 - n * w) / (n - 1);
  const s = sheet({ prefix: "fo-car", width: W });
  const X = (i) => 20 + i * (w + gap);
  const ty = 46, y = 84;

  s.comment("States");
  const nodes = STATES.map((st, i) => s.node(X(i), y, w, h, st.label, { kind: st.kind ?? "state", hl: st.hl, fill: st.fill, end: st.end }));

  s.comment("Forward on policy days");
  nodes.slice(1).forEach((nd, i) => s.connect(nodes[i], nd, { alt: i === n - 2 }));

  s.comment("A payment that clears the balance returns to current");
  const last = nodes.at(-1);
  s.wire([last.port("t"), [last.cx, ty], [nodes[0].cx, ty], nodes[0].port("t")], {
    hl: true,
    seg: 1,
    label: "a payment that clears the balance returns the account to current",
  });
  nodes.slice(1, -1).forEach((nd) => s.wire([nd.port("t"), [nd.cx, ty]], { hl: true, arrow: "none" }));

  s.comment("What each state means");
  const subY = y + h + 16;
  STATES.forEach((st, i) => st.what.forEach((l, j) => s.text(nodes[i].cx, subY + j * 11.5, l, "sl", "middle")));

  const fy = subY + 11.5 + 28;
  s.text(W / 2, fy, "each forward step fires on a policy day, the same for every account", "sl", "middle");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
