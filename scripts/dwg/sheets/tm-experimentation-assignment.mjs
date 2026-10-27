// Experiment assignment: a hash space split into holdout, control and
// treatment buckets; the users observed in each arm; the holdout and the
// sample-ratio gap in detail; and the variable table with the chi-square
// test. Embedded in content/docs/telemetry/experimentation.md.
import { sheet, widthOf } from "../kit.mjs";

// Buckets are illustrative [4]; user counts from Fabijan et al. [3].
const H = 200, C = 4900, T = 4900;
const N = H + C + T; // 10,000
const NC = 821588, NT = 815482;
const DN = NC - NT; // 6,106
const X2 = (DN * DN) / (NC + NT); // 22.77, chi-square vs 50/50 with 1 df

const fmt = (n) => n.toLocaleString("en-US");
const pct = (n) => ((100 * n) / (NC + NT)).toFixed(2);

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "tm-ex", width: W });
  const CX = W / 2;
  const ah = `url(#${s.id("ah")})`;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "bucket = hash(seed + unit id) mod 10,000: the same id always lands in the same bucket."],
    [2, "Holdout buckets see no launched features; 1% to 2% is the size one experimentation vendor recommends."],
    [3, "Fabijan et al., KDD 2019: a 50.2/49.8 split that chance explains less than 1 in 500,000."],
    [4, "Bucket counts are illustrative. A gap of 0.37 points is invisible in View B and decisive."],
    [0, "The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- View A: hash buckets, 1,000 buckets = 64 px ----
  s.comment("View A: hash buckets");
  const kb = 64 / 1000;
  const bx0 = CX - (N * kb) / 2;
  const B = (b) => bx0 + b * kb;
  const top = ny + 62, h = 36, bot = top + h;
  let aBottom;
  {
    s.rect(B(0), top, B(H) - B(0), h, "hatch", { fill: s.hatch });
    s.rect(B(0), top, B(H) - B(0), h, "slot");
    s.rect(B(H), top, B(H + C) - B(H), h, "obj fill-2");
    s.rect(B(H + C), top, B(N) - B(H + C), h, "obj hl");
    s.label(B(H), top, B(H + C) - B(H), h, "control");
    s.label(B(H + C), top, B(N) - B(H + C), h, "treatment");

    s.dimH(B(0), B(N), top - 22, "N", { from: [top, top] });
    s.nb(CX + 16, top - 29.5, 1);
    s.chainH([B(0), B(H), B(H + C), B(N)], bot + 20, ["", "C", "T"], { from: [bot, bot, bot, bot], below: true, hl: [2] });
    s.text(B(0) - 14, bot + 32, "H", "dt", "end");
    s.detailRef(B(H / 2), top + h / 2, 16, "detail A", B(0) + 90, top - 44);
    aBottom = bot + 32;
    s.viewTitle(CX, aBottom + 36, "View A · hash buckets of one experiment", "Scale 1,000 buckets = 64 px · illustrative");
    aBottom += 49;
  }

  // ---- View B: users observed, 1 px = 2,000 users ----
  s.comment("View B: users observed");
  const ku = 1 / 2000;
  const ux0 = CX - (NC * ku) / 2 + 30;
  const U = (n) => ux0 + n * ku;
  const cy = aBottom + 46, ty = cy + 32, hb = 24;
  let bBottom;
  {
    s.text(ux0 - 12, cy + hb / 2 + 3, "control", "sl ink", "end");
    s.text(ux0 - 12, ty + hb / 2 + 3, "treatment", "sl ink", "end");
    s.rect(U(0), cy, U(NC) - U(0), hb, "obj fill-2");
    s.rect(U(0), ty, U(NT) - U(0), hb, "obj fill-1");
    s.text(U(0) + 10, cy + hb / 2 + 3.5, "NC", "dt");
    s.text(U(0) + 10, ty + hb / 2 + 3.5, "NT", "dt");
    s.detailRef(U(NC) - 1, (cy + ty + hb) / 2, 18, "detail B", U(NC) + 50, cy - 12);
    s.viewTitle(CX, ty + hb + 40, "View B · users observed, 50/50 configured", "Scale 1 px = 2,000 users · counts from Fabijan et al.");
    bBottom = ty + hb + 53;
  }

  // Break line for a bar that continues past the edge of a detail view.
  const zig = (x, y, hh) => `L${x - 3},${y + hh * 0.25}L${x + 3},${y + hh * 0.5}L${x - 3},${y + hh * 0.75}L${x},${y + hh}`;

  // ---- Detail A: the holdout, 10:1 (1,000 buckets = 640 px) ----
  s.comment("Detail A: holdout");
  const rowTop = bBottom + 46;
  let daBottom;
  {
    const k = 640 / 1000, x0 = 60, span = 400;
    const D = (b) => x0 + b * k;
    const t = rowTop, hh = 36;
    s.rect(D(0), t, D(H) - D(0), hh, "hatch", { fill: s.hatch });
    s.rect(D(0), t, D(H) - D(0), hh, "slot");
    s.path(`M${D(H)},${t}H${D(span)}${zig(D(span), t, hh)}H${D(H)}Z`, "obj fill-2");
    s.label(D(H), t, D(span) - D(H), hh, "control");
    s.label(D(0), t, D(H) - D(0), hh, "holdout", "sl ink ko");
    s.dimH(D(0), D(H), t + hh + 20, "H", { from: [t + hh, t + hh], below: true });
    s.nb((D(0) + D(H)) / 2 + 16, t + hh + 28.5, 2);
    s.viewTitle((D(0) + D(span)) / 2, rowTop + 118, "Detail A · holdout", "Scale 10:1 · 1,000 buckets = 640 px");
    daBottom = rowTop + 131;
  }

  // ---- Detail B: the gap between the arms, 20:1 (1 px = 100 users) ----
  s.comment("Detail B: sample ratio gap");
  let dbBottom;
  {
    const k = 1 / 100, from = 800000, to = 826000, x0 = 430;
    const D = (n) => x0 + (n - from) * k;
    const t1 = rowTop, hh = 22, t2 = t1 + hh + 8;
    s.path(`M${D(from)},${t1}H${D(NC)}V${t1 + hh}H${D(from)}${zig(D(from), t1 + hh, -hh)}Z`, "obj fill-2");
    s.path(`M${D(from)},${t2}H${D(NT)}V${t2 + hh}H${D(from)}${zig(D(from), t2 + hh, -hh)}Z`, "obj fill-1");
    s.text(D(from) + 12, t1 + hh / 2 + 3.5, "NC", "dt");
    s.text(D(from) + 12, t2 + hh / 2 + 3.5, "NT", "dt");
    const dy = t2 + hh + 20;
    s.dimH(D(NT), D(NC), dy, "ΔN", { from: [t2 + hh, t1 + hh], below: true });
    s.nb((D(NT) + D(NC)) / 2 + 20, dy + 8.5, 4);
    s.viewTitle((D(from) + D(to)) / 2, dy + 46, "Detail B · sample ratio gap", "Scale 20:1 · 1 px = 100 users");
    dbBottom = dy + 59;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["N", "buckets in the hash space", `H + C + T = ${fmt(N)}`],
    ["H", "holdout buckets, 2%", fmt(H)],
    ["C", "control buckets", fmt(C)],
    ["T", "treatment buckets", fmt(T)],
    ["NC", "control users observed", fmt(NC)],
    ["NT", "treatment users observed", fmt(NT)],
    ["ΔN", `gap, ${pct(NC)}% / ${pct(NT)}%`, `NC − NT = ${fmt(DN)}`],
    ["X2", "chi-square vs 50/50, 1 df", `ΔN² ÷ (NC + NT) = ${X2.toFixed(2)}`],
    ["p", "chance of a split this uneven", "0.0000018"],
  ];
  const tw = [0, 1, 2].reduce((sum, j) => sum + Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc"))) + 14)), 0);
  const tb = s.table(CX - tw / 2, Math.max(daBottom, dbBottom) + 50, "Variables", rows);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
