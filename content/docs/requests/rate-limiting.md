+++
title = "Rate Limiting"
description = "Why every endpoint is rate limited, what to key limits on, the headers that report them, enforcing them in Redis, and staying up when the limiter fails."
category = "Requests & Responses"
order = 307
tags = ["api", "rate-limiting", "headers"]
aliases = ["rate-limiting", "operations/rate-limiting"]
+++

Every endpoint is rate limited, including the cheap ones. A rate limit isn't a punishment for heavy users; it's how a shared system stays shared. One buggy client in a retry loop, one scraper, or one customer's runaway cron job shouldn't take capacity from everyone else, and without a limit your capacity plan is whatever your noisiest client decides. "Cheap" stops being true at a million requests a minute, and an unlimited endpoint is the first one an attacker finds.

## Limits

| Parameter | Value |
|-----------|-------|
| Window | 1 hour |
| Max requests | 5,000 per client |

An hourly budget is generous for any legitimate integration and still caps a runaway loop at a level the system can absorb. Short windows (per second, per minute) catch bursts better, so systems with real traffic usually run both: a per-second limit for spikes and a longer one for sustained volume.

## What to Key On

The limit is only as fair as the identity it counts against.

- **An API key or account, when you have one.** It's stable, it's the unit customers think in, and limits can differ per plan. See [API Authentication](/docs/api-design/authentication).
- **The client IP, when you don't.** It's the only identity an anonymous API has, and it's imperfect in both directions: an office behind one NAT shares a budget, and an attacker with a pool of IPv6 addresses gets a fresh one per address. Key IPv6 clients on their `/64` prefix rather than the full address, which closes the cheapest version of that trick.
- **Never a value the client can choose freely.** A limit keyed on a header the client sets is a suggestion.

Behind a proxy, the client IP comes from `X-Forwarded-For`, but only the entries your own infrastructure added. Clients can send that header too, and a limiter that trusts whatever arrives lets anyone pick their own bucket. Platforms like Vercel overwrite it at the edge, which is what makes it safe to read there.

## Headers

Clients shouldn't have to discover the limit by hitting it. Every response says where they stand:

| Header | Description |
|--------|-------------|
| `RateLimit-Policy` | The quota policy: `q` requests per `w` seconds |
| `RateLimit` | Remaining quota `r` and seconds `t` until the window resets |
| `X-RateLimit-Limit` | Maximum requests allowed in the current window (legacy) |
| `X-RateLimit-Remaining` | Requests remaining in the current window (legacy) |
| `X-RateLimit-Reset` | UTC epoch seconds when the window resets (legacy) |
| `Retry-After` | Seconds until retry is allowed (only on `429` responses) |

`RateLimit-Policy` and `RateLimit` come from the [IETF RateLimit header fields draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/). It's still a draft, but it's the only attempt at a standard, and its structured fields can describe several policies at once, which the `X-` headers can't. The `X-RateLimit-*` trio carries the same state for clients that already parse it, since that's what most APIs have shipped for a decade.

### Example Headers

```
RateLimit-Policy: "hourly";q=5000;w=3600
RateLimit: "hourly";r=4999;t=3600
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1792692000
```

## Handling a 429

Over the limit, the response is `429 Too Many Requests` with a `Retry-After` header and the standard [error format](/docs/requests/error-responses):

```json
{
  "message": "Too many requests. Please try again later."
}
```

A client waits for `Retry-After`, because the server knows when the window resets and a backoff formula is a guess, and it watches `RateLimit` before reaching zero, so a batch job can slow itself down instead of failing halfway. [Retries & Timeouts](/docs/architecture/retries-and-timeouts) has the full retry policy.

## How It's Enforced

A limit only means something if every server agrees on the count. Serverless functions and scaled-out services don't share memory, so a per-instance counter quietly multiplies the limit by the number of warm instances. The counter lives in a shared store, and Redis is the standard one: atomic increments, keys that expire on their own, fast enough to sit in front of every request.

### The Redis Pattern

A fixed window is one atomic script, the rate-limiter pattern from the [Redis `INCR` docs](https://redis.io/docs/latest/commands/incr/#pattern-rate-limiter):

```lua
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
return { count, redis.call("PTTL", KEYS[1]) }
```

- `INCR` counts the request, and the first one in a window sets the expiry, so counters clean themselves up.
- One script removes the race between increment and expiry. Two separate commands can crash between them and leave a counter that never expires, blocking that client forever.
- `PTTL` gives the time until reset, for the `RateLimit` and `Retry-After` headers.

### Choosing an Algorithm

| Algorithm | How it counts | Tradeoff |
| --- | --- | --- |
| **Fixed window** | A counter per window | One command per request; allows up to twice the limit across a window boundary |
| **Sliding window** | A log of timestamps, or two weighted fixed windows | Smooth, no boundary burst; more storage or more commands |
| **Token bucket** | Tokens refill at a rate; requests spend them | Allows controlled bursts with a steady average; more state per client |

Start with a fixed window. The boundary burst (a whole budget spent at the end of one window and again at the start of the next) matters at ten per second; at five thousand an hour it doesn't, and simplicity is worth more than smoothness. Move to a sliding window or token bucket when bursts are the thing you're protecting against. Libraries like [Upstash Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) package all three.

![Dimensional drawing comparing two limiters at 5,000 requests per hour. In a fixed window, a client that spends its quota in the last 6 minutes of one window and again in the first 6 of the next sends 10,000 requests in 12 minutes. A token bucket of illustrative capacity 100, refilled at 5,000 per 3,600 seconds, allows a burst of 100 and then 1.39 requests per second, refilling from empty in 72 seconds, so at most 5,100 pass in any hour.](/diagrams/pb-requests-token-bucket.svg "A fixed window can pass twice its limit across a boundary; a token bucket caps any hour at its capacity plus one window's refill.")

### When the Store Is Down

The rate limiter must never be the reason the API is down. If Redis errors or doesn't answer within a second, fall back to an in-memory count per instance: limits get looser for a while, but requests keep flowing. Failing closed would turn a cache outage into a full outage, to protect against abuse that probably isn't happening at that moment. (An [idempotency](/docs/payments/idempotency) store makes the opposite call, because there a looser check means a duplicate write.)

Remember clients already over the limit in memory too. A blocked client keeps sending requests, and checking Redis for each one spends the store's capacity, and on a metered plan money, on traffic you've already refused.

## References

**Specifications**

- [IETF: RateLimit header fields for HTTP (draft)](https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/), the `RateLimit-Policy` and `RateLimit` fields
- [RFC 6585: Additional HTTP Status Codes](https://datatracker.ietf.org/doc/html/rfc6585), defines `429 Too Many Requests`
- [RFC 9110: HTTP Semantics](https://datatracker.ietf.org/doc/html/rfc9110), the `Retry-After` field

**Reference**

- [MDN: 429 Too Many Requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429), status code behavior
- [MDN: Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After), header syntax
- [MDN: X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For), which entry to trust behind a proxy
- [Vercel: Request headers](https://vercel.com/docs/headers/request-headers), the edge overwriting `X-Forwarded-For` to prevent spoofing
- [Redis: INCR, pattern: rate limiter](https://redis.io/docs/latest/commands/incr/#pattern-rate-limiter), the fixed-window script
- [Upstash: Ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview), fixed window, sliding window and token bucket

**In practice**

- [GitHub: Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api), the `X-RateLimit-*` headers clients already parse
- [Stripe: Scaling your API with rate limiters](https://stripe.com/blog/rate-limiters), limiting every endpoint, and different limiters for different failure modes
