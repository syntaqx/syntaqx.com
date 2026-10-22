+++
title = "Bulk Operations"
description = "Batch endpoints that create or update many resources in one call: size limits, per-item results, partial failure, idempotency, and when to go async."
category = "Requests & Responses"
order = 6.6
tags = ["api", "bulk", "batch", "design"]
+++

A thousand single requests is slow for the client and noisy for the server. A batch endpoint does the same work in one round trip, but only if it's clear exactly what happened to each item.

## Shape

A batch is a `POST` to the collection's `batch` sub-resource with an array of items. The response is an array of per-item results, in the same order:

```http
POST /customers/batch
Idempotency-Key: f47ac10b-58cc-4372-a567-0e02b2c3d479
Content-Type: application/json

[
  { "email": "alice@example.com", "name": "Alice" },
  { "email": "not-an-email", "name": "Bob" }
]
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "status": 201,
    "customer": {
      "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
      "email": "alice@example.com",
      "name": "Alice"
    }
  },
  {
    "status": 422,
    "error": {
      "message": "The given data was invalid.",
      "errors": { "email": ["The email must be a valid email address."] }
    }
  }
]
```

- **Each result has its own `status`,** using the same codes a single request would get.
- **Successes carry the resource** under its own name, never a `data` wrapper ([JSON Field Conventions](/docs/json-conventions)).
- **Failures carry the standard [error format](/docs/error-responses).**
- **Order matches the request,** so result `n` is about item `n`. No client-side matching.

## Partial Failure

The default is **independent items**: each one succeeds or fails on its own, and the batch returns `200` as long as it was processed. The HTTP status describes the batch; the per-item `status` describes each item.

| Situation | Response |
| --------- | -------- |
| Batch processed, any mix of item results | `200` with per-item results |
| Batch malformed (not an array, too many items) | `400` or `422`, nothing processed |
| Batch rejected before processing (auth, rate limit) | `401`, `403` or `429`, nothing processed |

Where items must succeed or fail together (moving money between accounts, a [ledger transaction](/docs/payment-states)), the endpoint is **atomic** and says so: one invalid item fails the whole request with `422`, and nothing is written. Never mix the two modes behind a flag.

## Limits

- **At most 100 items per batch,** the same cap [GitHub puts on `per_page`](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api). Bigger inputs are split by the client, or uploaded as a file to an async import.
- **A batch counts as one request per item** against [rate limits](/docs/rate-limiting). Batching saves round trips, not quota.
- **Items are validated before any work starts** when it's cheap, so obvious mistakes fail fast.

## Idempotency

The whole batch takes one [Idempotency-Key](/docs/idempotency). A retry replays the stored per-item results, so the successful items aren't created twice and the failed ones aren't silently retried. To retry only the failures, the client sends a new batch, with a new key, containing just those items.

## When to Go Async

If a batch can't reliably finish in a few seconds, make it a [long-running operation](/docs/long-running-operations): return `202 Accepted` with an operation to poll, and put the per-item results at the operation's `result_url` when it's done. Imports of thousands of rows always go this way.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), the status codes each item result reuses

**Reference**

- [MDN: 422 Unprocessable Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422), item-level validation failures

**In practice**

- [Google AIP-233: Batch methods: Create](https://google.aip.dev/233), batch create semantics
- [Google AIP-234: Batch methods: Update](https://google.aip.dev/234), batch update semantics
- [GitHub Docs: Using pagination in the REST API](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api), the 100-item `per_page` cap the batch limit matches
- [Stripe: API Reference](https://docs.stripe.com/api), the counterpoint: one object per request, no bulk updates
