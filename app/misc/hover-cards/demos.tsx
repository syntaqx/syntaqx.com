"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Card } from "@/components/card";

// ---------------------------------------------------------------------------
// HoverCard primitive
// ---------------------------------------------------------------------------
// Tiny popover with intent-based open/close. The open delay (~120ms) filters
// out cursors that pass through the trigger; the close delay (~100ms) lets
// the user move the cursor into the panel without it slamming shut.
//
// `onOpen` fires the first time the card is about to become visible — that's
// the hook callers use to start their "load on intent" fetch.

interface HoverCardProps {
  trigger: ReactNode;
  children: ReactNode;
  onOpen?: () => void;
  className?: string;
  // Anchor the panel to the trigger's left or right edge. Use "end" when the
  // trigger sits at the right side of its container so the panel doesn't
  // overflow.
  align?: "start" | "end";
}

function HoverCard({
  trigger,
  children,
  onOpen,
  className = "",
  align = "start",
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  const id = useId();

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  };

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimer.current = setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        onOpen?.();
      }
      setOpen(true);
    }, 120);
  }, [onOpen]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 100);
  }, []);

  useEffect(() => () => clearTimers(), []);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onFocus={scheduleOpen}
      onBlur={scheduleClose}
    >
      <span aria-describedby={open ? id : undefined}>{trigger}</span>
      {open && (
        <span
          id={id}
          role="tooltip"
          className={`absolute ${align === "end" ? "right-0" : "left-0"} top-full z-50 mt-2 block rounded-lg border border-border bg-surface p-3 shadow-lg ${className || "w-72"}`}
        >
          {children}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Time hover card
// ---------------------------------------------------------------------------

interface TimeProps {
  // RFC 3339 / ISO 8601 instant.
  iso: string;
  // IANA tz where the event actually happened.
  sourceTz: string;
  // Human label for the source (e.g. "Stripe HQ").
  sourceLabel: string;
  // "datetime" shows date + time + tz abbr; "date" shows just date + tz abbr.
  // Use "date" in cramped surfaces (table cells, list rows) where the time
  // isn't load-bearing but the tz still matters.
  variant?: "datetime" | "date";
}

function formatDate(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTime(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function tzAbbr(date: Date, tz: string) {
  // Pull the localized short tz name (e.g. "MDT", "CET", "JST"). Falls back
  // to the IANA id if the runtime doesn't expose a `timeZoneName` part for
  // this zone.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "short",
  }).formatToParts(date);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
}

function TimeHover({
  iso,
  sourceTz,
  sourceLabel,
  variant = "datetime",
}: TimeProps) {
  const date = new Date(iso);
  const [viewerTz, setViewerTz] = useState<string | null>(null);

  // SSR-safe: viewer tz only resolves client-side. Until hydration we render
  // in UTC so the server output matches. The setState-in-effect is the whole
  // point here — we *want* a re-render once we know the viewer's zone.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewerTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const displayTz = viewerTz ?? "UTC";
  const displayAbbr = tzAbbr(date, displayTz);
  const trigger =
    variant === "date"
      ? `${formatDate(date, displayTz)} (${displayAbbr})`
      : `${formatDate(date, displayTz)} · ${formatTime(date, displayTz)} ${displayAbbr}`;

  return (
    <HoverCard
      className="w-80"
      align="end"
      trigger={
        <time
          dateTime={iso}
          className="cursor-help underline decoration-dim decoration-dotted underline-offset-4 text-foreground whitespace-nowrap"
        >
          {trigger}
        </time>
      }
    >
      <div className="text-[10px] font-medium uppercase tracking-widest text-dim mb-2">
        Time conversion
      </div>
      <div className="space-y-1.5">
        <TzRow
          label={sourceLabel}
          tz={sourceTz}
          date={formatDate(date, sourceTz)}
          time={formatTime(date, sourceTz)}
          abbr={tzAbbr(date, sourceTz)}
          accent
        />
        <TzRow
          label="You"
          tz={displayTz}
          date={formatDate(date, displayTz)}
          time={formatTime(date, displayTz)}
          abbr={displayAbbr}
        />
        <TzRow
          label="UTC"
          tz="UTC"
          date={formatDate(date, "UTC")}
          time={formatTime(date, "UTC")}
          abbr="UTC"
        />
      </div>
    </HoverCard>
  );
}

function TzRow({
  label,
  tz,
  date,
  time,
  abbr,
  accent,
}: {
  label: string;
  tz: string;
  date: string;
  time: string;
  abbr: string;
  accent?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-3">
      <span className="min-w-0 truncate text-[11px] text-dim">
        {label}
        {label !== tz && (
          <span className="ml-1 text-[10px] text-dim/70">({tz})</span>
        )}
      </span>
      <span
        className={`whitespace-nowrap text-xs ${accent ? "text-accent" : "text-foreground"}`}
      >
        {date}
      </span>
      <span
        className={`whitespace-nowrap text-xs tabular-nums ${accent ? "text-accent" : "text-foreground"}`}
      >
        {time} <span className="text-dim">{abbr}</span>
      </span>
    </div>
  );
}

function TimeDemo() {
  // One representative event. The reader's local tz is what changes the
  // demo — the data stays fixed.
  const sample = {
    iso: "2026-05-12T14:20:00Z",
    sourceTz: "America/Los_Angeles",
    sourceLabel: "Stripe HQ",
  } as const;

  return (
    <Card>
      <dl className="space-y-3 text-xs">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-dim">Created</dt>
          <dd>
            <TimeHover {...sample} />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-dim">Created (date only)</dt>
          <dd>
            <TimeHover {...sample} variant="date" />
          </dd>
        </div>
      </dl>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// User hover card (load on intent)
// ---------------------------------------------------------------------------
//
// Fetches public GitHub profile data the first time the card is about to
// open. Result is cached per-session in a module-level Map so re-hovering
// the same handle is instant. Errors fall back to a minimal card.

interface GhUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  company: string | null;
}

const userCache = new Map<string, Promise<GhUser>>();

function fetchUser(login: string): Promise<GhUser> {
  const hit = userCache.get(login);
  if (hit) return hit;
  const p = fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
    headers: { Accept: "application/vnd.github+json" },
  }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<GhUser>;
  });
  userCache.set(login, p);
  // Drop failed lookups so a transient error doesn't poison the cache.
  p.catch(() => userCache.delete(login));
  return p;
}

function UserHover({ login, trigger }: { login: string; trigger?: ReactNode }) {
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ok"; data: GhUser }
    | { status: "error" }
  >({ status: "idle" });

  const onOpen = useCallback(() => {
    setState({ status: "loading" });
    fetchUser(login)
      .then((data) => setState({ status: "ok", data }))
      .catch(() => setState({ status: "error" }));
  }, [login]);

  return (
    <HoverCard
      onOpen={onOpen}
      trigger={
        trigger ?? (
          <a
            href={`https://github.com/${login}`}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            @{login}
          </a>
        )
      }
    >
      {state.status === "loading" || state.status === "idle" ? (
        <UserSkeleton />
      ) : state.status === "error" ? (
        <p className="text-xs text-dim">Couldn&apos;t load @{login}.</p>
      ) : (
        <UserBody data={state.data} />
      )}
    </HoverCard>
  );
}

function UserSkeleton() {
  return (
    <div className="flex gap-3">
      <div className="h-10 w-10 rounded-full bg-border/40 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-border/40 animate-pulse" />
        <div className="h-2 w-32 rounded bg-border/30 animate-pulse" />
        <div className="h-2 w-28 rounded bg-border/30 animate-pulse" />
      </div>
    </div>
  );
}

function UserBody({ data }: { data: GhUser }) {
  return (
    <div>
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.avatar_url}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-full border border-border"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-foreground truncate">
            {data.name ?? data.login}
          </div>
          <div className="text-[11px] text-dim truncate">@{data.login}</div>
        </div>
      </div>
      {data.bio && (
        <p className="mt-2 text-[11px] text-muted leading-relaxed line-clamp-3">
          {data.bio}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-dim">
        {data.location && <span>{data.location}</span>}
        {data.company && <span>{data.company}</span>}
        <span>{data.followers.toLocaleString()} followers</span>
        <span>{data.public_repos.toLocaleString()} repos</span>
      </div>
    </div>
  );
}

function UserDemo({ bare = false }: { bare?: boolean } = {}) {
  const handles = ["syntaqx", "octocat", "torvalds", "gaearon"];
  const body = (
    <div className="text-xs text-foreground leading-loose">
      Thanks to{" "}
      {handles.map((h, i) => (
        <span key={h}>
          <UserHover login={h} />
          {i < handles.length - 2
            ? ", "
            : i === handles.length - 2
              ? ", and "
              : ""}
        </span>
      ))}{" "}
      for the inspiration.
    </div>
  );
  return bare ? body : <Card>{body}</Card>;
}

// ---------------------------------------------------------------------------
// Avatar hover (same load-on-intent, different trigger surface)
// ---------------------------------------------------------------------------

function AvatarDemo({ bare = false }: { bare?: boolean } = {}) {
  const handles = [
    "syntaqx",
    "octocat",
    "torvalds",
    "gaearon",
    "tj",
    "sindresorhus",
  ];
  const body = (
    <div className="flex flex-wrap items-center gap-3">
      {handles.map((h) => (
        <UserHover
          key={h}
          login={h}
          trigger={
            <button
              type="button"
              aria-label={`Open profile for @${h}`}
              className="block h-10 w-10 overflow-hidden rounded-full border border-border bg-surface transition-colors hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://github.com/${h}.png?size=80`}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          }
        />
      ))}
    </div>
  );
  return bare ? body : <Card>{body}</Card>;
}

// ---------------------------------------------------------------------------

export { TimeDemo, UserDemo, AvatarDemo };
