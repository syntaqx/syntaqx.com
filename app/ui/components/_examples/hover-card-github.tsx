"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/syntaqx/ui/hover-card";

interface GitHubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  followers: number;
  public_repos: number;
  location: string | null;
  company: string | null;
}

// Nothing is fetched until the card first opens; the cacheKey shares each
// profile across every card for the session. GitHub's public API allows 60
// unauthenticated requests an hour per IP.
async function fetchProfile(login: string): Promise<GitHubProfile> {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub: ${res.status}`);
  return res.json();
}

export function GitHubUser({ login, children }: { login: string; children?: ReactNode }) {
  return (
    <HoverCard load={() => fetchProfile(login)} cacheKey={`github:${login}`}>
      <HoverCardTrigger asChild>
        {children ?? (
          <a
            href={`https://github.com/${login}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            @{login}
          </a>
        )}
      </HoverCardTrigger>
      <HoverCardContent<GitHubProfile> align="start" className="w-80">
        {(state) =>
          state.status === "success" ? (
            <Profile user={state.data} />
          ) : state.status === "error" ? (
            <p className="text-sm text-muted-foreground">Couldn&apos;t load @{login}.</p>
          ) : (
            <ProfileSkeleton />
          )
        }
      </HoverCardContent>
    </HoverCard>
  );
}

function Profile({ user }: { user: GitHubProfile }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatar_url}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-full border"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name ?? user.login}</p>
          <p className="truncate text-sm text-muted-foreground">@{user.login}</p>
        </div>
      </div>
      {user.bio && <p className="line-clamp-3 text-sm/relaxed">{user.bio}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {user.location && <span>{user.location}</span>}
        {user.company && <span>{user.company}</span>}
        <span>{user.followers.toLocaleString()} followers</span>
        <span>{user.public_repos.toLocaleString()} repos</span>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
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

export default function HoverCardGitHub() {
  return (
    <p className="text-sm">
      Built with help from <GitHubUser login="octocat" /> and <GitHubUser login="torvalds" />.
    </p>
  );
}
