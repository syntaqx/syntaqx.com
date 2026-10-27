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

  const zig = (x) => `M${x - 3},${axY + 5}L${x + 3},${axY - 5}`;
  s.line(xC, axY, bL[0], axY, "leader");
  s.line(bL[1], axY, bA[0], axY, "leader");
  s.line(bA[1], axY, bB[0], axY, "leader");
  s.line(bB[1], axY, xEnd, axY, "leader");
  s.path([bL, bA, bB].flat().map(zig).join(""), "leader");
  const ticks = [[xC, "C"], [X(-1), "E"], [X(0), "S"], [X(1), "S+1"], [X(2), "S+2"], [x10, `S+${B1}`], [xEnd, `S+${P1}`]];
  for (const [x, t] of ticks) {
    s.line(x, axY - 4, x, axY + 4, "leader");
    s.text(x, axY - 10, t, "tc", "middle");
  }
  s.nb(xC + 16, axY - 13.5, 1);

  const lane = (y, label) => s.text(laneX, y + h / 2 + 3, label, "sl ink", "end");
  // A box from x1 to x2, split wherever it crosses a break.
  const span = (y, x1, x2, cls) => {
    let a = x1;
    for (const [b0, b1] of [bL, bA, bB]) {
      if (a < b0 && x2 > b1) {
        s.rect(a, y, b0 - a, h, cls);
        a = b1;
      }
    }
    s.rect(a, y, x2 - a, h, cls);
  };

  // State.
  const y1 = axY + 26;
  lane(y1, "state");
  s.rect(xC, y1, bL[0] - xC, h, "obj fill-2");
  s.rect(X(-1), y1, k, h, "obj fill-2");
  s.rect(X(0), y1, k, h, "obj fill-2");
  span(y1, X(1), xEnd, "obj fill-2");
  s.rect(xEnd, y1, xFinal - xEnd, h, "obj fill-1");
  s.rect(xEnd + 3, y1 + 3, xFinal - xEnd - 6, h - 6, "obj");
  s.label(xC, y1, bL[0] - xC, h, "confirmed");
  s.label(X(-1), y1, k, h, "exchanged");
  s.label(X(0), y1, k, h, "settled");
  s.label(X(1), y1, bA[0] - X(1), h, "available");
  s.label(xEnd, y1, xFinal - xEnd, h, "final");
  s.dimH(xC, X(0), y1 + h + 18, "N1", { from: [y1 + h, y1 + h], below: true });

  // Dishonour.
  const y2 = y1 + h + 48;
  lane(y2, "dishonour");
  s.rect(X(0), y2, k * D1, h, "obj fill-2");
  s.label(X(0), y2, k * D1, h, "returned");
  s.nb(X(D1) + 14, y2 + h / 2, 2);
  s.dimH(X(0), X(D1), y2 + h + 18, "D1", { from: [y2 + h, y2 + h], below: true });

  // Business PAD claims.
  const y3 = y2 + h + 48;
  lane(y3, "business claims");
  span(y3, X(0), x10, "obj fill-2");
  s.label(X(0), y3, bA[0] - X(0), h, "business PAD claims");
  s.dimH(X(0), x10, y3 + h + 18, "B1", { from: [y3 + h, y3 + h], below: true });

  // Personal PAD claims: the subject.
  const y4 = y3 + h + 48;
  lane(y4, "personal claims");
  span(y4, X(0), xEnd, "obj fill-1");
  const pl = "personal PAD claims";
  s.label(X(0), y4, bA[0] - X(0), h, pl);
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
