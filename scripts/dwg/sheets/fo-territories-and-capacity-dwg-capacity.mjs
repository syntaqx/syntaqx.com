// One shift's capacity split by a movable share into a quota and a reserve,
// with illustrative bookings in each, and the variable tables. Embedded in
// content/books/field-operations/territories-and-capacity.md.
import { sheet } from "../kit.mjs";

// Minutes. r from Timefold's example [1]; bookings illustrative [3].
const S1 = 480, r = 0.5;
const M1 = r * S1; // 240
const F1 = S1 - M1; // 240
const U1 = 210, U2 = 90;
const C1 = M1 - U1; // 30
const R2 = F1 - U2; // 150

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-tcc", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Timefold's movableOccupationRatioThreshold: at 0.5, an eight-hour shift keeps about four hours free."],
    [2, "The same arithmetic as Oracle's Capacity = Quota - Used: at C1 = 0 the shift takes no more movable work."],
    [3, "Illustrative bookings."],
    [4, "The bars are quantities, not times of day; the solver decides when in the day each visit runs."],
    [0, "Values in minutes. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: one shift, 1 min = 1.3 px ----
  s.comment("Plan view: one shift");
  const k = 1.3;
  const x0 = CX - (S1 * k) / 2;
  const X = (m) => x0 + m * k;
  const h = 28;
  const top = ny + 76; // quota row
  const bk = top + h + 30; // bookings row
  let viewBottom;
  {
    // Quota row: movable quota and reserve.
    s.rect(X(0), top, M1 * k, h, "obj fill-2");
    s.rect(X(M1), top, F1 * k, h, "obj fill-2");
    s.label(X(0), top, M1 * k, h, "movable · recurring, multi-day");
    s.label(X(M1), top, F1 * k, h, "reserved · fixed and urgent");

    // Bookings row: booked movable, movable left, booked fixed, held.
    s.rect(X(0), bk, U1 * k, h, "obj fill-1");
    s.rect(X(U1), bk, C1 * k, h, "slot");
    s.rect(X(M1), bk, U2 * k, h, "obj fill-1");
    s.rect(X(M1 + U2), bk, R2 * k, h, "slot");
    s.label(X(0), bk, U1 * k, h, "booked movable");
    s.label(X(M1), bk, U2 * k, h, "booked");
    s.label(X(M1 + U2), bk, R2 * k, h, "held for urgent");

    // Dimensions above: S1 overall, then M1 (the subject) and F1.
    const qy = top - 20, sy = top - 42;
    s.chainH([X(0), X(M1), X(S1)], qy, ["M1", "F1"], { from: [top, top, top], hl: [0] });
    s.nb(X(M1 / 2) + 18, qy - 7.5, 1);
    s.dimH(X(0), X(S1), sy, "S1", { from: [qy, qy] });

    // Dimensions below: the bookings chain.
    const cy = bk + h + 20;
    const xs = [X(0), X(U1), X(M1), X(M1 + U2), X(S1)];
    s.chainH(xs, cy, ["U1", "C1", "U2", "R2"], { from: xs.map(() => bk + h), below: true });
    s.nb(X(U1 / 2) + 18, cy + 8, 3);
    s.nb(X(U1 + C1 / 2), cy + 27, 2);

    // Threshold r: the line between quota and reserve.
    const ty = cy + 52;
    s.line(X(M1), top - 8, X(M1), ty - 12, "ctr");
    s.text(X(M1) - 4, ty, "threshold", "sl ink", "end");
    s.text(X(M1) + 4, ty + 0.5, "r", "dt");

    const vy = ty + 44;
    s.viewTitle(CX, vy, "Plan view · one shift's capacity", "Scale 1 min = 1.3 px · quantities");
    s.nb(CX + 128, vy - 4, 4);
    viewBottom = vy + 13;
  }

  // ---- Variable tables, side by side ----
  s.comment("Variable tables");
  const ty = viewBottom + 56;
  const widths = [40, 150, 120];
  const tw = widths.reduce((a, b) => a + b, 0);
  const gap = 40;
  const lx = CX - tw - gap / 2;
  const a = s.table(lx, ty, "Variables · quota", [
    ["S1", "shift", "8 h = 480"],
    ["r", "movable share", "0.5"],
    ["M1", "movable quota", `r × S1 = ${M1}`],
    ["F1", "reserve", `S1 − M1 = ${F1}`],
  ], { widths });
  const b = s.table(CX + gap / 2, ty, "Variables · bookings", [
    ["U1", "movable booked", `${U1}`],
    ["C1", "movable left", `M1 − U1 = ${C1}`],
    ["U2", "fixed or urgent booked", `${U2}`],
    ["R2", "reserve left", `F1 − U2 = ${R2}`],
  ], { widths });
  s.height = Math.ceil(Math.max(a.y, b.y) + 32);
  return s.toString();
}
