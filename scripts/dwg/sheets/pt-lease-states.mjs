// The lease state machine as a standard diagram: the seven states, the
// path a lease should take in the accent, dashed exits to cancelled, and
// the renewal, transfer and eviction exit straight to ended. Embedded in
// content/books/property-tech/the-lease.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-ls", width: W });

  // Four columns; row A before possession, row B after it.
  const w = 124, h = 30;
  const gap = (W - 40 - 4 * w) / 3;
  const X = (i) => 20 + i * (w + gap);
  const rA = 60, rB = rA + h + 70;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const draft = st(0, rA, "draft");
  const ofs = st(1, rA, "out_for_signature");
  const signed = st(2, rA, "signed");
  const cancelled = st(3, rA, "cancelled", { end: true, fill: 1 });
  const current = st(1, rB, "current");
  const notice = st(2, rB, "notice_given");
  const ended = st(3, rB, "ended", { end: true, hl: true });

  s.comment("Before possession");
  s.connect(draft, ofs, { at: [0.3, 0.3], hl: true, label: "send", side: "above" });
  s.connect(ofs, draft, { from: "l", to: "r", at: [0.7, 0.7], label: "void", side: "below" });
  s.connect(ofs, signed, { hl: true, label: "all signed", side: "above" });
  s.connect(signed, cancelled, { alt: true, label: "before\npossession", side: "above" });
  const bus = rA - 24;
  s.fanIn([draft, ofs], cancelled, { from: "t", to: "t", via: bus, alt: true });
  s.text((ofs.cx + cancelled.cx) / 2, bus - 6, "declined, withdrawn or expired", "sl ko", "middle");

  s.comment("Possession and after");
  s.connect(signed, current, { from: "b", to: "t", hl: true, label: "start date, in possession", side: "above" });
  s.connect(current, notice, { at: [0.3, 0.3], hl: true, label: "notice", side: "above" });
  s.connect(notice, current, { from: "l", to: "r", at: [0.7, 0.7], label: "rescinded", side: "below" });
  s.connect(notice, ended, { hl: true, label: "moved out", side: "above" });
  const ch = rB + h + 24;
  s.connect(current, ended, { from: "b", to: "b", via: ch, label: "renewed, transferred, evicted or abandoned", side: "below" });

  s.comment("Legend");
  const lg = s.legend(20, ch + 36, [
    { kind: "hl", label: "the path a lease should take" },
    { kind: "alt", label: "ends it before possession" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
