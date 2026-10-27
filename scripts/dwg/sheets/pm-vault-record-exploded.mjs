// One stored card as an exploded axonometric stack: the key-encrypting key
// at the bottom, the token on top, bracketed by what can leave the vault.
// Plate contents are schematic. Embedded in
// content/books/payments/card-vault.md (Storing the Number).
import { sheet, widthOf } from "../kit.mjs";

// Plate 300 x 200; with a 62 step a lower plate shows only local y > ~83,
// so lower layers keep their modules in the front band y 92..184.
const W = 300, D = 200;

// A key glyph in plate coordinates: bow at (x, y), shaft to the right, two teeth.
const key = (p, x, y, cls = "obj fill-1") => [
  p.circle(x, y, 8, cls),
  p.line(x + 8, y, x + 40, y, cls === "slot" ? "slot" : "obj"),
  p.line(x + 30, y, x + 30, y + 8, cls === "slot" ? "slot" : "obj"),
  p.line(x + 38, y, x + 38, y + 6, cls === "slot" ? "slot" : "obj"),
];

const layers = [
  {
    label: "01 · Key-encrypting key",
    sub: "in the KMS or HSM, never here",
    draw: (p) => [
      // Only a reference: the key itself lives outside the record.
      p.rect(16, 96, 268, 84, "slot"),
      ...key(p, 120, 138, "slot"),
    ],
  },
  {
    label: "02 · Data key",
    sub: "wrapped by 01, with its version",
    note: 1,
    draw: (p) => [
      // The wrapped key blob.
      p.rect(16, 96, 170, 84, "obj fill-2"),
      p.rect(30, 112, 142, 52, "obj fill-1"),
      ...key(p, 70, 138, "obj fill-2"),
      // Its version.
      p.rect(200, 96, 84, 84, "obj fill-2"),
      ...[0, 1, 2].map((i) => p.rect(212, 108 + i * 22, 60, 14, i === 2 ? "obj fill-1" : "slot")),
    ],
  },
  {
    label: "03 · Card number",
    sub: "AES-256-GCM under its data key",
    note: 2,
    draw: (p) => [
      // Nonce, ciphertext, authentication tag.
      p.rect(16, 104, 40, 68, "obj fill-1"),
      p.rect(64, 104, 172, 68, "obj hl"),
      p.rect(244, 104, 40, 68, "obj fill-1"),
    ],
  },
  {
    label: "04 · Fingerprint",
    sub: "keyed hash: same card, same value",
    draw: (p) => [
      p.rect(16, 96, 268, 84, "obj fill-2"),
      ...Array.from({ length: 22 }, (_, i) => p.line(30 + i * 11.5, 166, 30 + i * 11.5, 166 - (12 + ((i * 7) % 5) * 10), "obj")),
    ],
  },
  {
    label: "05 · Card details",
    sub: "BIN · last four · brand · expiry",
    draw: (p) => [
      // BIN: six digits.
      p.rect(16, 96, 60, 84, "obj fill-2"),
      ...[0, 1, 2, 3, 4, 5].map((i) => p.rect(26 + (i % 2) * 22, 106 + Math.floor(i / 2) * 24, 18, 18, "obj fill-1")),
      // Last four.
      p.rect(86, 96, 60, 84, "obj fill-2"),
      ...[0, 1, 2, 3].map((i) => p.rect(96 + (i % 2) * 22, 116 + Math.floor(i / 2) * 26, 18, 18, "obj fill-1")),
      // Brand.
      p.rect(156, 96, 60, 84, "obj fill-2"),
      p.circle(178, 138, 13, "obj fill-1"), p.circle(194, 138, 13, "slot"),
      // Expiry: month and year.
      p.rect(226, 96, 58, 84, "obj fill-2"),
      p.rect(236, 112, 38, 22, "obj fill-1"), p.rect(236, 142, 38, 22, "obj fill-1"),
    ],
  },
  {
    label: "06 · Token",
    sub: "tok_ prefix, random, one tenant",
    draw: (p) => [
      // Tenant scope around the token: prefix, then the random body.
      p.rect(20, 50, 260, 100, "slot"),
      p.rect(36, 78, 46, 44, "obj fill-1"),
      p.rect(90, 78, 174, 44, "obj fill-2"),
      ...Array.from({ length: 12 }, (_, i) => p.circle(102 + i * 14.5, 100, 2.2, "dot")),
    ],
  },
];

export default function draw() {
  const s = sheet({ prefix: "pm-vr", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Rotating 01 re-wraps the data keys in 02 and leaves 03 alone; retiring a data key means re-encrypting its 03."],
    [2, "The security code is never in the record, not even encrypted: it lives in memory for one authorization."],
    [0, "Not to scale. Layers separated along the stack axis; plate contents are schematic."],
  ], { width: 690 });

  const gap = 62, top = (layers.length - 1) * gap;
  const tx = 340, ty = ny + 30 + top, labelX = 250;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap, labelX, layers });

  // Note boxes beside the layer titles that carry them.
  layers.forEach((L, i) => {
    if (!L.note) return;
    const [, ay] = P(0, D, i * gap);
    s.nb(labelX - widthOf(L.label, "lt") - 12, ay - 5.5, L.note);
  });

  // What leaves the vault: brackets beside the stack.
  s.comment("What leaves the vault");
  const bx = P(W, 0, 0)[0] + 18;
  const yAt = (i) => P(W, 0, i * gap)[1];
  const bracket = (i1, i2, l1, l2) => {
    const y1 = yAt(i2) - 4, y2 = yAt(i1) + 24;
    s.path(`M${bx},${y1}H${bx + 8}V${y2}H${bx}`, "leader");
    const c = (y1 + y2) / 2;
    s.text(bx + 16, c - 2, l1, "sl ink");
    s.text(bx + 16, c + 10, l2, "sl ink");
  };
  bracket(3, 5, "returned to", "the platform");
  bracket(0, 2, "stays in", "the vault");

  const [, yBot] = P(W, D, 0);
  const left = P(0, D, 0)[0];
  const vy = yBot + 34;
  s.viewTitle((left + P(W, 0, 0)[0]) / 2, vy, "Exploded view · one stored card", "Axonometric · not to scale · 01 at the bottom");
  s.height = Math.ceil(vy + 13 + 28);
  return s.toString();
}
