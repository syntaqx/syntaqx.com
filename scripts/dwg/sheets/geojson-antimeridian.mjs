// A shape from 165°E to 165°W on a flat world map. Cut at 180° (accented),
// it draws as two slivers at the map's edges; as one ring it draws the long
// way round, across everything else (dashed). Embedded in
// content/docs/fundamentals/coordinates-and-geometry.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gja", width: W });

  // One longitude scale for both rows: -180 at x0, 180 at x1.
  const x0 = 70,
    x1 = W - 70,
    X = (lon) => x0 + ((lon + 180) / 360) * (x1 - x0);
  const rowH = 44,
    rows = [44, 150];
  const rect = (a, b, y) => `M${a},${y}L${b},${y}L${b},${y + rowH}L${a},${y + rowH}Z`;

  s.comment("180° is both edges of the map: one meridian");
  for (const lon of [-180, 180]) s.line(X(lon), 24, X(lon), rows[1] + rowH + 10, "ctr");
  s.text(X(-180), 18, "180°", "tc", "middle");
  s.text(X(180), 18, "180°", "tc", "middle");
  s.text(W / 2, 18, "the same meridian, at both edges of a flat map", "nt", "middle");

  s.comment("Cut in two: drawn correctly");
  s.path(rect(X(165), X(180), rows[0]) + rect(X(-180), X(-165), rows[0]), "obj hl");
  s.text(W / 2, rows[0] + rowH / 2 + 4, "cut at 180°: two parts", "sl hl", "middle");
  s.text(X(165) - 8, rows[0] + rowH / 2 + 4, "165°E", "tc", "end");
  s.text(X(-165) + 8, rows[0] + rowH / 2 + 4, "165°W", "tc", "start");
  s.text(W / 2, rows[0] + rowH + 20, '"bbox": [165, -10, -165, 10] · west > east', "tc", "middle");

  s.comment("One ring from 165 to -165: drawn the long way round");
  s.path(rect(X(-165), X(165), rows[1]), "obj phantom");
  s.text(
    W / 2,
    rows[1] + rowH / 2 + 4,
    "one ring, not cut: drawn across the rest of the world",
    "sl",
    "middle",
  );

  s.comment("Longitude scale");
  const ay = rows[1] + rowH + 22;
  s.line(X(-180), ay, X(180), ay, "dim");
  for (const lon of [-180, -90, 0, 90, 180]) {
    s.line(X(lon), ay - 3, X(lon), ay + 3, "dim");
    s.text(X(lon), ay + 16, String(lon), "tc", "middle");
  }

  s.height = ay + 30;
  return s.toString();
}
