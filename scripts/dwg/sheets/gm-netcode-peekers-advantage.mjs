// Peeker's advantage as three bars on one millisecond scale (published
// figures, July 2020), the buffering in frames as a detail, and the variable
// table. Embedded in content/books/gaming/netcode.md.
import { sheet } from "../kit.mjs";

const P0 = 141, N1 = 40, P2 = 71;
const P1 = P0 - N1; // 101
const F1 = P1 - P2; // 30
const TICK = 1000 / 128, F60 = 1000 / 60, F144 = 1000 / 144;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-npa", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Published figures, July 2020: peekers have about 141 ms longer to react than holders, with a 60 FPS client."],
    [2, "A dedicated network, the 35 ms target and 128-tick servers took out about 40 ms (28%)."],
    [3, "At 144 FPS about 71 ms (49%); F1 is the difference. Client frames count three times: B2 − B3 = 29.17."],
    [4, "Holder's window = peeker's reaction − holder's round trip − buffering on both sides."],
    [0, "Values in ms. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: three bars, 1 ms = 3.5 px ----
  s.comment("Plan view: peeker's advantage");
  const k = 3.5, x0 = (W - P0 * k) / 2 - 20;
  const X = (ms) => x0 + ms * k;
  const h = 24, step = 62;
  const rows = [
    { y: ny + 52, label: "baseline" },
    { y: ny + 52 + step, label: "servers" },
    { y: ny + 52 + 2 * step, label: "144 fps" },
  ];
  rows.forEach((r) => s.text(X(0) - 10, r.y + h / 2 + 3, r.label, "sl ink", "end"));

  // Row 1: baseline.
  {
    const { y } = rows[0];
    s.rect(X(0), y, P0 * k, h, "obj fill-2");
    s.dimH(X(0), X(P0), y - 16, "P0", { from: [y, y] });
    s.nb(X(P0 / 2) + 18, y - 23.5, 1);
  }
  // Row 2: network and servers removed.
  {
    const { y } = rows[1];
    s.rect(X(0), y, P1 * k, h, "obj fill-2");
    s.rect(X(P1), y, N1 * k, h, "hatch", { fill: s.hatch });
    s.chainH([X(0), X(P1), X(P0)], y - 16, ["P1", "N1"], { from: [y, y, y] });
    s.nb(X(P1 + N1 / 2) + 16, y - 23.5, 2);
    s.text(X(P0) + 10, y + h / 2 + 3, "removed", "sl", "start");
  }
  // Row 3: 144 FPS, the subject.
  let bot;
  {
    const { y } = rows[2];
    s.rect(X(0), y, P2 * k, h, "obj hl");
    s.rect(X(P2), y, (F1 + N1) * k, h, "hatch", { fill: s.hatch });
    s.line(X(P1), y, X(P1), y + h, "obj");
    s.dimH(X(0), X(P2), y - 16, "P2", { from: [y, y], hl: true });
    s.chainH([X(P2), X(P1), X(P0)], y - 16, ["F1", "N1"], { from: [y, y, y] });
    s.nb(X(P2 + F1 / 2) + 16, y - 23.5, 3);
    s.text(X(P0) + 10, y + h / 2 + 3, "removed", "sl", "start");
    s.detailRef(X(P2 + F1 / 2), y + h / 2, 22, "detail A", X(P2 + F1 / 2) + 40, y + h + 26);
    bot = y + h;
  }
  s.viewTitle(X(P0 / 2), bot + 62, "Plan view · peeker's advantage", "Scale 1 ms = 3.5 px · timeline · three published figures");
  const planBottom = bot + 75;

  // ---- Detail A: buffering in frames, 1 ms = 5 px ----
  s.comment("Detail A: buffering");
  const rowTop = planBottom + 48;
  {
    const kd = 5, dx0 = 104, dh = 20, dstep = 50;
    const lanes = [
      { label: "server", n: 2, f: TICK, code: "B1" },
      { label: "60 fps", n: 3, f: F60, code: "B2" },
      { label: "144 fps", n: 3, f: F144, code: "B3" },
    ];
    lanes.forEach((L, i) => {
      const y = rowTop + 30 + i * dstep;
      s.text(dx0 - 10, y + dh / 2 + 3, L.label, "sl ink", "end");
      for (let j = 0; j < L.n; j++) s.rect(dx0 + j * L.f * kd, y, L.f * kd, dh, "obj fill-2");
      s.dimH(dx0, dx0 + L.n * L.f * kd, y - 12, L.code, { from: [y, y] });
    });
    const dBot = rowTop + 30 + 2 * dstep + dh;
    s.viewTitle(dx0 + (3 * F60 * kd) / 2, dBot + 44, "Detail A · buffering", "Scale 1 ms = 5 px · frames per published model");
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(438, rowTop + 16, "Variables · ms", [
    ["P0", "baseline, 60 FPS", String(P0)],
    ["N1", "network, 128 tick", String(N1)],
    ["P1", "after network, servers", `P0 − N1 = ${P1}`],
    ["F1", "frame rate, 60 to 144", `P1 − P2 = ${F1}`],
    ["P2", "at 144 FPS", String(P2)],
    ["B1", "server, 2 frames", "2 × 7.81 = 15.63"],
    ["B2", "client, 3 at 60 FPS", "3 × 16.67 = 50.00"],
    ["B3", "client, 3 at 144 FPS", "3 × 6.94 = 20.83"],
  ]);
  s.height = Math.ceil(Math.max(tb.y, rowTop + 207) + 30);
  return s.toString();
}
