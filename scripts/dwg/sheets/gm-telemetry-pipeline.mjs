// A telemetry event pipeline as a plan view: the hot path left to right, the
// cold path dropping from the bus, chain dimensions for each stage's latency,
// and volume and latency tables. Embedded in content/books/gaming/telemetry.md.
import { sheet, widthOf } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-tp", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative except L1. Measure each stage in production and alert on LH and LC."],
    [2, "A public analytics SDK batches recorded events and uploads them every 60 seconds."],
    [3, "The raw store keeps every accepted event, so a fixed model can rebuild history."],
    [0, "Not to scale. Latencies in s. The drawing carries codes; values and formulas are in the tables."],
  ], { width: 690 });

  s.comment("Plan view: event pipeline");
  const bw = 100, bh = 40, pitch = 130;
  const x0 = (W - (4 * pitch + bw)) / 2;
  const X = (i) => x0 + i * pitch;
  const ah = `url(#${s.id("ah")})`;
  const hy = ny + 82; // hot row top
  const hot = [["client", "batched"], ["collect", "validate, enrich"], ["bus", "partitioned log"], ["stream", "1-min windows"], ["live", "alerts, live ops"]];
  hot.forEach(([l, sub], i) => {
    s.rect(X(i), hy, bw, bh, i === 2 ? "obj fill-1" : "obj fill-2");
    s.label(X(i), hy, bw, bh, l);
    s.text(X(i) + bw / 2, hy + bh + 14, sub, "vs", "middle");
    if (i < 4) s.path(`M${X(i) + bw + 3},${hy + bh / 2}H${X(i + 1) - 3}`, "leader", { "marker-end": ah });
  });
  s.nb(X(0) + bw / 2 + 32, hy + bh + 11, 2);

  // Hot path latency: chain L1 to L4 and the highlighted total.
  const xs = [0, 1, 2, 3, 4].map(X);
  s.chainH(xs, hy - 18, ["L1", "L2", "L3", "L4"], { from: xs.map(() => hy) });
  s.dimH(X(0), X(4), hy - 44, "LH", { from: [hy - 18, hy - 18], hl: true });

  // E1: volume entering the collector.
  const ex = X(0) + bw + 15;
  s.callout(ex, hy + bh / 2, ex + 30, hy + bh + 44, "E1", { cls: "dt" });

  // Cold path from the bus.
  const cy = hy + bh + 74;
  const dx = X(2) + bw + 15;
  s.path(`M${X(2) + bw},${hy + bh - 8}H${dx}V${cy + bh / 2}H${X(3) - 3}`, "leader", { "marker-end": ah });
  [["raw", "hourly files"], ["marts", "scheduled models"]].forEach(([l, sub], j) => {
    const i = 3 + j;
    s.rect(X(i), cy, bw, bh, "obj fill-2");
    s.label(X(i), cy, bw, bh, l);
    s.text(X(i) + bw / 2, cy + bh + 14, sub, "vs", "middle");
  });
  s.path(`M${X(3) + bw + 3},${cy + bh / 2}H${X(4) - 3}`, "leader", { "marker-end": ah });
  s.text(dx - 10, cy + bh / 2 + 3, "cold path", "sl ink", "end");
  s.nb(dx - 10 - widthOf("cold path", "sl") - 12, cy + bh / 2 - 0.5, 3);

  // D1: raw volume, called out above the raw box.
  s.callout(X(3) + 70, cy, X(3) + bw + 12, cy - 22, "D1", { cls: "dt" });

  // Cold path latency: L5, L6 and the total LC from the client.
  const by = cy + bh + 36;
  s.chainH([X(3), X(4), X(4) + bw], by, ["L5", "L6"], { from: [cy + bh + 16, cy + bh + 16, cy + bh + 16], below: true });
  s.dimH(X(0), X(4) + bw, by + 30, "LC", { from: [hy + bh, cy + bh + 16], below: true });

  s.viewTitle(W / 2, by + 76, "Plan view · event pipeline", "Not to scale · hot path above, cold path below");
  const vb = by + 89;

  s.comment("Variable tables");
  const ty = vb + 44;
  const t1 = s.table(40, ty, "Volume", [
    ["V1", "concurrent players", "100,000"],
    ["R1", "events per player per s", "0.1"],
    ["E1", "events per s", "V1 × R1 = 10,000"],
    ["B1", "mean event size, bytes", "500"],
    ["D1", "raw per day", "E1 × B1 × 86,400 = 432 GB"],
  ]);
  const t2 = s.table(392, ty, "Latency · s", [
    ["L1", "client batch interval", "60"],
    ["L2", "collector accept, validate", "1"],
    ["L3", "bus to stream job", "5"],
    ["L4", "stream window", "60"],
    ["L5", "raw file commit", "3,600"],
    ["L6", "warehouse model run", "3,600"],
    ["LH", "hot path", "L1+L2+L3+L4 = 126"],
    ["LC", "cold path", "L1+L2+L5+L6 = 7,261"],
  ]);
  s.height = Math.ceil(Math.max(t1.y, t2.y) + 30);
  return s.toString();
}
