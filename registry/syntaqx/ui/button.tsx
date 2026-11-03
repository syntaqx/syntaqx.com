import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

// shadcn's Button, sized to match the Input (sm 32px, default 40px, lg
// 48px), with theme colors throughout and a `loading` state: the label
// stays in place but hidden, so the button keeps its width, and a spinner
// sits over it while the button is busy and disabled.

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] outline-none select-none",
    "focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:not-aria-busy:opacity-50",
    "aria-invalid:border-destructive aria-invalid:ring-destructive/25",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/85",
        destructive:
          "bg-destructive text-background shadow-xs hover:bg-destructive/85 focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-xs hover:border-ring/40 hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        default: "h-10 px-4 has-[>svg]:px-3.5",
        lg: "h-12 px-6 text-base has-[>svg]:px-5",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Busy: disables the button and shows a spinner in place of its label. */
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <span className="invisible inline-flex items-center gap-[inherit]">{children}</span>
          <LoaderCircle aria-hidden className="absolute inset-0 m-auto animate-spin" />
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
