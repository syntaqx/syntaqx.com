// Presence fan-out: one player's friends list as a strip, one status change
// through the fan-out stages, and the rate it adds up to. Every value is
// illustrative. Embedded in content/books/gaming/social-systems.md.
import { sheet } from "../kit.mjs";

const R1 = 25, V1 = 5, O1 = 90; // friends: told, online but filtered, offline
const F1 = R1 + V1 + O1; // 120

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-sp", width: W });
  const CX = W / 2;
  const ah = `url(#${s.id("ah")})`;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Every value on this sheet is illustrative; measure your own roster sizes and churn."],
    [2, "Online but not told: the player appears offline to them, they blocked each other, or a privacy setting hides presence from them."],
    [3, "Changes inside a short window merge into one push; U1 counts after the merge."],
    [4, "Q1 grows with C1, U1 and M1, so roster size and churn matter as much as player count. Cut U1 first: it is the one you control without hurting anyone's list."],
    [0, "The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view A: the friends list, 1 friend = 4 px ----
  s.comment("Plan view A: one player's friends list");
  let aBottom;
  {
    const k = 4;
    const x0 = CX - (F1 * k) / 2;
    const xs = [x0, x0 + R1 * k, x0 + (R1 + V1) * k, x0 + F1 * k];
    const top = ny + 56, h = 28, bot = top + h;
    s.rect(xs[0], top, R1 * k, h, "obj hl");
    s.rect(xs[1], top, V1 * k, h, "hatch", { fill: s.hatch });
    s.rect(xs[2], top, O1 * k, h, "obj fill-2");
    s.label(xs[0], top, R1 * k, h, "online, told");
    s.label(xs[2], top, O1 * k, h, "offline");
    s.callout(xs[1] + (V1 * k) / 2, top + 6, xs[1] + 40, top - 14, "filtered");
    s.nb(xs[1] + 40 + 14 + 54, top - 14, 2);

    s.dimH(xs[0], xs[3], top - 34, "F1", { from: [top, top] });
    s.nb(CX + 18, top - 41.5, 1);
    const cy = bot + 20;
    s.chainH(xs, cy, ["R1", "V1", "O1"], { from: [bot, bot, bot, bot], below: true });
    s.dimH(xs[0], xs[2], cy + 30, "N2", { from: [cy, cy], below: true });

    s.viewTitle(CX, cy + 76, "Plan view A · one player's friends list", "Scale 1 friend = 4 px · strip");
    aBottom = cy + 89;
  }

  // ---- Plan view B: one status change, fanned out ----
  s.comment("Plan view B: one status change, fanned out");
  let bBottom;
  {
    const bw = 124, gp = 36, h = 36, out = 40;
    const total = 4 * bw + 3 * gp + out;
    const x0 = CX - total / 2;
    const top = aBottom + 60, mid = top + h / 2, bot = top + h;
    const stages = [
      ["status change", "U1", "obj fill-2"],
      ["privacy filter", "N2 · V1", "obj fill-2"],
      ["session router", "R1 · D1", "obj fill-2"],
      ["edge sockets", "M1", "obj fill-1"],
    ];
    stages.forEach(([name, code, cls], i) => {
      const x = x0 + i * (bw + gp);
      s.rect(x, top, bw, h, cls);
      s.label(x, top, bw, h, name);
      s.text(x + bw / 2, bot + 16, code, "dt", "middle");
      if (i < 3) s.path(`M${x + bw + 3},${mid}H${x + bw + gp - 3}`, "leader", { "marker-end": ah });
    });
    s.nb(x0 + bw / 2 + 24, bot + 12.5, 3);
    const xe = x0 + 4 * bw + 3 * gp;
    s.path(`M${xe + 3},${mid}H${xe + out}`, "leader", { "marker-end": ah });
    s.text(xe + out / 2 + 2, top - 6, "Q1", "dt", "middle");
    s.nb(xe + out / 2 + 18, top - 9.5, 4);

    s.viewTitle(CX, bot + 60, "Plan view B · one status change, fanned out", "Not to scale · per change after coalescing");
    bBottom = bot + 73;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const widths = [44, 200, 210], tw = widths.reduce((a, b) => a + b, 0);
  const t = s.table(CX - tw / 2, bBottom + 56, "Variables · illustrative", [
    ["F1", "friends on the list", "R1+V1+O1 = 120"],
    ["N2", "friends online now", "R1+V1 = 30"],
    ["V1", "online, filtered out", "5"],
    ["R1", "recipients", "N2 − V1 = 25"],
    ["O1", "offline", "F1 − N2 = 90"],
    ["D1", "sessions per recipient", "1.2"],
    ["M1", "pushes per change", "R1 × D1 = 30"],
    ["U1", "changes per player-hour", "6"],
    ["C1", "concurrent players", "1,000,000"],
    ["Q1", "pushes per second", "C1 × U1 × M1 ÷ 3600 = 50,000"],
  ], { widths });
  s.height = Math.ceil(t.y + 30);
  return s.toString();
}
