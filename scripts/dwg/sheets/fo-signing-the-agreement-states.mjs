// The signing state machine as a standard diagram: draft to active along
// the main row, the deadline passing in the accent, the two exits dashed
// down to their terminal states. Embedded in
// content/books/field-operations/signing-the-agreement.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-sta", width: W });

  const w = 120, h = 36, gap = (W - 40 - 4 * w) / 3;
  const X = (i) => 20 + i * (w + gap);
  const r1 = 24, r2 = r1 + h + 64;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", ...o });
  const note = (n, lines, a = "middle") =>
    lines.forEach((l, i) => s.text(a === "end" ? n.x + n.w : n.cx, n.y + n.h + 16 + i * 11.5, l, "sl", a));

  s.comment("States");
  const draft = st(0, r1, "draft");
  const out = st(1, r1, "out for\nsignature");
  const signed = st(2, r1, "signed,\nwindow open", { fill: 1 });
  const active = st(3, r1, "active", { hl: true });
  const voided = st(1, r2, "void", { end: true, fill: 1 });
  const cancelled = st(2, r2, "cancelled", { end: true, fill: 1 });

  s.comment("Forward");
  s.connect(draft, out, { label: "send\npacket" });
  s.connect(out, signed, { label: "every party\nsigns" });
  s.connect(signed, active, { hl: true, label: "deadline\npasses" });

  s.comment("What active starts");
  note(active, ["recurring billing starts", "commission is earned"], "end"); // centered, the longer line would cross the margin

  s.comment("Exits");
  s.connect(out, voided, { from: "b", to: "t", alt: true, label: "declined,\nexpired", side: "left" });
  s.connect(signed, cancelled, { from: "b", to: "t", alt: true, label: "cancelled\nin window", side: "left" });
  note(voided, ["no customer created"]);
  note(cancelled, ["refund in 10 business days"]);

  s.comment("Legend");
  const lg = s.legend(20, r2 + h + 52, [
    { kind: "hl", label: "the step that makes it active" },
    { kind: "alt", label: "ends it" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
