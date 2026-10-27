// Renaming users.name to full_name by expand and contract: three lanes
// (old column, new column, backfill job) over six deploys, and the step
// table. Embedded in content/docs/database/zero-downtime-migrations.md.
import { sheet, text, widthOf } from "../kit.mjs";

// Lane spans in deploy positions (d1 = 1 ... d6 = 6); 0.5 is before d1,
// END is past d6 where full_name carries on.
const END = 6.7;
const LANES = [
  ["name", [[0.5, 4, "obj fill-1", "read + write"], [4, 5, "obj fill-2", "write only"], [5, 6, "slot", "unused"]]],
  ["full_name", [[1, 2, "slot", "unused"], [2, 4, "obj fill-2", "write only"], [4, END, "obj hl", "read + write"]]],
  ["backfill", [[3, 4, "obj fill-1", "batched job"]]],
];

// A table with any columns, styled like the kit's variable table.
function grid(s, x, y, title, head, rows, ws, rowH = 15) {
  const all = [head, ...rows];
  const w = ws.reduce((a, b) => a + b, 0), h = all.length * rowH;
  s.add(text(x, y - 7, title, "vt"));
  s.rect(x, y, w, h, "tbl");
  for (let i = 1; i < all.length; i++) s.line(x, y + i * rowH, x + w, y + i * rowH, "tbl");
  let cx = x;
  for (const wj of ws.slice(0, -1)) s.line((cx += wj), y, cx, y + h, "tbl");
  all.forEach((r, i) => {
    let c = x;
    r.forEach((v, j) => {
      s.add(text(c + 6, y + i * rowH + rowH / 2 + (i ? 3.2 : 2.7), v, i ? "tc" : "th"));
      c += ws[j];
    });
  });
  return { y: y + h, width: w };
}

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pb-zdm", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Old and new code share one schema during every deploy, so each step has to work with the code before it."],
    [2, "Resumable, keyed on WHERE full_name IS NULL; count the rows that still differ, and contract only at zero."],
    [3, "The DROP ships alone, at least one deploy cycle after d5 removed the last code that touched name."],
    [4, "Each deploy runs on the schema the deploy before it left behind, so any deploy rolls back to the one before it."],
    [0, "Not to scale: one deploy per step, evenly spaced. Schema changes, reads and writes are in the table."],
  ], { width: 690 });

  // ---- Plan view: three lanes over six deploys ----
  s.comment("Plan view: lanes over deploys");
  let planBottom;
  {
    const step = 100, h = 24, pitch = 40;
    const labelW = Math.max(...LANES.map(([l]) => widthOf(l, "sl"))) + 14;
    const x0 = (W + labelW - (END - 0.5) * step) / 2;
    const X = (d) => x0 + (d - 0.5) * step;
    const top = ny + 58;
    const laneY = (i) => top + i * pitch;
    const bot = laneY(LANES.length - 1) + h;

    // Deploy ticks, behind the lanes.
    for (let d = 1; d <= 6; d++) {
      s.line(X(d), top - 12, X(d), bot + 8, "ctr");
      s.text(X(d), top - 18, `d${d}`, "dt", "middle");
    }
    s.nb(X(1) - 24, top - 21.5, 1);

    LANES.forEach(([name, spans], i) => {
      const y = laneY(i);
      s.text(X(0.5) - 14, y + h / 2 + 3, name, "sl ink", "end");
      for (const [a, b, cls, l] of spans) {
        s.rect(X(a), y, X(b) - X(a), h, cls);
        s.label(X(a), y, X(b) - X(a), h, l);
      }
    });
    s.nb(X(4) + 12, laneY(2) + h / 2, 2);

    // W1: the wait before the drop.
    const wy = bot + 26;
    s.dimH(X(5), X(6), wy, "W1", { from: [bot + 8, bot + 8], below: true });
    s.nb(X(5.5) + 22, wy + 8.5, 3);

    const t1 = "Plan view · renaming users.name to full_name";
    s.viewTitle(W / 2, wy + 52, t1, "Not to scale · timeline · one deploy per step");
    s.nb(W / 2 + widthOf(t1, "vt") / 2 + 9, wy + 48, 4);
    planBottom = wy + 65;
  }

  // ---- Step table ----
  s.comment("Step table");
  const ws = [44, 120, 236, 112, 112];
  const tw = ws.reduce((a, b) => a + b, 0);
  const tb = grid(s, (W - tw) / 2, planBottom + 60, "Steps · from the chapter's rename example", ["code", "step", "schema or data", "reads", "writes"], [
    ["d1", "expand", "ADD COLUMN full_name", "name", "name"],
    ["d2", "write both", "none", "name", "both"],
    ["d3", "backfill", "UPDATE in batches of 1,000", "name", "both"],
    ["d4", "read new", "none", "full_name", "both"],
    ["d5", "stop writing old", "none", "full_name", "full_name"],
    ["W1", "wait", "at least 1 deploy cycle", "full_name", "full_name"],
    ["d6", "contract", "DROP COLUMN name", "full_name", "full_name"],
  ], ws);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
