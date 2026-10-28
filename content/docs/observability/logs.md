+++
title = "Logs"
description = "Structured JSON logs, levels with meaning, trace correlation, the OpenTelemetry logs model and bridges, what never to log, sampling noise, and retention."
category = "Observability"
order = 1235
tags = ["observability", "logging", "opentelemetry", "security", "operations"]
+++

A log record is the most detailed thing a running system says about itself: one event, with every field you thought to attach. That detail is why logs are where investigations end, and also why they cost the most to store, leak the most when they're careless, and drown the signal when everything writes to them. This page covers the format, what levels mean, how logs join traces, OpenTelemetry's logs model, what never goes in a log, how to cut noise, and how long to keep any of it.

## Structured Logs

Logs are JSON, one event per line, with a consistent set of fields:

```json
{
  "time": "2026-10-22T14:23:45.123Z",
  "level": "error",
  "message": "processor call failed",
  "request_id": "019a0b6e-4c2d-7f31-9b8e-2d5a6c7e8f90",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "service": "payments",
  "payment_id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "processor": "acme",
  "duration_ms": 10003
}
```

- **Structured, not printed.** Fields can be filtered and aggregated (`processor = acme AND duration_ms > 5000`); a sentence needs a regex that breaks the day someone rewords it.
- **Constant messages, data in fields.** `"processor call failed"` with `processor` as a field, not `"acme call failed after 10003ms"`, so events can be grouped and counted.
- **IDs on every line.** The `request_id` from the edge ([Request IDs](/docs/observability/overview#request-ids)), the `trace_id` and `span_id` of the current span, and the business IDs the event concerns. High-cardinality fields are what logs are for ([Cardinality](/docs/observability/overview#cardinality-metrics-bounded-events-wide)).
- **Context once, not repeated by hand.** The logger carries request-scoped fields (request, trace, tenant) from context, so a call site writes only what's new.
- **Times are UTC** per [Time & Date Formats](/docs/fundamentals/time), with milliseconds or better.
- **Written to stdout** in containers, and collected by the platform or the [Collector](/docs/observability/collector#an-agent-configuration). The application doesn't manage files or rotation.

Structure is also a security property. OWASP notes that "unstructured text log formats are susceptible to log entry injection through Carriage Return (CR) or Line Feed (LF) characters" and recommends "structured log formats, such as JSON": a user-supplied value with a newline in it can forge a whole log line in plain text, and can't in an escaped JSON field.

## Levels That Mean Something

A level is a promise about who needs to read the line. The OpenTelemetry [logs data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/) defines severity numbers in six ranges, so levels from every language and library map onto one scale:

| Range | Level | Data model's meaning | My rule |
| ----- | ----- | -------------------- | ------- |
| 1-4 | `TRACE` | "A fine-grained debugging event. Typically disabled in default configurations." | Off in production |
| 5-8 | `DEBUG` | "A debugging event." | Off by default; on per request or per service, temporarily |
| 9-12 | `INFO` | "An informational event. Indicates that an event happened." | Things that happened as designed, including expected failures |
| 13-16 | `WARN` | "Not an error but is likely more important than an informational event." | Degraded but handled: a retry that succeeded, a fallback used |
| 17-20 | `ERROR` | "Something went wrong." | A human should look at it |
| 21-24 | `FATAL` | "A fatal error such as application or system crash." | The process is going down |

The level is about the system, not the user's outcome. A declined card, a failed login and a `422` are `INFO`: the system did exactly what it should. A processor timeout after retries is `ERROR`. When everything logs at `ERROR`, the real errors drown, and an error-rate alert on logs becomes noise ([Dashboards & Alerts](/docs/observability/dashboards-and-alerts)). Within each range the extra numbers (`ERROR2`, `ERROR3`) exist for libraries with finer levels; I don't use them in application code.

## Correlation with Traces

The data model gives every log record `TraceId`, `SpanId` and `TraceFlags` fields. Filled in, they turn "find the logs for this trace" into a lookup rather than a time-window search, and they let a tracing view show each span's log lines inline.

They're filled in from the active context at the moment the line is written. With an OpenTelemetry log bridge or agent, that happens automatically; with a plain JSON logger, a small hook that reads the current span and adds `trace_id` and `span_id` does the same. Two consequences:

- **Log inside the span.** A line written after the span ends, or on a thread that didn't inherit the context, has no trace ID. Async code is where this breaks; propagate the context into workers ([Async Work](/docs/observability/tracing#async-work-queues-batches-and-webhooks)).
- **Unsampled traces still have IDs.** The trace ID exists whether or not the trace was kept, so logs from unsampled requests still group by trace even though the trace view has nothing to show. The `request_id` is the join that always works.

Exceptions are now logs too: OpenTelemetry is moving exception reporting from span events to log records inside the span ([Events and Exceptions](/docs/observability/tracing#events-and-exceptions)), so the stack trace lives in one place, correlated, and at the level it deserves.

## The OpenTelemetry Logs Model and Bridges

For traces and metrics, OpenTelemetry defined new APIs. "For logs we did not take the same path": its [logs specification](https://opentelemetry.io/docs/specs/otel/logs/) says "we embrace existing logging solutions and make sure OpenTelemetry works nicely with existing logging libraries." The pieces:

- **The data model** (Stable): `Timestamp` ("time when the event occurred"), `ObservedTimestamp` ("time when the event was observed"), the trace fields, `SeverityText` and `SeverityNumber`, `Body`, `Resource`, `InstrumentationScope`, `Attributes` and `EventName`. Any log, from any source, maps onto it.
- **The Logs API and bridges.** The API is "primarily designed for library authors to build log appenders," which "bridge logs from existing logging libraries to the OpenTelemetry data model." The [concepts page](https://opentelemetry.io/docs/concepts/signals/logs/) puts it more bluntly: "the Logs Bridge API should not be called by you directly." Application code keeps using Log4j, Logback, `logging`, Serilog, zap or `slog`, and an appender or handler sends records to the SDK, which adds the resource and trace context and exports OTLP.
- **Events.** "A log record with a non-empty event name is an Event," and "not all logs are events, but all events are logs." OpenTelemetry uses events for structured occurrences with a defined shape (exceptions, browser events, GenAI messages); operational events with a name and attributes follow the same model. Product analytics events are a different thing with a different pipeline ([Event Design & Instrumentation](/docs/telemetry/event-design)).

Two ways to get logs into the pipeline, and when I use each:

| Path | How | When |
| ---- | --- | ---- |
| **Bridge to OTLP** | The logging library's OpenTelemetry appender sends records to the SDK | The language's logs SDK is stable and you want resource and trace fields filled in for you |
| **stdout to the Collector** | The application writes JSON to stdout; the Collector's `filelog` receiver parses it | Any language, including where the logs SDK isn't stable yet; also catches output that bypasses the logger |

Language maturity decides it as much as preference: in October 2026 the logs SDK is stable in C++, .NET, Java, PHP and Rust, a release candidate in Go, and in development in JavaScript, Python and Ruby ([Signal Status](/docs/observability/opentelemetry#signal-status-in-october-2026)). Pick one path per service; sending the same lines both ways doubles the bill and the search results.

## What Not to Log

A log line is copied to more places, kept by more systems and read by more people than the database row it describes. The [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) lists what "should usually not be recorded directly in the logs," including:

- "Session identification values" and "access tokens"
- "Authentication passwords"
- "Database connection strings" and "encryption keys and other primary secrets"
- "Bank account or payment card holder data"
- "Sensitive personal data and some forms of personally identifiable information (PII)"
- "Data of a higher security classification than the logging system is allowed to store"
- "Information a user has opted out of collection, or not consented to"

The cheat sheet's remedy is to remove, mask, sanitize, hash or encrypt. My rules for making that hold:

- **Redact at the logger,** not downstream. A serializer that knows which fields are sensitive (by type or annotation) masks them before the line exists; the Collector's [redaction](/docs/observability/collector#redacting-and-filtering) is a backstop, not the plan.
- **No request or response bodies** for endpoints that accept sensitive data. Log the request ID, the route and the outcome; the request ID finds everything else ([Sensitive Data](/docs/payments/sensitive-data)).
- **Opaque IDs, not personal data.** A user ID in a log is searchable and joinable; an email address is personal data in every log store, backup and vendor it reaches ([GDPR & Privacy](/docs/compliance/gdpr)).
- **URLs are data.** Query strings carry tokens and personal data; log the route template and the parameters you've vetted.
- **Sanitize what users control.** Escape or strip control characters from user-supplied values, even in JSON, before they reach a human reading a terminal.
- **Test it.** A test that logs a request containing a known card number and a known token, and fails if either appears in the output, catches the regression a code review misses.

## Sampling and Rate-Limiting Noisy Logs

Most log volume comes from a few lines in a hot path. Before sampling anything, fix the source: demote the line, aggregate it into a metric, or delete it. What's left can be sampled, with rules:

- **Rate-limit repeats, don't drop at random.** Zap's sampler is the model: it logs "the first N entries with a given level and message each tick," then "every Mth message," and drops the rest; its production defaults are 100 and 100 per second. The first occurrences of a new error always get through, and a flood is capped. Its stated purpose is to cap "the global CPU and I/O load that logging puts on your process while attempting to preserve a representative subset of your logs."
- **Count what you drop.** A sampler that drops silently hides the size of the problem. The dropped count is a metric.
- **Never sample errors at the source** below a sane rate limit, and never sample anything that's an [audit](#debug-logs-are-not-audit-logs) or security event.
- **Keep debug off, and switchable.** Debug logging for one request (a header honored only from inside the network), one tenant or one service for an hour, through [feature flags](/docs/delivery/feature-flags) or dynamic configuration, beats leaving it on everywhere.
- **Drop known noise centrally.** Health checks and probe logs go in the Collector's `filter` processor, once, rather than in every service.

## Retention Tiers and Cost

Logs are billed on ingestion and on retention, and the two are separate decisions. The providers show the shape:

- **Google Cloud Logging** keeps the `_Default` bucket for 30 days and the `_Required` bucket (audit logs) for 400 days, "not configurable," with custom retention from 1 to 3,650 days and charges for retention beyond the default ([quotas and limits](https://docs.cloud.google.com/logging/quotas)).
- **AWS CloudWatch Logs** offers an [Infrequent Access log class](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatch_Logs_Log_Classes.html) with "a lower ingestion price per GB" and a subset of features (no live tail, metric filters or subscription filters); the classes "differ in ingestion costs only," and "after a log group is created, its log class can't be changed."

My tiers:

| Tier | Holds | Retention |
| ---- | ----- | --------- |
| Hot, searchable | Everything at `INFO` and above | 14 to 30 days: long enough to investigate any incident and its postmortem |
| Cheap or archived | Selected streams (security, access logs) | Months, per policy, queried rarely |
| Audit store | Audit events, separately | As long as the obligation requires ([Audit Trails](/docs/architecture/audit-trails)) |

Retention is also a privacy obligation: personal data in logs lives exactly as long as the logs do, so the retention period is part of the privacy notice, not just the bill ([Data Retention & Deletion](/docs/architecture/data-retention)). The vendor side of log pricing is in the Hosting & Cloud book's [Observability Platforms](/books/hosting-and-cloud/observability-platforms).

## Debug Logs Are Not Audit Logs

Diagnostic logs and audit trails look alike (timestamped records of what happened) and are opposites in every property that matters. Diagnostic logs are sampled, rate-limited, rotated, redacted and free to change format between releases; an audit trail must be complete, append-only, retained for a set period and stable enough to show an auditor years later. Writing audit events to the application log fails on every count: the sampler drops one, the retention policy deletes them, and a log pipeline outage loses them silently.

Audit events are written transactionally with the change they describe, to their own store ([Audit Trails](/docs/architecture/audit-trails)). They can carry the same `request_id` and `trace_id`, so an investigator can move from the audit record to the diagnostic logs; they never depend on them.

## Checklist

- JSON to stdout, one event per line, constant messages, data in fields.
- `request_id`, `trace_id` and `span_id` on every line, from context.
- Levels follow the severity ranges; expected failures are `INFO`.
- One path per service: an OpenTelemetry bridge where the logs SDK is stable, or stdout to the Collector.
- Sensitive fields are masked at the logger; no bodies, tokens, secrets or card data; a test proves it.
- Repeats are rate-limited, drops are counted, errors and audit events are never sampled.
- Hot retention measured in weeks, archives by policy, and retention documented as a privacy period.
- Audit events go to the audit trail, never only to the log.

## References

**Specifications**

- [OpenTelemetry: Logs data model](https://opentelemetry.io/docs/specs/otel/logs/data-model/), fields, severity number ranges and events
- [OpenTelemetry: Logs specification](https://opentelemetry.io/docs/specs/otel/logs/), working with existing logging libraries through appenders
- [OpenTelemetry: Exceptions in logs](https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-logs/), exceptions as log records

**In practice**

- [OpenTelemetry: Logs](https://opentelemetry.io/docs/concepts/signals/logs/), the Logs Bridge API and events as log records
- [OWASP: Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), what not to log and log injection
- [zap: Sampler](https://pkg.go.dev/go.uber.org/zap/zapcore#NewSamplerWithOptions), first N then every Mth per tick
- [zap: Config](https://github.com/uber-go/zap/blob/master/config.go), sampling's purpose and the production defaults
- [Google Cloud Logging: Quotas and limits](https://docs.cloud.google.com/logging/quotas), `_Default` and `_Required` bucket retention
- [Google Cloud Logging: Buckets](https://docs.cloud.google.com/logging/docs/buckets), retention costs beyond the default
- [AWS: CloudWatch Logs log classes](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatch_Logs_Log_Classes.html), Standard and Infrequent Access
