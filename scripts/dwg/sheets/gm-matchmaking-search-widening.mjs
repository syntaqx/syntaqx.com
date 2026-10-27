// Search widening over a ticket's wait: the skill window as a stepped band
// around the ticket's rating (plan view A), the latency ceiling (plan view
// B), and the variable table. Skill steps from the AWS FlexMatch docs
// example; latency values are illustrative. Embedded in
// content/books/gaming/matchmaking.md.
import { sheet } from "../kit.mjs";

const S = [5, 10, 20]; // max skill distance per step [1]
const T1 = 15, T2 = 25; // step times, s [1]
const MATCH = [19, 8]; // illustrative match: time s, distance levels [3]
const L0 = 60, L1 = 90, T3 = 30; // illustrative [2]
const END = 40; // s shown

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-mw", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Skill steps from a managed matchmaker's documented example: max distance 5, then 10 at 15 s, then 20 at 25 s; the window doubles at each step."],
    [2, "Latency ceilings and T3 are illustrative."],
    [3, "Illustrative: an opponent 8 levels away, found at 19 s, fits once the window is S1."],
    [4, "The matchmaker starts a step when the newest ticket in the incomplete match reaches the wait time; adding a ticket may reset it."],
    [0, "Skill in levels, time in seconds, latency in ms. The drawing carries codes; values are in the table."],
  ], { width: 690 });

  const kt = 14; // 1 s = 14 px
  const x0 = W / 2 - (END * kt) / 2 + 10;
  const X = (t) => x0 + t * kt;

  const timeAxis = (y, ticks) => {
    s.line(X(0), y, X(END), y, "obj");
    for (const t of ticks) {
      s.line(X(t), y - 4, X(t), y + 4, "obj");
      s.text(X(t), y + 16, t === END ? `${t} s` : String(t), "vs", "middle");
    }
  };

  // ---- Plan view A: skill window, 1 level = 4 px ----
  s.comment("Plan view A: skill window of one ticket");
  let aBottom;
  {
    const ks = 4;
    const cy = ny + 40 + S[2] * ks + 10;
    const steps = [[0, T1, S[0]], [T1, T2, S[1]], [T2, END, S[2]]];
    for (const [a, b, h] of steps) s.rect(X(a), cy - h * ks, (b - a) * kt, 2 * h * ks, "obj fill-2");
    s.line(X(0) - 6, cy, X(END) + 6, cy, "ctr");
    s.text(X(0) - 12, cy + 3.5, "R0", "dt", "end");
    steps.forEach(([a, b, h], i) => s.dimV(cy, cy - h * ks, X(a) + 22, `S${i}`, { side: "r" }));

    const [mt, md] = MATCH;
    const mx = X(mt), my = cy - md * ks;
    s.add(`<circle class="obj hl" cx="${mx}" cy="${my}" r="3.5"/>`);
    s.callout(mx + 2, my - 3, mx + 50, cy - S[2] * ks - 10, "match");
    s.nb(mx + 50 + 62, cy - S[2] * ks - 10, 3);

    const axY = cy + S[2] * ks + 18;
    timeAxis(axY, [0, 5, 10, 15, 20, 25, 30, 35, 40]);
    const dy = axY + 44;
    s.dimH(X(0), X(T1), dy, "T1", { from: [axY + 18, axY + 18] });
    s.dimH(X(T1), X(T2), dy, "T2 − T1", { from: [null, axY + 18] });
    s.nb(X(T2) + 14, dy - 7.5, 4);

    s.viewTitle(W / 2, dy + 40, "Plan view A · skill window of one ticket", "Scale 1 s = 14 px · 1 level = 4 px");
    aBottom = dy + 53;
  }

  // ---- Plan view B: latency ceiling, 1 ms = 0.5 px ----
  s.comment("Plan view B: latency ceiling");
  let bBottom;
  {
    const kl = 0.5;
    const base = aBottom + 50 + L1 * kl;
    s.rect(X(0), base - L0 * kl, T3 * kt, L0 * kl, "obj fill-2");
    s.rect(X(T3), base - L1 * kl, (END - T3) * kt, L1 * kl, "obj fill-1");
    s.dimV(base, base - L0 * kl, X(0) + 22, "L0", { side: "r" });
    s.dimV(base, base - L1 * kl, X(END) - 22, "L1", { side: "l" });
    s.callout(X(T3) + 30, base - L1 * kl + 12, X(T3) - 20, base - L1 * kl - 16, "next region joins");
    timeAxis(base, [0, 30, 40]);
    const dy = base + 44;
    s.dimH(X(0), X(T3), dy, "T3", { from: [base + 18, base + 18] });
    s.nb(X(T3) / 2 + X(0) / 2 + 24, dy - 7.5, 2);
    s.viewTitle(W / 2, dy + 40, "Plan view B · latency ceiling", "Scale 1 s = 14 px · 1 ms = 0.5 px · illustrative");
    bBottom = dy + 53;
  }

  s.comment("Variable table");
  const widths = [52, 230, 80];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, bBottom + 50, "Variables", [
    ["R0", "ticket's rating (center line)", "per ticket"],
    ["S0", "max skill distance at start, levels", String(S[0])],
    ["S1", "max distance from T1, levels", String(S[1])],
    ["S2", "max distance from T2, levels", String(S[2])],
    ["T1", "first step, s", String(T1)],
    ["T2", "second step, s", `T1 + 10 = ${T2}`],
    ["T3", "latency step, s", String(T3)],
    ["L0", "ping ceiling before T3, ms", String(L0)],
    ["L1", "ping ceiling after T3, ms", String(L1)],
  ], { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
