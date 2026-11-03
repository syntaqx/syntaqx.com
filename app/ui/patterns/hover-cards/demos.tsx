"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Card } from "@/components/card";
import { DemoFrame } from "@/app/ui/_components/demo-frame";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/syntaqx/ui/hover-card";
import { Timestamp } from "@/registry/syntaqx/ui/timestamp";

function TimeDemo() {
  // One representative event. The reader's local tz is what changes the
  // demo — the data stays fixed.
  const sample = {
    iso: "2026-05-12T14:20:00Z",
    sourceTz: "America/Los_Angeles",
    sourceLabel: "Stripe HQ",
  } as const;

  return (
    <DemoFrame className="p-6">
      <dl className="space-y-4 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">Created</dt>
          <dd>
            <Timestamp {...sample} />
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">Created (date only)</dt>
          <dd>
            <Timestamp {...sample} variant="date" />
          </dd>
        </div>
      </dl>
    </DemoFrame>
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
    <HoverCard onOpen={onOpen}>
      <HoverCardTrigger asChild>
        {trigger ?? (
          <a
            href={`https://github.com/${login}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            @{login}
          </a>
        )}
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80">
        {state.status === "loading" || state.status === "idle" ? (
          <UserSkeleton />
        ) : state.status === "error" ? (
          <p className="text-sm text-muted-foreground">Couldn&apos;t load @{login}.</p>
        ) : (
          <UserBody data={state.data} />
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

function UserSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function UserBody({ data }: { data: GhUser }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.avatar_url}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-full border"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">
            {data.name ?? data.login}
          </div>
          <div className="truncate text-sm text-muted-foreground">@{data.login}</div>
        </div>
      </div>
      {data.bio && <p className="line-clamp-3 text-sm/relaxed text-foreground">{data.bio}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
    <div className="text-sm/loose text-foreground">
      Thanks to{" "}
      {handles.map((h, i) => (
        <span key={h}>
          <UserHover login={h} />
          {i < handles.length - 2 ? ", " : i === handles.length - 2 ? ", and " : ""}
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
  const handles = ["syntaqx", "octocat", "torvalds", "gaearon", "tj", "sindresorhus"];
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
              className="block size-10  overflow-hidden rounded-full border border-border bg-card transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://github.com/${h}.png?size=80`}
                alt={`${h}'s avatar`}
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                className="size-full  object-cover"
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
