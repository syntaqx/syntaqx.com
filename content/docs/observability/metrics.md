+++
title = "Metrics"
description = "Instrument types, temporality, histograms that aggregate, RED and USE, cardinality and its bill, exemplars, recording rules, and pull versus push."
category = "Observability"
order = 1236
tags = ["observability", "metrics", "prometheus", "opentelemetry", "histograms", "cardinality"]
+++

Metrics are the cheapest signal and the one alerts fire on. A metric is a number aggregated over time: requests counted, durations bucketed, a queue's depth sampled. Aggregation is what makes them cheap (a million requests become a few numbers per interval) and what limits them: once a value is folded into a count, the individual request is gone. That trade decides everything on this page. Metrics answer "is something wrong, and how much?"; [traces](/docs/observability/tracing) and [logs](/docs/observability/logs) answer "for which request, and why?".

I instrument with the [OpenTelemetry](/docs/observability/opentelemetry) metrics API and store in Prometheus or something that speaks its query language. The concepts below come from the [OpenTelemetry metrics specification](https://opentelemetry.io/docs/specs/otel/metrics/) and the [Prometheus best-practice guides](https://prometheus.io/docs/practices/naming/), which agree on more than their different vocabularies suggest.

## Instrument Types

The OpenTelemetry metrics API (status: "Stable, except where otherwise specified") defines a small set of instruments. Picking the right one isn't pedantry: the instrument decides how values combine across time and across instances.

| Instrument | The spec says | Use it for |
| --- | --- | --- |
| Counter | "supports non-negative increments" | Requests served, bytes sent, orders placed |
| UpDownCounter | "supports increments and decrements" | Items in a queue, open connections, in-flight requests |
| Gauge | records "non-additive value(s)" | Temperature, CPU utilization, a config version |
| Histogram | reports "arbitrary values" whose distribution matters | Request duration, payload size, batch size |

Each of Counter, UpDownCounter and Gauge also has an asynchronous form, a callback the SDK calls at collection time. Use it when the value already exists somewhere (the runtime's heap size, a pool's free connections) rather than counting it again.

The question that separates them is **can you add values from two instances and get something meaningful?** Two servers' request counts add up to the fleet's requests, so that's a counter. Two servers' in-flight requests add up too, but they go down as well as up, so that's an UpDownCounter. Two servers' CPU temperatures don't add to anything, so that's a gauge. The spec's own notes say the same: "if the value is monotonically increasing, use Counter instead," and "if the value is non-additive, use Asynchronous Gauge instead."

```go tab="Go"
meter := otel.Meter("checkout")

orders, _ := meter.Int64Counter("checkout.orders",
    metric.WithUnit("{order}"))
orders.Add(ctx, 1, metric.WithAttributes(
    attribute.String("payment.method", "card")))

duration, _ := meter.Float64Histogram("checkout.duration",
    metric.WithUnit("s"))
duration.Record(ctx, elapsed.Seconds())
```

```rust tab="Rust"
let meter = global::meter("checkout");

let orders = meter.u64_counter("checkout.orders").with_unit("{order}").build();
orders.add(1, &[KeyValue::new("payment.method", "card")]);

let duration = meter.f64_histogram("checkout.duration").with_unit("s").build();
duration.record(elapsed.as_secs_f64(), &[]);
```

```python tab="Python"
from opentelemetry import metrics

meter = metrics.get_meter("checkout")

orders = meter.create_counter("checkout.orders", unit="{order}")
orders.add(1, {"payment.method": "card"})

duration = meter.create_histogram("checkout.duration", unit="s")
duration.record(elapsed_seconds)
```

```ts tab="Node.js"
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("checkout");

const orders = meter.createCounter("checkout.orders", { unit: "{order}" });
orders.add(1, { "payment.method": "card" });

const duration = meter.createHistogram("checkout.duration", { unit: "s" });
duration.record(elapsedSeconds);
```

```java tab="Java"
Meter meter = GlobalOpenTelemetry.getMeter("checkout");

LongCounter orders = meter.counterBuilder("checkout.orders")
    .setUnit("{order}").build();
orders.add(1, Attributes.of(stringKey("payment.method"), "card"));

DoubleHistogram duration = meter.histogramBuilder("checkout.duration")
    .setUnit("s").build();
duration.record(elapsedSeconds);
```

Units are part of the name's contract. Prometheus asks for base units, seconds and bytes, with the unit as a plural suffix (`http_request_duration_seconds`) and `_total` on counters; OpenTelemetry carries the unit as metadata (`s`, `By`) and the Prometheus exporter adds the suffixes. A dashboard that mixes milliseconds and seconds on one axis is a bug waiting for an incident. Where a [semantic convention](https://opentelemetry.io/docs/specs/semconv/) exists, use its name: `http.server.request.duration` is a stable histogram in seconds, and every backend that knows the convention will chart it without configuration.

## Temporality: Cumulative or Delta

A counter can be reported two ways. The [data model](https://opentelemetry.io/docs/specs/otel/metrics/data-model/) defines them by their start time: with **cumulative** temporality "successive data points repeat the starting timestamp" (the count since the process started), and with **delta** temporality "successive data points advance the starting timestamp" (the count since the last report). The spec names the archetypes: cumulative is "exemplified by Prometheus," delta "exemplified by Statsd."

| | Cumulative | Delta |
| --- | --- | --- |
| A lost report | Costs nothing; the next one includes it | Loses that interval's counts for good |
| A process restart | Shows as a reset; `rate()` handles it | Invisible |
| Memory in the SDK | Keeps every series it has ever seen | Can forget series after each export |
| Native to | Prometheus, OpenMetrics | StatsD, several commercial backends |

Pick the one your backend wants and set it once on the exporter. Prometheus's own guide states that "cumulative temporality is the default in Prometheus," and its OTLP receiver can convert delta to cumulative behind an experimental flag (`otlp-deltatocumulative`); the Prometheus docs warn that `rate()` and `increase()` "are designed for cumulative metrics." Converting in the [Collector](/docs/observability/collector) works too, as long as every delta stream for a series lands on the same converter.

## Histograms, Summaries and Percentiles

Latency is a distribution, and the mean hides it. The [SRE Book](https://sre.google/sre-book/monitoring-distributed-systems/) recommends collecting "request counts bucketed by latencies (suitable for rendering a histogram), rather than actual latencies," and that's the histogram's job.

There are two ways to get a percentile out of a service, and only one of them survives a fleet:

- **A summary** computes quantiles inside each process (p50, p99) and exports them. Accurate for that one process, and useless beyond it: Prometheus's comparison lists summary aggregation as "Not aggregatable," and its example shows that "averaging the quantiles yields statistically nonsensical values." The p99 of ten servers is not the average of their ten p99s.
- **A histogram** exports counts per bucket. Buckets from every instance add up, and the percentile is estimated at query time over whatever set of instances, routes or regions you choose. The cost is precision: for a classic histogram the "Error is limited by the width of the bucket the quantile is located in."

So my rule: **histograms everywhere, summaries never**, unless a single process's exact quantile is genuinely the only question.

### Explicit Buckets or Exponential

A classic histogram has fixed boundaries chosen up front. Choose them badly and the interesting latencies all fall in one wide bucket. The OpenTelemetry SDK's default boundaries are `[0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1000, 2500, 5000, 7500, 10000]`, shaped for milliseconds, which is wrong for a duration recorded in seconds; the HTTP semantic conventions advise `[0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10]` for `http.server.request.duration`. Changing boundaries later breaks aggregation across the change.

An **exponential histogram** removes the choice. OpenTelemetry's version places boundaries at powers of a base set by a `scale` parameter, "suitable for conveying high dynamic range data with small relative error," and the SDK adjusts the scale to fit the data within a maximum of 160 buckets by default. Prometheus's **native histograms** are the same idea in its data model ("The Prom _schema_ is equal to the _scale_ in OTel"), with sparse buckets so empty ones cost nearly nothing. They became a stable feature in Prometheus v3.8.0, need `scrape_native_histograms` enabled and protobuf scraping negotiated, and Prometheus's own advice is now "If you can, use native histograms and prefer them over both classic histograms and summaries."

My default for new services is exponential histograms end to end, falling back to explicit buckets with semantic-convention boundaries where a backend can't store them.

## What to Measure: Golden Signals, RED and USE

Three checklists overlap, and each fits a different kind of thing:

| Method | For | Signals |
| --- | --- | --- |
| [Four golden signals](https://sre.google/sre-book/monitoring-distributed-systems/) (Google SRE) | A user-facing service | Latency, traffic, errors, saturation |
| [RED](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/) (Tom Wilkie) | Every service, including internal ones | Rate, errors, duration |
| [USE](https://www.brendangregg.com/usemethod.html) (Brendan Gregg) | Every resource: CPU, disk, pool, queue | Utilization, saturation, errors |

RED is the golden signals without saturation, and USE is where saturation lives. Gregg's summary is "For every resource, check utilization, saturation, and errors," with saturation defined as "the degree to which the resource has extra work which it can't service, often queued." Wilkie describes the two as "two different views on the same system": RED for what callers experience, USE for why the machine is struggling.

In practice: every service exports RED for its inbound requests and for each dependency it calls (split by dependency, so "the API is slow" points at the database or the processor), and every bounded resource (a connection pool, a worker pool, a queue, a disk) exports USE. Two refinements from the SRE Book matter: track the latency of failed requests separately from successful ones, because a fast `500` drags the average down while users suffer, and count errors that aren't `5xx` (a `200` with the wrong content, a response slower than the promise). Prometheus's [instrumentation guide](https://prometheus.io/docs/practices/instrumentation/) adds that online-serving systems "should be monitored on both the client and server side."

## Business Metrics Are First-Class

Request metrics say the service is up. Business metrics say it's working. Orders per minute, sign-ups completed, payment authorization rate by processor, messages delivered within the promise, jobs stuck in `pending`: each of these shows trouble that never produces an error, like a broken checkout button that sends no request at all, or a processor declining everything with a perfectly healthy `200`.

- **Emit them from the service, as metrics,** next to the technical ones, with the same instruments and the same label discipline. A daily warehouse report is analytics; a counter on the hot path is monitoring ([Product Analytics](/docs/telemetry/product-analytics) covers the other side).
- **Alert on the rate, compared to its own past.** Orders per minute has a daily shape; "30% below the same hour last week" catches a silent failure that no error rate will.
- **Put them on the service's dashboard,** below the golden signals ([Dashboards & Alerts](/docs/observability/dashboards-and-alerts)).

## Cardinality

Every distinct combination of label values is a separate time series. Prometheus's naming guide puts it plainly: "every unique combination of key-value label pairs represents a new time series," which "can dramatically increase the amount of data stored." Labels multiply: a metric with `route` (50 values), `status` (10) and `region` (5) is up to 2,500 series per instance, before anyone adds `customer_id`.

The guidance is concrete:

- Prometheus's [instrumentation guide](https://prometheus.io/docs/practices/instrumentation/#do-not-overuse-labels): "try to keep the cardinality of your metrics below 10," "The vast majority of your metrics should have no labels," and for anything "over 100 or the potential to grow that large, investigate alternate solutions." Its worked example, a per-user label across 10,000 users on 10,000 nodes, reaches "a double digit number of millions" of series.
- Vendors bill on the same unit. Datadog defines a custom metric as "a unique combination of a metric's name and tag values (including the host tag)," so each new label value is a new line on the invoice. Pricing models across vendors are in [Observability Platforms](/books/hosting-and-cloud/observability-platforms).
- The OpenTelemetry SDK caps it for you: each metric stream defaults to a cardinality limit of 2000, after which new combinations fold into one series with the attribute `otel.metric.overflow=true`. Seeing that attribute in a dashboard means a label is out of control.

My rules: labels are **bounded enums**. Route templates (`/orders/{id}`), never raw paths; status classes or codes, never error messages; processor names, never payment IDs; customer _tier_, never customer ID. Per-entity detail belongs on spans and log lines, which are priced per event rather than per combination, and which an [exemplar](#exemplars) can link to.

## Exemplars

An exemplar is a sample request pinned to a metric point. The [data model](https://opentelemetry.io/docs/specs/otel/metrics/data-model/#exemplars) defines it as "a recorded value that associates OpenTelemetry context to a metric event," which in practice means a trace ID attached to a histogram bucket. On a latency chart, the dot in the p99 band links straight to a trace that landed there.

```text
http_request_duration_seconds_bucket{route="/orders/{id}",le="0.5"} 1142 # {trace_id="4bf92f3577b34da6a3ce929d0e0e4736"} 0.47
```

- **OpenTelemetry SDKs record them by default** for measurements made inside a sampled span: the default exemplar filter "SHOULD be `TraceBased`."
- **OpenMetrics carries them** in the text format, limited to 128 UTF-8 characters of labels, which is room for a trace ID and little else.
- **Prometheus stores them** only with `--enable-feature=exemplar-storage`, in "a fixed size circular buffer," so they're for recent incidents, not history.

Exemplars are the cheapest bridge between the cheap signal and the detailed one, and the reason high-cardinality IDs never need to be labels. They only work if the trace was kept, so tail sampling that keeps slow and failed traces ([Tracing](/docs/observability/tracing)) and exemplars on latency histograms belong together.

## Recording Rules and Pre-Aggregation

A dashboard that computes the fleet's p99 from raw buckets across every pod, every time it refreshes, is slow and expensive. Recording rules "precompute frequently needed or computationally expensive expressions and save their result as a new set of time series."

```yaml tab="Prometheus"
groups:
  - name: checkout
    rules:
      - record: job:http_requests:rate5m
        expr: sum by (job, status_class) (rate(http_requests_total[5m]))
      - record: job:http_request_duration_seconds:p99_5m
        expr: >
          histogram_quantile(0.99,
            sum by (job, le) (rate(http_request_duration_seconds_bucket[5m])))
```

- **Record what dashboards and alerts read:** the RED signals per service, SLO ratios, burn rates. [SLO burn-rate alerts](/docs/operations/slos#alerting-on-burn-rate) over a 3-day window are impractical without them.
- **Aggregate away the labels you never query.** Dropping `pod` and `instance` from a recorded series turns thousands of series into dozens, and lets the raw ones age out on a shorter retention.
- **Pre-aggregate before storage when the label is the cost.** The [Collector](/docs/observability/collector) can drop or merge attributes before export, which is cheaper than paying to store a dimension and then summing it away.

## Pull or Push

Prometheus pulls: it scrapes an HTTP endpoint on each target on a schedule. OpenTelemetry's native protocol, OTLP, pushes: the SDK exports to a Collector or backend. Both work, and Prometheus now accepts both, serving OTLP on `/api/v1/otlp/v1/metrics` with `--web.enable-otlp-receiver`.

| | Pull (scrape) | Push (OTLP) |
| --- | --- | --- |
| Liveness | A failed scrape is itself a signal (`up == 0`) | Silence is ambiguous: dead, or just idle? |
| Short-lived work | Batch jobs and functions end before the scrape | Exports before exit |
| Networking | Scraper must reach every target | Targets reach one endpoint, through NAT and firewalls |
| Discovery | Scraper needs service discovery | Each process needs the endpoint's address |

My default is OTLP push from the SDK to a local [Collector](/docs/observability/collector), which handles temporality, attributes and batching and exports to whatever the backend speaks. I keep scraping for the things that already expose a Prometheus endpoint (databases, proxies, Kubernetes components) and let the Collector's Prometheus receiver scrape them, so there's one pipeline. With push, alert on the absence of data per service (`absent()`, or the backend's equivalent) to recover what `up` gave for free.

## Checklist

- Instruments match the data: counters for things that only go up, UpDownCounters for levels, gauges for non-additive values, histograms for distributions.
- Units are base units, declared once, and names follow semantic conventions where one exists.
- Temporality is set on the exporter to what the backend expects.
- Latency is a histogram, exponential where supported; no summaries averaged across instances.
- Every service exports RED for inbound requests and per dependency; every bounded resource exports USE.
- Business metrics sit beside technical ones and alert against their own history.
- Labels are bounded enums; IDs go on spans, logs and exemplars.
- Dashboards and SLO alerts read recording rules, not raw series.

## References

**Specifications**

- [OpenTelemetry: Metrics API](https://opentelemetry.io/docs/specs/otel/metrics/api/), instrument kinds and when to use each
- [OpenTelemetry: Metrics data model](https://opentelemetry.io/docs/specs/otel/metrics/data-model/), temporality, exponential histograms and exemplars
- [OpenTelemetry: Metrics SDK](https://opentelemetry.io/docs/specs/otel/metrics/sdk/), default bucket boundaries, exponential histogram size, the 2000-series cardinality limit and the `TraceBased` exemplar filter
- [OpenTelemetry: HTTP metrics semantic conventions](https://opentelemetry.io/docs/specs/semconv/http/http-metrics/), `http.server.request.duration` and its advised buckets
- [OpenMetrics specification](https://prometheus.io/docs/specs/om/open_metrics_spec/), exemplars and their 128-character limit
- [Prometheus: Native histograms](https://prometheus.io/docs/specs/native_histograms/), schemas, the mapping to OpenTelemetry scale, and stability from v3.8.0

**In practice**

- [Prometheus: Metric and label naming](https://prometheus.io/docs/practices/naming/), base units, suffixes and labels as series
- [Prometheus: Instrumentation](https://prometheus.io/docs/practices/instrumentation/), what to measure in online-serving systems and the cardinality guideline
- [Prometheus: Histograms and summaries](https://prometheus.io/docs/practices/histograms/), why summary quantiles can't be aggregated
- [Prometheus: Recording rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/), precomputing expensive expressions
- [Prometheus: Using Prometheus as an OpenTelemetry backend](https://prometheus.io/docs/guides/opentelemetry/), the OTLP receiver and delta temporality
- [Prometheus: Feature flags](https://prometheus.io/docs/prometheus/latest/feature_flags/), exemplar storage and delta-to-cumulative conversion
- [Google SRE Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/), the four golden signals and worrying about the tail
- [Grafana: The RED method](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/), rate, errors and duration for services
- [Brendan Gregg: The USE method](https://www.brendangregg.com/usemethod.html), utilization, saturation and errors for resources
- [Datadog: Custom metrics](https://docs.datadoghq.com/metrics/custom_metrics/), a billable metric as a unique name and tag combination
