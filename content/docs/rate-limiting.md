+++
title = "Rate Limiting"
description = "Rate limiting behavior, the headers that describe your current limits, and best practices for gracefully handling 429 responses in your client."
category = "Operations"
order = 5
tags = ["api", "rate-limiting", "headers"]
+++

Every endpoint is rate limited. No exceptions.

## Limits

| Parameter | Value |
|-----------|-------|
| Window | 1 hour |
| Max requests | 5,000 per IP |

## Headers

Every response includes rate limit state:

| Header | Description |
|--------|-------------|
| `RateLimit-Policy` | The quota policy: `q` requests per `w` seconds ([IETF RateLimit fields](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/)) |
| `RateLimit` | Remaining quota `r` and seconds `t` until the window resets |
| `X-RateLimit-Limit` | Maximum requests allowed in the current window (legacy) |
| `X-RateLimit-Remaining` | Requests remaining in the current window (legacy) |
| `X-RateLimit-Reset` | UTC epoch seconds when the window resets (legacy) |
| `Retry-After` | Seconds until retry is allowed (only on `429` responses) |

Prefer `RateLimit-Policy` and `RateLimit`. The `X-RateLimit-*` headers carry the same state and stay for existing clients.

### Example Headers

```
RateLimit-Policy: "hourly";q=5000;w=3600
RateLimit: "hourly";r=4999;t=3600
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1628604000
```

## Handling a 429

When you hit the limit:

1. Read the `Retry-After` header.
2. Wait that long, then retry.
3. If you're retrying in a loop, use exponential backoff. Don't hammer it.

```json
{
  "message": "Too many requests. Please try again later."
}
```

## References

**Specifications**

- [IETF: RateLimit header fields for HTTP (draft)](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), the `RateLimit-Policy` and `RateLimit` fields
- [RFC 6585: Additional HTTP Status Codes](https://datatracker.ietf.org/doc/html/rfc6585), defines `429 Too Many Requests`
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), the `Retry-After` field

**Reference**

- [MDN: 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429), status code behavior
- [MDN: Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After), header syntax

**In practice**

- [GitHub: Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), the `X-RateLimit-*` headers kept for compatibility
- [Stripe: Rate limits](https://docs.stripe.com/rate-limits), handling 429s with backoff and jitter
- [Stripe: Scaling your API with rate limiters](https://stripe.com/blog/rate-limiters), why every endpoint is limited
