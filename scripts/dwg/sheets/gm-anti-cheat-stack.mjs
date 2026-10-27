// Anti-cheat defense in depth as an exploded axonometric stack, bracketed by
// where each layer runs. Plate contents are schematic modules, one per item
// in the layer's sub-line. Embedded in content/books/gaming/anti-cheat.md.
import { sheet, widthOf } from "../kit.mjs";

// Plate 300 x 200; with a 62 step, a lower plate shows only local y > ~84,
// so every module sits in the front band y 92..186.
const W = 300, D = 200;

const layers = [
  {
    label: "01 · kernel driver",
    sub: "boot-time load · memory and driver checks",
    draw: (p) => [
      // Boot-time load: a load order with the driver first.
      p.rect(16, 96, 80, 84, "obj fill-2"),
      ...[108, 126, 144, 162].map((y, i) => p.rect(26, y, 60, 12, i === 0 ? "obj fill-1" : "slot")),
      // Memory checks: pages being scanned.
      p.rect(110, 96, 80, 84, "obj fill-2"),
      ...[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => p.rect(120 + c * 22, 106 + r * 24, 18, 20, "obj fill-1"))),
      // Driver checks: a list of loaded drivers with checkmarks.
      p.rect(204, 96, 80, 84, "obj fill-2"),
      ...[110, 130, 150, 170].flatMap((y) => [p.line(214, y, 256, y, "obj"), p.circle(268, y, 4, "dot")]),
    ],
  },
  {
    label: "02 · client integrity",
    sub: "encrypted code · anti-debug · scans",
    draw: (p) => [
      // Encrypted code: sealed blocks.
      p.rect(16, 96, 82, 84, "obj fill-2"),
      ...[106, 130, 154].map((y) => p.rect(26, y, 62, 18, "obj fill-1")),
      ...[106, 130, 154].map((y) => p.line(26, y, 88, y + 18, "ext")),
      // Anti-debug: the process with a guarded entry.
      p.rect(110, 96, 80, 84, "obj fill-2"),
      p.circle(150, 138, 22, "slot"), p.circle(150, 138, 8, "obj fill-1"),
      // Scans: a sweep line across the process image.
      p.rect(202, 96, 82, 84, "obj fill-2"),
      ...[108, 122, 136, 150, 164].map((y) => p.line(212, y, 274, y, "ext")),
      p.line(212, 140, 274, 140, "ctr"),
    ],
  },
  {
    label: "03 · network",
    sub: "encrypted · obfuscated · rate-limited",
    draw: (p) => [
      // Encrypted packets on the wire.
      p.line(16, 110, 284, 110, "ctr"),
      ...[24, 72, 120].map((x) => p.rect(x, 102, 36, 16, "obj fill-1")),
      // Obfuscated: shuffled field layout.
      ...[0, 1, 2, 3, 4].map((i) => p.rect(176 + i * 21, 102, 17, 16, i % 2 ? "obj fill-2" : "obj fill-1")),
      // Rate-limited: a token bucket with a cap.
      p.rect(16, 132, 268, 50, "obj fill-2"),
      ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => p.rect(28 + i * 25, 162 - (i < 6 ? 18 : 6), 14, i < 6 ? 18 : 6, "obj fill-1")),
      p.line(22, 140, 278, 140, "ctr"),
    ],
  },
  {
    label: "04 · server authority",
    sub: "inputs validated · hidden state withheld",
    draw: (p) => [
      p.rect(0, 0, W, D, "obj hl"),
      // Inputs validated: inputs passing a gate.
      p.rect(16, 96, 126, 84, "obj fill-2"),
      ...[112, 138, 164].flatMap((y) => [p.line(26, y, 74, y, "obj"), p.rect(78, y - 7, 14, 14, "obj"), p.line(96, y, 130, y, "obj")]),
      // Hidden state withheld: the world, with only part sent.
      p.rect(158, 96, 126, 84, "obj fill-2"),
      p.rect(168, 106, 50, 64, "obj fill-1"),
      p.rect(226, 106, 48, 64, "slot"),
    ],
  },
  {
    label: "05 · detection backend",
    sub: "signals · models · review · enforcement",
    draw: (p) => [
      // Signals: incoming event streams.
      p.rect(16, 96, 58, 84, "obj fill-2"),
      ...[110, 128, 146, 164].map((y, i) => p.line(24, y, 66 - i * 6, y, "obj")),
      // Models: a scoring graph.
      p.rect(84, 96, 62, 84, "obj fill-2"),
      p.path("M92,166L104,150L116,156L128,124L138,112", "obj"),
      // Review: a queue of cases.
      p.rect(156, 96, 58, 84, "obj fill-2"),
      ...[106, 126, 146].map((y) => p.rect(164, y, 42, 14, "obj fill-1")),
      // Enforcement: a ban list.
      p.rect(224, 96, 60, 84, "obj fill-2"),
      ...[110, 130, 150].flatMap((y) => [p.circle(236, y, 4, "dot"), p.line(246, y, 274, y, "obj")]),
    ],
  },
];

export default function draw() {
  const s = sheet({ prefix: "gm-ach", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Highlighted: the only layer a cheat can't patch, because it runs on hardware the operator controls."],
    [2, "Valve's Proton guidance: kernel-space anti-cheat is not supported or recommended; user-space components work best on Linux and Steam Deck."],
    [0, "Not to scale. Layers separated along the stack axis; plate contents are schematic."],
  ], { width: 690 });

  const gap = 62, top = (layers.length - 1) * gap;
  const tx = 372, ty = ny + 30 + top, labelX = 262;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap, labelX, layers });

  // Note numbers beside the labels of layers 04 and 01.
  const tag = (i, n) => {
    const [, ay] = P(0, D, i * gap);
    s.nb(labelX - widthOf(layers[i].label, "lt") - 12, ay - 5.5, n);
  };
  tag(3, 1);
  tag(0, 2);

  // Where each layer runs: brackets on the right.
  s.comment("Where each layer runs");
  const bx = P(W, 0, 0)[0] + 18;
  const mid = (i) => P(W, D / 2, i * gap)[1];
  const bracket = (i0, i1, lines) => {
    const y0 = mid(i1) - 18, y1 = mid(i0) + 18;
    s.path(`M${bx - 6},${y0}H${bx}V${y1}H${bx - 6}`, "leader");
    const cy = (y0 + y1) / 2 - ((lines.length - 1) * 11) / 2;
    lines.forEach((ln, j) => s.text(bx + 8, cy + 3 + j * 11, ln, "sl ink"));
  };
  bracket(3, 4, ["operator", "hardware"]);
  bracket(2, 2, ["in transit"]);
  bracket(0, 1, ["player's", "machine"]);

  const [, yBot] = P(W, D, 0);
  const left = P(0, D, 0)[0];
  s.viewTitle((left + P(W, 0, 0)[0]) / 2, yBot + 34, "Exploded view · defense layers", "Axonometric · not to scale · 01 at the bottom");
  s.height = Math.ceil(yBot + 34 + 13 + 28);
  return s.toString();
}
