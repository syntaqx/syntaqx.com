// A customer's lifecycle as a state row: lead to renewal with what each
// stage records, the renewal loop, dashed exits to cancelled and terminated,
// and the win-back back to lead. Embedded in
// content/books/field-operations/field-operations-business.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  ["lead", "source, consent"],
  ["sold", "terms, card, rep"],
  ["initial visit", "baseline visit"],
  ["recurring", "visits, bills"],
  ["renewal", "price, term"],
];

export default function draw() {
  const W = 760, x = 20, w = 120, h = 38;
  const gap = (W - 2 * x - STAGES.length * w) / (STAGES.length - 1);
  const X = (i) => x + i * (w + gap);
  const s = sheet({ prefix: "fo-fob", width: W });
  const y0 = 50, y1 = y0 + h + 56;

  s.comment("Stages");
  const st = STAGES.map(([l, sub], i) => s.node(X(i), y0, w, h, l, { kind: "state", sub }));
  st.slice(1).forEach((n, i) => s.connect(st[i], n, { hl: true }));
  s.connect(st[4], st[3], { from: "t", to: "t", hl: true, label: "renewed", side: "above" });

  s.comment("Exits");
  const cancelled = s.node(X(1), y1, w, 28, "cancelled", { kind: "state", end: true, fill: 1 });
  const terminated = s.node(X(3), y1, w, 28, "terminated", { kind: "state", end: true, fill: 1 });
  s.connect(st[1], cancelled, { from: "b", to: "t", alt: true, label: "cooling-off", side: "right" });
  s.connect(st[3], terminated, { from: "b", to: "t", alt: true, label: "cancel, non-pay", side: "right" });
  s.connect(st[4], terminated, { from: "b", to: "r", alt: true, label: "lapsed", side: "right", seg: 0 });

  s.comment("Win-back");
  const wy = y1 + 28 + 22;
  s.wire([terminated.port("b"), [terminated.cx, wy], [st[0].cx, wy], st[0].port("b")], {
    alt: true, seg: 1, side: "below", label: "win-back campaign, a new lead with history",
  });

  const lg = s.legend(x, wy + 42, [
    { kind: "hl", label: "the path a customer should take" },
    { kind: "alt", label: "exit or win-back" },
    { kind: "end", label: "ended" },
  ]);
  s.height = Math.ceil(lg.y + 14);
  return s.toString();
}
