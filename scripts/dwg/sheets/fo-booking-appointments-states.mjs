// Visit states for booking as a standard state machine: a request outside
// the lifecycle, a hold the customer confirms, the visit's path to
// completed in the accent, dashed exits to cancelled and not_completed.
// Embedded in content/books/field-operations/booking-appointments.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-ba", width: W });

  // Six columns; the hold sits above the first, the main row starts in the
  // second, the exits sit below. The left channel takes the margin.
  const w = 92, h = 30, gap = 29.6;
  const x0 = W - 20 - (6 * w + 5 * gap);
  const X = (i) => x0 + i * (w + gap);
  const r0 = 24, r1 = 110, r2 = 196;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("Outside the visit lifecycle");
  const reqW = 190;
  const request = s.node(X(1) + w / 2 - reqW / 2 + 40, r0, reqW, h, "request: work order or lead", { kind: "ghost" });

  s.comment("States");
  const held = st(0, r0, "held", { fill: 1 });
  const scheduled = st(1, r1, "scheduled");
  const dispatched = st(2, r1, "dispatched");
  const enRoute = st(3, r1, "en_route");
  const onSite = st(4, r1, "on_site");
  const completed = st(5, r1, "completed", { end: true, hl: true });
  const cancelled = st(1, r2, "cancelled", { end: true, fill: 1 });
  const notCompleted = st(4, r2, "not_completed", { end: true, fill: 1 });

  s.comment("Into scheduled");
  s.wire([[scheduled.x + w * 0.7, request.y + h], scheduled.port("t", 0.7)], { label: "office books\na slot", side: "right" });
  s.wire([held.port("b"), [held.cx, scheduled.cy], scheduled.port("l")], { hl: true, seg: 0, label: "customer\nconfirms", side: "right" });

  s.comment("The visit's path");
  for (const [a, b] of [[scheduled, dispatched], [dispatched, enRoute], [enRoute, onSite], [onSite, completed]]) s.connect(a, b, { hl: true });

  s.comment("Exits");
  const ch = held.x - 16;
  s.wire([held.port("l"), [ch, held.cy], [ch, cancelled.cy], cancelled.port("l")], { alt: true });
  s.connect(scheduled, cancelled, { from: "b", to: "t", alt: true, label: "called off", side: "right" });
  s.connect(onSite, notCompleted, { from: "b", to: "t", alt: true, label: "can't be done", side: "right" });
  s.text(cancelled.cx, r2 + h + 18, "reason, by whom (an expired hold too)", "sl", "middle");
  s.text(notCompleted.cx, r2 + h + 18, "reason: not home, no access, weather", "sl", "middle");

  s.comment("Legend");
  const ly = r2 + h + 52;
  const lg = s.legend(ch, ly, [
    { kind: "hl", label: "the visit's path" },
    { kind: "alt", label: "ends it" },
    { kind: "end", label: "terminal state" },
    { kind: "ghost", label: "outside the lifecycle" },
  ]);
  const fy = lg.y + 20;
  s.text(W - 20, fy, "rescheduling changes the window, never the visit", "sl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
