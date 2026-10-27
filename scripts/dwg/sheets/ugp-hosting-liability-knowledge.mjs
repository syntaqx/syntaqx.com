// Knowledge as the trigger, as a standard fan-out: one knowledge event,
// timestamped at arrival (the accent), fans out to six regimes, each with
// what counts as knowledge and what it then obliges; the US publisher
// immunity is the dashed exception that knowledge doesn't change.
// Embedded in content/books/user-generated-platforms/hosting-liability.md
// (Knowledge Is the Trigger).
import { sheet } from "../kit.mjs";

// [regime, what counts as knowledge, obligation, deadline, exception]
const ROWS = [
  ["publisher immunity, US", "notice changes nothing", "nothing under it", "duties come from its exceptions", true],
  ["copyright safe harbor, US", "valid notice or red-flag awareness", "remove or disable", "expeditiously, no fixed hours"],
  ["hosting exemption, EU", "a notice a diligent host can judge", "remove or disable", "expeditiously"],
  ["child-safety reporting, US", "actual knowledge, apparent violation", "report, then preserve", "as soon as reasonably possible"],
  ["intimate image removal, US", "a valid removal request", "remove, sweep identical copies", "within 48 hours"],
  ["terrorist content, EU", "a removal order from an authority", "remove in all member states", "within one hour"],
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-hk", width: W });

  const top = 44, rh = 40, gap = 10;
  const xr = 214, wr = 236, xo = 490, wo = W - 20 - 490;
  const Y = (i) => top + i * (rh + gap);
  const total = ROWS.length * (rh + gap) - gap;

  s.comment("Column heads");
  s.text(xr, top - 14, "regime: what counts as knowledge", "th");
  s.text(xo, top - 14, "what knowledge obliges", "th");

  s.comment("The knowledge event");
  const src = s.node(20, top + total / 2 - 50, 150, 100, "knowledge", {
    hl: true, sub: ["timestamped at the", "earliest provable", "arrival: a notice,", "an order or the", "platform's own finding"],
  });

  s.comment("Regimes and obligations");
  const regimes = ROWS.map(([r, k, , , ex], i) => s.node(xr, Y(i), wr, rh, r, { sub: k, kind: ex ? "ghost" : "process" }));
  const outs = ROWS.map(([, , o, d, ex], i) => s.node(xo, Y(i), wo, rh, o, { sub: d, kind: ex ? "ghost" : "process" }));
  s.fanOut(src, regimes, { via: (src.x2 + xr) / 2 });
  regimes.forEach((r, i) => s.connect(r, outs[i], { alt: !!ROWS[i][4] }));

  s.comment("Footnote");
  const fy = Y(ROWS.length - 1) + rh + 26;
  s.text(xr, fy, "no regime here requires scanning; knowledge is per item", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
