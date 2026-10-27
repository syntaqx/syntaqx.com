// The service agreement state machine as a standard diagram: the path to
// active in the accent, exits before activation above the main row, the
// stops and the end after activation below it. Embedded in
// content/books/field-operations/service-agreements.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-sas", width: W });

  // Grid: four columns; exits before activation on the row above, what
  // happens after activation on the row below, two channels between.
  const w = 108, h = 30, gap = (W - 40 - 4 * w) / 3;
  const X = (i) => 20 + i * (w + gap);
  const r0 = 24, r1 = 104, chA = r1 + h + 20, chB = chA + 20, r2 = chB + 24;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const draft = st(0, r1, "draft");
  const out = st(1, r1, "out_for_signature");
  const signed = st(2, r1, "signed");
  const active = st(3, r1, "active", { hl: true });
  const voided = st(1, r0, "void", { end: true, fill: 1 });
  const cancelled = st(2, r0, "cancelled", { end: true, fill: 1 });
  const hb = 40; // the row below carries a reason in each box
  const onHold = s.node(X(1), r2, w, hb, "on_hold", { kind: "state", code: true, sub: "company stopped" });
  const paused = s.node(X(2), r2, w, hb, "paused", { kind: "state", code: true, sub: "customer asked" });
  const terminated = s.node(X(3), r2, w, hb, "terminated", { kind: "state", code: true, end: true, fill: 1, sub: "with reason" });

  s.comment("The path to active, and renewal");
  s.connect(draft, out, { hl: true, label: "send" });
  s.connect(out, signed, { hl: true, label: "sign" });
  s.connect(signed, active, { hl: true, label: "cooling-off\nends" });
  s.loop(active, "t", { hl: true, label: "renew: a new\nterm version" });

  s.comment("Exits before activation");
  s.connect(out, voided, { from: "t", to: "b", alt: true, label: "never signed,\nexpired", side: "right" });
  s.connect(signed, cancelled, { from: "t", to: "b", alt: true, label: "with reason", side: "right" });

  s.comment("Stops and the end after activation");
  const pa = active.port("b", 0.3), po = active.port("b", 0.12);
  s.wire([pa, [pa[0], chB], [paused.cx, chB], paused.port("t")], { arrow: "both" });
  s.wire([po, [po[0], chA], [onHold.cx, chA], onHold.port("t")], { arrow: "both" });
  s.connect(active, terminated, { from: "b", to: "t", at: [0.75, 0.75], alt: true, label: "ends", side: "right" });
  s.connect(paused, terminated, { alt: true });

  s.comment("Legend");
  const lg = s.legend(20, r2 + hb + 30, [
    { kind: "hl", label: "the path an agreement should take" },
    { kind: "flow", label: "stop and resume" },
    { kind: "alt", label: "ends it" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
