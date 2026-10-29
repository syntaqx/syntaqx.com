"use client";

import type { ReactNode } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

/** A short label on hover or focus, for icon-only controls. */
export function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
            sideOffset={6}
            collisionPadding={8}
            className="z-100 border border-border bg-surface px-2.5 py-1.5 text-[10px] leading-snug text-dim shadow-lg"
          >
            {label}
            <Tooltip.Arrow className="fill-surface" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
