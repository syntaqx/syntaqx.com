// One change through a build farm as a plan view on a time axis: the
// serial critical path and the symbol upload off it. Embedded in
// content/books/gaming/production-pipelines.md (Build Farms).
import { sheet } from "../kit.mjs";

// Minutes. Illustrative except S6, a published 2016 figure [1].
const S = [3, 14, 12, 6, 4, 18, 3];
const U1 = 5;
const B1 = S.reduce((a, b) => a + b, 0); // 60

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-bp", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "A studio's published 2016 figure: about 5,500 tests in about 18 minutes per build, reported within about an hour of check-in. Every other value is illustrative."],
    [2, "Symbols go to a store keyed by build ID; only the ID ships. Off the critical path: no time in B1."],
    [3, "One serial critical path; a build graph runs independent nodes (per platform, per chunk) on separate agents."],
    [0, "Values in minutes. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: one change through the farm, 1 min = 10 px ----
  s.comment("Plan view: one change through the farm");
  const k = 10;
  const x0 = CX - (B1 * k) / 2 + 10;
  const xs = S.reduce((acc, t) => [...acc, acc[acc.length - 1] + t * k], [x0]);
  const top = ny + 66, h = 34, bot = top + h;
  const names = [null, "compile", "cook", "package", null, "tests", null];
  S.forEach((_, i) => {
    s.rect(xs[i], top, xs[i + 1] - xs[i], h, i === 5 ? "obj hl" : i === 1 || i === 2 ? "obj fill-1" : "obj fill-2");
    if (names[i]) s.label(xs[i], top, xs[i + 1] - xs[i], h, names[i]);
  });
  s.text(x0 - 12, top + h / 2 + 3, "main", "sl ink", "end");
  s.nb(x0 - 46, top + h / 2, 3);

  s.dimH(xs[0], xs[7], top - 22, "B1", { from: [top, top] });
  const cy = bot + 20;
  s.chainH(xs, cy, S.map((_, i) => `S${i + 1}`), { from: xs.map(() => bot), below: true, hl: [5] });
  s.nb((xs[5] + xs[6]) / 2 + 20, cy + 8.5, 1);

  // Start and finish on centerlines below the chain.
  const ey = cy + 40;
  s.line(xs[0], cy + 18, xs[0], ey, "ctr");
  s.line(xs[7], cy + 18, xs[7], ey, "ctr");
  s.text(xs[0], ey + 12, "check-in", "sl ink", "middle");
  s.text(xs[7], ey + 12, "results", "sl ink", "middle");

  // Side lane: uploads start after packaging, off the critical path.
  const sy = ey + 26, sh = 24;
  const ux = xs[4];
  s.line(ux, cy + 18, ux, sy - 3, "phantom");
  s.rect(ux, sy, U1 * k, sh, "obj fill-2");
  s.label(ux, sy, U1 * k, sh, "upload");
  s.text(x0 - 12, sy + sh / 2 + 3, "side", "sl ink", "end");
  s.dimH(ux, ux + U1 * k, sy + sh + 20, "U1", { from: [sy + sh, sy + sh], below: true });
  s.nb(ux + U1 * k + 16, sy + sh / 2, 2);

  const vb = sy + sh + 20;
  s.viewTitle(CX, vb + 46, "Plan view · one change through the farm", "Scale 1 min = 10 px · timeline · serial critical path");
  const viewBottom = vb + 59;

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["B1", "check-in to results", `S1+…+S7 = ${B1}`],
    ["S1", "queue for an agent, sync the change", "3 · illustrative"],
    ["S2", "compile code for each platform", "14 · illustrative"],
    ["S3", "cook content for each platform", "12 · illustrative"],
    ["S4", "package and stage the build", "6 · illustrative"],
    ["S5", "deploy to test machines", "4 · illustrative"],
    ["S6", "automated tests on the build", "18 · published, 2016"],
    ["S7", "report, label the build good or bad", "3 · illustrative"],
    ["U1", "upload symbols and the build", "5 · illustrative"],
  ];
  const widths = [44, 200, 120], tw = widths.reduce((a, b) => a + b, 0);
  const t = s.table(CX - tw / 2, viewBottom + 56, "Variables · minutes", rows, { widths });
  s.height = Math.ceil(t.y + 30);
  return s.toString();
}
