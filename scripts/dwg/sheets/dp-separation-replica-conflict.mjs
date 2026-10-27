// A hot standby during a long analytical query: the conflict, the replay
// delay, the cancellation and the lag it causes, on one timeline. Embedded in
// content/docs/data/separating-production-and-analytics.md.
import { sheet, widthOf } from "../kit.mjs";

// Seconds. D1 is PostgreSQL's default; Q1 and C1 are illustrative [2].
const Q1 = 300, C1 = 60, D1 = 30;
const X1 = C1 + D1; // 90
const R1 = Q1 - X1; // 210
const L1 = D1; // 30
const CATCH = 10; // drawn catch-up after the cancel; schematic

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "dp-rc", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Vacuum on the primary removed row versions the query's snapshot can still see."],
    [2, "D1 is PostgreSQL's default max_standby_streaming_delay; Q1 and C1 are illustrative."],
    [3, "A larger D1 lags the whole replica longer; hot_standby_feedback trades it for primary bloat."],
    [0, "Values in seconds; lag height is schematic. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 s = 2 px ----
  s.comment("Plan view: hot standby during a long query");
  const k = 2;
  const x0 = CX - (Q1 * k) / 2 + 20;
  const X = (t) => x0 + t * k;
  const h = 30;
  const qDim = ny + 36;
  const qTop = qDim + 22;
  const rTop = qTop + h + 34;
  const rBot = rTop + h;
  const c1Y = rBot + 22, x1Y = c1Y + 30;
  const lagH = 44, lagBase = x1Y + 30 + lagH;

  s.dimH(X(0), X(Q1), qDim, "Q1", { from: [qTop, qTop] });

  // Lane: the analytical query.
  s.text(X(0) - 10, qTop + h / 2 + 3, "query", "sl ink", "end");
  s.rect(X(0), qTop, X1 * k, h, "obj fill-1");
  s.rect(X(X1), qTop, R1 * k, h, "slot");
  s.label(X(0), qTop, X1 * k, h, "runs");
  s.label(X(X1), qTop, R1 * k, h, "cancelled at X1", "sl");

  // Lane: WAL replay on the standby; the wait in hatch.
  s.text(X(0) - 10, rTop + h / 2 + 3, "replay", "sl ink", "end");
  s.rect(X(0), rTop, C1 * k, h, "obj fill-2");
  s.rect(X(C1), rTop, D1 * k, h, "hatch", { fill: s.hatch });
  s.rect(X(X1), rTop, R1 * k, h, "obj fill-2");
  s.label(X(0), rTop, C1 * k, h, "applying");
  s.label(X(X1), rTop, R1 * k, h, "catches up");
  const cx = X(C1) + 14, cy = rTop - 16;
  s.callout(X(C1), rTop, cx, cy, "conflict arrives");
  s.nb(cx + 20 + widthOf("conflict arrives", "sl"), cy, 1);

  // Chains: C1 and D1 (the subject), then X1 and R1.
  s.chainH([X(0), X(C1), X(X1)], c1Y, ["C1", "D1"], { from: [rBot, rBot, rBot], hl: [1] });
  s.nb(X(X1) + 14, c1Y - 7.5, 2);
  s.chainH([X(0), X(X1), X(Q1)], x1Y, ["X1", "R1"], { from: [c1Y, c1Y, rBot] });

  // Lane: replica lag for every other reader.
  s.text(X(0) - 10, lagBase - lagH / 2 + 3, "lag", "sl ink", "end");
  s.line(X(0), lagBase, X(Q1), lagBase, "ext");
  s.path(`M${X(C1)},${lagBase}L${X(X1)},${lagBase - lagH}L${X(X1 + CATCH)},${lagBase}Z`, "obj fill-2");
  const lx = X(X1 + CATCH) + 22;
  s.dimV(lagBase - lagH, lagBase, lx, "L1", { from: [X(X1), null], side: "r" });
  s.nb(lx + 34, lagBase - lagH / 2, 3);

  s.viewTitle(CX, lagBase + 46, "Plan view · hot standby during a long query", "Scale 1 s = 2 px · timeline · seconds");
  const viewBottom = lagBase + 46 + 13;

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["Q1", "run time the analytical query needs", String(Q1)],
    ["C1", "when a conflicting cleanup record arrives", String(C1)],
    ["D1", "max_standby_streaming_delay, the default", String(D1)],
    ["X1", "query cancelled", `C1 + D1 = ${X1}`],
    ["R1", "work left undone", `Q1 − X1 = ${R1}`],
    ["L1", "peak replica lag for every other reader", `D1 = ${L1}`],
  ];
  const ws = [40, 250, 120];
  const tx = CX - ws.reduce((a, b) => a + b, 0) / 2;
  const tb = s.table(tx, viewBottom + 52, "Variables · seconds", rows, { widths: ws });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
