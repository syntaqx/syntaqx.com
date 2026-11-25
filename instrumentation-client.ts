// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { onCLS, onINP, onLCP } from "web-vitals/attribution";
import { clsReport, type RouteMark } from "@/lib/cls-report";
import { inpReport, lcpReport } from "@/lib/vitals-report";

// A /tools/secrets link carries its decryption key in the fragment. The page
// strips it on load, but Sentry reads the URL first, so drop it from
// anything sent.
const SECRET_FRAGMENT = /(\/tools\/secrets\/?)#[^"\s\\]*/g;
function scrub<T>(event: T): T {
  return JSON.parse(JSON.stringify(event).replace(SECRET_FRAGMENT, "$1"));
}

// Headless and automated browsers are audit harnesses and crawlers, not
// readers: their cold-cache layout shifts, slow paints and scripted clicks
// were most of Sentry's noise. Puppeteer, Playwright and Selenium set
// navigator.webdriver even when they spoof a desktop user agent.
const production =
  process.env.VERCEL_ENV === "production" &&
  !navigator.webdriver &&
  !navigator.userAgent.includes("HeadlessChrome");

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

  // No tracing: next.config.ts compiles it out (bundleSizeOptimizations), so
  // every reader stops downloading it. Speed Insights covers page speed, and
  // the web-vitals warnings below name the slow element.

  // SDK 11 attaches a stack to every captureMessage by default, and Sentry
  // then titles the issue after its top minified frame ("sb", "st") instead
  // of the message. The vitals warnings' stack is web-vitals internals anyway.
  attachStacktrace: false,

  // Drop noise we can't fix. Vercel's injected `vercel-live-feedback`
  // toolbar (served from `_next-live/feedback/instrument.*.js`) throws
  // "Cannot read properties of null (reading 'getItem')" inside a
  // `pagehide` handler when the browser denies `localStorage` (private
  // mode, storage partitioning, extensions). It's third-party code on
  // a third-party event listener — we have no fix and no signal value.
  // "Object Not Found Matching Id:N, MethodName:update" is a non-Error
  // rejection thrown by email link scanners (Outlook Safe Links and similar
  // headless CefSharp browsers) while they preview a link, not by this site.
  // Vercel Analytics' script (at /_vercel/insights/ or its first-party
  // /<hash>/script.js path) throws "Invalid or unexpected token" only for
  // scrapers that mangle it in transit; production serves it intact.
  ignoreErrors: [
    /Cannot read properties of null \(reading 'getItem'\)/,
    /Object Not Found Matching Id:\d+, MethodName:\w+/,
  ],
  denyUrls: [/\/_next-live\/feedback\//, /\/_vercel\/insights\//, /\/[0-9a-f]{16}\/script\.js/],
});

// Layout shift: when a session's CLS passes 0.25 (poor), one warning naming the
// element that moved most and the route it moved on (paths only, never
// fragments). Speed Insights reports CLS per route with no element.
// A browser translating the page (Chrome wraps the new text in <font> and
// marks <html> translated-ltr/rtl; the site never emits either) reflows it
// with no input, so those sessions aren't reported.
const routes: RouteMark[] = [{ at: 0, path: location.pathname }];
const translated = () =>
  /\btranslated-(ltr|rtl)\b/.test(document.documentElement.className) ||
  document.querySelector("font") !== null;
if (production) {
  onCLS((metric) => {
    if (translated()) return;
    const report = clsReport(metric, routes, [innerWidth, innerHeight]);
    if (report) Sentry.captureMessage("Layout shift above 0.25", { level: "warning", ...report });
  });
  // Slow interactions and loads, with the element and where the time went.
  onINP((metric) => {
    const report = inpReport(metric, routes, [innerWidth, innerHeight]);
    if (report) Sentry.captureMessage("Interaction above 500ms", { level: "warning", ...report });
  });
  onLCP((metric) => {
    const report = lcpReport(metric, routes[0].path, [innerWidth, innerHeight]);
    if (report) Sentry.captureMessage("Largest paint above 4s", { level: "warning", ...report });
  });
}

export function onRouterTransitionStart(href: string) {
  routes.push({ at: performance.now(), path: new URL(href, location.href).pathname });
}
