"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import type { ArcadeTheme, Cabinet } from "./cabinet";
import { cabinets } from "./index";

const WARM = 2; // seconds each cabinet plays unseen, so the wall opens mid-game
const STILL = 3; // seconds played before the one frame shown under reduced motion
const STEP = 1 / 60;
const MAX_DT = 1 / 30;
const GAP = 10; // between screens
const PAD = 12; // around the wall

const readTheme = (): ArcadeTheme => {
  const css = getComputedStyle(document.documentElement);
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
    dark: lum < 0.5,
  };
};

const warm = (cabinet: Cabinet, seconds: number) => {
  for (let t = 0; t < seconds; t += STEP) cabinet.step(STEP);
};

/**
 * The 404: the page's copy over a wall of arcade screens, every cabinet
 * playing itself at once.
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
    const screens = cabinets.map((make) => ({ cabinet: make(), x: 0, y: 0, w: 1, h: 1 }));

    // Three screens across on wide stages, two on narrow ones, as many rows as it takes.
    const layout = () => {
      const cols = width >= 960 ? 3 : 2;
      const rows = Math.ceil(screens.length / cols);
      const w = (width - PAD * 2 - GAP * (cols - 1)) / cols;
      const h = (height - PAD * 2 - GAP * (rows - 1)) / rows;
      screens.forEach((sc, i) => {
        sc.x = PAD + (i % cols) * (w + GAP);
        sc.y = PAD + Math.floor(i / cols) * (h + GAP);
        sc.w = Math.max(1, w);
        sc.h = Math.max(1, h);
        sc.cabinet.resize(sc.w, sc.h);
      });
    };

    const fit = () => {
      const rect = stage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      layout();
    };

    const paint = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);
      for (const sc of screens) {
        // Each screen draws in its own coordinates, clipped to its frame.
        ctx.save();
        ctx.translate(sc.x, sc.y);
        ctx.beginPath();
        ctx.rect(0, 0, sc.w, sc.h);
        ctx.clip();
        sc.cabinet.draw(ctx, theme, now);
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = theme.strong;
        ctx.lineWidth = 1;
        ctx.strokeRect(sc.x + 0.5, sc.y + 0.5, sc.w - 1, sc.h - 1);
        ctx.font = '9px var(--font-michroma), "Michroma", sans-serif';
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = theme.muted;
        ctx.fillText(sc.cabinet.title.toUpperCase(), sc.x + 10, sc.y + 9);
      }
    };

    const advance = (dt: number) => {
      for (const sc of screens) sc.cabinet.step(dt);
    };

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    fit();
    for (const sc of screens) warm(sc.cabinet, still ? STILL : WARM);

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
            These aren&apos;t the droids you&apos;re looking for.
          </h1>
          <p className="mb-3 max-w-md text-subtle">
            The page you requested has mass, but it exists in a superposition of &ldquo;here&rdquo;
            and &ldquo;not here,&rdquo; and upon observation it collapsed to &ldquo;not here.&rdquo;
          </p>
          <p className="mb-10 text-xs text-muted-foreground">
            HTTP 404 &middot; ERR_EXISTENTIAL_CRISIS
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
