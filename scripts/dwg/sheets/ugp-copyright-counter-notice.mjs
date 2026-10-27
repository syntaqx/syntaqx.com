// The DMCA counter-notice restore window as a dimensional sheet: material
// removed on a notice, a valid counter-notice at T0, the earliest (R1) and
// latest (R2) restore after it in business days, the window between them
// in the accent, and the claimant's court action as the dashed exit.
// Embedded in content/books/user-generated-platforms/copyright.md
// (Counter-Notices).
import { sheet, widthOf } from "../kit.mjs";

// 17 U.S.C. 512(g)(2)(C): business days after receipt of the counter-notice.
const R1 = 10; // not less than
const R2 = 14; // nor more than

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-cr", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Day 0 is receipt of a valid counter-notice; business days need a holiday calendar and a time zone, stored with the window."],
    [2, "Promptly forward a copy to the claimant, saying the material will be restored in 10 business days."],
    [3, "Restore inside the window unless the agent first receives notice that the claimant has filed a court action."],
    [0, "Business days. The drawing carries codes; values are in the table. Removal keeps the media so it can be restored."],
  ], { width: 690 });

  // ---- Plan view: 1 business day = 34 px after T0 ----
  s.comment("Plan view: restore window after a counter-notice");
  const k = 30, laneX = 136;
  const pre = 70, brk = 14; // the takedown, before the break, not to scale
  const xTk = laneX + 22;
  const x0 = xTk + pre + brk + 26; // T0
  const X = (d) => x0 + d * k;
  const xEnd = X(R2) + 34;
  const axY = ny + 46, h = 24;
  const brk0 = xTk + pre, brk1 = brk0 + brk;

  const ticks = [[xTk, "takedown"], [X(0), "T0"], [X(R1), `T0+${R1}`], [X(R2), `T0+${R2}`]];
  const tl = s.timeline({ x1: xTk, x2: xEnd, y: axY, breaks: [[brk0, brk1]], ticks, laneX, h });
  s.nb(X(0) + 14, axY - 13.5, 1);

  // Material: down from the takedown, restored inside the window.
  const y1 = axY + 26;
  tl.lane(y1, "material");
  tl.bar(y1, xTk, X(R1), "obj fill-1");
  s.label(X(0), y1, X(R1) - X(0), h, "removed, media kept");
  s.rect(X(R1), y1, X(R2) - X(R1), h, "obj hl");
  s.label(X(R1), y1, X(R2) - X(R1), h, "restore", "sl hl");
  s.rect(X(R2), y1, xEnd - X(R2), h, "obj fill-2");
  s.label(X(R2), y1, xEnd - X(R2), h, "up");
  s.nb(X(R1) + (X(R2) - X(R1)) / 2, y1 - 10, 3);

  // Claimant: the forwarded copy at T0.
  const y2 = y1 + h + 72;
  tl.lane(y2, "claimant");
  const fw = widthOf("copy forwarded", "sl") + 24;
  s.rect(X(0), y2, fw, h, "obj fill-2");
  s.label(X(0), y2, fw, h, "copy forwarded");
  s.nb(X(0) + fw + 12, y2 + h / 2, 2);

  // Court action: the exit that keeps the material down.
  const y3 = y2 + h + 30;
  tl.lane(y3, "court action");
  s.rect(X(0), y3, X(R2) - X(0), h, "slot");
  s.label(X(0), y3, X(R2) - X(0), h, "claimant's notice of suit stops the restore", "sl");

  // Dimensions under the material lane: R1, R2, and the window.
  const dA = y1 + h + 18, dB = dA + 22;
  s.dimH(X(0), X(R1), dA, "R1", { from: [y1 + h, y1 + h], below: true });
  s.dimH(X(R1), X(R2), dA, "W1", { from: [y1 + h, y1 + h], below: true, hl: true });
  s.dimH(X(0), X(R2), dB, "R2", { from: [y1 + h, y1 + h], below: true });

  // T0 runs through every lane.
  s.line(X(0), axY + 6, X(0), y3 + h + 10, "ctr");

  const vy = y3 + h + 46;
  s.viewTitle((laneX - widthOf("court action", "sl") + xEnd) / 2, vy, "Plan view · one counter-notice", `Scale 1 business day = ${k} px after T0 · not to scale before it`);

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["T0", "receipt of a valid counter-notice", "day 0"],
    ["R1", "earliest restore: not less than", `${R1} business days`],
    ["R2", "latest restore: nor more than", `${R2} business days`],
    ["W1", "restore window", "R1 to R2 after T0"],
  ];
  const widths = [40, 300, 130];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 52, "Variables · counter-notice window", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
