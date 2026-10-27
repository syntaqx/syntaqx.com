// One install cohort's retention over 30 days: a plan view of the players
// active on day 0, 1, 7 and 30, one player around day 7 in detail, and the
// variable table. Embedded in content/books/gaming/game-metrics.md
// (Retention and Cohorts).
import { sheet, widthOf } from "../kit.mjs";

// Illustrative counts [1].
const C0 = 10000;
const A = { 1: 4000, 7: 1500, 30: 500 };
const fmt = (n) => n.toLocaleString("en-US");
const pct = (n) => `${((n / C0) * 100).toFixed(1)}%`;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-rt", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative counts for one install day, not data from any game."],
    [2, "Exact-day retention (GameAnalytics, Unity): retained only if active on day N itself."],
    [3, "Unbounded retention (this book's alternative): retained if active on day N or any later day."],
    [4, "Both vendors count days in UTC; whichever boundary you choose, name it in the definition."],
    [0, "Counts in players. The drawing carries codes; values and ratios are in the table."],
  ], { width: 690 });

  // ---- Plan view: install cohort C0 over 30 days ----
  s.comment("Plan view: install cohort C0, 30 days");
  const kx = 18, ky = 12 / 1000, x0 = 150, X = (d) => x0 + d * kx, bw = 12;
  const axis = ny + 44 + C0 * ky;
  s.line(X(0) - 10, axis, X(30) + 10, axis, "obj");
  for (let d = 1; d < 30; d++) if (![1, 7].includes(d)) s.line(X(d), axis, X(d), axis + 4, "ext");
  const bar = (d, n, cls, code, lift = 8) => {
    const h = n * ky;
    s.rect(X(d) - bw / 2, axis - h, bw, h, cls);
    if (code) s.text(X(d), axis - h - lift, code, "dt", "middle");
  };
  bar(0, C0, "obj fill-1", null);
  bar(1, A[1], "obj fill-2", "A1");
  bar(7, A[7], "obj hl", "A7", 22);
  bar(30, A[30], "obj fill-2", "A30");
  s.dimV(axis - C0 * ky, axis, X(0) - 26, "C0", { from: [X(0) - bw / 2, X(0) - bw / 2], side: "l" });
  s.detailRef(X(7), axis - 9, 16, "detail A", X(7) + 40, axis - 46);

  // Day dimensions from install day, stacked below the axis.
  const d1 = axis + 22;
  s.dimH(X(0), X(1), d1, null, { from: [axis, axis] });
  s.text(X(1) + 16, d1 + 3.5, "N1", "dt");
  s.dimH(X(0), X(7), d1 + 24, "N7", { from: [null, axis], below: true, hl: true });
  s.dimH(X(0), X(30), d1 + 54, "N30", { from: [d1 + 4, axis], below: true });
  const CX = (X(0) + X(30)) / 2;
  s.viewTitle(CX, d1 + 100, "Plan view · install cohort C0, 30 days", "Scale 1 day = 18 px · 1,000 players = 12 px");
  const planBottom = d1 + 113;

  // ---- Detail A: one player near day 7, 1 day = 56 px ----
  s.comment("Detail A: one player near day 7");
  const top = planBottom + 62, cw = 56, ch = 30, dx0 = 52;
  [5, 6, 7, 8, 9].forEach((d, i) => {
    const x = dx0 + i * cw;
    s.rect(x, top, cw, ch, d === 7 ? "obj fill-1" : "obj fill-2");
    s.text(x + cw / 2, top + ch + 14, `d${d}`, d === 7 ? "sl ink" : "sl", "middle");
    if (d === 6 || d === 8) s.add(`<circle class="dot" cx="${x + cw / 2}" cy="${top + ch / 2}" r="3"/>`);
  });
  s.text(dx0, top - 10, "dots: days this player was active", "sl");
  const ly = top + ch + 40;
  s.text(dx0, ly, "exact d7: not retained", "sl ink");
  s.nb(dx0 + widthOf("exact d7: not retained", "sl") + 12, ly - 3.2, 2);
  s.text(dx0, ly + 18, "unbounded d7: retained", "sl ink");
  s.nb(dx0 + widthOf("unbounded d7: retained", "sl") + 12, ly + 14.8, 3);
  s.viewTitle(dx0 + (5 * cw) / 2, ly + 58, "Detail A · near day 7", "Scale 1 day = 56 px · one player");
  const detailBottom = ly + 71;

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(420, top - 4, "Variables · players", [
    ["C0", "installs on day 0", fmt(C0)],
    ["A1", "active on day 1", fmt(A[1])],
    ["A7", "active on day 7", fmt(A[7])],
    ["A30", "active on day 30", fmt(A[30])],
    ["N1, N7, N30", "days after install", "1, 7, 30"],
    ["R1", "day-1 retention", `A1 ÷ C0 = ${pct(A[1])}`],
    ["R7", "day-7 retention", `A7 ÷ C0 = ${pct(A[7])}`],
    ["R30", "day-30 retention", `A30 ÷ C0 = ${pct(A[30])}`],
  ]);
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
