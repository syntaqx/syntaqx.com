// Interchange on one $100 card-not-present payment by card type, drawn to
// scale as a dimensional sheet; the subject is D1, what complete Level 3
// data saves on a commercial card. Embedded in
// content/books/payments/interchange-and-pricing.md.
import { sheet } from "../kit.mjs";

// USD, from one network's US schedule effective October 24, 2026.
const W1 = 100;
const BARS = [
  ["I1", "debit, regulated issuer", 0.0005 * W1 + 0.21 + 0.01, "0.05% × W1 + 0.21 + 0.01"],
  ["I2", "debit, exempt issuer, e-commerce", 0.0165 * W1 + 0.15, "1.65% × W1 + 0.15"],
  ["I3", "commercial, Level 3 data", 0.0175 * W1 + 0.1, "1.75% × W1 + 0.10"],
  ["I4", "commercial, card not present", 0.027 * W1 + 0.1, "2.70% × W1 + 0.10"],
  ["I5", "commercial, non-qualified", 0.0295 * W1 + 0.1, "2.95% × W1 + 0.10"],
];
const D1 = BARS[3][2] - BARS[2][2];
const usd = (v) => v.toFixed(2);

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "il", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "One card network's published US schedule, effective October 24, 2026; card-not-present rates."],
    [2, "Level 3: line items sent with a commercial card payment. D1 is what complete data saves."],
    [0, "Values in USD. The drawing carries codes; rates, values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 USD = 140 px ----
  s.comment("Plan view: interchange by card type");
  const k = 140, x0 = 270, bh = 16, pitch = 36;
  const X = (v) => x0 + v * k;
  const axY = ny + 44, r0 = axY + 22;
  const RY = (i) => r0 + i * pitch;

  s.line(X(0), axY, X(3.25), axY, "leader");
  for (let d = 0; d <= 3; d++) {
    s.line(X(d), axY - 4, X(d), axY + 4, "leader");
    s.text(X(d), axY - 10, String(d), "tc", "middle");
  }
  s.nb(X(3.25) + 14, axY, 1);

  BARS.forEach(([code, label, v], i) => {
    const y = RY(i);
    s.text(x0 - 14, y + bh / 2 + 3, label, "sl ink", "end");
    s.rect(X(0), y, v * k, bh, "obj fill-2");
    s.text(X(v) + 8, y + bh / 2 + 3.5, code, "dt");
  });

  // D1 between the ends of I3 and I4, in the gap between their rows.
  const dy = RY(3) - 10;
  s.dimH(X(BARS[2][2]), X(BARS[3][2]), dy, "D1", { from: [RY(2) + bh, RY(3)], hl: true });
  s.nb(X(BARS[3][2]) + 16, dy, 2);

  const vy = RY(BARS.length - 1) + bh + 44;
  s.viewTitle(W / 2, vy, "Plan view · interchange by card type", "Scale 1 USD = 140 px · one 100 USD card-not-present payment");

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["W1", "payment, card not present", usd(W1)],
    ...BARS.map(([code, label, v, f]) => [code, label, `${f} = ${usd(v)}`]),
    ["D1", "Level 3 saving on a commercial card", `I4 − I3 = ${usd(D1)}`],
  ];
  const widths = [44, 230, 200];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 52, "Variables · USD", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
