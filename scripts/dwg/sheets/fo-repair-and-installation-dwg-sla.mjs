// Response and resolution clocks on one commercial work order, counted in
// business hours, the on-site arrival in detail, and the variable table.
// Embedded in content/books/field-operations/repair-and-installation.md.
import { sheet } from "../kit.mjs";

// Illustrative calendar [1]: weekdays 08 to 17; Tuesday drawn from 12:00.
const OPEN = 8, CLOSE = 17, TUE_FROM = 12;
const CALL = 15; // Tuesday 15:00
const B = [CLOSE - CALL, 11 - OPEN, CLOSE - 14, 16 - OPEN]; // B1..B4 = 2, 3, 3, 8
const PAUSE = [11, 14]; // Wednesday, waiting on customer access (P1 = 3)
const RESP_DUE = 10, ON_SITE = 9.5; // Wednesday
const RESOLVED = 14, RES_DUE = OPEN + B[3]; // Thursday

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-ris", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative: weekdays 08:00 to 17:00 in the property's zone, a 4 h response and a 16 h resolution target."],
    [2, "A pause needs a reason; store started, paused, resumed and met as events so a breach can be replayed."],
    [3, "Nights are drawn as fixed breaks, not to scale; outside business hours neither clock counts."],
    [0, "Values in business hours. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: two clocks, 1 h = 20 px, nights fixed ----
  s.comment("Plan view: two clocks on one work order");
  const k = 20, NIGHT = 40;
  const day = (CLOSE - OPEN) * k;
  const tueW = (CLOSE - TUE_FROM) * k;
  const total = tueW + NIGHT + day + NIGHT + day;
  const x0 = CX + 30 - total / 2;
  const wed0 = x0 + tueW + NIGHT, thu0 = wed0 + day + NIGHT;
  const tue = (h) => x0 + (h - TUE_FROM) * k;
  const wed = (h) => wed0 + (h - OPEN) * k;
  const thu = (h) => thu0 + (h - OPEN) * k;
  const h = 20, lx = x0 - 12;

  // Calendar strip.
  const calY = ny + 46;
  s.rect(x0, calY, tueW, h, "obj fill-2");
  s.rect(x0 + tueW, calY, NIGHT, h, "hatch", { fill: s.hatch });
  s.rect(wed0, calY, day, h, "obj fill-2");
  s.rect(wed0 + day, calY, NIGHT, h, "hatch", { fill: s.hatch });
  s.rect(thu0, calY, day, h, "obj fill-2");
  s.text(x0 + 8, calY + h / 2 + 3, "tue", "sl ink");
  s.text(wed0 + 8, calY + h / 2 + 3, "wed 08 to 17", "sl ink");
  s.text(thu0 + 8, calY + h / 2 + 3, "thu 08 to 17", "sl ink");
  s.text(lx, calY + h / 2 + 3, "calendar", "sl ink", "end");
  s.nb(x0 + tueW + NIGHT / 2, calY - 10, 3);

  // Response clock.
  const rY = calY + h + 56;
  s.text(lx, rY + h / 2 + 3, "response", "sl ink", "end");
  s.rect(tue(CALL), rY, tue(CLOSE) - tue(CALL), h, "obj fill-1");
  s.rect(wed(OPEN), rY, wed(ON_SITE) - wed(OPEN), h, "obj fill-1");
  s.rect(wed(ON_SITE), rY, wed(RESP_DUE) - wed(ON_SITE), h, "slot");
  s.dimH(tue(CALL), wed(RESP_DUE), rY - 18, "R1", { from: [rY, rY] });
  s.nb((tue(CALL) + wed(RESP_DUE)) / 2 + 22, rY - 25.5, 1);
  const dA = [wed(ON_SITE), rY + h / 2];
  s.detailRef(dA[0], dA[1], 16, "detail A", dA[0] + 46, rY - 12);

  // Resolution clock.
  const sY = rY + h + 62;
  s.text(lx, sY + h / 2 + 3, "resolution", "sl ink", "end");
  s.rect(tue(CALL), sY, tue(CLOSE) - tue(CALL), h, "obj fill-1");
  s.rect(wed(OPEN), sY, wed(PAUSE[0]) - wed(OPEN), h, "obj fill-1");
  s.rect(wed(PAUSE[0]), sY, wed(PAUSE[1]) - wed(PAUSE[0]), h, "hatch", { fill: s.hatch });
  s.text((wed(PAUSE[0]) + wed(PAUSE[1])) / 2, sY + h / 2 + 3, "paused", "sl ink ko", "middle");
  s.rect(wed(PAUSE[1]), sY, wed(CLOSE) - wed(PAUSE[1]), h, "obj fill-1");
  s.rect(thu(OPEN), sY, thu(RESOLVED) - thu(OPEN), h, "obj fill-1");
  s.rect(thu(RESOLVED), sY, thu(RES_DUE) - thu(RESOLVED), h, "slot");
  s.text((thu(RESOLVED) + thu(RES_DUE)) / 2, sY + h / 2 + 3, "slack", "sl", "middle");
  s.dimH(tue(CALL), thu(RES_DUE), sY - 18, "S1", { from: [sY, sY] });
  s.nb((tue(CALL) + thu(RES_DUE)) / 2 + 20, sY - 25.5, 1);

  // Chain under the resolution clock: counted hours and the pause.
  const cy = sY + h + 20;
  const segs = [
    [tue(CALL), tue(CLOSE), "B1"],
    [wed(OPEN), wed(PAUSE[0]), "B2"],
    [wed(PAUSE[0]), wed(PAUSE[1]), "P1"],
    [wed(PAUSE[1]), wed(CLOSE), "B3"],
    [thu(OPEN), thu(RES_DUE), "B4"],
  ];
  for (const [a, b, l] of segs) s.dimH(a, b, cy, l, { from: [sY + h, sY + h], below: true, hl: l === "P1" });
  s.nb((wed(PAUSE[0]) + wed(PAUSE[1])) / 2 + 19, cy + 8.5, 2);

  // Events: centerlines from the calendar to their labels.
  const eA = cy + 40, eB = eA + 15;
  const events = [
    [tue(CALL), eA, "call tue 15:00", "middle"],
    [wed(RESP_DUE), eB, "response due wed 10:00", "middle"],
    [thu(RESOLVED), eA, "resolved thu 14:00", "end"],
    [thu(RES_DUE), eB, "resolution due thu 16:00", "middle"],
  ];
  for (const [x, y, l, a] of events) {
    s.line(x, calY + h + 6, x, y - 11, "ctr");
    s.text(a === "end" ? x + 4 : x, y, l, "sl ink", a);
  }

  const vtY = eB + 36;
  s.viewTitle(CX, vtY, "Plan view · two clocks on one work order", "Scale 1 h = 20 px · timeline · business hours");
  const planBottom = vtY + 13;

  // ---- Detail A: arrival before the response deadline, 1 h = 100 px ----
  s.comment("Detail A: on-site arrival");
  const rowTop = planBottom + 40;
  let detailBottom;
  {
    const kd = 140, dx0 = 60, top = rowTop + 44, hh = 30;
    const X = (hr) => dx0 + (hr - OPEN) * kd;
    s.rect(X(OPEN), top, X(ON_SITE) - X(OPEN), hh, "obj fill-1");
    s.rect(X(ON_SITE), top, X(RESP_DUE) - X(ON_SITE), hh, "slot");
    s.line(X(ON_SITE), top - 10, X(ON_SITE), top + hh + 8, "ctr");
    s.text(X(ON_SITE), top - 14, "on site 09:30", "sl ink", "middle");
    s.line(X(RESP_DUE), top - 24, X(RESP_DUE), top - 3, "ctr");
    s.text(X(RESP_DUE), top - 28, "due 10:00", "sl ink", "middle");
    s.text((X(OPEN) + X(ON_SITE)) / 2, top + hh / 2 + 3, "counting", "sl ink", "middle");
    s.text((X(ON_SITE) + X(RESP_DUE)) / 2, top + hh / 2 + 3, "slack", "sl", "middle");
    s.text(X(OPEN), top - 14, "wed 08:00", "sl ink", "middle");
    s.chainH([X(OPEN), X(ON_SITE), X(RESP_DUE)], top + hh + 20, ["M1−B1", "K1"], { from: [top + hh, top + hh, top + hh], below: true });
    s.viewTitle((X(OPEN) + X(RESP_DUE)) / 2, top + hh + 70, "Detail A · on-site arrival", "Scale 7:1 · 1 h = 140 px · wednesday");
    detailBottom = top + hh + 83;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["R1", "response target, call to on site", "2 + 2 = 4"],
    ["M1", "response used", "2 + 1.5 = 3.5"],
    ["K1", "response slack", "R1 − M1 = 0.5"],
    ["B1", "tue 15:00 to 17:00", "2"],
    ["B2", "wed 08:00 to 11:00", "3"],
    ["P1", "paused, waiting on customer access", "3, not counted"],
    ["B3", "wed 14:00 to 17:00", "3"],
    ["B4", "thu 08:00 to 16:00", "8"],
    ["S1", "resolution target, call to resolved", "B1+B2+B3+B4 = 16"],
    ["U1", "resolution used, to thu 14:00", "B1+B2+B3+6 = 14"],
  ];
  const tw = 328;
  const tb = s.table(W - 32 - tw, rowTop + 16, "Variables · business hours", rows, { widths: [36, 186, 106] });
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
