// A portal reschedule as a standard flow: the main path through the same
// scheduling service the office uses, with the exits that each step can
// take. Embedded in content/books/field-operations/customer-self-service.md.
import { sheet } from "../kit.mjs";

const STEPS = ["customer asks", "policy check", "slot search", "hold the slot", "commit"];
// Under each step after the first: [why it leaves the path, where it goes, solid].
const EXITS = [
  null,
  ["too late, owes,\nor locked", "office request"],
  ["nothing fits", "next open dates"],
  ["hold expired", "search again"],
  [null, "event, notify", true],
];

export default function draw() {
  const W = 760, x = 20, w = 124, h = 28, gap = (W - 2 * x - STEPS.length * w) / (STEPS.length - 1);
  const s = sheet({ prefix: "fo-cssr", width: W });
  const X = (i) => x + i * (w + gap);
  const y0 = 46, y1 = y0 + h + 52, h2 = 36;

  s.text(x, 26, "the portal calls the same scheduling service the office uses", "lt");

  s.comment("The path");
  const top = STEPS.map((l, i) => s.node(X(i), y0, w, h, l, { hl: i === STEPS.length - 1 }));
  top.slice(1).forEach((n, i) => s.connect(top[i], n, { hl: true }));

  s.comment("Exits");
  EXITS.forEach((e, i) => {
    if (!e) return;
    const [why, label, solid] = e;
    const n = s.node(X(i), y1, w, h2, label, solid ? { sub: "audit, confirm" } : { kind: "ghost" });
    s.connect(top[i], n, { from: "b", to: "t", alt: !solid, label: why ?? undefined, side: "right" });
  });

  const fy = y1 + h2 + 28;
  s.text(W - x, fy, "the portal never writes the visit directly", "sl hl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
