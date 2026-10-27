// One 60 Hz frame as a plan view on a time axis, the input latch in detail,
// two frames pipelined, and the variable table. Embedded in
// content/books/gaming/building-an-engine.md (The Frame Budget).
import { sheet } from "../kit.mjs";

// Illustrative split in ms [1]; F1 = 1000 / 60.
const T = [0.5, 4, 3, 8, 1.17];
const CPU = T[0] + T[1] + T[2]; // 7.50
const GPU = T[3] + T[4]; // 9.17

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-fb", width: W, });
  const CX = W / 2;
  let planBottom, pipeBottom;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative split, not a measurement: real budgets come from profiling the target hardware."],
    [2, "Input that lands after the latch is read on the next frame, up to one more frame of latency."],
    [3, "A serial view of one frame's critical path; the pipelined view shows CPU and GPU overlapping."],
    [4, "The CPU builds frame N+1 while the GPU draws frame N: the slower side sets P1, the other waits W1."],
    [0, "Values in ms. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: one frame, 1 ms = 30 px ----
  s.comment("Plan view: one frame");
  {
    const k = 30;
    const x0 = CX - ((T.reduce((a, b) => a + b, 0)) * k) / 2;
    const xs = T.reduce((acc, t) => [...acc, acc[acc.length - 1] + t * k], [x0]);
    const top = ny + 50, h = 30, bot = top + h;
    const fills = ["fill-2", "fill-2", "fill-2", "fill-1", "fill-2"];
    T.forEach((_, i) => s.rect(xs[i], top, xs[i + 1] - xs[i], h, `obj ${fills[i]}`));
    s.label(xs[1], top, xs[2] - xs[1], h, "simulation");
    s.label(xs[2], top, xs[3] - xs[2], h, "render submit");
    s.label(xs[3], top, xs[4] - xs[3], h, "GPU");
    s.callout((xs[4] + xs[5]) / 2, top + h / 2, xs[5] + 18, top + h / 2, "present");

    const fy = top - 22;
    s.dimH(xs[0], xs[5], fy, "F1", { from: [top, top], hl: true });
    s.nb(CX + 16, fy - 7.5, 1);
    s.chainH(xs, bot + 20, ["T1", "T2", "T3", "T4", "T5"], { from: xs.map(() => bot), below: true });

    s.detailRef((xs[0] + xs[1]) / 2, top + h / 2, 15, "detail A", xs[0] - 30, top - 6);
    s.viewTitle(CX, bot + 64, "Plan view · one frame at 60 Hz", "Scale 1 ms = 30 px · timeline · serial");
    s.nb(CX + 128, bot + 60, 3);
    planBottom = bot + 77;
  }

  // ---- Plan view: two frames pipelined, 1 ms = 20 px ----
  s.comment("Plan view: two frames, pipelined");
  {
    const k = 20;
    const total = CPU + GPU + GPU;
    const x0 = CX - (total * k) / 2;
    const X = (ms) => x0 + ms * k;
    const cpuY = planBottom + 56, gpuY = cpuY + 32, h = 24;
    s.text(X(0) - 10, cpuY + h / 2 + 3, "CPU", "sl ink", "end");
    s.text(X(0) - 10, gpuY + h / 2 + 3, "GPU", "sl ink", "end");
    s.rect(X(0), cpuY, CPU * k, h, "obj fill-2");
    s.rect(X(CPU), cpuY, CPU * k, h, "obj fill-2");
    s.rect(X(2 * CPU), cpuY, (GPU - CPU) * k, h, "slot");
    s.rect(X(CPU), gpuY, GPU * k, h, "obj fill-1");
    s.rect(X(CPU + GPU), gpuY, GPU * k, h, "obj fill-1");
    s.label(X(0), cpuY, CPU * k, h, "frame N");
    s.label(X(CPU), cpuY, CPU * k, h, "frame N+1");
    s.label(X(CPU), gpuY, GPU * k, h, "frame N");
    s.label(X(CPU + GPU), gpuY, GPU * k, h, "frame N+1");

    const ty = cpuY - 16;
    s.dimH(X(0), X(CPU), ty, "T1+T2+T3", { from: [cpuY, cpuY] });
    s.dimH(X(2 * CPU), X(CPU + GPU), ty, "W1", { from: [cpuY, cpuY] });
    const by = gpuY + h + 20;
    s.dimH(X(0), X(CPU + GPU), by, "L1", { from: [cpuY + h, gpuY + h], below: true });
    s.dimH(X(CPU + GPU), X(total), by, "P1", { from: [null, gpuY + h], below: true });

    s.viewTitle(CX, by + 44, "Plan view · two frames, pipelined", "Scale 1 ms = 20 px · timeline · CPU and GPU overlap");
    s.nb(CX + 136, by + 40, 4);
    pipeBottom = by + 57;
  }

  // ---- Detail A: the input latch, 10:1 (1 ms = 330 px) ----
  s.comment("Detail A: input latch");
  const rowTop = pipeBottom + 44;
  {
    const k = 330, x0 = 52, top = rowTop + 16, h = 36;
    const latch = x0 + T[0] * k;
    s.rect(x0, top, latch - x0, h, "obj fill-2");
    s.rect(latch, top, 110, h, "hatch", { fill: s.hatch });
    s.line(latch, top - 10, latch, top + h + 8, "ctr");
    s.text(latch, top - 14, "latch", "sl ink", "middle");
    s.nb(latch + 30, top - 17.5, 2);
    for (const x of [77, 117, 172, 254, 297]) s.add(`<circle class="dot" cx="${x}" cy="${top + 12}" r="2.2"/>`);
    s.text((x0 + latch) / 2, top + 28, "device events", "sl ink", "middle");
    s.text(latch + 55, top + 28, "read next frame", "sl ink ko", "middle");
    s.dimH(x0, latch, top + h + 20, "T1", { from: [top + h, top + h], below: true });
    s.viewTitle((x0 + latch + 110) / 2, top + h + 64, "Detail A · input latch", "Scale 10:1 · 1 ms = 330 px");
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(400, rowTop + 16, "Variables · ms", [
    ["F1", "frame at 60 Hz", "1000 ÷ 60 = 16.67"],
    ["T1", "input", "0.50"],
    ["T2", "simulation", "4.00"],
    ["T3", "render submit", "3.00"],
    ["T4", "GPU", "8.00"],
    ["T5", "present", "1.17"],
    ["L1", "latency, input to present", "T1+…+T5 = 16.67"],
    ["P1", "pipelined frame interval", "max(T1+T2+T3, T4+T5) = 9.17"],
    ["W1", "CPU waits for GPU", "P1 − (T1+T2+T3) = 1.67"],
  ], { rowH: 15 });
  s.height = Math.ceil(tb.y + 30);

  return s.toString();
}
