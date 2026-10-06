import { project, REST, type Scene } from "./iso";
import { HOT, LEVELS, levels, rasterize, scan } from "./raster";
import { sceneAt, type SceneName } from "./scenes";
import { walk, type Ink, type Pen } from "./walk";

/*
 * Static SVG rendering of a scene for Open Graph images (build time, no DOM).
 * Tiles come from the same rasterizer as the live canvas; line work is
 * rasterized into a fine "ink" grid with the same painter's-order occlusion,
 * then emitted as a handful of <path> elements (one per color and opacity).
 */

export const OG_COLORS = { bg: "#0a0c0c", fg: "#e6ece9", dim: "#84908e", acc: "#00d1ca" };

type RGB = [number, number, number];
const rgb = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const hex = (c: RGB) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
const mix = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;

const KIND: Record<Ink | "bg", number> = { fg: 0, dim: 1, acc: 2, bg: 3 };

function render(scene: Scene, width: number, height: number, pitch: number, wide: boolean): string {
  const C = OG_COLORS;
  const bg = rgb(C.bg);
  const acc = rgb(C.acc);
  const ramp = [0.14, 0.3, 0.55, 0.85].map((t) => hex(mix(bg, acc, t)));
  const hot = hex(mix(acc, [255, 255, 255], 0.35));

  // Tiles
  const cols = Math.ceil(width / pitch);
  const rows = Math.ceil(height / pitch);
  const { field } = rasterize(scene, cols, rows, 0, wide);
  const lv = levels(field, 0);
  const size = pitch - 1;
  const tilePaths = Array.from({ length: HOT + 1 }, () => [] as string[]);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const v = lv[y * cols + x];
      if (v) tilePaths[v].push(`M${x * pitch} ${y * pitch}h${size}v${size}h-${size}z`);
    }

  // Ink: 2px cells for the line work
  const F = 2;
  const fc = Math.ceil(width / F);
  const fr = Math.ceil(height / F);
  const alpha = new Float32Array(fc * fr);
  const kind = new Uint8Array(fc * fr);
  const set = (x: number, y: number, a: number, k: number) => {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= fc || yi >= fr) return;
    const i = yi * fc + xi;
    alpha[i] = a;
    kind[i] = k;
  };
  const pen: Pen = {
    occlude(pts, a) {
      scan(pts, fc, fr, (i) => {
        alpha[i] *= 1 - a;
      });
    },
    path(pts, o) {
      const n = (o.close ?? true) ? pts.length : pts.length - 1;
      for (let s = 0; s < n; s++) {
        const [ax, ay] = pts[s];
        const [bx, by] = pts[(s + 1) % pts.length];
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay))));
        for (let k = 0; k <= steps; k++) {
          if (o.dash && k % 4 >= 2) continue;
          set(ax + ((bx - ax) * k) / steps, ay + ((by - ay) * k) / steps, o.alpha, KIND[o.ink]);
        }
      }
    },
    dot(x, y, ink, sz = 2) {
      const r = Math.max(0, Math.round(sz / F / 2));
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) set(x + dx, y + dy, 1, KIND[ink]);
    },
    handle(x, y) {
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const edge = Math.abs(dx) === 2 || Math.abs(dy) === 2;
          set(x + dx, y + dy, 1, edge ? KIND.fg : KIND.bg);
        }
    },
  };
  walk(scene, project(scene.ext, fc, fr, wide), pen, REST);

  const inkColor = [C.fg, C.dim, C.acc, C.bg];
  const inkPaths = new Map<string, string[]>();
  for (let y = 0; y < fr; y++)
    for (let x = 0; x < fc; x++) {
      const i = y * fc + x;
      const a = Math.round(alpha[i] * 4) / 4;
      if (a <= 0) continue;
      const key = `${kind[i]}:${a}`;
      if (!inkPaths.has(key)) inkPaths.set(key, []);
      inkPaths.get(key)!.push(`M${x * F} ${y * F}h${F}v${F}h-${F}z`);
    }

  const parts: string[] = [`<rect width="${width}" height="${height}" fill="${C.bg}"/>`];
  for (let k = 1; k <= LEVELS; k++) if (tilePaths[k].length) parts.push(`<path fill="${ramp[k - 1]}" d="${tilePaths[k].join("")}"/>`);
  if (tilePaths[HOT].length) parts.push(`<path fill="${hot}" d="${tilePaths[HOT].join("")}"/>`);
  for (const [key, d] of inkPaths) {
    const [k, a] = key.split(":");
    parts.push(`<path fill="${inkColor[+k]}" fill-opacity="${a}" d="${d.join("")}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join("")}</svg>`;
}

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

/** A scene as an SVG data URI, for use as an <img> inside ImageResponse. */
export function sceneImage(name: SceneName, width: number, height: number, opts: { pitch?: number; wide?: boolean } = {}) {
  return dataUri(render(sceneAt(name, REST), width, height, opts.pitch ?? 6, opts.wide ?? false));
}

/** Just the sparse dithered field, no drawing: texture for text-only cards. */
export function fieldImage(width: number, height: number, pitch = 6) {
  const empty: Scene = { parts: [], ext: [[0, 0, 0], [12, 12, 0]] as Scene["ext"], axes: [] };
  return dataUri(render(empty, width, height, pitch, true));
}

