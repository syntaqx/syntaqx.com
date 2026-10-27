+++
title = "Application Caching"
description = "When a cache earns its place, the patterns for filling and invalidating one, surviving stampedes and cold starts, and what a cache must never be trusted with."
category = "Architecture"
order = 405
tags = ["architecture", "caching", "performance", "redis"]
+++

A cache trades correctness for speed: it answers from a copy that might be out of date. That's a good trade often enough that every system ends up with caches, and a bad one often enough that "cache invalidation" is half of the oldest joke in the industry ([Two Hard Things](https://martinfowler.com/bliki/TwoHardThings.html)). The discipline is deciding how stale each piece of data may be, and making sure the system still works when the cache is empty. This covers caches inside your application (in-process memory, Redis); browsers and CDNs are in [Caching & Conditional Requests](/docs/requests/caching).

## Measure Before You Cache

A cache is a second copy of your data with its own consistency rules, failure modes and memory bill. Add one because a measurement says a specific read is too slow or expensive, and fix the source first: a missing index, an N+1 query or a chatty API call ([Database Performance](/docs/database/performance)) is usually the real problem, and caching hides it. The best candidates are hot, expensive and tolerant of staleness: a pricing table read on every request, a permissions lookup, a slow third-party call.

## Patterns

| Pattern | How it works | Good for |
| ------- | ------------ | -------- |
| **Cache-aside** | Read the cache; on a miss, read the source and fill the cache | The default. Simple, and the cache holds only what's actually read |
| **Read-through** | The cache library loads from the source on a miss | Same as cache-aside, with the loading logic in one place |
| **Write-through** | Writes go to the cache and the source together | Data that's read right after it's written |
| **Write-behind** | Writes go to the cache and reach the source later | Rarely worth it: a cache failure loses writes the source never saw |

Start with cache-aside. Write-behind turns the cache into a database without a database's durability, which is a trade almost nobody should make for data they care about.

## Invalidation

Every cached value needs an answer to "how does this stop being wrong?"

- **TTL.** The entry expires after a fixed time. Self-healing: even if every other invalidation path has a bug, the data is wrong for at most one TTL. Pick it from the business answer to "how stale is acceptable?", and always set one, even alongside other strategies.
- **Explicit invalidation.** The write path deletes the key after updating the source. Fresher, but every write path has to remember, and the one that forgets serves stale data until the TTL saves you.
- **Versioned keys.** Put a version in the key (`pricing:v42`) and bump it on change; old entries are simply never read again and age out. This avoids racing a delete against a concurrent refill, and it's how you invalidate a whole family of keys at once.

Delete on write, don't update on write. Writing the new value into the cache from the write path races with a concurrent reader refilling it from an older read, and the older value can win. Deleting and letting the next read refill is safer.

## Stampedes

A popular key expires, and a thousand requests miss at once and hit the source together, the exact load the cache was there to absorb. Three defenses, usually combined:

- **Request coalescing.** Only one request per key recomputes; the others wait for its result. In-process this is a map of in-flight promises; across instances it's a short lock on the key.
- **Jittered TTLs.** Keys filled at the same time (after a deploy, a flush) expire at the same time. Adding random jitter to each TTL spreads the expiries out.
- **Probabilistic early expiration.** Each reader refreshes slightly before expiry with a probability that rises as expiry approaches, so one request refreshes early instead of all of them at the deadline. Vattani, Chierichetti and Lowenstein's XFetch algorithm does this optimally ([Optimal Probabilistic Cache Stampede Prevention](https://www.vldb.org/pvldb/vol8/p886-vattani.pdf)).

### The Cold Cache

The worse version is the whole cache being empty: a new cluster, a flush, a failover. A system that has quietly come to depend on a 95% hit rate can't serve normal traffic from the source alone, and falls over exactly when it's recovering. Amazon's Builders' Library calls this a cache becoming a critical dependency, and recommends treating it as one ([Caching challenges and strategies](https://builder.aws.com/content/3K9TeXp6strMiJ4vhakpRD7BQWO/caching-challenges-and-strategies)):

- **Load test with the cache empty,** not just warm ([Load & Performance Testing](/docs/quality/load-testing)).
- **Keep serving stale data when the source is down** (a soft TTL that triggers a refresh, and a hard TTL after which the entry is finally dropped).
- **Warm caches gradually** after a deploy, or roll out new instances slowly.

## Negative Caching

A lookup that finds nothing ("no such user") is a result too. Uncached, every request for a missing thing goes to the source, and one client hammering a nonexistent ID can do more damage than all your real traffic. Cache misses with a shorter TTL than hits. Caching a failing dependency's error briefly does the same job, and keeps your retries from deepening its outage.

## Keys

- **Include everything the value depends on.** In a multi-tenant system that means the tenant: a key of `invoice:123` instead of `tenant:abc:invoice:123` is a cross-tenant data leak waiting for two tenants with the same ID ([Multi-Tenancy](/docs/architecture/multi-tenancy)). The same goes for locale, API version and permissions when they change the value.
- **Namespace and version keys** (`app:pricing:v3:...`) so unrelated features can't collide and a format change doesn't read old entries.
- **Never put secrets or personal data in keys.** Keys show up in monitoring and logs.

## What the User Sees

Staleness is a product decision. A minute-old product description is invisible; an account balance that doesn't reflect a payment the user just made is a support ticket. Read your own writes from the source, and cache aggressively only what isn't personal or time-sensitive.

## Never Cache

- **Authorization decisions** without a short TTL and invalidation on role changes: a revoked permission that lingers is a security hole.
- **Anything you can't rebuild from the source.** A cache is disposable by definition. If losing it loses data, it isn't a cache.
- **Secrets and credentials,** except in the process that needs them.

## Layers

| Layer | Speed | Shared | Watch out for |
| ----- | ----- | ------ | ------------- |
| In-process memory | Fastest | No, per instance | Each instance has its own copy, so invalidation has to reach all of them, and serverless instances start cold |
| Redis or similar | A network hop | Yes | One more dependency to keep up, with its own outages |
| CDN and browser | Closest to the user | Yes | Only for HTTP responses, controlled by headers ([Caching & Conditional Requests](/docs/requests/caching)) |

Use the outermost layer that fits. A response a CDN can cache never reaches your application at all.

## References

**Reference**

- [AWS: Caching strategies (ElastiCache)](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html), lazy loading and write-through compared

**In practice**

- [Amazon Builders' Library: Caching challenges and strategies](https://builder.aws.com/content/3K9TeXp6strMiJ4vhakpRD7BQWO/caching-challenges-and-strategies), caches as critical dependencies, coalescing, negative caching, soft and hard TTLs
- [Vattani, Chierichetti, Lowenstein: Optimal Probabilistic Cache Stampede Prevention (VLDB 2015)](https://www.vldb.org/pvldb/vol8/p886-vattani.pdf), the XFetch algorithm for early expiration
- [Martin Fowler: Two Hard Things](https://martinfowler.com/bliki/TwoHardThings.html), the origin of the cache invalidation joke
