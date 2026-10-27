// A lakehouse as an exploded axonometric stack: storage, data files, table
// metadata, the catalog (the subject) and the engines that read it. Plate
// contents are schematic modules, one per item in the layer's sub-line.
// Embedded in content/docs/data/warehouses-and-lakes.md (Open Table Formats).
import { sheet, widthOf } from "../kit.mjs";

// Plate 300 x 200; with a 66 step, a lower plate shows only local y > ~80,
// so every module sits in the front band y 92..186.
const W = 300, D = 200;

const layers = [
  {
    label: "01 · Object storage",
    sub: "buckets of immutable objects",
    draw: (p) =>
      // Three buckets, each holding objects that are written once.
      [16, 112, 208].flatMap((x) => [
        p.rect(x, 96, 76, 84, "obj fill-2"),
        ...[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => p.rect(x + 10 + c * 20, 106 + r * 24, 16, 18, "obj fill-1"))),
      ]),
  },
  {
    label: "02 · Data files",
    sub: "Columnar file format · statistics per file",
    draw: (p) =>
      // Columnar files: a statistics band on top, then the column chunks.
      [16, 86, 156, 226].flatMap((x) => [
        p.rect(x, 96, 58, 84, "obj fill-2"),
        p.rect(x, 96, 58, 14, "obj fill-1"),
        ...[1, 2, 3].map((c) => p.line(x + c * 14.5, 110, x + c * 14.5, 180, "ext")),
      ]),
  },
  {
    label: "03 · Table metadata",
    sub: "snapshots · manifests · schema",
    draw: (p) => [
      // Snapshots: a chain, newest on the right.
      p.rect(16, 92, 84, 92, "obj fill-2"),
      ...[30, 58, 86].map((x) => p.circle(x, 138, 7, "obj fill-1")),
      p.line(37, 138, 51, 138, "obj"), p.line(65, 138, 79, 138, "obj"),
      // Manifests: a list pointing at manifest files.
      p.rect(112, 92, 84, 92, "obj fill-2"),
      p.rect(122, 102, 64, 14, "obj fill-1"),
      ...[128, 148, 168].map((y) => p.rect(134, y - 6, 52, 12, "obj fill-2")),
      p.line(128, 116, 128, 168, "ext"),
      ...[128, 148, 168].map((y) => p.line(128, y, 134, y, "ext")),
      // Schema: field rows with their IDs.
      p.rect(208, 92, 76, 92, "obj fill-2"),
      ...[108, 126, 144, 162].flatMap((y) => [p.rect(218, y - 6, 12, 12, "obj fill-1"), p.line(236, y, 274, y, "obj")]),
    ],
  },
  {
    label: "04 · Catalog",
    sub: "one pointer per table · atomic swap",
    draw: (p) => [
      // The subject: the whole plate in the accent.
      p.rect(0, 0, W, D, "obj hl"),
      // Table entries, each with one pointer to its current metadata file.
      ...[104, 130, 156].flatMap((y) => [p.rect(24, y - 8, 70, 16, "obj fill-2"), p.circle(94, y, 2.5, "dot")]),
      p.line(94, 104, 196, 104, "obj"), p.rect(196, 96, 34, 16, "obj fill-2"),
      p.line(94, 130, 196, 130, "obj"), p.rect(196, 122, 34, 16, "obj fill-2"),
      // The swapped pointer: old metadata dashed, new one solid.
      p.line(94, 156, 196, 156, "slot"), p.rect(196, 148, 34, 16, "slot"),
      p.line(94, 156, 244, 176, "obj"), p.rect(244, 168, 34, 16, "obj fill-1"),
    ],
  },
  {
    label: "05 · Engines",
    sub: "Batch · SQL · stream · warehouses",
    draw: (p) =>
      // Four engines side by side, each reading through the catalog.
      [16, 86, 156, 226].flatMap((x) => [
        p.rect(x, 92, 58, 92, "obj fill-2"),
        p.circle(x + 29, 124, 14, "obj fill-1"),
        p.circle(x + 29, 124, 5, "obj"),
        p.rect(x + 10, 154, 38, 14, "obj fill-1"),
      ]),
  },
];

export default function draw() {
  const s = sheet({ prefix: "dp-ls", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "A writer adds data files and metadata first; the commit is the catalog's atomic pointer swap."],
    [2, "Engines start at the catalog, so a reader only ever sees a committed snapshot."],
    [0, "Not to scale. Layers separated along the stack axis; plate contents are schematic."],
  ], { width: 690 });

  const gap = 66, top = (layers.length - 1) * gap;
  const tx = 360, ty = ny + 24 + top;
  const labelX = 250;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap, labelX, layers });

  // Note numbers beside the catalog and engine labels.
  const nbAt = (i, n) => {
    const [, ay] = P(0, D, i * gap);
    s.nb(labelX - widthOf(layers[i].label, "lt") - 14, ay - 5.5, n);
  };
  nbAt(3, 1);
  nbAt(4, 2);

  // Commit direction, beside the stack.
  const ax = P(W, 0, 0)[0] + 40;
  const [, yTop] = P(W, 0, top);
  const [, yBot] = P(W, D, 0);
  s.comment("Commit direction");
  s.path(`M${ax},${yBot}V${yTop}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
  s.text(ax, yTop - 18, "commits", "sl ink", "middle");
  s.text(ax, yTop - 7, "go up", "sl ink", "middle");

  const left = P(0, D, 0)[0];
  s.viewTitle((left + P(W, 0, 0)[0]) / 2, yBot + 34, "Exploded view · lakehouse", "Axonometric · not to scale · 01 at the bottom");
  s.height = Math.ceil(yBot + 34 + 13 + 28);
  return s.toString();
}
