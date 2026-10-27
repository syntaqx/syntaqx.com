// The payment key hierarchy as a standard diagram: the master key inside
// the HSM, three key-encrypting keys under it, a working key under each, in
// lanes by layer. The PIN path from a terminal is accented. Embedded in
// content/books/payments/key-management.md.
import { sheet } from "../kit.mjs";

const COLS = [
  {
    kek: ["zone master key (ZMK)", "shared with a partner,", "in parts"],
    work: ["zone PIN key (ZPK)", "PINs on one link,", "changed often"],
  },
  {
    kek: ["terminal KEK", "loads terminals", "remotely (TR-34)"],
    work: ["DUKPT keys", "BDK to device keys,", "new key per transaction"],
    hl: true,
  },
  {
    kek: ["vault KEK", "wraps the data keys"],
    work: ["data keys", "card numbers at rest,", "envelope-style"],
  },
];

export default function draw() {
  const W = 760, x = 20, titleW = 160, gap = 24, bh = 50, pad = 14;
  const s = sheet({ prefix: "kh", width: W });
  const cw = (W - 2 * x - titleW - gap * (COLS.length - 1)) / COLS.length;
  const X = (i) => x + titleW + i * (cw + gap);

  const [L0, L1, L2] = s.lanes({
    x, y: 20, w: W - 2 * x, titleW,
    lanes: [
      { label: "Inside the HSM", sub: "clear only here", h: 36 + 2 * pad + 6 },
      { label: "Key-encrypting keys", sub: "stored encrypted\nunder the master key", h: bh + 2 * pad + 8 },
      { label: "Working keys", sub: "stored encrypted\nunder their KEK", h: bh + 2 * pad + 8 },
    ],
  });

  // A key box: name on top, what it does in gray under it.
  const key = (bx, by, [name, ...sub], hl) => s.node(bx, by, cw, bh, name, { hl, sub });

  s.comment("Master key");
  const master = s.node(X(0), L0.y + pad + 3, W - x - X(0), 36, "master key", { fill: 1, sub: "never leaves; every key below is stored encrypted under it" });

  COLS.forEach((c, i) => {
    s.comment(c.kek[0]);
    const kek = key(X(i), L1.y + pad + 4, c.kek);
    const work = key(X(i), L2.y + pad + 4, c.work, c.hl);
    s.wire([[kek.cx, master.y + master.h], kek.port("t")], { hl: c.hl });
    s.connect(kek, work, { from: "b", to: "t", hl: c.hl });
  });

  const fy = L2.y + L2.h + 24;
  s.text(x, fy, "outside the HSM, every key is stored and exchanged as a key block (X9.143), bound to one purpose", "sl");
  s.height = Math.ceil(fy + 16);
  return s.toString();
}
