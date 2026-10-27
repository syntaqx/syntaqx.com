// A live game's patch cadence: five patch intervals on a timeline (plan
// view), one interval in detail with the three faster change paths, and the
// variable table. Dates from Riot's published 2026 League of Legends patch
// schedule. Embedded in content/books/gaming/live-operations.md.
import { sheet } from "../kit.mjs";

// Intervals in days, patches 26.19 to 26.24 [1].
const I = [14, 14, 14, 14, 21];
const PATCH = ["26.19", "26.20", "26.21", "26.22", "26.23", "26.24"];
const DATE = ["Sep 23", "Oct 7", "Oct 21", "Nov 4", "Nov 18", "Dec 9"];
const C1 = I.reduce((a, b) => a + b, 0); // 77
// Detail A, illustrative events in days after patch 26.20 [3].
const D1 = 1, FLIP = 3, H1 = 6, EV = 8, E1 = I[1] - EV;

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-lo", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Dates from one game's published 2026 patch schedule (Pacific Time); the publisher notes dates can move."],
    [2, "Server data override: new values or logic loaded by game servers, no client download (a published micropatch)."],
    [3, "Client hotfix: a new build players must download before they can play. Event timings are illustrative."],
    [4, "Config flip: a flag or remote config value, live in seconds, no build and no server restart."],
    [0, "Values in days. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: five patch intervals, 1 day = 7 px ----
  s.comment("Plan view: patches 26.19 to 26.24");
  let planBottom;
  {
    const k = 7;
    const x0 = CX - (C1 * k) / 2;
    const xs = I.reduce((acc, d) => [...acc, acc[acc.length - 1] + d * k], [x0]);
    const top = ny + 54, h = 34, bot = top + h;
    I.forEach((_, i) => s.rect(xs[i], top, xs[i + 1] - xs[i], h, "obj fill-2"));
    I.forEach((_, i) => s.label(xs[i], top, xs[i + 1] - xs[i], h, PATCH[i]));
    s.callout(xs[5], top + h / 2, xs[5] + 18, top + h / 2, PATCH[5]);

    const fy = top - 22;
    s.dimH(xs[0], xs[5], fy, "C1", { from: [top, top], hl: true });
    s.nb(CX + 16, fy - 7.5, 1);
    s.chainH(xs, bot + 20, ["I1", "I2", "I3", "I4", "I5"], { from: xs.map(() => bot), below: true });
    xs.forEach((x, i) => s.text(x, bot + 50, DATE[i], "vs", "middle"));

    const dc = (xs[1] + xs[2]) / 2;
    s.detailRef(dc, top + h / 2, 22, "detail A", dc - 40, top - 30);
    s.viewTitle(CX, bot + 84, "Plan view · patches 26.19 to 26.24", "Scale 1 day = 7 px · timeline · 2026");
    planBottom = bot + 97;
  }

  // ---- Detail A: inside 26.20, 1 day = 35 px ----
  s.comment("Detail A: inside 26.20, three change paths");
  let detailBottom;
  {
    const k = 35, span = I[1] * k;
    const x0 = CX - span / 2 + 20;
    const X = (d) => x0 + d * k;
    const top = planBottom + 86, h = 24, step = 48;
    const lane = (i) => top + i * step;
    s.line(X(0), top - 38, X(0), lane(2) + h + 8, "ctr");
    s.line(X(I[1]), top - 38, X(I[1]), lane(2) + h + 8, "ctr");
    s.text(X(0), top - 44, "26.20", "sl ink", "middle");
    s.text(X(I[1]), top - 44, "26.21", "sl ink", "middle");
    ["client", "server", "config"].forEach((n, i) => s.text(X(0) - 12, lane(i) + h / 2 + 3, n, "sl ink", "end"));

    // Client: one build; the hotfix is a new download.
    s.rect(X(0), lane(0), span, h, "obj fill-2");
    s.line(X(H1), lane(0) - 4, X(H1), lane(0) + h + 4, "slot");
    s.add(`<circle class="dot" cx="${X(H1)}" cy="${lane(0) + h / 2}" r="2.2"/>`);
    s.text(X(H1) + 8, lane(0) + h / 2 + 3, "hotfix", "sl ink ko");
    s.nb(X(H1) + 52, lane(0) + h / 2, 3);

    // Server: override live from D1.
    s.rect(X(0), lane(1), D1 * k, h, "obj fill-2");
    s.rect(X(D1), lane(1), span - D1 * k, h, "obj fill-1");
    s.label(X(D1), lane(1), span - D1 * k, h, "override live");
    s.nb(X(D1) + (span - D1 * k) / 2 + 52, lane(1) + h / 2, 2);

    // Config: flip, then the event window to the next patch.
    s.rect(X(0), lane(2), EV * k, h, "obj fill-2");
    s.rect(X(EV), lane(2), E1 * k, h, "obj fill-1");
    s.add(`<circle class="dot" cx="${X(FLIP)}" cy="${lane(2) + h / 2}" r="2.2"/>`);
    s.text(X(FLIP) + 8, lane(2) + h / 2 + 3, "flip", "sl ink");
    s.nb(X(FLIP) + 38, lane(2) + h / 2, 4);
    s.label(X(EV), lane(2), E1 * k, h, "event live");

    s.dimH(X(0), X(H1), top - 16, "H1", { from: [null, lane(0)] });
    s.dimH(X(0), X(D1), lane(1) + h + 12, "D1", { from: [null, lane(1) + h], dx: -(D1 * k) / 2 - 18, dy: 7.5 });
    const by = lane(2) + h + 22;
    s.dimH(X(EV), X(I[1]), by, "E1", { from: [lane(2) + h, lane(2) + h], below: true });
    const by2 = by;

    s.viewTitle(X(I[1] / 2), by2 + 46, "Detail A · inside 26.20, three paths", "Scale 1 day = 35 px · illustrative events");
    s.nb(X(I[1] / 2) + 130, by2 + 42, 3);
    detailBottom = by2 + 59;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["C1", "cycle, 26.19 (Sep 23) to 26.24 (Dec 9, 2026)", `I1+…+I5 = ${C1}`],
    ["I1…I4", "each interval, 26.19 to 26.23", "14"],
    ["I5", "interval, 26.23 to 26.24", "21"],
    ["N1", "patches scheduled in 2026, 26.01 (Jan 8) to 26.24", "24"],
    ["A1", "mean interval, 335 days from Jan 8 to Dec 9", "335 ÷ (N1 − 1) = 14.57"],
    ["D1", "patch to server-side override (illustrative)", String(D1)],
    ["H1", "patch to client hotfix (illustrative)", String(H1)],
    ["E1", "event start to next patch (illustrative)", String(E1)],
  ];
  const widths = [52, 280, 140];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, detailBottom + 50, "Variables · days", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
