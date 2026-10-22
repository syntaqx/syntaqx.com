import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";
import { docRedirects } from "./lib/doc-redirects";

// Content-Security-Policy, in Report-Only mode first: it lists what the
// site loads today, and anything else is reported to Sentry instead of
// blocked. Enforce once reports are quiet, then tighten scripts to nonces.
// See /docs/security/security-headers.
const SENTRY_CSP_REPORT_URI =
  "https://o463483.ingest.us.sentry.io/api/4511368166572032/security/?sentry_key=83053c7854f5d2501223a9d596b331ff";

export const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js bootstraps with inline scripts; dev also needs eval for HMR.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.syntaqx.com https://*.ingest.us.sentry.io https://vercel.live wss://ws-us3.pusher.com",
  "frame-src 'self' https://vercel.live",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
  `report-uri ${SENTRY_CSP_REPORT_URI}`,
  "report-to csp",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
  { key: "Reporting-Endpoints", value: `csp="${SENTRY_CSP_REPORT_URI}"` },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // same-site, not same-origin: www and the api subdomain share resources.
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

// Markdown content negotiation: requests whose Accept header asks for
// text/markdown are served by app/md/[[...path]]. Pages with a Markdown
// representation are rewritten up front; anything that would otherwise 404
// falls back to the same route, which answers with a Markdown 404. Other
// pages keep serving HTML. Never applies on the API subdomain.
const wantsMarkdown = {
  has: [{ type: "header" as const, key: "accept", value: ".*text/markdown.*" }],
  missing: [{ type: "host" as const, value: "api.syntaqx.com" }],
};

export const markdownRewrites = {
  beforeFiles: ["/", "/posts", "/posts/:slug", "/docs", "/docs/:path*", "/contact"].map(
    (source) => ({
      source,
      destination: source === "/" ? "/md" : `/md${source}`,
      ...wantsMarkdown,
    }),
  ),
  afterFiles: [],
  fallback: [{ source: "/:path*", destination: "/md/:path*", ...wantsMarkdown }],
};

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray, empty package-lock.json
  // in the parent directory otherwise makes Next infer the wrong root, which
  // breaks module resolution (e.g. "Cannot find module '@vercel/analytics/react'").
  turbopack: {
    root: __dirname,
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
  rewrites: async () => markdownRewrites,
  redirects: async () => docRedirects(),
  // The Markdown route reads content/ at request time.
  outputFileTracingIncludes: {
    "/md/[[...path]]": ["./content/**/*"],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "syntaqx",

  project: "syntaqxcom",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
