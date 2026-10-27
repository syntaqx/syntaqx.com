// A game backend as an exploded stack of four layers, with the game server
// fleet beside it. Plate contents are schematic modules, one per service.
// Embedded in content/books/gaming/game-backend.md (The Stack).
import { sheet } from "../kit.mjs";

// Plate 300 x 200; with a 70 step a lower plate shows only local y > ~70,
// so every module sits in the front band y 90..184.
const W = 300, D = 200, GAP = 62;

// Six equal module slots across the plate for the game services layer.
const six = (i) => 12 + i * 47.6;
const RESULTS = 3, PROVISION = 2;

const layers = [
  {
    label: "01 · data",
    sub: "databases · caches · stream · warehouse",
    draw: (p) => [
      // Per-service databases: three stacked disks.
      p.rect(14, 94, 62, 86, "obj fill-2"),
      ...[108, 132, 156].map((y) => p.rect(24, y, 42, 16, "obj fill-1", 8)),
      // Cache: small fixed cells.
      p.rect(86, 94, 62, 86, "obj fill-2"),
      ...[0, 1, 2, 3].flatMap((r) => [0, 1, 2].map((c) => p.rect(94 + c * 16, 102 + r * 18, 12, 14, "obj fill-1"))),
      // Event stream: an append-only log.
      p.rect(158, 94, 62, 86, "obj fill-2"),
      p.line(166, 137, 212, 137, "ctr"),
      ...[0, 1, 2, 3].map((i) => p.rect(166 + i * 11, 129, 9, 16, "obj fill-1")),
      // Warehouse: wide columnar tables.
      p.rect(230, 94, 58, 86, "obj fill-2"),
      ...[240, 254, 268].map((x) => p.rect(x, 104, 10, 66, "obj fill-1")),
    ],
  },
  {
    label: "02 · game services",
    sub: "parties · queues · servers · results",
    draw: (p) => [
      ...[0, 1, 2, 3, 4, 5].map((i) => p.rect(six(i), 94, 40, 86, i === RESULTS ? "obj hl" : "obj fill-2")),
      // Parties: members grouped.
      ...[112, 132, 152].map((y) => p.circle(six(0) + 20, y, 6, "obj fill-1")),
      // Matchmaking: a queue.
      ...[104, 120, 136, 152].map((y) => p.rect(six(1) + 8, y, 24, 10, "obj fill-1")),
      p.rect(six(1) + 4, 166, 32, 8, "slot"),
      // Provisioning: a rack of server slots.
      ...[104, 122, 140, 158].map((y) => p.rect(six(2) + 6, y, 28, 12, "obj fill-1")),
      // Game results: one record per match.
      ...[110, 124, 138, 152].map((y) => p.line(six(3) + 8, y, six(3) + 32, y, "obj")),
      // Progression: a ladder of steps.
      p.path(`M${six(4) + 6},170H${six(4) + 16}V146H${six(4) + 26}V122H${six(4) + 34}V100`, "obj"),
      // Store: a catalog grid.
      ...[0, 1, 2].flatMap((r) => [0, 1].map((c) => p.rect(six(5) + 6 + c * 15, 104 + r * 22, 12, 18, "obj fill-1"))),
    ],
  },
  {
    label: "03 · platform services",
    sub: "accounts · entitlements · chat · config",
    draw: (p) => [
      ...[0, 1, 2, 3, 4, 5].map((i) => p.rect(six(i), 94, 40, 86, "obj fill-2")),
      // Accounts and sessions: an identity with its session tokens.
      p.circle(six(0) + 20, 114, 8, "obj fill-1"), p.rect(six(0) + 8, 134, 24, 10, "obj fill-1"), p.rect(six(0) + 8, 150, 24, 10, "slot"),
      // Entitlements: a ledger of grants.
      ...[106, 122, 138, 154].map((y) => p.line(six(1) + 8, y, six(1) + 32, y, "obj")),
      // Chat and presence: two messages and a status dot.
      p.rect(six(2) + 5, 104, 24, 16, "obj fill-1"), p.rect(six(2) + 11, 128, 24, 16, "obj fill-1"), p.circle(six(2) + 20, 162, 4, "dot"),
      // Push: a fan-out to devices.
      ...[106, 130, 154].map((y) => p.line(six(3) + 8, 130, six(3) + 30, y, "obj")),
      ...[106, 130, 154].map((y) => p.rect(six(3) + 28, y - 4, 8, 8, "obj fill-1")),
      // Configuration: key-value rows.
      ...[106, 124, 142, 160].map((y) => [p.rect(six(4) + 6, y, 10, 10, "obj fill-1"), p.line(six(4) + 20, y + 5, six(4) + 34, y + 5, "obj")]).flat(),
      // Telemetry intake: events funnel in.
      p.path(`M${six(5) + 6},104H${six(5) + 34}L${six(5) + 24},140V170H${six(5) + 16}V140Z`, "obj fill-1"),
    ],
  },
  {
    label: "04 · edge",
    sub: "CDN · DDoS · load balancing · gateway",
    draw: (p) => [
      // CDN and DDoS protection: a ring of edge nodes.
      p.rect(14, 94, 84, 86, "obj fill-2"),
      ...[[34, 112], [78, 112], [34, 162], [78, 162], [56, 137]].map(([x, y]) => p.circle(x, y, 7, "obj fill-1")),
      // Load balancing: one in, fanned out.
      p.rect(108, 94, 84, 86, "obj fill-2"),
      p.rect(118, 131, 14, 12, "obj fill-1"),
      ...[108, 137, 166].flatMap((y) => [p.line(132, 137, 168, y, "obj"), p.rect(168, y - 6, 14, 12, "obj fill-1")]),
      // API gateway: one front door with routes behind it.
      p.rect(202, 94, 86, 86, "obj fill-2"),
      p.rect(212, 104, 16, 66, "obj fill-1"),
      ...[112, 132, 152].map((y) => p.line(228, y + 5, 276, y + 5, "obj")),
    ],
  },
];

export default function draw() {
  const s = sheet({ prefix: "gm-bks", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Game servers run beside the stack, not in it: they meet it only at match start and at the result."],
    [2, "Match start: provisioning hands the assigned server a signed roster, map, mode and loadouts."],
    [3, "Result: the assigned server reports once per match; the highlighted results service accepts it once."],
    [4, "Riot, Dec 2020: VALORANT requests pass Cloudflare, then nginx; 30+ platform services sit below."],
    [0, "Not to scale. Layers separated along the stack axis; plate contents are schematic."],
  ], { width: 690 });

  const top = (layers.length - 1) * GAP;
  const tx = 340, ty = ny + 40 + top;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap: GAP, k: 0.9, labelX: 240, layers });

  // Requests enter at the edge, beside the stack.
  const ax = P(W, 0, 0)[0] + 60;
  const [, yTop] = P(W, 0, top);
  const [, yEdge] = P(W, D * 0.6, top);
  s.comment("Request direction");
  s.path(`M${ax},${yTop}V${yEdge}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
  s.text(ax, yTop - 18, "requests", "sl ink", "middle");
  s.text(ax, yTop - 7, "enter", "sl ink", "middle");
  s.nb(ax + 34, yTop - 10.5, 4);

  // Game server fleet beside the game services layer.
  s.comment("Game server fleet");
  // Two links at the game services plate's right edge: match start out,
  // result back in.
  const [px, py] = P(W - 0.01, 130, GAP);
  const [rx, ry] = P(W - 0.01, 175, GAP);
  const fx = ax - 40, fw = 80, fy = (py + ry) / 2 - 36;
  [0, 1, 2].forEach((i) => s.rect(fx, fy + i * 26, fw, 20, "obj fill-1"));
  s.text(fx + fw / 2, fy - 22, "game", "sl ink", "middle");
  s.text(fx + fw / 2, fy - 11, "servers", "sl ink", "middle");
  s.nb(fx + fw / 2 + 38, fy - 14.5, 1);
  const ah = `url(#${s.id("ah")})`;
  s.add(`<circle class="dot" cx="${px}" cy="${py}" r="1.6"/>`);
  s.path(`M${px},${py}H${fx - 2}`, "leader", { "marker-end": ah });
  s.path(`M${fx - 2},${ry}H${rx + 3}`, "leader", { "marker-end": ah });
  s.nb((px + fx) / 2, py - 9, 2);
  s.nb((rx + fx) / 2, ry + 10, 3);

  const [, yBot] = P(W, D, 0);
  const left = P(0, D, 0)[0];
  s.viewTitle((left + P(W, 0, 0)[0]) / 2, yBot + 34, "Exploded view · game backend", "Axonometric · not to scale · 01 at the bottom");
  s.height = Math.ceil(yBot + 34 + 13 + 28);
  return s.toString();
}
