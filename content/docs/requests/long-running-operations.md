+++
title = "Long-Running Operations"
description = "Work that outlives a request: 202 Accepted with an operation resource to poll, Retry-After pacing, webhooks on completion, cancellation, and result retention."
category = "Requests & Responses"
order = 6.4
tags = ["api", "async", "operations", "http"]
aliases = ["long-running-operations"]
+++

Some work takes longer than a client should wait on an open connection: exports, imports, bulk jobs, anything that calls slow third parties. Don't hold the request open and hope. Accept the work, give it an address, and let the client check back. The model follows [Google AIP-151](https://google.aip.dev/151), which treats anything over about 10 seconds as long-running.

## Accepting the Work

The request returns [`202 Accepted`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202) right away, with a `Location` pointing at an **operation** resource:

```http
POST /exports
Idempotency-Key: f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json

{ "resource": "payments", "created_after": "2026-10-01T00:00:00Z" }
```

```http
HTTP/1.1 202 Accepted
Location: /operations/019a0b70-1e2f-7a3b-8c4d-5e6f7a8b9c0d
Retry-After: 5
```

The body is the operation itself, so the client doesn't need a second request to see it. An [Idempotency-Key](/docs/payments/idempotency) makes the `POST` safe to retry without starting the job twice.

## The Operation Resource

```json
{
  "id": "019a0b70-1e2f-7a3b-8c4d-5e6f7a8b9c0d",
  "type": "export",
  "status": "running",
  "progress": 0.42,
  "created_at": "2026-10-22T14:23:45Z",
  "completed_at": null,
  "result_url": null,
  "error": null
}
```

| `status` | Meaning |
| -------- | ------- |
| `queued` | Accepted, not started |
| `running` | In progress |
| `succeeded` | Done; `result_url` points at the result |
| `failed` | Done; `error` uses the standard [error format](/docs/requests/error-responses) |
| `canceled` | Stopped at the client's request |

The terminal states are terminal, the same rule as in [Payment States & Ledgers](/docs/payments/payment-states). Errors that stop the work from being accepted at all (validation, auth) are ordinary `4xx` responses to the original request, never a `failed` operation.

## Polling

```http
GET /operations/019a0b70-1e2f-7a3b-8c4d-5e6f7a8b9c0d
```

- While the operation is running, the response includes `Retry-After` with the suggested seconds until the next poll. Clients honor it.
- Polls support `If-None-Match` and return `304` when nothing changed (see [Caching](/docs/requests/caching)), so polling is cheap.
- On success, the response is `200` with the finished operation. The client follows `result_url` to fetch the result, which is a normal resource (an export file, a created object).

## Webhooks on Completion

Polling is the fallback. Clients that have a [webhook](/docs/payments/webhooks) endpoint receive `operation.succeeded` or `operation.failed` instead, with the operation in the payload. Good clients use both: the webhook for speed, an occasional poll for anything the webhook missed.

## Cancellation

```http
POST /operations/019a0b70-1e2f-7a3b-8c4d-5e6f7a8b9c0d/cancel
```

- Cancellation is a request, not a guarantee. The response is `202` and the operation moves to `canceled` once the worker stops.
- Canceling a finished operation returns `409` with the current state.
- Work that has side effects (charges, emails) documents what's undone and what isn't.

## Retention

Completed operations and their results are kept for **30 days**, the window AIP-151 suggests, then expire. A `GET` on an expired operation returns `404`. Results that need to live longer belong in a real resource, not an operation.

## When Not to Use This

If the work reliably finishes in a second or two, keep it synchronous. An async API is more code for every client. Reach for operations when the work is slow, variable, or depends on systems you don't control.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), `202 Accepted`, `Location` and `Retry-After`

**Reference**

- [MDN: 202 Accepted](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202), accepting work that isn't done yet
- [MDN: Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After), pacing polls
- [MDN: Location](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Location), pointing at the operation

**In practice**

- [Google AIP-151: Long-running operations](https://google.aip.dev/151), the operation resource and its retention
- [Microsoft: Azure REST API Guidelines](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md), long-running operations and jobs
