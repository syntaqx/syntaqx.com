// Semiweekly federal deposit periods around Thanksgiving 2026: a Wednesday to
// Friday period due the following Wednesday, a Saturday to Tuesday period whose
// Friday due date moves to Monday because Thursday is a legal holiday, and a
// $100,000 day due the next business day (the subject).
// Embedded in content/books/workforce/deposits-and-returns.md.
import { sheet, widthOf } from "../kit.mjs";

// IRS Publication 15 (2026), section 11. Day 0 = Wednesday, November 18, 2026.
const DAYS = 13; // Wed Nov 18 through Mon Nov 30
const WEEKDAY = ["W", "T", "F", "S", "S", "M", "T", "W", "T", "F", "S", "S", "M"];
const HOLIDAY = 8; // Thursday, November 26: Thanksgiving Day

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "wf-sd", width: W });

  s.comment("Notes");
  const ny = s.notes(
    32,
    40,
    [
      [
        1,
        "Deposit periods are fixed by weekday, not by payday: Wednesday to Friday, then Saturday to Tuesday.",
      ],
      [
        2,
        "Each period gets at least 3 business days after it closes; a DC legal holiday in those days adds one.",
      ],
      [
        3,
        "$100,000 accumulated on one day overrides the period: deposit by the next business day.",
      ],
      [
        0,
        "Calendar days, November 2026. The drawing carries codes; dates and rules are in the table.",
      ],
    ],
    { width: 690 },
  );

  // ---- Plan view: 1 calendar day = 44 px ----
  s.comment("Plan view: two deposit periods and a next-day deposit");
  const k = 44,
    x0 = 160;
  const X = (d) => x0 + d * k;
  const axY = ny + 58;
  const h = 24;
  const laneX = x0 - 14;
  const ticks = [...Array(DAYS + 1).keys()].map((d) => [X(d), d < DAYS ? String(18 + d) : "1"]);
  const tl = s.timeline({ x1: X(0), x2: X(DAYS), y: axY, ticks, laneX, h });
  // Weekday letters under the axis, centered in each day.
  for (let d = 0; d < DAYS; d++) s.text(X(d) + k / 2, axY + 16, WEEKDAY[d], "tc", "middle");

  const y1 = axY + 32;
  const y2 = y1 + h + 48;
  const y3 = y2 + h + 48;
  const bottom = y3 + h + 44;

  // Holiday column.
  s.rect(X(HOLIDAY), y1 - 6, k, y2 + h + 6 - (y1 - 6), "hatch", { fill: s.hatch });
  const cy = y1 + h + 22;
  s.callout(X(HOLIDAY + 1), cy, X(HOLIDAY + 1) + 30, cy, "legal holiday", { dir: 1 });

  // Wednesday to Friday period, due the following Wednesday.
  tl.lane(y1, "wed to fri");
  tl.bar(y1, X(0), X(3), "obj fill-1", "paydays");
  tl.bar(y1, X(3), X(8), "obj fill-2", "deposit window");
  s.nb(X(0) - 2, y1 - 12, 1);
  s.chainH([X(0), X(3), X(8)], y1 + h + 18, ["P1", "D1"], { from: [y1 + h, y1 + h], below: true });

  // Saturday to Tuesday period, due Friday, moved to Monday by the holiday.
  tl.lane(y2, "sat to tue");
  tl.bar(y2, X(3), X(7), "obj fill-1", "paydays");
  tl.bar(y2, X(7), X(DAYS), "obj fill-2", "deposit window");
  s.nb(X(10) + k / 2, y2 - 12, 2);
  s.chainH([X(3), X(7), X(10), X(DAYS)], y2 + h + 18, ["P2", "D2", "H2"], {
    from: [y2 + h, y2 + h],
    below: true,
  });

  // A $100,000 day on Monday: due Tuesday.
  tl.lane(y3, "next-day");
  tl.bar(y3, X(5), X(6), "obj fill-1");
  tl.bar(y3, X(6), X(7), "obj fill-2");
  s.nb(X(7) + 14, y3 + h / 2, 3);
  s.dimH(X(5), X(7), y3 + h + 18, "N1", { from: [y3 + h, y3 + h], below: true, hl: true });

  const vy = bottom + 30;
  s.viewTitle(
    (laneX - widthOf("sat to tue", "sl") + X(DAYS)) / 2,
    vy,
    "Plan view · semiweekly deposits, Thanksgiving week 2026",
    `Scale 1 calendar day = ${k} px · day 0 = Wednesday, November 18`,
  );

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["P1", "deposit period, paydays Wednesday to Friday", "Nov 18 to Nov 20"],
    ["D1", "due the following Wednesday", "Wed Nov 25"],
    ["P2", "deposit period, paydays Saturday to Tuesday", "Nov 21 to Nov 24"],
    ["D2", "due the following Friday", "Fri Nov 27"],
    ["H2", "one more day for the holiday in the 3 weekdays", "Mon Nov 30"],
    ["N1", "$100,000 accumulated Monday: next business day", "Tue Nov 24"],
  ];
  const widths = [40, 330, 140];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 52, "Variables · IRS Publication 15 (2026)", rows, {
    widths,
  });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
