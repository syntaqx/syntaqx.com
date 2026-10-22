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
