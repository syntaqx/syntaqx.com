// Identity stitching for one person on two devices: anonymous IDs linked to
// the user at login, and a reset at logout. Plan view on a day axis and the
// variable table. Embedded in content/docs/telemetry/event-design.md (Identity).
import { sheet, widthOf } from "../kit.mjs";

// Illustrative timeline in days [4].
const PHONE = { a: [0, 5], u: [5, 7] };
const LAPTOP = { b: [1, 4], u: [4, 6], c: [6, 7] };
const DAYS = 7;
const len = ([a, b]) => b - a;
const A1 = len(PHONE.a), U2 = len(PHONE.u), A2 = len(LAPTOP.b), U1 = len(LAPTOP.u), C1 = len(LAPTOP.c);
const P1 = A1 + U2;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "tm-ed", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The first event carrying both the anonymous ID and the user ID records the link (identify at login)."],
    [2, "Once linked, the earlier anonymous events on both devices count as user u: one person, two devices."],
    [3, "Logout resets the anonymous ID, so the next person on a shared laptop is not merged into user u."],
    [4, "Illustrative timeline, not a measurement."],
    [0, "Values in days. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 day = 80 px ----
  s.comment("Plan view: two devices, one person");
  const k = 80, lx = 96;
  const x0 = lx + 16 + (W - 32 - lx - 16 - DAYS * k) / 2;
  const X = (d) => x0 + d * k;
  const h = 32;
  const phoneY = ny + 58;
  const laptopY = phoneY + h + 64;
  const box = ([a, b], y, cls, label) => {
    s.rect(X(a), y, X(b) - X(a), h, cls);
    s.label(X(a), y, X(b) - X(a), h, label);
  };

  s.text(x0 - 14, phoneY + h / 2 + 3, "phone", "sl ink", "end");
  box(PHONE.a, phoneY, "obj fill-2", "anonymous a");
  box(PHONE.u, phoneY, "obj fill-1", "user u");
  s.nb(X(PHONE.u[0]) + 10, phoneY + 10, 1);
  s.dimH(X(0), X(DAYS), phoneY - 22, "P1", { from: [phoneY, phoneY], hl: true });
  s.nb((X(0) + X(DAYS)) / 2 + 20, phoneY - 29.5, 2);
  s.chainH([X(PHONE.a[0]), X(PHONE.a[1]), X(PHONE.u[1])], phoneY + h + 18, ["A1", "U2"], { from: [phoneY + h, phoneY + h, phoneY + h], below: true });

  s.text(x0 - 14, laptopY + h / 2 + 3, "laptop", "sl ink", "end");
  box(LAPTOP.b, laptopY, "obj fill-2", "anonymous b");
  box(LAPTOP.u, laptopY, "obj fill-1", "user u");
  box(LAPTOP.c, laptopY, "slot", "anon c");
  s.nb(X(LAPTOP.u[0]) + 10, laptopY + 10, 1);
  s.nb(X(LAPTOP.c[1]) + 14, laptopY + h / 2, 3);
  s.chainH([X(LAPTOP.b[0]), X(LAPTOP.b[1]), X(LAPTOP.u[1]), X(LAPTOP.c[1])], laptopY + h + 18, ["A2", "U1", "C1"], { from: Array(4).fill(laptopY + h), below: true });

  const axY = laptopY + h + 54;
  s.line(X(0), axY, X(DAYS), axY, "obj");
  for (let d = 0; d <= DAYS; d++) {
    s.line(X(d), axY - 4, X(d), axY + 4, "obj");
    s.text(X(d), axY + 15, String(d), "vs", "middle");
  }
  s.text(x0 - 14, axY + 15, "day", "vs", "end");
  s.viewTitle((X(0) + X(DAYS)) / 2, axY + 50, "Plan view · two devices, one person", "Scale 1 day = 80 px · timeline");
  const viewBottom = axY + 63;

  // ---- Variable table ----
  s.comment("Variable table");
  const v = (n) => n.toFixed(2);
  const rows = [
    ["A1", "phone, anonymous ID a before login", v(A1)],
    ["U2", "phone, identified as user u", v(U2)],
    ["A2", "laptop, anonymous ID b before login", v(A2)],
    ["U1", "laptop, identified as user u until logout", v(U1)],
    ["C1", "laptop, new anonymous ID c after logout, not linked", v(C1)],
    ["P1", "stitched history of user u, first event to last", `A1 + U2 = ${v(P1)}`],
  ];
  const tw = [0, 1, 2].reduce((sum, j) => sum + Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc"))) + 14)), 0);
  const tb = s.table((X(0) + X(DAYS)) / 2 - tw / 2, viewBottom + 50, "Variables · days", rows);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
