"use client";

import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/syntaqx/ui/tooltip";

/** A short label on hover or focus, for icon-only controls: the registry Tooltip. */
export function Tip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={6} collisionPadding={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
