"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useFieldControl } from "@/registry/syntaqx/ui/field";

// shadcn's Input, sized for real use: 40px by default (sm 32px, lg 48px),
// 16px text on small screens so iOS doesn't zoom in on focus, a visible
// focus ring, and an invalid state that keeps its ring while focused. Inside
// a Field it picks up its id, description and state from the Field.

const inputVariants = cva(
  [
    "w-full min-w-0 rounded-md border border-input bg-transparent text-base text-foreground shadow-xs transition-[color,border-color,box-shadow] outline-none sm:text-sm dark:bg-input/30",
    "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
    "file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    "hover:border-ring/40",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25",
    "aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:ring-destructive/25",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "read-only:bg-muted read-only:focus-visible:ring-0",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 file:h-6",
        default: "h-10 px-3 file:h-8",
        lg: "h-12 px-4 text-base sm:text-base file:h-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>) {
  const control = useFieldControl(props);
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(inputVariants({ size }), className)}
      {...control}
    />
  );
}

export { Input, inputVariants };
