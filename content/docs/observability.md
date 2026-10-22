+++
title = "Observability"
description = "Request IDs on every response, structured logs, trace context across services, and the few metrics that matter, so any failure can be traced end to end."
category = "Operations"
order = 5.7
tags = ["observability", "logging", "tracing", "operations"]
+++

When something goes wrong, the first question is "what happened to this request?". Every system should be able to answer that in minutes, starting from nothing more than an ID a customer pasted into a support ticket.

## Request IDs

Every response carries a `Request-Id` header:

```http
HTTP/1.1 422 Unprocessable Entity
Request-Id: 019a0b6e-4c2d-7f31-9b8e-2d5a6c7e8f90
```

- Generated at the edge as a [UUID v7](/docs/identifier-conventions), unique per request. The name matches Stripe's `Request-Id`, without the deprecated `X-` prefix.
- Returned on **every** response, successes and [errors](/docs/error-responses) alike.
- Written on every log line and span produced while handling the request.
- Clients should log it alongside their own errors. It's the fastest way to get help.

## Trace Context

Calls between services propagate [W3C Trace Context](https://www.w3.org/TR/trace-context/) (`traceparent` and `tracestate`), using [OpenTelemetry](https://opentelemetry.io/).

- One trace per incoming request, one span per meaningful unit of work: a database query, an outbound call, a queue publish.
- Queue messages and [webhooks](/docs/webhooks) carry the trace context too, so asynchronous work links back to the request that caused it.
- Spans record the resource IDs they touched (payment ID, account ID), so you can search by business object, not just by trace.

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

- **Messages are constant, data goes in fields.** `"processor call failed"` with `processor` as a field, not `"acme call failed after 10003ms"`. Constant messages can be grouped and counted.
- **Levels mean something.** `error` is something a human should look at. Expected outcomes, like a card decline, are `info`.
- **Redact by default.** See [Sensitive Data](/docs/sensitive-data).
- Times are UTC per [Time & Date Formats](/docs/time).

## Metrics

Start with the four golden signals for every service and every dependency:

| Signal | Example |
| ------ | ------- |
| Latency | p50, p95, p99 of request duration, split by success and failure |
| Traffic | Requests per second by route |
| Errors | Rate of `5xx`, and of failed outbound calls by dependency |
| Saturation | Queue depth, connection pool usage, worker utilization |

For payments, add the business signals that show trouble before an error rate does: authorization rate by processor and card brand, the number of payments stuck in `pending`, and reconciliation breaks per day.

Keep label cardinality bounded. Route templates (`/payments/{id}`), never raw paths; processor names, never payment IDs.

## Alerts

- **Alert on symptoms, not causes.** Customers seeing errors or slow responses, measured against an SLO. A CPU spike that nobody notices isn't a page.
- **Every alert has a runbook link** and an owner.
- **Every page is actionable.** An alert that's routinely acknowledged and ignored gets fixed or deleted.
