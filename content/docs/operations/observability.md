+++
title = "Observability"
description = "Request IDs on every response, structured logs, trace context across services, and the few metrics that matter, so any failure can be traced end to end."
category = "Operations"
order = 1202
tags = ["observability", "logging", "tracing", "operations"]
aliases = ["observability"]
+++

When something goes wrong, the first question is "what happened to this request?", and every system should answer it in minutes, starting from nothing more than an ID a customer pasted into a support ticket. Monitoring tells you *that* something is wrong; observability is working out *why* without shipping new code to find out. It comes from three kinds of telemetry:

| Signal | Answers | Cost |
| --- | --- | --- |
| **Metrics** | Is something wrong, and how much? | Cheap: numbers aggregated over time, kept for months |
| **Logs** | What exactly happened in this one event? | Moderate: every event is stored and searched |
| **Traces** | Where did this request spend its time, across every service? | Higher: usually sampled |

Alerts fire on metrics, investigations start from a trace or a request ID, and logs fill in the detail. Each is weak alone; the IDs that tie them together make them useful.

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

## Trace Context

A trace follows a request through every service it touches, so "the API was slow" becomes "the API waited 2.1 seconds on the processor call". Calls between services propagate [W3C Trace Context](https://www.w3.org/TR/trace-context/) (`traceparent` and `tracestate`), instrumented with [OpenTelemetry](https://opentelemetry.io/), because every library, proxy and vendor on the path already knows how to pass the standard on.

- One trace per incoming request, one span per meaningful unit of work: a database query, an outbound call, a queue publish.
- Queue messages and [webhooks](/docs/api-design/webhooks) carry the trace context too, so asynchronous work links back to the request that caused it.
- Spans record the resource IDs they touched (payment ID, account ID), so you can search by business object, not just by trace.

## Sampling Traces: Head or Tail

Tracing every request stops being affordable long before it stops being useful. OpenTelemetry suggests considering sampling once you generate "1000 or more traces per second," and most of those traces are healthy requests that look like each other. Logs and metrics stay complete; traces are the signal you sample. There are two places to decide:

| | Head sampling | Tail sampling |
| --- | ------------- | ------------- |
| Decides | "As early as possible," when the trace starts | After seeing "all or most of the spans within the trace" |
| Knows | Only what's known at the start: route, service, attributes | The outcome: errors, latency, which services were touched |
| Costs | Nothing extra; unsampled spans are never exported | A stateful collector tier that holds every span until the decision |
| Can't | Guarantee every error is kept | Run cheaply at very high volume without a head sample in front |

**Head sampling** makes the decision from the trace ID, so every service agrees without talking to each other. The SDK's default sampler is `ParentBased` with `AlwaysOn` as its root: a service follows the decision in the incoming `traceparent`, and only the first service decides. Set the ratio at that root. Its limitation is the one that matters: "it is not possible to make a sampling decision based on data in the entire trace," so a 1% head sample keeps 1% of your errors too.

**Tail sampling** decides in the OpenTelemetry Collector once a trace is complete, with policies such as always keeping traces with an error status, keeping traces over a latency threshold, keeping everything from a newly deployed version, and a probabilistic sample of the rest. The Collector's tail sampling processor waits 30 seconds by default (`decision_wait`) and holds 50,000 traces in memory (`num_traces`), and "all spans for a given trace MUST be received by the same collector instance," so scaling it means a first collector layer that routes spans by trace ID with the load-balancing exporter and a second layer that samples.

My default:

- **Head-sample at the edge** at a rate the pipeline can always absorb, and **tail-sample after it** to keep every error and slow trace among what survived. OpenTelemetry describes exactly this combination for high-volume systems.
- **Keep everything for what's rare:** a canary, a new release, a pilot customer, a debug flag on a single request.
- **Record the rate.** OpenTelemetry's probability sampler writes the sampling threshold into the `tracestate`, and any span-derived count must be weighted by it, the same rule as [sampling product events](/docs/telemetry/collection#sampling). Request rates and error rates come from metrics, never from counting sampled traces.
- **Make the request ID independent of sampling.** Every request still gets a `Request-Id` and its log lines, so a support ticket can always be traced through logs even when its trace wasn't kept.

## Structured Logs

Logs are JSON, one event per line, with a consistent set of fields:

```json
{
  "time": "2026-10-22T14:23:45.123Z",
  "level": "error",
  "message": "processor call failed",
  "request_id": "019a0b6e-4c2d-7f31-9b8e-2d5a6c7e8f90",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "service": "payments",
  "payment_id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "processor": "acme",
  "duration_ms": 10003
}
```

- **Structured, not printed.** Fields can be filtered and aggregated (`processor = acme AND duration_ms > 5000`); a sentence needs a regex that breaks the day someone rewords it.
- **Constant messages, data in fields.** `"processor call failed"` with `processor` as a field, not `"acme call failed after 10003ms"`, so events can be grouped and counted.
- **Levels mean something.** `error` is something a human should look at; an expected card decline is `info`. When everything logs at `error`, the real errors drown.
- **Redact by default.** See [Sensitive Data](/docs/payments/sensitive-data).
- Times are UTC per [Time & Date Formats](/docs/fundamentals/time).

## Metrics

Start with the [four golden signals](https://sre.google/sre-book/monitoring-distributed-systems/) for every service and every dependency:

| Signal | Example |
| ------ | ------- |
| Latency | p50, p95, p99 of request duration, split by success and failure |
| Traffic | Requests per second by route |
| Errors | Rate of `5xx`, and of failed outbound calls by dependency |
| Saturation | Queue depth, connection pool usage, worker utilization |

For payments, add the business signals that show trouble before an error rate does: authorization rate by processor and card brand, the number of payments stuck in `pending`, and reconciliation breaks per day.

Keep label cardinality bounded: route templates (`/payments/{id}`), never raw paths; processor names, never payment IDs. Every distinct label value is a separate time series, so one high-cardinality label can multiply a metrics bill by millions. Per-request detail belongs in logs and traces.

## Alerts

Alert on symptoms, not causes: customers seeing errors or slow responses, measured against an [SLO](/docs/operations/slos) burn rate. A CPU spike nobody notices isn't a page. Every alert has an owner and a [runbook](/docs/operations/on-call), and every page is actionable; paging people for things they can't fix trains them to ignore the one page that matters.

## This API

The syntaqx API generates a UUID v7 `Request-Id` for every response, including errors and rate-limited requests, and sends the same value as `X-Request-ID` for clients that already read the older name. Errors are reported to Sentry. It's a single service, so there's no trace propagation to do yet.

## References

**Specifications**

- [W3C: Trace Context](https://www.w3.org/TR/trace-context/), the `traceparent` and `tracestate` headers
- [OpenTelemetry: Traces](https://opentelemetry.io/docs/concepts/signals/traces/), spans and context propagation
- [OpenTelemetry: Semantic conventions](https://opentelemetry.io/docs/specs/semconv/), standard attribute names
- [OpenTelemetry: Trace SDK](https://opentelemetry.io/docs/specs/otel/trace/sdk/), built-in samplers, the `ParentBased` default and the probability sampler's threshold in `tracestate`
- [RFC 6648: Deprecating the "X-" Prefix](https://datatracker.ietf.org/doc/html/rfc6648), `Request-Id` without `X-`

**In practice**

- [Stripe: Request IDs](https://docs.stripe.com/api/request_ids), the `Request-Id` header
- [OpenTelemetry: Sampling](https://opentelemetry.io/docs/concepts/sampling/), when to sample, head and tail sampling and combining them
- [OpenTelemetry Collector: Tail sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md), policies, `decision_wait` and `num_traces` defaults, and routing every span of a trace to one collector
- [Google SRE Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/), the four golden signals and symptom-based alerting
- [OWASP: Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), what not to log
