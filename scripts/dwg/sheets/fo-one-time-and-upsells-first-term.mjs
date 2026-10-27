// One customer's first term: a one-time visit converts to a plan, an add-on
// joins by amendment. Plan view on a day axis, the offer to activation in
// detail, and the variable tables. Embedded in
// content/books/field-operations/one-time-services-and-upsells.md.
import { sheet, widthOf } from "../kit.mjs";

// Illustrative values [1]; days count from the one-time visit, D0.
const E0 = 7, W1 = 3; // offer to signature, cooling-off
const ACTIVE = E0 + W1; // D10
const V1 = 80, Q1 = 90, E1 = 15;
const T1 = V1 + 3 * Q1 + E1; // 365
const END = ACTIVE + T1; // D375
const ADDON = 150;
const A1 = END - ADDON; // 225
const VISITS = [1, 2, 3, 4].map((i) => ACTIVE + V1 + (i - 1) * Q1); // D90 .. D360
const O1 = 189, P0 = 249, C1 = O1, I1 = P0 - C1, S1 = 129, A0 = 360;
const A2 = (A0 * A1) / 365;
const Y1 = O1 + I1 + 4 * S1 + A2;
const usd = (n) => n.toFixed(2);

// Column widths the kit's table would pick, to center two tables side by side.
const tableWidth = (rows) =>
  [0, 1, 2].reduce((w, j) => w + Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(["CODE", "VARIABLE", "VALUE"][j], "th")) + 14)), 0);

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-otu", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative values, not benchmarks or any vendor's defaults. Days count from the one-time visit, D0."],
    [2, "The one-time visit counts as the plan's initial service, so its price is credited against the initial charge."],
    [3, "An amendment: terms version 2, effective D150, prorated by day and generating its own occurrences."],
    [4, "Signed is not active: no recurring charge until the window closes; the deadline is computed at signing."],
    [0, "Values in days and USD. Codes on the drawing, values and formulas in the tables."],
  ], { width: 690 });

  // ---- Plan view: the first term, 1 day = 1.5 px ----
  s.comment("Plan view: first term");
  const k = 1.5;
  const x0 = CX - (END * k) / 2 + 20; // room for the lane labels on the left
  const X = (d) => x0 + d * k;
  const h = 22, vw = 6;
  const oneY = ny + 36;
  const chainY = oneY + h + 36;
  const planY = chainY + 22;
  const addY = planY + h + 14;
  const lane = (y, t) => s.text(x0 - 16, y + h / 2 + 3, t, "sl ink", "end");
  lane(oneY, "one-time");
  lane(planY, "plan");
  lane(addY, "add-on");

  // One-time lane: the visit at D0.
  s.rect(X(0), oneY, vw, h, "obj fill-1");
  s.callout(X(0) + vw / 2, oneY + h / 2, X(0) + 40, oneY + h / 2, "O1", { cls: "dt" });
  s.text(X(0) + 54 + widthOf("O1", "dt") + 6, oneY + h / 2 + 3, "one-time visit", "sl ink");
  s.nb(X(0) + 54 + widthOf("O1", "dt") + 12 + widthOf("one-time visit", "sl"), oneY + h / 2, 2);

  // Plan lane: active D10 to D375 with the four recurring visits.
  s.rect(X(ACTIVE), planY, T1 * k, h, "obj fill-2");
  VISITS.forEach((d) => s.rect(X(d) - vw / 2, planY, vw, h, "obj fill-1"));
  s.label(X(ACTIVE), planY, V1 * k, h, "plan v1");
  const xs = [X(ACTIVE), ...VISITS.map(X), X(END)];
  s.chainH(xs, chainY, ["V1", "Q1", "Q1", "Q1", "E1"], { from: xs.map(() => planY) });

  // Add-on lane: the amendment from D150.
  s.rect(X(ADDON), addY, A1 * k, h, "obj hl");
  s.label(X(ADDON), addY, A1 * k, h, "add-on, terms v2");
  s.nb(X(ADDON) + (A1 * k) / 2 + widthOf("add-on, terms v2", "sl") / 2 + 12, addY + h / 2, 3);

  const aY = addY + h + 18;
  s.dimH(X(ADDON), X(END), aY, "A1", { from: [addY + h, addY + h], below: true, hl: true });
  const tY = aY + 32;
  s.dimH(X(ACTIVE), X(END), tY, "T1", { from: [planY + h, null], below: true });
  s.line(X(END), aY + 4, X(END), tY + 4, "ext");

  s.detailRef(X(ACTIVE / 2), planY + h / 2, 16, "detail A", x0 - 30, chainY);
  const planTitle = tY + 46;
  s.viewTitle(CX, planTitle, "Plan view · one customer's first term", "Scale 1 day = 1.5 px · timeline · days from D0");
  s.nb(CX + 150, planTitle - 4, 1);

  // ---- Detail A: offer to active, 1 day = 30 px ----
  s.comment("Detail A: offer to active");
  const kd = 30, span = 16;
  const dx0 = CX - (span * kd) / 2;
  const D = (d) => dx0 + d * kd;
  const dTop = planTitle + 13 + 66, dh = 26;
  s.rect(D(0), dTop, kd / 2, dh, "obj fill-1");
  s.line(D(0.5), dTop + dh / 2, D(E0), dTop + dh / 2, "phantom");
  s.add(`<circle class="dot" cx="${D(E0)}" cy="${dTop + dh / 2}" r="2.2"/>`);
  s.rect(D(E0), dTop, W1 * kd, dh, "hatch", { fill: s.hatch });
  s.rect(D(ACTIVE), dTop, (span - ACTIVE) * kd, dh, "obj fill-2");
  s.label(D(ACTIVE), dTop, (span - ACTIVE) * kd, dh, "active");
  const ly = dTop - 10;
  s.text(D(0.25), ly, "visit", "sl ink", "middle");
  s.text((D(0.5) + D(E0)) / 2, ly, "offer open", "sl", "middle");
  s.text(D(E0 - 0.6), dTop + dh / 2 - 8, "signed", "sl ink", "end");
  s.text(D(E0 + W1 / 2), ly, "cooling-off", "sl ink", "middle");
  s.nb(D(E0 + W1 / 2) + widthOf("cooling-off", "sl") / 2 + 12, ly - 3, 4);
  s.chainH([D(0), D(E0), D(ACTIVE)], dTop + dh + 20, ["E0", "W1"], { from: [dTop + dh, dTop + dh, dTop + dh], below: true });
  s.callout(D(ACTIVE), dTop + dh, D(ACTIVE) + 40, dTop + dh + 22, "I1 posts", { dir: 1 });
  const detailTitle = dTop + dh + 64;
  s.viewTitle(CX, detailTitle, "Detail A · offer to active", "Scale 1 day = 30 px · D0 to D16");

  // ---- Variable tables ----
  s.comment("Variable tables");
  const days = [
    ["T1", "plan term", `V1+3×Q1+E1 = ${T1}`],
    ["V1", "active to first recurring", String(V1)],
    ["Q1", "recurring interval", String(Q1)],
    ["E1", "last visit to term end", String(E1)],
    ["A1", "add-on days left in term", `${END} − ${ADDON} = ${A1}`],
    ["E0", "offer to signature", String(E0)],
    ["W1", "cooling-off window", String(W1)],
  ];
  const money = [
    ["O1", "one-time price paid", usd(O1)],
    ["P0", "plan initial price", usd(P0)],
    ["C1", "credit for O1", usd(C1)],
    ["I1", "initial due, at D10", `P0 − C1 = ${usd(I1)}`],
    ["S1", "price per recurring visit", usd(S1)],
    ["A0", "add-on price, full term", usd(A0)],
    ["A2", "prorated add-on", `A0×A1÷365 = ${usd(A2)}`],
    ["Y1", "first-term revenue", `O1+I1+4×S1+A2 = ${usd(Y1)}`],
  ];
  const gap = 32;
  const w1 = tableWidth(days), w2 = tableWidth(money);
  const tx = CX - (w1 + gap + w2) / 2;
  const tTop = detailTitle + 13 + 56;
  const t1 = s.table(tx, tTop, "Variables · days", days);
  const t2 = s.table(tx + w1 + gap, tTop, "Variables · USD", money);
  s.height = Math.ceil(Math.max(t1.y, t2.y) + 30);
  return s.toString();
}
