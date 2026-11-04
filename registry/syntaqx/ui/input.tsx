"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useFieldControl } from "@/registry/syntaqx/ui/field";

// shadcn's Input, unchanged in looks, plus sizes to match the Button (sm
// 32px, default 36px, lg 40px) and Field wiring: inside a Field it picks up
// its id, description and invalid/disabled/required state. A numeric `size`
// still sets the native attribute, so existing code keeps working.

const inputVariants = cva(
  [
    "w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 file:h-6",
        default: "h-9 file:h-7",
        lg: "h-10 file:h-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type InputSize = "sm" | "default" | "lg";

function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & { size?: InputSize | number }) {
  const control = useFieldControl(props);
  const variant = typeof size === "number" ? "default" : size;
  return (
    <input
      type={type}
      data-slot="input"
      data-size={variant}
      size={typeof size === "number" ? size : undefined}
      className={cn(inputVariants({ size: variant }), className)}
      {...control}
    />
  );
}

export { Input, inputVariants };
