// One consumer ACH debit after settlement: its state, the administrative
// return window, the unauthorized return window (the subject) and the
// Originator's reversal window, all from the settlement date S.
// Embedded in content/books/payments/ach.md (reversals).
import { sheet, widthOf } from "../kit.mjs";

// Nacha Operating Rules: banking days unless noted.
const R1 = 2; // administrative returns, banking days
const U1 = 60; // unauthorized consumer returns, calendar days
const V1 = 5; // Originator's reversal, banking days
const DAYS = 6; // banking days drawn to scale before the break

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pm-aw", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Every window runs from the settlement date S; weekends and holidays aren't banking days."],
    [2, "Until U1 closes, the RDFI returns the debit on the consumer's written statement, with no evidence step."],
    [3, "Only for Nacha's listed errors, with REVERSAL in the Company Entry Description. It's not a collection tool."],
    [0, "Banking days unless noted. The drawing carries codes; values and return codes are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 banking day = 62 px to the break ----
  s.comment("Plan view: windows after settlement");
  const k = 62, x0 = 150;
  const X = (d) => x0 + d * k;
  const brk0 = X(DAYS + 0.5), brk1 = brk0 + 14; // the break
  const xEnd = brk1 + 44; // S+60, past the break
  const xFinal = xEnd + 84; // the open-ended final state
  const axY = ny + 46;
  const h = 24;
  const laneX = x0 - 14;

  // Axis: banking days to the break, then S+60.
  s.line(X(0), axY, brk0, axY, "leader");
  s.line(brk1, axY, xEnd, axY, "leader");
  s.path(`M${brk0 - 3},${axY + 5}L${brk0 + 3},${axY - 5}M${brk1 - 3},${axY + 5}L${brk1 + 3},${axY - 5}`, "leader");
  const ticks = [...Array(DAYS + 1).keys()].map((d) => [X(d), d ? `S+${d}` : "S"]).concat([[xEnd, `S+${U1}`]]);
  for (const [x, t] of ticks) {
    s.line(x, axY - 4, x, axY + 4, "leader");
    s.text(x, axY - 10, t, "tc", "middle");
  }
  s.nb(X(0) + 14, axY - 13.5, 1);

  const lane = (y, label) => s.text(laneX, y + h / 2 + 3, label, "sl ink", "end");
  // Boxes split by the break: [x1, x2] spans, with x2 past brk0 split in two.
  const span = (y, x1, x2, cls) => {
    if (x2 <= brk0) return s.rect(x1, y, x2 - x1, h, cls);
    s.rect(x1, y, brk0 - x1, h, cls);
    return s.rect(brk1, y, x2 - brk1, h, cls);
  };

  // State.
  const y1 = axY + 26;
  lane(y1, "state");
  span(y1, X(0), X(R1), "obj fill-2");
  span(y1, X(R1), xEnd, "obj fill-2");
  s.rect(xEnd, y1, xFinal - xEnd, h, "obj fill-1");
  s.label(X(0), y1, X(R1) - X(0), h, "settled");
  s.label(X(R1), y1, brk0 - X(R1), h, "available");
  s.label(xEnd, y1, xFinal - xEnd, h, "final");

  // Administrative returns.
  const y2 = y1 + h + 30;
  lane(y2, "returns");
  span(y2, X(0), X(R1), "obj fill-2");
  s.label(X(0), y2, X(R1) - X(0), h, "admin returns");
  s.dimH(X(0), X(R1), y2 + h + 18, "R1", { from: [y2 + h, y2 + h], below: true });

  // Unauthorized returns: the subject.
  const y3 = y2 + h + 48;
  lane(y3, "unauthorized");
  span(y3, X(0), xEnd, "obj fill-1");
  const ul = "unauthorized returns";
  s.label(X(0), y3, brk0 - X(0), h, ul);
  s.nb(X(0) + (brk0 - X(0)) / 2 + widthOf(ul, "sl") / 2 + 10, y3 + h / 2, 2);
  s.dimH(X(0), xEnd, y3 + h + 18, "U1", { from: [y3 + h, y3 + h], below: true, hl: true });

  // Originator reversal.
  const y4 = y3 + h + 48;
  lane(y4, "reversal");
  span(y4, X(0), X(V1), "obj fill-2");
  s.label(X(R1), y4, X(V1) - X(R1), h, "originator reversal");
  s.dimH(X(0), X(V1), y4 + h + 18, "V1", { from: [y4 + h, y4 + h], below: true });
  s.nb(X(V1 / 2) + 22, y4 + h + 26.5, 3);

  // Funds become available when the administrative window closes.
  s.line(X(R1), axY + 6, X(R1), y4 + h + 30, "ctr");

  const vy = y4 + h + 72;
  s.viewTitle((laneX - widthOf("unauthorized", "sl") + xFinal) / 2, vy, "Plan view · one consumer debit after settlement", `Scale 1 banking day = ${k} px to the break · not to scale after it`);

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["S", "settlement date of the debit", "day 0"],
    ["R1", "administrative returns: R01-R04, R09, R16, R17, R29", `${R1} banking days`],
    ["U1", "unauthorized consumer returns: R05, R07, R10, R11, R51", `${U1} calendar days`],
    ["V1", "Originator's reversal must reach the RDFI", `${V1} banking days`],
  ];
  const widths = [40, 300, 110];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 52, "Variables · Nacha Operating Rules", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
