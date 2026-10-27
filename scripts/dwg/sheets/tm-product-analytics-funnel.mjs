// A four-step funnel for one weekly cohort: step bars to scale, step
// conversion dimensions between them, the overall conversion and the
// variable table. Embedded in content/docs/telemetry/product-analytics.md (Funnels).
import { sheet, widthOf } from "../kit.mjs";

// Illustrative counts for one weekly cohort [1].
const STEPS = [
  ["S0", "entered", 10000],
  ["S1", "started", 4000],
  ["S2", "core action", 1600],
  ["S3", "paid", 400],
];

const fmt = (n) => n.toLocaleString("en-US");
const pct = (r) => `${(100 * r).toFixed(1)}%`;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "tm-pf", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative counts for one weekly cohort, not data from any product."],
    [2, "Each user counts once, entering at their first step-1 event, with a 7-day window from it."],
    [3, "The lowest step rate; the largest loss in users is S0 to S1 (6,000). Read both."],
    [4, "C is the product of the step rates, so a gain at any step lifts it by the same factor."],
    [0, "Users are uniques. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1,000 users = 50 px ----
  s.comment("Plan view: four-step funnel");
  const k = 50 / 1000, h = 28, step = 52;
  const x0 = CX - (STEPS[0][2] * k) / 2;
  const top = ny + 46;
  const ys = STEPS.map((_, i) => top + i * step);
  const mid = (i) => ys[i] + h / 2;
  STEPS.forEach(([code, name, n], i) => {
    s.rect(x0, ys[i], n * k, h, i === 0 ? "obj fill-1" : "obj fill-2");
    s.text(x0, ys[i] - 6, code, "dt");
    s.text(x0 + widthOf(code, "dt") + 6, ys[i] - 6, name, "sl ink");
  });
  s.nb(x0 + widthOf("S3", "dt") + 6 + widthOf("paid", "sl") + 14, ys[3] - 9.5, 2);

  // Step rates on the right, from each bar's end.
  const rx = x0 + STEPS[0][2] * k + 50;
  STEPS.slice(1).forEach(([, , n], j) => {
    const i = j + 1;
    s.dimV(mid(i - 1), mid(i), rx, `C${i}`, { from: [x0 + STEPS[i - 1][2] * k, x0 + n * k], side: "r" });
  });
  s.nb(rx + 40, (mid(2) + mid(3)) / 2, 3);

  // Overall conversion on the left.
  const lx = x0 - 34;
  s.dimV(mid(0), mid(3), lx, "C", { from: [x0, x0], side: "l", hl: true });
  s.nb(lx - 30, (mid(0) + mid(3)) / 2, 4);

  const vy = ys[3] + h + 42;
  s.viewTitle(CX, vy, "Plan view · four-step funnel, cohort W0", "Scale 1,000 users = 50 px · uniques · illustrative");
  s.nb(CX + 160, vy - 4, 1);

  // ---- Variable table ----
  s.comment("Variable table");
  const [S0, S1, S2, S3] = STEPS.map((r) => r[2]);
  const rows = [
    ["S0", "entered the flow (step 1)", fmt(S0)],
    ["S1", "started (step 2)", fmt(S1)],
    ["S2", "completed the core action (step 3)", fmt(S2)],
    ["S3", "paid (step 4)", fmt(S3)],
    ["C1", "step rate, step 1 to 2", `S1 ÷ S0 = ${pct(S1 / S0)}`],
    ["C2", "step rate, step 2 to 3", `S2 ÷ S1 = ${pct(S2 / S1)}`],
    ["C3", "step rate, step 3 to 4", `S3 ÷ S2 = ${pct(S3 / S2)}`],
    ["C", "overall conversion", `S3 ÷ S0 = C1 × C2 × C3 = ${pct(S3 / S0)}`],
  ];
  const tw = [0, 1, 2].reduce((sum, j) => sum + Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc"))) + 14)), 0);
  const tb = s.table(CX - tw / 2, vy + 13 + 50, "Variables · users", rows);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
