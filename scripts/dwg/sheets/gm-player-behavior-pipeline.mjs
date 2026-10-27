// A platform's 2025 moderation volumes in three lanes (proactive detection,
// player reports, appeals): stage boxes, then a split bar to scale, and the
// variable tables. Embedded in content/books/gaming/player-behavior.md.
import { sheet } from "../kit.mjs";

const M2 = 12.8, A2 = 355.1; // M, proactive
const M1 = 1.3, A1 = 2.4; // M, reported
const N1 = 85, N2 = 247; // K, appeals

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-pbp", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "A platform transparency report, Jan 1 to Dec 31, 2025. Stage boxes are not to scale; split bars are."],
    [2, "Per the report, 65% of user reports and 97% of total reports were processed using automated systems."],
    [3, "A human agent reviews each appeal; reinstated when an error is found or reconsideration is warranted."],
    [0, "Counts per year. The drawing carries codes; values and formulas are in the tables."],
  ], { width: 690 });

  const bw = 120, bh = 40, gapA = 34, barW = 300;
  const bx1 = 70, bx2 = bx1 + bw + gapA, barX = bx2 + bw + gapA;
  const ah = `url(#${s.id("ah")})`;
  const box = (x, y, label, code) => {
    s.rect(x, y, bw, bh, "obj fill-2");
    s.text(x + bw / 2, code ? y + 17 : y + bh / 2 + 3, label, "sl ink", "middle");
    if (code) s.text(x + bw / 2, y + 31, code, "dt", "middle");
  };
  const arrow = (x, y) => s.path(`M${x + 4},${y}H${x + gapA - 4}`, "leader", { "marker-end": ah });

  // One lane: box, arrow, box, arrow, split bar [a | b] with a total dim
  // above and the two parts below.
  const lane = (y, [l1, c1], [l2, c2], [a, b], [ca, cb, ct], { la, lb, hlB, labelA }) => {
    box(bx1, y, l1, c1);
    arrow(bx1 + bw, y + bh / 2);
    box(bx2, y, l2, c2);
    arrow(bx2 + bw, y + bh / 2);
    const xa = barX + (barW * a) / (a + b);
    s.rect(barX, y, xa - barX, bh, "obj fill-2");
    s.rect(xa, y, barX + barW - xa, bh, hlB ? "obj hl" : "obj fill-1");
    if (labelA) s.label(barX, y, xa - barX, bh, la);
    s.label(xa, y, barX + barW - xa, bh, lb);
    s.dimH(barX, barX + barW, y - 14, ct, { from: [y, y] });
    const narrow = xa - barX < 22;
    s.dimH(barX, xa, y + bh + 18, ca, { from: [y + bh, y + bh], below: true, dx: narrow ? -24 : 0 });
    s.dimH(xa, barX + barW, y + bh + 18, cb, { from: [null, y + bh], below: true, hl: hlB });
    return y + bh + 30;
  };
  const title = (y, t) => s.viewTitle(W / 2, y + 32, t, "Plan view · split bar to scale · boxes not to scale");

  s.comment("Lane 1: proactive detection");
  let y = ny + 50;
  let b = lane(y, ["scanned", "S1"], ["violating", "D1"], [M2, A2], ["M2", "A2", "D1"], { lb: "automated" });
  title(b, "Lane 1 · proactive detection");

  s.comment("Lane 2: player reports");
  y = b + 45 + 50;
  b = lane(y, ["reports", "R1"], ["actioned", "R2"], [M1, A1], ["M1", "A1", "U1"], { la: "manual", lb: "automated", hlB: true, labelA: true });
  s.nb(barX + barW - 30, y - 21.5, 2);
  title(b, "Lane 2 · player reports");

  s.comment("Lane 3: appeals");
  y = b + 45 + 50;
  b = lane(y, ["appeals", "P1"], ["case review", null], [N1, N2], ["N1", "N2", "P1"], { la: "reinstated", lb: "upheld", labelA: true });
  s.nb(bx2 + bw / 2, y - 10, 3);
  title(b, "Lane 3 · appeals");

  s.comment("Variable tables");
  const ty = b + 45 + 40;
  const t1 = s.table(40, ty, "Detection and reports", [
    ["S1", "content scanned", "14.8B"],
    ["D1", "found violating, 2.5%", "M2 + A2 ≈ 368M"],
    ["M2", "proactive, manual", "12.8M"],
    ["A2", "proactive, automated", "355.1M"],
    ["R1", "player reports", "39M"],
    ["R2", "reports actioned, 9.6%", "3.7M"],
  ]);
  const t2 = s.table(400, ty, "Processing and appeals", [
    ["M1", "reported, manual", "1.3M"],
    ["A1", "reported, automated, 65%", "2.4M"],
    ["U1", "reported, processed", "M1 + A1 = 3.7M"],
    ["P1", "appeals (case reviews)", "N1 + N2 = 332K"],
    ["N1", "reinstated, 26%", "85K"],
    ["N2", "upheld, 74%", "247K"],
  ]);
  s.height = Math.ceil(Math.max(t1.y, t2.y) + 30);
  return s.toString();
}
