// The chapter's illustrative distribution waterfall as a dimensional sheet:
// proceeds by tier, the same proceeds by party, the sponsor's share in
// detail and the variable table. Embedded in
// content/books/property-tech/investors-and-asset-management.md.
import { sheet } from "../kit.mjs";

// Illustrative, from the chapter's worked example (dollars).
const E = 10_000_000, PREF = 0.08, YEARS = 3, P = 15_000_000, SPLIT = 0.8, CP = 0.9;
const T1 = E;
const T2 = E * PREF * YEARS;
const R = P - T1 - T2;
const T3 = R * SPLIT;
const T4 = R - T3;
const C = [T1 * CP, T2 * CP, T3 * CP];
const S = [T1 * (1 - CP), T2 * (1 - CP), T3 * (1 - CP), T4];
const sum = (a) => a.reduce((x, y) => x + y, 0);
const fmt = (n) => Math.round(n).toLocaleString("en-US");

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-iw", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Each tier fills before the next receives anything: capital back, then the pref, then the split."],
    [2, "The promote: the sponsor's share above its pro rata equity, here the 20% of the remainder."],
    [0, "Illustrative: numbers chosen for arithmetic, not taken from any deal. Values in the table."],
  ], { width: 690 });

  const k = 38 / 1_000_000; // px per dollar in the plan views
  const x0 = 150;
  const xs = (parts, k2 = k, start = x0) => parts.reduce((acc, v) => [...acc, acc.at(-1) + v * k2], [start]);

  s.comment("Plan view: proceeds by tier");
  const h = 28;
  const top1 = ny + 52;
  const tx = xs([T1, T2, T3, T4]);
  ["fill-2", "fill-1", "fill-2"].forEach((c, i) => s.rect(tx[i], top1, tx[i + 1] - tx[i], h, `obj ${c}`));
  s.rect(tx[3], top1, tx[4] - tx[3], h, "obj hl");
  s.label(tx[0], top1, tx[1] - tx[0], h, "return of capital");
  s.label(tx[1], top1, tx[2] - tx[1], h, "pref");
  s.label(tx[2], top1, tx[3] - tx[2], h, "pro rata");
  s.text(x0 - 10, top1 + h / 2 + 3, "proceeds", "sl ink", "end");
  s.dimH(tx[0], tx[4], top1 - 18, "P", { from: [top1, top1] });
  s.chainH(tx, top1 + h + 18, ["T1", "T2", "T3", "T4"], { from: tx.map(() => top1 + h), below: true });
  s.nb((tx[0] + tx[4]) / 2 + 14, top1 - 33.5, 1);
  const v1 = top1 + h + 62;
  s.viewTitle(x0 + (tx[4] - x0) / 2, v1, "Plan view · proceeds by tier", "Scale $1M = 38 px");

  s.comment("Plan view: proceeds by party");
  const top2 = v1 + 86, gapR = 46;
  const cx = xs(C);
  ["fill-2", "fill-1", "fill-2"].forEach((c, i) => s.rect(cx[i], top2, cx[i + 1] - cx[i], h, `obj ${c}`));
  s.text(x0 - 10, top2 + h / 2 + 3, "capital partner", "sl ink", "end");
  s.chainH(cx, top2 - 18, ["C1", "C2", "C3"], { from: cx.map(() => top2) });
  s.dimH(cx[0], cx[3], top2 - 40, "C", { from: [top2 - 18, top2 - 18] });
  const sy = top2 + h + gapR;
  const sx = xs(S);
  ["fill-2", "fill-1", "fill-2"].forEach((c, i) => s.rect(sx[i], sy, sx[i + 1] - sx[i], h, `obj ${c}`));
  s.rect(sx[3], sy, sx[4] - sx[3], h, "obj hl");
  s.text(x0 - 10, sy + h / 2 + 3, "sponsor", "sl ink", "end");
  s.detailRef((sx[0] + sx[4]) / 2, sy + h / 2, 42, "detail A", sx[4] + 90, sy + 4);
  const v2 = sy + h + 62;
  s.viewTitle(x0 + (cx[3] - x0) / 2, v2, "Plan view · proceeds by party", "Scale $1M = 38 px");

  s.comment("Detail A: the sponsor's share");
  const kd = k * 4;
  const top3 = v2 + 62;
  const dx = xs(S, kd, 40);
  ["fill-2", "fill-1", "fill-2"].forEach((c, i) => s.rect(dx[i], top3, dx[i + 1] - dx[i], h, `obj ${c}`));
  s.rect(dx[3], top3, dx[4] - dx[3], h, "obj hl");
  s.label(dx[0], top3, dx[1] - dx[0], h, "capital back");
  s.label(dx[3], top3, dx[4] - dx[3], h, "promote");
  s.chainH(dx, top3 + h + 18, ["S1", "S2", "S3", "S4"], { from: dx.map(() => top3 + h), below: true });
  s.dimH(dx[0], dx[4], top3 - 18, "S", { from: [top3, top3] });
  s.nb(dx[4] + 8, top3 + 6, 2);
  const v3 = top3 + h + 62;
  s.viewTitle((dx[0] + dx[4]) / 2, v3, "Detail A · the sponsor's share", "Scale 4:1 · $1M = 152 px");

  s.comment("Variable table");
  const tb = s.table(392, top3 - 12, "Variables · dollars", [
    ["E", "equity", fmt(E)],
    ["T1", "return of capital", `E = ${fmt(T1)}`],
    ["T2", "pref, 8% simple, 3 years", `E × 8% × 3 = ${fmt(T2)}`],
    ["R", "remainder", `P − T1 − T2 = ${fmt(R)}`],
    ["T3", "pro rata split", `R × 80% = ${fmt(T3)}`],
    ["T4", "promote", `R × 20% = ${fmt(T4)}`],
    ["P", "proceeds at sale", `T1+T2+T3+T4 = ${fmt(P)}`],
    ["C1", "partner: capital", `T1 × 90% = ${fmt(C[0])}`],
    ["C2", "partner: pref", `T2 × 90% = ${fmt(C[1])}`],
    ["C3", "partner: pro rata", `T3 × 90% = ${fmt(C[2])}`],
    ["C", "capital partner", `C1+C2+C3 = ${fmt(sum(C))}`],
    ["S1", "sponsor: capital", `T1 × 10% = ${fmt(S[0])}`],
    ["S2", "sponsor: pref", `T2 × 10% = ${fmt(S[1])}`],
    ["S3", "sponsor: pro rata", `T3 × 10% = ${fmt(S[2])}`],
    ["S4", "sponsor: promote", `T4 = ${fmt(S[3])}`],
    ["S", "sponsor, about 13% of P", `S1+…+S4 = ${fmt(sum(S))}`],
  ], { rowH: 15 });

  s.height = Math.ceil(Math.max(tb.y, v3 + 13) + 24);
  return s.toString();
}
