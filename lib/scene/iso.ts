/*
 * Isometric scene model. Scenes are plain data (parts in painter's order),
 * so the same scene can be drawn live on a canvas or rasterized at build
 * time for Open Graph images. World units: x and y on the ground, z up.
 */

export type V3 = readonly [number, number, number];
export type V2 = [number, number];

/** Animation inputs. `spread` explodes the layers apart, `light` is -1..1. */
export interface SceneState {
  t: number;
  spread: number;
  light: number;
  flow: number;
}

export const REST: SceneState = { t: 0, spread: 0, light: 0, flow: 0 };

export interface Box {
  x: number;
  y: number;
  z: number;
  a: number;
  b: number;
  h: number;
  left: V3[];
  right: V3[];
  top: V3[];
}

export type Part =
  | {
      kind: "plane";
      pts: V3[];
      v: number;
      grid?: number;
      drops?: { at: [number, number][]; from: number };
      window?: boolean;
      handles?: boolean;
      dashed?: boolean;
      rows?: { lengths: number[]; accentRow?: number };
    }
  | {
      kind: "box";
      box: Box;
      accent?: boolean;
      small?: boolean;
      slots?: boolean;
      vents?: boolean;
      handles?: boolean;
      ghost?: boolean;
    }
  | { kind: "cyl"; cx: number; cy: number; z: number; r: number; h: number }
  | { kind: "cable"; pts: V3[]; speed: number; accent?: boolean }
  | { kind: "line"; a: V3; b: V3; alpha?: number; dashed?: boolean; accent?: boolean }
  | { kind: "label"; at: V3; text: string; dx: number; dy: number; accent?: boolean };

export interface Scene {
  parts: Part[];
  /** Points the drawing must contain; used to fit the projection. */
  ext: V3[];
  /** Construction lines that run off the edge of the frame. */
  axes: [V3, V3][];
}

export type SceneFn = (s: SceneState) => Scene;

const COS = Math.cos(Math.PI / 6);
const raw = ([x, y, z]: V3): V2 => [(x - y) * COS, (x + y) * 0.5 - z];

export interface Projector {
  (p: V3): V2;
  /** Pixels (or cells) per world unit. */
  sc: number;
}

/**
 * Fit `ext` into a w×h surface. The default layout centers the scene; the
 * wide layout (feature heroes) parks it right of center so a title can sit
 * on the left.
 */
export function project(ext: V3[], w: number, h: number, wide = false): Projector {
  const pts = ext.map(raw);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const sc = wide
    ? Math.min((w * 0.5) / (maxX - minX), (h * 0.84) / (maxY - minY))
    : Math.min((w * 0.88) / (maxX - minX), (h * 0.88) / (maxY - minY));
  const ox = (wide ? w * 0.68 : w / 2) - ((minX + maxX) / 2) * sc;
  const oy = h / 2 - ((minY + maxY) / 2) * sc;
  const P = ((p: V3) => {
    const [x, y] = raw(p);
    return [x * sc + ox, y * sc + oy] as V2;
  }) as Projector;
  P.sc = sc;
  return P;
}

export const quad = (x: number, y: number, z: number, a: number, b: number): V3[] => [
  [x, y, z],
  [x + a, y, z],
  [x + a, y + b, z],
  [x, y + b, z],
];

export function box(x: number, y: number, z: number, a: number, b: number, h: number): Box {
  return {
    x,
    y,
    z,
    a,
    b,
    h,
    left: [
      [x, y + b, z],
      [x + a, y + b, z],
      [x + a, y + b, z + h],
      [x, y + b, z + h],
    ],
    right: [
      [x + a, y, z],
      [x + a, y + b, z],
      [x + a, y + b, z + h],
      [x + a, y, z + h],
    ],
    top: quad(x, y, z + h, a, b),
  };
}

export function circle(
  cx: number,
  cy: number,
  z: number,
  r: number,
  a0 = 0,
  a1 = Math.PI * 2,
  n = 40,
): V3[] {
  const out: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = a0 + ((a1 - a0) * i) / n;
    out.push([cx + r * Math.cos(t), cy + r * Math.sin(t), z]);
  }
  return out;
}

/** The silhouette of a cylinder's visible side, between its two rims. */
export const CYL_FRONT: [number, number] = [-Math.PI / 4, (Math.PI * 3) / 4];

export function cylSide(c: { cx: number; cy: number; z: number; r: number; h: number }): V3[] {
  const [f0, f1] = CYL_FRONT;
  return [...circle(c.cx, c.cy, c.z, c.r, f0, f1), ...circle(c.cx, c.cy, c.z + c.h, c.r, f1, f0)];
}
