// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://83053c7854f5d2501223a9d596b331ff@o463483.ingest.us.sentry.io/4511368166572032",

  // Only run in real production (NODE_ENV is also "production" in preview).
  enabled: process.env.VERCEL_ENV === "production",

  // Sampled at 10% — per-request tracing overhead feeds TTFB. See PERFORMANCE.md.
  tracesSampleRate: 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
