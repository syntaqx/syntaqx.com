// One currency wallet through a purchase, a grant, a spend and a refund: a
// plan view of the paid and earned balances, the ledger of entries by
// account, and the variable table. Embedded in
// content/books/gaming/economies-and-entitlements.md (The Ledger).
import { sheet, text } from "../kit.mjs";

// Illustrative values in gems [1].
const P1 = 1000, G1 = 200, S1 = 600;
const S1e = Math.min(S1, G1), S1p = S1 - S1e; // earned first
const R1 = P1, V1p = S1p, V1e = S1e;

// Balance after each transaction: [paid, earned, ghost below zero].
const bars = [
  { tx: "tx1", ev: "purchase", paid: P1, earned: 0 },
  { tx: "tx2", ev: "grant", paid: P1, earned: G1 },
  { tx: "tx3", ev: "spend", paid: P1 - S1p, earned: G1 - S1e },
  { tx: "tx4", ev: "refund", paid: P1 - S1p - R1 + V1p, earned: G1 - S1e + V1e, ghost: P1 - S1p - R1 },
];

// Ledger rows: entries per account; every row sums to zero [3].
const cols = ["player_paid", "player_earned", "issued_paid", "issued_earned", "consumed"];
const rows = [
  ["1", "purchase P1", [P1, 0, -P1, 0, 0]],
  ["2", "grant G1", [0, G1, 0, -G1, 0]],
  ["3", "spend S1", [-S1p, -S1e, 0, 0, S1]],
  ["4", "refund R1+V1", [-R1 + V1p, V1e, R1, 0, -(V1p + V1e)]],
];
const num = (v, signed) => (v === 0 ? (signed ? "" : "0") : v < 0 ? `−${-v}` : signed ? `+${v}` : String(v));

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-ee", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative: P1 buys 1000 paid gems, G1 grants 200 earned, S1 spends 600 earned-first (200 earned, then 400 paid)."],
    [2, "R1 claws back all 1000 paid gems; alone it leaves paid at minus 400 (the hatched ghost), so V1 revokes the item in the same transaction."],
    [3, "Each ledger row sums to zero and each column to its closing balance: the wallet is only ever the sum of its entries."],
    [0, "Values in gems. The plan view carries codes; values and formulas are in the tables."],
  ], { width: 690 });

  // ---- Plan view: wallet after each transaction, 100 gems = 10 px ----
  s.comment("Plan view: wallet after each transaction");
  const k = 0.1, bw = 70, pitch = 130, x0 = 140;
  const zero = ny + 46 + Math.max(...bars.map((b) => b.paid + b.earned)) * k;
  const bx = (i) => x0 + i * pitch;
  const axisR = bx(bars.length - 1) + bw + 30;
  s.line(x0 - 30, zero, axisR, zero, "ctr");
  s.text(x0 - 36, zero + 3, "0", "dt", "end");
  bars.forEach((b, i) => {
    const x = bx(i), hp = b.paid * k, he = b.earned * k;
    if (hp) s.rect(x, zero - hp, bw, hp, "obj fill-1");
    if (he) s.rect(x, zero - hp - he, bw, he, "obj fill-2");
    if (b.ghost) s.rect(x, zero, bw, -b.ghost * k, "hatch", { fill: s.hatch });
  });
  // Dimensions, codes only.
  const t1 = bars[0], t2 = bars[1], t3 = bars[2], t4 = bars[3];
  s.dimV(zero - t1.paid * k, zero, bx(0) - 14, "P1", { from: [bx(0), bx(0)], side: "l" });
  s.dimV(zero - t2.paid * k - t2.earned * k, zero - t2.paid * k, bx(1) + bw + 14, "G1", { from: [bx(1) + bw, bx(1) + bw], side: "r" });
  s.dimV(zero - t3.paid * k, zero, bx(2) - 14, "P1−S1p", { from: [bx(2), bx(2)] });
  s.dimV(zero - t4.earned * k, zero, bx(3) - 14, "BE", { from: [bx(3), bx(3)], side: "l" });
  const gy = zero - t4.ghost * k;
  s.dimV(zero, gy, bx(3) + bw + 14, "S1p", { from: [bx(3) + bw, bx(3) + bw], side: "r", hl: true });
  s.nb(bx(3) + bw + 60, (zero + gy) / 2, 2);
  s.callout(bx(3) + bw * 0.3, gy - 8, bx(3) + bw * 0.3 - 30, gy + 14, "ghost", { dir: -1 });
  // Bar labels.
  const ly = gy + 34;
  bars.forEach((b, i) => {
    s.text(bx(i) + bw / 2, ly, b.tx, "sl ink", "middle");
    s.text(bx(i) + bw / 2, ly + 12, b.ev, "sl", "middle");
  });
  // Legend.
  const lgx = axisR + 22, lgy = zero - 110;
  [["paid", "obj fill-1"], ["earned", "obj fill-2"], ["ghost", "hatch"]].forEach(([n, c], i) => {
    s.rect(lgx, lgy + i * 22, 16, 12, c, c === "hatch" ? { fill: s.hatch } : {});
    s.text(lgx + 24, lgy + i * 22 + 9, n, "sl ink");
  });
  const planCx = (x0 - 30 + axisR) / 2;
  s.viewTitle(planCx, ly + 44, "Plan view · wallet after each transaction", "Scale 100 gems = 10 px · balance by transaction");
  const planBottom = ly + 57;

  // ---- Ledger: entries by account ----
  s.comment("Ledger: entries by account");
  const lx = 30, ws = [36, 120, 92, 92, 92, 92, 92, 84], rowH = 18;
  const lw = ws.reduce((a, b) => a + b, 0);
  const top = planBottom + 56;
  const nRows = rows.length + 2;
  s.add(text(lx, top - 7, "Ledger · entries by account · gems", "vt"));
  s.nb(lx + 270, top - 11, 3);
  s.rect(lx, top, lw, nRows * rowH, "tbl");
  for (let i = 1; i < nRows; i++) s.line(lx, top + i * rowH, lx + lw, top + i * rowH, i === nRows - 1 ? "ext" : "tbl");
  let cx = lx;
  const colX = [];
  for (const w of ws) {
    colX.push(cx);
    cx += w;
    if (cx < lx + lw) s.line(cx, top, cx, top + nRows * rowH, "tbl");
  }
  const cell = (r, j, v, cls) => {
    const y = top + r * rowH + rowH / 2 + (r ? 3.2 : 2.7);
    if (j < 2) s.text(colX[j] + 6, y, v, cls);
    else s.text(colX[j] + ws[j] - 8, y, v, cls, "end");
  };
  ["tx", "event", ...cols, "sum"].forEach((h, j) => cell(0, j, h.replace(/_/g, " "), "th"));
  rows.forEach(([n, ev, es], i) => {
    cell(i + 1, 0, n, "tc");
    cell(i + 1, 1, ev, "tc");
    es.forEach((v, j) => cell(i + 1, j + 2, num(v, true), "tc"));
    cell(i + 1, 7, num(es.reduce((a, b) => a + b, 0)), "tc");
  });
  const close = cols.map((_, j) => rows.reduce((a, r) => a + r[2][j], 0));
  cell(nRows - 1, 1, "closing", "tc");
  close.forEach((v, j) => cell(nRows - 1, j + 2, num(v), "tc"));
  cell(nRows - 1, 7, num(close.reduce((a, b) => a + b, 0)), "tc");
  const ledgerBottom = top + nRows * rowH;

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(W / 2 - 126, ledgerBottom + 50, "Variables · gems", [
    ["P1", "purchase, paid", String(P1)],
    ["G1", "grant, earned", String(G1)],
    ["S1", "spend, earned first", `S1e+S1p = ${S1}`],
    ["S1e", "spend from earned", `min(S1, G1) = ${S1e}`],
    ["S1p", "spend from paid", `S1−S1e = ${S1p}`],
    ["R1", "refund clawback, paid", `P1 = ${R1}`],
    ["V1p", "revoke, back to paid", `S1p = ${V1p}`],
    ["V1e", "revoke, back to earned", `S1e = ${V1e}`],
    ["BP", "closing paid", `P1−S1p−R1+V1p = ${t4.paid}`],
    ["BE", "closing earned", `G1−S1e+V1e = ${t4.earned}`],
  ]);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
