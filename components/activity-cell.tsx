"use client";

import type { ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

/**
 * One shared Tooltip provider for the whole contribution grid, so the hover
 * delay is paid once and subsequent cells reveal instantly as you sweep
 * across. Renders no DOM node of its own (it's a context provider), so the
 * grid's flex layout is untouched.
 */
export function ActivityGridTooltips({ children }: { children: ReactNode }) {
  return (
    <Tooltip.Provider
      delayDuration={80}
      skipDelayDuration={300}
      disableHoverableContent
    >
      {children}
    </Tooltip.Provider>
  );
}

/**
 * A single day cell wrapped in a Radix tooltip. Keeps `data-date` on the
 * rendered div so `TodayHighlight` can still find and ring today's cell.
 * The cell stays a non-focusable div (like GitHub's own graph) to avoid
 * adding hundreds of tab stops; the tooltip is pointer-driven.
 */
export function ActivityCell({
  date,
  label,
  className,
}: {
  date: string;
  label?: string | null;
  className: string;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div data-date={date} className={className} />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={6}
          collisionPadding={8}
          className="z-200 rounded-md border border-border bg-surface px-2 py-1 text-[10px] leading-snug shadow-lg"
        >
          {label && (
            <span className="block font-medium text-foreground">{label}</span>
          )}
          <span className="block text-dim">{date}</span>
          <Tooltip.Arrow className="fill-surface" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
