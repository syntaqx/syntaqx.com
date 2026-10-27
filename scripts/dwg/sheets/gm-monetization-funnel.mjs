// One month of free-to-play revenue: the audience as a bar with the payers
// highlighted (plan view), the payers' bookings split into store fee and
// net (detail A), and the variable table. Illustrative values. Embedded in
// content/books/gaming/monetization.md.
import { sheet } from "../kit.mjs";

const M1 = 1_000_000, C1 = 0.03, A1 = 20, FEE = 0.3;
const P1 = M1 * C1; // 30,000
const B1 = P1 * A1; // 600,000
const S1 = B1 * FEE; // 180,000
const N1 = B1 - S1; // 420,000
const R1 = B1 / M1; // 0.60
const n = (v) => v.toLocaleString("en-US");

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-mf", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative values, not benchmarks: conversion and spend vary widely by genre, platform and region."],
    [2, "Amounts are before sales tax and VAT, which the store or the seller collects and remits on top."],
    [3, "A 30% store fee, the top rate at several stores; each store's rate is in Stores, Fees & Payments."],
    [0, "Players and USD, one month. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: monthly active players, 100,000 = 54 px ----
  s.comment("Plan view: monthly active players");
  let planBottom;
  {
    const k = 54 / 100_000;
    const x0 = CX - (M1 * k) / 2, x1 = x0 + P1 * k, x2 = x0 + M1 * k;
    const top = ny + 76, h = 36, bot = top + h;
    s.rect(x0, top, x1 - x0, h, "obj hl");
    s.rect(x1, top, x2 - x1, h, "obj fill-2");
    s.label(x1, top, x2 - x1, h, "non-paying players");
    s.dimH(x0, x2, top - 44, "M1", { from: [top, top] });
    s.nb(CX + 18, top - 51.5, 1);
    s.dimH(x0, x1, top - 18, "P1", { from: [top, top], hl: true, dx: -30, dy: 7.5 });
    const cy = bot + 20;
    s.dimH(x1, x2, cy, "M1 − P1", { from: [bot, bot], below: true });
    s.detailRef((x0 + x1) / 2, top + h / 2, 20, "detail A", x0 - 26, bot + 16);
    s.viewTitle(CX, cy + 46, "Plan view · monthly active players", "Scale 100,000 players = 54 px · illustrative");
    planBottom = cy + 59;
  }

  // ---- Detail A: what the payers spend, $100,000 = 100 px ----
  s.comment("Detail A: the payers' money");
  let detailBottom;
  {
    const k = 100 / 100_000;
    const x0 = CX - (B1 * k) / 2, x1 = x0 + S1 * k, x2 = x0 + B1 * k;
    const top = planBottom + 74, h = 36, bot = top + h;
    s.rect(x0, top, x1 - x0, h, "obj fill-1");
    s.rect(x1, top, x2 - x1, h, "obj fill-2");
    s.label(x0, top, x1 - x0, h, "store fee");
    s.nb((x0 + x1) / 2 + 44, top + h / 2, 3);
    s.label(x1, top, x2 - x1, h, "net to developer");
    s.dimH(x0, x2, top - 22, "B1", { from: [top, top] });
    s.nb(CX + 18, top - 29.5, 2);
    s.chainH([x0, x1, x2], bot + 20, ["S1", "N1"], { from: [bot, bot, bot], below: true });
    s.viewTitle(CX, bot + 66, "Detail A · what the payers spend", "Scale $100,000 = 100 px · USD before tax");
    detailBottom = bot + 79;
  }

  s.comment("Variable table");
  const widths = [56, 230, 180];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, detailBottom + 50, "Variables · USD, one month", [
    ["M1", "monthly active players", n(M1)],
    ["C1", "monthly payer conversion", "payers ÷ M1 = 3.0%"],
    ["P1", "paying players", `M1 × C1 = ${n(P1)}`],
    ["M1 − P1", "non-paying players", n(M1 - P1)],
    ["A1", "ARPPU on gross bookings", "B1 ÷ P1 = 20.00"],
    ["B1", "gross bookings", `P1 × A1 = ${n(B1)}`],
    ["S1", "store fee", `B1 × 30% = ${n(S1)}`],
    ["N1", "net to developer", `B1 − S1 = ${n(N1)}`],
    ["R1", "ARPU on gross bookings", `B1 ÷ M1 = ${R1.toFixed(2)}`],
  ], { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
