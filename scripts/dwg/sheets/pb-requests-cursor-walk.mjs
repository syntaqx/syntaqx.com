// Offset and cursor walks over a list sorted newest first: page 1, then
// page 2 after a new row arrives, and the variable table. Embedded in
// content/docs/requests/pagination.md.
import { sheet, widthOf } from "../kit.mjs";

const L = 3; // rows per page, illustrative [1]
const O = L * (2 - 1); // rows an offset skips for page 2
const CELL = 56, CH = 30;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pb-pg", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative limit, to keep the drawing short; the chapter's default is 25 and its maximum 100."],
    [2, "Opaque to clients; the server reads it as WHERE (created_at, id) < K1, which an index answers on any page."],
    [3, "The offset walk returns the same row twice: the new row shifted every row down one. A delete does the opposite and skips a row. The cursor walk is immune to both because it never counts."],
    [0, "Not to scale, one cell per row. Values and formulas are in the table."],
  ], { width: 690 });

  // A row of cells, newest first; returns the x of each cell edge.
  const row = (ids, y, cls) => {
    const x0 = CX - (ids.length * CELL) / 2;
    const xs = ids.map((_, i) => x0 + i * CELL).concat(x0 + ids.length * CELL);
    ids.forEach((id, i) => {
      const c = cls(id, i);
      if (c === "hatch") s.rect(xs[i], y, CELL, CH, "hatch", { fill: s.hatch });
      else s.rect(xs[i], y, CELL, CH, c);
      s.text(xs[i] + CELL / 2, y + CH / 2 + 3.5, id, c === "hatch" ? "tc ko" : "tc", "middle");
    });
    return xs;
  };
  const ids = (n) => Array.from({ length: n }, (_, i) => `i${n - i}`);

  // ---- Plan view: page 1, newest first ----
  s.comment("Plan view: page 1");
  let p1Bottom;
  {
    const top = ny + 52, bot = top + CH;
    const xs = row(ids(9), top, (_, i) => (i < L ? "obj fill-1" : "obj fill-2"));
    s.dimH(xs[0], xs[L], top - 20, "L", { from: [top, top] });
    s.line(xs[L], top - 10, xs[L], bot + 14, "ctr");
    s.text(xs[L], bot + 26, "K1", "dt", "middle");
    s.nb(xs[L] + 16, bot + 22.5, 2);
    const title = "Plan view · page 1, newest first";
    s.viewTitle(CX, bot + 62, title, "Not to scale · one cell per row");
    s.nb(CX + widthOf(title, "vt") / 2 + 14, bot + 58, 1);
    p1Bottom = bot + 75;
  }

  // ---- Plan view: page 2, after i10 arrives ----
  s.comment("Plan view: page 2, offset above, cursor below");
  let p2Bottom;
  {
    const top = p1Bottom + 72, bot = top + CH;
    const xs = row(ids(10), top, (id) => (id === "i10" ? "obj hl" : id === "i7" ? "hatch" : "obj fill-2"));
    const lane = xs[0] - 16;
    // Offset walk: skip O, then return P1.
    const oy = top - 20;
    s.text(lane, oy + 3, "offset", "sl ink", "end");
    s.dimH(xs[0], xs[O], oy, "O", { from: [top, top] });
    s.dimH(xs[O], xs[O + L], oy, "P1", { from: [null, top] });
    s.nb((xs[O] + xs[O + L]) / 2 + 20, oy - 7.5, 3);
    // Cursor walk: the first L rows after K1, which marks i7.
    const k = O + 1; // edge after i7, one cell further down since i10 arrived
    const cy = bot + 22;
    s.text(lane, cy + 3, "cursor", "sl ink", "end");
    s.line(xs[k], top - 6, xs[k], bot + 34, "ctr");
    s.text(xs[k], bot + 46, "K1", "dt", "middle");
    s.dimH(xs[k], xs[k + L], cy, "P2", { from: [null, bot], below: false });
    s.viewTitle(CX, bot + 82, "Plan view · page 2, after a new row arrives", "Not to scale · the same list, one new row at the top");
    p2Bottom = bot + 95;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["L", "rows per page, the limit", String(L)],
    ["O", "rows an offset skips for page 2", `L × (2 − 1) = ${O}`],
    ["K1", "cursor: sort values and id of the last row returned", "(created_at, id) of i7"],
    ["P1", "offset page 2: rows O + 1 to O + L", "rows 4 to 6 = i7, i6, i5"],
    ["P2", "cursor page 2: first L rows after K1", "i6, i5, i4"],
  ];
  const widths = [32, 270, 160];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, p2Bottom + 48, "Variables · illustrative", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
