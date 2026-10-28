+++
title = "Frontend & Synthetic Monitoring"
nav_title = "Frontend & Synthetic"
description = "Core Web Vitals from real users, traces that start in the browser, synthetic checks from several regions, and health checks that tell Kubernetes the truth."
category = "Observability"
order = 1238
tags = ["observability", "rum", "web-vitals", "synthetic-monitoring", "health-checks", "kubernetes"]
+++

Server-side telemetry sees a request once it arrives. It doesn't see the page that took nine seconds to paint on a mid-range phone, the button that did nothing because a script failed to load, or the region where DNS stopped resolving and no request arrived at all. Three kinds of monitoring cover that gap, and each sees something the others can't:

| | Real-user monitoring | Synthetic monitoring | Health checks |
| --- | --- | --- | --- |
| Who generates it | Your actual users | Scripts you run on a schedule | The orchestrator or load balancer |
| Sees | What people experience, on their devices and networks | Whether a known journey works right now, from outside | Whether one instance should get traffic or be restarted |
| Blind to | Pages nobody visited; users who couldn't load anything | Everything outside the scripted path | Everything beyond the one process |
| Answers | "How fast is it for real people?" | "Is it up, from where customers are?" | "Is this pod OK?" |

## Real-User Monitoring

Real-user monitoring (RUM) measures each page view in the visitor's browser and sends the numbers home. The targets themselves, the Core Web Vitals and their thresholds, belong to [Web Performance](/docs/frontend/web-performance#targets-core-web-vitals); getting events off a device that's about to close the tab belongs to [Collecting Events](/docs/telemetry/collection#web-and-mobile-constraints). This section is how the two meet in monitoring.

### Field Data, Not Lab Data

web.dev draws the line: "Lab data is determined by loading a web page in a controlled environment," while "Field data is determined by monitoring all users who visit a page." Lab tools such as Lighthouse deliberately limit the variables, which makes them good for explaining a regression and checking a fix in CI, and bad at saying what users feel. Interaction to Next Paint can't be measured at all without a real person interacting.

The assessment is field data at the 75th percentile: web.dev considers a page passing "if it meets the recommended targets at the 75th percentile," segmented across mobile and desktop. The good thresholds are LCP within 2.5 seconds, INP of 200 milliseconds or less and CLS of 0.1 or less ([Web Vitals](https://web.dev/articles/vitals)). Monitoring should report exactly that statistic, split the same way, so the dashboard and Google's assessment agree.

### Measuring with web-vitals

The browser exposes the raw entries through `PerformanceObserver` (with `buffered: true` to receive entries recorded before the observer was created), but the exact definitions of LCP, INP and CLS have edge cases (background tabs, back/forward cache restores, iframes) that are easy to get wrong. Use Google's [`web-vitals`](https://github.com/GoogleChrome/web-vitals) library instead of reimplementing them: each metric "is exposed as a single function that takes a `callback` function."

```js
import { onCLS, onINP, onLCP } from "web-vitals/attribution";

const queue = new Set();
const enqueue = (metric) => queue.add(metric);

onCLS(enqueue);
onINP(enqueue);
onLCP(enqueue);

function flush() {
  if (queue.size === 0) return;
  const body = JSON.stringify([...queue].map((m) => ({
    name: m.name,
    value: m.value,
    rating: m.rating,
    id: m.id,
    navigationType: m.navigationType,
    route: location.pathname.replace(/\/\d+(?=\/|$)/g, "/{id}"),
    release: window.__RELEASE__,
  })));
  navigator.sendBeacon("/rum", body);
  queue.clear();
}

addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flush();
});
```

- **Flush when the page is hidden, with `sendBeacon`.** The library's README recommends reporting "whenever the page is backgrounded or unloaded" and says `visibilitychange` "is recommended over events like `beforeunload` and `unload`."
- **Expect gaps, and don't treat them as zero.** Per the README, "INP is not reported if the user never interacts with the page," and "CLS, FCP, and LCP are not reported if the page was loaded in the background."
- **Use the attribution build in production.** It adds "additional diagnostic information with each metric": which element was the LCP, which interaction was slow and which script handled it. A bad p75 without attribution is a number nobody can act on.
- **Leave `reportAllChanges` off** for monitoring; the README says it's "not needed (or recommended)" in general.
- **Tag every beacon with a route template and the release,** with the same cardinality rules as [Metrics](/docs/observability/metrics#cardinality), so a regression is traceable to a page type and a deploy.

### Sampling and Volume

Vitals are one small beacon per page view, and most sites can keep all of them. A high-traffic site can sample by session, deterministically, recording the rate, by the rules in [Collecting Events](/docs/telemetry/collection#sampling). Percentiles survive uniform sampling well; small segments (a new browser version, a single country) don't, so keep those at full rate. The beacon endpoint is a [Collector](/docs/observability/collector) or a thin first-party endpoint in front of one, not a third-party host that ad blockers drop.

### Mobile

Native apps have no Web Vitals. The equivalents are app start time (cold and warm), frozen frames and slow rendering, hangs and "application not responding" events, crash-free sessions, and network request latency measured on the device. Crash reporting and symbolication are in [Errors & Profiling](/docs/observability/errors-and-profiling#readable-stack-traces-source-maps-and-symbols). OpenTelemetry's status table, as of October 2026, lists Swift traces as Stable with metrics and logs in Development, and Kotlin as Development for all three, so most mobile RUM still comes from vendor SDKs or the platforms' own consoles.

## Traces That Start on the Client

A server trace begins when the request reaches the edge. Starting it in the browser or app adds DNS, connection setup, queueing on the device and rendering, which is often where the time went. The client creates a span and sends [W3C Trace Context](https://www.w3.org/TR/trace-context/) on the request, and the backend continues the same trace ([Tracing](/docs/observability/tracing)).

```js
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";

new FetchInstrumentation({
  // Same-origin requests get traceparent by default; list the cross-origin APIs too.
  propagateTraceHeaderCorsUrls: [/^https:\/\/api\.example\.com\//],
});
```

- **CORS has to allow it.** `traceparent` isn't one of the CORS-safelisted request headers (`Accept`, `Accept-Language`, `Content-Language`, `Content-Type`, `Range`), so a cross-origin request carrying it is preflighted, and the API must answer the preflight with `Access-Control-Allow-Headers: traceparent, tracestate`. Without that, adding tracing breaks the request outright, which is why the instrumentation only adds the header to origins you list.
- **Only to your own APIs.** Never send trace headers to third parties; it leaks your trace IDs and can break their CORS.
- **The backend decides whether to trust the incoming sampling flag.** A client can claim `sampled` on every request. Head sampling at the edge ([Tracing](/docs/observability/tracing)) should be free to override it.
- **It's experimental.** OpenTelemetry's own docs say "Client instrumentation for the browser is **experimental** and mostly **unspecified**." I use it for request tracing into the backend, and keep Web Vitals on `web-vitals`.

## Synthetic Monitoring

A synthetic check is a script that acts like a user on a schedule: an HTTP request, an API call sequence, or a real browser walking through a journey. It works when nobody's using the product (3am, a new region, a feature behind a flag) and tests from outside your network, through DNS, CDN and TLS, the way customers arrive.

### What to Check

- **Uptime checks** on every public entry point: the site, the API, the login page, the webhook receiver. HTTP status, a string in the body, and TLS certificate expiry.
- **Multi-step journeys** for the paths that make money: sign in, search, add to cart, check out against a test account. A browser check catches the failed script load that every uptime check would pass.
- **API flows** that chain calls: create, read back, delete. The cleanup step matters; synthetic data that piles up becomes someone's analytics problem, so mark it as test data and exclude it ([Event Design & Instrumentation](/docs/telemetry/event-design)).
- **Dependencies you don't own,** when your users depend on them working: the payment page, the identity provider.

### From Several Places, Alerting on Agreement

One probe failing once is usually the probe's network. Every vendor's guidance converges on the same two defenses: several locations and a confirmation before alerting.

| Tool | Locations | Confirmation |
| --- | --- | --- |
| Grafana Synthetic Monitoring | "multiple locations, preferably three or more" | Default alerts fire when the success rate stays below a threshold (95%, 90% or 75%) "for five minutes" |
| Datadog Synthetics | Any set of managed or private locations | "triggered if any assertion fails for X minutes from any n of N locations," with optional retries |
| Checkly | "always select at least 2 locations" | Fixed, linear or exponential retries, in the same or a different location, before alerting |
| Amazon CloudWatch Synthetics | "up to 50 replica locations" | Alarms "that activate only when issues are detected from multiple locations" |

My default: three or more regions near real users, a run every minute for critical journeys, and an alert when **at least two locations fail on consecutive runs**. That ignores a flaky probe and still pages within a few minutes of a real outage. Checks are code, in the repository with the service, deployed with it ([Dashboards & Alerts](/docs/observability/dashboards-and-alerts#dashboards-as-code)).

A synthetic failure is a strong symptom ("customers can't check out") and can page. It isn't an SLO measurement: a few probes a minute are too small a sample to stand in for user traffic. Use it as an [SLO](/docs/operations/slos) signal only for low-traffic services where real requests are too sparse to measure.

## Health Checks

Health endpoints answer a narrower question: should this one instance get traffic, or be restarted? Kubernetes defines three probes, and their difference is in what failure does. The full treatment, with the classic mistakes, is in [Kubernetes Operations](/docs/operations/kubernetes#probes-and-the-classic-mistakes); the essentials from the [Kubernetes docs](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/):

- **Liveness** "determine[s] when to restart a container." It should only check the process itself. The docs warn that "Incorrect implementation of liveness probes can lead to cascading failures."
- **Readiness** "determine[s] when a container is ready to accept traffic," and runs "during its whole lifecycle," not only at start.
- **Startup**: when one is configured, "Kubernetes does not execute liveness or readiness probes until the startup probe succeeds." Size it as `failureThreshold * periodSeconds` covering the worst-case boot.

Defaults in the API are a 10-second period, a 1-second timeout and 3 failures before acting, so a liveness failure takes about 30 seconds to restart a container.

```yaml tab="Kubernetes"
startupProbe:
  httpGet: { path: /livez, port: 8080 }
  periodSeconds: 5
  failureThreshold: 24     # up to 2 minutes to boot
livenessProbe:
  httpGet: { path: /livez, port: 8080 }   # process only
readinessProbe:
  httpGet: { path: /readyz, port: 8080 }  # can this instance serve now?
  periodSeconds: 5
```

### What Readiness Should Check

A readiness check is a promise that requests sent to this instance will succeed. It should check:

- **Startup work is done:** configuration loaded, migrations checked, caches warmed, connection pools opened.
- **The instance isn't shutting down.** Fail readiness on `SIGTERM`, before draining, so the endpoint leaves the load balancer while in-flight requests finish ([Kubernetes Operations](/docs/operations/kubernetes#graceful-shutdown)).
- **The instance isn't overloaded,** if it can tell (a full worker pool), so traffic shifts to its peers.

It shouldn't check:

- **Shared dependencies every instance uses.** If the database is down, every pod fails readiness together, the Service has no endpoints, and callers get connection errors instead of a clean `503` with a [retry hint](/docs/architecture/retries-and-timeouts). Worse, the service can no longer serve the requests that didn't need the database. A dependency check belongs in readiness only when it's specific to this instance (its own sidecar, its own local cache).
- **Anything slow or expensive.** The probe runs every few seconds on every pod; a health check that runs a query is load you added to the thing you're checking.
- **Downstream health checks.** Calling other services' health endpoints chains failures across the whole graph.

Report dependency health on a separate diagnostic endpoint (`/healthz/deps`, internal only) for humans and dashboards, and keep the probes cheap and local.

## Status Pages

Synthetic checks tell you something's down; a status page tells customers. What it should say, who updates it, and why it can't be hosted on the infrastructure it reports on are covered in [Outages, Post-Mortems & Status Pages](/books/hosting-and-cloud/outages-and-status-pages#status-pages), and when to post during an incident in [Incidents & Postmortems](/docs/operations/incident-response#communicate-on-a-clock).

## Checklist

- RUM reports LCP, INP and CLS at p75 from the field, split by mobile and desktop, with attribution.
- Beacons flush on `visibilitychange` with `sendBeacon` and carry a route template and release.
- Browser and app requests to your own APIs carry `traceparent`, and the APIs allow it in CORS.
- Every public entry point has an uptime check; every revenue journey has a scripted browser check.
- Synthetic checks run from three or more regions and alert when several locations fail consecutively.
- Liveness checks only the process, readiness checks only what this instance needs, and startup covers the boot.
- Readiness fails on shutdown before draining.

## References

**Specifications**

- [W3C: Trace Context](https://www.w3.org/TR/trace-context/), the `traceparent` header
- [MDN: CORS-safelisted request header](https://developer.mozilla.org/en-US/docs/Glossary/CORS-safelisted_request_header) and [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), preflights and `Access-Control-Allow-Headers`
- [MDN: PerformanceObserver.observe()](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/observe), the `buffered` option
- [Kubernetes: Liveness, readiness and startup probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/), what each probe does and the cascading-failure warning
- [Kubernetes: Configure probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/), sizing a startup probe

**In practice**

- [web.dev: Web Vitals](https://web.dev/articles/vitals), thresholds and the 75th percentile
- [web.dev: Why lab and field data can be different](https://web.dev/articles/lab-and-field-data-differences), lab versus field
- [GoogleChrome/web-vitals](https://github.com/GoogleChrome/web-vitals), the library, its attribution build and reporting guidance
- [OpenTelemetry: Browser](https://opentelemetry.io/docs/languages/js/getting-started/browser/), browser instrumentation and its experimental status
- [OpenTelemetry: Language status](https://opentelemetry.io/docs/languages/), Swift and Kotlin signal maturity
- [Grafana: Synthetic Monitoring alerts](https://grafana.com/docs/grafana-cloud/observe-and-act/testing/synthetic-monitoring/configure-alerts/configure-legacy-alerts/), default thresholds and multiple locations
- [Datadog: HTTP tests](https://docs.datadoghq.com/synthetics/api_tests/http_tests/), alerting on n of N locations and retries
- [Checkly: Retries](https://www.checklyhq.com/docs/alerting-and-retries/retries/) and [locations](https://www.checklyhq.com/docs/concepts/locations/), retry strategies and the two-location minimum
- [Amazon CloudWatch Synthetics: Canaries](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html) and [multi-location canaries](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries_MultiLocation.html), schedules, replica locations and multi-location alarms
