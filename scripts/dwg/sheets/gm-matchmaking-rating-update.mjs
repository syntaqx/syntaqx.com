// Two rating updates, worked: one Elo game under FIDE rules (plan view A)
// and Glickman's published Glicko-2 example as two intervals (plan view B),
// with their variable tables below. Embedded in
// content/books/gaming/matchmaking.md.
import { sheet } from "../kit.mjs";

// Elo, FIDE rules [1][2].
const R1 = 1900, R2 = 2000, U1 = 13, U2 = -13;
// Glicko-2, Glickman's worked example [3].
const r = 1500, RD = 200, r2 = 1464.06, RD2 = 151.52;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-mr", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "FIDE gives E as a table (gap 99 to 106: 0.36 lower, 0.64 higher); the logistic form gives 0.360."],
    [2, "FIDE rounds a rating period's change to a whole number, with 0.5 rounded away from zero."],
    [3, "Values from Glickman's Glicko-2 worked example (2022); the 95% interval is r plus or minus 2 RD."],
    [0, "Values in rating points. The drawing carries codes; values and formulas are in the tables."],
  ], { width: 690 });

  // Two views side by side over the same axis length; tables below.
  const axW = 250;
  const views = [96, 96 + axW + 100];

  // Rating axis from ax0 with tick labels every quarter.
  const axis = (ax0, y, lo, hi) => {
    const k = axW / (hi - lo);
    s.line(ax0, y, ax0 + axW, y, "obj");
    for (let i = 0; i <= 4; i++) {
      const x = ax0 + (i * axW) / 4;
      s.line(x, y - 4, x, y + 4, "obj");
      s.text(x, y + 16, String(lo + (i * (hi - lo)) / 4), "vs", "middle");
    }
    return (v) => ax0 + (v - lo) * k;
  };

  const top = ny + 52, rowH = 68, h = 12;
  const axY = top + rowH + h + 52;
  const vtY = axY + 50;

  // ---- Plan view A: one Elo game ----
  s.comment("Plan view A: one Elo game, FIDE rules");
  {
    const ax0 = views[0], rowL = ax0 - 14;
    const X = axis(ax0, axY, 1850, 2050);
    const before = top, after = top + rowH;
    s.text(rowL, before + 9, "before", "sl", "end");
    s.text(rowL, after + 9, "after", "sl", "end");
    const mark = (x, y, cls) => s.rect(x - 6, y, 12, 12, cls);
    mark(X(R1), before, "obj fill-1");
    mark(X(R2), before, "obj fill-1");
    mark(X(R1 + U1), after, "obj fill-2");
    mark(X(R2 + U2), after, "obj fill-2");
    s.text(X(R1) - 12, before + 9, "A", "sl ink", "end");
    s.text(X(R2) + 12, before + 9, "B", "sl ink");
    s.line(X(R1), before + 15, X(R1), axY - 6, "phantom");
    s.line(X(R2), before + 15, X(R2), axY - 6, "phantom");

    s.dimH(X(R1), X(R2), before - 14, "D1", { from: [before, before] });
    const uy = after + 30;
    s.dimH(X(R1), X(R1 + U1), uy, "U1", { from: [null, after + 12], below: true, hl: true, dx: -30, dy: -8.5 });
    s.dimH(X(R2 + U2), X(R2), uy, "U2", { from: [after + 12, null], below: true, dx: 30, dy: -8.5 });
    s.nb(X(R1) - 58, uy - 3.5, 2);
    s.text(X(R1 + U1) + 12, after + 9, "R1'", "dt");
    s.text(X(R2 + U2) - 12, after + 9, "R2'", "dt", "end");

    s.viewTitle(ax0 + axW / 2, vtY, "Plan view A · one Elo game", "Scale 1 point = 1.25 px · lower-rated A wins");
  }

  // ---- Plan view B: Glicko-2 interval ----
  s.comment("Plan view B: Glicko-2 interval, one rating period");
  {
    const ax0 = views[1], rowL = ax0 - 14;
    const X = axis(ax0, axY, 1000, 2000);
    s.text(rowL, top + 9, "before", "sl", "end");
    s.text(rowL, top + rowH + 9, "after", "sl", "end");
    s.rect(X(r - 2 * RD), top, X(r + 2 * RD) - X(r - 2 * RD), h, "obj fill-2");
    s.rect(X(r2 - 2 * RD2), top + rowH, X(r2 + 2 * RD2) - X(r2 - 2 * RD2), h, "obj fill-1");
    s.line(X(r), top - 6, X(r), top + h + 6, "ctr");
    s.line(X(r2), top + rowH - 6, X(r2), top + rowH + h + 6, "ctr");
    s.text(X(r), top + h + 18, "r", "dt", "middle");
    s.text(X(r2), top + rowH + h + 18, "r'", "dt", "middle");
    s.dimH(X(r - 2 * RD), X(r + 2 * RD), top - 14, "W0", { from: [top, top] });
    s.dimH(X(r2 - 2 * RD2), X(r2 + 2 * RD2), top + rowH - 14, "W1", { from: [top + rowH, top + rowH] });
    s.viewTitle(ax0 + axW / 2, vtY, "Plan view B · Glicko-2", "Scale 1 point = 0.25 px · one rating period");
    s.nb(ax0 + axW / 2 + 90, vtY - 4, 3);
  }

  const widthsA = [52, 160, 190];
  const twA = widthsA.reduce((a, b) => a + b, 0);
  s.comment("Variables: Elo");
  const ta = s.table(W / 2 - twA / 2, vtY + 56, "Variables · Elo", [
    ["R1", "A's rating", String(R1)],
    ["R2", "B's rating", String(R2)],
    ["D1", "rating gap", "R2 − R1 = 100"],
    ["K", "FIDE, rated under 2400", "20"],
    ["S1, S2", "score: win 1, loss 0", "1, 0"],
    ["E1", "A's expected score", "1 ÷ (1 + 10^(D1/400)) = 0.36"],
    ["E2", "B's expected score", "1 − E1 = 0.64"],
    ["U1", "A's change, rounded", "K(S1 − E1) = 12.8 → +13"],
    ["U2", "B's change, rounded", "K(S2 − E2) = −12.8 → −13"],
    ["R1'", "A after", `R1 + U1 = ${R1 + U1}`],
    ["R2'", "B after", `R2 + U2 = ${R2 + U2}`],
  ], { widths: widthsA });
  s.nb(W / 2 - twA / 2 + 118, vtY + 56 - 11, 1);
  s.comment("Variables: Glicko-2");
  const widthsB = [52, 160, 190];
  const tb = s.table(W / 2 - twA / 2, ta.y + 44, "Variables · Glicko-2", [
    ["r", "rating before", String(r)],
    ["RD", "deviation before", String(RD)],
    ["σ, τ", "volatility, system constant", "0.06, 0.5"],
    ["O1…O3", "opponents: beat, lost, lost", "1400, 1550, 1700"],
    ["v", "estimated variance", "1.7785"],
    ["Δ", "estimated improvement", "−0.4834"],
    ["σ'", "volatility after", "0.05999"],
    ["r'", "rating after", "r + 173.7178 × (−0.2069) = 1464.06"],
    ["RD'", "deviation after", "173.7178 × 0.8722 = 151.52"],
    ["W0", "95% interval before", "4 × RD = 800"],
    ["W1", "95% interval after", "4 × RD' = 606.08"],
  ], { widths: widthsB });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
