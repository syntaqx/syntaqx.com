import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Request-scoped session lookup.
 *
 * Layouts and pages both run on the server and both often need the
 * session. `React.cache` deduplicates the call for the duration of a
 * single request so the layout and the page share one lookup.
 *
 * The lookup itself is usually free: Better Auth's `cookieCache`
 * (configured in lib/auth.ts) signs the session into the cookie, so
 * `auth.api.getSession` only hits the DB when the cookie cache has
 * expired or a session-mutating action just happened.
 *
 * Use this in any Server Component or page that needs the session.
 * Route handlers (under app/api) should keep calling
 * `auth.api.getSession({ headers: reqHeaders })` directly since they
 * already have the headers object and aren't part of a render tree.
 */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
