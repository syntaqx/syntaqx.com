+++
title = "Idempotency"
description = "Safe retries for any write with the Idempotency-Key header: how keys are stored and replayed, and what happens on conflicting or concurrent requests."
category = "Payments"
order = 7.1
tags = ["api", "payments", "idempotency", "headers"]
+++

Networks fail after the server has done the work. A client that times out on `POST /payments` has no way to know whether it charged the card. Idempotency keys make the retry safe: the same key always produces the same result, and the side effect happens at most once.

## The Header

Every `POST` (and any `PATCH` with side effects) accepts an `Idempotency-Key` header, following the [IETF Idempotency-Key draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/).

```http
POST /payments
Idempotency-Key: 01J9Z8K3V7Q4N2M6X5R8T0B1C3
Content-Type: application/json

{ "amount": 1999, "currency": "USD", "source": "tok_visa" }
```

- The client generates the key. A [UUID v4 or ULID](/docs/identifier-conventions) is ideal.
- One key per **logical operation**, not per HTTP attempt. Every retry of the same operation reuses the same key.
- `GET`, `PUT` and `DELETE` are already idempotent by definition and don't need one. See [REST & HTTP Verbs](/docs/rest-http-verbs).

For money-moving endpoints the key is **required**. A missing key returns `400`.

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
| Same key, same request, still in progress | `409 Conflict`, retry shortly |
| Same key, **different** request | `422 Unprocessable Entity`, the key is already bound |
| Key older than the retention window | Treated as new |

A replayed response is byte-for-byte the original, including errors, and adds one header so the client can tell:

```http
HTTP/1.1 201 Created
Idempotent-Replayed: true
```

### What Gets Stored

- **Successes and deterministic failures** (`4xx` validation errors) are stored and replayed.
- **`5xx` and `429` responses are not stored.** The operation didn't complete, so the client is free to retry with the same key.

## Retention

Keys are kept for **24 hours**. That covers every reasonable retry schedule (see [Retries & Timeouts](/docs/retries-and-timeouts)) without keeping data forever. After that the key can be reused, so clients shouldn't retry an operation days later with an old key and expect a replay.

## Idempotency Beyond the API

The header protects the API boundary. Internally, the same rule applies at every hop:

- **Calls to processors** carry their own idempotency key, derived from ours, so a retry to the card network can't double-charge.
- **Queue consumers** dedupe by message ID, because every queue is at-least-once.
- **Webhook receivers** dedupe by event ID. See [Webhooks](/docs/webhooks).

Exactly-once delivery doesn't exist. At-least-once delivery plus idempotent handling is how you get exactly-once effects.

## Client Expectations

1. Generate a key before the first attempt, and persist it with the operation.
2. Reuse that key on every retry, with the exact same body.
3. On `409`, back off and retry the same key.
4. On `422`, you've reused a key for a different operation. That's a client bug.
