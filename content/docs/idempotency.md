+++
title = "Idempotency"
description = "Safe retries for any write with the Idempotency-Key header: how keys are stored and replayed, and what happens on conflicting or concurrent requests."
category = "Payments"
order = 7.1
tags = ["api", "payments", "idempotency", "headers"]
+++

Networks fail after the server has done the work. A client that times out on `POST /payments` has no way to know whether it charged the card. Idempotency keys make the retry safe: the same key always produces the same result, and the side effect happens at most once. The behavior matches [Stripe's](https://docs.stripe.com/api/idempotent_requests).

## The Header

Every `POST` accepts an `Idempotency-Key` header, following the [IETF Idempotency-Key draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/).

```http
POST /payments
Idempotency-Key: f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json

{ "amount": 1999, "currency": "USD", "source": "tok_visa" }
```

- The client generates the key. A [UUID v4](/docs/identifier-conventions) is ideal. Up to **255 characters**.
- One key per **logical operation**, not per HTTP attempt. Every retry of the same operation reuses the same key.
- Never put sensitive data in a key (emails, card numbers, personal identifiers).
- `GET`, `PUT`, `PATCH` and `DELETE` are idempotent by definition (see [REST & HTTP Verbs](/docs/rest-http-verbs)). A key sent with them has no effect.

## What the Server Stores

The first request with a key records:

| Field | Purpose |
| ----- | ------- |
| Key, scoped to the API account | Two accounts can't collide |
| Fingerprint of the request | Method, path, and a hash of the body |
| Status | `in_progress` or `completed` |
| Response | Status code, headers and body, once completed |
| Created at | For expiry |

The key record and the side effect are written in the **same transaction** where possible. If the side effect lives in another system (a card network), the key is recorded `in_progress` first, and recovery reconciles it.

## Behavior

| Request | Result |
| ------- | ------ |
| New key | Processed normally, response stored |
| Same key, same request, completed | Stored response **replayed**, nothing re-executed |
| Same key, same request, still in progress | `409 Conflict`, retry shortly with the same key |
| Same key, **different** request | `400 Bad Request`, the key is already bound to another request |
| Key older than the retention window | Treated as new |

A replayed response is byte-for-byte the original and adds one header so the client can tell:

```http
HTTP/1.1 201 Created
Idempotent-Replayed: true
```

### What Gets Stored

A result is stored once the endpoint **begins executing**, whatever the outcome:

- **Successes and failures are both stored,** including declines and `500` errors. A `500` means the outcome is indeterminate: the side effect may have happened. Replaying it keeps a retry from doing the work a second time.
- **Nothing is stored for requests rejected before execution:** failed validation, bad authentication, [rate limiting](/docs/rate-limiting) (`429`), or a `409` for a concurrent request. Fix the problem and retry with the same key.

## Retention

Keys are kept for **at least 24 hours**, then pruned. A key reused after it's pruned starts a new operation.

Retry an unresolved operation only within those 24 hours. If the outcome is still unknown after that, stop retrying with either the old key or a new one, and reconcile: fetch the object, or check [webhook](/docs/webhooks) events.

## Idempotency Beyond the API

The header protects the API boundary. Internally, the same rule applies at every hop:

- **Calls to processors** carry their own idempotency key, derived from ours, so a retry to the card network can't double-charge.
- **Queue consumers** dedupe by message ID, because every queue is at-least-once.
- **Webhook receivers** dedupe by event ID. See [Webhooks](/docs/webhooks).

Exactly-once delivery doesn't exist. At-least-once delivery plus idempotent handling is how you get exactly-once effects.

## Client Expectations

1. Generate a key before the first attempt, and persist it with the operation so it survives process restarts.
2. Reuse that key on every retry, with the exact same body.
3. On `409`, back off and retry the same key. A new key could start a second operation.
4. On `400` for a key mismatch, you've reused a key for a different operation. That's a client bug.
5. To change the parameters, first confirm the original didn't succeed and isn't still running, then use a new key.

## References

**Specifications**

- [IETF: The Idempotency-Key HTTP Header Field (draft)](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/), the header and its semantics
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), which methods are idempotent by definition

**Reference**

- [MDN: Idempotency-Key](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Idempotency-Key), header syntax
- [MDN: 409 Conflict](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409), concurrent requests with the same key

**In practice**

- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests), the behavior we match
- [Stripe: Advanced error handling](https://docs.stripe.com/error-low-level), the 24-hour retry window and reconciliation
- [Stripe: Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency), why keys exist
- [Brandur Leach: Implementing Stripe-like Idempotency Keys in Postgres](https://brandur.org/idempotency-keys), storing keys alongside the side effect
- [AWS Builders' Library: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/), idempotency across internal hops
