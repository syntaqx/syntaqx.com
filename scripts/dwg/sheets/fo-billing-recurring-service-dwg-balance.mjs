// Level billing for a seven-round program: the service balance at each
// month end as a plan view, the August true-up in detail and the variable
// table. Embedded in content/books/field-operations/billing-recurring-service.md.
import { sheet, widthOf } from "../kit.mjs";

// Illustrative program [2], USD: A1 a year, billed M1 on the 1st, V1 a round.
const A1 = 420;
const M1 = A1 / 12; // 35
const V1 = A1 / 7; // 60
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const ROUNDS = [3, 4, 5, 6, 8, 9, 10]; // months (1-based) with a round
const done = (m) => ROUNDS.filter((r) => r <= m).length;
const B = MONTHS.map((_, i) => M1 * (i + 1) - V1 * done(i + 1));
const CODED = { 2: "B2", 8: "B8", 10: "B10", 12: "B12" }; // balances named in the table

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-bsb", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Paid ahead of the work: under accrual accounting, a liability until earned (deferred revenue)."],
    [2, "Illustrative: the price, the seven round months and the even round value are not from a source."],
    [3, "Whether a negative balance is billed, refunded or forgiven at termination is a term the agreement states."],
    [0, "Values in USD; balance is paid minus delivered at month end. Codes on the drawing, values in the table."],
  ], { width: 690 });

  // ---- Plan view: one program year, 1 month = 50 px, 1 USD = 1 px ----
  s.comment("Plan view: one program year");
  const k = 50, bw = 30;
  const x0 = CX - (12 * k) / 2;
  const col = (i) => x0 + i * k + (k - bw) / 2; // left of month i's box
  const ty = ny + 36;
  const monthY = ty + 26;
  const billY = monthY + 12, rowH = 18;
  const roundY = billY + rowH + 12;
  const maxUp = Math.max(...B), maxDown = -Math.min(...B);
  const base = roundY + rowH + 30 + maxUp;

  s.dimH(x0, x0 + 12 * k, ty, "T1", { from: [billY, billY] });
  MONTHS.forEach((m, i) => {
    s.text(col(i) + bw / 2, monthY, m, "sl ink", "middle");
    s.rect(col(i), billY, bw, rowH, "obj fill-2");
    s.label(col(i), billY, bw, rowH, "M1", "tc");
  });
  ROUNDS.forEach((m, j) => {
    s.rect(col(m - 1), roundY, bw, rowH, "obj fill-1");
    s.label(col(m - 1), roundY, bw, rowH, String(j + 1), "tc");
  });
  s.text(x0 - 12, billY + rowH / 2 + 3, "billed", "sl ink", "end");
  s.text(x0 - 12, roundY + rowH / 2 + 3, "rounds", "sl ink", "end");
  s.text(x0 - 12, base + 3, "balance", "sl ink", "end");
  s.line(x0, base, x0 + 12 * k, base, "ctr");

  B.forEach((b, i) => {
    const x = col(i), m = i + 1;
    if (b !== 0) s.rect(x, b > 0 ? base - b : base, bw, Math.abs(b), m === 8 ? "obj hl" : "obj fill-2");
    const code = CODED[m];
    if (!code || m === 8) return;
    s.text(x + bw / 2, b >= 0 ? base - b - 6 : base - b + 13, code, "dt", "middle");
  });

  // B8: the August true-up, dimensioned on the bar.
  const ax = col(7);
  s.dimV(base, base - B[7], ax - 10, "B8", { from: [ax, ax], side: "l", hl: true });
  s.nb(ax - 42, base - B[7] / 2, 3);
  s.detailRef(ax + bw / 2, base - B[7] / 2, 22, "detail A", ax - 40, base + maxDown - 4);

  // What the sign means.
  const upX = col(8);
  s.text(upX, base - maxUp + 18, "above: business owes service", "sl ink");
  s.nb(upX + widthOf("above: business owes service", "sl") + 12, base - maxUp + 15, 1);
  s.text(col(0), base + 46, "below: customer has received more", "sl ink");

  const planTitle = base + maxDown + 40;
  s.viewTitle(CX, planTitle, "Plan view · a seven-round program, one year", "Scale 1 month = 50 px · 1 USD = 1 px · illustrative");
  s.nb(CX + 172, planTitle - 4, 2);

  // ---- Detail A: the August true-up, 1 USD = 0.8 px ----
  s.comment("Detail A: August true-up");
  const rowTop = planTitle + 13 + 40;
  const kd = 0.8, dx0 = 60;
  const paid = M1 * 8, given = V1 * done(8);
  const pY = rowTop + 40, gY = pY + 34, bh = 22;
  s.rect(dx0, pY, paid * kd, bh, "obj fill-2");
  s.rect(dx0, gY, given * kd, bh, "obj fill-1");
  s.label(dx0, pY, paid * kd, bh, "paid");
  s.label(dx0, gY, given * kd, bh, "delivered");
  s.chainH([dx0, dx0 + paid * kd, dx0 + given * kd], pY - 18, ["M1×8", "B8"], { from: [pY, pY, gY], hl: [1] });
  s.nb(dx0 + given * kd + 24,pY - 25.5, 3);
  s.dimH(dx0, dx0 + given * kd, gY + bh + 20, "V1×5", { from: [gY + bh, gY + bh], below: true });
  const detailTitle = gY + bh + 64;
  s.viewTitle(dx0 + (given * kd) / 2, detailTitle, "Detail A · August true-up", "Scale 1 USD = 0.8 px · paid against delivered");

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(372, rowTop + 16, "Variables · USD", [
    ["T1", "program year, billed on the 1st", "12 months"],
    ["A1", "annual price, seven rounds", String(A1)],
    ["M1", "monthly charge", `A1 ÷ 12 = ${M1}`],
    ["V1", "value of one round", `A1 ÷ 7 = ${V1}`],
    ["Bm", "service balance, end of month m", "M1×m − V1×rounds done"],
    ["B2", "balance, end of February", `M1×2 − V1×0 = ${B[1]}`],
    ["B8", "balance, end of August", `M1×8 − V1×5 = −${-B[7]}`],
    ["B10", "balance, end of October", `M1×10 − V1×7 = −${-B[9]}`],
    ["B12", "balance, end of the year", `M1×12 − V1×7 = ${B[11]}`],
  ]);
  s.height = Math.ceil(Math.max(tb.y, detailTitle + 13) + 30);
  return s.toString();
}
