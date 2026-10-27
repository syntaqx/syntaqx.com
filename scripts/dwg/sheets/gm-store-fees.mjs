// Where one $9.99 purchase goes: store or card fee and net to developer for
// eight channels (plan view), and the variable table. Rates as of October
// 2026, cited in content/books/gaming/stores-and-payments.md, where this is
// embedded.
import { sheet, widthOf } from "../kit.mjs";

const P1 = 9.99;
// [store, condition, fee]
const STORES = [
  ["Steam", "30% tier, sales under $10M", 3.0],
  ["Epic Games Store", "12% after the first $1M a year", 1.2],
  ["Microsoft PC", "12% of Net Receipts, games", 1.2],
  ["Xbox console", "30% of Net Receipts, games", 3.0],
  ["Apple US", "30% IAP, 15% small business", 3.0],
  ["Apple EU", "26% IAP from 1 October 2026", 2.6],
  ["Google Play US", "20% + 5% billing, new installs", 2.5],
  ["Web store", "2.9% + $0.30 card fee", 0.59],
];
const m = (v) => v.toFixed(2);

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-sf", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Steam's 2018 tiers: 30% of sales under $10M, 25% from $10M to $50M, 20% above (as reported)."],
    [2, "Fees apply to the price before tax: Microsoft's Net Receipts and Apple's EU commission both exclude it."],
    [3, "Stripe's standard US card rate; a web store also carries tax, fraud, refunds and chargebacks itself."],
    [4, "Programs lower several rates: Apple Small Business, Epic's first $1M a year, Play Games Level Up."],
    [0, "USD, rates as of October 2026. The drawing carries codes; rates and values are in the table."],
  ], { width: 690 });

  // ---- Plan view: one purchase by store, $1 = 40 px ----
  s.comment("Plan view: one purchase, by store");
  const k = 40, x0 = 232, x1 = x0 + P1 * k;
  const top = ny + 74, h = 22, step = 34;
  s.dimH(x0, x1, top - 40, "P1", { from: [top, top], hl: true });
  s.nb((x0 + x1) / 2 + 26, top - 47.5, 2);
  STORES.forEach(([name, , fee], i) => {
    const y = top + i * step, xf = x0 + fee * k;
    s.rect(x0, y, xf - x0, h, "obj fill-1");
    s.rect(xf, y, x1 - xf, h, "obj fill-2");
    s.text(x0 - 12, y + h / 2 + 3, name, "sl ink", "end");
    s.text(x1 + 12, y + h / 2 + 3.5, `F${i + 1} · N${i + 1}`, "dt");
  });
  // Note numbers just left of the store names they qualify.
  for (const [i, nn] of [[0, 1], [1, 4], [7, 3]]) s.nb(x0 - 12 - widthOf(STORES[i][0], "sl") - 14, top + i * step + h / 2, nn);
  // What the two fills mean, called out on the first row.
  s.callout(x0 + 1.5 * k, top + 4, x0 + 2.4 * k, top - 16, "fee");
  s.callout(x0 + 6.5 * k, top + 4, x0 + 7.2 * k, top - 16, "net to developer");
  const bot = top + 7 * step + h;
  s.viewTitle((x0 + x1) / 2, bot + 40, "Plan view · one purchase, by store", "Scale $1 = 40 px · USD before tax");
  const vBottom = bot + 53;

  s.comment("Variable table");
  const rows = [
    ["P1", "price before tax", m(P1)],
    ["Fi, Ni", "fee and net, per store", "P1 × rate, P1 − Fi"],
    ...STORES.map(([name, cond, fee], i) => [`F${i + 1}, N${i + 1}`, `${name}: ${cond}`, `${m(fee)}, ${m(P1 - fee)}`]),
  ];
  const widths = [56, 280, 116];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, vBottom + 50, "Variables · USD", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
