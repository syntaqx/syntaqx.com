"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { UserMenu } from "@/components/auth/user-menu";

/**
 * Desktop header auth slot.
 *
 * The root layout used to call `auth.api.getSession({ headers })` to
 * decide between <UserMenu /> and a "Sign in" link. That single call
 * opted EVERY route out of static rendering — `/posts/[slug]` then
 * re-ran Shiki on every request, which made content navigation feel
 * broken on cold lambdas.
 *
 * Moving the lookup to the client (`useSession()` reads
 * `/api/auth/get-session`) lets the layout — and every page that
 * doesn't otherwise opt out — prerender statically. The tradeoff is
 * a brief render with no auth chrome on first paint; we mask it with
 * a fixed-size placeholder so layout doesn't shift.
 *
 * See: docs/architecture/auth.md
 */
export function HeaderAuth() {
  const { data, isPending } = useSession();

  if (isPending) {
    // Same outer footprint as UserMenu / Sign-in to avoid CLS.
    return (
      <div
        aria-hidden
        className="hidden sm:flex items-center pl-3 ml-2 border-l border-border"
      >
        <div className="h-7 w-7 rounded-full bg-surface animate-pulse" />
      </div>
    );
  }

  const user = data?.user as
    | {
        name?: string | null;
        username?: string | null;
        image?: string | null;
      }
    | undefined;
  const handle = user ? (user.username ?? user.name ?? null) : null;

  if (handle && user) {
    return (
      <div className="hidden sm:flex items-center pl-3 ml-2 border-l border-border">
        <UserMenu
          username={handle}
          displayName={user.name || handle}
          image={user.image}
        />
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="hidden sm:inline-flex h-8 items-center rounded-lg border border-border bg-surface/50 px-3 text-xs text-dim hover:text-muted hover:border-border-hover transition-colors"
    >
      Sign in
    </Link>
  );
}
