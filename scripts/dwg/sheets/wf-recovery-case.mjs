// A recovery case for a failed payroll debit: re-debit through its return
// window or a wire to resolved (the accent path is the wire), a returned
// re-debit to collections, and collections ending in a partner transfer or a
// write-off. Embedded in content/books/workforce/failed-debits-and-recovery.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "wf-rc", width: W });

  const w = 124,
    h = 30,
    gap = 72;
  const x0 = (W - (4 * w + 3 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r0 = 40,
    r1 = 130,
    r2 = 230;
  const st = (x, y, label, o = {}) =>
    s.node(x, y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const open = st(X(0), r1, "open");
  const inflight = st(X(1), r1, "redebit_in_flight");
  const awaiting = st(X(2), r1, "awaiting_window");
  const resolved = st(X(3), r1, "resolved", { end: true, hl: true });
  const wire = st((X(1) + X(2)) / 2, r0, "expecting_wire");
  const coll = st(X(1), r2, "collections");
  const partner = st(X(2), r2, "transferred");
  const writeoff = st(X(3), r2, "written_off", { end: true, fill: 1 });

  s.comment("Wire: the fastest cure");
  s.connect(open, wire, { from: "t", to: "l", hl: true, label: "wire requested", side: "left" });
  s.connect(wire, resolved, { from: "r", to: "t", hl: true, label: "wire arrives", side: "right" });

  s.comment("Re-debit through its own return window");
  s.connect(open, inflight, { label: "re-debit", side: "below" });
  s.connect(inflight, awaiting, { label: "settles", side: "below" });
  s.connect(awaiting, resolved, { label: "clears", side: "below" });
  s.connect(awaiting, coll, {
    from: "b",
    to: "t",
    alt: true,
    label: "returned again",
    side: "right",
  });

  s.comment("Collections");
  s.connect(open, coll, { from: "b", to: "l", alt: true, label: "no cure", side: "left" });
  s.connect(coll, partner, { alt: true, label: "day 90", side: "above" });
  s.connect(partner, writeoff, { alt: true, label: "bad debt", side: "above" });

  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the cure that can't be returned" },
    { kind: "alt", label: "failure and collection" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
