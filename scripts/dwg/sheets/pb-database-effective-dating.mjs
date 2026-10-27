// Effective-dated rows of item_prices for one item and region on a day
// axis, the closed-open boundary between two rows in detail, and the row
// table. Embedded in content/docs/database/temporal-data.md.
import { sheet, el, f, widthOf } from "../kit.mjs";

// Days from 2026-10-01. V1..V3 are whole months; V4 is open, drawn 53 days.
const LEN = [31, 30, 31];
const OPEN = 53;
const TODAY = 25; // 2026-10-26
const ASOF = 35; // 2026-11-05
const REJECT = [50, 70]; // an insert across V2 and V3 [2]

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pb-tmp", width: W });
  const CX = W / 2;
  const ah = `url(#${s.id("ah")})`;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative prices for one item in one region; ranges follow the chapter's valid_during and [) rules."],
    [2, "The exclusion constraint rejects any row whose valid_during overlaps another for the same item and region."],
    [3, "An open upper bound means until further notice: upper_inf(valid_during) is true, with no sentinel date."],
    [4, "The as-of moment is a parameter: valid_during @> Q1 returns V2 whenever the query runs."],
    [5, "Closed-open: V1's excluded upper bound equals V2's included lower bound, so V1 -|- V2: no gap, no shared day."],
    [0, "Amounts in cents, USD. The drawing carries codes; ranges, amounts and dates are in the table."],
  ], { width: 690 });

  // ---- Plan view: item_prices, 1 day = 4 px ----
  s.comment("Plan view: item_prices");
  let planBottom;
  {
    const k = 4;
    const total = LEN.reduce((a, b) => a + b, 0) + OPEN;
    const x0 = CX - (total * k) / 2;
    const X = (d) => x0 + d * k;
    const xs = [...LEN, OPEN].reduce((acc, d) => [...acc, acc[acc.length - 1] + d], [0]).map(X);
    const top = ny + 62, h = 32, bot = top + h;
    const states = ["current", "scheduled", "scheduled", "scheduled · open end"];
    xs.slice(0, -1).forEach((x, i) => {
      s.rect(x, top, xs[i + 1] - x, h, i === 0 ? "obj fill-1" : "obj fill-2");
      s.label(x, top, xs[i + 1] - x, h, states[i]);
    });
    // The open end continues past the drawn bar.
    s.add(el("path", { class: "leader", d: `M${f(xs[4])},${f(top + h / 2)}H${f(xs[4] + 24)}`, "marker-end": ah }));

    // Today and the as-of read, above the bars.
    const ly = top - 30;
    s.line(X(TODAY), ly - 6, X(TODAY), bot + 8, "ctr");
    s.text(X(TODAY) - 5, ly, "today", "sl", "end");
    s.add(el("path", { class: "dim", d: `M${f(X(ASOF))},${f(ly - 6)}V${f(top)}`, "marker-end": ah }));
    s.text(X(ASOF) + 5, ly, "Q1", "dt", "start");
    s.nb(X(ASOF) + 30, ly - 3.5, 4);

    s.detailRef(xs[1], top + h / 2, 14, "detail A", xs[1] + 66, top - 12);

    // Chain: one row per period; V4 has no right extension.
    const cy = bot + 20;
    s.chainH(xs.slice(0, 4), cy, ["V1", "V2", "V3"], { from: xs.slice(0, 4).map(() => bot), below: true });
    s.line(xs[3], bot + 3, xs[3], cy + 4, "ext");
    s.add(el("path", { class: "dim", d: `M${f(xs[3])},${f(cy)}H${f(xs[4] + 24)}`, "marker-start": ah }));
    s.text((xs[3] + xs[4]) / 2, cy + 12, "V4", "dt", "middle");
    s.nb((xs[3] + xs[4]) / 2 + 22, cy + 8.5, 3);

    // A rejected insert across V2 and V3.
    const ry = cy + 30, rh = 18;
    s.rect(X(REJECT[0]), ry, X(REJECT[1]) - X(REJECT[0]), rh, "hatch", { fill: s.hatch });
    s.text(X(REJECT[1]) + 10, ry + rh / 2 + 3, "rejected insert", "sl ink");
    s.nb(X(REJECT[1]) + 114, ry + rh / 2, 2);

    const t1 = "Plan view · item_prices, one item and region";
    s.viewTitle(CX, ry + rh + 44, t1, "Scale 1 day = 4 px · timeline · illustrative amounts");
    s.nb(CX + widthOf(t1, "vt") / 2 + 14, ry + rh + 40, 1);
    planBottom = ry + rh + 57;
  }

  // ---- Detail A: the V1 / V2 boundary, 1 day = 60 px ----
  s.comment("Detail A: closed-open boundary");
  const rowTop = planBottom + 50;
  let detailBottom;
  {
    const k = 60, b = 196, h = 24;
    const y1 = rowTop + 40, y2 = y1 + h + 16;
    s.rect(b - 2 * k, y1, 2 * k, h, "obj fill-1");
    s.rect(b, y2, 2 * k, h, "obj fill-2");
    s.line(b - k, y1, b - k, y1 + h, "ext");
    s.line(b + k, y2, b + k, y2 + h, "ext");
    s.label(b - 2 * k, y1, k, h, "V1");
    s.label(b + k, y2, k, h, "V2");
    s.line(b, y1 - 26, b, y2 + h + 28, "ctr");
    s.add(el("circle", { class: "nb", cx: b, cy: y1 + h / 2, r: 3.5 }));
    s.add(el("circle", { class: "dot", cx: b, cy: y2 + h / 2, r: 3.5 }));
    s.text(b + 10, y1 + h / 2 + 3, "upper excluded", "sl ink");
    s.text(b - 10, y2 + h / 2 + 3, "lower included", "sl ink", "end");
    s.dimH(b - k, b, y1 - 16, "D1", { from: [y1, y1] });
    s.dimH(b, b + k, y2 + h + 18, "D2", { from: [y2 + h, y2 + h], below: true });
    s.text(b + 5, y1 - 22, "B1", "dt", "start");
    s.nb(b + 26, y1 - 25.5, 5);
    s.viewTitle(b, y2 + h + 66, "Detail A · the V1 / V2 boundary", "Scale 15:1 · 1 day = 60 px · closed-open");
    detailBottom = y2 + h + 79;
  }

  // ---- Row table ----
  s.comment("Row table");
  const rows = [
    ["V1", "[2026-10-01, 2026-11-01) · current", "2400 · 31 d"],
    ["V2", "[2026-11-01, 2026-12-01) · scheduled", "1499 · 30 d"],
    ["V3", "[2026-12-01, 2027-01-01) · scheduled", "2400 · 31 d"],
    ["V4", "[2027-01-01,) · scheduled", "2600 · open"],
    ["Q1", "as-of moment, lands in V2", "2026-11-05"],
    ["D1", "last day in V1", "2026-10-31"],
    ["D2", "first day in V2", "2026-11-01"],
    ["B1", "upper(V1) = lower(V2)", "2026-11-01"],
  ];
  const widths = [32, 196, 96];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W - 32 - tw, rowTop + 16, "Rows · today 2026-10-26", rows, { widths });
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
