// One biweekly paycheck with a child support order, an IRS levy and a creditor
// garnishment stacked in priority order: taxes, voluntary deductions, support
// within its 65% cap, the levy down to the exempt amount (the subject), and
// nothing left for the creditor under the 25% aggregate cap.
// Embedded in content/books/workforce/garnishments-and-levies.md.
import { sheet } from "../kit.mjs";

// Invented worked example; limits from 15 USC 1673, 29 CFR 870.11 and IRS
// Publication 1494 (2026). Amounts in dollars.
const GROSS = 2400.0;
const PARTS = [
  ["T1", "taxes", 445.95],
  ["V1", "", 120.0],
  ["V2", "", 100.0],
  ["S1", "support", 650.0],
  ["L1", "levy", 260.97],
  ["N1", "net pay", 823.08],
];
const DE = GROSS - 445.95; // 1,954.05
const CAP65 = 1270.13;
const CAP25 = 488.51;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "wf-gs", width: W });

  s.comment("Notes");
  const ny = s.notes(
    32,
    40,
    [
      [
        1,
        "Disposable earnings subtract only deductions required by law; voluntary ones stay in the base.",
      ],
      [
        2,
        "Support is taken first, up to its cap; the IRS levy then takes take-home pay above the exempt amount.",
      ],
      [
        3,
        "A creditor garnishment gets nothing once support alone exceeds 25% of disposable earnings.",
      ],
      [0, "Invented biweekly paycheck. Codes on the drawing; amounts and formulas in the table."],
    ],
    { width: 690 },
  );

  s.comment("Plan view: the paycheck as one bar");
  const k = 0.26;
  const x0 = (W - GROSS * k) / 2;
  const X = (d) => x0 + d * k;
  const top = ny + 120;
  const h = 34;
  const xs = [X(0)];
  let acc = 0;
  for (const [, , v] of PARTS) {
    acc += v;
    xs.push(X(acc));
  }
  PARTS.forEach(([code, label, v], i) => {
    const cls = code === "N1" ? "obj fill-2" : code === "T1" ? "hatch" : "obj fill-1";
    if (cls === "hatch") {
      s.rect(xs[i], top, xs[i + 1] - xs[i], h, "hatch", { fill: s.hatch });
      s.rect(xs[i], top, xs[i + 1] - xs[i], h, "obj");
    } else s.rect(xs[i], top, xs[i + 1] - xs[i], h, cls);
    if (label) s.label(xs[i], top, xs[i + 1] - xs[i], h, label);
  });
  s.chainH(
    xs,
    top + h + 20,
    PARTS.map((p) => p[0]),
    { from: [top + h, top + h], below: true },
  );
  s.nb(xs[0] - 22, top + h / 2 - 7, 1);
  s.nb(xs[3] + 4, top + 4, 2);

  // Above the bar: disposable earnings and the two caps, measured from its start.
  const dx = X(445.95);
  s.dimH(dx, X(GROSS), top - 18, "D1", { from: [top, top] });
  s.dimH(dx, X(445.95 + CAP65), top - 50, "C1", { from: [top, top] });
  s.dimH(dx, X(445.95 + CAP25), top - 82, "C2", { from: [top, top] });
  s.nb(X(445.95 + CAP25) + 8, top - 89, 3);
  s.dimH(xs[5], xs[6], top + h + 54, "N1 = X1", {
    from: [top + h, top + h],
    below: true,
    hl: true,
  });

  const vy = top + h + 100;
  s.viewTitle(W / 2, vy, "Plan view · one biweekly paycheck, three orders", `Scale $1 = ${k} px`);

  s.comment("Variable table");
  const rows = [
    ["G", "gross pay", "2,400.00"],
    ["T1", "income taxes, Social Security, Medicare (required)", "445.95"],
    ["D1", "disposable earnings: G − T1", "1,954.05"],
    ["V1+V2", "401(k) and medical, voluntary, not subtracted", "220.00"],
    ["C1", "support cap: 65% x D1", "1,270.13"],
    ["S1", "support ordered, under C1", "650.00"],
    ["X1", "levy exempt, single, 1 dependent, biweekly", "823.08"],
    ["L1", "levy: G − T1 − V1 − V2 − S1 − X1", "260.97"],
    ["C2", "creditor cap: 25% x D1, less S1 ≥ 0", "0.00"],
    ["N1", "net pay: G − T1 − V1 − V2 − S1 − L1", "823.08"],
  ];
  const widths = [60, 360, 100];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 52, "Variables · CCPA, 29 CFR 870.11, Pub 1494", rows, {
    widths,
  });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
