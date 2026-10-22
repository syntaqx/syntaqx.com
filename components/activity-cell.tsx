"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export interface ActivityDayInfo {
  count: number;
  label: string | null;
}

// Same timings as the Radix provider this replaced: a short delay before
// the first reveal, then instant while sweeping across cells.
const DELAY_MS = 80;
const SKIP_DELAY_MS = 300;
const SIDE_OFFSET = 6;
const COLLISION_PADDING = 8;
// Matches the Radix tooltip arrow this replaced (10x5).
const ARROW_W = 10;
const ARROW_H = 5;

/**
 * One delegated tooltip for the whole contribution grid. The day cells are
 * plain server-rendered `<div data-date>`s (no per-cell wrapper, so the
 * ~370 cells stay light in the HTML); this listens for pointer movement over
 * them and positions a single tooltip above the hovered cell, flipping below
 * when there's no room and clamping to the viewport.
 *
 * Renders `display: contents` so the grid's flex layout is untouched. Cells
 * stay non-focusable (like GitHub's own graph); the tooltip is pointer-driven.
 */
export function ActivityGridTooltips({
  days,
  children,
}: {
  days: Record<string, ActivityDayInfo>;
  children: ReactNode;
}) {
  const [active, setActive] = useState<{ date: string; rect: DOMRect } | null>(
    null,
  );
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closedAt = useRef(0);

  const close = () => {
    clearTimeout(timer.current);
    setActive((prev) => {
      if (prev) closedAt.current = Date.now();
      return null;
    });
  };

  useEffect(() => {
    if (!active) return;
    window.addEventListener("scroll", close, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", close, { capture: true });
  }, [active]);

  useEffect(() => () => clearTimeout(timer.current), []);
  const [pos, setPos] = useState<{
    left: number;
    top: number;
    arrowLeft: number;
    below: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!active || !tip) {
      setPos(null);
      return;
    }
    const { rect } = active;
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const center = rect.left + rect.width / 2;
    const left = Math.min(
      Math.max(center - w / 2, COLLISION_PADDING),
      window.innerWidth - COLLISION_PADDING - w,
    );
    const above = rect.top - SIDE_OFFSET - ARROW_H - h;
    const below = above < COLLISION_PADDING;
    setPos({
      left,
      top: below ? rect.bottom + SIDE_OFFSET + ARROW_H : above,
      arrowLeft: Math.min(Math.max(center - left - ARROW_W / 2, 4), w - ARROW_W - 4),
      below,
    });
  }, [active]);

  const day = active ? days[active.date] : undefined;

  return (
    <div
      className="contents"
      onPointerOver={(e) => {
        if (e.pointerType === "touch") return;
        const cell = (e.target as HTMLElement).closest<HTMLElement>(
          "[data-date]",
        );
        const date = cell?.dataset.date;
        if (!cell || !date || !(date in days)) return close();
        if (date === active?.date) return;
        const show = () =>
          setActive({ date, rect: cell.getBoundingClientRect() });
        clearTimeout(timer.current);
        if (active || Date.now() - closedAt.current < SKIP_DELAY_MS) show();
        else timer.current = setTimeout(show, DELAY_MS);
      }}
      onPointerLeave={close}
    >
      {children}
      {active &&
        day &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={{
              position: "fixed",
              left: pos?.left ?? 0,
              top: pos?.top ?? 0,
              visibility: pos ? "visible" : "hidden",
            }}
            className="pointer-events-none z-200 border border-border bg-surface px-2 py-1 text-[10px] leading-snug shadow-lg"
          >
            {day.label && (
              <span className="block font-medium text-foreground">
                {day.label}
              </span>
            )}
            <span className="block text-foreground">
              {day.count} contribution{day.count === 1 ? "" : "s"}
            </span>
            <span className="block text-dim">{active.date}</span>
            <svg
              width={ARROW_W}
              height={ARROW_H}
              viewBox="0 0 30 10"
              preserveAspectRatio="none"
              className="absolute fill-surface"
              style={{
                left: pos?.arrowLeft ?? 0,
                ...(pos?.below
                  ? { bottom: "100%", transform: "rotate(180deg)" }
                  : { top: "100%" }),
              }}
            >
              <polygon points="0,0 30,0 15,10" />
            </svg>
          </div>,
          document.body,
        )}
    </div>
  );
}
