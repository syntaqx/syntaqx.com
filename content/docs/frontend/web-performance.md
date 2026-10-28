+++
title = "Web Performance"
description = "Core Web Vitals targets measured from real users, performance budgets enforced in CI, and the handful of habits that keep pages fast: less JavaScript first."
category = "Frontend"
order = 602
tags = ["performance", "core-web-vitals", "frontend", "budgets"]
+++

Speed is a feature people notice only when it's missing, and it shows up directly in revenue: in a [Deloitte study](https://web.dev/case-studies/milliseconds-make-millions) of mobile sites, a tenth of a second faster across the journey lifted retail conversions by 8.4%.

It's also one of the few features that degrades on its own. Every dependency, image and script is added for a good reason, and each makes the page a little slower; nobody decides to make the site slow. So performance is held with budgets that fail the build, not fixed in a big project every couple of years.

## Targets: Core Web Vitals

I use the [Core Web Vitals](https://web.dev/articles/vitals) as targets because they measure what users feel (does the main content show up, does the page respond, does it stop jumping around) rather than what's convenient, like total bytes. Each is judged at the **75th percentile** of real page loads, separately for mobile and desktop: the median hides the slower devices where people give up, and the 99th is dominated by outliers you can't fix.

| Metric | Measures | Good |
| --- | --- | --- |
| Largest Contentful Paint (LCP) | Loading: when the main content appears | 2.5 s or less |
| Interaction to Next Paint (INP) | Responsiveness: how fast the page reacts to input | 200 ms or less |
| Cumulative Layout Shift (CLS) | Visual stability: how much content jumps around | 0.1 or less |

Past the good threshold, each metric has a poor one: LCP over 4 seconds, INP over 500 ms and CLS over 0.25, with "needs improvement" in between ([Defining the Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)). The LCP target is also a budget to split: web.dev suggests roughly 40% of it for the server's first byte, 40% for loading the LCP resource, and under 10% each for the delays before the load and before the render ([Optimize LCP](https://web.dev/articles/optimize-lcp)).

![Dimensional drawing of a Core Web Vitals budget. The 2.5-second good LCP threshold is split into time to first byte at about 40 percent, 1.00 s, a resource load delay of at most 0.25 s, a load duration of about 1.00 s, and a render delay of at most 0.25 s, summing to 2.50 s. A second view draws the good, needs improvement and poor bands for each metric at the 75th percentile: LCP at 2.5 and 4.0 s, INP at 200 and 500 ms, CLS at 0.1 and 0.25.](/diagrams/pb-frontend-vitals-budget.svg "The LCP target is a budget with four parts; a slow server spends the image's share before the image is even requested.")

[INP replaced First Input Delay](https://web.dev/blog/inp-cwv-launch) as a Core Web Vital in March 2024. It measures every interaction, not just the first, which makes heavy JavaScript much harder to hide.

## Measure Real Users

- **Field data decides.** Real-user monitoring (RUM) and the [Chrome UX Report](https://developer.chrome.com/docs/crux) show what people actually experience, on their devices and networks.
- **Lab data explains.** Lighthouse and DevTools traces find why a number is bad and check a fix; they don't declare victory. A fast laptop on office Wi-Fi is not your median user.
- **Watch the 75th percentile, not the average.** An average blends a fast majority with a slow minority into a number that describes nobody.

## Budgets in CI

A budget turns "keep it fast" into a check that fails:

- **JavaScript size** per route, compressed. The first budget to set, because it's the most common regression.
- **Lab metrics** on key pages with [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci), asserting LCP, CLS and total blocking time stay under thresholds.
- **A new dependency** has to fit the budget, or something else gets removed. See [Dependencies & Upgrades](/docs/engineering/dependencies).

Set budgets from where you are today, then tighten them. A budget nobody can meet gets ignored.

## Ship Less JavaScript

JavaScript is the most expensive byte on the page: downloaded, parsed, compiled and executed on a slow phone's main thread, which is exactly what INP measures.

- **Render on the server or at build time,** and send HTML. Static and server rendering get content on screen without waiting for a bundle.
- **Hydrate only what's interactive.** A page of text doesn't need a client-side app.
- **Split by route,** and load heavy components (editors, charts, maps) when they're needed.
- **Question every dependency's size** before adding it. A date library for one format is rarely worth it.

## Images

- **Modern formats** (AVIF, WebP) with explicit `width` and `height` so the browser reserves space and CLS stays at zero.
- **Responsive sizes** with `srcset` and `sizes`, so phones don't download desktop images.
- **[Lazy-load](https://web.dev/articles/browser-level-image-lazy-loading) below the fold,** and never the LCP image. The LCP image gets [`fetchpriority="high"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/fetchpriority) instead ([Optimize LCP](https://web.dev/articles/optimize-lcp)).

## Fonts

- **Self-host** and subset to the characters you use.
- **`font-display: swap` or `optional`,** so text renders immediately in a fallback instead of staying invisible.
- **Preload only the one or two fonts** above the fold. Preloading everything competes with the content that matters ([font best practices](https://web.dev/articles/font-best-practices)).
- **Match fallback metrics** to the web font, so the swap doesn't shift the layout.

## Caching

Static assets get content-hashed filenames and `Cache-Control: public, max-age=31536000, immutable`, so repeat visits load them from the browser cache. HTML and API responses revalidate. See [Caching & Conditional Requests](/docs/requests/caching). Text assets are precompressed at build time at the maximum level, as in [HTTP Compression](/docs/requests/http-compression#static-and-dynamic-responses).

## Third-Party Scripts

Every tag, widget and pixel runs on your users' devices and counts against your Core Web Vitals. Each needs an owner and a reason, loads after the content, and goes when nobody can say what it's for.

## References

**Reference**

- [web.dev: Web Vitals](https://web.dev/articles/vitals), the Core Web Vitals and their thresholds
- [web.dev: Interaction to Next Paint](https://web.dev/articles/inp), how INP is measured and its thresholds
- [web.dev: Defining the Core Web Vitals metrics thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds), the good and poor thresholds for each metric
- [web.dev: INP is officially a Core Web Vital](https://web.dev/blog/inp-cwv-launch), INP replacing FID in March 2024
- [Chrome for Developers: Chrome UX Report](https://developer.chrome.com/docs/crux), field data from real Chrome users
- [web.dev: Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp), the four LCP subparts and their suggested shares, and prioritizing and never lazy-loading the LCP image
- [web.dev: Best practices for fonts](https://web.dev/articles/font-best-practices), preload and `font-display`
- [MDN: fetchpriority](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/fetchpriority), hinting the priority of a resource

**In practice**

- [web.dev: Milliseconds make millions](https://web.dev/case-studies/milliseconds-make-millions), Deloitte's study of 0.1 s speed improvements and conversions
- [Google: Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci), asserting performance budgets in CI
- [Vercel: Speed Insights](https://vercel.com/docs/speed-insights), real-user performance data at the 75th percentile
- [Next.js: Font optimization](https://nextjs.org/docs/app/getting-started/fonts), self-hosted fonts with no layout shift
