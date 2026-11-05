// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { onCLS } from "web-vitals/attribution";
import { clsReport, type RouteMark } from "@/lib/cls-report";

// A /tools/secrets link carries its decryption key in the fragment. The page
// strips it on load, but Sentry reads the URL first, so drop it from
// anything sent.
const SECRET_FRAGMENT = /(\/tools\/secrets\/?)#[^"\s\\]*/g;
function scrub<T>(event: T): T {
  return JSON.parse(JSON.stringify(event).replace(SECRET_FRAGMENT, "$1"));
}

const production = process.env.VERCEL_ENV === "production";

Sentry.init({
  beforeSend: scrub,
  beforeSendTransaction: scrub,
  beforeBreadcrumb: scrub,
  dsn: "https://83053c7854f5d2501223a9d596b331ff@o463483.ingest.us.sentry.io/4511368166572032",

  // Only run in real production (NODE_ENV is also "production" in preview
  // builds, which we don't want tracing/erroring against). VERCEL_ENV
  // reaches the browser through next.config.ts's `env`.
  enabled: production,

  // Session Replay is intentionally omitted: it hooks pointer/click/input
  // events to record sessions and was the prime suspect for INP on
  // /posts/[slug]. Error tracking + sampled tracing stay.

  // Traces sampled at 10% — enough signal for a personal site without the
  // per-page-view overhead of tracing every load.
  tracesSampleRate: 0.1,

  // Drop noise we can't fix. Vercel's injected `vercel-live-feedback`
  // toolbar (served from `_next-live/feedback/instrument.*.js`) throws
  // "Cannot read properties of null (reading 'getItem')" inside a
  // `pagehide` handler when the browser denies `localStorage` (private
  // mode, storage partitioning, extensions). It's third-party code on
  // a third-party event listener — we have no fix and no signal value.
  ignoreErrors: [/Cannot read properties of null \(reading 'getItem'\)/],
  denyUrls: [/\/_next-live\/feedback\//],
});

// Layout shift: when a session's CLS passes 0.1, one warning naming the
// element that moved most and the route it moved on (paths only, never
// fragments). Speed Insights reports CLS per route with no element.
const routes: RouteMark[] = [{ at: 0, path: location.pathname }];
if (production) {
  onCLS((metric) => {
    const report = clsReport(metric, routes, [innerWidth, innerHeight]);
    if (report) Sentry.captureMessage("Layout shift above 0.1", { level: "warning", ...report });
  });
}

export function onRouterTransitionStart(
  ...args: Parameters<typeof Sentry.captureRouterTransitionStart>
) {
  routes.push({ at: performance.now(), path: new URL(args[0], location.href).pathname });
  Sentry.captureRouterTransitionStart(...args);
}
