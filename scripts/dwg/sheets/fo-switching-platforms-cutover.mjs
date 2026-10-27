// Cutover for one cohort as a standard pipeline: four phases, the canary
// cutover in the accent, the reload and rollback loops dashed above, and
// what the legacy system does meanwhile in a band below. Embedded in
// content/books/field-operations/switching-platforms.md.
import { sheet } from "../kit.mjs";

const PHASES = [
  { label: "transitional load", sub: ["export archived", "crosswalk, no sends"] },
  { label: "dark launch", sub: ["computed, not sent", "compared to legacy"] },
  { label: "canary cutover", sub: ["new system bills", "legacy stops billing"], hl: true },
  { label: "retire", sub: ["last cohort moved", "legacy read-only"] },
];

export default function draw() {
  const W = 760, pad = 12, w = 150, h = 28;
  const gx = 20, gw = W - 40, ix = gx + pad, iw = gw - 2 * pad;
  const gap = (iw - PHASES.length * w) / (PHASES.length - 1);
  const s = sheet({ prefix: "fo-spc", width: W });

  s.comment("One cohort");
  const g1 = 34, loopY = g1 + pad + 2 * 11 + 12, py = loopY + 22;
  const { nodes, bottom } = s.pipeline(ix, py, PHASES, { w, h, gap });
  const [load, dark, canary] = nodes;
  const g1h = bottom + pad - g1;
  s.group(gx, g1, gw, g1h, "one cohort", { sub: "a branch, a route group or a billing day" });

  s.comment("Back: a break found, and the rollback window");
  s.connect(dark, load, { from: "t", to: "t", at: [0.3, 0.7], via: loopY, alt: true, seg: 1, label: "break: fix\nmapping, reload" });
  s.connect(canary, dark, { from: "t", to: "t", at: [0.3, 0.7], via: loopY, alt: true, seg: 1, label: "rollback\nwindow" });

  s.comment("Legacy system");
  const g2 = g1 + g1h + 34, bh = 28;
  s.group(gx, g2, gw, bh + 2 * pad, "legacy system");
  s.node(load.x, g2 + pad, dark.x + w - load.x, bh, "still bills and schedules the cohort");
  s.node(canary.x, g2 + pad, nodes[3].x + w - canary.x, bh, "read-only archive, kept", { kind: "ghost" });

  s.comment("Legend");
  const lg = s.legend(gx, g2 + bh + 2 * pad + 26, [
    { kind: "node", hl: true, label: "where billing moves" },
    { kind: "alt", label: "back to an earlier phase" },
    { kind: "ghost", label: "kept, no longer used" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
