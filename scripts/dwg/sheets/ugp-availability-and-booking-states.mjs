// The booking state machine for a rental marketplace as a standard diagram:
// two ways in (a request, or an instant book checkout), the trip's path from
// confirmed through the two handoffs to completed in the accent, dashed
// exits to declined, expired and cancelled. Embedded in
// content/books/user-generated-platforms/availability-and-booking.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-ab", width: W });

  // Four columns; the request row above, the exit row below. The left
  // margin takes the instant book entry and its label.
  const w = 104, h = 30, gap = 70;
  const x0 = W - 20 - (4 * w + 3 * gap);
  const X = (i) => x0 + i * (w + gap);
  const r0 = 76, r1 = 166, r2 = 256;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const expired = st(0, r0, "expired", { end: true, fill: 1 });
  const requested = st(1, r0, "requested");
  const declined = st(2, r0, "declined", { end: true, fill: 1 });
  const pending = st(0, r1, "pending_payment");
  const confirmed = st(1, r1, "confirmed");
  const inProgress = st(2, r1, "in_progress");
  const completed = st(3, r1, "completed", { end: true, hl: true });
  const cancelled = st(1, r2, "cancelled", { end: true, fill: 1 });

  s.comment("Ways in");
  s.wire([[requested.cx, 20], requested.port("t")], { start: "dot", label: "guest request\nor host offer", side: "right" });
  s.wire([[20, pending.cy], pending.port("l")], { start: "dot", label: "instant\nbook", side: "above" });

  s.comment("Into confirmed");
  s.connect(requested, confirmed, { from: "b", to: "t", label: "accepted", side: "left" });
  s.connect(pending, confirmed, { label: "paid,\nverified", side: "above" });

  s.comment("The trip's path");
  s.connect(confirmed, inProgress, { hl: true, label: "pickup\nhandoff", side: "above" });
  s.connect(inProgress, completed, { hl: true, label: "return\nhandoff", side: "above" });

  s.comment("Exits");
  s.connect(requested, expired, { from: "l", to: "r", alt: true, label: "no answer", side: "above" });
  s.connect(requested, declined, { alt: true, label: "host\ndeclines", side: "above" });
  s.connect(pending, expired, { from: "t", to: "b", alt: true, label: "hold runs out", side: "left" });
  s.connect(confirmed, cancelled, { from: "b", to: "t", alt: true, label: "guest, host\nor platform", side: "right" });

  s.comment("Notes");
  s.note(completed, "claim and review\nwindows run from here", { anchor: "right" });
  const ny = s.note(cancelled, "refund under the\nfrozen policy", { anchor: "center" });

  s.comment("Legend");
  const lg = s.legend(x0, ny + 28, [
    { kind: "hl", label: "the trip's path" },
    { kind: "alt", label: "ends it" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
