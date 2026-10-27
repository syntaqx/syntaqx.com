// One erasure request on a timeline in days: purge, then the warehouse's
// undelete windows, inside the response deadline. Embedded in
// content/docs/data/data-governance.md.
import { sheet, widthOf } from "../kit.mjs";

// Days. P1 illustrative; T1 and T2 BigQuery defaults [1]; M1 drawn as 30 days.
const P1 = 2, T1 = 7, T2 = 7, M1 = 30;
const E1 = P1 + T1 + T2; // 16

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "dp-dg", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "P1 is illustrative: a nightly purge plus a rebuild. T1 and T2 are BigQuery's documented defaults; Delta Lake keeps deleted files until VACUUM, which keeps 7 days by default."],
    [2, "Within the warehouse. Backups, exports, streams and vendors have their own clocks."],
    [3, "GDPR Article 12(3): within one month of receipt, extendable by two further months for complex or numerous requests, if the person is told why within the first month."],
    [0, "Values in days; M1 is drawn as 30 days. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 day = 18 px ----
  s.comment("Plan view: one erasure request");
  const k = 18;
  const x0 = CX - (M1 * k) / 2;
  const X = (d) => x0 + d * k;
  const mY = ny + 36, eY = mY + 24;
  const top = eY + 22, h = 36, bot = top + h;

  // Deadline and the time until no copy is recoverable (the subject).
  s.dimH(X(0), X(M1), mY, "M1", { from: [top, top] });
  s.nb(X(M1 / 2) + 20, mY - 7.5, 3);
  s.dimH(X(0), X(E1), eY, "E1", { from: [null, top], hl: true });

  // The bar: purge, time travel, fail-safe.
  s.rect(X(0), top, P1 * k, h, "obj fill-1");
  s.rect(X(P1), top, T1 * k, h, "obj fill-2");
  s.rect(X(P1 + T1), top, T2 * k, h, "hatch", { fill: s.hatch });
  s.label(X(P1), top, T1 * k, h, "time travel");
  s.text(X(P1 + T1 + T2 / 2), top + h / 2 + 3, "fail-safe", "sl ink ko", "middle");
  const nx = X(E1) + 16;
  s.text(nx, top + h / 2 + 3, "no copy recoverable", "sl ink");
  s.nb(nx + widthOf("no copy recoverable", "sl") + 10, top + h / 2, 2);

  // Chain: purge, time travel, fail-safe.
  const cY = bot + 22;
  s.chainH([X(0), X(P1), X(P1 + T1), X(E1)], cY, ["P1", "T1", "T2"], { from: [bot, bot, bot, bot], below: true });
  s.nb(X(0) - 16, cY, 1);

  // Axis: days after the request.
  const aY = cY + 38;
  s.line(X(0), aY, X(M1), aY, "obj");
  for (let d = 0; d <= M1; d += 5) {
    s.line(X(d), aY - 4, X(d), aY + 4, "obj");
    s.text(X(d), aY + 16, String(d), "tc", "middle");
  }
  s.callout(X(0), aY, X(0) + 22, aY + 36, "request received");

  s.viewTitle(CX, aY + 76, "Plan view · one erasure request", "Scale 1 day = 18 px · timeline · days after the request");
  const viewBottom = aY + 76 + 13;

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["P1", "purge runs: source, raw, staging, marts, snapshots", String(P1)],
    ["T1", "time travel window, default (2 to 7)", String(T1)],
    ["T2", "fail-safe, not configurable", String(T2)],
    ["E1", "until no warehouse copy is recoverable", `P1+T1+T2 = ${E1}`],
    ["M1", "GDPR response deadline, drawn as 30 days", "1 month"],
  ];
  const ws = [40, 290, 120];
  const tx = CX - ws.reduce((a, b) => a + b, 0) / 2;
  const tb = s.table(tx, viewBottom + 52, "Variables · days", rows, { widths: ws });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
