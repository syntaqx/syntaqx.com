// One occurrence's service window on an August calendar, the next due date
// under each anchor, and the variable table. Embedded in
// content/books/field-operations/recurring-schedules.md.
import { sheet, widthOf } from "../kit.mjs";

// The August window is the chapter's example; the interval is illustrative.
const DUE = 15, DONE = 19; // August
const E1 = 7, L1 = 7;
const W1 = E1 + 1 + L1; // 15
const P1 = 90;
// Day index from August 1 (= 0); the next due dates in November.
const MONTH_START = { sep: 31, oct: 61, nov: 92 };
const N1 = DUE - 1 + P1; // nov 13
const N2 = DONE - 1 + P1; // nov 17
const nov = (d) => d - MONTH_START.nov + 1;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-rsw", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The occurrence keeps its identity (recurrence plus original due date) wherever the visit lands in the window."],
    [2, "Rebooked from aug 15 to aug 19: on time, because the window, not the due date, is the promise."],
    [3, "Schedule anchoring ignores the late visit; completion anchoring moves every later due date by it."],
    [4, "A label's minimum reapplication gap is measured like the completion row, from the last completed application."],
    [0, "Values in days. The August window is the chapter's example; the 90-day interval is illustrative."],
  ], { width: 690 });

  // ---- Plan view 1: one occurrence, 1 day = 28 px ----
  s.comment("Plan view: one occurrence");
  const k = 28, first = 4, last = 26;
  const n = last - first + 1;
  const x0 = CX - (n * k) / 2;
  const X = (day) => x0 + (day - first) * k; // left edge of an August day
  const stripY = ny + 64, sh = 20;
  s.rect(X(DUE), stripY, k, sh, "obj fill-1");
  s.rect(x0, stripY, n * k, sh, "obj");
  for (let d = first + 1; d <= last; d++) s.line(X(d), stripY, X(d), stripY + sh, "ext");
  for (let d = first; d <= last; d++) s.text(X(d) + k / 2, stripY + sh / 2 + 3.2, String(d), "tc", "middle");

  const wL = X(DUE - E1), wR = X(DUE + L1 + 1);
  s.dimH(wL, wR, stripY - 42, "W1", { from: [stripY, stripY], hl: true });
  s.dimH(wL, X(DUE), stripY - 18, "E1", { from: [null, stripY] });
  s.dimH(X(DUE + 1), wR, stripY - 18, "L1", { from: [stripY, null] });

  const barY = stripY + sh + 12, bh = 22;
  s.rect(wL, barY, wR - wL, bh, "obj hl");
  s.label(wL, barY, X(DUE) - wL, bh, "early");
  s.label(X(DUE + 1), barY, wR - X(DUE + 1), bh, "late");
  const dueX = X(DUE) + k / 2;
  s.line(dueX, stripY + sh + 4, dueX, barY + bh + 34, "ctr");
  const dueLbl = "due aug 15";
  s.text(dueX, barY + bh + 46, dueLbl, "sl ink", "middle");
  s.nb(dueX + widthOf(dueLbl, "sl") / 2 + 12, barY + bh + 43, 1);

  const vY = barY + bh + 10;
  s.rect(X(DONE) + 4, vY, k - 8, 16, "obj fill-1");
  const doneLbl = "done aug 19";
  s.callout(X(DONE) + k / 2, vY + 8, X(DONE) + k + 24, vY + 8, doneLbl);
  s.nb(X(DONE) + k + 38 + widthOf(doneLbl, "sl") + 12, vY + 8, 2);

  const t1 = barY + bh + 84;
  s.viewTitle(CX, t1, "Plan view · one occurrence, Q3", "Scale 1 day = 28 px · August · timeline");

  // ---- Plan view 2: next due date by anchor, 1 day = 5 px ----
  s.comment("Plan view: next due date by anchor");
  const k2 = 5, d0 = 7, d1 = 117; // aug 8 to nov 26
  const x2 = CX - ((d1 - d0) * k2) / 2 + 20;
  const Y = (d) => x2 + (d - d0) * k2;
  const rulerY = t1 + 13 + 50;
  s.line(Y(d0), rulerY, Y(d1), rulerY, "ext");
  s.text(Y(d0), rulerY - 6, "aug", "sl");
  for (const [m, d] of Object.entries(MONTH_START)) {
    s.line(Y(d), rulerY - 4, Y(d), rulerY + 4, "ext");
    s.text(Y(d) + 4, rulerY - 6, m, "sl");
  }

  const laneGap = 78;
  const lanes = [
    { y: rulerY + 56, name: "schedule", from: DUE - 1, next: N1, code: "N1", lbl: "due aug 15" },
    { y: rulerY + 56 + laneGap, name: "completion", from: DONE - 1, next: N2, code: "N2", lbl: "done aug 19" },
  ];
  for (const L of lanes) {
    s.text(Y(d0) - 12, L.y + 3, L.name, "sl ink", "end");
    s.line(Y(d0), L.y, Y(d1), L.y, "ext");
    const sx = Y(L.next) - (W1 * k2) / 2;
    s.rect(sx, L.y - 10, W1 * k2, 20, "slot");
    s.line(Y(L.next), L.y - 14, Y(L.next), L.y + 14, "ctr");
    s.add(`<circle class="dot" cx="${Y(L.from)}" cy="${L.y}" r="2.6"/>`);
    s.dimH(Y(L.from), Y(L.next), L.y - 24, "P1", { from: [L.y, L.y - 10] });
    s.text(Y(L.from), L.y + 18, L.lbl, "sl ink", "middle");
    s.text(sx - 6, L.y + 18, L.code, "dt", "end");
  }
  const [sc, co] = lanes;
  s.nb(Y(co.from) + widthOf(co.lbl, "sl") / 2 + 12, co.y + 15, 4);

  // Lateness carried forward.
  const dY = co.y + 40;
  s.dimH(Y(N1), Y(N2), dY, "Δ1", { from: [sc.y + 14, co.y + 14], below: true });
  s.nb(Y(N2) + 26, dY, 3);

  const t2 = dY + 50;
  s.viewTitle(CX, t2, "Plan view · next due date by anchor", "Scale 1 day = 5 px · August to November · timeline");

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["W1", "service window, aug 8 to aug 22", `E1 + 1 + L1 = ${W1}`],
    ["E1", "early tolerance, window_before_days", String(E1)],
    ["L1", "late tolerance, window_after_days", String(L1)],
    ["P1", "interval", String(P1)],
    ["N1", "next due, schedule anchor", `aug ${DUE} + P1 = nov ${nov(N1)}`],
    ["N2", "next due, completion anchor", `aug ${DONE} + P1 = nov ${nov(N2)}`],
    ["Δ1", "lateness carried forward", `N2 − N1 = ${N2 - N1}`],
  ];
  const tw = [0, 1, 2].reduce((w, j) => w + Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(["CODE", "VARIABLE", "VALUE"][j], "th")) + 14)), 0);
  const tb = s.table(CX - tw / 2, t2 + 13 + 56, "Variables · days", rows);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
