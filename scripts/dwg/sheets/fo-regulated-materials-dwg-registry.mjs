// Pennsylvania's hypersensitivity registry notice (7 Pa. Code 128.112) on an
// hour axis from the application's earliest start, the 500 ft notice radius
// in plan, and the variable table. Embedded in
// content/books/field-operations/regulated-materials.md.
import { sheet } from "../kit.mjs";

// Hours from the earliest start [1] [2] [3].
const L2 = 72, L1 = 12; // longest and shortest lead before the start
const N1 = L2 - L1; // 60
const A1 = 24, R1 = 24;
const D1 = 500; // ft

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-rmn", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Notice 12 to 72 h before the application to listed homes within 500 ft; drawn from the earliest start."],
    [2, "The notice gives earliest start and latest finish, at most 24 h apart, plus products and license."],
    [3, "A record of each notice, with time and method, within 24 hours after the application; kept at least 3 years."],
    [0, "Values in hours and feet. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: one application on an hour axis, 1 h = 5 px ----
  s.comment("Plan view: notice timeline");
  const k = 5;
  const span = L2 + A1 + R1;
  const x0 = (W - span * k) / 2 + 30; // room for the lane names on the left
  const X = (hr) => x0 + (hr + L2) * k;
  const cx1 = (X(-L2) + X(A1 + R1)) / 2;
  const h = 24, step = 60;
  const nTop = ny + 84, aTop = nTop + step, rTop = aTop + step;
  let planBottom;
  {
    // Lanes.
    [["notice", nTop], ["apply", aTop], ["record", rTop]].forEach(([t, y]) => s.text(x0 - 14, y + h / 2 + 3, t, "sl ink", "end"));
    s.rect(X(-L2), nTop, N1 * k, h, "obj hl");
    s.rect(X(-L1), nTop, L1 * k, h, "hatch", { fill: s.hatch });
    s.label(X(-L2), nTop, N1 * k, h, "notify listed people");
    s.rect(X(0), aTop, A1 * k, h, "obj fill-1");
    s.label(X(0), aTop, A1 * k, h, "application");
    s.rect(X(A1), rTop, R1 * k, h, "slot");
    s.label(X(A1), rTop, R1 * k, h, "record due");

    // Earliest start and latest finish.
    const refBot = rTop + h + 44;
    s.line(X(0), nTop + h + 4, X(0), refBot - 12, "ctr");
    s.line(X(A1), aTop - 8, X(A1), refBot - 12, "ctr");
    s.text(X(0), refBot, "earliest start", "sl ink", "end");
    s.text(X(A1), refBot, "latest finish", "sl ink", "start");

    // Leads above the notice lane: N1 (the subject) and L1, then L2 overall.
    const cy = nTop - 20, oy = nTop - 42;
    s.chainH([X(-L2), X(-L1), X(0)], cy, ["N1", "L1"], { from: [nTop, nTop, nTop], hl: [0] });
    s.nb(X(-L2 + N1 / 2) + 18, cy - 7.5, 1);
    s.dimH(X(-L2), X(0), oy, "L2", { from: [nTop, nTop] });

    // Application window and record window below their lanes.
    s.dimH(X(0), X(A1), aTop + h + 16, "A1", { below: true });
    s.nb(X(A1 / 2) + 18, aTop + h + 24, 2);
    s.dimH(X(A1), X(A1 + R1), rTop + h + 16, "R1", { from: [null, rTop + h], below: true });
    s.nb(X(A1 + R1 / 2) + 18, rTop + h + 24, 3);

    const vy = refBot + 44;
    s.viewTitle(cx1, vy, "Plan view · one application near a listed home", "Scale 1 h = 5 px · timeline · hours from the earliest start");
    planBottom = vy + 13;
  }

  // ---- Plan view: who gets notice, 100 ft = 20 px ----
  s.comment("Plan view: notice radius");
  const rowTop = planBottom + 50;
  {
    const kf = 20 / 100;
    const r = D1 * kf;
    const cx = 60 + r, cy = rowTop + r + 10;
    s.path(`M${cx - r},${cy}A${r},${r} 0 1 0 ${cx + r},${cy}A${r},${r} 0 1 0 ${cx - r},${cy}Z`, "slot");
    s.line(cx, cy - r - 10, cx, cy + r + 10, "ctr");
    s.line(cx - r - 10, cy, cx + r + 10, cy, "ctr");

    // Site, and two listed properties: one line inside the radius, one outside.
    s.rect(cx - 12, cy - 8, 24, 16, "obj fill-1");
    s.callout(cx + 12, cy - 4, cx + 36, cy - 28, "site");
    const ax = cx + 0.45 * r, ay = cy - 0.95 * r; // its line crosses the circle
    s.rect(ax, ay, 66, 38, "obj fill-2");
    s.callout(ax + 66, ay + 19, ax + 88, ay + 19, "listed", { sub: "gets notice" });
    const bx = cx + 1.12 * r, by = cy + 0.4 * r;
    s.rect(bx, by, 38, 38, "obj fill-2");
    s.callout(bx + 38, by + 19, bx + 60, by + 19, "listed", { sub: "no notice" });

    // D1: the radius, measured below the centerline.
    const dy = cy + 34;
    s.dimH(cx - r, cx, dy, "D1", { from: [cy, cy + 8] });
    s.nb(cx - r / 2 + 18, dy - 7.5, 1);
    const vy = cy + r + 44;
    s.viewTitle(cx + 60, vy, "Plan view · who gets notice", "Scale 100 ft = 20 px");

    // ---- Variable table ----
    s.comment("Variable table");
    // Centered on the view's height; 7 rows of 15.
    const tb = s.table(460, (rowTop + vy + 13) / 2 - 52,"Variables · 7 Pa. Code 128.112", [
      ["L2", "longest lead", `${L2} h`],
      ["L1", "shortest lead", `${L1} h`],
      ["N1", "notice window", `L2 − L1 = ${N1} h`],
      ["A1", "start to finish, max", `${A1} h`],
      ["R1", "record notice, within", `${R1} h`],
      ["D1", "property line within", `${D1} ft`],
    ]);
    s.height = Math.ceil(Math.max(tb.y, vy + 13) + 30);
  }
  return s.toString();
}
