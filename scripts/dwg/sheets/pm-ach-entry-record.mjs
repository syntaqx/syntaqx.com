// The 94-character Nacha entry detail record (type 6) as a plan view of its
// eight field groups, the amount field in detail, and the variable table.
// Embedded in content/books/payments/ach.md (entry detail record).
import { sheet, widthOf } from "../kit.mjs";

// Field groups in character positions, in record order.
const P = [
  { code: "P1", len: 3, name: "record type, txn code", box: null, call: "type · txn code" },
  { code: "P2", len: 9, name: "RDFI routing + check", box: "routing" },
  { code: "P3", len: 17, name: "account number", box: "account" },
  { code: "P4", len: 10, name: "amount in cents", box: "amount" },
  { code: "P5", len: 15, name: "individual ID", box: "individual ID" },
  { code: "P6", len: 22, name: "individual name", box: "name" },
  { code: "P7", len: 3, name: "pay type, addenda", box: null, call: "pay type · addenda" },
  { code: "P8", len: 15, name: "trace number", box: "trace" },
];
const L1 = P.reduce((a, p) => a + p.len, 0); // 94
const AMOUNT = "0000185000"; // P4 example: $1,850.00
const D1 = 8, C1 = 2; // dollars, cents within P4

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pm-er", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "No decimal point is ever written: the last two positions are cents, zero-filled from the left."],
    [2, "Numeric fields are right-justified and zero-filled; text fields left-justified, upper case, space-filled."],
    [0, `Detail A shows the amount ${AMOUNT}, which reads as $1,850.00.`],
    [0, "Lengths in character positions. The drawing carries codes; positions, lengths and the sum are in the table."],
  ], { width: 690 });

  // ---- Plan view: one record, 1 position = 7 px ----
  s.comment("Plan view: entry detail record");
  const k = 7;
  const x0 = CX - (L1 * k) / 2;
  const xs = P.reduce((acc, p) => [...acc, acc[acc.length - 1] + p.len * k], [x0]);
  const top = ny + 70, h = 40, bot = top + h, mid = top + h / 2;
  P.forEach((p, i) => {
    s.rect(xs[i], top, xs[i + 1] - xs[i], h, `obj ${i % 2 ? "fill-1" : "fill-2"}`);
    if (p.box) s.label(xs[i], top, xs[i + 1] - xs[i], h, p.box);
    else {
      // The last callout turns left so its label stays clear of L1's extension line.
      const d = i > 4 ? -1 : 1;
      s.callout((xs[i] + xs[i + 1]) / 2, mid, (xs[i] + xs[i + 1]) / 2 + d * 12, top - 16, p.call, { dir: d });
    }
  });
  s.dimH(xs[0], xs[8], top - 40, "L1", { from: [top, top], hl: true });
  s.chainH(xs, bot + 20, P.map((p) => p.code), { from: xs.map(() => bot), below: true });
  const p4 = (xs[3] + xs[4]) / 2;
  s.detailRef(p4, mid, 28, "detail A", p4 - 62, top - 16);
  s.viewTitle(CX, bot + 66, "Plan view · entry detail record (6)", `Scale 1 position = ${k} px · positions 1 to ${L1}`);
  const planBottom = bot + 79;

  // ---- Detail A: the amount field, 1 position = 30 px ----
  s.comment("Detail A: amount");
  const rowTop = planBottom + 40;
  const dk = 30, dx0 = 52, dTop = rowTop + 36, dh = 34;
  const dot = dx0 + D1 * dk;
  [...AMOUNT].forEach((ch, i) => {
    s.rect(dx0 + i * dk, dTop, dk, dh, i < D1 ? "obj fill-2" : "obj fill-1");
    s.text(dx0 + i * dk + dk / 2, dTop + dh / 2 + 3.5, ch, "tc", "middle");
  });
  s.line(dot, dTop - 10, dot, dTop + dh + 8, "ctr");
  s.text(dot, dTop - 14, "implied decimal", "sl ink", "middle");
  s.nb(dot + widthOf("implied decimal", "sl") / 2 + 12, dTop - 17.5, 1);
  s.chainH([dx0, dot, dot + C1 * dk], dTop + dh + 20, ["D1", "C1"], { from: [dTop + dh, dTop + dh, dTop + dh], below: true });
  s.viewTitle(dx0 + (AMOUNT.length * dk) / 2, dTop + dh + 66, "Detail A · amount, P4", `Enlarged · 1 position = ${dk} px`);

  // ---- Variable table ----
  s.comment("Variable table");
  let pos = 1;
  const rows = [
    ["L1", "whole record, 1-94", `P1+…+P8 = ${L1}`],
    ...P.map((p) => {
      const r = [p.code, `${p.name}, ${pos}-${pos + p.len - 1}`, String(p.len)];
      pos += p.len;
      return r;
    }),
    ["D1", "dollars, 30-37", String(D1)],
    ["C1", "cents, 38-39", String(C1)],
  ];
  const widths = [40, 160, 130];
  const tx = W - 30 - widths.reduce((a, b) => a + b, 0);
  const tb = s.table(tx, rowTop + 16, "Variables · positions", rows, { widths });
  s.nb(tx + widthOf("Variables · positions", "vt") + 4, rowTop + 16 - 11, 2);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
