// One short string measured four ways: UTF-8 bytes, UTF-16 code units,
// code points and grapheme clusters. Embedded in
// content/docs/fundamentals/text-and-unicode.md (Four Lengths).
import { sheet } from "../kit.mjs";

// "e" + COMBINING ACUTE ACCENT, then THUMBS UP SIGN + skin tone modifier.
// Bytes per RFC 3629, UTF-16 units per the code point range, clusters per UAX #29.
const CPS = [
  { cp: "U+0065", bytes: ["65"], units: ["0065"] },
  { cp: "U+0301", bytes: ["CC", "81"], units: ["0301"] },
  { cp: "U+1F44D", bytes: ["F0", "9F", "91", "8D"], units: ["D83D", "DC4D"] },
  { cp: "U+1F3FD", bytes: ["F0", "9F", "8F", "BD"], units: ["D83C", "DFFD"] },
];
const CLUSTERS = [
  { label: "cluster 1 · e + accent", cps: [0, 1] },
  { label: "cluster 2 · thumbs up + tone", cps: [2, 3] },
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fd-tu", width: W });

  s.comment("Notes");
  const ny = s.notes(
    32,
    40,
    [
      [
        1,
        "UTF-8: one to four bytes per code point. This is what a database column, a file and the wire hold.",
      ],
      [
        2,
        "UTF-16: one code unit below U+10000, two (a surrogate pair) above. JavaScript, Java and C# lengths count these.",
      ],
      [
        3,
        "Code points: what Go's runes and Rust's chars count. A combining accent and a skin tone are code points of their own.",
      ],
      [
        4,
        "Grapheme clusters (UAX #29): what a reader sees as one character. Limits, truncation and cursors use these.",
      ],
      [0, "Every row is aligned to the UTF-8 bytes of the same text. Values in the table."],
    ],
    { width: 690 },
  );

  const totalBytes = CPS.reduce((n, c) => n + c.bytes.length, 0);
  const k = 52; // px per byte
  const x0 = (W - totalBytes * k) / 2 + 30;
  const starts = CPS.reduce((acc, c) => [...acc, acc[acc.length - 1] + c.bytes.length], [0]);
  const X = (byteIndex) => x0 + byteIndex * k;
  const h = 26,
    gap = 18;
  const rowY = [0, 1, 2, 3].map((i) => ny + 46 + i * (h + gap));
  const names = ["bytes", "UTF-16", "code points", "clusters"];
  names.forEach((n, i) => s.text(x0 - 12, rowY[i] + h / 2 + 3, n, "sl ink", "end"));
  names.forEach((_, i) => s.nb(x0 - 12 - 92, rowY[i] + h / 2 - 7.5, i + 1));

  s.comment("Row 1: UTF-8 bytes");
  CPS.forEach((c, ci) =>
    c.bytes.forEach((b, bi) => {
      const x = X(starts[ci] + bi);
      s.rect(x, rowY[0], k, h, "obj fill-2");
      s.label(x, rowY[0], k, h, b);
    }),
  );

  s.comment("Row 2: UTF-16 code units");
  CPS.forEach((c, ci) => {
    const w = (c.bytes.length * k) / c.units.length;
    c.units.forEach((u, ui) => {
      const x = X(starts[ci]) + ui * w;
      s.rect(x, rowY[1], w, h, "obj fill-2");
      s.label(x, rowY[1], w, h, u);
    });
  });

  s.comment("Row 3: code points");
  CPS.forEach((c, ci) => {
    const x = X(starts[ci]),
      w = c.bytes.length * k;
    s.rect(x, rowY[2], w, h, "obj fill-1");
    s.label(x, rowY[2], w, h, c.cp);
  });

  s.comment("Row 4: grapheme clusters");
  const clusterXs = [X(0)];
  CLUSTERS.forEach((g) => {
    const a = X(starts[g.cps[0]]),
      b = X(starts[g.cps[g.cps.length - 1] + 1]);
    s.rect(a, rowY[3], b - a, h, "obj fill-1");
    s.label(a, rowY[3], b - a, h, g.label);
    clusterXs.push(b);
  });

  const bot = rowY[3] + h;
  s.chainH(clusterXs, bot + 20, ["G1", "G2"], { from: clusterXs.map(() => bot), below: true });
  s.dimH(X(0), X(totalBytes), rowY[0] - 18, "B1", { from: [rowY[0], rowY[0]], hl: true });

  s.viewTitle(
    X(totalBytes / 2),
    bot + 64,
    "Plan view · one string, four lengths",
    "Scale 1 byte = 52 px · aligned to UTF-8",
  );

  s.comment("Variable table");
  const tb = s.table(X(totalBytes / 2) - 200, bot + 100, "Variables", [
    ["B1", "UTF-8 bytes", "1 + 2 + 4 + 4 = 11"],
    ["U1", "UTF-16 code units", "1 + 1 + 2 + 2 = 6"],
    ["C1", "code points", "4"],
    ["G1", "cluster 1 bytes, e + U+0301", "1 + 2 = 3"],
    ["G2", "cluster 2 bytes, U+1F44D + U+1F3FD", "4 + 4 = 8"],
    ["N1", "grapheme clusters", "2"],
    ["G1 (NFC)", "cluster 1 composed to U+00E9", "2 bytes, 1 code point"],
  ]);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
