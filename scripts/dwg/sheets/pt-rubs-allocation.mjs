// Ratio utility billing (RUBS) as a dimensional sheet: the chapter's
// illustrative water and sewer bill split into the common area share and
// the billable amount, the billable amount split by the 50/50 occupant and
// area weights, and unit 204's charge in detail, with the variable table.
// Embedded in content/books/property-tech/utilities-and-energy.md.
import { sheet } from "../kit.mjs";

// The chapter's worked example, in dollars (illustrative).
const M1 = 12400, P1 = 0.15;
const C1 = M1 * P1; // 1,860
const B1 = M1 - C1; // 10,540
const H = B1 / 2; // 5,270 per half
const U1 = (H * 2) / 420; // 25.10, by occupants
const U2 = (H * 900) / 180000; // 26.35, by area

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-ru", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative bill from the chapter's worked example, not a real property's numbers."],
    [2, "The common area share and the weights are the property's policy, recorded with each charge."],
    [3, "Vacant units' shares are the owner's operating expense, never spread across occupied units."],
    [0, "Values in dollars. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  s.comment("Plan view: the master bill");
  const k = 620 / M1;
  const x0 = CX - (M1 * k) / 2;
  const xC = x0 + C1 * k, xEnd = x0 + M1 * k;
  const top = ny + 50, h = 28, bot = top + h;
  s.rect(x0, top, C1 * k, h, "hatch", { fill: s.hatch });
  s.rect(x0, top, C1 * k, h, "obj", { fill: "none" });
  s.rect(xC, top, B1 * k, h, "obj fill-2");
  s.label(xC, top, B1 * k, h, "billable to units");
  s.label(x0, top, C1 * k, h, "common area", "sl ink ko");
  s.dimH(x0, xEnd, top - 22, "M1", { from: [top, top] });
  s.chainH([x0, xC, xEnd], bot + 20, ["C1", "B1"], { from: [bot, bot, bot], below: true });

  s.comment("Plan view: the billable amount by weight");
  const top2 = bot + 66, bot2 = top2 + h;
  const xH = xC + H * k;
  s.line(xC, bot + 3, xC, top2 - 3, "phantom");
  s.line(xEnd, bot + 3, xEnd, top2 - 3, "phantom");
  s.rect(xC, top2, H * k, h, "obj fill-2");
  s.rect(xH, top2, H * k, h, "obj fill-1");
  s.label(xC, top2, H * k, h, "by occupants");
  s.label(xH, top2, H * k, h, "by square feet");
  s.chainH([xC, xH, xEnd], bot2 + 20, ["H1", "H2"], { from: [bot2, bot2, bot2], below: true });
  s.detailRef(xC + 6, top2 + h / 2, 12, "detail A", xC - 64, top2 - 8);
  s.nb(xEnd + 8, top2 + h / 2 - 7.5, 2);
  s.viewTitle(CX, bot2 + 64, "Plan view · one month's master bill", "Scale $1,000 = 50 px · allocation");
  const planBottom = bot2 + 77;

  s.comment("Detail A: unit 204's share");
  const rowTop = planBottom + 44;
  const kd = 5, dx0 = 44, dTop = rowTop + 24;
  const a = dx0 + U1 * kd, b = a + U2 * kd;
  s.rect(dx0, dTop, U1 * kd, h, "obj fill-2");
  s.rect(a, dTop, U2 * kd, h, "obj fill-1");
  s.label(dx0, dTop, U1 * kd, h, "occupants");
  s.label(a, dTop, U2 * kd, h, "area");
  s.dimH(dx0, b, dTop - 14, "U3", { from: [dTop, dTop], hl: true });
  s.chainH([dx0, a, b], dTop + h + 20, ["U1", "U2"], { from: [dTop + h, dTop + h, dTop + h], below: true });
  s.viewTitle((dx0 + b) / 2, dTop + h + 64, "Detail A · unit 204", "Scale $1 = 5 px · 2 occupants, 900 sq ft");

  s.comment("Variable table");
  const f2 = (v) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const tb = s.table(b + 40, rowTop + 4, "Variables · dollars", [
    ["M1", "master bill, water and sewer", f2(M1)],
    ["P1", "common area share, policy", "15%"],
    ["C1", "common area", `M1 × P1 = ${f2(C1)}`],
    ["B1", "billable to units", `M1 − C1 = ${f2(B1)}`],
    ["H1", "half weighted by occupants", `B1 × 0.5 = ${f2(H)}`],
    ["H2", "half weighted by area", `B1 × 0.5 = ${f2(H)}`],
    ["U1", "unit 204 by occupants", `H1 × 2 ÷ 420 = ${f2(U1)}`],
    ["U2", "unit 204 by area", `H2 × 900 ÷ 180,000 = ${f2(U2)}`],
    ["U3", "unit 204 charge", `U1 + U2 = ${f2(U1 + U2)}`],
  ], { rowH: 15 });
  s.height = Math.ceil(Math.max(tb.y, dTop + h + 77) + 30);
  return s.toString();
}
