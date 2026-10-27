// An ACH debit's states through the return windows as a standard state
// machine: when each state starts above it, final in the accent, the two
// returns dashed into returned. The windows are drawn to scale in
// pm-ach-return-windows. Embedded in content/books/payments/ach.md.
import { sheet } from "../kit.mjs";

const STATES = [
  { label: "pending" },
  { label: "submitted", head: "sent in a file" },
  { label: "settled", head: "settlement date" },
  { label: "available", head: "+2 banking days" },
  { label: "final", head: "+60 calendar days", sub: ["now it's yours"], hl: true, end: true },
];

export default function draw() {
  const W = 760, w = 112, gap = 40;
  const s = sheet({ prefix: "achs", width: W });
  const x0 = (W - (STATES.length * w + (STATES.length - 1) * gap)) / 2;

  s.comment("States, in order");
  const { nodes, bottom } = s.pipeline(x0, 40, STATES.map((st) => ({ ...st, kind: "state", code: true })), { w, h: 30, gap });
  const [, , settled, available] = nodes;

  s.comment("Returns");
  const rw = 108;
  const returned = s.node((settled.cx + available.cx) / 2 - rw / 2, bottom + 44, rw, 30, "returned", { kind: "state", code: true, end: true, fill: 1 });
  s.connect(settled, returned, { from: "b", to: "l", alt: true, seg: 0, side: "left", label: "administrative return,\nwithin 2 banking days" });
  s.connect(available, returned, { from: "b", to: "r", alt: true, seg: 0, side: "right", label: "unauthorized return,\nup to 60 calendar days" });

  s.comment("Legend");
  const lg = s.legend(x0, returned.y + returned.h + 34, [
    { kind: "alt", label: "a return takes it back" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
