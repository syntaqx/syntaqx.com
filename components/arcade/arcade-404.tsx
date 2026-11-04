"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import type { ArcadeTheme, Cabinet } from "./cabinet";
import { cabinets } from "./index";

const WARM = 2; // seconds each cabinet plays unseen, so the page opens mid-game
const STILL = 3; // seconds played before the one frame shown under reduced motion
const STEP = 1 / 60;
const MAX_DT = 1 / 30;
// Layers quieter than full strength, by title. The maze and the chains fill
// the whole stage, so they sit back and let the smaller games and the copy
// read over them; the rest draw at full strength.
const LAYER_ALPHA: Record<string, number> = { Chase: 0.7, Crawl: 0.7 };

const readTheme = (): ArcadeTheme => {
  const css = getComputedStyle(document.documentElement);
  // next/font registers its families under generated names; the variables hold them.
  const fonts = getComputedStyle(document.body);
  const font = (name: string, fallback: string) =>
    `${fonts.getPropertyValue(name).trim() || css.getPropertyValue(name).trim()}, ${fallback}`.replace(
      /^, /,
      "",
    );
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const bg = v("--background", "#0a0c0c");
  const hex = bg.replace("#", "");
  // Perceived brightness of the background picks the theme, so it works
  // whether the dark look came from the class or from the system setting.
  const lum =
    hex.length >= 6
      ? (parseInt(hex.slice(0, 2), 16) * 0.3 +
          parseInt(hex.slice(2, 4), 16) * 0.59 +
          parseInt(hex.slice(4, 6), 16) * 0.11) /
        255
      : 0;
  return {
    bg,
    fg: v("--foreground", "#e6ece9"),
    muted: v("--muted-foreground", "#84908e"),
    line: v("--border", "#1c2423"),
    strong: v("--border-hover", "#2f3a39"),
    primary: v("--primary", "#00d1ca"),
    amber: "#f2b13c",
    pink: "#ff9cc7",
    purple: "#c4a7ff",
    cyan: "#7edcdc",
    green: "#a9d5a0",
    mono: font("--font-jetbrains", "ui-monospace, monospace"),
    dark: lum < 0.5,
  };
};

const warm = (cabinet: Cabinet, seconds: number) => {
  for (let t = 0; t < seconds; t += STEP) cabinet.step(STEP);
};

/**
 * The 404: the page's copy over one shared canvas where every cabinet plays
 * itself at once, each sized to the whole stage and layered back to front in
 * the order ./index.ts lists them.
 */
export function Arcade404() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current,
      canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!stage || !canvas || !ctx) return;

    let theme = readTheme();
    let width = 1,
      height = 1,
      dpr = 1;
    const layers = cabinets.map((make) => {
      const cabinet = make();
      return { cabinet, alpha: LAYER_ALPHA[cabinet.title] ?? 1 };
    });

    // Cabinets set globalAlpha freely, so a single outer setting would be
    // overwritten. Instead every value they set is scaled by the current
    // layer's opacity, and reads give back what they set.
    const native = Object.getOwnPropertyDescriptor(
      CanvasRenderingContext2D.prototype,
      "globalAlpha",
    );
    let layerAlpha = 1;
    if (native?.get && native.set) {
      const { get, set } = native;
      Object.defineProperty(ctx, "globalAlpha", {
        configurable: true,
        get() {
          return (get.call(this) as number) / layerAlpha;
        },
        set(v: number) {
          set.call(this, v * layerAlpha);
        },
      });
    }

    const fit = () => {
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      for (const { cabinet } of layers) cabinet.resize(width, height);
    };

    const paint = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);
      for (const { cabinet, alpha } of layers) {
        layerAlpha = alpha;
        ctx.save();
        ctx.globalAlpha = 1;
        cabinet.draw(ctx, theme, now);
        ctx.restore();
      }
      layerAlpha = 1;
    };

    const advance = (dt: number) => {
      for (const { cabinet } of layers) cabinet.step(dt);
    };

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    fit();
    for (const { cabinet } of layers) warm(cabinet, still ? STILL : WARM);

    let raf = 0,
      last: number | null = null,
      onScreen = true;
    const frame = (now: number) => {
      raf = 0;
      // After a pause the clock restarts, so the first frame is one normal
      // step instead of a jump across the time spent hidden.
      const dt = last === null ? STEP : Math.min(MAX_DT, Math.max(0, (now - last) / 1000));
      last = now;
      advance(dt);
      paint(now);
      schedule();
    };
    const schedule = () => {
      if (still) return;
      if (onScreen && !document.hidden) {
        if (!raf) raf = requestAnimationFrame(frame);
      } else {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        last = null;
      }
    };
    // While nothing loops, changes have to be painted by hand.
    const repaint = () => {
      if (still || !raf) paint(performance.now());
    };

    const onResize = () => {
      fit();
      repaint();
    };
    const onTheme = () => {
      theme = readTheme();
      repaint();
    };
    const resizer = new ResizeObserver(onResize);
    resizer.observe(stage);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      schedule();
    });
    io.observe(stage);
    const themeWatch = new MutationObserver(onTheme);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", onTheme);
    document.addEventListener("visibilitychange", schedule);
    // A zoom changes the pixel ratio without resizing the stage.
    window.addEventListener("resize", onResize);

    paint(performance.now());
    schedule();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      resizer.disconnect();
      io.disconnect();
      themeWatch.disconnect();
      scheme.removeEventListener("change", onTheme);
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("resize", onResize);
      Reflect.deleteProperty(ctx, "globalAlpha");
    };
  }, []);

  return (
    <div
      ref={stageRef}
      data-full-bleed
      className="relative -my-12 h-[calc(100dvh-3rem)] min-h-140 w-screen overflow-hidden"
      style={{ marginInline: "calc(50% - 50vw)" }}
    >
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
      <section
        aria-labelledby="not-found-title"
        className="pointer-events-none absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_62%_58%_at_50%_50%,color-mix(in_oklab,var(--background)_88%,transparent)_0%,color-mix(in_oklab,var(--background)_62%,transparent)_55%,transparent_100%)] px-6 text-center"
      >
        <div className="flex max-w-2xl *:pointer-events-auto flex-col items-center">
          <p className="eyebrow mb-4">404</p>
          <h1 id="not-found-title" className="mb-5 text-3xl leading-[0.95] sm:text-4xl">
            Player 404 has left the game.
          </h1>
          <p className="mb-3 max-w-md text-subtle">
            The page you&apos;re looking for isn&apos;t on this level. The cabinets are on free
            play, so stay a while, or head back to the start.
          </p>
          <p className="mb-10 text-xs text-muted-foreground">
            HTTP 404 &middot; NO SAVE DATA FOUND
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button href="/">
              Go home
              <ArrowRight size={13} />
            </Button>
            <Button href="/posts" variant="secondary">
              Read the blog
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
