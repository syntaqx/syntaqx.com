// One personal pre-authorized debit (Canada, Rule H1) from confirmation to
// final: its states, the dishonour window, the business claim window and the
// personal claim window (the subject), all counted from settlement S.
// Embedded in content/books/payments/canada.md.
import { sheet, widthOf } from "../kit.mjs";

// Payments Canada Rule H1: business days unless noted.
const N1 = 10; // confirmation before the first debit, calendar days
const D1 = 1; // dishonour returned by, business days
const B1 = 10; // business PAD claims, business days
const P1 = 90; // personal PAD claims, calendar days

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pad", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The payor gets the confirmation at least N1 before the first debit, unless they waive or shorten it."],
    [2, "A bank dishonour, such as insufficient funds or a closed account, comes back by the next business day."],
    [3, "A claim isn't contested inside the system: the payee's remedy is outside it. After P1 the debit is final."],
    [0, "Business days unless noted. Not to scale across breaks. The drawing carries codes; values are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 business day = 76 px, with breaks ----
  s.comment("Plan view: one personal debit");
  const k = 76, h = 24, laneX = 140;
  const xC = laneX + 14; // confirmation
  const bL = [xC + 90, xC + 104]; // break before exchange
  const X = (d) => bL[1] + 10 + (d + 1) * k; // d = -1 is exchange E, 0 is S
  const bA = [X(2.3), X(2.3) + 14]; // break before S+10
  const x10 = bA[1] + 40;
  const bB = [x10 + 26, x10 + 40]; // break before S+90
  const xEnd = bB[1] + 40;
  const xFinal = W - 24;
  const axY = ny + 46;

  const ticks = [[xC, "C"], [X(-1), "E"], [X(0), "S"], [X(1), "S+1"], [X(2), "S+2"], [x10, `S+${B1}`], [xEnd, `S+${P1}`]];
  const tl = s.timeline({ x1: xC, x2: xEnd, y: axY, breaks: [bL, bA, bB], ticks, laneX, h });
  s.nb(xC + 16, axY - 13.5, 1);

  // State.
  const y1 = axY + 26;
  tl.lane(y1, "state");
  tl.bar(y1, xC, bL[0], "obj fill-2", "confirmed");
  tl.bar(y1, X(-1), X(0), "obj fill-2", "exchanged");
  tl.bar(y1, X(0), X(1), "obj fill-2", "settled");
  tl.bar(y1, X(1), xEnd, "obj fill-2", "available");
  tl.bar(y1, xEnd, xFinal, "obj fill-1", "final");
  s.rect(xEnd + 3, y1 + 3, xFinal - xEnd - 6, h - 6, "obj"); // final: a terminal state's double outline
  s.dimH(xC, X(0), y1 + h + 18, "N1", { from: [y1 + h, y1 + h], below: true });

  // Dishonour.
  const y2 = y1 + h + 48;
  tl.lane(y2, "dishonour");
  tl.bar(y2, X(0), X(D1), "obj fill-2", "returned");
  s.nb(X(D1) + 14, y2 + h / 2, 2);
  s.dimH(X(0), X(D1), y2 + h + 18, "D1", { from: [y2 + h, y2 + h], below: true });

  // Business PAD claims.
  const y3 = y2 + h + 48;
  tl.lane(y3, "business claims");
  tl.bar(y3, X(0), x10, "obj fill-2", "business PAD claims");
  s.dimH(X(0), x10, y3 + h + 18, "B1", { from: [y3 + h, y3 + h], below: true });

  // Personal PAD claims: the subject.
  const y4 = y3 + h + 48;
  tl.lane(y4, "personal claims");
  const pl = "personal PAD claims";
  tl.bar(y4, X(0), xEnd, "obj fill-1", pl);
  s.nb(X(0) + (bA[0] - X(0)) / 2 + widthOf(pl, "sl") / 2 + 12, y4 + h / 2, 3);
  s.dimH(X(0), xEnd, y4 + h + 18, "P1", { from: [y4 + h, y4 + h], below: true, hl: true });

  // Settlement: every window counts from here.
  s.line(X(0), axY + 6, X(0), y4 + h + 30, "ctr");

  const vy = y4 + h + 72;
  s.viewTitle(W / 2, vy, "Plan view · one personal pre-authorized debit", `Scale 1 business day = ${k} px · not to scale across breaks`);

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["C", "confirmation of the agreement reaches the payor", "C ≤ S − N1"],
    ["E", "exchange: the debit enters clearing", "S − 1 business day"],
    ["S", "settlement of the debit", "day 0"],
    ["N1", "confirmation before the first debit", `${N1} calendar days, at least`],
    ["D1", "dishonour returned, e.g. 901 NSF, 905 account closed", `${D1} business day`],
    ["B1", "business PAD reimbursement claims", `${B1} business days`],
    ["P1", "personal PAD reimbursement claims", `${P1} calendar days`],
  ];
  const widths = [40, 310, 150];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 52, "Variables · Payments Canada Rule H1", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
