import {
  cylSide,
  circle,
  project,
  type Projector,
  type Scene,
  type V2,
  type V3,
} from "./iso";

/*
 * Cell-space rasterization shared by the live canvas and the OG renderer.
 * One cell is one dither tile. No DOM: plain typed arrays and scanlines.
 */

export interface Field {
  cols: number;
  rows: number;
  lum: Float32Array;
  acc: Uint8Array;
}

export const LEVELS = 4;
/** Level value for the brightest accent tiles. */
export const HOT = LEVELS + 1;
/** Level value for red (warn) tiles. */
export const WARN = HOT + 1;

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

/** Even-odd scanline fill at cell centers. `fn` receives the cell index. */
export function scan(
  pts: V2[],
  cols: number,
  rows: number,
  fn: (i: number) => void,
) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of pts) {
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const y0 = Math.max(0, Math.ceil(minY - 0.5));
  const y1 = Math.min(rows - 1, Math.floor(maxY - 0.5));
  const xs: number[] = [];
  for (let j = y0; j <= y1; j++) {
    const yc = j + 0.5;
    xs.length = 0;
    for (let k = 0; k < pts.length; k++) {
      const [ax, ay] = pts[k];
      const [bx, by] = pts[(k + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) {
        xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const a = Math.max(0, Math.ceil(xs[k] - 0.5));
      const b = Math.min(cols - 1, Math.floor(xs[k + 1] - 0.5));
      for (let i = a; i <= b; i++) fn(j * cols + i);
    }
  }
}

/** Luminance + accent mask for a scene at cols×rows cells. */
export function rasterize(
  scene: Scene,
  cols: number,
  rows: number,
  light: number,
  wide = false,
): { field: Field; P: Projector } {
  const P = project(scene.ext, cols, rows, wide);
  const lum = new Float32Array(cols * rows);
  const acc = new Uint8Array(cols * rows);

  // Haze: a soft elliptical glow behind the drawing, which dithers to a
  // sparse field. It reaches zero inside the frame, so there's no hard edge.
  const cx = cols * (wide ? 0.68 : 0.5);
  const cy = rows * 0.5;
  const rx = cols * (wide ? 0.32 : 0.5);
  const ry = rows * 0.5;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const d = Math.hypot((i + 0.5 - cx) / rx, (j + 0.5 - cy) / ry);
      lum[j * cols + i] =
        d < 0.55
          ? 0.25 - (d / 0.55) * 0.18
          : d < 0.95
            ? 0.07 * (1 - (d - 0.55) / 0.4)
            : 0;
    }

  // Coverage is sampled S×S per cell. Only cells wholly inside a face take
  // its tone; cells an edge cuts through are cleared, so no tile crosses an
  // outline and every line runs in a clean channel.
  const S = 4;
  const cover = new Uint8Array(cols * rows);
  const touched: number[] = [];
  // mark: 0 plain, 1 accent, 2 warn
  const fill = (pts: V3[], v: number, mark = 0, alpha = 1) => {
    const sub = pts.map((p): V2 => {
      const [x, y] = P(p);
      return [x * S, y * S];
    });
    scan(sub, cols * S, rows * S, (k) => {
      const sx = k % (cols * S);
      const i = Math.floor((k - sx) / (cols * S) / S) * cols + Math.floor(sx / S);
      if (!cover[i]++) touched.push(i);
    });
    for (const i of touched) {
      if (cover[i] === S * S) {
        lum[i] = lum[i] * (1 - alpha) + v * alpha;
        acc[i] = mark;
      } else {
        lum[i] = 0;
        acc[i] = 0;
      }
      cover[i] = 0;
    }
    touched.length = 0;
  };

  for (const p of scene.parts) {
    if (p.kind === "plane" && !p.dashed) fill(p.pts, p.v, 0, 0.82);
    if (p.kind === "box" && !p.ghost) {
      const b = p.box;
      const lit = p.accent || p.warn;
      const mark = p.warn ? 2 : p.accent ? 1 : 0;
      const k = lit ? 1 : 0.85;
      fill(b.left, (0.42 - light * 0.2) * k + (lit ? 0.2 : 0), mark);
      fill(b.right, (0.24 + light * 0.2) * k + (lit ? 0.15 : 0), mark);
      fill(b.top, lit ? 1 : 0.6, mark);
    }
    if (p.kind === "cyl") {
      fill(cylSide(p), p.accent ? 0.6 : 0.34 + light * 0.08, p.accent ? 1 : 0);
      fill(circle(p.cx, p.cy, p.z + p.h, p.rt ?? p.r), p.accent ? 1 : 0.58, p.accent ? 1 : 0);
    }
  }
  return { field: { cols, rows, lum, acc }, P };
}

/**
 * Quantize the field into tonal levels with ordered dithering between them.
 * 0 = empty, 1..LEVELS = teal tints, HOT = brightest accent. `twinkle`
 * reseeds the sparse background cells so they slowly shimmer.
 */
export function levels(field: Field, twinkle = 0): Uint8Array {
  const { cols, rows, lum, acc } = field;
  const out = new Uint8Array(cols * rows);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      let v = lum[i];
      if (v > 0.005 && v < 0.1 && hash(x + twinkle * 3, y) > 0.985 - v * 0.2)
        v = 0.2;
      const lv = Math.min(
        LEVELS,
        Math.floor(v * LEVELS + BAYER[y & 7][x & 7] - 0.5),
      );
      if (lv <= 0) continue;
      out[i] = acc[i] === 2 ? WARN : acc[i] && lv >= LEVELS ? HOT : lv;
    }
  return out;
}
