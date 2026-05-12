import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Request-scoped session lookup.
 *
 * Layouts and pages both run on the server and both often need the
 * session. Calling `auth.api.getSession` directly in each place issues
 * one DB hit per call. Wrapping it in `React.cache` deduplicates the
 * call for the duration of a single request, so the layout and the
 * page share one round trip.
 *
 * Use this in any Server Component or page that needs the session.
 * Route handlers (under app/api) should keep calling
 * `auth.api.getSession({ headers: reqHeaders })` directly since they
 * already have the headers object and aren't part of a render tree.
 */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
