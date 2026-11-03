"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, Star, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { DemoFrame } from "@/app/ui/_components/demo-frame";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/registry/syntaqx/ui/button";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Field, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";

// ---------------------------------------------------------------------------
// Copy with confirmation
// ---------------------------------------------------------------------------
// The button's two states (idle / just-copied) are the entire feedback
// surface. No toast, no aria-live region, no extra DOM. The icon swap is
// the confirmation; the brief delay gives the user enough time to register
// that something happened without freezing the UI.

function CopyDemo() {
  const sample = "sk_live_4242424242424242";

  return (
    <DemoFrame
      className="flex items-center justify-between gap-3 p-6"
      note={
        <>
          The button is the trigger and the confirmation. State reverts after 1.5s so the user can
          copy again without thinking about it.
        </>
      }
    >
      <code className="truncate font-mono text-sm text-foreground">{sample}</code>
      <CopyButton value={sample} className="shrink-0" variant="outline" size="sm" />
    </DemoFrame>
  );
}

// ---------------------------------------------------------------------------
// Optimistic UI
// ---------------------------------------------------------------------------
// Two toggles, one that always succeeds and one that always fails. Random
// failures look like a glitch; deterministic ones make the rollback path
// legible. The button is never disabled mid-flight: optimistic UI is about
// trusting the input, not gating it.

function fakeRequest(shouldFail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("network"));
      else resolve();
    }, 600);
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
  // Monotonic request id. Each click increments it; only the response that
  // matches the latest id is allowed to mutate state. Older in-flight
  // requests are dropped on the floor, which keeps rapid clicks from
  // double-rolling-back (or fighting each other) during the 600ms window.
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
    // Optimistic application. Note: we do NOT clear `error` here. The error
    // from a previous failure should stay visible while the next request is
    // in flight, so the user sees "still retrying" instead of a flash of
    // success-then-error.
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

function OptimisticDemo() {
  return (
    <DemoFrame
      className="flex flex-wrap items-center gap-3 p-6"
      note={
        <>
          Clicks apply immediately. The first toggle resolves cleanly; the second always fails after
          600ms and the UI rolls back with a brief error state. Click rapidly to feel the difference
          vs a request-then-update flow.
        </>
      }
    >
      <OptimisticToggle icon={Heart} label="Always succeeds" initial={42} />
      <OptimisticToggle icon={Star} label="Always fails" initial={128} shouldFail />
    </DemoFrame>
  );
}

// ---------------------------------------------------------------------------
// Destructive-action guard
// ---------------------------------------------------------------------------
// Three increasing levels of friction for the same delete action. The
// right amount of friction is a function of blast radius, not aesthetics.

function GuardDemo() {
  return (
    <DemoFrame className="divide-y divide-border">
      <GuardRow
        level="No guard"
        desc="Reversible, low blast radius (dismiss a notification, hide a row)."
      >
        <Button variant="outline" size="sm">
          <X /> Dismiss
        </Button>
      </GuardRow>
      <GuardRow
        level="Soft confirm"
        desc="Reversible within a window (delete a draft, archive an item). One extra click."
      >
        <SoftConfirm />
      </GuardRow>
      <GuardRow
        level="Type-to-confirm"
        desc="Irreversible, high blast radius (drop a database, delete an org). Make the user prove they know what they're naming."
      >
        <TypeToConfirm target="production-db" />
      </GuardRow>
    </DemoFrame>
  );
}

function GuardRow({ level, desc, children }: { level: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="mb-1 text-sm font-medium text-foreground">{level}</div>
        <p className="text-sm/relaxed text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SoftConfirm() {
  const [armed, setArmed] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  if (done) {
    return (
      <Button variant="outline" size="sm" onClick={() => setDone(false)}>
        Reset
      </Button>
    );
  }

  if (armed) {
    return (
      <div className="inline-flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            setArmed(false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setArmed(false);
            setDone(true);
          }}
        >
          <Trash2 /> Really delete
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 4000);
      }}
      className="hover:border-destructive/40 hover:text-destructive"
    >
      <Trash2 /> Delete
    </Button>
  );
}

function TypeToConfirm({ target }: { target: string }) {
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const matches = input === target;

  if (done) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDone(false);
          setInput("");
        }}
      >
        Reset
      </Button>
    );
  }

  return (
    <Field className="w-auto">
      <FieldLabel>
        Type <code className="font-mono">{target}</code> to confirm
      </FieldLabel>
      <div className="flex items-center gap-2">
        <Input
          size="sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={target}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="w-44 font-mono"
        />
        <Button variant="destructive" size="sm" disabled={!matches} onClick={() => setDone(true)}>
          <Trash2 /> Delete
        </Button>
      </div>
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Skeletons that match
// ---------------------------------------------------------------------------
// The skeleton is sized to the eventual content. When the data arrives, the
// box doesn't jump. Compare to a spinner, which collapses the layout while
// loading and then reflows when content lands.

function SkeletonDemo() {
  const LOAD_MS = 1200;
  const CYCLE_MS = 10_000;
  const [loading, setLoading] = useState(true);
  // Wall-clock deadline (ms since epoch) for the next full-cycle reload.
  // Storing the deadline rather than the remaining seconds means manual
  // reloads and visibility changes don't desync the countdown.
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
        if (cancelled) return;
        setLoading(false);
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

  // 1Hz ticker just for the countdown display. Cheap; doesn't touch the
  // load/cycle state machine above.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const reload = () => {
    setLoading(true);
    setNextReloadAt(Date.now() + CYCLE_MS);
    // Note: we don't restart the cycle timer here. A manual reload just
    // re-arms the load animation; the next auto-cycle still fires on its
    // original schedule. If that ever feels wrong, lift the cycle timer
    // into a ref and reset it here.
  };

  const secondsLeft = Math.max(0, Math.ceil((nextReloadAt - now) / 1000));

  return (
    <DemoFrame
      note={
        <>
          Auto-cycles every 10s. Watch the middle and right columns: the spinner collapses the row,
          the empty state collapses the whole box. The skeleton on the left holds its shape so
          nothing reflows when content lands.
        </>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
        <div className="text-sm font-medium text-foreground">Loading state</div>
        <div className="inline-flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums" aria-live="off">
            Auto-reload in {secondsLeft}s
          </span>
          <Button variant="outline" size="sm" onClick={reload}>
            Reload now
          </Button>
        </div>
      </div>
      <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <SkeletonColumn label="Skeleton">
          {loading ? <SkeletonRow /> : <LoadedRow />}
        </SkeletonColumn>
        <SkeletonColumn label="Spinner">
          <SpinnerRow loading={loading} />
        </SkeletonColumn>
        <SkeletonColumn label="Nothing">{loading ? null : <LoadedRow />}</SkeletonColumn>
      </div>
    </DemoFrame>
  );
}

function SkeletonColumn({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="p-6">
      <div className="mb-3 text-sm font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

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

function SpinnerRow({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <Spinner className="text-primary" />
      </div>
    );
  }
  return <LoadedRow />;
}

function LoadedRow() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/30 text-sm font-semibold text-foreground/80">
        CP
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">Chase Pierce</div>
        <div className="truncate text-sm text-muted-foreground">
          Hacker, open sorcerer, software engineer, cloudified.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export { CopyDemo, OptimisticDemo, GuardDemo, SkeletonDemo };
