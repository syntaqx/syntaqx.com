// The card payment state machine as a standard diagram: the happy path in
// the accent, the 3-D Secure detour, dashed early exits, terminal states
// doubled. Embedded in content/docs/payments/payment-states.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ps", width: W });

  // Grid: four columns on the main row, a row above for the detour and a
  // row below for the exits.
  const w = 108, h = 30, gap = 58;
  const x0 = W - 20 - (4 * w + 3 * gap); // flush right; the left exit channel and its label take the left margin
  const X = (i) => x0 + i * (w + gap);
  const r0 = 24, r1 = 104, r2 = 184;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const action = st(0, r0, "requires_action");
  const pending = st(0, r1, "pending");
  const authorized = st(1, r1, "authorized");
  const captured = st(2, r1, "captured");
  const settled = st(3, r1, "settled", { end: true, hl: true });
  const failed = st(0, r2, "failed", { end: true, fill: 1 });
  const voided = st(1, r2, "voided", { end: true, fill: 1 });

  s.comment("The happy path");
  s.connect(pending, authorized, { hl: true, label: "approved" });
  s.connect(authorized, captured, { hl: true, label: "capture" });
  s.connect(captured, settled, { hl: true, label: "settles" });

  s.comment("3-D Secure detour");
  s.connect(pending, action, { from: "t", to: "b", at: [0.3, 0.3] });
  s.connect(action, pending, { from: "b", to: "t", at: [0.7, 0.7], label: "3-D Secure challenge,\nthen back to pending", side: "right" });

  s.comment("Early exits");
  s.connect(action, failed, { from: "l", to: "l", via: X(0) - 26, alt: true, label: "abandoned\nor expired", side: "left", seg: 1 });
  s.connect(pending, failed, { from: "b", to: "t", alt: true, label: "declined", side: "right" });
  s.connect(authorized, voided, { from: "b", to: "t", alt: true, label: "cancelled, or\nexpired uncaptured", side: "right" });

  s.comment("Legend");
  const lg = s.legend(X(0) - 26, r2 + h + 34, [
    { kind: "hl", label: "the path a payment should take" },
    { kind: "flow", label: "detour" },
    { kind: "alt", label: "ends it early" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
