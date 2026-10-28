+++
title = "Tracing & Sampling"
description = "Spans, kinds, status and attributes, what deserves a span, tracing through queues, batches and webhooks with span links, and head and tail sampling."
category = "Observability"
order = 1234
tags = ["observability", "tracing", "opentelemetry", "sampling", "messaging"]
+++

A trace is the story of one request: every service it touched, every query and outbound call it made, and how long each took, as a tree of spans that share one trace ID. It turns "the API was slow" into "the API waited 2.1 seconds on the processor call, after three retries." Getting there takes three decisions this page covers: what each span records, how the context survives work that isn't a direct call (queues, batches, webhooks), and which traces you keep once there are too many to keep them all.

The vocabulary is OpenTelemetry's. Its trace API is "Stable, except where otherwise specified," and the agents, SDKs and Collector that produce and move spans are in [Instrumenting with OpenTelemetry](/docs/observability/opentelemetry) and [Running the OpenTelemetry Collector](/docs/observability/collector).

## Anatomy of a Span

A span is one timed operation. It carries:

- **A name**, low-cardinality, naming the operation rather than the instance: `GET /payments/{id}`, not `GET /payments/01932c6c`.
- **A kind**, which tells the backend how spans in different services fit together.
- **Start and end times.**
- **Attributes**, key-value pairs, named per the [semantic conventions](https://opentelemetry.io/docs/specs/semconv/) where one exists.
- **Links** to other spans that caused it but aren't its parent (below).
- **A status.**
- **The context:** trace ID, span ID, parent span ID and trace flags, which is what crosses process boundaries.

The five kinds, as the [trace API](https://opentelemetry.io/docs/specs/otel/trace/api/) defines them:

| Kind | Definition | Typical span |
| ---- | ---------- | ------------ |
| `SERVER` | "Server-side handling of a remote request while the client awaits a response" | The HTTP handler |
| `CLIENT` | "A request to a remote service where the client awaits a response" | An outbound HTTP call, a database query |
| `PRODUCER` | "The initiation or scheduling of a local or remote operation" | Publishing a message, enqueuing a job |
| `CONSUMER` | "The processing of an operation initiated by a producer" | Handling a message or job |
| `INTERNAL` | "An internal operation within an application" | A named step inside one service |

A `CLIENT` span in one service and the `SERVER` span it caused in the next are two spans, not one: the gap between them is the network, the load balancer and the queue in front of the server, and that gap is often the answer.

## Names, Attributes and Status

The HTTP conventions are stable and set the pattern for everything else. Span names "SHOULD be `{method} {target}` if there is a (low-cardinality) `target` available," and "instrumentation MUST NOT default to using URI path as a `{target}`." The `http.route` attribute "MUST be low-cardinality and include all static path segments, with dynamic path segments represented with placeholders." Names group; attributes identify.

So the IDs go in attributes. Every span that touches a business object records it (`payment.id`, `account.id`, `order.id`), along with the `request_id` from the edge ([Request IDs](/docs/observability/overview#request-ids)), so a trace can be found from the object a support agent is looking at, not only from a trace ID. Your own attribute names get a namespace (`acme.payment.id` or a team prefix) so they never collide with a future convention. High-cardinality values are welcome here; they're the reason traces exist ([Cardinality](/docs/observability/overview#cardinality-metrics-bounded-events-wide)).

Status has three values: `Unset` ("the default status"), `Ok` and `Error`. The API says instrumentation libraries "SHOULD NOT set the status code to `Ok`" and "SHOULD leave the status code as `Unset` unless there is an error"; `Ok` is for an application developer who has "validated" the outcome and wants to override a library. Errors depend on the side of the call: "for HTTP status codes in the 4xx range span status MUST be left unset in case of `SpanKind.SERVER` and SHOULD be set to `Error` in case of `SpanKind.CLIENT`." A `422` the server returned is the API working ([Error Responses](/docs/requests/error-responses)); a `422` the client received is that client's failure.

### Events and Exceptions

Span events (a timestamped annotation inside a span) and `RecordException` were how exceptions reached traces. That is changing: OpenTelemetry announced in 2026 that it "is deprecating the Span Event API," covering `Span.AddEvent` and `Span.RecordException`, and that "new code should write events as logs that are correlated with the current span." The span-based [exception conventions](https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-spans/) are now marked deprecated in favor of [exceptions in logs](https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-logs/), and instrumentations can be switched over with `OTEL_SEMCONV_EXCEPTION_SIGNAL_OPT_IN=logs`. Existing data and views keep working.

My default for new code follows the direction: set the span status to `Error` with a short description, and write the exception (`exception.type`, `exception.message`, `exception.stacktrace`) as a log record inside the span, so it carries the span's `trace_id` and `span_id` ([Logs](/docs/observability/logs#correlation-with-traces)).

## What Deserves a Span

Too few spans and the trace is a single bar that says "slow"; too many and every trace is ten thousand rows nobody reads, at a cost per span. I add a span when the operation:

- **Crosses a process or network boundary:** an inbound request, an outbound call, a query, a cache call, a publish. Instrumentation libraries cover nearly all of these without code.
- **Can be slow on its own:** a lock wait, a file render, a template, a loop over external calls.
- **Is a decision someone will ask about:** which processor was chosen, whether a fraud rule fired, which cache tier answered. An attribute on the parent is often enough; a span is for when it has its own duration.
- **Is retried:** each attempt is its own span with its attempt number, so "three retries" is visible rather than inferred ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)).

I don't add spans for pure computation in a tight loop, for each item in a large collection (one span with a count, or a sampled few), or for functions that exist only to organize code. Auto-instrumentation plus a handful of manual spans at the business decisions is the right shape for most services ([mixing the two](/docs/observability/opentelemetry#mixing-agents-and-manual-spans)).

## Async Work: Queues, Batches and Webhooks

A trace breaks the moment work leaves the request: a message on a queue, a job in a table, a webhook that comes back later. The context has to travel with the work.

**Queues.** The [messaging conventions](https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/) (status: Development) define operations for each step: `create` ("a message is created or passed to a client library for sending"), `send`, `receive`, `process` and `settle`. "A producer SHOULD attach a message creation context to each message," ideally "in such a way that it cannot be changed by intermediaries," which in practice means a `traceparent` message header or attribute. The consumer side "SHOULD link to the message's creation context," and only "exclusively for single messages scenarios, the 'Process' span MAY use the message's creation context as its parent."

**Why links, not parents.** A span has one parent. The conventions "use span links as the default mechanism to correlate producers and consumer(s)," because "it is the only option to correlate producer and consumer(s) in batch scenarios as a span can only have a single parent." The [specification overview](https://opentelemetry.io/docs/specs/otel/overview/) gives the same reason: links "can be used to represent batched operations where a Span was initiated by multiple initiating Spans, each representing a single incoming item being processed in the batch."

That gives three patterns:

| Shape | Structure |
| ----- | --------- |
| One message, processed right away | The `process` span may be a child of the creation context: one trace end to end |
| A batch of messages processed together | One `process` span with a link to each message's creation context; each producer's trace links forward to it |
| Fan-out: one request publishes many messages | Each consumer's span links back to the one creation context; each consumer is a trace of its own |

Long-lived async work gets its own trace with links, never a parent that is hours old. A trace that spans a nightly batch makes every view of it useless, and a trace whose root ended yesterday confuses most backends.

**Background jobs** follow the queue rules: the code that enqueues writes the current `traceparent` into the job's metadata, and the worker starts a `CONSUMER` span linked to it ([Background Jobs](/docs/architecture/background-jobs)). A job retried three times shows three attempts linked to one cause.

**Outbox and events.** When the [transactional outbox](/docs/architecture/events#the-transactional-outbox) writes an event, it stores the `traceparent` in a column beside the payload, and the relay publishes it as a header. The relay's own span links to it; the consumer links to the creation context.

**Webhooks.** Webhooks you send to your own services carry `traceparent` like any other call. Webhooks you send to customers are a trust boundary: the receiver can't continue your trace and doesn't need your internal IDs, so I record the delivery ID and event ID on the delivery span and leave trace headers out ([Webhooks](/docs/api-design/webhooks)). Inbound webhooks from a provider start a new trace, with the provider's event ID as an attribute so the trace can be found from their dashboard.

## Head or Tail Sampling

Tracing every request stops being affordable long before it stops being useful. OpenTelemetry suggests considering sampling once you generate "1000 or more traces per second," and most of those traces are healthy requests that look like each other. Logs and metrics stay complete; traces are the signal you sample. There are two places to decide:

| | Head sampling | Tail sampling |
| --- | ------------- | ------------- |
| Decides | "As early as possible," when the trace starts | After "considering all or most of the spans within the trace" |
| Knows | Only what's known at the start: route, service, attributes | The outcome: errors, latency, which services were touched |
| Costs | Nothing extra; unsampled spans are never exported | A stateful collector tier that holds every span until the decision |
| Can't | Guarantee every error is kept | Run cheaply at very high volume without a head sample in front |

**Head sampling** makes the decision from the trace ID, so every service agrees without talking to each other. "The default sampler is `ParentBased(root=AlwaysOn)`": a service follows the decision in the incoming `traceparent`, and only the first service decides. Set the ratio at that root with `OTEL_TRACES_SAMPLER` and `OTEL_TRACES_SAMPLER_ARG` ([configuration](/docs/observability/opentelemetry#configuring-with-environment-variables)). The SDK specification now marks `TraceIdRatioBased` as "deprecated in favor of the composable `ProbabilitySampler`" (itself still in Development) and promises not to remove or change the old sampler "until at least January 1, 2027." Head sampling's limitation is the one that matters: it can't see the outcome, so a 1% head sample keeps 1% of your errors too.

**Tail sampling** decides in the Collector once a trace is complete. The [tail sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md) (beta for traces) has policies including `status_code`, `latency`, `string_attribute`, `numeric_attribute`, `probabilistic`, `rate_limiting`, `ottl_condition`, and `and` and `composite` to combine them. It waits 30 seconds by default (`decision_wait`) and holds 50,000 traces in memory (`num_traces`), and "all spans for a given trace MUST be received by the same collector instance for effective sampling decisions." Scaling it means two layers: a first layer whose [load-balancing exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/loadbalancingexporter/README.md) routes spans by trace ID (its default routing key for traces) and a second layer that samples. The configuration is in [Running the OpenTelemetry Collector](/docs/observability/collector#tail-sampling-needs-two-layers).

```yaml
processors:
  tail_sampling:
    decision_wait: 30s
    policies:
      - name: keep-errors
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: keep-slow
        type: latency
        latency: { threshold_ms: 2000 }
      - name: keep-canary
        type: string_attribute
        string_attribute: { key: service.version, values: ["2026.10.28-canary"] }
      - name: sample-the-rest
        type: probabilistic
        probabilistic: { sampling_percentage: 10 }
```

A trace is kept if any policy says keep. My default:

- **Head-sample at the edge** at a rate the pipeline can always absorb, and **tail-sample after it** to keep every error and slow trace among what survived. OpenTelemetry's [sampling guide](https://opentelemetry.io/docs/concepts/sampling/) describes exactly this combination for high-volume systems.
- **Keep everything for what's rare:** a canary, a new release, a pilot customer, a debug flag on a single request.
- **Record the rate.** OpenTelemetry's probability sampler writes its threshold into the OpenTelemetry entry of `tracestate` (`ot=th:...`), and any span-derived count must be weighted by it, the same rule as [sampling product events](/docs/telemetry/collection#sampling). Request rates and error rates come from metrics, never from counting sampled traces.
- **Make the request ID independent of sampling.** Every request still gets a `Request-Id` and its log lines, so a support ticket can always be traced through logs even when its trace wasn't kept.

## Trace-Based Testing

Because a trace records what a request actually did across services, it can be asserted on. Tracetest describes trace-based testing as "a means of conducting deep integration or system tests": a test triggers a request, fetches its trace, and runs checks against spans matched by a selector ("a selector contains criteria to limit the scope of the spans from a trace that we wish to assert against"). Useful assertions are the ones unit tests can't make: the payment call happened exactly once, no span in the checkout path took longer than its budget, the fraud check ran before the authorization. I use it sparingly, for a few end-to-end journeys where the shape of the call graph is the contract, beside the tests in [Automated Testing](/docs/quality/automated-testing). It also proves the instrumentation works: a test that can't find its span fails before a production incident finds the gap.

## Checklist

- Span names are low-cardinality templates; IDs and the request ID are attributes.
- Instrumentation leaves status `Unset` on success; server spans don't mark `4xx` as errors, client spans do.
- New code writes exceptions as logs inside the span, not as span events.
- Every boundary crossing has a span; business decisions with their own duration have one too.
- Messages, jobs and outbox rows carry a creation context; consumers link to it, and batches link to every message.
- Customer-facing webhooks carry delivery and event IDs, not your trace headers.
- Head sampling at the root, tail sampling in a two-layer Collector, errors and slow traces always kept.
- Sampling rates are recorded, and counts come from metrics.

## References

**Specifications**

- [OpenTelemetry: Trace API](https://opentelemetry.io/docs/specs/otel/trace/api/), span kinds, status and its guidance for instrumentation libraries
- [OpenTelemetry: Specification overview](https://opentelemetry.io/docs/specs/otel/overview/), span links and batched operations
- [OpenTelemetry: Trace SDK](https://opentelemetry.io/docs/specs/otel/trace/sdk/), the `ParentBased(root=AlwaysOn)` default, `ProbabilitySampler` and the deprecation of `TraceIdRatioBased`
- [OpenTelemetry: HTTP spans](https://opentelemetry.io/docs/specs/semconv/http/http-spans/), span names, `http.route` and `4xx` status by span kind
- [OpenTelemetry: Messaging spans](https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/), operations, creation context and links for batches
- [OpenTelemetry: Exceptions on spans](https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-spans/), deprecated, and [exceptions in logs](https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-logs/), its replacement
- [W3C: Trace Context](https://www.w3.org/TR/trace-context/), the `traceparent` and `tracestate` headers

**In practice**

- [OpenTelemetry: Deprecating span events](https://opentelemetry.io/blog/2026/deprecating-span-events/), writing events as logs correlated with the current span
- [OpenTelemetry: Sampling](https://opentelemetry.io/docs/concepts/sampling/), when to sample, head and tail sampling and combining them
- [OpenTelemetry Collector: Tail sampling processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md), policies, `decision_wait` and `num_traces` defaults, and routing every span of a trace to one collector
- [OpenTelemetry Collector: Load-balancing exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/loadbalancingexporter/README.md), routing by trace ID in front of tail samplers
- [Tracetest: What is trace-based testing](https://docs.tracetest.io/concepts/what-is-trace-based-testing), selectors and checks on spans
