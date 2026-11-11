// A GeoJSON polygon on x (longitude) and y (latitude) axes: the exterior
// ring runs counterclockwise (accented), the hole clockwise, and the table
// lists the exterior ring's positions in order, closing on the first.
// Embedded in content/docs/fundamentals/coordinates-and-geometry.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gjr", width: W });

  // Plot on the left, positions table on the right.
  const ox = 60, // axes origin
    oy = 250;
  const L = 110, // exterior ring
    R = 330,
    T = 60,
    B = 210;
  const hL = 180, // hole
    hR = 260,
    hT = 105,
    hB = 160;

  const ring = (pts) => `M${pts.map(([x, y]) => `${x},${y}`).join("L")}Z`;

  s.comment("Area between the rings");
  s.path(
    ring([
      [L, B],
      [R, B],
      [R, T],
      [L, T],
    ]) +
      ring([
        [hL, hT],
        [hR, hT],
        [hR, hB],
        [hL, hB],
      ]),
    "obj fill-1",
    { "fill-rule": "evenodd" },
  );

  s.comment("Axes");
  s.wire(
    [
      [ox, oy],
      [R + 40, oy],
    ],
    { label: "x · longitude", side: "below" },
  );
  s.wire(
    [
      [ox, oy],
      [ox, T - 30],
    ],
    { label: "y · latitude", side: "right", rotate: true },
  );

  s.comment("Exterior ring, counterclockwise: 1 southwest, 2 southeast, 3 northeast, 4 northwest");
  const ext = [
    [L, B],
    [R, B],
    [R, T],
    [L, T],
  ];
  ext.forEach((p, i) => s.wire([p, ext[(i + 1) % 4]], { hl: true }));
  [
    [L - 12, B + 12],
    [R + 12, B + 12],
    [R + 12, T - 12],
    [L - 12, T - 12],
  ].forEach(([x, y], i) => s.nb(x, y, i + 1));
  s.text((L + R) / 2, B - 12, "exterior · counterclockwise", "sl hl", "middle");

  s.comment("Hole, clockwise");
  const hole = [
    [hL, hT],
    [hR, hT],
    [hR, hB],
    [hL, hB],
  ];
  hole.forEach((p, i) => s.wire([p, hole[(i + 1) % 4]]));
  s.text((hL + hR) / 2, hB + 18, "hole · clockwise", "sl", "middle");

  s.comment("The exterior ring's positions, as in the page's example");
  const rows = [
    ["1", "151.2140", "-33.8580"],
    ["2", "151.2165", "-33.8580"],
    ["3", "151.2165", "-33.8555"],
    ["4", "151.2140", "-33.8555"],
    ["5 = 1", "151.2140", "-33.8580"],
  ];
  const gx = 470;
  const g = s.grid(gx, 72, null, ["position", "x · longitude", "y · latitude"], rows, {
    rowH: 22,
    headH: 24,
    align: ["start", "end", "end"],
  });
  s.text(gx, g.y + 20, "the last position repeats the first", "nt");

  s.height = oy + 34;
  return s.toString();
}
