// Client startup as a budget: Riot's published League client bootstrap
// times against the goal, and an illustrative split of the 15 s goal.
// Embedded in content/books/gaming/game-clients.md.
import { sheet, widthOf } from "../kit.mjs";

// Published, in s [1] [2].
const B0 = 29.5, B1 = 16.0, G1 = 15;
// Illustrative split of G1 [3].
const P = [1, 2, 1.5, 4.5, 3, 1.5, 1.5];

const tableWidths = (rows) =>
  [0, 1, 2].map((j) => Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(["CODE", "VARIABLE", "VALUE"][j], "th")) + 14)));

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-cs", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "A studio, February 2021: bootstrap went from 29.5 s at the start of 2020 to 16 s for 90% of players."],
    [2, "The studio's March 2020 goal: about 15 s at the 90th percentile."],
    [3, "Illustrative split, not the studio's; it holds only if all outside the boot set waits for a usable home screen."],
    [0, "Values in s. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view A: published bootstrap times, 1 s = 20 px ----
  s.comment("Plan view: bootstrap, published");
  let aBottom;
  {
    const k = 20, x0 = CX - (B0 * k) / 2, X = (t) => x0 + t * k, h = 24;
    const r0 = ny + 62, r1 = r0 + h + 34;
    s.rect(x0, r0, B0 * k, h, "obj fill-2");
    s.rect(x0, r1, B1 * k, h, "obj fill-1");
    s.text((x0 + X(G1)) / 2, r0 + h / 2 + 3, "start of 2020", "sl ink", "middle");
    s.text((x0 + X(G1)) / 2, r1 + h / 2 + 3, "reported Feb 2021 · p90", "sl ink", "middle");
    const gy = r1 + h + 44;
    s.line(X(G1), r0 - 8, X(G1), gy + 4, "ctr");
    s.dimH(x0, X(B0), r0 - 20, "B0", { from: [r0, r0] });
    s.nb(X(B0 / 2) + 18, r0 - 27.5, 1);
    s.dimH(X(G1), X(B1), r1 - 12, "B1−G1", { from: [null, r1], dx: 40, dy: 7.5 });
    s.dimH(x0, X(B1), r1 + h + 20, "B1", { from: [r1 + h, r1 + h], below: true });
    s.dimH(x0, X(G1), gy, "G1", { from: [null, null], below: true, hl: true });
    s.line(x0, r1 + h + 24, x0, gy + 4, "ext");
    s.nb(X(G1 / 2) + 18, gy + 8.5, 2);
    s.viewTitle(CX, gy + 50, "Plan view · bootstrap, published", "Scale 1 s = 20 px · timeline · p90");
    aBottom = gy + 63;
  }

  // ---- Plan view B: an illustrative 15 s budget, 1 s = 40 px ----
  s.comment("Plan view: a 15 s budget");
  let bBottom;
  {
    const k = 40, x0 = CX - (G1 * k) / 2, h = 30;
    const xs = P.reduce((acc, p) => [...acc, acc[acc.length - 1] + p * k], [x0]);
    const top = aBottom + 74, bot = top + h;
    P.forEach((_, i) => s.rect(xs[i], top, xs[i + 1] - xs[i], h, i === P.length - 1 ? "slot" : "obj fill-2"));
    s.label(xs[3], top, xs[4] - xs[3], h, "boot-set plugins");
    s.label(xs[4], top, xs[5] - xs[4], h, "first data");
    s.dimH(xs[0], xs[7], top - 20, "G1", { from: [top, top], hl: true });
    s.chainH(xs, bot + 20, P.map((_, i) => `P${i + 1}`), { from: xs.map(() => bot), below: true });
    const t = "Plan view · a 15 s budget";
    s.viewTitle(CX, bot + 64, t, "Scale 1 s = 40 px · timeline · illustrative");
    s.nb(CX + widthOf(t, "vt") / 2 + 16, bot + 60, 3);
    bBottom = bot + 77;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["B0", "desktop client bootstrap, start of 2020", "29.5"],
    ["B1", "same, for 90% of players, February 2021", "16.0"],
    ["D1", "bootstrap saved", "B0 − B1 = 13.5, about 46%"],
    ["G1", "goal, about 15 s at p90", "P1 + … + P7 = 15.00"],
    ["P1", "process start, launcher self-update check", "1.00"],
    ["P2", "session restore or sign-in", "2.00"],
    ["P3", "local services up, loopback API ready", "1.50"],
    ["P4", "boot-set plugins load, the rest deferred", "4.50"],
    ["P5", "first data: profile, friends, store, news", "3.00"],
    ["P6", "home screen rendered and interactive", "1.50"],
    ["P7", "headroom: slow disks, cold caches, busy servers", "1.50"],
  ];
  const tw = tableWidths(rows).reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, bBottom + 50, "Variables · s", rows);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
