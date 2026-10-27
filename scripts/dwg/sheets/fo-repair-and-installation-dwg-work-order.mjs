// One repair work order on a day axis: two visits, the part hold between
// them, and the two 30-day windows that start at the repair; the hold
// reasons and the variables in tables. Embedded in
// content/books/field-operations/repair-and-installation.md.
import { sheet, text, widthOf } from "../kit.mjs";

const H1 = 6; // illustrative part wait, days [3]
const W1 = 30; // claim window from the repair date [1]
const K1 = 30; // callback window from the service call [2]

// A table with its own column headers (the kit's table is CODE / VARIABLE /
// VALUE); same rules and lettering.
function table(s, x, y, title, head, rows, rowH = 15) {
  const all = [head, ...rows];
  const ws = head.map((_, j) => Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(head[j], "th")) + 18));
  const w = ws.reduce((a, b) => a + b, 0), h = all.length * rowH;
  s.add(text(x, y - 7, title, "vt"));
  s.rect(x, y, w, h, "tbl");
  for (let i = 1; i < all.length; i++) s.line(x, y + i * rowH, x + w, y + i * rowH, "tbl");
  let cx = x;
  for (const wj of ws.slice(0, -1)) s.line((cx += wj), y, cx, y + h, "tbl");
  all.forEach((r, i) => {
    let c = x;
    r.forEach((v, j) => {
      s.add(text(c + 6, y + i * rowH + rowH / 2 + (i ? 3.2 : 2.7), v, i ? "tc" : "th"));
      c += ws[j];
    });
  });
  return { y: y + h, width: w };
}

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-riw", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "A distributor's HVAC warranty process: claims within 30 days of the repair date."],
    [2, "A field-service suite's guide: a recall is a technician error within 30 days of a service call."],
    [3, "Illustrative part wait; the hold ends when the special-order part arrives and the return visit is booked."],
    [4, "V1 diagnoses and quotes: a visit can be completed while its work order is not; the open order carries hold_reason until V2."],
    [5, "The same suite documents the same three: waiting for parts or materials, a pending permit, needing authorization."],
    [0, "Values in days. Visits are drawn as marks, not to scale. Codes on the drawing; values in the table."],
  ], { width: 690 });

  // ---- Plan view: one work order, 1 day = 14 px ----
  s.comment("Plan view: one work order, two visits");
  const k = 14, T1 = H1 + W1;
  const x0 = CX + 30 - (T1 * k) / 2;
  const X = (d) => x0 + d * k;
  const h = 20, lx = x0 - 14, vw = 8;

  // Events across the top, centerlines down through every row.
  const eY = ny + 40;
  const vY = eY + 22, oY = vY + h + 48, cY = oY + h + 52, kY = cY + h + 44;
  const bottom = kY + h;
  for (const [d, l] of [[0, "call · day 0"], [H1, "repair · day 6"], [T1, "last day to file"]]) {
    s.text(X(d), eY, l, "sl ink", "middle");
    s.line(X(d), eY + 6, X(d), bottom + 6, "ctr");
  }

  // Visits.
  s.text(lx, vY + h / 2 + 3, "visits", "sl ink", "end");
  s.rect(X(0), vY, vw, h, "obj fill-1");
  s.rect(X(H1), vY, vw, h, "obj fill-1");
  s.text(X(0) + vw + 6, vY + h / 2 + 3, "V1", "sl ink");
  s.text(X(H1) + vw + 6, vY + h / 2 + 3, "V2 · repair, closes the order", "sl ink");
  s.nb(X(0) + vw + 30, vY + h / 2, 4);

  // Work order: open, on hold for the part until V2.
  s.text(lx, oY + h / 2 + 3, "work order", "sl ink", "end");
  s.rect(X(0), oY, X(H1) - X(0), h, "hatch", { fill: s.hatch });
  s.text((X(0) + X(H1)) / 2, oY + h / 2 + 3, "part_needed", "sl ink ko", "middle");
  s.text(X(H1) + 10, oY + h / 2 + 3, "open, on hold until V2", "sl");
  s.dimH(X(0), X(H1), oY - 18, "H1", { from: [oY, oY], hl: true });
  s.nb((X(0) + X(H1)) / 2 + 20, oY - 25.5, 3);

  // Two windows that start at the repair.
  const win = (y, label, code, n, len) => {
    s.rect(X(H1), y, len * k, h, "slot");
    s.text(X(H1) + (len * k) / 2, y + h / 2 + 3, label, "sl ink", "middle");
    s.dimH(X(H1), X(H1 + len), y - 18, code, { from: [y, y] });
    s.nb(X(H1) + (len * k) / 2 + 20, y - 25.5, n);
  };
  s.text(lx, cY + h / 2 + 3, "claim", "sl ink", "end");
  win(cY, "warranty claim submit-by window", "W1", 1, W1);
  s.text(lx, kY + h / 2 + 3, "callback", "sl ink", "end");
  win(kY, "workmanship callback window", "K1", 2, K1);

  // Call to last day to file.
  s.dimH(X(0), X(T1), bottom + 20, "T1", { from: [bottom, bottom], below: true });

  const vtY = bottom + 64;
  s.viewTitle(CX, vtY, "Plan view · one work order, two visits", "Scale 1 day = 14 px · timeline");
  const planBottom = vtY + 13;

  // ---- Tables: hold reasons, variables ----
  s.comment("Tables");
  const ty = planBottom + 44;
  const hold = table(s, 32, ty, "Hold reasons", ["hold_reason", "released by"], [
    ["part_needed", "part order received at branch or truck"],
    ["approval_needed", "approval recorded: who, amount, reference"],
    ["permit_needed", "permit issued; the inspection is its own visit"],
  ]);
  s.nb(32 + widthOf("Hold reasons", "vt") + 16, ty - 11, 5);
  const rows = [
    ["H1", "on hold, part_needed, V1 to V2", `${H1}`],
    ["W1", "claim window, from the repair", `${W1}`],
    ["K1", "callback window, from the service call", `${K1}`],
    ["T1", "call to last day to file", `H1 + W1 = ${T1}`],
  ];
  const tw = [36, 172, 84];
  const vars = s.table(W - 32 - tw.reduce((a, b) => a + b, 0), ty, "Variables · days", rows, { widths: tw });
  s.height = Math.ceil(Math.max(hold.y, vars.y) + 30);
  return s.toString();
}
