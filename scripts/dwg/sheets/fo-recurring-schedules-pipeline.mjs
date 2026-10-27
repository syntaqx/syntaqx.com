// Recurring schedules from rule to history as a standard diagram: the
// recurrence generates occurrences that move upcoming, open, booked,
// completed (accented); a failed visit sends the occurrence back to open for
// a make-up, and skipped and missed end it. Embedded in
// content/books/field-operations/recurring-schedules.md.
import { sheet } from "../kit.mjs";

const HEADS = ["the rule", "generated", "the backlog", "on a route", "history"];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-rsp", width: W });

  // Main row: five boxes, gaps wide enough for the two-line transition labels.
  const w = 88, h = 26, gap = 70;
  const x0 = (W - (5 * w + 4 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 52;

  s.comment("Stage heads");
  HEADS.forEach((t, i) => s.text(X(i) + w / 2, r1 - 12, t, "sl", "middle"));

  s.comment("The path an occurrence should take");
  const st = (i, label, o = {}) => s.node(X(i), r1, w, h, label, { kind: "state", ...o });
  const rule = s.node(X(0), r1, w, h, "recurrence");
  const upcoming = st(1, "upcoming", { fill: 1 });
  const open = st(2, "open", { fill: 1 });
  const booked = st(3, "booked", { hl: true });
  const completed = st(4, "completed", { end: true });
  s.connect(rule, upcoming, { hl: true, label: "horizon" });
  s.connect(upcoming, open, { hl: true, label: "window\nopens" });
  s.connect(open, booked, { hl: true, label: "visit\nscheduled" });
  s.connect(booked, completed, { hl: true, label: "visit\ncompleted" });

  s.comment("Visit fails: back to the backlog for a make-up");
  const r2 = r1 + h + 40;
  const failW = 156;
  const failed = s.node(booked.cx - 30, r2, failW, h, "not_completed, cancelled", { kind: "ghost", code: true });
  s.wire([booked.port("b", 0.5), [booked.cx, r2]], { alt: true });
  const mx = open.x + w * 0.78;
  s.wire([failed.port("l"), [mx, failed.cy], open.port("b", 0.78)], { alt: true, label: "make-up", seg: 0, side: "above" });

  s.comment("Occurrence exits");
  const r3 = r2 + h + 34;
  const eh = 38, ew = 120;
  const skipped = s.node(upcoming.cx - ew / 2, r3, ew, eh, "skipped", { kind: "state", end: true, fill: 1, sub: "customer asked" });
  const missed = s.node(open.cx - ew / 2, r3, ew, eh, "missed", { kind: "state", end: true, fill: 1, sub: "window passed" });
  const jy = r2 + h / 2 + 4;
  s.wire([open.port("b", 0.22), [open.x + w * 0.22, jy], [skipped.cx, jy], skipped.port("t")], { alt: true });
  s.wire([open.port("b", 0.5), [open.cx, missed.y]], { alt: true });

  s.comment("Legend and the identity rule");
  const ly = r3 + eh + 30;
  s.legend(x0, ly, [
    { kind: "hl", label: "the path it should take" },
    { kind: "alt", label: "exit or make-up" },
    { kind: "end", label: "final state" },
  ]);
  s.text(x0, ly + 24, "an occurrence is identified by its recurrence and original due date, never by its booked date", "sl");
  s.height = Math.ceil(ly + 24 + 18);
  return s.toString();
}
