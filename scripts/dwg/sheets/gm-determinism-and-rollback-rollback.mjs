// Rollback on one peer at 60 Hz: one late remote input resimulated inside
// frame 9, and frame 9 itself in detail. Embedded in
// content/books/gaming/determinism-and-rollback.md.
import { sheet, widthOf } from "../kit.mjs";

// Illustrative costs in ms [1]; M1 is GGPO's MAX_PREDICTION_FRAMES [3].
const F1 = 1000 / 60;
const A1 = 0.2, S1 = 1.5, G1 = 5;
const LATE = 4; // frames 5 to 8 ran on predicted input
const R1 = LATE + 1; // frames simulated in frame 9
const K1 = F1 - A1 - R1 * S1 - G1; // 3.97
const M1 = 8;

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-rb", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative: a 60 Hz game, one late remote input, simulation and render costs chosen for the arithmetic."],
    [2, "Remote inputs for frames 5 to 9 arrive at the start of frame 9; frames 5 to 8 ran on predicted input."],
    [3, "An open-source rollback library's MAX_PREDICTION_FRAMES is 8: past it, synchronizing inputs fails and the game waits (hatched)."],
    [4, "At the limit the rollback frame overruns (L1 > F1), so one simulated frame must fit in S2."],
    [0, "Values in ms unless marked frames. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: frames 1 to 12, 1 frame = 44 px ----
  s.comment("Plan view: one peer at 60 Hz");
  const k = 44, n = 12, x0 = CX - (n * k + k / 2) / 2 + 20;
  const X = (i) => x0 + i * k; // left edge of frame i + 1
  const h = 26;
  const numY = ny + 36, remTop = numY + 12, remBot = remTop + h;
  const simTop = remBot + 44, simBot = simTop + h;
  for (let i = 0; i < n; i++) s.text(X(i) + k / 2, numY, String(i + 1), "tc", "middle");
  const lane = (top, label, shade9) => {
    s.text(x0 - 10, top + h / 2 + 3, label, "sl ink", "end");
    for (let i = 0; i < n; i++) {
      const predicted = i >= LATE && i < 2 * LATE;
      s.rect(X(i), top, k, h, predicted ? "slot" : shade9 && i === 2 * LATE ? "obj fill-1" : "obj fill-2");
    }
    s.rect(X(n), top, k / 2, h, "hatch", { fill: s.hatch });
  };
  lane(remTop, "remote input", false);
  lane(simTop, "simulation", true);
  s.nb(X(n) + k / 4, numY - 3.5, 3);

  // Late inputs arrive at the start of frame 9.
  {
    const ex = X(2 * LATE) - 34, ey = remBot + 22, label = "late inputs arrive";
    s.callout(X(2 * LATE), remTop + h / 2, ex, ey, label, { dir: -1 });
    s.nb(ex - 14 - widthOf(label, "sl") - 10, ey, 2);
  }
  s.detailRef(X(2 * LATE) + k / 2, simTop + h / 2, 19, "detail A", X(2 * LATE + 2) + 6, remBot + 22);

  // Dimensions under the simulation lane.
  const d1 = simBot + 22, d2 = d1 + 24, d3 = d2 + 24;
  s.dimH(X(0), X(1), d1, "F1", { from: [simBot, simBot] });
  s.dimH(X(LATE), X(2 * LATE), d1, "P1", { from: [simBot, simBot] });
  s.dimH(X(LATE), X(2 * LATE + 1), d2, "R1", { from: [null, simBot], hl: true });
  s.dimH(X(LATE), X(n), d3, "M1", { from: [null, simBot] });
  s.line(X(LATE), d1 + 4, X(LATE), d3 + 4, "ext");
  const planTitle = d3 + 40;
  s.viewTitle(CX, planTitle, "Plan view · one peer at 60 Hz", "Scale 1 frame = 44 px · frames 1 to 12 · timeline");

  // ---- Detail A: frame 9 at 1 ms = 30 px ----
  s.comment("Detail A: frame 9, the rollback frame");
  const kd = 30, dx0 = CX - (F1 * kd) / 2;
  const parts = [A1, ...Array(R1).fill(S1), G1, K1];
  const xs = parts.reduce((acc, t) => [...acc, acc[acc.length - 1] + t * kd], [dx0]);
  const top = planTitle + 13 + 60, bot = top + 34;
  parts.forEach((_, i) => {
    const last = i === parts.length - 1;
    s.rect(xs[i], top, xs[i + 1] - xs[i], bot - top, last ? "slot" : i === R1 ? "obj fill-1" : "obj fill-2");
  });
  for (let i = 1; i <= R1; i++) s.label(xs[i], top, xs[i + 1] - xs[i], bot - top, String(LATE + i));
  s.label(xs[R1 + 1], top, xs[R1 + 2] - xs[R1 + 1], bot - top, "render");
  s.label(xs[R1 + 2], top, xs[R1 + 3] - xs[R1 + 2], bot - top, "slack");
  s.dimH(xs[0], xs[xs.length - 1], top - 20, "F1", { from: [top, top] });
  s.chainH(xs, bot + 20, ["A1", "S1", "S1", "S1", "S1", "S1", "G1", "K1"], { from: xs.map(() => bot), below: true, offsets: [[-14, 0]] });
  const dTitle = bot + 64, dt = "Detail A · frame 9, the rollback frame";
  s.viewTitle(CX, dTitle, dt, "Scale 1 ms = 30 px · resimulate frames 5 to 8, then 9");
  s.nb(CX + widthOf(dt, "vt") / 2 + 16, dTitle - 4, 4);

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["F1", "frame at 60 Hz, ms", "1000 ÷ 60 = 16.67"],
    ["P1", "predicted before the late input, ms", "4 × F1 = 66.67"],
    ["R1", "frames simulated in frame 9", "P1 ÷ F1 + 1 = 5"],
    ["M1", "prediction limit, frames", "8"],
    ["A1", "load the saved state of frame 4, ms", "0.20"],
    ["S1", "simulate one frame without rendering, ms", "1.50"],
    ["G1", "render and present, ms", "5.00"],
    ["K1", "slack left in frame 9, ms", "F1 − A1 − R1 × S1 − G1 = 3.97"],
    ["L1", "rollback frame at the limit, ms", "A1 + (M1 + 1) × S1 + G1 = 18.70"],
    ["S2", "largest S1 that fits at the limit, ms", "(F1 − A1 − G1) ÷ (M1 + 1) = 1.27"],
  ];
  // Width estimate to center the table.
  const ws = [0, 1, 2].map((j) => Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(["CODE", "VARIABLE", "VALUE"][j], "th")) + 14)));
  const tw = ws.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, dTitle + 13 + 50, "Variables · ms", rows);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
