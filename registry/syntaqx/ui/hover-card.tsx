"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// A small popover with intent-based open and close. The open delay (~120ms)
// filters out cursors that pass through the trigger; the close delay (~100ms)
// lets the user move the cursor into the panel without it slamming shut.
//
// `onOpen` fires the first time the card is about to become visible: the
// hook callers use to start a "load on intent" fetch.

export interface HoverCardProps {
  trigger: ReactNode;
  children: ReactNode;
  onOpen?: () => void;
  className?: string;
  // Anchor the panel to the trigger's left or right edge. Use "end" when the
  // trigger sits at the right side of its container so the panel doesn't
  // overflow.
  align?: "start" | "end";
}

export function HoverCard({
  trigger,
  children,
  onOpen,
  className,
  align = "start",
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const id = useId();

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimer.current = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onOpen?.();
      }
      setOpen(true);
    }, 120);
  }, [onOpen]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 100);
  }, []);

  useEffect(() => () => clearTimers(), []);

  return (
    <span
      data-slot="hover-card"
      className="relative inline-block"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onFocus={scheduleOpen}
      onBlur={scheduleClose}
    >
      <span aria-describedby={open ? id : undefined}>{trigger}</span>
      {open && (
        <span
          id={id}
          role="tooltip"
          data-slot="hover-card-content"
          className={cn(
            "absolute top-full z-50 mt-2 block w-72 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-lg",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {children}
        </span>
      )}
    </span>
  );
}
