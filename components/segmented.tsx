"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  // sm fits more segments in a toolbar row.
  size?: "sm" | "md";
  ariaLabel?: string;
  className?: string;
}

/** A row of mutually exclusive buttons, like the tools' mode switches. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  ariaLabel,
  className,
}: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className={cn("inline-flex border border-border bg-surface p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "cursor-pointer py-1.5 text-xs font-medium transition-colors",
            size === "sm" ? "px-3" : "px-4",
            o.value === value ? "bg-accent text-background" : "text-dim hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
