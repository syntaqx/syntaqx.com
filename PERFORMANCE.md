# Performance notes

Web Vitals signal source: Vercel Speed Insights (Real Experience
Score). Worst offenders historically: `/posts/[slug]` (FCP, INP)
and `/` (FCP).

After any change: deploy, wait 24–48h for fresh Speed Insights
samples to accumulate, then compare p75. Don't mix pre-fix and
post-fix traffic when judging impact.

## Done

### INP on `/posts/[slug]` — MutationObserver removed

- File: [components/copy-code.tsx](components/copy-code.tsx).
- Old code installed a `MutationObserver` on `document.body` with
  `childList: true, subtree: true`. Every unrelated DOM mutation
  (theme toggle, mobile menu, search modal, any React update)
  re-ran `querySelectorAll("pre:has(> code)")` across the whole
  document. `:has()` is expensive; post pages have many `<pre>`.
- New code injects buttons once on mount, delegates clicks from
  `document`. Post DOM is server-rendered and doesn't mutate.

### Hydration boundary in root layout — removed

- File: [components/background-effect.tsx](components/background-effect.tsx).
- Was `"use client"` with no hooks/events. Forced JS bundle +
  hydration boundary on every page for a decorative div. Now a
  Server Component.

### FCP on `/` — GitHub fetch unblocked via streaming

- Files: [app/page.tsx](app/page.tsx),
  [components/github-activity.tsx](components/github-activity.tsx).
- Old: `Home` was `async` and awaited `fetchGitHubContributions()`
  before returning any HTML. Even with `revalidate: 3600`, cold
  renders paid a full GitHub HTTPS round trip + Vercel suspense-
  cache lookup (~200ms even on hit). Blocked TTFB → FCP → LCP.
- New: `Home` is sync. GitHub activity is wrapped in `<Suspense>`
  with `GitHubActivityAsync` and a height-stable
  `GitHubActivitySkeleton` (CLS-safe).

### Drizzle Neon pool — stale-socket fix

Not a Vitals fix, but related to the same investigation:

- File: [lib/db/index.ts](lib/db/index.ts).
- `neonConfig.poolQueryViaFetch = true` so single-statement
  queries go via fetch (no idle WS to go stale). Transactions
  still use the WS pool. Added `pool.on("error", ...)` so an
  idle-socket close doesn't crash the function.
- Tradeoff: each `db.query.*` is one HTTPS round trip; pairs of
  reads no longer multiplex over a warm WS. Picked reliability.

## Open levers, by priority

1. **TTFB ~1s.** Floor under FCP/LCP. Investigate before any more
   client-side micro-optimizations. Suspects: cold start, DB pool
   latency (now fetch-based), middleware/`/[handle]` catch-all,
   Better Auth session lookup in shared paths. Use Vercel traces
   for a specific slow request rather than guessing.

2. **Sentry config is noisy/expensive.**
   [instrumentation-client.ts](instrumentation-client.ts) currently
   sets:
   - `tracesSampleRate: 1` — every page view traced. Burns quota.
   - `replaysSessionSampleRate: 0.1` +
     `replaysOnErrorSampleRate: 1.0` — Replay hooks many DOM
     events; suspect for residual INP.

   Dial both down deliberately. Also consider gating `enabled` on
   `VERCEL_ENV === "production"` (currently uses `NODE_ENV`, which
   is `production` in preview builds too).

3. **`/posts/[slug]` LCP element unknown.** If hero `<h1>` is the
   LCP, we already helped FCP and likely LCP. If a code block or
   image is LCP, server-side `rehypeShiki` is already pre-
   rendering syntax HTML at build, so no further code-highlight
   work needed. Check Web Vitals "LCP element" breakdown before
   optimizing blind.

4. **`getAllPosts()` is sync FS on every request to `/`.** Modest;
   wrap in `cache()` or hoist to module scope if traffic grows.
   Not the bottleneck today.

5. **Static post pages.** [app/posts/[slug]/page.tsx](app/posts/[slug]/page.tsx)
   exports `generateStaticParams` — confirm via build output that
   all slugs are actually pre-rendered (`SSG`, not `ƒ`/dynamic).
   If anything in the render path opts into dynamic (cookies,
   headers, `noStore`), the page becomes SSR per-request.

6. **Mobile p75.** Desktop p75 numbers we've been looking at are
   probably 1.5–2× worse on mobile, and that's what Google ranks
   on. Get the mobile breakdown before declaring done.

## Investigation patterns that worked

- Look for `"use client"` on components with no hooks/events/refs
  — free wins, no behavioral change.
- Look for `MutationObserver` on `document.body` with
  `subtree: true` — almost always wrong outside of intentional
  cross-tree synchronization.
- Look for `async` page/layout server components that `await`
  external HTTP — wrap the awaited subtree in `<Suspense>` with a
  height-stable fallback (don't regress CLS).
- Sentry/Analytics/Replay bundles can dominate INP without showing
  up as "your code". Check before chasing app-level optimizations.

## Don't bother

- Removing `next/font/google` (`Geist_Mono`). Self-hosted by
  `next/font`, swap behavior, not on critical render path.
- Single-country outliers in Speed Insights with `n=1` (Germany
  9.46s etc.). Noise until ≥5 samples.
- Client-side Shiki via
  [components/code-highlight.tsx](components/code-highlight.tsx).
  Only used on `/misc/*`, not on `/posts/[slug]`. Posts use
  server-side `rehypeShiki` at build
  ([lib/posts.ts](lib/posts.ts)).
