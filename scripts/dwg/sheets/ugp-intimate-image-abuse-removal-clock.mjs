// The TAKE IT DOWN Act removal clock as a dimensional sheet: an incomplete
// request logged before the break, the valid request at T0, and the duties
// that share the 48 hours (remove the depiction, sweep identical copies,
// review near matches) as windows under one accented dimension D1, with the
// platform's own hash list blocking re-uploads past it. Embedded in
// content/books/user-generated-platforms/intimate-image-abuse.md (The
// Identical-Copy Sweep).
import { sheet, widthOf } from "../kit.mjs";

const D1 = 48; // hours, Pub. L. 119-12 Sec. 3(a)(3)

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-ii", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The clock runs from receipt of a valid request: signature, the depiction located, a good-faith statement, contact details."],
    [2, "Remove the depiction and make reasonable efforts on known identical copies: both duties sit inside the 48 hours."],
    [3, "Near matches go to a review lane inside the same 48 hours, not to automatic removal."],
    [0, "Hours. Only the outer bound is set by law: as soon as possible, not later than D1. Windows are drawn to it."],
  ], { width: 690 });

  // ---- Plan view: 1 h = 8.5 px after T0 ----
  s.comment("Plan view: one valid request");
  const k = 8.5, laneX = 150;
  const xPre = laneX + 22, pre = 60, brk = 14;
  const x0 = xPre + pre + brk + 26;
  const X = (hr) => x0 + hr * k;
  const xEnd = X(D1) + 44;
  const axY = ny + 46, h = 24, gap = 14;

  const ticks = [[xPre, "incomplete"], [X(0), "T0"], [X(D1), `T0+${D1} h`]];
  const tl = s.timeline({ x1: xPre, x2: xEnd, y: axY, breaks: [[xPre + pre, xPre + pre + brk]], ticks, laneX, h });
  s.nb(X(0) + 14, axY - 13.5, 1);

  // Request: the incomplete one is logged, the corrected one starts the clock.
  let y = axY + 26;
  tl.lane(y, "request");
  s.rect(xPre, y, pre, h, "slot");
  s.label(xPre, y, pre, h, "logged", "sl");
  s.rect(X(0), y, X(D1) - X(0), h, "obj fill-2");
  s.label(X(0), y, X(D1) - X(0), h, "valid: clock running");

  const lanes = [
    ["depiction", "remove the reported items", 2],
    ["exact copies", "same file hash: removed everywhere, derived stores purged", null],
    ["near matches", "review lane, then removed", 3],
  ];
  for (const [lane, label, nb] of lanes) {
    y += h + gap;
    tl.lane(y, lane);
    s.rect(X(0), y, X(D1) - X(0), h, "slot");
    s.label(X(0), y, X(D1) - X(0), h, label, "sl ink");
    if (nb) s.nb(X(D1) - 14, y + h / 2, nb);
  }

  // The own list keeps working after the request closes.
  y += h + gap;
  tl.lane(y, "own hash list");
  s.rect(X(0), y, xEnd - X(0), h, "obj fill-1");
  s.label(X(0), y, xEnd - X(0), h, "hashes added: re-uploads blocked");

  // The dimension the sheet is about.
  const dy = y + h + 22;
  s.dimH(X(0), X(D1), dy, "D1", { from: [y + h, y + h], below: true, hl: true });
  s.line(X(0), axY + 6, X(0), y + h + 8, "ctr");

  const vy = dy + 50;
  s.viewTitle((laneX - widthOf("own hash list", "sl") + xEnd) / 2, vy, "Plan view · one valid removal request", `Scale 1 h = ${k} px after T0 · not to scale before it`);

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["T0", "receipt of a valid removal request", "hour 0"],
    ["D1", "remove the depiction and known identical copies", `as soon as possible, ${D1} h at most`],
  ];
  const widths = [40, 290, 190];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 52, "Variables · TAKE IT DOWN Act Sec. 3(a)(3)", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
