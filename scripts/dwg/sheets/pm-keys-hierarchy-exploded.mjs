// The payment key hierarchy as an exploded axonometric stack, master key on
// top, with NIST's suggested cryptoperiods in the table. Plate contents are
// schematic. Embedded in content/books/payments/key-management.md.
import { sheet, widthOf } from "../kit.mjs";

// Plate 300 x 200; with a 66 step a lower plate shows only local y > ~76,
// so lower layers keep their modules in the front band y 88..186.
const W = 300, D = 200;

// A key glyph in plate coordinates: bow at (x, y), shaft to the right, two teeth.
const key = (p, x, y, cls = "obj fill-1") => [
  p.circle(x, y, 8, cls),
  p.line(x + 8, y, x + 40, y, "obj"),
  p.line(x + 30, y, x + 30, y + 8, "obj"),
  p.line(x + 38, y, x + 38, y + 6, "obj"),
];

const layers = [
  {
    label: "04 · Protected data",
    sub: "PIN blocks · device keys · card numbers",
    draw: (p) => [
      // PIN blocks: fixed 8-byte blocks.
      p.rect(16, 92, 80, 92, "obj fill-2"),
      ...[104, 124, 144, 164].flatMap((y) => [0, 1, 2, 3].map((c) => p.rect(24 + c * 17, y, 13, 12, "obj fill-1"))),
      // Device keys: one key per terminal.
      p.rect(110, 92, 80, 92, "obj fill-2"),
      ...[110, 138, 166].flatMap((y) => key(p, 126, y, "slot")),
      // Card numbers: rows of four digit groups.
      p.rect(204, 92, 80, 92, "obj fill-2"),
      ...[106, 124, 142, 160].flatMap((y) => [0, 1, 2, 3].map((c) => p.rect(212 + c * 16, y, 12, 10, "obj fill-1"))),
    ],
  },
  {
    label: "03 · Working keys",
    sub: "ZPK · BDK · data keys (C3, C4)",
    draw: (p) => [
      // ZPK: one zone PIN key.
      p.rect(16, 92, 80, 92, "obj fill-2"),
      ...key(p, 34, 138),
      // BDK: a base key and the device keys derived from it.
      p.rect(110, 92, 80, 92, "obj fill-2"),
      ...[126, 150, 174].map((x) => p.line(150, 116, x, 160, "ext")),
      p.circle(150, 112, 8, "obj fill-1"),
      ...[126, 150, 174].map((x) => p.circle(x, 164, 5, "slot")),
      // Data keys: versioned keys, the current one in front.
      p.rect(204, 92, 80, 92, "obj fill-2"),
      ...[0, 1, 2].map((i) => p.rect(218 + i * 6, 104 + i * 14, 50, 36, i === 2 ? "obj fill-1" : "slot")),
    ],
  },
  {
    label: "02 · Key-encrypting keys",
    sub: "ZMK · terminal KEK · vault KEK (C2)",
    draw: (p) => [
      // ZMK, terminal KEK and vault KEK, each a wrapping key.
      ...[16, 110, 204].flatMap((x) => [p.rect(x, 92, 80, 92, "obj fill-2"), p.rect(x + 10, 112, 60, 52, "slot"), ...key(p, x + 22, 138)]),
    ],
  },
  {
    label: "01 · Master key",
    sub: "LMK or MFK · clear only in the HSM",
    draw: (p) => [
      // The HSM boundary with the master key inside it.
      p.rect(70, 40, 160, 120, "obj fill-2"),
      p.rect(84, 54, 132, 92, "slot"),
      p.circle(124, 100, 13, "obj hl"),
      p.line(137, 100, 186, 100, "obj hl"),
      p.line(170, 100, 170, 112, "obj hl"),
      p.line(182, 100, 182, 109, "obj hl"),
    ],
  },
];

export default function draw() {
  const s = sheet({ prefix: "pm-ks", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Each layer is encrypted under the one above. A rotation touches only the layer below: a new KEK re-wraps data keys, a new data key re-encrypts data."],
    [2, "NIST SP 800-57 Part 1 Rev. 5, Table 1: general suggestions. PCI DSS 3.7.4 asks for a defined cryptoperiod per key type, and it may be shorter."],
    [0, "Not to scale. Layers separated along the stack axis; plate contents are schematic."],
  ], { width: 690 });

  const gap = 66, top = (layers.length - 1) * gap;
  const tx = 380, ty = ny + 30 + top;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap, labelX: 270, layers });

  // Wrapping direction, beside the stack.
  const ax = P(W, 0, 0)[0] + 40;
  const [, yTop] = P(W, 0, top);
  const [, yBot] = P(W, D, 0);
  s.comment("Wrapping direction");
  s.path(`M${ax},${yTop}V${yBot}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
  s.text(ax, yTop - 18, "wraps", "sl ink", "middle");
  s.text(ax, yTop - 7, "down", "sl ink", "middle");
  s.nb(ax + 30, yTop - 10.5, 1);

  const left = P(0, D, 0)[0];
  const vy = yBot + 34;
  s.viewTitle((left + P(W, 0, 0)[0]) / 2, vy, "Exploded view · payment key hierarchy", "Axonometric · not to scale · master key at the top");

  s.comment("Cryptoperiods");
  const rows = [
    ["C2", "key-encrypting key, wrapping use", "< 2 years"],
    ["C3", "data key, encrypting use (originator-usage)", "< 2 years"],
    ["C4", "data key, decrypting use (recipient-usage)", "< C3 + 3 years"],
  ];
  const widths = [50, 280, 130];
  const tw = widths.reduce((a, b) => a + b, 0);
  const title = "Cryptoperiods · suggested maxima";
  const tx0 = 380 - tw / 2, ty0 = vy + 13 + 56;
  const tb = s.table(tx0, ty0, title, rows, { widths });
  s.nb(tx0 + widthOf(title, "vt") + 4, ty0 - 11, 2);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
