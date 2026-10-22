+++
title = "Error Responses"
description = "One error shape for every failure, status codes that carry the outcome, and the 400 vs 422 and 403 vs 404 calls clients branch on to recover."
category = "Requests & Responses"
order = 2
tags = ["api", "errors", "standards"]
aliases = ["error-responses"]
+++

An error response has two readers: a program deciding what to do next, and a person trying to fix the request. The status code serves the program. The body serves the person. Get those two jobs right and clients can handle failures without a lookup table per endpoint.

## One Shape, Every Time

Every error, from every endpoint, at every status code, has the same JSON shape:

- **`message`**: what went wrong, in plain language a developer can act on.
- **`errors`** *(optional)*: field-level failures. Keys are the request's field names, values are arrays of messages.

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "items.0.quantity": ["The quantity must be at least 1."]
  }
}
```

The consistency is the point. A client writes one error handler, and it works for a `404` from one endpoint and a `422` from another. If every team invents its own shape (`error`, `errors`, `error_message`, `detail`), every client grows a special case per endpoint, and the special cases are where error handling quietly breaks.

- **Nested fields use dot paths** (`items.0.quantity`), so a form can attach each message to the input that caused it.
- **Messages are for humans, codes are for programs.** Clients branch on the status code, never by matching message text, so messages can be reworded without breaking anyone.
- **Never echo the input back.** `"The card number is invalid."`, not `"4242 4242 4242 4241 is invalid."` Error bodies end up in logs, support tickets and screenshots. See [Sensitive Data](/docs/payments/sensitive-data).
- **Every error carries a `Request-Id` header.** It's what a client pastes into a support ticket, and it ties the response to the server's logs. See [Observability](/docs/operations/observability).

### Why Not RFC 9457 Problem Details?

[RFC 9457](https://datatracker.ietf.org/doc/html/rfc9457) defines a standard error format (`application/problem+json` with `type`, `title`, `status`, `detail`, `instance`). It's a good standard, and if you're building an API many teams will contribute error types to, its `type` URIs give each kind of error a stable, documented identity.

I keep the simpler shape for two reasons. Field-level validation is the most common error a client actually has to render, and Problem Details has no standard member for it, so every implementation adds its own extension anyway. And `type` URIs are only valuable if someone writes and maintains the page behind each one; an unmaintained `type` is noise. If an API outgrows `message` and `errors`, Problem Details is where it should go, with `errors` carried as an extension member.

## The Status Code Is the Outcome

There's no `success` boolean in the body and no `200 OK` wrapping an error. HTTP already says whether a request worked, and everything between the client and the server reads it: retry logic, load balancers, CDNs, uptime monitors and error-rate dashboards. A `200` with `"success": false` is invisible to all of them, so the error rate looks perfect while clients fail.

| Code | Meaning | When |
| ---- | ------- | ---- |
| `400` | Bad Request | The request is malformed: invalid JSON, a missing required header, an unknown `Api-Version` |
| `401` | Unauthorized | No credentials, or they're invalid or expired |
| `402` | Payment Required | A valid payment request that was declined |
| `403` | Forbidden | Authenticated, but not allowed to do this |
| `404` | Not Found | The resource doesn't exist, or the caller isn't allowed to know it exists |
| `405` | Method Not Allowed | The resource doesn't support the method; `Allow` lists the ones it does |
| `409` | Conflict | The request conflicts with current state: an [idempotency key](/docs/payments/idempotency) still in flight, canceling an operation that already finished |
| `410` | Gone | Retired after its [sunset](/docs/operations/versioning) |
| `412` | Precondition Failed | An `If-Match` didn't match; someone else changed it ([Caching](/docs/requests/caching)) |
| `413` | Content Too Large | The body exceeds the endpoint's limit |
| `415` | Unsupported Media Type | The `Content-Type` isn't one the endpoint accepts |
| `422` | Unprocessable Content | Well-formed, but the values are invalid |
| `428` | Precondition Required | The resource requires `If-Match` and the request didn't send one |
| `429` | Too Many Requests | [Rate limited](/docs/operations/rate-limiting); `Retry-After` says when to try again |
| `500` | Internal Server Error | Something broke on the server |
| `503` | Service Unavailable | Temporarily unable to serve; `Retry-After` when known |

### 400 or 422?

Both mean "fix your request", but they tell the client *what* to fix:

- **`400`: the request can't be read.** The JSON doesn't parse, a required header is missing, the version doesn't exist. Nothing about the values was checked, because the server never got that far.
- **`422`: the request was read, and the values are wrong.** The JSON is fine, but `email` isn't an email and `count` is out of range. This is where `errors` lives.

The split is worth keeping because the fixes are different. A `400` is usually a bug in the client's code (it built the request wrong). A `422` is usually bad input from a user (the client should show the messages next to the fields).

### 401, 403 or 404?

- **`401`** means "I don't know who you are." The client should authenticate or refresh its token.
- **`403`** means "I know who you are, and you can't do this." Retrying won't help; the caller needs different permissions.
- **`404` for things the caller can't see at all.** If a resource belongs to another account, answering `403` confirms it exists, which leaks information (an attacker can enumerate IDs). Answer `404`, exactly as if it didn't exist. See [API Authentication](/docs/api-design/authentication) and [Multi-Tenancy](/docs/architecture/multi-tenancy).

### 5xx and Retries

A `5xx` means the outcome is unknown or the server is struggling, and the right client response differs: `503` with `Retry-After` is an invitation to come back, while a `500` on a request with side effects may have half happened. [Retries & Timeouts](/docs/operations/retries-and-timeouts) covers which are safe to retry and how.

## What Clients Should Do

1. Branch on the status code. Treat unknown codes by their class (`4xx`: don't retry as-is, `5xx`: retry carefully).
2. Show `message` to developers, and map `errors` onto form fields for users.
3. Log the `Request-Id` with every failure.
4. Honor `Retry-After` on `429` and `503`.

## This Site

The syntaqx API returns this shape from every endpoint, with `400` for malformed requests (invalid JSON, a missing `User-Agent`, an unknown `Api-Version`) and `422` with field-level `errors` for invalid values. Unknown paths return `404` with `"The requested endpoint could not be found."`.

## References

**Specifications**

- [RFC 9110: HTTP Semantics, Status Codes](https://datatracker.ietf.org/doc/html/rfc9110#section-15), the meaning of each status code used here
- [RFC 6585: Additional HTTP Status Codes](https://datatracker.ietf.org/doc/html/rfc6585), `428 Precondition Required` and `429 Too Many Requests`
- [RFC 9457: Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457), the richer standard format, and where this one would grow into

**Reference**

- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status), every code with examples
- [MDN: 422 Unprocessable Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422), validation failures
- [IANA: HTTP Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml), the authoritative list

**In practice**

- [Laravel: Validation error response format](https://laravel.com/docs/validation#validation-error-response-format), the `message` and `errors` shape, with dot paths for nested fields
- [Stripe: Errors](https://docs.stripe.com/api/errors), status codes in payments, including `402` for declines and `409` for idempotency conflicts
