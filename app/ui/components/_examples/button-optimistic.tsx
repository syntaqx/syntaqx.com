"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/syntaqx/ui/button";

// Stands in for the network: deterministic, so the rollback path is easy to
// see. Random failures would look like a glitch.
function fakeRequest(shouldFail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => (shouldFail ? reject(new Error("network")) : resolve()), 600);
  });
}

function OptimisticToggle({
  icon: Icon,
  label,
  initial = 0,
  shouldFail = false,
}: {
  icon: typeof Heart;
  label: string;
  initial?: number;
  shouldFail?: boolean;
}) {
  const [on, setOn] = useState(false);
  const [count, setCount] = useState(initial);
  const [error, setError] = useState(false);
  // Each click takes the next request id, and only the latest request's
  // response may change state. Older ones are ignored, so rapid clicks
  // can't roll back twice or fight each other.
  const reqId = useRef(0);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (errorTimer.current) clearTimeout(errorTimer.current);
    },
    [],
  );

  const toggle = () => {
    const next = !on;
    // Apply it now. A previous error stays visible while this request is in
    // flight, so there's no flash of success before the next failure.
    setOn(next);
    setCount((c) => c + (next ? 1 : -1));

    const myId = ++reqId.current;
    fakeRequest(shouldFail)
      .then(() => {
        if (myId !== reqId.current) return;
        setError(false);
        if (errorTimer.current) clearTimeout(errorTimer.current);
      })
      .catch(() => {
        if (myId !== reqId.current) return;
        setOn(!next);
        setCount((c) => c + (next ? -1 : 1));
        setError(true);
        if (errorTimer.current) clearTimeout(errorTimer.current);
        errorTimer.current = setTimeout(() => setError(false), 2400);
      });
  };

  // Never disabled mid-flight: the point is to trust the input.
  return (
    <Button
      variant="outline"
      aria-pressed={on}
      onClick={toggle}
      className={cn(
        on && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
        error &&
          "border-destructive/50 text-destructive hover:border-destructive/50 hover:text-destructive",
      )}
    >
      <Icon aria-hidden className={cn(on && "fill-current")} />
      <span>{label}</span>
      <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      {error && <span className="text-xs">failed</span>}
    </Button>
  );
}

export default function ButtonOptimistic() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <OptimisticToggle icon={Heart} label="Always succeeds" initial={42} />
      <OptimisticToggle icon={Star} label="Always fails" initial={128} shouldFail />
    </div>
  );
}
