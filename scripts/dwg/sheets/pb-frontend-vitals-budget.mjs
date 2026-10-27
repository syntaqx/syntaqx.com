// The LCP good threshold split into its four subparts, the good / needs
// improvement / poor bands of each Core Web Vital, and the variable table.
// Embedded in content/docs/frontend/web-performance.md.
import { sheet, widthOf } from "../kit.mjs";

// web.dev, Optimize LCP: ~40% / <10% / ~40% / <10% of L1, delays at their ceiling [3].
const L1 = 2.5;
const T = [0.4 * L1, 0.1 * L1, 0.4 * L1, 0.1 * L1];
// Thresholds at p75 [2]: [good, poor, drawn end, px per unit].
const BANDS = [
  ["LCP", 2.5, 4.0, 5.0, 108, ["G1", "P1"]],
  ["INP", 200, 500, 750, 0.72, ["G2", "P2"]],
  ["CLS", 0.1, 0.25, 0.5, 1080, ["G3", "P3"]],
];

const s2 = (n) => n.toFixed(2);

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pb-web", width: W });
  const CX = W / 2;
  const titled = (cx, y, t, sub, n) => {
    s.viewTitle(cx, y, t, sub);
    if (n) s.nb(cx + widthOf(t, "vt") / 2 + 14, y - 4, n);
  };

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Good LCP is 2.5 s or less; the split is published guidance on where the time goes, not a rule."],
    [2, "Each metric is judged at the 75th percentile of real page loads, for mobile and desktop separately."],
    [3, "About 40% each for TTFB and load duration, under 10% each for the delays, drawn at their ceiling."],
    [0, "Values in s unless marked. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: LCP budget by subpart, 1 s = 240 px ----
  s.comment("Plan view: LCP budget");
  let budgetBottom;
  {
    const k = 240;
    const x0 = CX - (L1 * k) / 2;
    const xs = T.reduce((acc, t) => [...acc, acc[acc.length - 1] + t * k], [x0]);
    const top = ny + 56, h = 36, bot = top + h;
    T.forEach((_, i) => s.rect(xs[i], top, xs[i + 1] - xs[i], h, i % 2 ? "obj fill-1" : "obj fill-2"));
    s.label(xs[0], top, xs[1] - xs[0], h, "time to first byte");
    s.label(xs[2], top, xs[3] - xs[2], h, "load duration");
    const m = (i) => (xs[i] + xs[i + 1]) / 2;
    s.callout(m(1), top + 12, m(1) + 16, top - 18, "load delay");
    s.callout(m(3), top + 12, m(3) - 16, top - 18, "render delay");

    s.chainH(xs, bot + 20, ["T1", "T2", "T3", "T4"], { from: xs.map(() => bot), below: true });
    s.nb(m(2) + 22, bot + 28.5, 3);
    const ly = bot + 52;
    s.dimH(xs[0], xs[4], ly, "L1", { from: [bot + 24, bot + 24], below: true, hl: true });
    s.nb(CX + 22, ly + 8.5, 1);
    titled(CX, ly + 46, "Plan view · LCP budget by subpart", "Scale 1 s = 240 px · timeline", 0);
    budgetBottom = ly + 59;
  }

  // ---- Plan view: bands per metric ----
  s.comment("Plan view: thresholds");
  let bandBottom;
  {
    const h = 24, pitch = 56, len = 540;
    const x0 = CX - len / 2 + 20;
    const top = budgetBottom + 64;
    BANDS.forEach(([name, good, poor, end, k, codes], i) => {
      const y = top + i * pitch;
      const xg = x0 + good * k, xp = x0 + poor * k, xe = x0 + end * k;
      s.rect(x0, y, xg - x0, h, "obj fill-2");
      s.rect(xg, y, xp - xg, h, "obj fill-1");
      s.rect(xp, y, xe - xp, h, "hatch", { fill: s.hatch });
      s.text(x0 - 16, y + h / 2 + 3, name, "sl ink", "end");
      [xg, xp].forEach((x, j) => {
        s.line(x, y - 3, x, y - 9, "ext");
        s.text(x, y - 13, codes[j], "dt", "middle");
      });
      if (i === 0) {
        s.label(x0, y, xg - x0, h, "good");
        s.label(xg, y, xp - xg, h, "needs improvement");
        s.label(xp, y, xe - xp, h, "poor", "sl ink ko");
      }
    });
    const last = top + (BANDS.length - 1) * pitch + h;
    titled(CX, last + 44, "Plan view · thresholds at the 75th percentile", "LCP 1 s = 108 px · INP 100 ms = 72 px · CLS 0.1 = 108 px", 2);
    bandBottom = last + 57;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["L1", "LCP, good at the 75th percentile", s2(L1)],
    ["T1", "time to first byte", `≈ 0.40 × L1 = ${s2(T[0])}`],
    ["T2", "resource load delay", `≤ 0.10 × L1 = ${s2(T[1])}`],
    ["T3", "resource load duration", `≈ 0.40 × L1 = ${s2(T[2])}`],
    ["T4", "element render delay", `≤ 0.10 × L1 = ${s2(T[3])}`],
    ["C1", "chain, closes on L1", `T1 + T2 + T3 + T4 = ${s2(T.reduce((a, b) => a + b, 0))}`],
    ["G1 / P1", "LCP good up to / poor over", "2.5 s / 4.0 s"],
    ["G2 / P2", "INP good up to / poor over", "200 ms / 500 ms"],
    ["G3 / P3", "CLS good up to / poor over", "0.1 / 0.25"],
  ];
  const widths = [60, 220, 190];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table((W - tw) / 2, bandBottom + 60, "Variables · published LCP guidance and thresholds", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
