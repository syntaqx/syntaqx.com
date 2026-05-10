+++
title = "Rate Limiting"
description = "Rate limiting behavior, headers, and best practices for handling 429 responses."
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
| `X-RateLimit-Limit` | Maximum requests allowed in the current window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset` | UTC epoch seconds when the window resets |
| `Retry-After` | Seconds until retry is allowed (only on `429` responses) |

### Example Headers

```
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
