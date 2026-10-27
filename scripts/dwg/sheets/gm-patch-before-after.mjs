// Published patch 9.9 results, previous patcher against the chunked
// patcher: update time, download size and failure rate as three plan views
// on their own scales, and the variable table. Embedded in
// content/books/gaming/patching.md.
import { sheet, widthOf } from "../kit.mjs";

const T1 = 480, T2 = 40; // s, bounds: over T1, under T2
const D1 = 68, D2 = 83; // MB
const F1 = 2.2, F2 = 0.3; // %

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-pb", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Published patch 9.9 results, July 2019: before is the previous patcher, after is the chunked patcher. By region, updates were up to 14x faster and errors fell by up to 95%."],
    [2, "A changed byte costs a whole chunk, so the chunked download is larger."],
    [3, "Bounds: T1 is over 8 min and T2 under 40 s; bars are drawn at the bound."],
    [0, "Each view has its own scale. Values and formulas are in the table, units in the variable names."],
  ], { width: 690 });

  const x0 = 96, h = 22, rowGap = 14;
  const rows = (top) => [top, top + h + rowGap];
  const labels = (top) => rows(top).forEach((y, i) => s.text(x0 - 10, y + h / 2 + 3, i ? "after" : "before", "sl ink", "end"));
  const cx = x0 + 150;

  // ---- View 1: average update time, 1 s = 0.9 px ----
  s.comment("Plan view: average update time");
  let y = ny + 56;
  {
    const k = 0.6;
    const [a, b] = rows(y);
    labels(y);
    s.rect(x0, a, T1 * k, h, "obj fill-2");
    s.path(`M${x0 + T1 * k},${a}h28M${x0 + T1 * k},${a + h}h28`, "slot");
    s.rect(x0, b, T2 * k, h, "obj hl");
    s.dimH(x0, x0 + T1 * k, a - 14, "T1", { from: [a, a] });
    s.nb(x0 + (T1 * k) / 2 + 18, a - 21.5, 3);
    s.dimH(x0, x0 + T2 * k, b + h + 18, "T2", { from: [b + h, b + h], below: true, hl: true });
    s.viewTitle(cx, b + h + 54, "Plan view · average update time", "Scale 1 s = 0.6 px · bars at the bound");
    y = b + h + 67;
  }

  // ---- View 2: download size, 1 MB = 5 px ----
  s.comment("Plan view: download size");
  y += 50;
  {
    const k = 3.5;
    const [a, b] = rows(y);
    labels(y);
    s.rect(x0, a, D1 * k, h, "obj fill-2");
    s.rect(x0, b, D1 * k, h, "obj fill-1");
    s.rect(x0 + D1 * k, b, (D2 - D1) * k, h, "hatch", { fill: s.hatch });
    s.line(x0 + D1 * k, b, x0 + D1 * k, b + h, "obj");
    s.rect(x0, b, D2 * k, h, "obj");
    s.dimH(x0, x0 + D1 * k, a - 14, "D1", { from: [a, a] });
    s.dimH(x0 + D1 * k, x0 + D2 * k, b + h + 18, "D3", { from: [a + h, b + h], below: true });
    s.dimH(x0, x0 + D2 * k, b + h + 44, "D2", { from: [b + h, b + h], below: true });
    s.nb(x0 + D2 * k + 20, b + h / 2, 2);
    s.viewTitle(cx, b + h + 88, "Plan view · download size", "Scale 1 MB = 3.5 px");
    y = b + h + 101;
  }

  // ---- View 3: failed updates, 1% = 190 px ----
  s.comment("Plan view: failed updates");
  y += 50;
  {
    const k = 130;
    const [a, b] = rows(y);
    labels(y);
    s.rect(x0, a, F1 * k, h, "obj fill-2");
    s.rect(x0, b, F2 * k, h, "obj fill-1");
    s.dimH(x0, x0 + F1 * k, a - 14, "F1", { from: [a, a] });
    s.dimH(x0, x0 + F2 * k, b + h + 18, "F2", { from: [b + h, b + h], below: true });
    s.viewTitle(cx, b + h + 54, "Plan view · failed updates", "Scale 1% = 130 px");
    y = b + h + 67;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rowsT = [
    ["T1", "update time, before, s", "> 480"],
    ["T2", "update time, after, s", "< 40"],
    ["G1", "speedup, average", "T1 ÷ T2 > 12"],
    ["D1", "download, before, MB", "68"],
    ["D2", "download, after, MB", "83"],
    ["D3", "extra download, MB", "D2 − D1 = 15"],
    ["G2", "larger download", "D3 ÷ D1 = 22%"],
    ["F1", "failed updates, before, %", "2.2"],
    ["F2", "failed updates, after, %", "0.3"],
    ["G3", "fewer failures", "F1 ÷ F2 = 7.3"],
    ["P1", "deploy time, before, h", "5"],
    ["P2", "deploy time, after, min", "< 1"],
  ];
  const tw = [0, 1, 2].map((j) => Math.max([30, 80, 60][j], Math.ceil(Math.max(...rowsT.map((r) => widthOf(r[j], "tc")), widthOf(["CODE", "VARIABLE", "VALUE"][j], "th")) + 14))).reduce((a, b) => a + b, 0);
  const tb = s.table(W - 32 - tw, ny + 56, "Variables", rowsT);
  s.height = Math.ceil(Math.max(tb.y, y) + 30);
  return s.toString();
}
