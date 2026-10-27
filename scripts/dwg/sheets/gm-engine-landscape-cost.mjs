// Engine license cost at one illustrative lifetime revenue: the revenue bar
// with its royalty-free band and break-even point, the license costs at ten
// times the scale, and the variable table. Embedded in
// content/books/gaming/engine-landscape.md (The Cost of Ownership).
import { sheet } from "../kit.mjs";

// Illustrative inputs [4], $M unless noted.
const G1 = 5, E1 = 1, B1 = G1 - E1;
const N1 = 10, P1 = 2200, Y1 = 3;
const U1 = (N1 * P1 * Y1) / 1e6; // 0.066
const R1 = 0.05 * B1, R2 = 0.035 * B1, L1 = 0;
const K1 = E1 + U1 / 0.05; // 2.32

const m = (n, d = 2) => n.toFixed(d);

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-elc", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Unreal (October 2026): 5% of gross above a product's first $1M; games pay royalties, not seats."],
    [2, "Below K1 the Unity Pro seats cost more than the Unreal royalty; above it, the royalty costs more."],
    [3, "Unity (Sept 12, 2024): Pro is $2,200 per seat-year from Jan 1, 2025. Unreal at 3.5%: EGS first."],
    [4, "License fees only: no store fees, engineering or support. Godot is MIT, so L1 = 0."],
    [0, "Illustrative revenue. Values in $M unless noted; codes on the drawing, values in the table."],
  ], { width: 690 });

  // ---- Plan view: lifetime gross revenue, $1M = 120 px ----
  s.comment("Plan view: lifetime gross revenue");
  {
    const k = 120, x0 = CX - (G1 * k) / 2, X = (v) => x0 + v * k;
    const top = ny + 56, h = 36, bot = top + h;
    s.rect(X(0), top, E1 * k, h, "hatch", { fill: s.hatch });
    s.rect(X(E1), top, B1 * k, h, "obj fill-2");
    s.rect(X(0), top, G1 * k, h, "obj");
    s.label(X(K1), top, X(G1) - X(K1), h, "royalty base");
    s.dimH(X(0), X(G1), top - 22, "G1", { from: [top, top] });
    s.nb(CX + 18, top - 29.5, 1);
    s.chainH([X(0), X(E1), X(G1)], bot + 20, ["E1", "B1"], { from: [bot, bot, bot], below: true });
    // Break-even centerline and its dimension from the origin.
    s.line(X(K1), top - 8, X(K1), bot + 64, "ctr");
    const ky = bot + 56;
    s.dimH(X(0), X(K1), ky, "K1", { from: [bot + 26, null], below: true });
    s.nb(X(K1) + 16, ky + 8.5, 2);
    s.viewTitle(CX, ky + 46, "Plan view · lifetime gross revenue", "Scale $1M = 120 px · hatched: royalty-free");
    var revBottom = ky + 59;
  }

  // ---- Plan view: license cost, 10:1 ($1M = 1,200 px) ----
  s.comment("Plan view: license cost, 10:1");
  const rowTop = revBottom + 46;
  let costBottom;
  {
    const k = 1200, x0 = 140, X = (v) => x0 + v * k;
    const rows = [
      ["Unreal 5%", R1, "R1", true],
      ["Unreal 3.5%", R2, "R2", false, 3],
      ["Unity Pro", U1, "U1"],
      ["Godot", L1, "L1"],
    ];
    const pitch = 46, h = 18;
    const end = rowTop + 22 + (rows.length - 1) * pitch + h + 10;
    s.line(x0, rowTop, x0, end, "ctr");
    rows.forEach(([name, v, code, hl, n], i) => {
      const by = rowTop + 22 + i * pitch;
      s.text(x0 - 14, by + h / 2 + 3, name, "sl ink", "end");
      if (n) s.nb(x0 - 14 - 8 - 70, by + h / 2, n);
      if (v > 0) {
        s.rect(x0, by, v * k, h, hl ? "obj hl" : "obj fill-2");
        s.dimH(x0, X(v), by - 8, code, { from: [null, by], hl });
      } else {
        s.add(`<circle class="dot" cx="${x0}" cy="${by + h / 2}" r="2.2"/>`);
        s.text(x0 + 12, by + h / 2 + 3.5, code, "dt");
      }
    });
    s.viewTitle(x0 + (R1 * k) / 2, end + 30, "Plan view · license cost, 10:1", "Scale $1M = 1,200 px");
    costBottom = end + 43;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(430, rowTop + 6, "Variables · $M", [
    ["G1", "lifetime gross", `E1+B1 = ${m(G1)}`],
    ["E1", "royalty-free first $1M", m(E1)],
    ["B1", "royalty base", `G1−E1 = ${m(B1)}`],
    ["R1", "Unreal royalty at 5%", `0.05 × B1 = ${m(R1, 3)}`],
    ["R2", "at 3.5%, EGS first", `0.035 × B1 = ${m(R2, 3)}`],
    ["N1", "seats", String(N1)],
    ["P1", "Unity Pro, $ per seat-year", "2,200"],
    ["Y1", "years on the subscription", String(Y1)],
    ["U1", "Unity Pro seats", `N1 × P1 × Y1 = ${m(U1, 3)}`],
    ["L1", "Godot license", m(L1, 3)],
    ["K1", "break-even gross", `E1 + U1 ÷ 0.05 = ${m(K1)}`],
  ]);
  s.height = Math.ceil(Math.max(tb.y, costBottom) + 30);
  return s.toString();
}
