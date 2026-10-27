// Weighting by time versus by distance as a standard diagram: two panels
// with the same depot and six stops on a grid, a highway along the top. The
// time-weighted route (the cheaper one) is in the accent; the totals sit
// under each panel. Embedded in content/books/field-operations/route-objectives.md.
import { sheet } from "../kit.mjs";

const PANELS = [
  {
    title: "weighted by time: cost per hour",
    hl: true,
    stats: ["C D E B A F", "3.0 h, 92 mi", "7.5 h, no overtime", "$407.42"],
  },
  {
    title: "weighted by distance: cost per mile",
    hl: false,
    stats: ["F E D C B A", "4.0 h, 58 mi", "8.5 h, 0.5 h overtime", "$437.83"],
  },
];
const STAT_LABELS = ["order", "drive", "day", "cost"];

export default function draw() {
  const W = 760, pw = 350, ph = 200, gy = 40;
  const s = sheet({ prefix: "fo-rowt", width: W });
  const sw = 26, sh = 22; // a stop
  let bottom = 0;

  PANELS.forEach((p, k) => {
    const gx = 20 + k * (pw + 20);
    s.comment(p.title);
    s.group(gx, gy, pw, ph, p.title, { hl: p.hl });

    // Highway along the top, surface streets below it.
    const hy = gy + 40;
    s.rect(gx + 20, hy - 3, pw - 40, 6, "obj fill-2");
    s.text(gx + pw - 20, hy - 10, "highway: longer, faster", "sl", "end");
    s.text(gx + pw / 2, gy + ph - 12, "surface streets: shorter, slower", "sl", "middle");

    // Stops on a grid: A B C over F E D, the depot left of the middle.
    const cols = [gx + 130, gx + 210, gx + 290];
    const r1 = gy + 88, r2 = gy + 150;
    const stop = (c, cy, l) => s.node(cols[c] - sw / 2, cy - sh / 2, sw, sh, l);
    const A = stop(0, r1, "A"), B = stop(1, r1, "B"), C = stop(2, r1, "C");
    const F = stop(0, r2, "F"), E = stop(1, r2, "E"), D = stop(2, r2, "D");
    const depot = s.node(gx + 22, (r1 + r2) / 2 - 12, 60, 24, "depot", { end: true });

    const o = { hl: p.hl };
    if (p.hl) {
      // Out on the highway to the far stop, back on local streets.
      s.wire([depot.port("t"), [depot.cx, hy], [C.cx, hy], C.port("t")], o);
      s.connect(C, D, { from: "b", to: "t", ...o });
      s.connect(D, E, { from: "l", to: "r", ...o });
      s.connect(E, B, { from: "t", to: "b", ...o });
      s.connect(B, A, { from: "l", to: "r", ...o });
      s.connect(A, F, { from: "b", to: "t", ...o });
      s.wire([F.port("l"), [depot.cx, F.cy], depot.port("b")], o);
    } else {
      // A compact loop on surface streets.
      s.wire([depot.port("b"), [depot.cx, F.cy], F.port("l")]);
      s.connect(F, E);
      s.connect(E, D);
      s.connect(D, C, { from: "t", to: "b" });
      s.connect(C, B, { from: "l", to: "r" });
      s.connect(B, A, { from: "l", to: "r" });
      s.wire([A.port("l"), [depot.cx, A.cy], depot.port("t")]);
    }

    // Totals under the panel.
    const ty = gy + ph + 22;
    STAT_LABELS.forEach((l, i) => {
      const y = ty + i * 15;
      s.text(gx + 10, y, l, "sl");
      s.text(gx + 60, y, p.stats[i], i === 3 && p.hl ? "tc hl" : "tc");
      bottom = y;
    });
  });

  s.comment("Assumptions");
  const fy = bottom + 24;
  s.text(20, fy, "illustrative: 270 service minutes, 8 h regular day, $45/h labor, $67.50/h overtime, $0.76/mi", "tc");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
