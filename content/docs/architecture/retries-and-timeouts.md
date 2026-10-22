+++
title = "Retries & Timeouts"
description = "When to retry, how long to wait, and when to give up: timeouts on every call, exponential backoff with jitter, retry budgets, and what is safe to retry."
category = "Architecture"
order = 404
tags = ["reliability", "retries", "timeouts", "operations"]
aliases = ["retries-and-timeouts", "operations/retries-and-timeouts"]
+++

Every network call can fail, hang, or succeed without telling you. A retry policy decides which of those you recover from, and which you turn into an outage by retrying too hard. Done well, retries quietly absorb the blips every distributed system has. Done badly, they're how a ten-second database hiccup becomes an hour-long incident: every client retries at once, the recovering service drowns, and the retries become the load that keeps it down.

## Every Call Has a Timeout

No call, internal or external, waits forever. A call without a timeout doesn't fail when its dependency hangs; it holds a thread, a connection and a user's request until something else gives out, and under load that's your connection pool.

- **Set timeouts explicitly.** Library defaults are often infinite, or minutes long, chosen for nobody's workload.
- **Size them to the work, not to hope.** A timeout should sit just above how long the call legitimately takes at its slowest (its p99.9), not at the median. Too short and you fail work that would have succeeded; too long and a hung dependency holds everything. Card authorizations are the classic long case: an issuer can take tens of seconds, which is why Stripe's SDK waits up to 80 seconds by default. Internal calls should be far shorter.
- **Budget from the top down.** If the API promises a response in 10 seconds, the calls it makes share those 10 seconds. Pass the remaining deadline along (gRPC deadlines, or a header your services agree on) instead of giving each hop a fresh timeout; otherwise three hops with 10-second timeouts each can make the user wait 30 and still fail.
- **Separate connect and read timeouts.** Connecting should take milliseconds, so a 1 to 3 second connect timeout catches a dead host fast. The read timeout depends on what the call does.

## What Is Safe to Retry

The question isn't "did it fail?", it's "if I send this again, can it happen twice?"

| Situation | Retry? |
| --------- | ------ |
| Connection refused, DNS failure, reset before the request was sent | Yes. Nothing reached the server |
| Timeout or dropped connection after the request was sent | Idempotent requests: yes. Writes: only with the same [Idempotency-Key](/docs/payments/idempotency) |
| `409 Conflict` (same idempotency key still executing) | Yes, same key, after a short wait |
| `429 Too Many Requests` | Yes, after `Retry-After` (see [Rate Limiting](/docs/requests/rate-limiting)) |
| `502`, `503`, `504` | Yes, with backoff (and the same key for writes) |
| `500` on an idempotent read | Yes, with backoff |
| `500` on a keyed write | No. The outcome is unknown. Reconcile first |
| Other `4xx` | No. The request is wrong and will stay wrong |

`GET`, [`QUERY`](/docs/requests/http-query), `PUT` and `DELETE` are idempotent by definition, and `PATCH` is when it's written that way (see [REST & HTTP Verbs](/docs/fundamentals/rest-http-verbs)): sending them twice leaves the same state as sending them once. A `POST` isn't, so it's only safe to retry with an idempotency key, which is why every client should send one.

The `500` on a write deserves care. An idempotent server stores the result of a keyed request, including a `500`, and replays it, so retrying with the same key just returns the same `500`. Retrying with a *new* key is worse: if the first attempt actually succeeded before failing, you've now done the work twice. Fetch the object, check events, and only then decide.

## Exponential Backoff With Jitter

Retrying immediately is the worst option. The failure is usually load or a brief outage, and an immediate retry adds load at exactly the wrong moment. Backing off gives the dependency room to recover; jitter stops every client from coming back at the same instant.

```text
delay = random(0, min(cap, base * 2^attempt))
```

This is "full jitter": pick a random delay between zero and the exponential ceiling. Exponential backoff alone still synchronizes clients that failed together (they all wait 1s, then 2s, then 4s, in lockstep); randomizing across the whole range spreads them out. [AWS's analysis](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) found it finishes the work with less total load than fixed delays or backoff without jitter.

For synchronous, user-facing calls, start around `base = 500ms` and `cap = 5s`. A user is waiting, so the retries have to fit inside the request's own deadline.

- **Cap the attempts.** For synchronous calls, one or two retries. If each attempt fails independently with probability `p`, two retries take the failure rate from `p` to `p³`: a 1% transient error rate becomes one in a million. Past that, more attempts add latency and load without buying meaningful reliability, and the failure probably isn't independent anymore.
- **Background jobs can be patient,** retrying over minutes or hours on a schedule like the one in [Webhooks](/docs/payments/webhooks), because nobody is waiting on the response.
- **Honor `Retry-After`** when the server sends it. The server knows when it will recover; your formula is a guess.
- **Stop retrying writes after 24 hours.** That's how long idempotency keys are guaranteed to be kept. After that, a retry with the old key can run as a brand-new operation, so an operation still unresolved is reconciled, never retried.

## Retry Budgets

Retries multiply. A request that passes through three layers, each retrying three times, can turn one failure into 27 attempts at the bottom of the stack, at the moment that layer is least able to handle them.

- **Retry at one layer.** Usually the outermost caller that knows whether the operation is idempotent. Inner layers fail fast and report the error up.
- **Cap retries as a ratio.** A client retries only while retries are under, say, 10% of its recent requests, often implemented as a token bucket that refills with successful calls. Ordinary blips are absorbed; when a dependency is truly down, the client stops piling on.
- **Circuit breakers** stop calling a dependency that's failing consistently and fail fast instead, then let an occasional request through to see if it has recovered. Failing fast is a feature: a quick error lets the caller degrade gracefully instead of hanging.

## Background Work

Asynchronous jobs get more patience, and a place to land when patience runs out.

- Failed jobs retry with backoff, then move to a **dead-letter queue** with the error attached, so one poison message doesn't block the queue forever.
- Dead letters are alerted on, inspected and replayed deliberately. A dead-letter queue nobody watches is just a slower way to lose data.
- Every job handler is idempotent, because every queue delivers some messages twice. See [Events & Async Messaging](/docs/architecture/events).

## Payments Specifics

- **Don't retry a decline as if it were an outage.** A `402` decline is an answer, not a failure: the issuer said no. Some declines can never succeed (a lost, stolen or closed card), and retrying them looks like card testing. Others (insufficient funds) may clear later, so a retry belongs on a schedule of days, not seconds. Card networks enforce this: [Visa's excessive reattempts rule](https://www.payway.com/visa-excessive-reattempts-rule-fees) charges merchants for any retry of a never-approve decline, and for more than 15 retries of a card in 30 days.
- **Reconcile unknowns.** When a processor call times out and the outcome is unknown, record the payment as `pending`, then resolve it by querying the processor with the same idempotency key, not by charging again.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), idempotent methods and `Retry-After`

**Reference**

- [MDN: Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent), which methods are safe to repeat
- [MDN: Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After), header syntax
- [MDN: 503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503), a retryable server error

**In practice**

- [AWS Builders' Library: Timeouts, retries, and backoff with jitter](https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter), choosing timeouts from latency percentiles, retrying at one layer, token-bucket retry limits
- [AWS Architecture Blog: Exponential backoff and jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/), the full jitter formula and its comparison
- [AWS Builders' Library: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/), why retries need idempotency
- [Google SRE Book: Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/), retry amplification and deadline propagation
- [Stripe: Advanced error handling](https://docs.stripe.com/error-low-level), timeouts, `409`, `500` and reconciliation for a payments API
- [stripe-node](https://github.com/stripe/stripe-node), the 80-second default request timeout
- [Payway: Visa excessive reattempts rule](https://www.payway.com/visa-excessive-reattempts-rule-fees), which declines may never be retried, and the 15-in-30-days limit
