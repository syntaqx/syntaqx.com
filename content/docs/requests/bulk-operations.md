+++
title = "Bulk Operations"
description = "Batch endpoints that create or update many resources in one call: size limits, per-item results, partial failure, idempotency, and when to go async."
category = "Requests & Responses"
order = 6.6
tags = ["api", "bulk", "batch", "design"]
aliases = ["bulk-operations"]
+++

A thousand single requests is slow for the client and noisy for the server: a thousand round trips, a thousand auth checks, a thousand log lines. A batch endpoint does the same work in one round trip. The hard part isn't the batching, it's the reporting: when 998 items succeed and 2 fail, the client has to know exactly which 2, and why, without guessing.

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

- **Each result has its own `status`,** using the same codes a single request would get. A client already knows what `201` and `422` mean, so it can reuse its single-request handling item by item instead of learning a batch-specific vocabulary.
- **Successes carry the resource** under its own name, never a `data` wrapper ([JSON Field Conventions](/docs/requests/json-conventions)).
- **Failures carry the standard [error format](/docs/requests/error-responses).**
- **Order matches the request,** so result `n` is about item `n`. No client-side matching.

## Partial Failure

The default is **independent items**: each one succeeds or fails on its own, and the batch returns `200` as long as it was processed. The HTTP status describes the batch; the per-item `status` describes each item.

Why `200` and not an error when some items failed? Because the batch did exactly what it promised: it processed every item and reported on each. Returning `4xx` for a partly successful batch tells retry logic and monitoring that nothing happened, and a client that retries the whole batch creates the 998 successes twice. WebDAV's `207 Multi-Status` exists for this situation, but it comes with an XML body format and semantics most HTTP clients don't implement, and a `2xx` with per-item results says the same thing in a shape the client already parses.

| Situation | Response |
| --------- | -------- |
| Batch processed, any mix of item results | `200` with per-item results |
| Batch malformed (not an array, too many items) | `400` or `422`, nothing processed |
| Batch rejected before processing (auth, rate limit) | `401`, `403` or `429`, nothing processed |

Where items must succeed or fail together (moving money between accounts, a [ledger transaction](/docs/payments/payment-states)), the endpoint is **atomic** and says so: one invalid item fails the whole request with `422`, and nothing is written. Never mix the two modes behind a flag. A client that forgets the flag gets partial writes where it expected all-or-nothing, and that's the kind of bug that shows up as an unbalanced ledger, not an error.

## Limits

- **At most 100 items per batch.** A ceiling bounds everything a single request can cost: body size, memory, how long locks are held, and how long the client waits. 100 is small enough that a batch finishes in a normal request's time and large enough to cut round trips by two orders of magnitude. It matches the [page size ceiling](/docs/requests/pagination), so a client can fetch a page, change it, and write it back in one batch. Bigger inputs are split by the client, or uploaded as a file to an async import.
- **A batch counts as one request per item** against [rate limits](/docs/operations/rate-limiting). Batching saves round trips, not quota. Otherwise a 100-item batch becomes a way to do 100 times the work under the same limit.
- **Items are validated before any work starts** when it's cheap, so a malformed batch fails in milliseconds instead of halfway through.

## Idempotency

The whole batch takes one [Idempotency-Key](/docs/payments/idempotency). A retry replays the stored per-item results, so the successful items aren't created twice and the failed ones aren't silently retried. To retry only the failures, the client sends a new batch, with a new key, containing just those items.

## When to Go Async

If a batch can't reliably finish in a few seconds, make it a [long-running operation](/docs/requests/long-running-operations): return `202 Accepted` with an operation to poll, and put the per-item results at the operation's `result_url` when it's done. Imports of thousands of rows always go this way.

## References

**Specifications**

- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), the status codes each item result reuses
- [RFC 4918: WebDAV, 207 Multi-Status](https://datatracker.ietf.org/doc/html/rfc4918#section-11.1), the multi-status alternative and why it isn't used here

**Reference**

- [MDN: 422 Unprocessable Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422), item-level validation failures

**In practice**

- [Google AIP-233: Batch methods: Create](https://google.aip.dev/233), batch create semantics
- [Google AIP-234: Batch methods: Update](https://google.aip.dev/234), batch update semantics
- [GitHub Docs: Using pagination in the REST API](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api), a 100-item ceiling on most list endpoints, the same order of magnitude as the batch limit
- [Stripe: API Reference](https://docs.stripe.com/api), the counterpoint: one object per request, no bulk updates
