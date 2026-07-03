// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://83053c7854f5d2501223a9d596b331ff@o463483.ingest.us.sentry.io/4511368166572032",

  // Only run in real production (NODE_ENV is also "production" in preview
  // builds, which we don't want tracing/erroring against).
  enabled: process.env.VERCEL_ENV === "production",

  // Session Replay is intentionally omitted: it hooks pointer/click/input
  // events to record sessions and was the prime suspect for INP on
  // /posts/[slug]. Error tracking + sampled tracing stay. See PERFORMANCE.md.

  // Traces sampled at 10% — enough signal for a personal site without the
  // per-page-view overhead of tracing every load.
  tracesSampleRate: 0.1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // Drop noise we can't fix. Vercel's injected `vercel-live-feedback`
  // toolbar (served from `_next-live/feedback/instrument.*.js`) throws
  // "Cannot read properties of null (reading 'getItem')" inside a
  // `pagehide` handler when the browser denies `localStorage` (private
  // mode, storage partitioning, extensions). It's third-party code on
  // a third-party event listener — we have no fix and no signal value.
  ignoreErrors: [
    /Cannot read properties of null \(reading 'getItem'\)/,
  ],
  denyUrls: [
    /\/_next-live\/feedback\//,
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
