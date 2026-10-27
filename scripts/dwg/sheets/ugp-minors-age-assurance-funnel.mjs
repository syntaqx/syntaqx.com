// Age assurance on a general-audience platform as a standard diagram: the
// layered methods as a pipeline from a gated feature to a document check,
// and one platform's published funnel for March 2026 as bars (prompted,
// completed in the accent, passed). Embedded in
// content/books/user-generated-platforms/minors-and-age-assurance.md (Age
// Assurance on a General-Audience Platform).
import { sheet } from "../kit.mjs";

// One platform's published figures, March 2026.
const FUNNEL = [
  ["prompted", 1460513],
  ["completed", 426953, true],
  ["passed", 417869],
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-ma", width: W });

  s.comment("The layers");
  const w = 120, gap = (W - 40 - 5 * w) / 4;
  const { nodes, bottom } = s.pipeline(20, 30, [
    { label: "gated feature", sub: ["unblur, restricted", "spaces, strangers'", "messages, going live"] },
    { label: "inference", sub: ["places most adults", "without a prompt"] },
    { label: "prompt", sub: ["the rest are", "asked to verify"] },
    { label: "estimation", sub: ["the vendor returns", "a result, not", "the image"] },
    { label: "document", sub: ["near the line,", "and on appeal"] },
  ], { w, gap, h: 30 });
  void nodes;

  s.comment("The funnel");
  const by = bottom + 52;
  const fmt = (v) => v.toLocaleString("en-US");
  const { bottom: bb } = s.bars(20, by, FUNNEL.map(([label, v, hl]) => ({ label, value: v / 1000, text: fmt(v), hl })), {
    ax: 150, k: 0.32, ticks: [0, 500, 1000, 1500], tick: (v) => (v ? `${v / 1000} m` : "0"), head: "march 2026",
  });

  s.comment("Footnote");
  const fy = bb + 30;
  s.text(20, fy, "users, as one platform published them; most people prompted don't complete,", "sl");
  s.text(20, fy + 16, "and stay out of the gated feature", "sl");
  s.height = Math.ceil(fy + 34);
  return s.toString();
}
