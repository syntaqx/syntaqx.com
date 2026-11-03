import { project, REST, type Scene } from "./iso";
import { GOOD, HOT, LEVELS, ORANGE, WARN, levels, rasterize } from "./raster";
import { sceneAt, type SceneName } from "./scenes";
import { walk, type Ink, type Pen } from "./walk";

/*
 * Static SVG rendering of a scene for Open Graph images (build time, no DOM).
 * Tiles come from the same rasterizer as the live canvas; line work is
 * rasterized into a fine "ink" grid with the same painter's-order occlusion,
 * then emitted as a handful of <path> elements (one per color and opacity).
 */

export const OG_COLORS = {
  bg: "#0a0c0c",
  fg: "#e6ece9",
  dim: "#84908e",
  acc: "#00d1ca",
  warn: "#ff5d52",
  good: "#74c288",
  orange: "#d97757",
};

type RGB = [number, number, number];
const rgb = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const hex = (c: RGB) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
const mix = (a: RGB, b: RGB, t: number): RGB =>
  a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;

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
  const tilePaths = Array.from({ length: ORANGE + 1 }, () => [] as string[]);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const v = lv[y * cols + x];
      if (v) tilePaths[v].push(`M${x * pitch} ${y * pitch}h${size}v${size}h-${size}z`);
    }

  // Line work as vectors, like the canvas: stroked, anti-aliased, on its own
  // layer. Occlusion erases only what's drawn so far, so each solid face
  // wraps everything before it in a mask that cuts the face out.
  const inkColor: Record<Ink, string> = {
    fg: C.fg,
    dim: C.dim,
    acc: C.acc,
    warn: C.warn,
    good: C.good,
    orange: C.orange,
  };
  const n = (v: number) => +v.toFixed(1);
  const d = (pts: [number, number][], close: boolean) =>
    pts.map(([x, y], i) => `${i ? "L" : "M"}${n(x)} ${n(y)}`).join("") + (close ? "Z" : "");
  const masks: string[] = [];
  let lines = "";
  const pen: Pen = {
    occlude(pts, a) {
      const id = `o${masks.length}`;
      masks.push(
        `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="#fff"/><path d="${d(pts, true)}" fill="#000" fill-opacity="${a}"/></mask>`,
      );
      lines = `<g mask="url(#${id})">${lines}</g>`;
    },
    path(pts, o) {
      const dash = o.dash ? ` stroke-dasharray="1.5 4"` : "";
      lines += `<path d="${d(pts, o.close ?? true)}" fill="none" stroke="${inkColor[o.ink]}" stroke-opacity="${o.alpha}" stroke-width="${o.width ?? 1}"${dash}/>`;
    },
    dot(x, y, ink, sz = 2) {
      const r = sz / 2;
      lines += `<rect x="${n(x - r)}" y="${n(y - r)}" width="${sz}" height="${sz}" fill="${inkColor[ink]}" fill-opacity="0.95"/>`;
    },
    handle(x, y) {
      const r = 2.6;
      lines += `<rect x="${n(x - r)}" y="${n(y - r)}" width="${r * 2}" height="${r * 2}" fill="${C.bg}" stroke="${C.fg}" stroke-width="1"/>`;
    },
  };
  walk(scene, project(scene.ext, width, height, wide), pen, REST);

  const parts: string[] = [`<rect width="${width}" height="${height}" fill="${C.bg}"/>`];
  for (let k = 1; k <= LEVELS; k++)
    if (tilePaths[k].length)
      parts.push(`<path fill="${ramp[k - 1]}" d="${tilePaths[k].join("")}"/>`);
  if (tilePaths[HOT].length) parts.push(`<path fill="${hot}" d="${tilePaths[HOT].join("")}"/>`);
  if (tilePaths[WARN].length)
    parts.push(`<path fill="${C.warn}" fill-opacity="0.85" d="${tilePaths[WARN].join("")}"/>`);
  if (tilePaths[GOOD].length)
    parts.push(`<path fill="${C.good}" fill-opacity="0.85" d="${tilePaths[GOOD].join("")}"/>`);
  if (tilePaths[ORANGE].length)
    parts.push(`<path fill="${C.orange}" fill-opacity="0.85" d="${tilePaths[ORANGE].join("")}"/>`);
  parts.push(lines);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${masks.join("")}</defs>${parts.join("")}</svg>`;
}

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

/** A scene as an SVG data URI, for use as an <img> inside ImageResponse. */
export function sceneImage(
  name: SceneName,
  width: number,
  height: number,
  opts: { pitch?: number; wide?: boolean } = {},
) {
  return dataUri(render(sceneAt(name, REST), width, height, opts.pitch ?? 6, opts.wide ?? false));
}

/** Just the sparse dithered field, no drawing: texture for text-only cards. */
export function fieldImage(width: number, height: number, pitch = 6) {
  const empty: Scene = {
    parts: [],
    ext: [
      [0, 0, 0],
      [12, 12, 0],
    ] as Scene["ext"],
    axes: [],
  };
  return dataUri(render(empty, width, height, pitch, true));
}
