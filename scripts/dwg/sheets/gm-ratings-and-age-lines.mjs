// Where the age lines fall in each regime, on one age axis, with the chain
// that closes to adulthood. Embedded in content/books/gaming/ratings-and-age.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-ra", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "UK Children's Code: a child is anyone under 18. UK GDPR's age for consent-based online services is 13."],
    [2, "FTC order with one publisher, 17 Jan 2025: it binds one company, not the industry."],
    [3, "PEGI: newly submitted games from June 2026; existing PEGI 3, 7 and 12 digital games re-rated from October 2026."],
    [0, "Values in years, from the cited texts. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: age axis, 1 year = 30 px ----
  s.comment("Plan view: age axis");
  const k = 30, x0 = 196, X = (a) => x0 + a * k;
  const LX = 52; // row labels
  const rulerY = ny + 52;

  // Ruler with a tick per year, figures at every second year and at 13, 17.
  s.line(X(0), rulerY, X(18), rulerY, "obj");
  for (let a = 0; a <= 18; a++) {
    const major = a % 2 === 0 || a === 13 || a === 17;
    s.line(X(a), rulerY - (major ? 4 : 2.5), X(a), rulerY + (major ? 4 : 2.5), "dim");
    if ((a % 2 === 0 && a !== 12 && a !== 14) || a === 13) s.text(X(a), rulerY - 8, String(a), "tc", "middle");
  }
  s.text(LX, rulerY + 3, "age", "sl", "start");

  const rh = 20, pitch = 32;
  let y = rulerY + 22;
  const bar = (a1, a2, cls, label) => {
    s.rect(X(a1), y, (a2 - a1) * k, rh, cls);
    if (label) s.label(X(a1), y, (a2 - a1) * k, rh, label);
  };
  const row = (label, n, fn) => {
    s.text(LX, y + rh / 2 + 3, label, "sl ink");
    if (n) s.nb(LX + 5.5 + 96, y + rh / 2, n);
    fn();
    y += pitch;
  };

  row("COPPA (US)", 0, () => {
    bar(0, 13, "obj fill-1", "child");
    bar(13, 18, "slot", "not a child");
  });
  row("Utah SB 142", 0, () => {
    bar(0, 13, "obj fill-1", "child");
    bar(13, 16, "obj fill-2", "younger teen");
    bar(16, 18, "obj fill-2", "older");
  });
  row("UK code", 1, () => bar(0, 18, "obj fill-2", "child"));
  row("FTC order", 2, () => {
    bar(0, 16, "obj fill-2", "loot boxes need parental consent");
    bar(16, 18, "slot");
  });

  // Rating systems: thresholds as ticks on a line, letters above.
  const scaleRow = (label, n, marks, hlAge) => {
    const ly = y + rh;
    s.text(LX, ly + 3, label, "sl ink");
    if (n) s.nb(LX + 5.5 + 96, ly, n);
    s.line(X(0), ly, X(18), ly, "obj");
    for (const [a, t] of marks) {
      if (a === hlAge) s.rect(X(a) - 3, ly - 12, 6, 12, "obj hl");
      else s.line(X(a), ly - 10, X(a), ly, "obj");
      s.text(X(a), ly - 15, t, "sl ink", "middle");
    }
    y += pitch + 4;
  };
  y += 10;
  scaleRow("ESRB", 0, [[0, "E"], [10, "E10+"], [13, "T"], [17, "M"], [18, "AO"]]);
  scaleRow("PEGI", 3, [[3, "3"], [7, "7"], [12, "12"], [16, "16 · R1"], [18, "18"]], 16);

  // Chain A1..A3 and overall A0.
  const top = y - pitch - 4 + rh; // PEGI line
  const cy = top + 20;
  s.chainH([X(0), X(13), X(16), X(18)], cy, ["A1", "A2", "A3"], { from: [top, top, top, top], below: true });
  s.dimH(X(0), X(18), cy + 30, "A0", { from: [cy, cy], below: true });

  const vb = cy + 30;
  s.viewTitle((X(0) + X(18)) / 2, vb + 48, "Plan view · where the age lines fall", "Scale 1 year = 30 px · ages 0 to 18 · one row per regime");
  const viewBottom = vb + 61;

  // ---- Variable table ----
  s.comment("Variable table");
  const widths = [44, 270, 110], tw = widths.reduce((a, b) => a + b, 0);
  const t = s.table(W / 2 - tw / 2, viewBottom + 56, "Variables · years", [
    ["A0", "adulthood in every regime shown", "A1+A2+A3 = 18"],
    ["A1", "COPPA child; Utah \"child\"; ESRB T starts", "13"],
    ["A2", "Utah \"younger teenager\"", "16 − 13 = 3"],
    ["A3", "Utah \"older teenager\"", "18 − 16 = 2"],
    ["R1", "PEGI default for paid random items, from June 2026", "16"],
  ], { widths });
  s.height = Math.ceil(t.y + 30);
  return s.toString();
}
