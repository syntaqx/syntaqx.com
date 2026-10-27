// One technician's shift on a time axis: the shift limits, the hard
// windows, the route that fills the day and the overtime it uses, with the
// variable tables. Embedded in content/books/field-operations/route-optimization.md.
import { sheet, el, widthOf } from "../kit.mjs";

// Minutes from the 07:30 start. The shift and stop 1 come from the
// chapter's request example [1]; the other stops and drives are illustrative [2].
const S1 = 540, O1 = 60, H1 = S1 + O1;
const WIN1 = [30, 270]; // stop 1 window, 08:00 to 12:00
const BRK = [210, 360]; // break window, 11:00 to 13:30
// The route in order: [kind, minutes, stop number].
const ROUTE = [
  ["drive", 30], ["site", 45, 1], ["drive", 20], ["site", 60, 2], ["drive", 25], ["site", 45, 3],
  ["break", 30], ["drive", 20], ["site", 90, 4], ["drive", 20], ["site", 45, 5], ["drive", 20], ["site", 75, 6], ["drive", 35],
];
const sum = (kind) => ROUTE.filter(([k]) => k === kind).reduce((a, [, m]) => a + m, 0);
const V1 = sum("site"), D1 = sum("drive"), B2 = sum("break");
const R1 = V1 + D1 + B2;
const O2 = R1 - S1;

const tableWidth = (rows) =>
  [0, 1, 2].reduce((w, j) => w + Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(["CODE", "VARIABLE", "VALUE"][j], "th")) + 14)), 0);

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-ros", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "From this chapter's request example: start 07:30, soft end 16:30, hard end 17:30, one 30-minute break."],
    [2, "Stop 1 (window 08:00 to 12:00, 45 min) is from the example too; other stops and drives are illustrative."],
    [3, "The solver may pass the soft end at an overtime cost to keep a visit; nothing crosses the hard end."],
    [0, "Values in minutes. Codes on the drawing, values and formulas in the tables."],
  ], { width: 690 });

  // ---- Plan view: one shift, 1 h = 60 px (1 min = 1 px) ----
  s.comment("Plan view: one shift");
  const x0 = CX - H1 / 2;
  const M = (m) => x0 + m;
  const hY = ny + 40;
  const cY = hY + 24;
  const rulerY = cY + 30;
  s.line(M(0), rulerY, M(H1), rulerY, "ext");
  for (let m = 30, h = 8; m < H1; m += 60, h++) {
    s.line(M(m), rulerY - 3, M(m), rulerY + 3, "ext");
    s.text(M(m), rulerY - 7, `${String(h).padStart(2, "0")}:00`, "tc", "middle");
  }
  s.dimH(M(0), M(H1), hY, "H1", { from: [rulerY, rulerY] });
  s.chainH([M(0), M(S1), M(H1)], cY, ["S1", "O1"], { from: [rulerY, rulerY, rulerY] });
  s.nb(M(S1 / 2) + 22, cY - 7.5, 1);

  // Windows: stop 1 arrival and the break.
  const wh = 18;
  const w1Y = rulerY + 14;
  s.rect(M(WIN1[0]), w1Y, WIN1[1] - WIN1[0], wh, "slot");
  s.label(M(WIN1[0]), w1Y, WIN1[1] - WIN1[0], wh, "stop 1 window, hard");
  s.dimH(M(WIN1[0]), M(WIN1[1]), w1Y + wh + 12, "W1", { from: [w1Y + wh, w1Y + wh], below: true });
  const b1Y = w1Y + wh + 38;
  s.rect(M(BRK[0]), b1Y, BRK[1] - BRK[0], wh, "slot");
  s.label(M(BRK[0]), b1Y, BRK[1] - BRK[0], wh, "break window");
  s.dimH(M(BRK[0]), M(BRK[1]), b1Y + wh + 12, "B1", { from: [b1Y + wh, b1Y + wh], below: true });

  // The route.
  const rY = b1Y + wh + 46, rh = 30;
  let t = 0;
  for (const [kind, m, n] of ROUTE) {
    if (kind === "break") s.rect(M(t), rY, m, rh, "hatch", { fill: s.hatch });
    else s.rect(M(t), rY, m, rh, kind === "site" ? "obj fill-1" : "obj fill-2");
    if (n) s.label(M(t), rY, m, rh, String(n));
    t += m;
  }
  s.nb(M(R1) + 20, rY + rh / 2, 2);

  const rDim = rY + rh + 18;
  s.dimH(M(0), M(R1), rDim, "R1", { from: [rY + rh, rY + rh], below: true });
  const oDim = rDim + 32;
  // A 20 min span: the label sits past the outside arrow, clear of the soft-end line.
  s.dimH(M(S1), M(R1), oDim, "O2", { from: [null, rDim], hl: true, dx: (R1 - S1) / 2 + 22, dy: 7.5 });
  s.nb(M(S1) - 24, oDim, 3);

  // Shift edges as centerlines, labelled under the view.
  const edgeY = oDim + 34;
  for (const [m, lbl] of [[0, "start"], [S1, "soft end"], [H1, "hard end"]]) {
    s.line(M(m), rulerY + 4, M(m), edgeY - 12, "ctr");
    s.text(M(m), edgeY, lbl, "sl ink", "middle");
  }

  // Legend.
  const items = [["on site", "obj fill-1"], ["drive", "obj fill-2"], ["break", "hatch"], ["window", "slot"]];
  const iw = 24, ih = 12, pad = 8, step = 40;
  const legW = items.reduce((a, [l]) => a + iw + pad + widthOf(l, "sl"), 0) + step * (items.length - 1);
  let lx = CX - legW / 2;
  const legY = edgeY + 26;
  for (const [l, cls] of items) {
    s.add(el("rect", { class: cls, x: lx, y: legY, width: iw, height: ih, fill: cls === "hatch" ? s.hatch : null }));
    s.text(lx + iw + pad, legY + ih / 2 + 3, l, "sl ink");
    lx += iw + pad + widthOf(l, "sl") + step;
  }

  const planTitle = legY + ih + 40;
  s.viewTitle(CX, planTitle, "Plan view · one technician's day", "Scale 1 h = 60 px · timeline · 07:30 to 17:30");

  // ---- Variable tables ----
  s.comment("Variable tables");
  const shift = [
    ["H1", "hard limit, start to hard end", `S1 + O1 = ${H1}`],
    ["S1", "paid shift, 07:30 to 16:30", String(S1)],
    ["O1", "overtime allowed, to 17:30", String(O1)],
    ["W1", "stop 1 window, 08:00 to 12:00", String(WIN1[1] - WIN1[0])],
    ["B1", "break window, 11:00 to 13:30", String(BRK[1] - BRK[0])],
  ];
  const route = [
    ["B2", "break taken", String(B2)],
    ["V1", "on site, six stops", String(V1)],
    ["D1", "drive, seven legs", String(D1)],
    ["R1", "route", `V1 + D1 + B2 = ${R1}`],
    ["O2", "overtime used", `R1 − S1 = ${O2}`],
  ];
  const gap = 32;
  const w1 = tableWidth(shift), w2 = tableWidth(route);
  const tx = CX - (w1 + gap + w2) / 2;
  const tTop = planTitle + 13 + 56;
  const ta = s.table(tx, tTop, "Shift · minutes", shift);
  const tb = s.table(tx + w1 + gap, tTop, "Route · minutes", route);
  s.height = Math.ceil(Math.max(ta.y, tb.y) + 30);
  return s.toString();
}
