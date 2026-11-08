"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// shadcn's Tabs, with the same exports, variants and data-slots. The `line`
// variant is restyled to match the site's code tabs: a full-width strip with
// a rule under it, small mono labels, and the active tab underlined in the
// primary color, flush with the rule, with square corners throughout.

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "rounded-lg bg-muted p-0.75 group-data-horizontal/tabs:h-9",
        line: "w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-border bg-transparent scrollbar-none group-data-vertical/tabs:border-r group-data-vertical/tabs:border-b-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center gap-1.5 border border-transparent whitespace-nowrap text-muted-foreground transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // default: shadcn's pill inside a muted track.
        "group-data-[variant=default]/tabs-list:h-[calc(100%-1px)] group-data-[variant=default]/tabs-list:flex-1 group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-2 group-data-[variant=default]/tabs-list:py-1 group-data-[variant=default]/tabs-list:text-sm group-data-[variant=default]/tabs-list:font-medium group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm dark:group-data-[variant=default]/tabs-list:data-active:border-input dark:group-data-[variant=default]/tabs-list:data-active:bg-input/30",
        // line: the site's code tabs.
        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-0 group-data-[variant=line]/tabs-list:px-4 group-data-[variant=line]/tabs-list:py-2.5 group-data-[variant=line]/tabs-list:font-mono group-data-[variant=line]/tabs-list:text-xs group-data-[variant=line]/tabs-list:data-active:text-primary dark:group-data-[variant=line]/tabs-list:data-active:text-primary",
        "after:absolute after:bg-primary after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-px group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
