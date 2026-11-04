import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

// shadcn's Button from its radix-vega style, unchanged in looks and API, plus
// a `loading` state: the label stays in place but hidden, so the button keeps
// its width, and a spinner sits over it while the button is busy (aria-busy)
// and disabled.
//
// And a `shape`. The default is shadcn's. A shape is one entry in `shape`
// below; any shape but the default wraps the content in a
// [data-slot=button-label] span, so a shape that transforms the button can
// stand the label back up (slant does). --button-slant sets slant's angle.

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:not-aria-busy:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
      shape: {
        default: "",
        slant:
          "rounded-none in-data-[slot=button-group]:rounded-none -skew-x-(--button-slant,8.5deg) *:data-[slot=button-label]:skew-x-(--button-slant,8.5deg)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  shape = "default",
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
  const shaped = shape !== "default";
  const label = (content: React.ReactNode) =>
    shaped ? (
      <span data-slot="button-label" className="inline-flex items-center gap-[inherit]">
        {content}
      </span>
    ) : (
      content
    );

  let content: React.ReactNode = children;
  if (asChild) {
    // The label goes inside the child (a link, say), around its own content.
    if (shaped && React.isValidElement<{ children?: React.ReactNode }>(children)) {
      content = React.cloneElement(children, undefined, label(children.props.children));
    }
  } else if (loading) {
    content = label(
      <>
        <span className="invisible inline-flex items-center gap-[inherit]">{children}</span>
        <LoaderCircle aria-hidden className="absolute inset-0 m-auto animate-spin" />
      </>,
    );
  } else {
    content = label(children);
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-shape={shaped ? shape : undefined}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading || undefined}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    >
      {content}
    </Comp>
  );
}

export { Button, buttonVariants };
