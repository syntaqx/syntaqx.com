// A shippable build for one platform as an exploded axonometric stack, with
// the symbols plate set aside: same build, never shipped. Embedded in
// content/books/gaming/production-pipelines.md (opening).
import { sheet, el, f, widthOf } from "../kit.mjs";

// Plate 260 x 200; with a 66 step a lower plate shows only local y > ~76,
// so every module sits in the front band y 88..186.
const W = 260, D = 200;

const layers = [
  {
    label: "01 · Manifest",
    sub: "build ID · file and chunk hashes",
    draw: (p) => [
      // Header: the build ID.
      p.rect(16, 90, 228, 16, "obj fill-1"),
      // One row per file or chunk: name, then its content hash.
      ...[114, 132, 150, 168].flatMap((y) => [p.rect(16, y, 64, 12, "obj fill-2"), p.rect(88, y, 156, 12, "slot")]),
    ],
  },
  {
    label: "02 · Content archives",
    sub: "cooked assets, packed in chunks",
    draw: (p) => [
      // Four chunks, each a container of packed assets.
      ...[0, 1, 2, 3].flatMap((c) => {
        const x = 16 + c * 58;
        return [
          p.rect(x, 92, 52, 90, "obj fill-2"),
          ...[0, 1, 2].flatMap((r) => [0, 1].map((k) => p.rect(x + 6 + k * 21, 100 + r * 26, 19, 20, (r + k + c) % 3 ? "obj fill-1" : "slot"))),
        ];
      }),
    ],
  },
  {
    label: "03 · Shaders",
    sub: "compiled per graphics API",
    draw: (p) => [
      // One block per graphics API, each with its compiled variants.
      ...[0, 1, 2].flatMap((c) => {
        const x = 16 + c * 78;
        return [p.rect(x, 92, 72, 90, "obj fill-2"), ...[104, 124, 144, 164].map((y) => p.rect(x + 8, y, 56, 10, "obj fill-1"))];
      }),
    ],
  },
  {
    label: "04 · Executable",
    sub: "game code, symbols stripped",
    draw: (p) => [
      // Header with the build ID, then code sections.
      p.rect(16, 90, 228, 16, "obj fill-1"),
      p.rect(16, 112, 228, 70, "obj fill-2"),
      ...[124, 136, 148, 160, 172].map((y, i) => p.line(28, y, 220 - (i % 3) * 30, y, "obj")),
    ],
  },
];

export default function draw() {
  const s = sheet({ prefix: "gm-pa", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Same build, matched to the executable by build ID; crash reports are symbolicated against them, never shipped."],
    [2, "The manifest is what the launcher and patcher read: it names every file and chunk by content hash."],
    [0, "Not to scale. Layers separated along the stack axis; plate contents are schematic."],
  ], { width: 690 });

  const gap = 66, top = (layers.length - 1) * gap;
  const tx = 300, ty = ny + 30 + top;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap, labelX: 200, layers });
  // Note 2 beside the manifest label.
  const [, my] = P(0, D, 0);
  s.nb(200 - widthOf("01 · Manifest", "lt") - 12, my - 5.5, 2);

  // Symbols: a dashed plate set aside at the executable's level, not in the stack.
  s.comment("Symbols, set aside");
  const sw = 100, sd = 90, k = 0.94, b = 0.17, c = -0.34, e = 0.47;
  const [hx, hy] = P(W - 16, 98, top);
  const sx = P(W, 0, top)[0] + 56, sy = hy - e * (sd / 2);
  const Q = (x, y) => [sx + k * x + c * y, sy + b * x + e * y];
  s.add(
    el(
      "g",
      { class: "iso", transform: `matrix(${k} ${b} ${c} ${e} ${f(sx)} ${f(sy)})` },
      [
        el("rect", { class: "slot", width: sw, height: sd }),
        ...[18, 34, 50, 66].map((y, i) => el("path", { class: "ext", d: `M14,${y}H${86 - (i % 2) * 20}` })),
      ].join(""),
    ),
  );
  // Matched by build ID: a phantom line from the executable's header to the symbols plate.
  const [qx, qy] = Q(0, sd / 2);
  s.line(hx, hy, qx, qy, "phantom");
  const [lx, ly] = Q(sw / 2, sd);
  s.add(el("circle", { class: "dot", cx: lx, cy: ly, r: 1.6 }));
  s.line(lx, ly, lx, ly + 24, "leader");
  s.text(lx, ly + 36, "symbols", "lt", "middle");
  s.nb(lx + widthOf("symbols", "lt") / 2 + 12, ly + 32.5, 1);
  s.text(lx, ly + 48, "kept in a symbol store", "vs", "middle");

  const left = P(0, D, 0)[0];
  const [, yBot] = P(W, D, 0);
  s.viewTitle((left + P(W, 0, 0)[0]) / 2 + 40, yBot + 40, "Exploded view · a shippable build", "Axonometric · not to scale · one platform, 01 at the bottom");
  s.height = Math.ceil(yBot + 40 + 13 + 30);
  return s.toString();
}
