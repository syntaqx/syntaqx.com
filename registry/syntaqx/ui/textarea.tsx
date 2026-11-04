"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "@/registry/syntaqx/ui/field";

// shadcn's Textarea, unchanged in looks, plus Field wiring and a ceiling:
// it grows with its content up to `max-h-64`, then scrolls.

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const control = useFieldControl(props);
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content max-h-64 min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...control}
    />
  );
}

export { Textarea };
