// Launch capacity in published figures: traffic against plan, a load-test
// harness for one shard, and game server CPU headroom, with the variable
// table. Embedded in content/books/gaming/game-backend.md.
import { sheet } from "../kit.mjs";

// Published figures [1].
const T1 = 1, W1 = 5 * T1, A1 = 10 * W1; // multiples of plan
const H1 = 10000, N1 = 200; // players per process, processes
const U1 = 70, U2 = 85; // CPU percent

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-bkl", width: W });
  const x0 = 150;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Sources: a cloud provider, Sep 29, 2016; a studio, Dec 15 and May 19, 2020; a publisher, Dec 2021."],
    [2, "About 200 processes ran as containers; the first full 2M run came under two weeks before launch."],
    [3, "Hatched: above U2. U1 to U2 is headroom for waves, such as a whole tournament round starting at once."],
    [0, "Figures dated at source. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view A: launch traffic against plan, 1x = 11 px ----
  s.comment("View A: traffic against plan");
  let aBottom;
  {
    const k = 11, top = ny + 56, h = 16, step = 46;
    const rows = [["target", T1, "T1", "obj fill-2"], ["worst case", W1, "W1", "obj fill-2"], ["actual", A1, "A1", "obj hl"]];
    rows.forEach(([lab, v, code, cls], i) => {
      const y = top + i * step;
      s.rect(x0, y, v * k, h, cls);
      s.text(x0 - 10, y + h / 2 + 3, lab, "sl ink", "end");
      if (i < 2) s.dimH(x0, x0 + v * k, y - 12, code, { from: [y, y] });
    });
    const yA = top + 2 * step + h;
    s.dimH(x0, x0 + A1 * k, yA + 20, "A1", { from: [yA, yA], below: true, hl: true });
    s.viewTitle(x0 + (A1 * k) / 2, yA + 66, "Plan view A · launch traffic against plan", "Scale 1x target = 11 px · bars");
    aBottom = yA + 79;
  }

  // ---- View B: load test, one shard ----
  s.comment("View B: load-test harness");
  let bBottom;
  {
    const top = aBottom + 74, h = 30, bw = 52, g = 6;
    const xs = [0, 1, 2, 3].map((i) => x0 + i * (bw + g));
    const dots = xs[3] + bw + 14;
    const xl = dots + 40;
    [...xs, xl].forEach((x) => {
      s.rect(x, top, bw, h, "obj fill-2");
      s.label(x, top, bw, h, "H1", "dt");
    });
    [0, 12, 24].forEach((d) => s.add(`<circle class="dot" cx="${dots + d}" cy="${top + h / 2}" r="1.8"/>`));
    const xe = xl + bw;
    s.dimH(x0, xe, top - 18, "N1", { from: [top, top] });
    s.nb((x0 + xe) / 2 + 18, top - 25.5, 2);
    s.dimH(x0, xe, top + h + 20, "C1", { from: [top + h, top + h], below: true });
    s.callout(xe, top + h / 2, xe + 26, top + h / 2, "mock shard", { sub: "fake game servers report results" });
    s.viewTitle((x0 + xe) / 2, top + h + 66, "View B · load test, one shard", "Not to scale · harness processes");
    bBottom = top + h + 79;
  }

  // ---- Plan view C: game server CPU, 1% = 5 px ----
  s.comment("View C: CPU headroom");
  let cBottom;
  {
    const k = 5, top = bBottom + 54, h = 30, bot = top + h;
    const x1 = x0 + U1 * k, x2 = x0 + U2 * k, x3 = x0 + 100 * k;
    s.rect(x0, top, x1 - x0, h, "obj fill-1");
    s.rect(x1, top, x2 - x1, h, "obj fill-2");
    s.rect(x2, top, x3 - x2, h, "hatch", { fill: s.hatch });
    s.label(x0, top, x1 - x0, h, "planned load");
    s.nb((x2 + x3) / 2, top - 12, 3);
    s.text(x0 - 8, top + h / 2 + 3.5, "0", "dt", "end");
    s.text(x3 + 8, top + h / 2 + 3.5, "100", "dt");
    s.dimH(x0, x1, bot + 20, "U1", { from: [bot, bot], below: true });
    s.dimH(x0, x2, bot + 46, "U2", { from: [null, bot], below: true });
    s.viewTitle((x0 + x3) / 2, bot + 96, "Plan view C · game server CPU headroom", "Scale 1% = 5 px · one server");
    cBottom = bot + 109;
  }

  s.comment("Variable table");
  const tb = s.table(40, cBottom + 50, "Variables · published figures", [
    ["T1", "planned traffic, the target (location-based mobile game)", "1x"],
    ["W1", "worst-case estimate", "5 × T1 = 5x"],
    ["A1", "actual launch traffic", "10 × W1 = 50 × T1 = 50x"],
    ["H1", "simulated players per harness process, 4 CPUs (shooter)", "10,000"],
    ["N1", "harness processes", "C1 ÷ H1 = 200"],
    ["C1", "concurrent players per shard, the goal", "H1 × N1 = 2,000,000"],
    ["U1", "game server CPU target, % (MOBA tournament mode)", "70"],
    ["U2", "CPU where players see latency and missed requests, %", "85"],
    ["S1", "game starts per minute", "1.5 × p99 of peak starts"],
    ["Q1", "MMO login queue cap per logical data center", "17,000"],
  ]);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
