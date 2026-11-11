// GeoJSON's seven geometry types as small drawings, each with the nesting
// of its "coordinates" array. Polygon is accented: it's the type with rules
// (closed rings, winding, holes). Embedded in
// content/docs/fundamentals/coordinates-and-geometry.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gjt", width: W });

  // Grid: four cells on the first row, three centered on the second.
  const cw = 165,
    gap = 20,
    ph = 78; // drawing area height per cell
  const rowY = [20, 156];
  const x1 = (W - (4 * cw + 3 * gap)) / 2;
  const x2 = (W - (3 * cw + 2 * gap)) / 2;
  const cell = (row, i) => ({ x: (row ? x2 : x1) + i * (cw + gap), y: rowY[row] });

  const dot = (x, y) =>
    s.path(`M${x - 2.2},${y}a2.2,2.2 0 1,0 4.4,0a2.2,2.2 0 1,0 -4.4,0`, "dot");
  const ring = (pts) => `M${pts.map(([x, y]) => `${x},${y}`).join("L")}Z`;
  const rect = (x, y, w, h) => ring([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  const line = (pts) => {
    s.wire(pts, { arrow: "none" });
    pts.forEach(([x, y]) => dot(x, y));
  };
  const caption = (c, name, shape) => {
    s.text(c.x + cw / 2, c.y + ph + 18, name, "tc", "middle");
    s.text(c.x + cw / 2, c.y + ph + 34, shape, "tc", "middle");
  };

  s.comment("Point");
  let c = cell(0, 0);
  dot(c.x + cw / 2, c.y + ph / 2);
  caption(c, "Point", "[x, y]");

  s.comment("MultiPoint");
  c = cell(0, 1);
  [
    [0.25, 0.3],
    [0.55, 0.2],
    [0.4, 0.7],
    [0.75, 0.6],
  ].forEach(([fx, fy]) => dot(c.x + fx * cw, c.y + fy * ph));
  caption(c, "MultiPoint", "[[x, y], ...]");

  s.comment("LineString");
  c = cell(0, 2);
  {
    const L = c.x + 30,
      R = c.x + cw - 30,
      T = c.y + 16,
      B = c.y + ph - 16;
    line([
      [L, B],
      [L + 40, B],
      [L + 40, T],
      [R, T],
    ]);
  }
  caption(c, "LineString", "[[x, y], ...]");

  s.comment("MultiLineString");
  c = cell(0, 3);
  {
    const L = c.x + 26,
      R = c.x + cw - 26;
    line([
      [L, c.y + 18],
      [L + 50, c.y + 18],
      [L + 50, c.y + 40],
    ]);
    line([
      [R - 60, c.y + ph - 14],
      [R, c.y + ph - 14],
      [R, c.y + 30],
    ]);
  }
  caption(c, "MultiLineString", "[[[x, y], ...], ...]");

  s.comment("Polygon with a hole, the accented type");
  c = cell(1, 0);
  {
    const w = 104,
      h = ph - 12,
      x = c.x + (cw - w) / 2,
      y = c.y + 6;
    s.path(rect(x, y, w, h) + rect(x + 34, y + 20, 36, 26), "obj hl", { "fill-rule": "evenodd" });
  }
  caption(c, "Polygon", "[[[x, y], ...], hole, ...]");

  s.comment("MultiPolygon");
  c = cell(1, 1);
  s.path(rect(c.x + 22, c.y + 10, 52, 40), "obj fill-1");
  s.path(rect(c.x + 92, c.y + 30, 52, 40), "obj fill-1");
  caption(c, "MultiPolygon", "[[[[x, y], ...]], ...]");

  s.comment("GeometryCollection");
  c = cell(1, 2);
  dot(c.x + 30, c.y + 22);
  line([
    [c.x + 24, c.y + ph - 14],
    [c.x + 74, c.y + ph - 14],
    [c.x + 74, c.y + 44],
  ]);
  s.path(rect(c.x + 98, c.y + 12, 44, 38), "obj fill-1");
  caption(c, "GeometryCollection", "geometries: [...]");

  s.height = rowY[1] + ph + 34 + 20;
  return s.toString();
}
