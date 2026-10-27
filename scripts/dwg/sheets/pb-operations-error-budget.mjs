// An error budget: one 30-day SLO window, the budget enlarged in detail,
// how long the budget lasts at each alert's burn rate, and the variable
// table. Embedded in content/docs/operations/slos.md.
import { sheet } from "../kit.mjs";

// SRE Workbook, 99.9% over 30 days [3].
const N1 = 30 * 24; // window, h
const S1 = 0.999;
const B1 = (1 - S1) * N1 * 60; // budget, min (43.2)
const R = [14.4, 6, 1]; // burn rates
const L = [1, 6, 72]; // long windows, h; short = L / 12
const E = R.map((r) => N1 / r); // h to exhaustion: 50, 120, 720
const pct = (r, l) => `${Math.round((r * l * 100) / N1)}%`;
const short = (l) => (l / 12 < 1 ? `${(l / 12) * 60} min` : `${l / 12} h`);

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pb-slo", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "S1 is the target for the SLI, good events over valid events, across a rolling 30 days."],
    [2, "B1 is 43.2 minutes of full outage, or a partial one: 1% errors for 72 hours spends the same budget."],
    [3, "Burn rate R is the error rate over the rate the SLO allows; at R the budget is gone after E = N1 ÷ R."],
    [4, "An alert fires when both its long window L and its short window, L ÷ 12, burn faster than R."],
    [0, "Rates and windows from published SRE alerting guidance, 99.9% over 30 days. Values and formulas are in the table."],
  ], { width: 690 });

  const k = 20 / 24; // 1 day = 20 px, in px per hour
  const x0 = CX - (N1 * k) / 2;
  const X = (h) => x0 + h * k;

  // ---- Plan view: one 30-day window, 1 day = 20 px ----
  s.comment("Plan view: one SLO window");
  let planBottom;
  {
    const top = ny + 50, h = 30, bot = top + h;
    const bx = X(N1 - B1 / 60);
    s.rect(X(0), top, bx - X(0), h, "obj fill-2");
    s.rect(bx, top, X(N1) - bx, h, "hatch", { fill: s.hatch });
    s.label(X(0), top, N1 * k, h, "good events · S1");
    s.nb(CX + 62, top + h / 2, 1);
    s.dimH(X(0), X(N1), top - 22, "N1", { from: [top, top] });
    s.detailRef(X(N1), top + h / 2, 16, "detail A", X(N1) - 6, bot + 26);
    s.viewTitle(CX, bot + 58, "Plan view · one 30-day SLO window", "Scale 1 day = 20 px · timeline");
    planBottom = bot + 71;
  }

  // ---- Plan view: burn rate to exhaustion, 1 day = 20 px ----
  s.comment("Plan view: burn rate to exhaustion");
  let burnBottom;
  {
    const h = 22, step = 78;
    const tops = [0, 1, 2].map((i) => planBottom + 52 + i * step);
    const names = ["alert 1 · page", "alert 2 · page", "alert 3 · ticket"];
    tops.forEach((top, i) => {
      s.text(X(0), top - 8, names[i], "sl ink");
      s.rect(X(0), top, E[i] * k, h, "obj fill-1");
    });
    tops.slice(0, 2).forEach((top, i) => s.dimH(X(0), X(E[i]), top + h + 18, `E${i + 1}`, { from: [top + h, top + h], below: true }));
    // The ticket alert: its long window hatched at the start of the bar,
    // L3 then E3 stacked below.
    const t3 = tops[2], b3 = t3 + h;
    s.rect(X(0), t3, L[2] * k, h, "hatch", { fill: s.hatch });
    s.dimH(X(0), X(L[2]), b3 + 18, "L3", { from: [b3, b3], below: true });
    s.nb(X(L[2]) + 14, b3 + 18, 4);
    s.dimH(X(0), X(E[2]), b3 + 46, "E3", { from: [null, b3], below: true });
    s.line(X(0), b3 + 22, X(0), b3 + 50, "ext");
    const by = b3 + 46;
    s.viewTitle(CX, by + 46, "Plan view · burn rate to exhaustion", "Scale 1 day = 20 px · timeline · one bar per alert");
    s.nb(CX + 142, by + 42, 3);
    burnBottom = by + 59;
  }

  // ---- Detail A: the error budget, 1 min = 5 px ----
  s.comment("Detail A: the error budget");
  const rowTop = burnBottom + 44;
  let detailBottom;
  {
    const kd = 5, xa = 56, top = rowTop + 96, h = 30;
    const xb = xa + B1 * kd;
    s.rect(xa, top, xb - xa, h, "hatch", { fill: s.hatch });
    s.text((xa + xb) / 2, top + h / 2 + 3, "error budget", "sl ink ko", "middle");
    s.dimH(xa, xb, top - 20, "B1", { from: [top, top], hl: true });
    s.nb((xa + xb) / 2 + 18, top - 27.5, 2);
    s.viewTitle((xa + xb) / 2, top + h + 40, "Detail A · the error budget", "Scale 360:1 · 1 min = 5 px");
    detailBottom = top + h + 53;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["N1", "SLO window", "30 d = 720 h = 43,200 min"],
    ["S1", "SLO target", "99.9%"],
    ["B1", "error budget", "(1 − S1) × N1 = 43.2 min"],
    ...R.map((r, i) => [`R${i + 1}`, `burn rate, alert ${i + 1}`, String(r)]),
    ...L.map((l, i) => [`L${i + 1}`, `long window, alert ${i + 1}`, `${l} h · short ${short(l)}`]),
    ...R.map((r, i) => [`C${i + 1}`, `budget spent when ${i + 1} fires`, `R${i + 1} × L${i + 1} ÷ N1 = ${pct(r, L[i])}`]),
    ...E.map((e, i) => [`E${i + 1}`, `budget gone at R${i + 1}`, `N1 ÷ R${i + 1} = ${e} h`]),
  ];
  const tb = s.table(352, rowTop + 16, "Variables", rows, { widths: [32, 160, 184] });
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
