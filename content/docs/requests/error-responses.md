+++
title = "Error Responses"
description = "The standard error response format and the HTTP status codes used across the API, so clients can handle failures consistently and predictably."
category = "Requests & Responses"
order = 2
tags = ["api", "errors", "standards"]
aliases = ["error-responses"]
+++

Every error returns the same JSON shape, regardless of the status code.

## Format

Two fields:

- **`message`**: What went wrong, in plain language.
- **`errors`** *(optional)*: Field-level validation failures. Keys are field names, values are arrays of messages.

### Example: Validation Error (422)

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "first_name": ["The first name must be a string."]
  }
}
```

### Example: Not Found (404)

```json
{
  "message": "The requested endpoint could not be found."
}
```

## Status Codes

The HTTP status code tells you what happened. There's no `success` boolean in the body.

| Code | Meaning | When |
| ---- | ------- | ---- |
| `200` | OK | Request succeeded |
| `400` | Bad Request | Malformed or unservable request |
| `401` | Unauthorized | Authentication required |
| `402` | Payment Required | Valid request, but the payment was declined |
| `403` | Forbidden | Understood, but not allowed |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Another request with the same [idempotency key](/docs/payments/idempotency) is still running |
| `410` | Gone | Endpoint retired after its [sunset](/docs/operations/versioning) |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | [Rate limit](/docs/operations/rate-limiting) exceeded |
| `500` | Internal Server Error | Something broke server-side |

## References

**Specifications**

- [RFC 9110: HTTP Semantics, Status Codes](https://datatracker.ietf.org/doc/html/rfc9110#section-15), the meaning of every status code used here
- [RFC 6585: Additional HTTP Status Codes](https://datatracker.ietf.org/doc/html/rfc6585), `429 Too Many Requests`
- [RFC 9457: Problem Details for HTTP APIs](https://datatracker.ietf.org/doc/html/rfc9457), the IETF's richer error format, which this one deliberately keeps simpler than

**Reference**

- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status), every code with examples
- [MDN: 422 Unprocessable Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422), validation failures
- [IANA: HTTP Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml), the authoritative list

**In practice**

- [Laravel: Validation error response format](https://laravel.com/docs/validation#validation-error-response-format), the `message` and `errors` shape this format follows
- [Stripe: Errors](https://docs.stripe.com/api/errors), status codes in payments, including `402` for declines and `409` for idempotency conflicts
