// One technician's clocked-in day as a dimensional sheet: the segments on a
// time axis with codes, and the three efficiency metrics computed from the
// same day in a table, all over the one denominator. Embedded in
// content/books/field-operations/operating-metrics.md.
import { sheet, el, widthOf } from "../kit.mjs";

// The day in order: [code, kind, hours, label]. Illustrative split.
const DAY = [
  ["L1", "other", 0.5],
  ["D1", "drive", 0.5],
  ["V1", "site", 1.5, "stop 1"],
  ["D2", "drive", 0.5],
  ["V2", "site", 1.0, "stop 2"],
  ["B1", "other", 0.5],
  ["D3", "drive", 0.75],
  ["V3", "site", 1.5, "stop 3"],
  ["D4", "drive", 0.5],
  ["U1", "other", 0.75],
];
const NAMES = { L1: "load", B1: "break", U1: "unload" };
const sum = (kind) => DAY.filter(([, k]) => k === kind).reduce((a, [, , hrs]) => a + hrs, 0);
const C1 = DAY.reduce((a, [, , hrs]) => a + hrs, 0);
const V = sum("site"), D = sum("drive"), O = sum("other"), N = 3;
const h1 = (n) => n.toFixed(n * 100 % 10 ? 2 : 1);

const tableWidth = (rows) =>
  [0, 1, 2].reduce((w, j) => w + Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(["CODE", "VARIABLE", "VALUE"][j], "th")) + 14)), 0);

export default function draw() {
  const W = 760, CX = W / 2, k = 85;
  const s = sheet({ prefix: "fo-omd", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "One clocked-in day, clock in to clock out. The split into segments is illustrative."],
    [2, "Every ratio below divides by C1. Change the clock to paid hours or route hours and every number moves."],
    [0, "Values in hours. Codes on the drawing, values and formulas in the tables."],
  ], { width: 690 });

  // ---- Plan view: the day, 1 h = 85 px ----
  s.comment("Plan view: the day");
  const x0 = CX - (C1 * k) / 2;
  const totalY = ny + 34, chainY = totalY + 24, barY = chainY + 14, bh = 30;
  const xs = [x0];
  for (const [, kind, hrs, label] of DAY) {
    const x = xs.at(-1), w = hrs * k;
    if (kind === "other") s.rect(x, barY, w, bh, "hatch", { fill: s.hatch });
    else s.rect(x, barY, w, bh, kind === "site" ? "obj hl" : "obj fill-2");
    if (label) s.label(x, barY, w, bh, label, "sl hl");
    xs.push(x + w);
  }
  s.rect(x0, barY, C1 * k, bh, "obj", { fill: "none" });
  s.chainH(xs, chainY, DAY.map(([c]) => c), { from: xs.map(() => barY) });
  s.dimH(xs[0], xs.at(-1), totalY, "C1", { from: [chainY, chainY] });
  s.nb(CX + 22, totalY - 7.5, 1);
  s.nb(xs.at(-1) + 14, barY + bh / 2, 2);

  s.comment("Legend");
  const items = [["on site", "obj hl"], ["drive", "obj fill-2"], ["load, break, unload", "hatch"]];
  const iw = 24, ih = 12, pad = 8, step = 40;
  const legW = items.reduce((a, [l]) => a + iw + pad + widthOf(l, "sl"), 0) + step * (items.length - 1);
  let lx = CX - legW / 2;
  const legY = barY + bh + 22;
  for (const [l, cls] of items) {
    s.add(el("rect", { class: cls, x: lx, y: legY, width: iw, height: ih, fill: cls === "hatch" ? s.hatch : null }));
    s.text(lx + iw + pad, legY + ih / 2 + 3, l, "sl ink");
    lx += iw + pad + widthOf(l, "sl") + step;
  }
  const planTitle = legY + ih + 36;
  s.viewTitle(CX, planTitle, "Plan view · one clocked-in day", "Scale 1 h = 85 px · timeline");

  // ---- Tables ----
  s.comment("Variable tables");
  const day = [
    ["C1", "clocked in", h1(C1)],
    ...DAY.map(([c, kind, hrs]) => [c, kind === "site" ? `on site, stop ${c[1]}` : kind === "drive" ? `drive, leg ${c[1]}` : NAMES[c], h1(hrs)]),
  ];
  const metrics = [
    ["V", "on site", `V1 + V2 + V3 = ${h1(V)}`],
    ["D", "drive", `D1 + … + D4 = ${h1(D)}`],
    ["O", "other", `L1 + B1 + U1 = ${h1(O)}`],
    ["N", "completed stops", String(N)],
    ["M1", "utilization", `V / C1 = ${Math.round((V / C1) * 100)}%`],
    ["M2", "drive share", `D / C1 = ${Math.round((D / C1) * 100)}%`],
    ["M3", "stops per hour", `N / C1 = ${(N / C1).toFixed(2)}`],
  ];
  const gap = 32;
  const w1 = tableWidth(day), w2 = tableWidth(metrics);
  const tx = CX - (w1 + gap + w2) / 2;
  const tTop = planTitle + 13 + 48;
  const ta = s.table(tx, tTop, "Day · hours", day);
  const tb = s.table(tx + w1 + gap, tTop, "Metrics · same day", metrics);
  s.height = Math.ceil(Math.max(ta.y, tb.y) + 30);
  return s.toString();
}
