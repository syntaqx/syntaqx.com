"use client";

import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// shadcn's HoverCard, unchanged in looks and API, plus:
// - intent delays tuned for previews (120ms to open filters out a cursor
//   passing through; 100ms to close lets it travel into the card), in place
//   of Radix's 700/300;
// - `onOpen`, fired once, the first time the card opens: start a "load on
//   intent" fetch there;
// - keyboard focus on the trigger opens the card too, which Radix's hover
//   card leaves to the pointer.

interface HoverCardContextValue {
  schedule: (open: boolean) => void;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

function HoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpen,
  openDelay = 120,
  closeDelay = 100,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root> & {
  /** Fires once, the first time the card opens. */
  onOpen?: () => void;
}) {
  const [inner, setInner] = React.useState(defaultOpen);
  const open = openProp ?? inner;
  const fired = React.useRef(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next && !fired.current) {
        fired.current = true;
        onOpen?.();
      }
      if (openProp === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [onOpen, onOpenChange, openProp],
  );

  const schedule = React.useCallback(
    (next: boolean) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setOpen(next), next ? openDelay : closeDelay);
    },
    [setOpen, openDelay, closeDelay],
  );

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <HoverCardContext.Provider value={{ schedule }}>
      <HoverCardPrimitive.Root
        data-slot="hover-card"
        open={open}
        onOpenChange={setOpen}
        openDelay={openDelay}
        closeDelay={closeDelay}
        {...props}
      />
    </HoverCardContext.Provider>
  );
}

function HoverCardTrigger({
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  const ctx = React.useContext(HoverCardContext);
  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      onFocus={(e) => {
        onFocus?.(e);
        if (e.currentTarget.matches(":focus-visible")) ctx?.schedule(true);
      }}
      onBlur={(e) => {
        onBlur?.(e);
        ctx?.schedule(false);
      }}
      {...props}
    />
  );
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
