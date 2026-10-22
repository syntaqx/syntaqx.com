+++
title = "Retries & Timeouts"
description = "When to retry, how long to wait, and when to give up: timeouts on every call, exponential backoff with jitter, retry budgets, and what is safe to retry."
category = "Operations"
order = 5.6
tags = ["reliability", "retries", "timeouts", "operations"]
+++

Every network call can fail, hang, or succeed without telling you. A retry policy decides which of those you recover from and which you turn into an outage by retrying too hard. The defaults here follow [Stripe's](https://docs.stripe.com/error-low-level).

## Every Call Has a Timeout

No call, internal or external, waits forever.

- **Set timeouts explicitly.** Library defaults are often infinite.
- **Size them to the work.** Card authorizations can take a long time when an issuer is slow, so payment API clients wait up to **80 seconds** (the Stripe SDK default). Internal calls should be far shorter.
- **Budget from the top down.** Downstream calls share the caller's deadline. Pass the remaining time along instead of giving each hop its own fresh timeout.
- **Separate connect and read timeouts.** A connect timeout can be short (1 to 3 seconds). A read timeout depends on what the call does.

## What Is Safe to Retry

| Situation | Retry? |
| --------- | ------ |
| Connection refused, DNS failure, reset before the request was sent | Yes |
| Timeout or dropped connection after the request was sent | Only with the same [Idempotency-Key](/docs/idempotency) |
| `409 Conflict` (same key still executing) | Yes, same key, after a short wait |
| `429 Too Many Requests` | Yes, after `Retry-After` (see [Rate Limiting](/docs/rate-limiting)) |
| `502`, `503`, `504` | Yes, same key, with backoff |
| `500` | No. The outcome is unknown. Reconcile first |
| Other `4xx` | No. The request is wrong and will stay wrong |

`GET`, [`QUERY`](/docs/http-query), `PUT`, `PATCH` and `DELETE` are idempotent by definition (see [REST & HTTP Verbs](/docs/rest-http-verbs)). A `POST` is only safe to retry with an idempotency key, which is why every client should send one.

A `500` on an idempotent request is stored and replayed, so retrying it with the same key just returns the same `500`. Retrying with a new key risks doing the work twice. Fetch the object, check events, and only then decide.

## Exponential Backoff With Jitter

Retry immediately and every client hits the recovering service at the same moment. Spread retries out:

```text
delay = random(0, min(cap, base * 2^attempt))
```

Use `base = 500ms` and `cap = 5s` for synchronous API calls, matching the Stripe SDKs. This is "full jitter", from the [AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/). It spreads load better than a fixed delay or backoff without jitter.

- **Cap the attempts.** **2 retries** for synchronous calls. Background jobs can retry for longer, on a schedule like the one in [Webhooks](/docs/webhooks).
- **Honor `Retry-After`** when the server sends it. It knows better than your formula.
- **Stop after 24 hours.** That's how long idempotency keys are guaranteed to be kept. An operation still unresolved after that is reconciled, never retried.

## Retry Budgets

Retries multiply load. Three layers that each retry three times turn one failed request into 27.

- **Retry at one layer.** Usually the outermost caller that knows whether the operation is idempotent. Inner layers fail fast.
- **Cap retries as a ratio.** A client retries only while retries are under, say, 10% of its recent requests. When a dependency is truly down, retries stop adding load.
- **Circuit breakers** stop calling a dependency that's failing consistently, and probe it periodically to see if it has recovered.

## Background Work

Asynchronous jobs get more patience, and a place to land when patience runs out.

- Failed jobs retry with backoff, then move to a **dead-letter queue** with the error attached.
- Dead letters are alerted on, inspected and replayed deliberately. They're never silently dropped.
- Every job handler is idempotent, because the queue will deliver some messages twice.

## Payments Specifics

- **Never retry a decline.** A `402` decline is an answer, not a failure. Retrying declines can get a merchant flagged by the card networks.
- **Reconcile unknowns.** When a processor call times out and the outcome is unknown, record the payment as `pending`, then resolve it by querying the processor with the same idempotency key, not by charging again.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), idempotent methods and `Retry-After`

**Reference**

- [MDN: Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent), which methods are safe to repeat
- [MDN: Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After), header syntax
- [MDN: 503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503), a retryable server error

**In practice**

- [Stripe: Advanced error handling](https://docs.stripe.com/error-low-level), the timeout, backoff, 409 and 500 rules we match
- [AWS Builders' Library: Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/), retrying at one layer, retry budgets
- [AWS Architecture Blog: Exponential backoff and jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/), the full jitter formula
- [AWS Builders' Library: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/), why retries need idempotency
- [Google SRE Book: Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/), retry amplification and deadlines
