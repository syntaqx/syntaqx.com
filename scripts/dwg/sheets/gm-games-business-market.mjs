// The 2025 global games market by segment against the 2028 forecast, U.S.
// consumer spending at the same scale, and its small segments in detail.
// Embedded in content/books/gaming/games-business.md.
import { sheet } from "../kit.mjs";

// $B. Global [1]; U.S. [2].
const M1 = 113.3, C1 = 44.7, P1 = 43.6, F1 = 234.4;
const S1 = 52.3, S2 = 5.4, S3 = 2.95;

export default function draw() {
  const W = 760, CX = W / 2, k = 2.8;
  const s = sheet({ prefix: "gm-gbm", width: W });
  const x0 = CX - (F1 * k) / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "A market-research firm's 2025 estimate and 2028 forecast, as summarized by a trade newsletter, June 26, 2026."],
    [2, "A U.S. industry association's 2026 report: U.S. consumer spending on video games in 2025."],
    [3, "The parts sum to 60.65; the association reports the total, rounded, as $60.7 billion."],
    [0, "Values in $B. The drawing carries codes; values and formulas are in the tables."],
  ], { width: 690 });

  // ---- Plan view: global market, $1B = 2.8 px ----
  s.comment("Plan view: global market, 2025");
  let globalBottom;
  {
    const top = ny + 80, h = 36, bot = top + h;
    const xs = [0, M1, M1 + C1, M1 + C1 + P1].map((v) => x0 + v * k);
    const xf = x0 + F1 * k;
    s.rect(x0, top, xf - x0, h, "phantom");
    s.rect(xs[0], top, xs[1] - xs[0], h, "obj fill-1");
    s.rect(xs[1], top, xs[2] - xs[1], h, "obj fill-2");
    s.rect(xs[2], top, xs[3] - xs[2], h, "obj fill-2");
    s.label(xs[0], top, xs[1] - xs[0], h, "mobile");
    s.label(xs[1], top, xs[2] - xs[1], h, "console");
    s.label(xs[2], top, xs[3] - xs[2], h, "PC");
    s.label(xs[3], top, xf - xs[3], h, "2028", "sl");

    s.dimH(x0, xf, top - 46, "F1", { from: [top, top] });
    s.nb(x0 + (xf - x0) / 2 + 18, top - 53.5, 1);
    s.dimH(x0, xs[3], top - 22, "G1", { from: [null, top], hl: true });
    s.chainH(xs, bot + 22, ["M1", "C1", "P1"], { from: xs.map(() => bot), below: true });

    s.viewTitle(CX, bot + 70, "Plan view · global market, 2025", "Scale $1B = 2.8 px · dashed: 2028 forecast");
    globalBottom = bot + 83;
  }

  // ---- Plan view: U.S. consumer spending, same scale ----
  s.comment("Plan view: U.S. consumer spending, 2025");
  const rowTop = globalBottom + 30;
  let usBottom;
  {
    const top = rowTop + 40, h = 36, bot = top + h;
    const xs = [0, S1, S1 + S2, S1 + S2 + S3].map((v) => x0 + v * k);
    s.rect(xs[0], top, xs[1] - xs[0], h, "obj fill-1");
    s.rect(xs[1], top, xs[2] - xs[1], h, "obj fill-2");
    s.rect(xs[2], top, xs[3] - xs[2], h, "obj fill-2");
    s.label(xs[0], top, xs[1] - xs[0], h, "content");
    s.dimH(xs[0], xs[3], top - 22, "U1", { from: [top, top] });
    s.nb((xs[0] + xs[3]) / 2 + 18, top - 29.5, 3);
    s.dimH(xs[0], xs[1], bot + 22, "S1", { from: [bot, bot], below: true });
    s.nb((xs[0] + xs[1]) / 2 + 18, bot + 30.5, 2);
    s.detailRef((xs[1] + xs[3]) / 2, top + h / 2, 20, "detail A", xs[3] + 40, top - 14);
    s.viewTitle((xs[0] + xs[3]) / 2 + 20, bot + 70, "Plan view · U.S. spending, 2025", "Scale $1B = 2.8 px");
    usBottom = bot + 83;
  }

  // ---- Detail A: hardware and accessories, 10:1 ----
  s.comment("Detail A: hardware and accessories");
  {
    const kd = k * 10, top = rowTop + 40, h = 36, bot = top + h;
    const stub = 70;
    const dx0 = 330;
    const xs = [dx0 + stub, dx0 + stub + S2 * kd, dx0 + stub + (S2 + S3) * kd];
    // S1 runs off to the left, cut by a break line.
    const zz = `M${dx0 + 6},${top}L${dx0},${top + 9}L${dx0 + 8},${top + 18}L${dx0},${top + 27}L${dx0 + 6},${bot}`;
    s.path(`${zz}H${xs[0]}V${top}Z`, "obj fill-1");
    s.rect(xs[0], top, xs[1] - xs[0], h, "obj fill-2");
    s.rect(xs[1], top, xs[2] - xs[1], h, "obj fill-2");
    s.label(dx0, top, stub, h, "content");
    s.label(xs[0], top, xs[1] - xs[0], h, "hardware");
    s.label(xs[1], top, xs[2] - xs[1], h, "accessories");
    s.chainH(xs, bot + 22, ["S2", "S3"], { from: xs.map(() => bot), below: true });
    s.viewTitle((dx0 + xs[2]) / 2, bot + 70, "Detail A · hardware and accessories", "Scale 10:1 · $1B = 28 px");
  }

  s.comment("Variable tables");
  const ty = usBottom + 50;
  const t1 = s.table(40, ty, "Global · $B", [
    ["G1", "global 2025", "M1+C1+P1 = 201.6"],
    ["M1", "mobile", "113.3"],
    ["C1", "console", "44.7"],
    ["P1", "PC", "43.6"],
    ["F1", "forecast, 2028", "234.4"],
  ]);
  const t2 = s.table(40 + t1.width + 40, ty, "United States · $B", [
    ["U1", "U.S. 2025", "S1+S2+S3 = 60.65"],
    ["S1", "content", "52.3"],
    ["S2", "hardware", "5.4"],
    ["S3", "accessories", "2.95"],
  ]);
  s.height = Math.ceil(Math.max(t1.y, t2.y) + 30);
  return s.toString();
}
