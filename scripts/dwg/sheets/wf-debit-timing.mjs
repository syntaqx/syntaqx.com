// Client debit timing back from a Friday check date in Veterans Day week 2026:
// 4-day, 2-day and next-day debits, each with the ACH debit in flight and its
// 2-banking-day return window, against the check date when net pay settles.
// The 2-day exposure past the check date is the subject.
// Embedded in content/books/workforce/funding-a-payroll.md.
import { sheet, widthOf } from "../kit.mjs";

// Day 0 = Thursday, November 5, 2026. Federal Reserve holiday: Wednesday,
// November 11 (Veterans Day). Check date: Friday, November 13.
const DAYS = 14; // Thu Nov 5 through Wed Nov 18
const WEEKDAY = ["T", "F", "S", "S", "M", "T", "W", "T", "F", "S", "S", "M", "T", "W"];
const HOLIDAY = 6;
const CHECK = 8;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "wf-dt", width: W });

  s.comment("Notes");
  const ny = s.notes(
    32,
    40,
    [
      [
        1,
        "Speed counts banking days back from the check date; weekends and Federal Reserve holidays don't count.",
      ],
      [
        2,
        "A debit settles the banking day after it is sent; administrative returns arrive within 2 banking days of settlement.",
      ],
      [
        3,
        "On faster speeds net pay settles before the debit's return window closes: the provider is lending.",
      ],
      [
        0,
        "Illustrative model of a next-day ACH debit to a business account. Codes on the drawing; dates in the table.",
      ],
    ],
    { width: 690 },
  );

  s.comment("Plan view: three payroll speeds against one check date");
  const k = 38,
    x0 = 170;
  const X = (d) => x0 + d * k;
  const axY = ny + 58;
  const h = 22;
  const laneX = x0 - 14;
  const ticks = [...Array(DAYS + 1).keys()].map((d) => [X(d), String(5 + d)]);
  const tl = s.timeline({ x1: X(0), x2: X(DAYS), y: axY, ticks, laneX, h });
  for (let d = 0; d < DAYS; d++) s.text(X(d) + k / 2, axY + 16, WEEKDAY[d], "tc", "middle");

  const gap = 52;
  const y1 = axY + 34;
  const y2 = y1 + h + gap;
  const y3 = y2 + h + gap;
  const bottom = y3 + h + 40;

  // Holiday column and check date line.
  s.rect(X(HOLIDAY), y1 - 6, k, y3 + h + 6 - (y1 - 6), "hatch", { fill: s.hatch });
  s.line(X(CHECK), y1 - 10, X(CHECK), y3 + h + 10, "ctr");
  s.callout(X(HOLIDAY), y3 + h, X(HOLIDAY) - 40, y3 + h + 24, "bank holiday", {
    dir: -1,
  });
  s.callout(X(CHECK), y3 + h + 10, X(CHECK) + 24, y3 + h + 24, "check date", {
    dir: 1,
  });

  const lane = (y, name, debit, settle, close, codes, hl) => {
    tl.lane(y, name);
    tl.bar(y, X(debit), X(settle), "obj fill-1");
    tl.bar(y, X(settle), X(close), "obj fill-2", close - settle > 3 ? "return window" : "");
    s.dimH(X(debit), X(CHECK), y + h + 16, codes[0], { from: [y + h, y + h], below: true });
    if (codes[1]) s.dimH(X(CHECK), X(close), y - 12, codes[1], { from: [y, y], hl });
  };

  lane(y1, "4-day", 1, 4, CHECK, ["L4"]);
  s.nb(X(1) - 16, y1 + h / 2 - 7, 1);
  lane(y2, "2-day", 5, 7, 13, ["L2", "E2"], true);
  s.nb(X(5) - 16, y2 + h / 2 - 7, 2);
  lane(y3, "next-day", 7, 8, 13, ["L1", "E1"]);
  s.nb(X(13) + 8, y3 + h / 2 - 7, 3);

  const vy = bottom + 24;
  s.viewTitle(
    (laneX - widthOf("next-day", "sl") + X(DAYS)) / 2,
    vy,
    "Plan view · debit timing for a Friday, November 13, 2026 check date",
    `Scale 1 calendar day = ${k} px · day 0 = Thursday, November 5`,
  );

  s.comment("Variable table");
  const rows = [
    ["L4", "4-day: debit sent Fri Nov 6, settles Mon Nov 9", "4 banking days"],
    ["", "returns in by Thu Nov 12, before net pay is sent", "no exposure"],
    ["L2", "2-day: debit sent Tue Nov 10, settles Thu Nov 12", "2 banking days"],
    ["E2", "returns can arrive until Tue Nov 17", "2 banking days after"],
    ["L1", "next-day: debit sent Thu Nov 12, settles Fri Nov 13", "1 banking day"],
    ["E1", "returns can arrive until Tue Nov 17", "2 banking days after"],
  ];
  const widths = [40, 360, 140];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(
    W / 2 - tw / 2,
    vy + 52,
    "Variables · Gusto Embedded speeds, Fed holidays",
    rows,
    {
      widths,
    },
  );
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
