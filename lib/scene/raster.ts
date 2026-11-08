import { CYL_FRONT, cylSide, circle, type Projector, type Scene, type V2, type V3 } from "./iso";

/*
 * Tile geometry shared by the live canvas and the OG renderer. Every solid
 * face gets its own grid that fits it exactly (parallelograms on box faces
 * and planes, columns around cylinder sides, rings on their tops), so tile
 * rows run parallel to the outline and no tile crosses an edge. The haze
 * behind the drawing stays a plain screen grid. No DOM: plain arrays.
 */

/** Gap between tiles, as a share of the pitch. */
export const GAP = 0.3;

export const LEVELS = 4;
/** Level value for the brightest accent tiles. */
export const HOT = LEVELS + 1;
/** Level value for red (warn) tiles. */
export const WARN = HOT + 1;
/** Level value for green (good) tiles. */
export const GOOD = WARN + 1;
/** Level value for orange tiles. */
export const ORANGE = GOOD + 1;

export const BAYER: number[][] = (() => {
  let b = [[0]];
  for (let n = 1; n < 8; n *= 2) {
    const s = b.length;
    const out: number[][] = [];
    for (let y = 0; y < s * 2; y++) {
      out.push([]);
      for (let x = 0; x < s * 2; x++) {
        const q = [
          [0, 2],
          [3, 1],
        ][Math.floor(y / s)][Math.floor(x / s)];
        out[y].push(b[y % s][x % s] * 4 + q);
      }
    }
    b = out;
  }
  return b.map((r) => r.map((v) => (v + 0.5) / 64));
})();

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** A tile: its outline in output units and its level (1..LEVELS, HOT, WARN, GOOD, ORANGE). */
export interface Tile {
  pts: V2[];
  lv: number;
  /** The face's color mark: 0 plain, 1 accent, 2 warn, 3 good, 4 orange. */
  mark: number;
}

/** A face as a parametric surface in output units, u and v in 0..1. */
interface Face {
  fn: (u: number, v: number) => V2;
  outline: V2[];
  bounds: [number, number, number, number];
  nu: number;
  nv: number;
  /** Discs: concentric rings instead of a u×v grid. */
  rings?: number;
  /** Points per u edge of a cell; more for curved surfaces. */
  steps: number;
  tone: (u: number) => number;
  /** 0 plain, 1 accent, 2 warn, 3 good, 4 orange */
  mark: number;
}

const dist = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const bilerp =
  (A: V2, B: V2, C: V2, D: V2) =>
  (u: number, v: number): V2 => [
    A[0] + (B[0] - A[0]) * u + (D[0] - A[0]) * v + (A[0] - B[0] + C[0] - D[0]) * u * v,
    A[1] + (B[1] - A[1]) * u + (D[1] - A[1]) * v + (A[1] - B[1] + C[1] - D[1]) * u * v,
  ];

/** Length of a face's u (or v) line at a fixed value of the other parameter. */
function arcLen(fn: Face["fn"], along: "u" | "v", at: number, n = 16) {
  let len = 0;
  let prev = along === "u" ? fn(0, at) : fn(at, 0);
  for (let k = 1; k <= n; k++) {
    const p = along === "u" ? fn(k / n, at) : fn(at, k / n);
    len += dist(prev, p);
    prev = p;
  }
  return len;
}

function bounds(pts: V2[]): Face["bounds"] {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of pts) {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  }
  return [x0, y0, x1, y1];
}

function inside(f: Face, x: number, y: number) {
  const [x0, y0, x1, y1] = f.bounds;
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const pts = f.outline;
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Lambert-ish tone for a cylinder column facing world angle `th`. */
function cylTone(th: number, lit: boolean, light: number) {
  const thL = Math.PI / 2 - (light + 1) * (Math.PI / 4) - 0.2;
  const s = Math.max(0, Math.cos(th - thL));
  return lit ? 0.35 + 0.6 * s : 0.12 + 0.48 * s;
}

function quadFace(pts: V2[], g: number, tone: number, mark: number): Face {
  const fn = bilerp(pts[0], pts[1], pts[2], pts[3]);
  return {
    fn,
    outline: pts,
    bounds: bounds(pts),
    nu: Math.max(1, Math.round(dist(pts[0], pts[1]) / g)),
    nv: Math.max(1, Math.round(dist(pts[0], pts[3]) / g)),
    steps: 1,
    tone: () => tone,
    mark,
  };
}

/** The scene's solid faces in painter's order, in output units. */
function faces(scene: Scene, P: Projector, g: number, light: number): Face[] {
  const out: Face[] = [];
  for (const p of scene.parts) {
    if (p.kind === "plane" && !p.dashed) {
      const pts = p.pts.map(P);
      const tone = p.v + 0.03;
      if (pts.length === 4) out.push(quadFace(pts, g, tone, 0));
      // Any other polygon: a fan of triangles, each a quad with a collapsed corner.
      else
        for (let k = 1; k + 1 < pts.length; k++)
          out.push(quadFace([pts[0], pts[k], pts[k + 1], pts[k + 1]], g, tone, 0));
    }
    if (p.kind === "box" && !p.ghost) {
      const b = p.box;
      const lit = !p.soft && !!(p.accent || p.warn || p.good || p.orange);
      const mark =
        p.soft && (p.warn || p.good || p.orange)
          ? 0
          : p.warn
            ? 2
            : p.good
              ? 3
              : p.orange
                ? 4
                : p.accent
                  ? 1
                  : 0;
      // Three tones: light top, mid left, dark right; the pointer swings left and right.
      out.push(quadFace(b.left.map(P), g, (lit ? 0.66 : 0.42) - light * 0.16, mark));
      out.push(quadFace(b.right.map(P), g, (lit ? 0.44 : 0.2) + light * 0.16, mark));
      out.push(quadFace(b.top.map(P), g, lit ? 1 : 0.7, mark));
    }
    if (p.kind === "cyl") {
      const lit = !p.soft && !!(p.accent || p.warn || p.good);
      const mark = lit ? (p.warn ? 2 : p.good ? 3 : 1) : 0;
      const rt = p.rt ?? p.r;
      const [f0, f1] = CYL_FRONT;
      const side = (u: number, v: number) => {
        const th = f0 + (f1 - f0) * u;
        const r = p.r + (rt - p.r) * v;
        return P([p.cx + r * Math.cos(th), p.cy + r * Math.sin(th), p.z + p.h * v]);
      };
      const so = cylSide(p).map(P);
      out.push({
        fn: side,
        outline: so,
        bounds: bounds(so),
        nu: Math.max(1, Math.round(arcLen(side, "u", 0.5) / g)),
        nv: Math.max(1, Math.round(arcLen(side, "v", 0.5, 2) / g)),
        steps: 4,
        tone: (u) => cylTone(f0 + (f1 - f0) * u, lit, light),
        mark,
      });
      const top = (u: number, v: number) => {
        const th = Math.PI * 2 * u;
        const r = rt * v;
        return P([p.cx + r * Math.cos(th), p.cy + r * Math.sin(th), p.z + p.h] as V3);
      };
      const to = circle(p.cx, p.cy, p.z + p.h, rt).map(P);
      out.push({
        fn: top,
        outline: to,
        bounds: bounds(to),
        nu: 1,
        nv: 1,
        rings: Math.max(1, Math.round(arcLen(top, "v", 0.125, 2) / g)),
        steps: 1,
        tone: () => (lit ? 1 : 0.7),
        mark,
      });
    }
  }
  return out;
}

interface Edge {
  l?: boolean;
  r?: boolean;
  b?: boolean;
  t?: boolean;
  /** A whole disc: no gap around u. */
  closed?: boolean;
  /** The center of a disc: no gap at v = 0. */
  center?: boolean;
}

/** One cell of a face, inset by half the gap (by `margin` along the face's outline). */
function cell(
  fn: Face["fn"],
  u0: number,
  u1: number,
  v0: number,
  v1: number,
  edge: Edge,
  steps: number,
  gap: number,
  margin: number,
  min: number,
): V2[] | null {
  const um = (u0 + u1) / 2;
  const vm = (v0 + v1) / 2;
  const lu = dist(fn(u0, vm), fn(u1, vm));
  const lv = dist(fn(um, v0), fn(um, v1));
  if (lu < 0.5 || lv < 0.5) return null;
  const du = (u1 - u0) / lu;
  const dv = (v1 - v0) / lv;
  const a0 = edge.closed ? u0 : u0 + (edge.l ? margin : gap / 2) * du;
  const a1 = edge.closed ? u1 : u1 - (edge.r ? margin : gap / 2) * du;
  const b0 = v0 + (edge.b ? margin : edge.center ? 0 : gap / 2) * dv;
  const b1 = v1 - (edge.t ? margin : gap / 2) * dv;
  if ((a1 - a0) / du < min || (b1 - b0) / dv < min)
    // A sliver face (a thin spine): keep one tile with just the half-gap inset.
    return margin > gap / 2 ? cell(fn, u0, u1, v0, v1, edge, steps, gap, gap / 2, min) : null;
  const pts: V2[] = [];
  for (let k = 0; k <= steps; k++) pts.push(fn(a0 + ((a1 - a0) * k) / steps, b0));
  for (let k = 0; k <= steps; k++) pts.push(fn(a1 - ((a1 - a0) * k) / steps, b1));
  return pts;
}

/** Visit a face's cells: a u×v grid, or rings of segments for a disc. */
function eachCell(
  f: Face,
  cb: (
    u0: number,
    u1: number,
    v0: number,
    v1: number,
    i: number,
    j: number,
    e: Edge,
    steps: number,
  ) => void,
) {
  if (f.rings) {
    const n = f.rings;
    for (let k = 0; k < n; k++) {
      const ns = k === 0 ? 1 : Math.max(6, Math.round(Math.PI * 2 * (k + 0.5)));
      for (let s = 0; s < ns; s++)
        cb(
          s / ns,
          (s + 1) / ns,
          k / n,
          (k + 1) / n,
          s,
          k,
          { closed: ns === 1, center: k === 0, t: k === n - 1 },
          ns === 1 ? 20 : Math.max(2, Math.ceil(24 / ns)),
        );
    }
    return;
  }
  for (let j = 0; j < f.nv; j++)
    for (let i = 0; i < f.nu; i++)
      cb(
        i / f.nu,
        (i + 1) / f.nu,
        j / f.nv,
        (j + 1) / f.nv,
        i,
        j,
        { l: i === 0, r: i === f.nu - 1, b: j === 0, t: j === f.nv - 1 },
        f.steps,
      );
}

const dither = (t: number, i: number, j: number) =>
  Math.min(LEVELS, Math.floor(t * LEVELS + BAYER[j & 7][i & 7] - 0.5));

const level = (lv: number, mark: number) =>
  mark === 2 ? WARN : mark === 3 ? GOOD : mark === 4 ? ORANGE : mark && lv >= LEVELS ? HOT : lv;

/**
 * Tiles for a scene drawn through `P` onto a w×h surface: the haze behind it,
 * then each face's tiles in painter's order. A tile any later face covers is
 * dropped, so nearer solids hide farther ones without cutting a tile in two.
 * `pitch` and `gap` are in output units; `px` is one CSS pixel in them.
 * `twinkle` reseeds the sparse haze so it slowly shimmers.
 */
export function tiles(
  scene: Scene,
  P: Projector,
  w: number,
  h: number,
  o: { pitch: number; gap: number; px: number; light: number; twinkle?: number; wide?: boolean },
): Tile[] {
  const g = o.pitch;
  const margin = o.gap + 0.9 * o.px;
  const fs = faces(scene, P, g, o.light);
  const out: Tile[] = [];
  const pad = o.gap / 2;
  // Faces bucketed on a coarse grid (indices ascending), so a corner only
  // tests the faces that could contain it.
  const B = g * 8;
  const bc = Math.ceil(w / B) + 1;
  const br = Math.ceil(h / B) + 1;
  const buckets: number[][] = Array.from({ length: bc * br }, () => []);
  const bucket = (x: number, y: number) =>
    Math.min(bc - 1, Math.max(0, Math.floor(x / B))) +
    Math.min(br - 1, Math.max(0, Math.floor(y / B))) * bc;
  fs.forEach((f, n) => {
    const [x0, y0, x1, y1] = f.bounds;
    const a = bucket(x0, y0);
    const b = bucket(x1, y1);
    for (let r = Math.floor(a / bc); r <= Math.floor(b / bc); r++)
      for (let c = a % bc; c <= b % bc; c++) buckets[r * bc + c].push(n);
  });
  // Covered if any corner, pushed out by half a gap, lands inside a face from `from` on.
  const covered = (pts: V2[], from: number) => {
    let cx = 0;
    let cy = 0;
    for (const [x, y] of pts) {
      cx += x;
      cy += y;
    }
    cx /= pts.length;
    cy /= pts.length;
    for (const [px, py] of pts) {
      const d = Math.hypot(px - cx, py - cy) || 1;
      const x = px + ((px - cx) / d) * pad;
      const y = py + ((py - cy) / d) * pad;
      const list = buckets[bucket(x, y)];
      for (let k = list.length - 1; k >= 0 && list[k] >= from; k--)
        if (inside(fs[list[k]], x, y)) return true;
    }
    return false;
  };

  // Haze: a soft elliptical glow behind the drawing, which dithers to a
  // sparse field. It reaches zero inside the frame, so there's no hard edge.
  const cols = Math.ceil(w / g);
  const rows = Math.ceil(h / g);
  const hx = cols * (o.wide ? 0.68 : 0.5);
  const hy = rows * 0.5;
  const rx = cols * (o.wide ? 0.32 : 0.5);
  const ry = rows * 0.5;
  const tw = o.twinkle ?? 0;
  const size = Math.max(0.5, g - o.gap);
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const d = Math.hypot((i + 0.5 - hx) / rx, (j + 0.5 - hy) / ry);
      let v = d < 0.55 ? 0.25 - (d / 0.55) * 0.18 : d < 0.95 ? 0.07 * (1 - (d - 0.55) / 0.4) : 0;
      if (v > 0.005 && v < 0.1 && hash(i + tw * 3, j) > 0.985 - v * 0.2) v = 0.2;
      const lv = dither(v, i, j);
      if (lv <= 0) continue;
      const x = i * g;
      const y = j * g;
      const pts: V2[] = [
        [x, y],
        [x + size, y],
        [x + size, y + size],
        [x, y + size],
      ];
      if (!covered(pts, 0)) out.push({ pts, lv, mark: 0 });
    }

  fs.forEach((f, n) =>
    eachCell(f, (u0, u1, v0, v1, i, j, e, steps) => {
      const lv = dither(f.tone((u0 + u1) / 2), i, j);
      if (lv <= 0) return;
      const pts = cell(f.fn, u0, u1, v0, v1, e, steps, o.gap, margin, 0.7 * o.px);
      if (pts && !covered(pts, n + 1)) out.push({ pts, lv: level(lv, f.mark), mark: f.mark });
    }),
  );
  return out;
}
