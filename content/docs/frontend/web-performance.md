+++
title = "Web Performance"
description = "Core Web Vitals targets measured from real users, performance budgets enforced in CI, and the handful of habits that keep pages fast: less JavaScript first."
category = "Frontend"
order = 13.1
tags = ["performance", "core-web-vitals", "frontend", "budgets"]
+++

Speed is a feature people notice only when it's missing, and it shows up directly in revenue. In a [Deloitte study](https://web.dev/case-studies/milliseconds-make-millions) of mobile sites, improving load speed by a tenth of a second across the journey lifted retail conversions by 8.4%.

It's also one of the few features that degrades on its own. Every dependency, image and script is added for a good reason, and each makes the page a little slower. Nobody decides to make the site slow; it just happens one reasonable change at a time. So performance is held with budgets that fail the build, not fixed in a big project every couple of years.

## Targets: Core Web Vitals

I use the [Core Web Vitals](https://web.dev/articles/vitals) as targets because they measure what users feel (does the main content show up, does the page respond, does it stop jumping around) rather than what's convenient to measure, like total bytes. Each is judged at the **75th percentile** of real page loads, separately for mobile and desktop. The 75th is a deliberate middle: the median hides the slower devices and networks where people give up, while the 99th is dominated by outliers you can't fix.

| Metric | Measures | Good |
| --- | --- | --- |
| Largest Contentful Paint (LCP) | Loading: when the main content appears | 2.5 s or less |
| Interaction to Next Paint (INP) | Responsiveness: how fast the page reacts to input | 200 ms or less |
| Cumulative Layout Shift (CLS) | Visual stability: how much content jumps around | 0.1 or less |

[INP replaced First Input Delay](https://web.dev/blog/inp-cwv-launch) as a Core Web Vital in March 2024. It measures every interaction, not just the first, which makes heavy JavaScript much harder to hide.

## Measure Real Users

- **Field data decides.** Real-user monitoring (RUM) and the [Chrome UX Report](https://developer.chrome.com/docs/crux) show what people actually experience, on their devices and networks.
- **Lab data explains.** Lighthouse and DevTools traces are for finding why a number is bad and checking a fix, not for declaring victory. A fast laptop on office Wi-Fi is not your median user.
- **Watch the 75th percentile, not the average.** An average blends a fast majority with a slow minority into a number that describes nobody, and hides the slow tail where people leave.

## Budgets in CI

A budget turns "keep it fast" into a check that fails:

- **JavaScript size** per route, compressed. The first budget to set, because it's the most common regression.
- **Lab metrics** on key pages with [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci), asserting LCP, CLS and total blocking time stay under thresholds.
- **A new dependency** has to fit the budget, or something else gets removed. See [Dependency Management](/docs/engineering/dependencies).

Budgets are set from where you are today, then tightened. A budget nobody can meet gets ignored.

## Ship Less JavaScript

JavaScript is the most expensive byte on the page: downloaded, parsed, compiled and executed, often on a slow phone's main thread, which is exactly what INP measures.

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

Static assets get content-hashed filenames and `Cache-Control: public, max-age=31536000, immutable`, so repeat visits load them from the browser cache. HTML and API responses revalidate. See [Caching & Conditional Requests](/docs/requests/caching).

## Third-Party Scripts

Every tag, widget and pixel runs on your users' devices and counts against your Core Web Vitals. Each one needs an owner and a reason, loads after the content, and is removed when nobody can say what it's for.

## This Site

[syntaqx.com](https://github.com/syntaqx/syntaqx.com) is a Next.js site on Vercel, with pages rendered on the server or at build time. Fonts are self-hosted through `next/font`, images go through `next/image`, and [Vercel Speed Insights](https://vercel.com/docs/speed-insights) collects field data from real visitors at the 75th percentile (on the free plan, a Real Experience Score plus FCP and LCP; per-metric INP and CLS need the paid tier), alongside [Vercel Web Analytics](https://vercel.com/docs/analytics) for traffic.

## References

**Reference**

- [web.dev: Web Vitals](https://web.dev/articles/vitals), the Core Web Vitals and their thresholds
- [web.dev: Interaction to Next Paint](https://web.dev/articles/inp), how INP is measured and its thresholds
- [web.dev: INP is officially a Core Web Vital](https://web.dev/blog/inp-cwv-launch), INP replacing FID in March 2024
- [Chrome for Developers: Chrome UX Report](https://developer.chrome.com/docs/crux), field data from real Chrome users
- [web.dev: Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp), prioritizing and never lazy-loading the LCP image
- [web.dev: Best practices for fonts](https://web.dev/articles/font-best-practices), preload and `font-display`
- [MDN: fetchpriority](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/fetchpriority), hinting the priority of a resource

**In practice**

- [web.dev: Milliseconds make millions](https://web.dev/case-studies/milliseconds-make-millions), Deloitte's study of 0.1 s speed improvements and conversions
- [Google: Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci), asserting performance budgets in CI
- [Vercel: Speed Insights](https://vercel.com/docs/speed-insights), real-user performance data at the 75th percentile
- [Next.js: Font optimization](https://nextjs.org/docs/app/getting-started/fonts), self-hosted fonts with no layout shift
