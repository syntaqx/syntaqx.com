// A deposited check's states as a standard state machine: when each starts
// above it, final in the accent, and the two waves of failure dashed into
// returned: ordinary returns within days, warranty and forgery claims
// months later. Embedded in content/books/payments/checks.md.
import { sheet } from "../kit.mjs";

const STATES = [
  { label: "scanned" },
  { label: "deposited", head: "day 0" },
  { label: "available", head: "+2 business days", sub: ["Reg CC releases funds"] },
  { label: "probably good", head: "+3 to 4 business days" },
  { label: "final", head: "a year or more", sub: ["by your policy"], hl: true, end: true },
];

export default function draw() {
  const W = 760, w = 112, gap = 40;
  const s = sheet({ prefix: "chk", width: W });
  const x0 = (W - (STATES.length * w + (STATES.length - 1) * gap)) / 2;

  s.comment("States, in order");
  const { nodes, bottom } = s.pipeline(x0, 40, STATES.map((st) => ({ ...st, kind: "state", code: true })), { w, h: 30, gap });
  const [, , available, good] = nodes;

  s.comment("Returns");
  const rw = 108;
  const returned = s.node((available.cx + good.cx) / 2 - rw / 2, bottom + 44, rw, 30, "returned", { kind: "state", code: true, end: true, fill: 1 });
  // Start under the sub text, as pipeline wires do.
  s.wire([[available.cx, bottom + 6], [available.cx, returned.cy], returned.port("l")], {
    alt: true, seg: 0, side: "left", label: "return by the paying bank's deadline\n(A NSF, C stop, D closed)",
  });
  s.connect(good, returned, { from: "b", to: "r", alt: true, seg: 0, side: "right", label: "warranty or forgery claim:\naltered, forged, deposited twice" });

  s.comment("Legend");
  const lg = s.legend(x0, returned.y + returned.h + 34, [
    { kind: "alt", label: "a return or claim takes it back" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
