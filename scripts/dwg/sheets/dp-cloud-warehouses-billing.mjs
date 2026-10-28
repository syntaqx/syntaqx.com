// Two queries against one warehouse billed by running time, under two
// auto-suspend settings: the idle tail before suspend is the subject.
// Embedded in content/docs/data/cloud-warehouses.md.
import { sheet, widthOf } from "../kit.mjs";

// Illustrative workload, seconds.
const Q1 = 20; // first query
const T2 = 150; // second query arrives
const Q2 = 25; // second query
// Auto-suspend settings, seconds.
const A1 = 300; // 5 minutes, the low end Snowflake suggests
const A2 = 60;
const M1 = 60; // minimum billed per start
const SPAN = 480;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "dp-cwb", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The warehouse bills from start to suspend, whether or not a query is running."],
    [2, "With A1 the idle gap between the queries never reaches the suspend threshold, so it stays billed."],
    [3, "With A2 it suspends between queries and resumes on the next one. Each start bills at least M1, and drops the local cache."],
    [0, "Seconds. Workload illustrative. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 s = k px ----
  s.comment("Plan view: billed time under two auto-suspend settings");
  const k = 1.15, x0 = 170;
  const X = (t) => x0 + t * k;
  const axY = ny + 46;
  const h = 24;
  const laneX = x0 - 14;
  const ticks = [];
  for (let t = 0; t <= SPAN; t += 60) ticks.push([X(t), String(t)]);
  const tl = s.timeline({ x1: X(0), x2: X(SPAN), y: axY, ticks, laneX, h });

  // Queries.
  const y1 = axY + 26;
  tl.lane(y1, "queries");
  tl.bar(y1, X(0), X(Q1), "obj fill-1");
  tl.bar(y1, X(T2), X(T2 + Q2), "obj fill-1");
  s.chainH([X(0), X(Q1)], y1 + h + 18, ["Q1"], { from: [y1 + h, y1 + h], below: true });
  s.chainH([X(T2), X(T2 + Q2)], y1 + h + 18, ["Q2"], { from: [y1 + h, y1 + h], below: true });
  s.dimH(X(0), X(T2), y1 - 10, "T2", { from: [y1, y1] });

  // Suspend after A1: one long run.
  const y2 = y1 + h + 52;
  const endA = T2 + Q2 + A1;
  tl.lane(y2, `suspend after A1`);
  tl.bar(y2, X(0), X(endA), "obj fill-2", "running · billed");
  s.nb(X(0) + (X(endA) - X(0)) / 2 + widthOf("running · billed", "sl") / 2 + 12, y2 + h / 2, 2);
  s.chainH([X(T2 + Q2), X(endA)], y2 + h + 18, ["A1"], { from: [y2 + h, y2 + h], below: true });
  s.dimH(X(0), X(endA), y2 + h + 44, "B1", { from: [y2 + h, y2 + h], below: true, hl: true });

  // Suspend after A2: two short runs.
  const y3 = y2 + h + 82;
  const r1 = Q1 + A2, r2 = Q2 + A2;
  tl.lane(y3, `suspend after A2`);
  tl.bar(y3, X(0), X(r1), "obj fill-2", "billed");
  tl.bar(y3, X(r1), X(T2), "slot", "suspended");
  tl.bar(y3, X(T2), X(T2 + r2), "obj fill-2", "billed");
  s.nb(X(T2 + r2) + 14, y3 + h / 2, 3);
  s.chainH([X(0), X(r1)], y3 + h + 18, ["Q1+A2"], { from: [y3 + h, y3 + h], below: true });
  s.chainH([X(T2), X(T2 + r2)], y3 + h + 18, ["Q2+A2"], { from: [y3 + h, y3 + h], below: true });

  s.nb(X(0) + 12, axY - 22, 1);

  const vy = y3 + h + 62;
  s.viewTitle((laneX - widthOf("suspend after A2", "sl") + X(SPAN)) / 2, vy, "Plan view · one warehouse, two queries", `Scale 1 s = ${k} px · timeline`);

  // ---- Variable table ----
  s.comment("Variable table");
  const B1 = T2 + Q2 + A1, B2 = r1 + r2;
  const rows = [
    ["Q1, Q2", "query run times (illustrative)", `${Q1} s, ${Q2} s`],
    ["T2", "second query arrives", `${T2} s`],
    ["A1", "auto-suspend after idle, longer setting", `${A1} s`],
    ["A2", "auto-suspend after idle, shorter setting", `${A2} s`],
    ["M1", "minimum billed each time the warehouse starts", `${M1} s`],
    ["B1", "billed with A1: T2+Q2+A1", `${B1} s`],
    ["B2", "billed with A2: (Q1+A2)+(Q2+A2)", `${B2} s`],
  ];
  const widths = [70, 300, 90];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 52, "Variables · per-second billing", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
