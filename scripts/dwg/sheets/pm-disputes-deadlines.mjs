// The longest Visa consumer dispute as a plan view on a calendar-day axis:
// the filing window, then each step's clock, with the merchant's own
// evidence deadline inside the acquirer's response.
// Embedded in content/books/payments/disputes-and-chargebacks.md.
import { sheet, widthOf } from "../kit.mjs";

// Calendar days, Visa Rules Table 11-2 (April 2026); P1 from a provider.
const F1 = 120;
const STEPS = [
  { code: "R1", days: 30, who: "acquirer", name: "acquirer's dispute response" },
  { code: "A1", days: 30, who: "issuer", name: "issuer's pre-arbitration attempt" },
  { code: "A2", days: 30, who: "acquirer", name: "acquirer's pre-arbitration response" },
  { code: "A3", days: 10, who: null, name: "arbitration filing" },
];
const C1 = STEPS.reduce((a, t) => a + t.days, 0); // 100
const L1 = F1 + C1; // 220
const P1 = [7, 21];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pm-dd", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Typical: for services paid in advance the window starts at the event, so L1 grows."],
    [2, `Providers ask merchants for evidence well inside R1 to leave room for their own review (Stripe: ${P1[0]} to ${P1[1]} days).`],
    [3, "Each step runs from the processing date of the one before, so this is the longest case; a missed step loses."],
    [0, "Calendar days, from Visa Rules Table 11-2 (April 2026). Values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 day = 2.6 px ----
  s.comment("Plan view: one dispute");
  const k = 2.6;
  const x0 = CX - (L1 * k) / 2;
  const xs = [x0, x0 + F1 * k];
  for (const t of STEPS) xs.push(xs[xs.length - 1] + t.days * k);
  const top = ny + 76, h = 34, bot = top + h;

  s.rect(xs[0], top, xs[1] - xs[0], h, "slot");
  s.label(xs[0], top, xs[1] - xs[0], h, "filing window");
  STEPS.forEach((t, i) => {
    s.rect(xs[i + 1], top, xs[i + 2] - xs[i + 1], h, `obj ${i % 2 ? "fill-2" : "fill-1"}`);
    if (t.who) s.label(xs[i + 1], top, xs[i + 2] - xs[i + 1], h, t.who);
  });
  const a3 = (xs[4] + xs[5]) / 2;
  s.callout(a3, top + h / 2, a3 - 12, top - 12, "arbitration", { dir: -1 });

  // Overall and cycle dimensions, then the chain of steps.
  const ly = top - 54, cy = top - 30;
  s.dimH(xs[0], xs[5], ly, "L1", { from: [top, top], hl: true });
  s.nb(CX + 20, ly - 7.5, 1);
  s.dimH(xs[1], xs[5], cy, "C1", { from: [top, top] });
  s.nb((xs[1] + xs[5]) / 2 + 20, cy - 7.5, 3);
  s.chainH(xs, bot + 20, ["F1", ...STEPS.map((t) => t.code)], { from: xs.map(() => bot), below: true });

  // Merchant's deadline: the shortest of the range solid, the rest dashed.
  const my = bot + 52, mh = 20;
  s.text(xs[1] - 12, my + mh / 2 + 3, "merchant", "sl ink", "end");
  s.rect(xs[1], my, P1[0] * k, mh, "obj fill-2");
  s.rect(xs[1] + P1[0] * k, my, (P1[1] - P1[0]) * k, mh, "slot");
  s.dimH(xs[1], xs[1] + P1[1] * k, my + mh + 16, "P1", { from: [my + mh, my + mh], below: true });
  s.nb(xs[1] + (P1[1] * k) / 2 + 20, my + mh + 24.5, 2);

  const vy = my + mh + 70;
  s.viewTitle(CX, vy, "Plan view · one dispute, Visa categories 12 and 13", `Scale 1 day = ${k} px · calendar days · longest case`);

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["F1", "cardholder's filing window from the purchase, typical", String(F1)],
    ...STEPS.map((t) => [t.code, t.name, String(t.days)]),
    ["C1", "dispute cycle", `R1+A1+A2+A3 = ${C1}`],
    ["L1", "purchase to the last arbitration filing", `F1+C1 = ${L1}`],
    ["P1", "merchant's evidence deadline at a provider", `${P1[0]} to ${P1[1]}`],
  ];
  const widths = [40, 280, 130];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, vy + 52, "Variables · calendar days", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
