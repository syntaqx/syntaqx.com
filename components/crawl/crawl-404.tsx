"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/cn";
import { createCrawl, type CrawlResult } from "./engine";

type Crawl = ReturnType<typeof createCrawl>;

const BEST_KEY = "crawl-best";
const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

/**
 * The 404: the page's copy over a live game of Crawl. The crawlers play each
 * other behind it; Play hands you a chain, and the copy comes back with how
 * it ended.
 */
export function Crawl404() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boostRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const game = useRef<Crawl | null>(null);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<CrawlResult | null>(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Reading storage after mount keeps the server and first client render equal.

    setBest(readBest());
    game.current = createCrawl({
      canvas,
      boostButton: boostRef.current,
      still: matchMedia("(prefers-reduced-motion: reduce)").matches,
      onEnd: (r) => {
        setPlaying(false);
        setResult(r);
        if (r && r.length > readBest()) {
          try {
            localStorage.setItem(BEST_KEY, String(r.length));
          } catch {}
          setBest(r.length);
        }
        requestAnimationFrame(() => playRef.current?.focus({ preventScroll: true }));
      },
    });
    return () => game.current?.destroy();
  }, []);

  const play = () => {
    setResult(null);
    setPlaying(true);
    game.current?.start();
  };

  return (
    <div
      data-full-bleed
      className="relative -my-12 h-[calc(100dvh-3rem)] min-h-140 w-screen overflow-hidden"
      style={{ marginInline: "calc(50% - 50vw)" }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={playing ? 0 : -1}
        aria-label="Crawl, a game playing behind this page. Press Play to join."
        className="absolute inset-0 size-full touch-none outline-none"
      />
      <section
        aria-labelledby="not-found-title"
        className={cn(
          "pointer-events-none absolute inset-0 grid place-items-center px-6 text-center transition-opacity duration-300",
          "bg-[radial-gradient(ellipse_62%_58%_at_50%_50%,color-mix(in_oklab,var(--background)_88%,transparent)_0%,color-mix(in_oklab,var(--background)_62%,transparent)_55%,transparent_100%)]",
          playing && "opacity-0",
        )}
      >
        <div
          className={cn(
            "grid max-w-2xl justify-items-center gap-4",
            !playing && "*:pointer-events-auto",
          )}
        >
          <p className="eyebrow">404</p>
          <h1 id="not-found-title" className="text-3xl leading-[0.95] sm:text-4xl">
            These aren&apos;t the droids you&apos;re looking for.
          </h1>
          {result ? (
            <p className="max-w-md font-mono text-sm text-primary" role="status">
              Connection reset: you{" "}
              {result.killer ? `ran into ${result.killer}` : "hit the edge of the network"} at
              length {result.length.toLocaleString("en-US")}.
            </p>
          ) : (
            <p className="max-w-md text-subtle">
              The page you requested has mass, but it exists in a superposition of
              &ldquo;here&rdquo; and &ldquo;not here,&rdquo; and upon observation it collapsed to
              &ldquo;not here.&rdquo;
            </p>
          )}
          <p className="text-xs text-muted-foreground">HTTP 404 &middot; ERR_EXISTENTIAL_CRISIS</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button href="/">
              Go home
              <ArrowRight size={13} />
            </Button>
            <Button ref={playRef} onClick={play} variant="secondary" disabled={playing}>
              {result ? "Play again" : "Or play while you're here"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Steer with the mouse, a finger or &larr; &rarr;. Hold to boost; it burns length. Esc
            leaves.
            {best > 0 && <> Your best: {best.toLocaleString("en-US")}.</>}
          </p>
        </div>
      </section>
      <button
        ref={boostRef}
        type="button"
        aria-label="Boost"
        className={cn(
          "inst absolute right-4 bottom-4 hidden size-18 rounded-full border border-primary bg-background/70 text-[0.55rem] text-primary touch-none",
          playing && "pointer-coarse:block",
        )}
      >
        Boost
      </button>
    </div>
  );
}
