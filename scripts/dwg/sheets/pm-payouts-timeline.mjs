// One US card payment on a business-day timeline: the payment, the
// merchant's balance and the payout, with the dispute window running past a
// break. Embedded in content/books/payments/payouts-and-settlement.md.
import { sheet, widthOf } from "../kit.mjs";

// Business days. S1 and P1 illustrative [1]; A1 published US standard [2];
// R1 ACH return window in banking days; D1 calendar days, drawn past a break.
const S1 = 1, A1 = 2, P1 = 1, R1 = 2;
const DAYS = 5; // ruler T..T+5 before the break

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pm-pt", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative: settlement on T+1 and a next-day ACH payout are one common schedule; banks and providers vary."],
    [2, "Stripe's published standard timing for US accounts. A new account's first payout waits 7 to 14 days instead."],
    [3, "A payout can still come back as an ACH return after it shows paid; the amount returns to the balance."],
    [4, "Disputes keep arriving after the money has left, which is what reserves are for."],
    [0, "Values in business days unless noted. Not to scale after the break. Codes on the drawing; values in the table."],
  ], { width: 690 });

  s.comment("Plan view: one payment");
  const k = 110, x0 = 120, BRK = 6, TAIL = 26;
  const X = (d) => x0 + d * k;
  const xBreak = X(DAYS), xEnd = xBreak + 2 * BRK + 8 + TAIL; // break gap, then the tail to day 120
  const tailX = xEnd - TAIL;

  // Ruler
  const R = ny + 42;
  s.line(X(0), R, xBreak, R, "obj");
  s.line(tailX, R, xEnd, R, "obj");
  for (let d = 0; d <= DAYS; d++) {
    s.line(X(d), R - 4, X(d), R + 4, "obj");
    s.text(X(d), R - 10, d ? `T+${d}` : "T", "sl ink", "middle");
  }
  s.line(xEnd, R - 4, xEnd, R + 4, "obj");
  const brk = (x, y) => s.path(`M${x + 1},${y + 5}L${x + 7},${y - 5}M${x + 7},${y + 5}L${x + 13},${y - 5}`, "obj");
  brk(xBreak + 1, R);

  const h = 28, rowLabel = (y, t) => s.text(x0 - 14, y + h / 2 + 3, t, "sl ink", "end");

  // Payment row
  const pay = R + 58;
  rowLabel(pay, "payment");
  s.rect(X(0), pay, S1 * k, h, "obj fill-2");
  s.rect(X(S1), pay, xBreak - X(S1), h, "obj fill-2");
  s.rect(tailX, pay, TAIL, h, "obj fill-2");
  brk(xBreak + 1, pay + h / 2);
  s.label(X(0), pay, S1 * k, h, "captured");
  s.label(X(S1), pay, xBreak - X(S1), h, "settled, disputable");
  const dy = pay - 22;
  s.dimH(X(0), xEnd, dy, "D1", { from: [pay, pay] });
  s.nb((X(0) + xEnd) / 2 + 22, dy - 7.5, 4);
  s.dimH(X(0), X(S1), pay + h + 20, "S1", { from: [pay + h, pay + h], below: true });
  s.nb((X(0) + X(S1)) / 2 + 20, pay + h + 28.5, 1);

  // Balance row: the subject
  const bal = pay + h + 58;
  rowLabel(bal, "balance");
  s.rect(X(0), bal, A1 * k, h, "obj fill-2");
  s.rect(X(A1), bal, k, h, "obj fill-1");
  s.label(X(0), bal, A1 * k, h, "pending");
  s.label(X(A1), bal, k, h, "available");
  s.dimH(X(0), X(A1), bal + h + 20, "A1", { from: [bal + h, bal + h], below: true, hl: true });
  s.nb(X(A1 / 2) + 20, bal + h + 28.5, 2);

  // Payout row
  const po = bal + h + 58;
  rowLabel(po, "payout");
  s.rect(X(A1), po, P1 * k, h, "obj fill-2");
  s.rect(X(A1 + P1), po, R1 * k, h, "obj fill-1");
  s.label(X(A1), po, P1 * k, h, "in transit");
  s.label(X(A1 + P1), po, R1 * k, h, "paid, may fail");
  s.nb(X(A1 + P1 + R1 / 2) + widthOf("paid, may fail", "sl") / 2 + 12, po + h / 2 - 0.5, 3);
  s.chainH([X(A1), X(A1 + P1), X(A1 + P1 + R1)], po + h + 20, ["P1", "R1"], { from: [po + h, po + h, po + h], below: true });
  s.nb(X(A1 + P1 / 2) + 20, po + h + 28.5, 1);

  // Available-balance line: where the balance becomes available and the payout starts.
  s.line(X(A1), bal - 10, X(A1), po - 4, "ctr");

  const vy = po + h + 70;
  s.viewTitle((x0 + xEnd) / 2, vy, "Plan view · one US card payment, established merchant", "Scale 1 business day = 110 px · timeline");

  s.comment("Variable table");
  const rows = [
    ["S1", "capture to network settlement, illustrative", "1"],
    ["A1", "capture to available balance, US standard", "2"],
    ["P1", "payout in transit, next-day ACH credit, illustrative", "1"],
    ["R1", "payout return window, banking days: R02-R04, R16", "2"],
    ["D1", "dispute window from the payment, calendar days, typical", "120"],
  ];
  const widths = [50, 330, 90];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 13 + 56, "Variables · business days", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
