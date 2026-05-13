"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Heart, Star, Trash2, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Copy with confirmation
// ---------------------------------------------------------------------------
// The button's two states (idle / just-copied) are the entire feedback
// surface. No toast, no aria-live region, no extra DOM. The icon swap is
// the confirmation; the brief delay gives the user enough time to register
// that something happened without freezing the UI.

function CopyDemo() {
  const sample = "sk_live_4242424242424242";
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onCopy = () => {
    void navigator.clipboard.writeText(sample);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-border bg-surface/50">
      <div className="p-4 flex items-center justify-between gap-3">
        <code className="font-mono text-xs text-foreground truncate">
          {sample}
        </code>
        <button
          type="button"
          onClick={onCopy}
          aria-live="polite"
          className={`shrink-0 inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors cursor-pointer ${
            copied
              ? "border-accent/40 text-accent"
              : "border-border text-dim hover:text-foreground hover:border-border-hover"
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="border-t border-border px-4 py-2.5 text-[10px] text-dim">
        The button is the trigger and the confirmation. State reverts after 1.5s
        so the user can copy again without thinking about it.
      </div>
    </div>
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
      shouldFail ? reject(new Error("network")) : resolve();
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
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
        on
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-border text-dim hover:text-foreground hover:border-border-hover"
      } ${error ? "border-red-500/50 text-red-400" : ""}`}
    >
      <Icon size={12} className={on ? "fill-current" : ""} aria-hidden />
      <span>{label}</span>
      <span className="tabular-nums text-[10px] text-dim">{count}</span>
      {error && (
        <span className="ml-1 text-[10px] uppercase tracking-widest">
          failed
        </span>
      )}
    </button>
  );
}

function OptimisticDemo() {
  return (
    <div className="rounded-lg border border-border bg-surface/50">
      <div className="p-4 flex flex-wrap items-center gap-3">
        <OptimisticToggle icon={Heart} label="Always succeeds" initial={42} />
        <OptimisticToggle
          icon={Star}
          label="Always fails"
          initial={128}
          shouldFail
        />
      </div>
      <div className="border-t border-border px-4 py-2.5 text-[10px] text-dim">
        Clicks apply immediately. The first toggle resolves cleanly; the second
        always fails after 600ms and the UI rolls back with a brief error state.
        Click rapidly to feel the difference vs a request-then-update flow.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Destructive-action guard
// ---------------------------------------------------------------------------
// Three increasing levels of friction for the same delete action. The
// right amount of friction is a function of blast radius, not aesthetics.

function GuardDemo() {
  return (
    <div className="rounded-lg border border-border bg-surface/50">
      <div className="divide-y divide-border">
        <GuardRow
          level="No guard"
          desc="Reversible, low blast radius (dismiss a notification, hide a row)."
        >
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-foreground hover:border-border-hover cursor-pointer"
          >
            <X size={12} /> Dismiss
          </button>
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
      </div>
    </div>
  );
}

function GuardRow({
  level,
  desc,
  children,
}: {
  level: string;
  desc: string;
  children: ReactNode;
}) {
  return (
    <div className="p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-widest text-dim mb-1">
          {level}
        </div>
        <p className="text-xs text-dim leading-relaxed">{desc}</p>
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
      <button
        type="button"
        onClick={() => setDone(false)}
        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-foreground hover:border-border-hover cursor-pointer"
      >
        Reset
      </button>
    );
  }

  if (armed) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (timer.current) clearTimeout(timer.current);
            setArmed(false);
          }}
          className="rounded border border-border px-2 py-1 text-xs text-dim hover:text-foreground hover:border-border-hover cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            setArmed(false);
            setDone(true);
          }}
          className="inline-flex items-center gap-1.5 rounded border border-red-500/50 bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 cursor-pointer"
        >
          <Trash2 size={12} /> Really delete
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setArmed(true);
        timer.current = setTimeout(() => setArmed(false), 4000);
      }}
      className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-red-400 hover:border-red-500/40 cursor-pointer"
    >
      <Trash2 size={12} /> Delete
    </button>
  );
}

function TypeToConfirm({ target }: { target: string }) {
  const [input, setInput] = useState("");
  const [done, setDone] = useState(false);
  const matches = input === target;

  if (done) {
    return (
      <button
        type="button"
        onClick={() => {
          setDone(false);
          setInput("");
        }}
        className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-foreground hover:border-border-hover cursor-pointer"
      >
        Reset
      </button>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-1.5">
      <div className="text-[10px] text-dim">
        Type <code className="font-mono text-foreground">{target}</code> to
        confirm
      </div>
      <div className="inline-flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={target}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="rounded border border-border bg-background px-2 py-1 font-mono text-xs text-foreground placeholder:text-dim/50 focus:outline-none focus:border-accent/50"
        />
        <button
          type="button"
          disabled={!matches}
          onClick={() => setDone(true)}
          className="inline-flex items-center gap-1.5 rounded border border-red-500/50 bg-red-500/10 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
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
    <div className="rounded-lg border border-border bg-surface/50">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="text-[10px] font-medium uppercase tracking-widest text-dim">
          Loading state
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="text-[10px] tabular-nums text-dim" aria-live="off">
            Auto-reload in {secondsLeft}s
          </span>
          <button
            type="button"
            onClick={reload}
            className="rounded border border-border px-2 py-1 text-[10px] text-dim hover:text-foreground hover:border-border-hover cursor-pointer"
          >
            Reload now
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border">
        <SkeletonColumn label="Skeleton">
          {loading ? <SkeletonRow /> : <LoadedRow />}
        </SkeletonColumn>
        <SkeletonColumn label="Spinner">
          <SpinnerRow loading={loading} />
        </SkeletonColumn>
        <SkeletonColumn label="Nothing">
          {loading ? null : <LoadedRow />}
        </SkeletonColumn>
      </div>
      <div className="border-t border-border px-4 py-2.5 text-[10px] text-dim">
        Auto-cycles every 10s. Watch the middle and right columns: the spinner
        collapses the row, the empty state collapses the whole box. The skeleton
        on the left holds its shape so nothing reflows when content lands.
      </div>
    </div>
  );
}

function SkeletonColumn({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="p-4">
      <div className="mb-3 text-[10px] font-medium uppercase tracking-widest text-dim">
        {label}
      </div>
      {children}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-border/40 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-border/40 animate-pulse" />
        <div className="h-2 w-48 rounded bg-border/30 animate-pulse" />
      </div>
    </div>
  );
}

function SpinnerRow({ loading }: { loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="h-4 w-4 rounded-full border-2 border-border border-t-accent animate-spin" />
      </div>
    );
  }
  return <LoadedRow />;
}

function LoadedRow() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-accent/30 flex items-center justify-center text-xs font-semibold text-foreground/80">
        CP
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-foreground truncate">
          Chase Pierce
        </div>
        <div className="text-[11px] text-dim truncate">
          Hacker, open sorcerer, software engineer, cloudified.
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

export { CopyDemo, OptimisticDemo, GuardDemo, SkeletonDemo };
