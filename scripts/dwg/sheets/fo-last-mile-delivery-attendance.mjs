// Attended against unattended delivery: the same depot and six stops on a
// street grid. Alternating two-hour windows make the attended route serve
// A, C, E and then B, D, F, crossing itself; with no windows the route is
// one loop. Orthogonal legs read as streets. Embedded in
// content/books/field-operations/last-mile-delivery.md.
import { sheet } from "../kit.mjs";

// Stop centers in panel units, and the attended windows with where each
// label sits (a: above, r: right) so it clears the legs.
const STOPS = { A: [80, 50], B: [170, 30], C: [260, 50], D: [260, 150], E: [170, 170], F: [80, 150] };
const WINDOWS = { A: ["8-10", "a"], B: ["10-12", "a"], C: ["8-10", "a"], D: ["10-12", "r"], E: ["8-10", "r"], F: ["10-12", "a"] };
const SW = 24, SH = 20;

// Legs as polylines in panel units: ports of the stop boxes and the corners
// between them.
const L = (k, side) => {
  const [cx, cy] = STOPS[k];
  return { l: [cx - SW / 2, cy], r: [cx + SW / 2, cy], t: [cx, cy - SH / 2], b: [cx, cy + SH / 2] }[side];
};
const DEPOT_OUT = [[35, 90], [35, 50], L("A", "l")];
const DEPOT_IN = [L("F", "l"), [35, 150], [35, 110]];
const ATTENDED = [
  DEPOT_OUT,
  [L("A", "r"), L("C", "l")],
  [L("C", "b"), [260, 100], [170, 100], L("E", "t")],
  [L("E", "l"), [130, 170], [130, 30], L("B", "l")],
  [L("B", "r"), [210, 30], [210, 150], L("D", "l")],
  [L("D", "b"), [260, 195], [80, 195], L("F", "b")],
  DEPOT_IN,
];
const UNATTENDED = [
  DEPOT_OUT,
  [L("A", "r"), [170, 50], L("B", "b")],
  [L("B", "r"), [260, 30], L("C", "t")],
  [L("C", "b"), L("D", "t")],
  [L("D", "b"), [260, 170], L("E", "r")],
  [L("E", "l"), [80, 170], L("F", "b")],
  DEPOT_IN,
];

export default function draw() {
  const W = 760, x = 20, pw = 345, ph = 222, gy = 34;
  const s = sheet({ prefix: "fo-lmd-att", width: W });

  const panel = (gx, title, legs, windows, rows, hl) => {
    s.comment(title);
    s.group(gx, gy, pw, ph, title, { hl });
    const ox = gx + 18, oy = gy + 14;
    const P = ([px, py]) => [ox + px, oy + py];
    s.node(ox + 10, oy + 90, 50, 20, "depot", { end: true, fill: 1 });
    for (const [k, [cx, cy]] of Object.entries(STOPS)) {
      s.node(ox + cx - SW / 2, oy + cy - SH / 2, SW, SH, k, { code: true });
      if (!windows) continue;
      const [t, side] = windows[k];
      if (side === "a") s.text(ox + cx, oy + cy - SH / 2 - 5, t, "tc", "middle");
      else s.text(ox + cx + SW / 2 + 6, oy + cy + 3, t, "tc");
    }
    for (const leg of legs) s.wire(leg.map(P), { hl });
    const ty = gy + ph + 22;
    rows.forEach(([k, v, vhl], i) => {
      s.text(gx, ty + i * 16, k, "th");
      s.text(gx + 56, ty + i * 16, v, vhl ? "tc hl" : "tc");
    });
    return ty + (rows.length - 1) * 16;
  };

  panel(x, "attended: someone must be home", ATTENDED, WINDOWS, [
    ["order", "A C E, then B D F"],
    ["shape", "crosses itself"],
    ["risk", "a missed window"],
  ]);
  const by = panel(W - x - pw, "unattended: nobody needs to be home", UNATTENDED, null, [
    ["order", "A B C D E F"],
    ["shape", "one loop", true],
    ["risk", "access, theft, proof"],
  ], true);

  const fy = by + 28;
  s.text(x, fy, "illustrative: the same six stops and depot; only the windows differ", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
