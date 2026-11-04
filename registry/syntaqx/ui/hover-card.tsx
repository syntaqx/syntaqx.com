"use client";

import * as React from "react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// shadcn's HoverCard, unchanged in looks and API, plus:
// - intent delays tuned for previews (120ms to open filters out a cursor
//   passing through; 100ms to close lets it travel into the card), in place
//   of Radix's 700/300;
// - keyboard focus on the trigger opens the card too, which Radix's hover
//   card leaves to the pointer;
// - loading on intent: give the card a `load` function and nothing is
//   fetched until the card first opens. HoverCardContent's children can be a
//   function of the load's state, to show a skeleton, the data or an error.
//   A `cacheKey` shares the result across cards for the session, so a second
//   hover is instant; a failed load is dropped so the next open retries.

export type HoverCardLoadState<T = unknown> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: unknown };

const cache = new Map<string, Promise<unknown>>();

interface HoverCardContextValue {
  schedule: (open: boolean) => void;
  state: HoverCardLoadState;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

/** The load state of the HoverCard around it. */
function useHoverCard<T = unknown>() {
  return (React.useContext(HoverCardContext)?.state ?? { status: "idle" }) as HoverCardLoadState<T>;
}

function HoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onOpen,
  load,
  cacheKey,
  openDelay = 120,
  closeDelay = 100,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root> & {
  /** Fires once, the first time the card opens. */
  onOpen?: () => void;
  /** Loads the card's content the first time it opens. */
  load?: () => Promise<unknown>;
  /** Shares the load's result with every card using the same key. */
  cacheKey?: string;
}) {
  const [inner, setInner] = React.useState(defaultOpen);
  const [state, setState] = React.useState<HoverCardLoadState>({ status: "idle" });
  const open = openProp ?? inner;
  const fired = React.useRef(false);
  const loading = React.useRef<"idle" | "pending" | "done">("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoad = React.useCallback(() => {
    if (!load || loading.current !== "idle") return;
    loading.current = "pending";
    setState({ status: "loading" });
    let pending = cacheKey ? cache.get(cacheKey) : undefined;
    if (!pending) {
      pending = load();
      if (cacheKey) {
        cache.set(cacheKey, pending);
        pending.catch(() => cache.delete(cacheKey));
      }
    }
    pending.then(
      (data) => {
        loading.current = "done";
        setState({ status: "success", data });
      },
      (error) => {
        loading.current = "idle";
        setState({ status: "error", error });
      },
    );
  }, [load, cacheKey]);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next && !fired.current) {
        fired.current = true;
        onOpen?.();
      }
      if (next) startLoad();
      if (openProp === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [onOpen, startLoad, onOpenChange, openProp],
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
    <HoverCardContext.Provider value={{ schedule, state }}>
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

function HoverCardContent<T = unknown>({
  className,
  align = "center",
  sideOffset = 4,
  children,
  ...props
}: Omit<React.ComponentProps<typeof HoverCardPrimitive.Content>, "children"> & {
  /** Content, or a function of the card's load state. */
  children?: React.ReactNode | ((state: HoverCardLoadState<T>) => React.ReactNode);
}) {
  const state = useHoverCard<T>();
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        data-status={state.status}
        aria-busy={state.status === "loading" || undefined}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      >
        {typeof children === "function" ? children(state) : children}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent, useHoverCard };
