// Fixed timestep with an accumulator: four variable render frames over seven
// fixed simulation steps with the carry at each frame end, frame 3's
// interpolation in detail, and the variable table. Embedded in
// content/books/gaming/building-an-engine.md.
import { sheet } from "../kit.mjs";

// Illustrative values in ms [1].
const DT = 10;
const R = [12, 20, 14, 24];

// Accumulator per frame: steps run, carry, alpha.
const frames = [];
{
  let a = 0;
  for (const r of R) {
    const n = Math.floor((a + r) / DT);
    a = a + r - n * DT;
    frames.push({ n, a, alpha: a / DT });
  }
}
const E1 = R.reduce((x, y) => x + y, 0); // 70
const N1 = frames.reduce((x, fr) => x + fr.n, 0); // 7
const P3 = (N1 - frames[3].n) * DT - DT; // previous state at frame 3: 30
const C3 = P3 + DT; // 40
const D3 = P3 + frames[2].alpha * DT; // 36

const list = (k) => frames.map(k).join(" · ");

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-ts", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative: dt = 10 (100 Hz) and frame lengths chosen so the arithmetic is easy to follow."],
    [2, "Clamp the frame time before adding it (Fiedler uses 0.25 s), so one long stall can't demand endless steps."],
    [3, "The drawn state is always one dt behind real time: 46 - 36 = 10."],
    [0, "Values in ms. The drawing carries codes; values and formulas are in the table."],
  ], { width: 696 });

  // ---- Plan view: four frames, 1 ms = 8 px ----
  s.comment("Plan view: four frames, fixed dt");
  let planBottom;
  {
    const k = 8;
    const x0 = CX - (E1 * k) / 2;
    const X = (ms) => x0 + ms * k;
    const ends = R.reduce((acc, r) => [...acc, acc[acc.length - 1] + r], [0]);
    const h = 30;
    const rY = ny + 82, sY = rY + h + 40, cY = sY + h + 22, cH = 18;

    // Row labels.
    s.text(x0 - 12, rY + h / 2 + 3, "render", "sl ink", "end");
    s.text(x0 - 12, sY + h / 2 + 3, "sim", "sl ink", "end");
    s.text(x0 - 12, cY + cH / 2 + 3, "carry", "sl ink", "end");

    // Render frames, variable length.
    R.forEach((_, i) => {
      s.rect(X(ends[i]), rY, R[i] * k, h, "obj fill-2");
      s.label(X(ends[i]), rY, R[i] * k, h, `frame ${i + 1}`);
    });
    s.chainH(ends.map(X), rY - 16, ["R1", "R2", "R3", "R4"], { from: ends.map(() => rY) });
    s.dimH(X(0), X(E1), rY - 42, "E1", { from: [rY - 20, rY - 20] });
    s.nb(CX + 18, rY - 49.5, 1);
    s.nb(X(E1) + 16, rY + h / 2, 2);

    // Simulation steps, fixed length.
    for (let i = 0; i < N1; i++) {
      s.rect(X(i * DT), sY, DT * k, h, "obj fill-1");
      s.label(X(i * DT), sY, DT * k, h, String(i + 1));
    }
    s.dimH(X(0), X(DT), sY - 14, "dt", { from: [sY, sY] });

    // Frame ends: where each frame is drawn.
    ends.slice(1).forEach((t) => s.line(X(t), rY + h + 4, X(t), cY + cH + 6, "ctr"));

    // Carry at each frame end, hatched back from the frame end.
    frames.forEach((fr, i) => {
      const t = ends[i + 1];
      if (fr.a > 0) s.rect(X(t - fr.a), cY, fr.a * k, cH, "hatch", { fill: s.hatch });
      if (i < 3) s.text(X(t - fr.a / 2), cY + cH + 16, `A${i + 1}`, "dt", "middle");
    });
    s.text(X(E1) + 10, cY + cH / 2 + 3.5, "A4", "dt");
    const t3 = ends[3];
    s.detailRef(X(t3 - frames[2].a / 2), cY + cH / 2, 30, "detail A", X(t3) + 40, cY + cH + 26);

    const bot = cY + cH + 30;
    s.viewTitle(CX, bot + 44, "Plan view · four frames, fixed dt", "Scale 1 ms = 8 px · timeline · illustrative");
    planBottom = bot + 57;
  }

  // ---- Detail A: drawing frame 3, 1 ms = 30 px ----
  s.comment("Detail A: interpolation at the end of frame 3");
  const rowTop = planBottom + 50;
  let detailBottom;
  {
    const k = 30, x0 = 62;
    const X = (t) => x0 + (t - P3) * k;
    const y = rowTop + 40;
    s.line(X(P3), y, X(C3), y, "obj");
    s.add(`<circle class="dot" cx="${X(P3)}" cy="${y}" r="3"/>`, `<circle class="dot" cx="${X(C3)}" cy="${y}" r="3"/>`);
    s.add(`<circle class="obj hl" cx="${X(D3)}" cy="${y}" r="5"/>`);
    s.text(X(P3), y - 14, "previous", "sl ink", "middle");
    s.text(X(D3), y - 14, "drawn", "sl ink", "middle");
    s.text(X(C3), y - 14, "current", "sl ink", "middle");
    s.nb(X(D3) + 30, y - 17, 3);
    s.text(X(P3), y + 18, "P3", "dt", "middle");
    s.text(X(D3), y + 18, "D3", "dt", "middle");
    s.text(X(C3), y + 18, "C3", "dt", "middle");
    const d1 = y + 38, d2 = d1 + 26;
    s.dimH(X(P3), X(D3), d1, "α3 × dt", { from: [y + 24, y + 24], hl: true });
    s.dimH(X(P3), X(C3), d2, "dt", { from: [d1 + 4, y + 24] });
    s.viewTitle((X(P3) + X(C3)) / 2, d2 + 44, "Detail A · drawing frame 3", "Scale 1 ms = 30 px · time axis");
    detailBottom = d2 + 57;
  }

  s.comment("Variable table");
  const tb = s.table(400, rowTop + 16, "Variables · ms, illustrative", [
    ["dt", "simulation step, 100 Hz", String(DT)],
    ...R.map((r, i) => [`R${i + 1}`, `render frame ${i + 1}`, String(r)]),
    ["E1", "elapsed", `R1+…+R4 = ${E1}`],
    ["n1…n4", "steps, ⌊(Ai−1 + Ri) ÷ dt⌋", list((fr) => fr.n)],
    ["A1…A4", "carry, Ai−1 + Ri − ni × dt", list((fr) => fr.a)],
    ["α1…α4", "alpha, Ai ÷ dt", list((fr) => fr.alpha.toFixed(1))],
    ["N1", "steps run", `n1+…+n4 = ${N1}`],
    ["E1", "check", `N1 × dt + A4 = ${N1 * DT + frames[3].a}`],
    ["P3", "previous state, frame 3", String(P3)],
    ["C3", "current state, frame 3", String(C3)],
    ["D3", "drawn", `P3 + α3 × dt = ${D3}`],
  ]);
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
