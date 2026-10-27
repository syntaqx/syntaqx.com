// One $100 card-not-present payment on an exempt debit card under a blended
// 2.9% + 0.30 rate: a plan view of the whole payment and Detail A splitting
// the merchant discount. Embedded in
// content/books/payments/interchange-and-pricing.md.
import { sheet, widthOf } from "../kit.mjs";

// USD. F1 is the published blended rate [3]; I1 the Visa exempt debit
// CPS/e-Commerce Basic rate [1]; N1 illustrative [2].
const W1 = 100;
const F1 = 0.029 * W1 + 0.3; // 3.20
const I1 = 0.0165 * W1 + 0.15; // 1.80
const N1 = 0.14;
const K1 = F1 - I1 - N1; // 1.26
const M1 = W1 - F1; // 96.80

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "pm-fs", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Visa exempt debit, CPS/e-Commerce Basic, from October 24, 2026. Regulation II debit would be 0.27."],
    [2, "Illustrative: real network fees are many lines on the acquirer's bill, some billed up to two months later."],
    [3, "A published blended rate: the merchant pays F1 whatever the card, so K1 shrinks as I1 grows."],
    [0, "Values in USD. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: the whole payment, 1 USD = 6 px ----
  s.comment("Plan view: one payment");
  let planBottom;
  {
    const k = 6, h = 34;
    const x0 = CX - (W1 * k) / 2;
    const xs = [x0, x0 + M1 * k, x0 + W1 * k];
    const top = ny + 56, bot = top + h;
    s.rect(xs[0], top, xs[1] - xs[0], h, "obj fill-2");
    s.rect(xs[1], top, xs[2] - xs[1], h, "obj fill-1");
    s.label(xs[0], top, xs[1] - xs[0], h, "merchant funding");
    s.dimH(xs[0], xs[2], top - 24, "W1", { from: [top, top] });
    s.chainH(xs, bot + 20, ["M1", "F1"], { from: [bot, bot, bot], below: true });
    s.detailRef((xs[1] + xs[2]) / 2, top + h / 2, 18, "detail A", xs[1] - 40, top - 8);
    s.viewTitle(CX, bot + 66, "Plan view · one card-not-present payment", "Scale 1 USD = 6 px · blended pricing");
    planBottom = bot + 79;
  }

  // ---- Detail A: the merchant discount, 1 USD = 180 px ----
  s.comment("Detail A: the merchant discount");
  let detailBottom;
  {
    const k = 180, h = 34;
    const x0 = CX - (F1 * k) / 2;
    const xs = [x0, x0 + I1 * k, x0 + (I1 + N1) * k, x0 + F1 * k];
    const top = planBottom + 80, bot = top + h;
    s.rect(xs[0], top, xs[1] - xs[0], h, "obj fill-1");
    s.rect(xs[1], top, xs[2] - xs[1], h, "obj fill-2");
    s.rect(xs[2], top, xs[3] - xs[2], h, "obj fill-2");
    s.label(xs[0], top, xs[1] - xs[0], h, "interchange");
    s.nb((xs[0] + xs[1]) / 2 + widthOf("interchange", "sl") / 2 + 12, top + h / 2 - 0.5, 1);
    s.label(xs[2], top, xs[3] - xs[2], h, "markup");
    const fy = top - 34;
    s.dimH(xs[0], xs[3], fy, "F1", { from: [top, top], hl: true });
    s.nb(CX + 16, fy - 7.5, 3);
    const nx = (xs[1] + xs[2]) / 2;
    s.callout(nx, top + h / 2, nx + 18, top - 14, "network fees");
    s.nb(nx + 32 + widthOf("network fees", "sl") + 10, top - 14 + 0.5, 2);
    s.chainH(xs, bot + 20, ["I1", "N1", "K1"], { from: [bot, bot, bot, bot], below: true });
    s.viewTitle(CX, bot + 66, "Detail A · the merchant discount, F1", "Scale 30:1 · 1 USD = 180 px");
    detailBottom = bot + 79;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["W1", "payment, card-not-present, exempt debit", "M1+I1+N1+K1 = 100.00"],
    ["F1", "merchant discount, blended", "2.9% × W1 + 0.30 = 3.20"],
    ["I1", "interchange", "1.65% × W1 + 0.15 = 1.80"],
    ["N1", "network fees, illustrative", "0.14"],
    ["K1", "markup", "F1 − I1 − N1 = 1.26"],
    ["M1", "merchant funding", "W1 − F1 = 96.80"],
  ];
  const widths = [50, 230, 190];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, detailBottom + 50, "Variables · USD", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
