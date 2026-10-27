// One tenant's hierarchy as an exploded axonometric stack (tenant, regions,
// branches), with what moves through the tree beside it and the flows in a
// table. Embedded in content/docs/architecture/multi-tenancy.md.
import { sheet, text, widthOf } from "../kit.mjs";

// Plate 300 x 200; with a 90 step a lower plate shows local y > ~31, so every
// module sits in the band y 64..184.
const W = 300, D = 200, GAP = 90;
const M = 16, G = 10, Y0 = 64, Y1 = 184;
const BW = (W - 2 * M - 3 * G) / 4; // branch module width
const RW = 2 * BW + G; // a region spans its two branches
const GRANT = 0; // the region the role is granted on [4]

// Rows inside a module: n bars from y0 down, inset 8.
const rows = (p, x, w, y0, n, cls = "ext") => Array.from({ length: n }, (_, i) => p.line(x + 8, y0 + i * 14, x + w - 8, y0 + i * 14, cls));

const layers = [
  {
    label: "03 · Branches",
    sub: "leaf rows: tenant_id, branch_id",
    draw: (p) =>
      [0, 1, 2, 3].flatMap((i) => {
        const x = M + i * (BW + G);
        const inGrant = Math.floor(i / 2) === GRANT;
        return [p.rect(x, Y0, BW, Y1 - Y0, inGrant ? "obj hl" : "obj fill-2"), ...rows(p, x, BW, Y0 + 20, 6)];
      }),
  },
  {
    label: "02 · Regions",
    sub: "overrides and grants live on the node",
    draw: (p) =>
      [0, 1].flatMap((i) => {
        const x = M + i * (RW + G);
        return [
          p.rect(x, Y0, RW, Y1 - Y0, i === GRANT ? "obj hl" : "obj fill-2"),
          // The node's override: one setting stored here.
          p.rect(x + 12, Y0 + 14, RW * 0.55, 12, "obj fill-1"),
          ...rows(p, x, RW, Y0 + 44, 1, "ext"),
        ];
      }),
  },
  {
    label: "01 · Tenant",
    sub: "isolation boundary · tenant_id · RLS",
    draw: (p) => [
      // The isolation boundary around everything in the tenant.
      p.rect(6, 6, W - 12, D - 12, "slot"),
      p.rect(M, Y0, W - 2 * M, Y1 - Y0, "obj fill-2"),
      // Settings defaults held at the top of the tree.
      ...[0, 1, 2].map((i) => p.rect(M + 14, Y0 + 16 + i * 22, (W - 2 * M) * (0.6 - i * 0.12), 12, "obj fill-1")),
    ],
  },
];

// A table with its own column headers (the kit's table is CODE / VARIABLE /
// VALUE); same rules and lettering.
function table(s, x, y, title, head, body, rowH = 15) {
  const all = [head, ...body];
  const ws = head.map((_, j) => Math.ceil(Math.max(...body.map((r) => widthOf(r[j], "tc")), widthOf(head[j], "th")) + 18));
  const w = ws.reduce((a, b) => a + b, 0), h = all.length * rowH;
  s.add(text(x, y - 7, title, "vt"));
  s.rect(x, y, w, h, "tbl");
  for (let i = 1; i < all.length; i++) s.line(x, y + i * rowH, x + w, y + i * rowH, "tbl");
  let cx = x;
  for (const wj of ws.slice(0, -1)) s.line((cx += wj), y, cx, y + h, "tbl");
  all.forEach((r, i) => {
    let c = x;
    r.forEach((v, j) => {
      s.add(text(c + 6, y + i * rowH + rowH / 2 + (i ? 3.2 : 2.7), v, i ? "tc" : "th"));
      c += ws[j];
    });
  });
  return { y: y + h, width: w };
}

const FLOWS = [
  ["settings", "down, nearest override wins", "walk up to the nearest ancestor that sets it"],
  ["grants", "down, cover the subtree", "materialized path or closure table, in the database"],
  ["reports", "up, sum of the subtree", "every level reads the same leaf rows"],
];

export default function draw() {
  const s = sheet({ prefix: "pb-mt", width: 760 });
  const CX = 380;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The tenant stays the isolation boundary; the tree sits inside it and never crosses into another tenant."],
    [2, "An override is stored on the node that has it, never copied into children, so a change at the top reaches them."],
    [3, "A parent's report sums its subtree's entries, each tagged with its leaf node, so every level's totals match."],
    [4, "A role granted on one region covers that region and its branches (accent), and nothing beside it."],
    [0, "Not to scale. Levels separated along the tree axis; plate contents are schematic."],
  ], { width: 690 });

  const top = (layers.length - 1) * GAP;
  const tx = 330, ty = ny + 40 + top;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap: GAP, labelX: 230, layers });
  s.nb(230 - widthOf("01 · Tenant", "lt") - 10, P(0, D, top)[1] - 5.5, 1);

  // The grant, on its region.
  const [gx, gy] = P(M + RW / 2 + 6, Y0 + 84, GAP);
  s.text(gx, gy, "grant", "sl ink ko", "middle");
  s.nb(gx + 26, gy - 3.2, 4);

  // What moves through the tree, beside the stack.
  const [, yTop] = P(W, 0, top);
  const [, yBot] = P(W, D, 0);
  const ax = P(W, 0, 0)[0] + 36, bx = ax + 44;
  s.comment("Flows beside the stack");
  s.path(`M${ax},${yTop}V${yBot}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
  s.text(ax, yTop - 18, "settings", "sl ink", "middle");
  s.text(ax, yTop - 7, "down", "sl ink", "middle");
  s.nb(ax + 34, yTop - 10.5, 2);
  s.path(`M${bx},${yBot}V${yTop}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
  s.text(bx, yBot + 14, "reports", "sl ink", "middle");
  s.text(bx, yBot + 25, "up", "sl ink", "middle");
  s.nb(bx + 36, yBot + 17.5, 3);

  const left = P(0, D, 0)[0];
  const vtY = yBot + 50;
  s.viewTitle((left + P(W, 0, 0)[0]) / 2, vtY, "Exploded view · one tenant", "Axonometric · not to scale · branches at the bottom");

  s.comment("Flow table");
  const tw = FLOWS[0].map((_, j) => Math.ceil(Math.max(...FLOWS.map((r) => widthOf(r[j], "tc"))) + 18)).reduce((a, b) => a + b, 0);
  const tb = table(s, CX - tw / 2, vtY + 13 + 44, "Flows · one tree per tenant", ["flow", "direction", "mechanism"], FLOWS);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
