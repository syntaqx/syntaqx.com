// The layers of an analytics project as an exploded axonometric stack, with
// each layer's materialization and readers in a table. Plate contents are
// schematic modules for what the layer holds. Embedded in
// content/docs/data/data-modeling.md (Layers).
import { sheet, text, widthOf } from "../kit.mjs";

// Plate 290 x 200; with a 66 step a lower plate shows only local y > ~76,
// so lower layers keep their modules in the front band y 88..186.
const W = 290, D = 200;

const layers = [
  {
    label: "01 · Raw",
    sub: "as loaded · append-only · per source",
    draw: (p) => [
      // One append-only log per source: rows stacked, the next append dashed.
      ...[16, 108, 200].flatMap((x) => [
        p.rect(x, 92, 74, 92, "obj fill-2"),
        ...[104, 118, 132, 146].map((y) => p.rect(x + 8, y, 58, 10, "obj fill-1")),
        p.rect(x + 8, 160, 58, 10, "slot"),
      ]),
    ],
  },
  {
    label: "02 · Staging",
    sub: "one per source table · renamed · typed",
    draw: (p) => [
      // One model per source table: a typed header row over its columns.
      ...[0, 1, 2].flatMap((c) =>
        [0, 1].flatMap((r) => {
          const x = 16 + c * 92, y = 92 + r * 48;
          return [p.rect(x, y, 74, 40, "obj fill-2"), p.rect(x, y, 74, 10, "obj fill-1"), ...[28.5, 47, 65.5].map((cx) => p.line(x + cx - 10, y + 10, x + cx - 10, y + 40, "ext"))];
        }),
      ),
    ],
  },
  {
    label: "03 · Intermediate",
    sub: "joins and reshaping · verb names",
    draw: (p) => [
      // Two joins: inputs feed a reshaped model.
      ...[16, 152].flatMap((x) => [
        p.rect(x, 94, 50, 30, "obj fill-2"),
        p.rect(x, 150, 50, 30, "obj fill-2"),
        p.line(x + 50, 109, x + 76, 137, "obj"),
        p.line(x + 50, 165, x + 76, 137, "obj"),
        p.rect(x + 76, 117, 46, 40, "obj fill-1"),
      ]),
    ],
  },
  {
    label: "04 · Marts",
    sub: "facts · conformed dimensions · wide tables",
    draw: (p) => [
      // A fact table with its conformed dimensions.
      ...[[16, 94], [116, 94], [16, 160], [116, 160]].flatMap(([x, y]) => [p.line(x + 15, y + 12, 81, 137, "ext"), p.rect(x, y, 30, 24, "obj fill-2")]),
      p.rect(56, 118, 50, 38, "obj fill-1"),
      // A wide table: many columns.
      p.rect(170, 100, 104, 76, "obj fill-2"),
      p.rect(170, 100, 104, 12, "obj fill-1"),
      ...[183, 196, 209, 222, 235, 248, 261].map((x) => p.line(x, 112, x, 176, "ext")),
    ],
  },
  {
    label: "05 · Semantic layer",
    sub: "metrics · entities · dimensions",
    draw: (p) => [
      // Metrics.
      ...[[46, 46], [94, 46], [46, 94], [94, 94]].map(([x, y]) => p.circle(x, y, 16, "obj fill-1")),
      // Entities, joined.
      p.rect(140, 30, 56, 34, "obj fill-2"), p.rect(214, 30, 56, 34, "obj fill-2"), p.line(196, 47, 214, 47, "obj"),
      p.rect(177, 92, 56, 34, "obj fill-2"), p.line(168, 64, 196, 92, "obj"), p.line(242, 64, 214, 92, "obj"),
      // Dimensions: tags.
      ...[0, 1, 2, 3].map((i) => p.rect(24 + i * 64, 152, 52, 16, "obj fill-2", 8)),
    ],
  },
];

const TABLE = [
  ["01", "raw", "tables, as loaded", "staging models only"],
  ["02", "staging", "views", "intermediate, marts"],
  ["03", "intermediate", "ephemeral, or views", "marts"],
  ["04", "marts", "view, table, incremental", "people, BI, semantic layer"],
  ["05", "semantic", "metric definitions", "dashboards, notebooks, apps"],
];

export default function draw() {
  const s = sheet({ prefix: "dp-dm", width: 760 });
  const CX = 380;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Each layer reads only the layer beneath it. Dashboards never read raw or staging."],
    [2, "Staging as views; intermediate ephemeral or views in a restricted schema; marts start as views, become tables when slow to query, incremental when slow to build."],
    [0, "Not to scale. Layers separated along the build axis; plate contents are schematic."],
  ], { width: 690 });

  const gap = 66, top = (layers.length - 1) * gap;
  const tx = 392, ty = ny + 30 + top;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap, labelX: 284, layers });

  // Build direction, beside the stack.
  const ax = P(W, 0, 0)[0] + 34;
  const [, yTop] = P(W, 0, top);
  const [, yBot] = P(W, D, 0);
  s.comment("Build direction");
  s.path(`M${ax},${yBot}V${yTop}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
  s.text(ax, yTop - 18, "builds", "sl ink", "middle");
  s.text(ax, yTop - 7, "up", "sl ink", "middle");
  s.nb(ax + 26, yTop - 10.5, 1);

  const left = P(0, D, 0)[0];
  const vy = yBot + 34;
  s.viewTitle((left + P(W, 0, 0)[0]) / 2, vy, "Exploded view · model layers", "Axonometric · not to scale · 01 at the bottom");

  // ---- Layer table (four columns, same rules as the kit's table) ----
  s.comment("Layer table");
  const ws = [40, 100, 150, 170];
  const tw = ws.reduce((a, b) => a + b, 0);
  const x0 = CX - tw / 2, y0 = vy + 13 + 52, rowH = 15;
  const all = [["No", "Layer", "Materialized as", "Read by"], ...TABLE];
  const h = all.length * rowH;
  s.text(x0, y0 - 7, "Layers · materialization", "vt");
  s.nb(x0 + widthOf("Layers · materialization", "vt") * 0.88 + 10, y0 - 10.5, 2);
  s.rect(x0, y0, tw, h, "tbl");
  for (let i = 1; i < all.length; i++) s.line(x0, y0 + i * rowH, x0 + tw, y0 + i * rowH, "tbl");
  let cx = x0;
  for (const wj of ws.slice(0, -1)) s.line((cx += wj), y0, cx, y0 + h, "tbl");
  all.forEach((r, i) => {
    let c = x0;
    r.forEach((v, j) => {
      const cls = i ? "tc" : "th";
      const yy = y0 + i * rowH + rowH / 2 + (i ? 3.2 : 2.7);
      s.add(j === 0 ? text(c + 6, yy, v, cls) : text(c + ws[j] / 2, yy, v, cls, "middle"));
      c += ws[j];
    });
  });
  s.height = Math.ceil(y0 + h + 30);
  return s.toString();
}
