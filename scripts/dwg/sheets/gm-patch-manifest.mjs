// One chunked release as an exploded stack (install, chunks, bundles,
// manifest), the client's steps beside it, and the published figures.
// Embedded in content/books/gaming/patching.md.
import { sheet } from "../kit.mjs";

// Plate 300 x 200; with a 66 step a lower plate shows only local y > ~80,
// so lower-layer modules sit in the front band y 90..186.
const W = 300, D = 200;

// Content-defined chunk widths: uneven on purpose.
const CH = [14, 22, 10, 18, 26, 12, 16, 20, 11, 24, 15, 19, 13];

const layers = [
  {
    label: "01 · Install",
    sub: "game files · Game.db · W1 slices",
    draw: (p) => [
      // Game files: a folder of files of different sizes.
      p.rect(16, 92, 150, 92, "obj fill-2"),
      ...[[26, 102, 60, 34], [92, 102, 64, 20], [92, 128, 64, 46], [26, 142, 60, 32]].map(([x, y, w, h]) => p.rect(x, y, w, h, "obj fill-1")),
      // Game.db: the local index, a drum.
      p.path("M196,104v62a28,9 0 0 0 56,0v-62", "obj fill-2"),
      p.path("M196,104a28,9 0 0 1 56,0a28,9 0 0 1 -56,0Z", "obj fill-1"),
      p.path("M196,126a28,9 0 0 0 56,0M196,146a28,9 0 0 0 56,0", "ext"),
    ],
  },
  {
    label: "02 · Chunks",
    sub: "content-defined · 64-bit ids · zstd 19",
    draw: (p) => {
      const out = [];
      for (const [r, y] of [[0, 98], [1, 124], [2, 150]]) {
        let x = 16;
        for (let i = 0; x < 270; i++) {
          const w = CH[(i + r * 5) % CH.length];
          out.push(p.rect(x, y, w, 20, (i + r) % 4 === 1 ? "obj fill-1" : "obj fill-2"));
          x += w + 3;
        }
      }
      return out;
    },
  },
  {
    label: "03 · Bundles",
    sub: "CDN objects · B1 · S1 reused",
    draw: (p) => [
      // Bundles: groups of chunks; three reused, one new.
      ...[16, 86, 156].flatMap((x) => [p.rect(x, 92, 62, 92, "obj fill-2"), ...[104, 124, 144, 164].map((y, i) => p.rect(x + 8, y - 6, 46 - (i % 2) * 12, 12, "obj fill-1"))]),
      p.rect(226, 92, 58, 92, "slot"),
      ...[104, 124, 144].map((y) => p.rect(234, y - 6, 40, 12, "obj fill-2")),
    ],
  },
  {
    label: "04 · Release manifest",
    sub: "signed binary schema · M1",
    draw: (p) => [
      p.rect(0, 0, W, D, "obj hl"),
      // Signature header, then the chunk list.
      p.rect(20, 20, 260, 26, "obj fill-2"),
      p.circle(262, 33, 7, "obj"),
      ...[62, 80, 98, 116, 134, 152, 170].map((y, i) => p.rect(20, y, 200 - (i % 3) * 30, 10, "obj fill-2")),
    ],
  },
];

export default function draw() {
  const s = sheet({ prefix: "gm-pm", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Only a signed manifest loads; its chunk list is compared with Game.db."],
    [2, "Missing chunks arrive by multipart range requests over 8 connections."],
    [3, "Writes go in place, in slices up to 64 MB on chunk boundaries, with Game.db committed after each slice."],
    [0, "Published figures, July 2019, for one game's data. Not to scale; plate contents are schematic."],
  ], { width: 690 });

  const gap = 66, top = (layers.length - 1) * gap;
  const tx = 330, ty = ny + 36 + top;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap, labelX: 230, layers });

  // Client steps beside the stack, top down.
  const ax = P(W, 0, 0)[0] + 30;
  const [, yTop] = P(W, D * 0.4, top);
  const [, yBot] = P(W, D * 0.4, 0);
  s.comment("Client steps");
  s.path(`M${ax},${yTop}V${yBot}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
  [["verify, diff", 1], ["range requests", 2], ["write in place", 3]].forEach(([t, n], i) => {
    const [, y] = P(W, D * 0.4, top - (i + 0.5) * gap);
    s.text(ax + 10, y + 3, t, "sl ink");
    s.nb(ax + 16, y + 15, n);
  });

  const [, yFront] = P(W, D, 0);
  const left = P(0, D, 0)[0];
  const vy = Math.max(yFront, yBot) + 40;
  s.viewTitle((left + P(W, 0, 0)[0]) / 2, vy, "Exploded view · one release", "Axonometric · not to scale · install at the bottom");

  s.comment("Variable table");
  const tb = s.table(210, vy + 56, "Published figures", [
    ["C1", "chunks in a release", "> 300,000"],
    ["B1", "bundles the chunks are grouped into", "< 5,000"],
    ["R1", "HTTP requests, full download", "R1 ≤ B1, so ≤ 5,000"],
    ["S1", "bundles shared with the previous version", "> 85%"],
    ["D1", "chunks removed by deduplication", "about 10%"],
    ["A1", "average chunk, example (16 zero bits)", "64 KB"],
    ["M1", "release manifest", "about 8 MB"],
    ["W1", "largest write slice / bytes in flight", "64 / 128 MB"],
  ]);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
