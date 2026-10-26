+++
title = "Idempotency"
description = "Safe retries for any write with the Idempotency-Key header: how keys are stored and replayed, and what happens on conflicting or concurrent requests."
category = "Payments"
order = 802
tags = ["api", "payments", "idempotency", "headers"]
aliases = ["idempotency"]
+++

Once an amount is represented correctly ([Money & Amounts](/docs/payments/money)), the next way to get it wrong is to move it twice. Networks fail after the server has done the work: a client sends `POST /payments`, the connection drops, and it can't know whether the card was charged. Retry, and the customer may pay twice. Don't, and the order may never be paid.

An idempotency key removes the dilemma. The client attaches a key to the operation, and the server promises that the same key always produces the same result, with the side effect happening at most once. Retrying becomes always safe, so clients can retry freely, which is exactly what you want them to do.

## The Header

Every `POST` accepts an `Idempotency-Key` header, as defined by the [IETF Idempotency-Key draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/).

```http
POST /payments
Idempotency-Key: f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json

{ "amount": 1999, "currency": "USD", "source": "tok_visa" }
```

- **The client generates the key,** because only the client knows when two requests are the same operation. A [UUID v4](/docs/fundamentals/identifier-conventions) is ideal: random, with no information to leak. Up to 255 characters.
- **One key per logical operation, not per HTTP attempt.** A key generated fresh on every retry protects nothing. Generate it when the user clicks "Pay", store it with the order, and reuse it until the operation resolves.
- **Never put sensitive data in a key.** Keys end up in logs and storage. An email or card number in a key is a leak waiting to happen.
- **Only `POST` needs one.** `GET`, `PUT` and `DELETE` are idempotent by definition in [RFC 9110](https://datatracker.ietf.org/doc/html/rfc9110#name-idempotent-methods): repeating them leaves the same state. `PATCH` isn't by definition, but a [JSON Merge Patch](/docs/requests/json-conventions) that sets absolute values is idempotent in practice. A key sent with any of these is ignored.

## What the Server Stores

The first request with a key records:

| Field | Purpose |
| ----- | ------- |
| Key, scoped to the API account | Two accounts' keys can't collide, and one account can't probe another's |
| Fingerprint of the request | Method, path and a hash of the body, to detect a key reused for something else |
| Status | `in_progress` or `completed` |
| Response | Status code, headers and body, once completed |
| Created at | For expiry |

The key record and the side effect are written in the **same database transaction** wherever possible. That's the whole trick: if the payment row commits, so does the key, and if either fails, neither exists. Storing the key in a separate system (a cache, a different database) reopens the gap the key was meant to close, because a crash between the two writes leaves a charge with no record of it.

When the side effect lives somewhere else, like a card network, a single transaction isn't possible. Record the key as `in_progress` first, call the processor with its own idempotency key derived from ours, then complete the record. A crash in the middle leaves an `in_progress` key that a recovery job reconciles against the processor.

## Behavior

| Request | Result |
| ------- | ------ |
| New key | Processed normally, response stored |
| Same key, same request, completed | Stored response **replayed**, nothing re-executed |
| Same key, same request, still in progress | `409 Conflict`: retry shortly with the same key |
| Same key, **different** request | `400 Bad Request`: the key is already bound to another operation |
| Key older than the retention window | Treated as new |

A replayed response is byte-for-byte the original and adds one header, so the client can tell it's a replay:

```http
HTTP/1.1 201 Created
Idempotent-Replayed: true
```

The mismatch case is a client bug: the same key was attached to two different operations. The IETF draft suggests `422` here, and I return `400` instead, as Stripe does. In these docs `422` means field-level validation failed and comes with an `errors` object pointing at the fields ([Error Responses](/docs/requests/error-responses)). A key mismatch has no field to point at. The body itself may be perfectly valid; it's the pairing with the key that's wrong.

### What Gets Stored, and Why Errors Count

A result is stored once the endpoint **begins executing**, whatever the outcome. That includes declines and even `500` errors, which surprises people.

A `500` from a payment endpoint doesn't mean nothing happened; it means the server doesn't know what happened. The charge may have gone through before the error, and re-executing on retry could charge the card again. Replaying the stored `500` is the honest answer: "this outcome is uncertain, go and check". The client reconciles by fetching the payment or watching [webhooks](/docs/api-design/webhooks) instead of gambling with a second charge.

Requests rejected **before** execution aren't stored: failed validation, bad authentication, [rate limiting](/docs/requests/rate-limiting) (`429`), or a `409` for a concurrent request. Nothing happened, so the client fixes the problem and retries with the same key.

## Retention

Keys are kept for **at least 24 hours**, then pruned. Reusing a pruned key starts a new operation.

A retry window has to outlast realistic failures: seconds cover network blips, minutes cover a deploy, and a day covers a client that crashed overnight and drains its queue in the morning. Past that, a "retry" is really a new decision someone should make deliberately, and keeping keys forever means a table that grows with every write the API has ever served. Stripe uses the same 24-hour minimum. Past the window, clients stop retrying with any key and reconcile: fetch the object, or check events.

## Idempotency Beyond the API

The header protects the API boundary. The same rule applies at every hop inside the system, because every hop can fail halfway:

- **Calls to processors** carry their own idempotency key, derived from ours, so our retry to the card network can't double-charge either.
- **Queue consumers** dedupe by message ID, because every queue worth using delivers at least once.
- **Webhook receivers** dedupe by event ID. See [Webhooks](/docs/api-design/webhooks).

Exactly-once delivery doesn't exist across a network. At-least-once delivery plus idempotent handling is how you get exactly-once **effects**, and that's the only kind that matters.

## Client Expectations

1. Generate a key before the first attempt, and persist it with the operation so it survives process restarts.
2. Reuse that key on every retry, with the exact same body, backing off as in [Retries & Timeouts](/docs/architecture/retries-and-timeouts).
3. On `409`, retry the same key. A new key could start a second operation while the first is still running.
4. On `400` for a key mismatch, you've reused a key for a different operation. Fix the client.
5. To change the parameters, first confirm the original didn't succeed and isn't still running, then use a new key.

## This Site

The syntaqx API's `POST /echo` exists to show this working. Every call creates a new echo with its own `id` and timestamp, so without a key, two identical requests make two echoes:

```bash
curl -X POST https://api.syntaqx.com/echo \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: f47ac10b-58cc-4372-a567-0e02b2c3d479" \
  -d '{"hello": "world"}'
```

Run it twice and the second response is the first one again, byte for byte, with `Idempotent-Replayed: true`. Change the body and keep the key, and it's a `400`. Keys live in Redis for 24 hours, scoped to the caller's IP since the API has no accounts, and a claim is a single `SET NX`, so two simultaneous first requests can't both run.

The echo exists only in its stored response, so recording the key and the side effect is one write. And unlike the [rate limiter](/docs/requests/rate-limiting), which keeps serving when Redis is down, this fails closed: if the key store is unreachable, the request gets a `503` and nothing is created, because a write without its protection is exactly what the key exists to prevent.

## References

**Specifications**

- [IETF: The Idempotency-Key HTTP Header Field (draft)](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/), the header, `409` for concurrent requests, and published expiry
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110#name-idempotent-methods), which methods are idempotent by definition

**Reference**

- [MDN: Idempotency-Key](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Idempotency-Key), header syntax
- [MDN: 409 Conflict](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/409), concurrent requests with the same key

**In practice**

- [Stripe: Idempotent requests](https://docs.stripe.com/api/idempotent_requests), storing results once execution begins, including `500`s, and a 24-hour minimum
- [Stripe: Advanced error handling](https://docs.stripe.com/error-low-level), retrying within the window, then reconciling
- [Stripe: Designing robust and predictable APIs with idempotency](https://stripe.com/blog/idempotency), why keys exist
- [Brandur Leach: Implementing Stripe-like Idempotency Keys in Postgres](https://brandur.org/idempotency-keys), storing keys in the same transaction as the side effect
- [AWS Builders' Library: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/), idempotency across internal hops
