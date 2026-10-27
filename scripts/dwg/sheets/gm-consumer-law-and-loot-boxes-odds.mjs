// One illustrative drop table closing to 100%, the legendary band in detail,
// and a hard pity on a pull axis. Embedded in
// content/books/gaming/consumer-law-and-loot-boxes.md.
import { sheet, widthOf } from "../kit.mjs";

// Illustrative values in % [1].
const P = [1, 9, 30, 60]; // legendary, epic, rare, common
const L = [0.25, 0.25, 0.25, 0.25]; // items inside the legendary band
const B1 = P[0] / 100, N1 = 50;
const E1 = (1 - (1 - B1) ** N1) / B1; // 39.50 pulls

const tableWidths = (rows) =>
  [0, 1, 2].map((j) => Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(["CODE", "VARIABLE", "VALUE"][j], "th")) + 14)));

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-lb", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative values, not any real game's. Every level closes: rarities to P0, items to their rarity."],
    [2, "A legendary is guaranteed on pull N1 if none came sooner. Disclose B1 and N1; R1 is the consolidated rate."],
    [3, "Odds are stored as integer weights; disclosed percentages come from the same rows the server rolls."],
    [0, "Rates in %; in formulas B1 is a fraction (1% = 0.01). Codes on the drawing; values and formulas in the table."],
  ], { width: 690 });

  // ---- Plan view: the whole table, 1% = 5.4 px ----
  s.comment("Plan view: one drop table");
  let planBottom;
  {
    const k = 5.4, x0 = CX - 50 * k;
    const xs = P.reduce((acc, p) => [...acc, acc[acc.length - 1] + p * k], [x0]);
    const top = ny + 62, h = 30, bot = top + h;
    P.forEach((_, i) => s.rect(xs[i], top, xs[i + 1] - xs[i], h, i === 0 ? "obj fill-1" : "obj fill-2"));
    ["epic", "rare", "common"].forEach((t, i) => s.label(xs[i + 1], top, xs[i + 2] - xs[i + 1], h, t));
    s.dimH(xs[0], xs[4], top - 22, "P0", { from: [top, top], hl: true });
    s.chainH(xs, bot + 20, ["P1", "P2", "P3", "P4"], { from: xs.map(() => bot), below: true, offsets: [[-16, 0]] });
    s.detailRef(xs[0] + (P[0] * k) / 2, top + h / 2, 10, "detail A", xs[0] - 34, top - 8);
    const t = "Plan view · one drop table";
    s.viewTitle(CX, bot + 64, t, "Scale 1% = 5.4 px · by rarity");
    s.nb(CX + widthOf(t, "vt") / 2 + 16, bot + 60, 1);
    planBottom = bot + 77;
  }

  // ---- Detail A (left) and Detail B (right), each 300 wide ----
  const rowTop = planBottom + 74, h = 30, VW = 300;
  const ax = CX - 30 - VW, bx = CX + 30;
  let rowBottom;

  s.comment("Detail A: legendary band");
  {
    const k = VW / P[0];
    const xs = L.reduce((acc, l) => [...acc, acc[acc.length - 1] + l * k], [ax]);
    L.forEach((_, i) => {
      s.rect(xs[i], rowTop, xs[i + 1] - xs[i], h, "obj fill-1");
      s.label(xs[i], rowTop, xs[i + 1] - xs[i], h, `item ${"abcd"[i]}`);
    });
    s.dimH(ax, ax + VW, rowTop - 22, "P1", { from: [rowTop, rowTop] });
    s.chainH(xs, rowTop + h + 20, ["L1", "L2", "L3", "L4"], { from: xs.map(() => rowTop + h), below: true });
    s.viewTitle(ax + VW / 2, rowTop + h + 64, "Detail A · legendary, P1", "Scale 1% = 300 px · 55.6:1");
  }

  s.comment("Detail B: hard pity");
  {
    const k = VW / N1, xe = bx + E1 * k, xl = bx + (N1 - 1) * k, xn = bx + VW;
    s.rect(bx, rowTop, xl - bx, h, "obj fill-2");
    s.rect(xl, rowTop, xn - xl, h, "obj fill-1");
    s.line(xe, rowTop - 8, xe, rowTop + h + 4, "ctr");
    s.callout(xn - k / 2, rowTop + h / 2, xn - 40, rowTop - 14, "guaranteed", { dir: -1 });
    const y1 = rowTop + h + 20, y2 = y1 + 22;
    s.dimH(bx, xe, y1, "E1", { from: [rowTop + h, rowTop + h + 4] });
    s.dimH(bx, xn, y2, "N1", { from: [null, rowTop + h] });
    s.line(bx, y1 + 4, bx, y2 + 4, "ext");
    const t = "Detail B · hard pity";
    s.viewTitle(bx + VW / 2, rowTop + h + 64, t, "Scale 1 pull = 6 px · pull axis");
    s.nb(bx + VW / 2 + widthOf(t, "vt") / 2 + 16, rowTop + h + 60, 2);
    rowBottom = rowTop + h + 77;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["P0", "whole table", "P1 + P2 + P3 + P4 = 100.00"],
    ["P1", "legendary", "L1 + L2 + L3 + L4 = 1.00"],
    ["P2", "epic", "9.00"],
    ["P3", "rare", "30.00"],
    ["P4", "common", "60.00"],
    ["L1 to L4", "each legendary item", "0.25"],
    ["B1", "base rate of a legendary", "P1 = 1.00"],
    ["N1", "pity, pulls", "50"],
    ["E1", "expected pulls to a legendary", "(1 − (1 − B1)^N1) ÷ B1 = 39.50"],
    ["R1", "effective rate", "1 ÷ E1 = 2.53"],
  ];
  const tw = tableWidths(rows).reduce((a, b) => a + b, 0);
  const tx = CX - tw / 2, ty = rowBottom + 50, tt = "Variables · %";
  const tb = s.table(tx, ty, tt, rows);
  s.nb(tx + widthOf(tt, "vt") + 14, ty - 11, 3);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
