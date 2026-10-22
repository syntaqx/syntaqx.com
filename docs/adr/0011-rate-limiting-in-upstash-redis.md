# 0011. Rate limiting in Upstash Redis, with memory and noop stores

Status: Accepted (2026-10-22)

## Context

[Rate Limiting](https://www.syntaqx.com/docs/rate-limiting) promises 5,000 requests per hour per IP. The limiter kept its counts in memory, so each serverless instance had its own count, and the real limit was 5,000 times however many instances were warm. [0010](0010-datastores-allowed-no-user-identity.md) allows a datastore for this.

Options considered:

- **Upstash Redis** (chosen): the standard tool for rate limiting, served over HTTP so it works from serverless functions, and installed through the Vercel Marketplace. The free tier is 500,000 commands a month.
- **Turso (libSQL):** a more generous free tier (10M rows written a month), and a single SQL upsert would work, but expiry has to be hand-built and it isn't what anyone reaches for first.
- **`@upstash/ratelimit`:** the obvious library, but its Lua scripts start with `#!lua flags=allow-key-locking`, an Upstash-only flag that stock Redis rejects. Locally, every check failed and quietly fell back to memory.

## Decision

`lib/ratelimit.ts` picks a store:

- **`redis`** when `UPSTASH_REDIS_REST_URL`/`TOKEN` or Vercel's `KV_REST_API_URL`/`TOKEN` are set. A fixed one-hour window per IP, counted by one Lua script (`INCR`, `PEXPIRE` on the first hit, `PTTL`): the rate-limiter pattern from the [Redis `INCR` docs](https://redis.io/docs/latest/commands/incr/#pattern-rate-limiter). One command per request. Clients already over the limit are remembered in memory until their window ends, so they cost nothing.
- **`memory`**, per instance: the fallback when Redis errors or takes longer than a second. The limiter failing must never take the API down.
- **`noop`** never limits but still sends every rate-limit header: the default without Redis, so local development needs nothing running.
- `RATE_LIMIT_STORE` forces one of them. Tests use `memory`.

`compose.yml` runs Redis 8 behind [serverless-redis-http](https://github.com/hiett/serverless-redis-http), which serves the same REST API as Upstash, and CI runs the integration tests against the same pair of containers.

## Consequences

- The documented limit is real across instances, and the headers report the shared count.
- Each API request adds one round trip to Upstash. The proxy waits at most a second before falling back.
- The free tier covers about 500,000 API requests a month. Past that, Upstash rejects commands, the memory store takes over, and limits are per instance again until the month resets. Nothing is billed.
- A fixed window allows a burst of up to twice the limit across a window boundary. At 5,000 an hour that's acceptable; a sliding window would cost more commands per request.
- 304 responses still count against the limit. Refunding them is possible now that the count is shared, and is left for later.
