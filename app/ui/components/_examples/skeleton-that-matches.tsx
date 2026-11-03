"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/registry/syntaqx/ui/button";
import { Skeleton } from "@/registry/syntaqx/ui/skeleton";
import { Spinner } from "@/registry/syntaqx/ui/spinner";

const LOAD_MS = 1200;
const CYCLE_MS = 10_000;

// Each bar sits in a box the height of the line it stands in for, so the
// row is exactly as tall loading as loaded.
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="flex h-5 items-center">
          <Skeleton className="h-3.5 w-28 max-w-full" />
        </div>
        <div className="flex h-5 items-center">
          <Skeleton className="h-3 w-40 max-w-full" />
        </div>
      </div>
    </div>
  );
}

function LoadedRow() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/30 text-sm font-semibold text-foreground/80">
        CP
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">Chase Pierce</div>
        <div className="truncate text-sm text-muted-foreground">
          Hacker, open sorcerer, software engineer, cloudified.
        </div>
      </div>
    </div>
  );
}

function Column({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="p-4">
      <div className="mb-3 text-sm font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

export default function SkeletonThatMatches() {
  const [loading, setLoading] = useState(true);
  // A wall-clock deadline rather than seconds remaining, so a manual reload
  // doesn't desync the countdown.
  const [nextReloadAt, setNextReloadAt] = useState(() => Date.now() + CYCLE_MS);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    let loadTimer: ReturnType<typeof setTimeout>;
    let cycleTimer: ReturnType<typeof setTimeout>;

    const startCycle = () => {
      if (cancelled) return;
      setLoading(true);
      setNextReloadAt(Date.now() + CYCLE_MS);
      loadTimer = setTimeout(() => {
        if (!cancelled) setLoading(false);
      }, LOAD_MS);
      cycleTimer = setTimeout(startCycle, CYCLE_MS);
    };

    startCycle();
    return () => {
      cancelled = true;
      clearTimeout(loadTimer);
      clearTimeout(cycleTimer);
    };
  }, []);

  // Ticks the countdown only; the load cycle above doesn't depend on it.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const reload = () => {
    setLoading(true);
    setNextReloadAt(Date.now() + CYCLE_MS);
  };

  const secondsLeft = Math.max(0, Math.ceil((nextReloadAt - now) / 1000));

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-lg border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <span className="text-xs text-muted-foreground tabular-nums" aria-live="off">
          Reloads in {secondsLeft}s
        </span>
        <Button variant="outline" size="sm" onClick={reload}>
          Reload now
        </Button>
      </div>
      <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Column label="Skeleton">{loading ? <SkeletonRow /> : <LoadedRow />}</Column>
        <Column label="Spinner">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Spinner className="text-primary" />
            </div>
          ) : (
            <LoadedRow />
          )}
        </Column>
        <Column label="Nothing">{loading ? null : <LoadedRow />}</Column>
      </div>
    </div>
  );
}
