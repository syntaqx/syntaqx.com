"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "@/registry/syntaqx/ui/field";

// shadcn's Textarea with the Input's states. It grows with its content
// (field-sizing) up to `max-h-64`, then scrolls.

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const control = useFieldControl(props);
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content max-h-64 min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-base text-foreground shadow-xs transition-[color,border-color,box-shadow] outline-none sm:text-sm dark:bg-input/30",
        "placeholder:text-muted-foreground",
        "hover:border-ring/40",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25",
        "aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:ring-destructive/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...control}
    />
  );
}

export { Textarea };
