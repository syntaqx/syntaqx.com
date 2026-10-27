// Live latency tiers as bars on a seconds axis: the published upper bound
// (or typical range) of glass-to-glass latency for each delivery tier, from
// real-time WebRTC to standard HLS. A standard bars diagram: the values are
// the point, so they sit on the bars. Embedded in
// content/books/user-generated-platforms/live-latency-and-vods.md.
import { sheet } from "../kit.mjs";

// [tier, seconds (upper bound), value label, accent]
const TIERS = [
  ["real time (WebRTC)", 0.3, "under 0.3 s", true],
  ["low-latency HLS", 5, "under 5 s"],
  ["tuned HLS, low", 10, "under 10 s"],
  ["tuned HLS, reduced", 20, "about 12 to 20 s"],
  ["standard HLS", 30, "about 25 to 30 s"],
];

export default function draw() {
  const W = 760, x = 20;
  const s = sheet({ prefix: "ugp-lat", width: W });

  s.comment("Bars on a seconds axis, ticks only");
  const { bottom } = s.bars(x, 40, TIERS.map(([label, value, text, hl]) => ({ label, value, text, hl })), {
    ax: 200, k: 13, ticks: [0, 5, 10, 15, 20, 25, 30], tick: (v) => (v ? `${v} s` : "0"), head: "delivery tier",
  });

  s.comment("Footnote");
  const fy = bottom + 24;
  s.text(x, fy, "glass to glass, most viewers; upper bounds from vendor and platform documentation", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
