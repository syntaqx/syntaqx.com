// A license's states with whether the scheduler may assign licensed work in
// each: pending, active, renewal window, expired, and suspended or revoked
// from any state. Embedded in
// content/books/field-operations/licensing-and-permits.md.
import { sheet } from "../kit.mjs";

const STATES = [
  ["pending", "no", { fill: 1 }],
  ["active", "yes", { hl: true }],
  ["renewal window", "yes, with alerts", { fill: 1 }],
  ["expired", "no", { end: true, fill: 1 }],
];

export default function draw() {
  const W = 760, x = 20, w = 122, h = 30, ch = 24, gap = 64;
  const x0 = (W - (STATES.length * w + (STATES.length - 1) * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const s = sheet({ prefix: "fo-lp", width: W });
  const y = 86;

  s.comment("States and whether work is assigned");
  const st = STATES.map(([l, , o], i) => s.node(X(i), y, w, h, l, o));
  const cells = STATES.map(([, v, o], i) => s.node(X(i), y + h, w, ch, `work: ${v}`, { hl: o.hl, fill: 1, code: true }));

  s.comment("Transitions");
  s.connect(st[0], st[1], { hl: true, label: "verified" });
  s.connect(st[1], st[2], { label: "window\nopens" });
  s.connect(st[2], st[3], { alt: true, label: "date\npasses" });
  s.connect(st[2], st[1], { from: "t", to: "t", at: [0.3, 0.7], via: y - 22, label: "renewed and verified", side: "above" });
  s.connect(st[3], st[1], { from: "t", to: "t", at: [0.5, 0.3], via: y - 52, label: "late renewal", side: "above" });

  s.comment("From any state");
  const by = y + h + ch + 22;
  const sus = s.node(W / 2 - 100, by + 24, 200, 30, "suspended or revoked", { end: true, fill: 1 });
  for (const c of cells) s.wire([c.port("b"), [c.cx, by]], { alt: true, arrow: "none" });
  s.wire([[cells[0].cx, by], [cells[3].cx, by]], { alt: true, arrow: "none" });
  s.wire([[sus.cx, by], sus.port("t")], { alt: true });
  const fy = sus.y + 30 + 22;
  s.text(sus.cx, fy, "from any state, by the issuer or a failed verification; no work assigned", "sl", "middle");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
