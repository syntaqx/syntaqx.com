// The media asset's states around the scanning gate (the accent), with the
// two exits to rejected and quarantined, and under it the checks the gate
// runs in order of cost, each marked blocking or not as the chapter states.
// Embedded in content/books/user-generated-platforms/upload-path.md.
import { sheet } from "../kit.mjs";

const CHECKS = [
  { label: "validation", sub: ["type, limits,", "sandboxed decode"] },
  { label: "exact hash", sub: ["own rejected", "and removed files"] },
  { label: "perceptual\nhash", sub: ["industry lists,", "blocking"] },
  { label: "malware", sub: ["files that are", "only files"] },
  { label: "copyright\nfingerprint", sub: ["blocking or not,", "by policy"] },
  { label: "classifiers", sub: ["often", "non-blocking"] },
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-upg", width: W });

  s.comment("States: four across, exits below");
  const w = 120, h = 30, gap = (W - 40 - 4 * w) / 3;
  const X = (i) => 20 + i * (w + gap);
  const r1 = 24, r2 = 100;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });
  const uploading = st(0, r1, "uploading");
  const scanning = st(1, r1, "scanning", { hl: true });
  const processing = st(2, r1, "processing");
  const ready = st(3, r1, "ready", { end: true });
  const rejected = st(0, r2, "rejected", { end: true, fill: 1 });
  const quarantined = st(2, r2, "quarantined", { end: true, fill: 1 });

  s.connect(uploading, scanning, { label: "bytes\ncomplete", side: "above" });
  s.connect(scanning, processing, { label: "blocking\nscans pass", side: "above" });
  s.connect(processing, ready, { label: "variants\nmade", side: "above" });
  s.connect(uploading, rejected, { from: "b", to: "t", alt: true, label: "session expires", side: "right" });
  s.connect(scanning, rejected, { from: "b", to: "r", at: [0.3, 0.5], alt: true, label: "validation fails", side: "below" });
  s.connect(scanning, quarantined, { from: "b", to: "l", at: [0.7, 0.5], alt: true, label: "list match or hold", side: "below" });
  s.note(quarantined, "a case opens, evidence held", { anchor: "center" });

  s.comment("The checks at the gate");
  const ty = r2 + h + 58;
  s.text(20, ty, "at the gate, in order of cost", "lt");
  const cw = (W - 40 - 5 * 16) / 6;
  const { bottom } = s.pipeline(20, ty + 22, CHECKS, { w: cw, h: 36, gap: 16 });

  const lg = s.legend(20, bottom + 26, [
    { kind: "state", label: "the gate", hl: true },
    { kind: "alt", label: "exit" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
