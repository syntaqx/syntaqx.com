"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/syntaqx/ui/hover-card";

// A GitHub profile card that loads on intent: nothing is fetched until the
// reader points at (or tabs to) the trigger, the result is cached for the
// session so a second hover is instant, and a skeleton the card's own shape
// holds the space meanwhile. Uses GitHub's public REST API, which allows 60
// unauthenticated requests an hour per IP.

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

function GitHubHoverCard({
  login,
  children,
  align = "start",
}: {
  login: string;
  /** The trigger. Defaults to an @login link to the profile. */
  children?: React.ReactNode;
  align?: "start" | "center" | "end";
}) {
  const [state, setState] = React.useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ok"; data: GhUser }
    | { status: "error" }
  >({ status: "idle" });

  const onOpen = React.useCallback(() => {
    setState({ status: "loading" });
    fetchUser(login)
      .then((data) => setState({ status: "ok", data }))
      .catch(() => setState({ status: "error" }));
  }, [login]);

  return (
    <HoverCard onOpen={onOpen}>
      <HoverCardTrigger asChild>
        {children ?? (
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
      <HoverCardContent align={align} className="w-80">
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

export { GitHubHoverCard };
