// One game server host as an exploded axonometric stack: hardware, host OS,
// cores, game server processes, one of them highlighted as one match.
// Counts per Riot's 128-tick post (2020). Embedded in
// content/books/gaming/game-servers.md.
import { sheet } from "../kit.mjs";

// Plate 300 x 200; with a 66 step a lower plate shows only local y > ~80,
// so every module sits in the front band y 92..184.
const W = 300, D = 200;
const C1 = 36, G1 = 3, P1 = 10, U1 = 2;
const N1 = C1 * G1, H1 = N1 * P1;

// Core grid: 12 columns x 3 rows = C1, split into U1 NUMA halves of 6 columns.
const COLS = 12, ROWS = 3, X0 = 14, Y0 = 96, CW = 20, CH = 24, CG = 2.8, RG = 6;
const half = (COLS / U1) * (CW + CG);
const NG = 8; // gap between the two NUMA halves
const cx = (c) => X0 + c * (CW + CG) + (c >= COLS / U1 ? NG : 0);
const cy = (r) => Y0 + r * (CH + RG);
const SL = (CW - 2 * 1.2) / G1; // sliver width inside a core

const layers = [
  {
    label: "01 hardware",
    sub: "U1 NUMA nodes · C1 physical cores",
    draw: (p) => [
      // Two NUMA nodes, each a socket with its memory banks.
      ...[0, 1].flatMap((n) => {
        const x = X0 + n * (half + NG) - 2;
        return [
          p.rect(x, 92, half - 2, 92, "obj fill-2"),
          p.rect(x + 14, 106, half - 64, 64, "obj fill-1"),
          ...[0, 1, 2, 3].map((i) => p.rect(x + half - 40, 102 + i * 19, 24, 12, "obj fill-1")),
        ];
      }),
    ],
  },
  {
    label: "02 host OS",
    sub: "power states · clocksource · scheduler",
    draw: (p) => [
      // Power states: a stepped governor.
      p.rect(14, 92, 84, 92, "obj fill-2"),
      p.path("M26,172H44V150H62V128H80V106", "obj"),
      // Clocksource: a clock.
      p.rect(108, 92, 84, 92, "obj fill-2"),
      p.circle(150, 138, 26, "obj fill-1"), p.line(150, 138, 150, 118, "obj"), p.line(150, 138, 164, 146, "obj"),
      // Scheduler: run queues.
      p.rect(202, 92, 84, 92, "obj fill-2"),
      ...[108, 130, 152].flatMap((y, i) => [p.line(212, y + 6, 276, y + 6, "ctr"), p.rect(216 + i * 8, y, 22, 12, "obj fill-1"), p.rect(242 + i * 4, y, 16, 12, "obj fill-1")]),
    ],
  },
  {
    label: "03 cores",
    sub: "C1 per host · C1 ÷ U1 per NUMA node",
    draw: (p) => [
      ...Array.from({ length: ROWS }, (_, r) => Array.from({ length: COLS }, (_, c) => p.rect(cx(c), cy(r), CW, CH, "obj fill-2"))).flat(),
      p.line(X0 + half + NG / 2 - CG / 2, 90, X0 + half + NG / 2 - CG / 2, 186, "ctr"),
    ],
  },
  {
    label: "04 game servers",
    sub: "N1 processes · G1 per core",
    draw: (p) => [
      ...Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => [
          p.rect(cx(c), cy(r), CW, CH, "slot"),
          ...Array.from({ length: G1 }, (_, g) => {
            const last = r === ROWS - 1 && c === COLS - 1 && g === G1 - 1;
            return p.rect(cx(c) + 1.2 + g * SL + 0.6, cy(r) + 2, SL - 1.2, CH - 4, last ? "obj hl" : "obj fill-1");
          }),
        ]),
      ).flat(2),
      p.line(X0 + half + NG / 2 - CG / 2, 90, X0 + half + NG / 2 - CG / 2, 186, "ctr"),
    ],
  },
];

export default function draw() {
  const s = sheet({ prefix: "gm-gsh", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Counts per a studio's published 128-tick post (2020): hosts typically have 36 cores; beating 3 games per core gives 108 games and 1,080 players per server."],
    [2, "Two NUMA nodes follow the studio's numactl pinning by game id modulo 2."],
    [3, "One game server process per match, per the same studio's load-testing post; the highlighted process is one match."],
    [0, "Not to scale. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  const gap = 66, top = (layers.length - 1) * gap;
  const tx = 355, ty = ny + 34 + top;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap, labelX: 240, layers });

  // NUMA split on the hardware plate.
  const [nx, ny2] = P(X0 + half + NG / 2, 184, 0);
  s.nb(nx + 12, ny2 + 14, 2);

  // One match: the highlighted process on the top plate.
  const mx = cx(COLS - 1) + 1.2 + (G1 - 0.5) * SL;
  const [px, py] = P(mx, cy(ROWS - 1) + CH / 2, top);
  const ex = P(W, 0, 0)[0] + 26;
  s.callout(px, py, ex, py - 30, "1 match", { sub: "P1 players" });
  s.nb(ex + 19.5, py - 30 + 26, 3);

  const left = P(0, D, 0)[0] - 150;
  const right = P(W, 0, 0)[0];
  const [, yBot] = P(W, D, 0);
  const vy = yBot + 30;
  s.viewTitle((left + right) / 2 + 40, vy, "Exploded view · one host", "Axonometric · not to scale · 01 at the bottom");
  s.nb((left + right) / 2 + 40 + 104, vy - 4, 1);

  s.comment("Variable table");
  const rows = [
    ["U1", "NUMA nodes per host", String(U1)],
    ["C1", "physical cores per host (typical)", String(C1)],
    ["G1", "128-tick games per core, the target to beat", String(G1)],
    ["N1", "games per host", `C1 × G1 = ${N1}`],
    ["P1", "players per game, 5 versus 5", String(P1)],
    ["H1", "players per host", `N1 × P1 = ${H1.toLocaleString("en-US")}`],
  ];
  const tw = 40 + 220 + 110;
  const tb = s.table((760 - tw) / 2, vy + 46, "Variables · counts", rows, { widths: [40, 220, 110] });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
