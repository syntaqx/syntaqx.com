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

## How It's Enforced

A limit only means something if every server agrees on the count. Serverless functions don't share memory, so the counter lives in a shared store, and **Redis is the standard tool**: atomic increments, keys that expire on their own, and fast enough to sit in front of every request.

### The Redis Pattern

A fixed window is one atomic script, straight from the [Redis `INCR` docs](https://redis.io/docs/latest/commands/incr/#pattern-rate-limiter):

```lua
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
return { count, redis.call("PTTL", KEYS[1]) }
```

- `INCR` counts the request. The first one in a window sets the expiry, so counters clean themselves up.
- Running it as one script means no race between the increment and the expiry, and one round trip per request.
- `PTTL` gives the seconds until reset for the `RateLimit` and `Retry-After` headers.

A fixed window can let through up to twice the limit across a window boundary. A **sliding window** (a sorted set of timestamps, or two weighted fixed windows) or a **token bucket** smooths that out, at the cost of more work per request. Libraries like [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) package all three.

### When the Store Is Down

The rate limiter must never be the reason the API is down. If Redis errors or doesn't answer within a second, fall back to an in-memory count on each instance: limits get looser for a while, but requests keep flowing. Clients already over the limit are remembered in memory too, so a blocked client doesn't cost a Redis call per request.

### This API

The syntaqx API runs exactly this script on [Upstash Redis](https://upstash.com/docs/redis/sdks/ts/developing), with the in-memory fallback. Locally, `compose.yml` runs Redis behind the same REST API Upstash serves, and without it the limiter sends the headers but never blocks. The reasoning, and the alternatives that lost, are in [ADR 0011](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0011-rate-limiting-in-upstash-redis.md).

## References

**Specifications**

- [IETF: RateLimit header fields for HTTP (draft)](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), the `RateLimit-Policy` and `RateLimit` fields
- [RFC 6585: Additional HTTP Status Codes](https://datatracker.ietf.org/doc/html/rfc6585), defines `429 Too Many Requests`
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), the `Retry-After` field

**Reference**

- [MDN: 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429), status code behavior
- [MDN: Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After), header syntax
- [Redis: INCR, pattern: rate limiter](https://redis.io/docs/latest/commands/incr/#pattern-rate-limiter), the fixed-window script
- [Upstash: Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview), fixed window, sliding window and token bucket

**In practice**

- [GitHub: Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), the `X-RateLimit-*` headers kept for compatibility
- [Stripe: Rate limits](https://docs.stripe.com/rate-limits), handling 429s with backoff and jitter
- [Stripe: Scaling your API with rate limiters](https://stripe.com/blog/rate-limiters), why every endpoint is limited
