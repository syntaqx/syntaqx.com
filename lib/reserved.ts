/**
 * Reserved handles.
 *
 * Names that must never be claimable as a username or organization
 * slug, because the catch-all `/[handle]` route would otherwise be
 * shadowed by a static route the user can't reach (or, worse, would
 * silently start serving the user's profile when we add a new top-level
 * page tomorrow).
 *
 * Consulted in two places:
 *   - lib/auth.ts → username plugin's `usernameValidator`
 *   - app/[handle]/page.tsx → short-circuit before DB lookup
 *
 * Keep this list in sync with `app/` top-level segments. When you add
 * a new top-level route, add its segment here.
 */

const RESERVED = new Set<string>([
  // Top-level routes that exist today
  "about",
  "api",
  "docs",
  "forgot-password",
  "legal",
  "login",
  "misc",
  "posts",
  "projects",
  "sentry-example-page",
  "settings",
  "signup",
  "tags",

  // Auth/identity surface area we'll likely add
  "account",
  "admin",
  "auth",
  "authorize",
  "callback",
  "logout",
  "oauth",
  "password",
  "register",
  "reset",
  "reset-password",
  "session",
  "sessions",
  "sign-in",
  "sign-out",
  "sign-up",
  "signin",
  "signout",
  "sso",
  "verify",

  // Generic infra / convention names
  "assets",
  "blog",
  "cdn",
  "console",
  "dashboard",
  "favicon",
  "favicon.ico",
  "feed",
  "help",
  "home",
  "manifest",
  "manifest.json",
  "new",
  "opengraph-image",
  "pricing",
  "public",
  "robots",
  "robots.txt",
  "rss",
  "search",
  "security",
  "sitemap",
  "sitemap.xml",
  "static",
  "status",
  "support",
  "team",
  "teams",
  "trpc",
  "u",
  "users",
  "v1",
  "well-known",
]);

export function isReservedHandle(handle: string): boolean {
  return RESERVED.has(handle.toLowerCase());
}
