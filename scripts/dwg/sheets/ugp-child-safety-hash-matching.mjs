// Hash matching on the upload path as a standard pipeline: exact hashes,
// then perceptual hashes, then a classifier, before an asset is visible;
// each kind of hit drops to its own handling (no-view action, a minimal
// confirming view, the specialist queue) and all meet at the confirmed
// case in the accent. Concepts only, nothing about how matching works.
// Embedded in content/books/user-generated-platforms/child-safety.md
// (Hash Matching).
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-ch", width: W });

  const n = 5, w = 108, h = 44;
  const gap = (W - 40 - n * w) / (n - 1);
  const X = (i) => 20 + i * (w + gap);
  const r1 = 36, r2 = 136, r3 = 252;

  s.comment("The upload path, before anything is visible");
  const top = [
    s.node(X(0), r1, w, h, "upload", { kind: "state", sub: "scanning" }),
    s.node(X(1), r1, w, h, "exact hash", { sub: "exact lists" }),
    s.node(X(2), r1, w, h, "perceptual", { sub: "within threshold" }),
    s.node(X(3), r1, w, h, "classifier", { sub: "returns a score" }),
    s.node(X(4), r1, w, h, "ready", { kind: "state", end: true, sub: "visible" }),
  ];
  top.slice(1).forEach((b, i) => s.connect(top[i], b, i ? { label: "no hit", side: "above" } : {}));

  s.comment("Each kind of hit");
  const mid = [
    s.node(X(1), r2, w, 60, "act unviewed", { sub: ["remove,", "quarantine,", "restrict account"] }),
    s.node(X(2), r2, w, 60, "minimal view", { sub: ["a person confirms", "the near match"] }),
    s.node(X(3), r2, w, 60, "specialist", { kind: "store", sub: ["queue, ordered", "by score"] }),
  ];
  const drops = [["vetted list", "right"], ["near match", "right"], ["hit", "right"]];
  mid.forEach((m, i) => s.connect(top[i + 1], m, { from: "b", to: "t", label: drops[i][0], side: drops[i][1] }));

  s.comment("Everything meets at the confirmed case");
  const cx0 = X(1), cw = X(3) + w - X(1);
  const caseNode = s.node(cx0, r3, cw, 54, "confirmed case: report filed", {
    hl: true, sub: ["list, version, algorithm and distance on every match;", "whether anyone viewed each file"],
  });
  mid.forEach((m, i) => s.connect(m, caseNode, { from: "b", to: "t", at: [0.5, (m.cx - cx0) / cw], hl: true, ...(i === 2 ? { label: "a person confirms", side: "right" } : {}) }));

  s.comment("Footnote");
  const fy = caseNode.y2 + 24;
  s.text(W / 2, fy, "a classifier hit is never reported without a person's confirmation", "sl", "middle");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
