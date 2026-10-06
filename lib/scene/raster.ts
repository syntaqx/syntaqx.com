import { cylSide, circle, project, type Projector, type Scene, type V2, type V3 } from "./iso";

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
export function scan(pts: V2[], cols: number, rows: number, fn: (i: number) => void) {
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

  // Haze: a soft radial glow behind the drawing, which dithers to a sparse
  // field that thins toward the edges.
  const cx = cols * (wide ? 0.68 : 0.5);
  const cy = rows * 0.5;
  const R = Math.max(cols, rows) * 0.62;
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const d = Math.min(1, Math.hypot(i - cx, j - cy) / R);
      lum[j * cols + i] = d < 0.6 ? 0.25 - (d / 0.6) * 0.18 : 0.07 * (1 - (d - 0.6) / 0.4);
    }

  const fill = (pts: V3[], v: number, accent = false, alpha = 1) =>
    scan(pts.map(P), cols, rows, (i) => {
      lum[i] = lum[i] * (1 - alpha) + v * alpha;
      acc[i] = accent ? 1 : 0;
    });

  for (const p of scene.parts) {
    if (p.kind === "plane" && !p.dashed) fill(p.pts, p.v, false, 0.82);
    if (p.kind === "box" && !p.ghost) {
      const b = p.box;
      const k = p.accent ? 1 : 0.85;
      fill(b.left, (0.42 - light * 0.2) * k + (p.accent ? 0.2 : 0), p.accent);
      fill(b.right, (0.24 + light * 0.2) * k + (p.accent ? 0.15 : 0), p.accent);
      fill(b.top, p.accent ? 1 : 0.6, p.accent);
    }
    if (p.kind === "cyl") {
      fill(cylSide(p), 0.34 + light * 0.08);
      fill(circle(p.cx, p.cy, p.z + p.h, p.r), 0.58);
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
      if (v < 0.1 && hash(x + twinkle * 3, y) > 0.985 - v * 0.2) v = 0.2;
      const lv = Math.min(LEVELS, Math.floor(v * LEVELS + BAYER[y & 7][x & 7] - 0.5));
      if (lv <= 0) continue;
      out[i] = acc[i] && lv >= LEVELS ? HOT : lv;
    }
  return out;
}
