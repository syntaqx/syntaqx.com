// One core's 128-tick frame shared by three games and a host reserve, the
// game 1 slot in detail, and frame time then and now. Riot's published
// figures. Embedded in content/books/gaming/game-servers.md.
import { sheet } from "../kit.mjs";

const F1 = 1000 / 128; // 7.8125
const O1 = F1 / 10; // 0.78125, host reserve
const G1 = (F1 - O1) / 3; // 2.34375
const M1 = 2; // measured frame after the work, drawn at its sub-2 ms bound
const E1 = 5.2; // 22-client estimate
const S1 = 50; // frame when the work started

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-gsfb", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "A studio: each 128-tick server frame must complete within 7.8125 ms."],
    [2, "About 10% of the frame is reserved for the OS, scheduling and host software."],
    [3, "The per-game target that fits three games on one core."],
    [4, "The studio: the server frame was 50 ms when the work started and under 2 ms by the end."],
    [5, "The studio, 2023: with 22 clients, frame time scales about 2.2 times, from 2.34 to 5.2 ms."],
    [0, "Values in ms. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: one frame on one core, 1 ms = 80 px ----
  s.comment("Plan view: one core, one 128-tick frame");
  let planBottom;
  const dA = {};
  {
    const k = 80;
    const x0 = CX - (F1 * k) / 2;
    const xs = [0, G1, 2 * G1, 3 * G1, F1].map((ms) => x0 + ms * k);
    const top = ny + 66, h = 40, bot = top + h;
    for (let i = 0; i < 3; i++) s.rect(xs[i], top, xs[i + 1] - xs[i], h, "obj fill-2");
    s.rect(xs[3], top, xs[4] - xs[3], h, "hatch", { fill: s.hatch });
    s.label(xs[0], top, xs[1] - xs[0], h, "game 1");
    s.label(xs[1], top, xs[2] - xs[1], h, "game 2");
    s.label(xs[2], top, xs[3] - xs[2], h, "game 3");

    const fy = top - 34;
    s.dimH(xs[0], xs[4], fy, "F1", { from: [top, top] });
    s.nb(CX + 16, fy - 7.5, 1);
    s.chainH(xs, bot + 22, ["G1", "G1", "G1", "O1"], { from: xs.map(() => bot), below: true, hl: [0] });
    s.nb((xs[0] + xs[1]) / 2 + 18, bot + 30.5, 3);
    s.nb((xs[3] + xs[4]) / 2 + 18, bot + 30.5, 2);
    s.callout((xs[3] + xs[4]) / 2, top + h / 2, xs[3] - 6, top - 14, "host", { dir: -1 });

    // Detail A: the end of game 1's slot, where M1 meets the slot boundary.
    const dx = x0 + M1 * k;
    s.detailRef(dx + 13, top + h / 2, 22, "detail A", dx - 40, top - 14);
    dA.y = bot + 64;
    s.viewTitle(CX, bot + 70, "Plan view · one core, one 128-tick frame", "Scale 1 ms = 80 px · timeline");
    planBottom = bot + 83;
  }

  // ---- Detail A: game 1's slot, 1 ms = 120 px ----
  s.comment("Detail A: game 1 slot");
  const rowTop = planBottom + 50;
  let detailBottom;
  {
    const k = 120, x0 = 60, top = rowTop + 30, h = 40, bot = top + h;
    const xm = x0 + M1 * k, xg = x0 + G1 * k;
    s.rect(x0, top, xg - x0, h, "obj fill-2");
    s.rect(x0, top + 8, xm - x0, h - 16, "obj fill-1");
    s.label(x0, top, xm - x0, h, "measured frame");
    s.dimH(x0, xg, top - 18, "G1", { from: [top, top], hl: true });
    s.chainH([x0, xm, xg], bot + 22, ["M1", "H1"], { from: [bot - 8, bot - 8, bot], below: true });
    s.nb((x0 + xm) / 2 + 18, bot + 30.5, 4);
    s.viewTitle((x0 + xg) / 2, bot + 70, "Detail A · game 1 slot", "Scale 3:2 · 1 ms = 120 px");
    detailBottom = bot + 83;
  }

  s.comment("Variable table");
  const tb = s.table(420, rowTop + 14, "Variables · ms", [
    ["F1", "frame at 128 ticks", "1000 ÷ 128 = 7.8125"],
    ["O1", "host reserve, 10% of F1", "F1 ÷ 10 = 0.78"],
    ["G1", "target per game frame", "(F1 − O1) ÷ 3 = 2.34"],
    ["F1", "check, three games and reserve", "3×G1 + O1 = 7.8125"],
    ["M1", "measured frame after the work", "< 2.00"],
    ["H1", "headroom", "G1 − M1 > 0.34"],
    ["E1", "estimate, 22-client game", "≈ 2.2×G1 = 5.2"],
    ["S1", "frame when the work started", "50 = 6.4×F1"],
  ]);

  // ---- Plan view: frame time then and now, 1 ms = 11 px ----
  s.comment("Plan view: frame time, then and now");
  {
    const k = 11, x0 = 140, h = 16;
    const top = Math.max(detailBottom, tb.y) + 56;
    const rows = [
      ["budget", F1, "F1", "obj fill-2", null],
      ["22 clients", E1, "E1", "obj fill-1", 5],
      ["start", S1, "S1", "obj fill-1", 4],
    ];
    rows.forEach(([lab, ms, code, cls, n], i) => {
      const y = top + i * 56;
      s.rect(x0, y, ms * k, h, cls);
      s.text(x0 - 10, y + h / 2 + 3, lab, "sl ink", "end");
      s.dimH(x0, x0 + ms * k, y - 12, code, { from: [y, y] });
      if (n && ms * k < 120) s.nb(x0 + ms * k + 14, y - 12, n);
      else if (n) s.nb(x0 + (ms * k) / 2 + 18, y - 19.5, n);
    });
    const last = top + 2 * 56 + h;
    s.line(x0 + F1 * k, top - 4, x0 + F1 * k, last + 4, "phantom");
    s.viewTitle(x0 + (S1 * k) / 2, last + 40, "Plan view · frame time, then and now", "Scale 1 ms = 11 px · timeline");
    s.height = Math.ceil(last + 40 + 13 + 30);
  }

  return s.toString();
}
