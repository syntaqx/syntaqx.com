"use client";

import { useEffect, useRef } from "react";
import { project, type SceneState, type V2 } from "@/lib/scene/iso";
import { HOT, LEVELS, levels, rasterize } from "@/lib/scene/raster";
import { sceneAt, type SceneName } from "@/lib/scene/scenes";
import { walk, type Ink, type Pen } from "@/lib/scene/walk";

/*
 * Live isometric art: tonal teal tiles (ordered-dithered between four tints,
 * drawn as separate cells with a gap) under crisp vector line work. Hover
 * pulls the layers apart, pointer position relights it. One shared ticker
 * drives every visible instance at 30fps.
 */

interface Props {
  scene: SceneName;
  /** Wide layout parks the drawing right of center, for feature heroes. */
  wide?: boolean;
  /** Tile pitch in CSS px. */
  grain?: number;
  className?: string;
  label: string;
}

type RGB = [number, number, number];

const parse = (s: string): RGB => {
  const v = s.trim();
  const n = parseInt(v.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: RGB, b: RGB, t: number): RGB =>
  a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;
const css = (c: RGB, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

function palette() {
  const cs = getComputedStyle(document.documentElement);
  const bg = parse(cs.getPropertyValue("--background"));
  const acc = parse(cs.getPropertyValue("--accent"));
  const light = (bg[0] + bg[1] + bg[2]) / 3 > 128;
  return {
    bg,
    acc,
    fg: parse(cs.getPropertyValue("--foreground")),
    dim: parse(cs.getPropertyValue("--dim")),
    ramp: [0.14, 0.3, 0.55, 0.85].map((t) => mix(bg, acc, light ? t * 0.8 : t)),
    hot: mix(acc, light ? bg : [255, 255, 255], 0.35),
    inst: cs.getPropertyValue("--font-michroma").trim() || "sans-serif",
  };
}

function canvasPen(
  ctx: CanvasRenderingContext2D,
  pal: ReturnType<typeof palette>,
  dpr: number,
  W: number,
): Pen {
  const lw = Math.max(1, dpr * 0.9);
  const ink = (k: Ink) =>
    k === "acc" ? pal.acc : k === "dim" ? pal.dim : pal.fg;
  const trace = (pts: V2[], close: boolean) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    if (close) ctx.closePath();
  };
  return {
    occlude(pts, alpha) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = alpha;
      trace(pts, true);
      ctx.fill();
      ctx.restore();
    },
    path(pts, o) {
      trace(pts, o.close ?? true);
      ctx.setLineDash(o.dash ? [1.5 * dpr, 4 * dpr] : []);
      ctx.strokeStyle = css(ink(o.ink), o.alpha);
      ctx.lineWidth = lw * (o.width ?? 1);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    dot(x, y, k, size = 2) {
      const r = (size / 2) * dpr;
      ctx.fillStyle = css(ink(k), 0.95);
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    },
    handle(x, y) {
      const r = 2.6 * dpr;
      ctx.fillStyle = css(pal.bg);
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.strokeStyle = css(pal.fg);
      ctx.lineWidth = lw;
      ctx.strokeRect(x - r, y - r, r * 2, r * 2);
    },
    label([x0, y0], [x1, y1], text, accent) {
      const right = x1 >= x0;
      ctx.strokeStyle = css(pal.dim, 0.9);
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1 + (right ? 10 : -10) * dpr, y1);
      ctx.stroke();
      ctx.fillStyle = css(pal.acc);
      ctx.fillRect(x0 - 1.5 * dpr, y0 - 1.5 * dpr, 3 * dpr, 3 * dpr);
      ctx.font = `${8.5 * dpr}px ${pal.inst}`;
      ctx.letterSpacing = `${1.4 * dpr}px`;
      const t = text.toUpperCase();
      const tw = ctx.measureText(t).width;
      const tx = Math.max(
        6 * dpr,
        Math.min(W - tw - 6 * dpr, right ? x1 + 14 * dpr : x1 - 14 * dpr - tw),
      );
      ctx.fillStyle = css(pal.bg, 0.85);
      ctx.fillRect(tx - 4 * dpr, y1 - 8 * dpr, tw + 8 * dpr, 14 * dpr);
      ctx.fillStyle = css(accent ? pal.acc : pal.fg, 0.95);
      ctx.fillText(t, tx, y1 + 3.5 * dpr);
      ctx.letterSpacing = "0px";
    },
    packet(pts, at) {
      const lens = pts
        .slice(1)
        .map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
      const total = lens.reduce((a, b) => a + b, 0);
      if (!total) return;
      let d = at * total;
      let i = 0;
      while (i < lens.length - 1 && d > lens[i]) d -= lens[i++];
      const t = lens[i] ? d / lens[i] : 0;
      const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t;
      const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
      const r = 2.2 * dpr;
      ctx.fillStyle = css(pal.acc);
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    },
  };
}

interface Actor {
  draw(): void;
  st: SceneState & { target: number; lightT: number; visible: boolean };
}

const actors = new Set<Actor>();
let running = false;
let reduce = false;

function tick(now: number, last: { t: number; prev: number }) {
  if (!actors.size) {
    running = false;
    return;
  }
  requestAnimationFrame((n) => tick(n, last));
  if (now - last.t < 1000 / 30) return;
  const dt = Math.min(0.1, (now - last.prev) / 1000);
  last.t = now;
  last.prev = now;
  for (const a of actors) {
    if (!a.st.visible) continue;
    const s = a.st;
    s.t = now / 1000;
    s.spread += (s.target - s.spread) * 0.12;
    s.light += (s.lightT - s.light) * 0.15;
    s.flow += dt * (1 + s.spread * 2.5);
    a.draw();
  }
}

export function SceneArt({
  scene,
  wide = false,
  grain = 5,
  className = "",
  label,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const layer = document.createElement("canvas");
    const lctx = layer.getContext("2d")!;

    const st: Actor["st"] = {
      t: 0,
      spread: 0,
      light: 0,
      flow: 0,
      target: 0,
      lightT: 0,
      visible: true,
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      if (!W || !H) return;
      const cw = canvas.clientWidth;
      const dpr = W / cw;
      const pal = palette();
      const data = sceneAt(scene, st);

      // Tiles: rasterize at one cell per `grain` CSS px.
      const cols = Math.ceil(cw / grain);
      const rows = Math.ceil(canvas.clientHeight / grain);
      const { field } = rasterize(data, cols, rows, st.light, wide);
      const lv = levels(field, reduce ? 0 : Math.floor(st.t * 2));
      ctx.fillStyle = css(pal.bg);
      ctx.fillRect(0, 0, W, H);
      const size = (grain - (grain >= 5 ? 1 : 0.6)) * dpr;
      const paths = Array.from({ length: HOT + 1 }, () => new Path2D());
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const v = lv[y * cols + x];
          if (v) paths[v].rect(x * grain * dpr, y * grain * dpr, size, size);
        }
      for (let k = 1; k <= LEVELS; k++) {
        ctx.fillStyle = css(pal.ramp[k - 1]);
        ctx.fill(paths[k]);
      }
      ctx.fillStyle = css(pal.hot);
      ctx.fill(paths[HOT]);

      // Lines on their own layer, so occlusion only erases line work.
      if (layer.width !== W || layer.height !== H) {
        layer.width = W;
        layer.height = H;
      }
      lctx.clearRect(0, 0, W, H);
      walk(
        data,
        project(data.ext, W, H, wide),
        canvasPen(lctx, pal, dpr, W),
        st,
      );
      ctx.drawImage(layer, 0, 0);
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      st.visible = e.isIntersecting;
    });
    io.observe(canvas);

    const enter = () => {
      st.target = 1;
      if (reduce) draw();
    };
    const leave = () => {
      st.target = 0;
      st.lightT = 0;
      if (reduce) draw();
    };
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      st.lightT = ((e.clientX - r.left) / r.width) * 2 - 1;
      if (reduce) {
        st.light = st.lightT;
        draw();
      }
    };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointermove", move);

    // Redraw when the theme flips (class on <html>) or fonts finish loading.
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    document.fonts?.ready.then(draw);

    const actor: Actor = { draw, st };
    if (!reduce) {
      actors.add(actor);
      if (!running) {
        running = true;
        const now = performance.now();
        requestAnimationFrame((n) => tick(n, { t: 0, prev: now }));
      }
    }

    return () => {
      actors.delete(actor);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointermove", move);
    };
  }, [scene, wide, grain]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      className={`block w-full ${className}`}
    />
  );
}
