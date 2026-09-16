"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top-of-viewport progress bar shown during client-side route
 * transitions, in the brand accent.
 *
 * The App Router exposes no global "navigation started" event, so we infer
 * the start by intercepting same-origin `<a>` clicks (and back/forward), and
 * infer completion when the committed route — `usePathname()` +
 * `useSearchParams()` — actually changes. A safety timeout finishes the bar
 * if a click we couldn't fully vet never produces a navigation, so it can't
 * get stuck. Purely decorative, so `aria-hidden`.
 */
export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const loading = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (trickle.current) {
      clearInterval(trickle.current);
      trickle.current = null;
    }
  }

  function start() {
    if (loading.current) return;
    loading.current = true;
    clearTimers();
    setVisible(true);
    setWidth(8);
    // Ease toward ~90% and wait there for the route to commit.
    trickle.current = setInterval(() => {
      setWidth((w) => (w < 90 ? w + (90 - w) * 0.12 : w));
    }, 200);
    // Failsafe: never leave the bar hanging if no navigation lands.
    timers.current.push(setTimeout(() => finish(), 8000));
  }

  function finish() {
    if (!loading.current) return;
    loading.current = false;
    clearTimers();
    setWidth(100);
    // Fill, then fade in place, then reset width while invisible.
    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        timers.current.push(setTimeout(() => setWidth(0), 250));
      }, 200),
    );
  }

  // Navigation starts: same-origin link clicks and browser back/forward.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same page, or an in-page hash jump — no route transition.
      if (url.href === window.location.href) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      start();
    }

    function onPopState() {
      start();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigation committed: the route changed, so finish (skip first mount).
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-200 h-0.5"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full bg-accent"
        style={{
          width: `${width}%`,
          transition: "width 200ms ease",
          boxShadow:
            "0 0 8px var(--color-accent), 0 0 3px var(--color-accent)",
        }}
      />
    </div>
  );
}
