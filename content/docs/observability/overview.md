+++
title = "Observability"
nav_title = "Overview"
description = "Request IDs on every response, the three signals and the IDs that join them, bounded metrics beside wide events, and a map of the Observability section."
category = "Observability"
order = 1231
tags = ["observability", "logging", "tracing", "metrics", "operations"]
aliases = ["observability", "operations/observability"]
+++

When something goes wrong, the first question is "what happened to this request?", and every system should answer it in minutes, starting from nothing more than an ID a customer pasted into a support ticket. Monitoring tells you *that* something is wrong; observability is working out *why* without shipping new code to find out. It comes from three kinds of telemetry:

| Signal | Answers | Cost |
| --- | --- | --- |
| **Metrics** | Is something wrong, and how much? | Cheap: numbers aggregated over time, kept for months |
| **Logs** | What exactly happened in this one event? | Moderate: every event is stored and searched |
| **Traces** | Where did this request spend its time, across every service? | Higher: usually sampled |

Alerts fire on metrics, investigations start from a trace or a request ID, and logs fill in the detail. Each is weak alone; the IDs that tie them together make them useful.

## The Section

This page is the frame: request IDs, how the signals connect, and the one rule about cardinality that decides what goes where. The rest of the section goes a level down:

| Page | Covers |
| ---- | ------ |
| [Instrumenting with OpenTelemetry](/docs/observability/opentelemetry) | API and SDK, zero-code agents and the Kubernetes Operator, resources, semantic conventions, OTLP, propagation, signal status |
| [Running the OpenTelemetry Collector](/docs/observability/collector) | Deployment patterns, a working configuration, distributions, scaling, securing and managing a fleet |
| [Tracing & Sampling](/docs/observability/tracing) | Spans and what deserves one, async work and span links, head and tail sampling |
| [Logs](/docs/observability/logs) | Structured logging, levels, correlation, what never to log, sampling and retention |
| [Metrics](/docs/observability/metrics) | Instruments, the golden signals, cardinality budgets |
| [Errors & Profiling](/docs/observability/errors-and-profiling) | Error grouping and tracking, continuous profiling |
| [Frontend & Synthetic Monitoring](/docs/observability/frontend-and-synthetic) | Real-user monitoring and checks that run when no user is there |
| [Dashboards & Alerts](/docs/observability/dashboards-and-alerts) | What goes on a dashboard and what is allowed to page |

What counts as reliable enough, and the burn-rate alerts that follow from it, are in [SLOs & Error Budgets](/docs/operations/slos); what happens after a page is [On-Call](/docs/operations/on-call) and [Incidents & Postmortems](/docs/operations/incident-response). The vendor market, and how each platform meters what you send it, is the Hosting & Cloud book's [Observability Platforms](/books/hosting-and-cloud/observability-platforms). Product events (what a person did, rather than what the system did) are [Telemetry & Analytics](/docs/telemetry/event-design).

## Request IDs

Every response carries a `Request-Id` header:

```http
HTTP/1.1 422 Unprocessable Entity
Request-Id: 019a0b6e-4c2d-7f31-9b8e-2d5a6c7e8f90
```

- Generated at the edge as a [UUID v7](/docs/fundamentals/identifier-conventions), which sorts by time, so IDs from a support thread are already in order.
- Named without an `X-` prefix, which the IETF [deprecated](https://datatracker.ietf.org/doc/html/rfc6648) for new headers; it's also the name Stripe uses.
- Returned on **every** response, successes and [errors](/docs/requests/error-responses) alike, and written on every log line and span for that request.
- Clients should log it with their own errors. A ticket with the ID goes straight to the right log lines; "it failed around 3pm" starts a search.
- **Independent of sampling.** Traces are sampled ([Tracing & Sampling](/docs/observability/tracing#head-or-tail-sampling)); the request ID and its log lines are not, so a support ticket can always be followed through logs even when its trace wasn't kept.

The request ID is not the trace ID. The trace ID belongs to the tracing system, is generated or continued by whichever service starts the trace, and can arrive from a caller; the request ID is yours, issued once at your edge, and safe to show a customer. Every log line and span carries both.

## How the Signals Connect

Three kinds of data are only useful as one system if you can move between them without guessing. These are the joins:

| From | To | Through |
| ---- | -- | ------- |
| A support ticket | Logs and the trace | The `Request-Id`, written on every log line and recorded as a span attribute |
| A trace | Its log lines | `trace_id` and `span_id` on every log record, which the OpenTelemetry [logs data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/) has fields for |
| A log line | Its trace | The same `trace_id`, opened in the tracing view |
| A latency spike on a chart | An example slow request | An **exemplar**: OpenTelemetry defines one as "a recorded value that associates OpenTelemetry context to a metric event," carrying the `trace_id` and `span_id` of a request that contributed to the point |
| Any signal | The service, version and environment that produced it | The same [resource attributes](/docs/observability/opentelemetry#resources-say-who-sent-it) on all three (`service.name`, `service.version`, `deployment.environment.name`) |

The practical test is a drill: start from a request ID, find the trace, open the slowest span's logs, then find the metric that should have caught it. If any step needs a timestamp and a guess, a join is missing. Instrumenting with one SDK ([Instrumenting with OpenTelemetry](/docs/observability/opentelemetry)) is the easiest way to keep the joins: the same context feeds the span, the log record and the exemplar.

## Cardinality: Metrics Bounded, Events Wide

Cardinality is the number of distinct values a field can take. The rule that decides where detail lives is about metrics, not about telemetry in general.

**Metrics stay bounded.** Prometheus puts it plainly: "every unique combination of key-value label pairs represents a new time series," so "do not use labels to store dimensions with high cardinality (many different label values), such as user IDs, email addresses, or other unbounded sets of values." Route templates (`/payments/{id}`), never raw paths; processor names, never payment IDs. One unbounded label can multiply a metrics bill by the number of values it takes.

**Events are wide.** A log record or a span is stored once whatever its fields contain, so high-cardinality detail is cheap there and valuable: the payment ID, the account, the processor, the feature flag variant, the build. Honeycomb's docs describe the cost asymmetry directly: in a metrics tool, "adding a high cardinality value, like `user-id`, causes attribute costs to explode," while an event store keeps each event and aggregates at query time. My default is one wide, structured event per unit of work (the server span plus its log lines), carrying every ID someone might search by, and a small set of bounded metrics for alerting and trends.

The two meet through the joins above: the metric says the authorization rate dropped for one processor, the exemplar or a query on the wide events says which requests, and the trace says where they spent their time.

## Traces in Brief

A trace follows a request through every service it touches, so "the API was slow" becomes "the API waited 2.1 seconds on the processor call". Calls between services propagate [W3C Trace Context](https://www.w3.org/TR/trace-context/) (`traceparent` and `tracestate`), instrumented with [OpenTelemetry](https://opentelemetry.io/), because every library, proxy and vendor on the path already knows how to pass the standard on. Queue messages and [webhooks](/docs/api-design/webhooks) carry the context too, so asynchronous work links back to the request that caused it, and traces are the one signal I sample. Spans, async work, span links and sampling are in [Tracing & Sampling](/docs/observability/tracing); propagation and its risks are in [Instrumenting with OpenTelemetry](/docs/observability/opentelemetry#context-propagation).

## Logs in Brief

Logs are JSON, one event per line, with constant messages and the data in fields, levels that mean something, the `request_id` and `trace_id` on every line, and sensitive data redacted at the logger ([Sensitive Data](/docs/payments/sensitive-data)). The format, levels, correlation, what never to log, sampling and retention are in [Logs](/docs/observability/logs).

## Metrics in Brief

Start with the [four golden signals](https://sre.google/sre-book/monitoring-distributed-systems/) (latency, traffic, errors and saturation) for every service and every dependency, with latency split by success and failure. Add the business signals that show trouble before an error rate does: for payments, authorization rate by processor and card brand, payments stuck in `pending`, and reconciliation breaks per day. Instruments, naming and cardinality budgets are in [Metrics](/docs/observability/metrics).

## Alerts in Brief

Alert on symptoms, not causes: customers seeing errors or slow responses, measured against an [SLO](/docs/operations/slos) burn rate. A CPU spike nobody notices isn't a page. Every alert has an owner and a [runbook](/docs/operations/on-call), and every page is actionable; paging people for things they can't fix trains them to ignore the one page that matters. Dashboards and alert design are in [Dashboards & Alerts](/docs/observability/dashboards-and-alerts).

## References

**Specifications**

- [W3C: Trace Context](https://www.w3.org/TR/trace-context/), the `traceparent` and `tracestate` headers
- [OpenTelemetry: Logs data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/), `TraceId` and `SpanId` on every log record
- [OpenTelemetry: Metrics data model](https://opentelemetry.io/docs/specs/otel/metrics/data-model/), exemplars linking a metric point to a trace
- [OpenTelemetry: Semantic conventions](https://opentelemetry.io/docs/specs/semconv/), standard attribute names
- [RFC 6648: Deprecating the "X-" Prefix](https://datatracker.ietf.org/doc/html/rfc6648), `Request-Id` without `X-`

**In practice**

- [Stripe: Request IDs](https://docs.stripe.com/api/request_ids), the `Request-Id` header
- [Prometheus: Metric and label naming](https://prometheus.io/docs/practices/naming/), every label combination as a new time series, and no unbounded label values
- [Honeycomb: High cardinality](https://docs.honeycomb.io/get-started/observability/concepts/high-cardinality), why high-cardinality attributes are costly in metrics tools and cheap as events
- [Google SRE Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/), the four golden signals and symptom-based alerting
