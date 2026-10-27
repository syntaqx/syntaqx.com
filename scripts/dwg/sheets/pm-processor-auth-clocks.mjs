// One US point-of-sale authorization on a time axis: the issuer's window
// before stand-in, the monthly average, and the earliest merchant timeout.
// Embedded in content/books/payments/inside-a-processor.md.
import { sheet, widthOf } from "../kit.mjs";

// Seconds, Visa Rules (April 2026) [1]-[3].
const I1 = 10, A1 = 5, M1 = 15;
const G1 = M1 - I1; // 5

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pm-ac", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Visa Rules Table 7-1, POS outside Europe: if the issuer misses I1, Visa answers by Stand-In Processing."],
    [2, "Visa Rules 7.3.3: in the US the issuer, stand-in included, must average at most A1 over each calendar month."],
    [3, "Visa Rules 7.3.4.2: no POS timeout sooner than M1 (not in Europe). My own timeouts sit inside these."],
    [4, "An approval that arrives after the merchant timed out must be reversed, never left to lapse."],
    [0, "Values in seconds, Visa Rules, April 2026. Codes on the drawing; values in the table."],
  ], { width: 690 });

  s.comment("Plan view: one POS authorization");
  const k = 36, x0 = 110, late = 72, h = 34;
  const X = (t) => x0 + t * k;
  const rowLabel = (y, t) => s.text(x0 - 14, y + h / 2 + 3, t, "sl ink", "end");

  // Issuer row with I1 and A1 stacked above it.
  const iss = ny + 76;
  rowLabel(iss, "issuer");
  s.rect(X(0), iss, I1 * k, h, "obj fill-2");
  s.line(X(A1), iss - 6, X(A1), iss + h + 6, "ctr");
  s.label(X(A1), iss, (I1 - A1) * k, h, "issuer window");
  s.dimH(X(0), X(I1), iss - 44, "I1", { from: [iss, iss] });
  s.nb(X(I1 / 2) + 18, iss - 51.5, 1);
  s.dimH(X(0), X(A1), iss - 18, "A1", { from: [iss, iss] });
  s.nb(X(A1 / 2) + 18, iss - 25.5, 2);
  s.callout(X(I1), iss + h / 2, X(I1) + 16, iss + 4, "stand-in answers");

  // Merchant row: no timeout allowed before M1, then the late-approval slot.
  const mer = iss + h + 50;
  rowLabel(mer, "merchant");
  s.rect(X(0), mer, M1 * k, h, "hatch", { fill: s.hatch });
  s.rect(X(0), mer, M1 * k, h, "obj", { fill: "none" });
  const lbl = "no timeout before M1";
  s.text(X(M1 / 2), mer + h / 2 + 3, lbl, "sl ink ko", "middle");
  s.nb(X(M1 / 2) + widthOf(lbl, "sl") / 2 + 12, mer + h / 2 - 0.5, 3);
  s.rect(X(M1), mer, late, h, "slot");
  s.nb(X(M1) + late / 2, mer + h / 2, 4);

  // G1 between the rows: from the issuer limit to the earliest timeout.
  s.dimH(X(I1), X(M1), iss + h + 24, "G1", { from: [iss + h, mer] });

  // M1, the subject.
  s.dimH(X(0), X(M1), mer + h + 20, "M1", { from: [mer + h, mer + h], below: true, hl: true });
  s.nb(X(M1 / 2) + 20, mer + h + 28.5, 3);

  const vy = mer + h + 72;
  s.viewTitle(X(M1 / 2) + late / 2, vy, "Plan view · one POS authorization, US", "Scale 1 s = 36 px · timeline");

  s.comment("Variable table");
  const rows = [
    ["I1", "issuer answer limit before stand-in, POS", "10.00"],
    ["A1", "issuer monthly average ceiling, US", "5.00"],
    ["M1", "earliest acquirer or merchant timeout, POS", "≥ 15.00"],
    ["G1", "room for stand-in and the trip back", "M1 − I1 = 5.00"],
  ];
  const widths = [50, 290, 130];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 13 + 56, "Variables · seconds", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
