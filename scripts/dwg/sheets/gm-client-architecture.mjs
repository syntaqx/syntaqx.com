// A desktop game client as an exploded stack: the game as a separate
// process below the client's plugin host, local services and web UI, with
// Riot's published memory figures. Embedded in
// content/books/gaming/game-clients.md.
import { sheet, widthOf } from "../kit.mjs";

// Plate 300 x 200; with a 66 step a lower plate shows only local y > ~80,
// so modules sit in the front band y 92..186.
const W = 300, D = 200;

const game = {
  label: "00 · Game process",
  sub: "separate executable · loopback API",
  draw: (p) => [
    // The game: its own window and loop.
    p.rect(16, 96, 150, 84, "obj fill-2"),
    p.rect(26, 106, 130, 50, "obj fill-1"),
    p.line(26, 168, 156, 168, "ctr"),
    // Its loopback API: ports.
    p.rect(186, 96, 98, 84, "obj fill-2"),
    ...[118, 138, 158].map((y) => p.circle(235, y, 7, "slot")),
  ],
};

const client = [
  {
    label: "01 · Plugin host",
    sub: "manifest · semver · entitlements",
    draw: (p) => [
      // Manifest: the list of plugins a build ships.
      p.rect(16, 96, 76, 84, "obj fill-2"),
      ...[110, 124, 138, 152, 166].map((y) => p.line(26, y, 82, y, "obj")),
      // Loaded plugins, two not entitled and left unloaded.
      ...[0, 1, 2, 3, 4, 5].map((i) => p.rect(108 + (i % 3) * 60, 98 + Math.floor(i / 3) * 44, 52, 36, i === 2 || i === 4 ? "slot" : "obj fill-1")),
    ],
  },
  {
    label: "02 · Local services",
    sub: "back-end plugins · canonical state",
    draw: (p) => [
      // Four back-end plugins, each holding its state.
      ...[0, 1, 2, 3].flatMap((i) => [
        p.rect(16 + i * 68, 96, 58, 84, "obj fill-2"),
        p.rect(26 + i * 68, 140, 38, 30, "obj fill-1"),
        p.line(26 + i * 68, 150, 64 + i * 68, 150, "obj"),
        p.line(26 + i * 68, 160, 64 + i * 68, 160, "obj"),
      ]),
    ],
  },
  {
    label: "03 · Web UI",
    sub: "Embedded browser · front-end plugins",
    draw: (p) => [
      // The renderer's window with three front-end plugin panes.
      p.rect(16, 20, 268, 166, "obj fill-2"),
      p.line(16, 36, 284, 36, "obj"),
      p.rect(28, 48, 70, 126, "obj fill-1"),
      p.rect(110, 48, 162, 60, "obj fill-1"),
      p.rect(110, 120, 162, 54, "obj fill-1"),
    ],
  },
];

const tableWidths = (rows) =>
  [0, 1, 2].map((j) => Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(["CODE", "VARIABLE", "VALUE"][j], "th")) + 14)));

export default function draw() {
  const s = sheet({ prefix: "gm-ca", width: 760 });
  const CX = 380;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The host loads the plugins the manifest lists, if their versions agree, as the player's entitlements allow."],
    [2, "The UI rebuilds from the services with GETs and watches changes; it can close while services keep state."],
    [3, "Hand the game a short-lived token, never the account credential; the client steps back while the match runs."],
    [0, "Not to scale; plate contents are schematic. Plugin model per a studio's 2016 and 2017 posts; figures in MB."],
  ], { width: 690 });

  const gap = 66, split = 120, top = (client.length - 1) * gap;
  const tx = 344, tyClient = ny + 30 + top, tyGame = tyClient + split;
  const labelX = 236;
  s.comment("Exploded view: game process");
  const Pg = s.exploded({ tx, ty: tyGame, w: W, d: D, gap, labelX, layers: [game] });
  s.comment("Exploded view: client");
  const Pc = s.exploded({ tx, ty: tyClient, w: W, d: D, gap, labelX, layers: client });

  // Interfaces, beside the stack on the right.
  const rx = Pc(W, 0, 0)[0] + 14;
  const iface = (yA, yB, l1, l2, n) => {
    s.path(`M${rx},${yA}V${yB}`, "leader", { "marker-start": `url(#${s.id("ah")})`, "marker-end": `url(#${s.id("ah")})` });
    const c = (yA + yB) / 2;
    s.text(rx + 8, c - 2, l1, "sl ink");
    s.text(rx + 8, c + 10, l2, "sl ink");
    s.nb(rx + 8 + Math.max(widthOf(l1, "sl"), widthOf(l2, "sl")) + 12, c + 4 - 3.5, n);
  };
  // UI to services: between the right corners of plates 03 and 02.
  iface(Pc(W, 0, 2 * gap)[1] + 6, Pc(W, 0, gap)[1] - 6, "REST and", "WebSocket", 2);
  // Host to game: across the split.
  iface(Pc(W, 0, 0)[1] + 6, Pg(W, 0, 0)[1] - 6, "launches", "with token", 3);
  // Note 1 beside the host's label.
  const [, hy] = Pc(0, D, 0);
  s.nb(labelX - widthOf(client[0].label, "lt") - 14, hy - 5.5, 1);

  const yBot = Pg(W, D, 0)[1];
  const vx = (Pc(0, D, 0)[0] + Pc(W, 0, 0)[0]) / 2;
  s.viewTitle(vx, yBot + 40, "Exploded view · desktop client", "Axonometric · not to scale · game process split off");

  s.comment("Published figures");
  const rows = [
    ["M1", "desktop services memory, 2016", "about 20"],
    ["M2", "front-end memory per session, p50, browser 74", "597"],
    ["M3", "same, p50, browser 91, patch 11.17, September 2021", "275"],
    ["M4", "saved by the engine upgrade", "M2 − M3 = 322"],
  ];
  const tw = tableWidths(rows).reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, yBot + 40 + 13 + 50, "Published figures · MB", rows);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
