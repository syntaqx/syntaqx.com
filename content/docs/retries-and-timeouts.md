+++
title = "Retries & Timeouts"
description = "When to retry, how long to wait, and when to give up: timeouts on every call, exponential backoff with jitter, retry budgets, and what is safe to retry."
category = "Operations"
order = 5.6
tags = ["reliability", "retries", "timeouts", "operations"]
+++

Every network call can fail, hang, or succeed without telling you. A retry policy decides which of those you recover from and which you turn into an outage by retrying too hard.

## Every Call Has a Timeout

No call, internal or external, waits forever.

- **Set timeouts explicitly.** Library defaults are often infinite or minutes long.
- **Budget from the top down.** If the API promises a response in 10 seconds, the downstream calls inside it share that 10 seconds. Pass the remaining deadline along (for example as a gRPC deadline or a header) instead of giving each hop its own fresh timeout.
- **Separate connect and read timeouts.** A connect timeout can be short (1 to 3 seconds). A read timeout depends on what the call does.

## What Is Safe to Retry

| Situation | Retry? |
| --------- | ------ |
| Connection refused, DNS failure, reset before the request was sent | Yes |
| `429 Too Many Requests` | Yes, after `Retry-After` (see [Rate Limiting](/docs/rate-limiting)) |
| `502`, `503`, `504` | Yes, with backoff |
| `500` | Only if the request is idempotent |
| Timeout after the request was sent | Only if the request is idempotent |
| `4xx` other than `408`, `409`, `429` | No, the request is wrong and will stay wrong |

"Idempotent" means a `GET`, `PUT` or `DELETE`, or a `POST` with an [Idempotency-Key](/docs/idempotency). A timed-out `POST /payments` without a key is the one case where you genuinely don't know what happened, which is why money-moving endpoints require one.

## Exponential Backoff With Jitter

Retry immediately and every client hits the recovering service at the same moment. Spread retries out:

```text
delay = random(0, min(cap, base * 2^attempt))
```

With `base = 100ms` and `cap = 20s`, attempts wait up to 100ms, 200ms, 400ms, 800ms and so on, each picked at random in that range. This is "full jitter", from the [AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/). It spreads load better than a fixed delay or backoff without jitter.

- **Cap the attempts.** 3 to 5 for synchronous calls. Background jobs can retry for longer, on a schedule like the one in [Webhooks](/docs/webhooks).
- **Honor `Retry-After`** when the server sends it. It knows better than your formula.

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

- **Never retry a decline.** A `card_declined` is an answer, not a failure. Retrying declines can get a merchant flagged by the card networks.
- **Reconcile unknowns.** When a processor call times out and the outcome is unknown, record the payment as `pending`, then resolve it by querying the processor with the same idempotency key, not by charging again.
