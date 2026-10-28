+++
title = "Caching & Invalidation"
description = "Cache keys, TTLs and stale serving, tiered caches and shields, request collapsing, purge by URL and tag, soft purge, purge limits and billing, and hit ratio."
category = "Hosting & Cloud Industry"
order = 2175
part = "The Edge"
tags = ["caching", "cdn", "edge", "purge", "http", "billing"]
+++

An edge network earns its keep by answering requests without asking the origin. Every answer it gives from cache is latency the visitor doesn't wait for, load the origin doesn't carry and, on most clouds, egress the customer doesn't pay for twice. Every answer it gives wrongly from cache is worse than no cache at all: another user's account page, a price that changed an hour ago, a file a court ordered removed. Caching is the product; invalidation is the liability that comes with it.

For a provider the twist is scale and tenancy. The cache is shared by every customer on the network, the cache key is a configuration the customer writes and the provider enforces, and the purge API is a control-plane path that millions of zones can call at once, so it is rate-limited, sometimes billed, and asynchronous in ways customers misread. This chapter covers how the cache key is built, how freshness and revalidation work at a shared cache, what must never be cached, request collapsing, tiered caches and shields (and how each provider bills them), purge by URL, tag, prefix, host and everything, soft versus hard purge, purge limits and purge billing, takedowns that must reach cached copies, hit ratio accounting, and multi-CDN with a shared shield, then extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with cache policies, tiering and purge records. The generic engineering (cache patterns, stampedes, layers) is the playbook's [Application Caching](/docs/architecture/application-caching) and [HTTP Caching](/docs/requests/caching); how the edge bills the bytes a cache serves is [The Edge Business](/books/hosting-and-cloud/edge-business#how-cdn-pricing-works).

## How the Providers Do It

As of October 2026:

| Provider | Cache key | Freshness defaults | Tiers | Purge | Purge limits and price |
| --- | --- | --- | --- | --- | --- |
| **Cloudflare** | Scheme, host and URI with query string, plus `Origin` and a set of override headers; custom keys (query, headers, cookies, host, device, country, language) on Enterprise; query sorting and device type on all plans | No HTML or JSON by default; caches by file extension; without origin headers 200, 206 and 301 for 120 minutes, 302 and 303 for 20, 404 and 410 for 3 | Smart Tiered Cache on all plans; Generic Global, Regional and Custom topologies on Enterprise | URL, cache tag, hostname, prefix, everything, on all plans; "invalidation" marks stale instead | Token buckets per account: bulk methods 5 a minute (Free) to 50 a second (Enterprise); single URLs 800 to 3,000 a second |
| **Akamai** | Hostname and path required, query string by default, headers, cookies and variables optional | Origin `Cache-Control` and `Expires` ignored unless the property honors them; `Edge-Control` "generally deprecated" but takes precedence | Tiered Distribution: parent servers near the origin, Global or Local maps | Fast Purge by URL, ARL, CP code or cache tag, as invalidate or delete | "In just seconds"; CP code purge suggested above 10,000 objects; no public price |
| **Fastly** | `req.url` and `req.http.host` in `vcl_hash`, plus a generation constant; `Vary` preferred over editing the hash | `Surrogate-Control` first, then `s-maxage`, `max-age`, `Expires`; default 2 minutes; stale directives default to 0 | Shielding: one designated shield POP per backend | URL, surrogate key, purge all (always hard); soft purge for URL and key | "An average of 100,000 purges per hour, per customer"; one key counts once whatever it tags; "<150ms mean purge time" (vendor claim) |
| **Amazon CloudFront** | Cache policy: up to 10 headers, 10 cookies and 10 query strings by default; origin request policy forwards values without keying on them | 24 hours unless the origin or the policy says otherwise | Regional edge caches, then Origin Shield in one of 14 Regions | Paths with a trailing `*`, and tags with a `#` prefix once `CacheTagConfig` is set | 150 paths or tags a second, one wildcard a second; first 1,000 paths or tags a month free per account, then $0.005 each |
| **Google Cloud CDN** | Host, protocol and query string by default, behind the global external Application Load Balancer | `CACHE_ALL_STATIC` by default; default and client TTL 3,600 s, max 86,400 s, serve-while-stale 86,400 s | Cache fill from the origin is a billed meter ($0.01 per GiB in North America) | Path prefix, host, and up to 10 `Cache-Tag` values per request | 500 invalidation requests a minute, about 10 seconds to take effect; meant for "exceptional circumstances" |
| **Bunny** | Pull zone settings | Origin `Cache-Control` | Origin Shield, or Perma-Cache in a storage zone, never both | Exact URL, prefix URL, `CDN-Tag` tag, full zone | Exact 120-token burst at 5 a second; prefix and full zone 20 at 0.5 a second; HTTP 429 past it |

Three patterns run through the table:

- **Every provider separates "keyed" from "forwarded."** What makes two requests the same object (the cache key) and what the origin needs to see (the forwarded request) are two settings, because conflating them is how hit ratios collapse and how cache poisoning works.
- **Purge is universal, fast and rationed.** Every provider purges by URL and by some kind of tag in seconds, and every one rate-limits it per account, because a purge fans out to every location and a purge storm is a control-plane outage.
- **The extra tier is sold as savings and billed as traffic.** Fastly counts shield traffic as requests and bandwidth, CloudFront bills Origin Shield per request when it is an extra layer, Google bills cache fill per GiB; Cloudflare's Smart Tiered Cache is on every plan.

## How Caching and Invalidation Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| Jan 1996 | Harvest's hierarchical object cache (USENIX ATC '96): caches that query neighbors and parents | Every university fetched the same pages across slow links | Hierarchy to configure; the authors claimed it added no measurable latency |
| May 1996 | HTTP/1.0 (RFC 1945): `Expires`, `If-Modified-Since`, `304 Not Modified` | No way to say how long a response is good, or to check it cheaply | Freshness by absolute date, so clock skew mattered |
| Jan 1997 | HTTP/1.1 (RFC 2068) defines `Cache-Control`, `ETag`, `If-None-Match` and `Vary`; RFC 2616 replaces it in June 1999 | Relative lifetimes, opaque validators, content negotiation in the cache | Many more ways to get caching wrong |
| Sep 1997 | ICP version 2 (RFC 2186), from the Harvest project and implemented in Squid | Finding an object in a neighboring cache | Query traffic between caches; Squid and NetCache were Harvest's two forks |
| 4 Aug 2001 | ESI 1.0 and the Edge Architecture Specification (`Surrogate-Control`, `Surrogate-Capability`), W3C Notes from Akamai, Oracle and others | Pages that are mostly cacheable with personal fragments; telling a CDN something different from the browser | Templates split into fragments; a markup language only some surrogates speak |
| Sep 2006 | Varnish 1.0, an HTTP accelerator sponsored by the newspaper Verdens Gang, BSD-licensed | A fast, programmable reverse-proxy cache | A configuration language (VCL) to learn and a cache tier to operate |
| May 2010 | RFC 5861: `stale-while-revalidate` and `stale-if-error` | Visitors waiting on revalidation, and errors when the origin is down | Users see content that is knowingly out of date |
| Jul 2017 | Web cache deception (Omer Gil, Black Hat USA, 26 Jul 2017) | (The attack) a dynamic page cached as a static asset | Content-type checks at the edge |
| 9 Aug 2018 | "Practical Web Cache Poisoning" (James Kettle, PortSwigger) | (The attack) unkeyed request headers changing a cached response | Cache keys audited header by header |
| Jun 2022 | RFC 9111 (HTTP Caching), RFC 9211 (`Cache-Status`) and RFC 9213 (`CDN-Cache-Control`, written by Akamai, Fastly and Cloudflare authors) | One current caching spec; a standard debug header; a standard CDN-only lifetime | Each vendor's older headers still in use beside the standard ones |
| 15 Sep 2025 | The open-source Varnish Cache project announces a rename to Vinyl Cache; Varnish Software keeps a Varnish Cache distribution | A naming dispute between the project and the company | Two projects with renamed paths and packages; Vinyl Cache 9.1.0 shipped 16 Sep 2026 |

## The Cache Key

The cache key is the identity of a cached object. RFC 9111 builds the primary key from the request method and target URI and lets `Vary` add request headers as a secondary key, so one URL can hold several responses. Every CDN starts there and then lets the customer add and remove parts:

- **Host and scheme.** Fastly hashes `req.url` and `req.http.host`; Google includes host, protocol and query string by default; CloudFront under **Match Viewer** caches one copy for HTTP and HTTPS requests. Two hostnames serving the same files (a bare domain and `www`, a vanity domain and the platform's) are two caches unless the key says otherwise.
- **Query strings.** Ignoring every query parameter maximizes hits and breaks any URL whose parameters change the response; keying on all of them lets tracking parameters fragment the cache. The provider controls are include lists, exclude lists and sorting: Cloudflare sorts and ignores query strings on all plans and customizes them on Enterprise; CloudFront keys only on the query strings a cache policy names; Google can't invalidate one query-string variant without the others.
- **Headers and cookies.** Each header in the key multiplies the variants. CloudFront allows 10 headers, 10 cookies and 10 query strings per cache policy by default, says caching on `User-Agent` or `Date` would forward "significantly more requests" to the origin, and replaces `User-Agent` with `Amazon CloudFront` unless it is keyed. Cloudflare's restricted headers such as `accept` and `user-agent` can be keyed only on 1 to 10 specific values.
- **Device class and geography.** Instead of keying on `User-Agent`, providers classify it: CloudFront sets `CloudFront-Is-Mobile-Viewer`, `CloudFront-Is-Tablet-Viewer`, `CloudFront-Is-Desktop-Viewer` and `CloudFront-Is-SmartTV-Viewer`; Cloudflare caches by device type on all plans and by country and language on Enterprise.
- **`Vary`.** The origin's way to say which request headers changed the response. CloudFront passes some `Vary` values to viewers and strips the rest, and treats `Vary: *` with a zero minimum TTL as "forward every request"; Google doesn't cache responses whose `Vary` value is outside its allowed list; Fastly calls `Vary` "generally a better technique than modifying the hash." Compression is the common case, normalized at the edge ([Vary and the Cache Key](/docs/requests/http-compression#vary-and-the-cache-key)): CloudFront forwards a normalized `Accept-Encoding` when the request accepts gzip or br.

The second half of the design is the forwarded request. CloudFront makes it two objects: a **cache policy** for the key and an **origin request policy** for what the origin receives, with every keyed value forwarded automatically and the origin request policy adding values "that you want to include in origin requests, but *not* include in the cache key." AWS's own line is the rule: "Including fewer values in the cache key increases the likelihood of a cache hit." The general rules for key design are the playbook's [Keys](/docs/architecture/application-caching#keys); the edge-specific one is that a value the origin reads but the key ignores is a poisoning risk, covered below.

## Freshness, Validation and Stale Serving

Freshness decides whether a stored response may be used without asking the origin. RFC 9111's directives, as an edge applies them:

| Directive | Meaning at a shared cache |
| --- | --- |
| `max-age=N` | Stale after N seconds of age |
| `s-maxage=N` | Overrides `max-age` and `Expires` for shared caches only, and implies revalidation once stale |
| `private` | "A shared cache MUST NOT store the response" |
| `no-store` | Don't store any part of the request or response |
| `no-cache` | May store, must validate with the origin before each reuse |
| `must-revalidate` | Once stale, never reuse without validation; return an error if the origin is unreachable |
| No explicit lifetime | Heuristic freshness from `Last-Modified`: "A typical setting of this fraction might be 10%" |

`Age` reports how long a response has sat in caches; its presence means it didn't come straight from the origin. Lifetimes meant only for the CDN have three generations of headers. The Edge Architecture Specification's `Surrogate-Control` (2001) let an origin "dictate how surrogates should handle response entities"; Fastly still reads it first, before `s-maxage`, `max-age` and `Expires`, and strips it before the response reaches the user. Akamai's `Edge-Control` is "generally deprecated" but still overrides `Cache-Control` and `Expires`. RFC 9213's `CDN-Cache-Control` standardized the idea in June 2022: a CDN that uses it ignores `Cache-Control` and `Expires` for that response, and a cache may prefer its own named field (an `ExampleCDN-Cache-Control`) ahead of the generic one.

Defaults differ more than customers expect, and they decide what happens when the origin sends no headers at all: Fastly applies 2 minutes; CloudFront 24 hours; Google 3,600 seconds under `CACHE_ALL_STATIC`, which also skips `text/html` and `application/json` without explicit headers; Cloudflare caches by file extension, not HTML or JSON, with status-code TTLs from 3 to 120 minutes; Akamai ignores origin headers until the property is told to honor them. A provider's default is a product decision with a blast radius, and it belongs in the cache policy record, not in code.

**Revalidation** replaces a full fetch with a conditional one. CloudFront sends `If-None-Match` with the stored `ETag` or `If-Modified-Since` with `Last-Modified`, and the origin answers `304` with no body; Cloudflare reports such hits as `REVALIDATED`. Two traps: CloudFront doesn't send conditional requests when it forwards cookies, and Cloudflare converts strong ETags to weak ones unless a cache rule says to respect them. The validator mechanics are the playbook's [Validators](/docs/requests/caching#validators-etag-and-last-modified).

**Stale serving** trades correctness for availability. RFC 5861's `stale-while-revalidate=N` serves the stale copy while one background fetch refreshes it, and `stale-if-error=N` serves it when the origin returns 500, 502, 503 or 504. Cloudflare labels the first `UPDATING` and serving through an unreachable origin `STALE`; Google serves stale content for up to 86,400 seconds by default if the origin is unreachable; Fastly reads both directives from `Surrogate-Control` or `Cache-Control` with defaults of 0; CloudFront serves an expired object when the origin is unavailable, unless it has already been evicted.

## What Must Never Be Shared

A browser cache serves one user; an edge cache serves everyone, so the rules differ. RFC 9111 forbids a shared cache from reusing a response to a request that carried `Authorization` unless the response explicitly allows it (`public`, `s-maxage` or `must-revalidate`). The providers' defaults follow: Cloudflare won't cache a response with `Set-Cookie`, or `Cache-Control` of `private`, `no-store`, `no-cache` or `max-age=0`, or any method but `GET`; Google won't cache `Set-Cookie` responses, `private` or `no-store` responses, or requests with `Authorization` unless the response permits it. The generic list is the playbook's [Never Cache](/docs/architecture/application-caching#never-cache).

> [!WARNING]
> Cache overrides switch these protections off. Google's `FORCE_CACHE_ALL` caches every successful response "regardless of origin `Cache-Control` or `Expires` headers," and CloudFront, when cookies are enabled for a cache behavior, "caches both the object and the cookies." A cache-everything rule on a path that ever serves a logged-in page will serve one user's page, and their session cookie, to the next visitor.

Two attack classes turn key design into a security property:

- **Web cache deception** (Omer Gil, Black Hat USA, July 2017). The attacker gets a logged-in victim to open `/account/foo.css`; the origin ignores the suffix and returns the account page; the edge sees a `.css` extension and caches it; the attacker fetches the same URL. It needs a framework that serves a dynamic page for a path with an extra static-looking suffix and a cache that decides by extension. Cloudflare's Cache Deception Armor keeps caching static assets but refuses to cache when the extension doesn't match the response `Content-Type` (`/newsfeed/foo.jpg` answered with `text/html`).
- **Cache poisoning** (James Kettle, 9 Aug 2018). The attacker sends a request with an input the cache doesn't key on, such as `X-Forwarded-Host`, that changes the response (a script URL, a redirect); the cache stores the altered response and serves it to everyone. Kettle's point is that "any difference in the response triggered by an unkeyed input may be stored and served to other users," and his most robust defense is not caching; the practical one is stripping or keying every input the origin reads. Cloudflare's default key includes `x-forwarded-host`, `x-host`, `x-original-url`, `x-rewrite-url`, `forwarded` and the method-override headers for exactly this reason.

## Request Collapsing

When a popular object expires, every location that receives a request for it at the same moment would fetch it from the origin at once: the cache stampede the playbook describes in [Stampedes](/docs/architecture/application-caching#stampedes). Edges collapse those requests:

- **CloudFront** pauses additional requests with the same cache key while the first is in flight and answers them all from the one response; the first is logged as `Miss` and the collapsed ones as `Hit`. It only collapses requests that share a key, and collapsing can be prevented per object only with a zero minimum TTL and `private`, `no-store`, `no-cache`, `max-age=0` or `s-maxage=0` from the origin.
- **Fastly** puts concurrent misses on a waiting list. A response that can't be shared (marked `private`, or passed) leaves a **hit-for-pass** marker so later requests stop queueing behind it; the marker defaults to 2 minutes and follows the response TTL within 2 minutes to 1 hour. Without that marker, queued requests reach the origin one at a time. **Clustering** forwards each object's fetch to the one server in a POP responsible for it, so collapsing works across the POP, and shielding extends it across POPs.
- **Google Cloud CDN** coalesces concurrent cache fills for the same key into one origin request per edge node by default; chunk requests are always coalesced, and item coalescing can be turned off for latency-sensitive traffic.

Collapsing is why "uncacheable" needs to be declared up front: a response the edge only discovers is private serializes everyone waiting for it. Fastly's advice is to pass requests known to be uncacheable before they ever join a queue.

## Tiered Caches and Shields

A single tier of edge caches multiplies origin load by the number of locations: each one misses independently. A second tier makes the edge caches ask a smaller set of caches first, so the origin sees one miss per upper-tier cache, or one in total with a single shield. It also makes the edge's purge harder (two tiers to clear) and its bill different (traffic between tiers).

| Provider | Lower tier asks | Who chooses the upper tier | How the extra tier is billed |
| --- | --- | --- | --- |
| **Cloudflare** | An upper-tier data center; "only an upper tier can request content from the origin" | Smart: one upper tier per origin by latency (all plans); Generic Global: consistent hash of the cache key; Regional: a hub before the upper tier; Custom: with the account team | Tiered Cache on every plan; region hints at no extra cost |
| **Akamai** | Parent servers near the origin (Tiered Distribution) | The customer picks a Global map (more parents, lower latency, less offload) or a Local map for one region (fewer parents, more offload) | Contract |
| **Fastly** | One shield POP per backend | The customer designates it | Shield traffic "will count towards your request count and billable bandwidth," nearly double in the worst case, though it "will often reduce costs overall" |
| **CloudFront** | A regional edge cache, then Origin Shield | AWS places RECs; the customer enables Origin Shield per origin in one of 14 Regions | Per 10,000 requests to Origin Shield as an incremental layer: all dynamic requests (including `GET` and `HEAD` with TTL under 3,600 s), and cacheable misses from RECs in other Regions |
| **Google Cloud CDN** | Not covered on the pages opened | Not covered on the pages opened | Cache fill $0.01 per GiB in North America, next to cache egress at $0.08 per GiB for the first 10 TiB |
| **Bunny** | Origin Shield, or Perma-Cache (a storage zone checked on every miss) | The customer, one or the other | Not stated on the pages opened |

CloudFront's design shows what each tier is for. Regional edge caches have "a larger cache than an individual POP," so long-tail objects survive after POPs evict them; proxy methods and dynamic requests skip them; Origin Shield adds one more layer so that requests are "consolidated with other requests for the same object, resulting in as few as one request going to your origin." Requests from the REC in the shield's own Region skip the shield and aren't charged for it. Its costing formula is the one to copy: cacheable requests times the miss rate, times the share arriving from other Regions, times the per-request price.

Fastly's note on shielding is the one every implementer rediscovers: edge code "typically executes twice," once at the visitor's POP and once at the shield, so origin-bound changes belong at the shield (`req.backend.is_origin` in VCL, `shield.runningOn()` in Compute), client-facing ones at the edge, and everything must be idempotent. Where a provider runs edge functions on origin-facing events, the shield also decides where they run: CloudFront runs Lambda@Edge origin request and origin response triggers in the Origin Shield Region. Edge functions are the Functions, Isolates & Edge Compute chapter's topic.

## Purge and Invalidation

Purging removes or invalidates cached copies before they expire. The methods, and what each is for:

| Method | Targets | Typical use | Notes |
| --- | --- | --- | --- |
| **URL** | One exact URL | A changed file | CloudFront paths are case sensitive and include query strings if those are keyed; header and cookie variants can't be purged selectively |
| **Tag** (surrogate key, cache tag) | Every object whose response carried the tag | A product, an author, a user, a template | Fastly's `Surrogate-Key` (keys up to 1,024 bytes, header up to 16,384); CloudFront's configured header, 50 tags per object, purged with `#tag`; Google's `Cache-Tag`, 50 per object; Bunny's `CDN-Tag`, 1,024 bytes; Akamai cache tags |
| **Prefix** (wildcard) | A path and everything under it | A directory, a video's segments | CloudFront's `*` only as the last character; Google's `/pictures/*`; Bunny prefix purges in a slower bucket |
| **Hostname** | Everything on one host | One tenant on a shared zone | Cloudflare and Google (host matcher) |
| **Everything** | The whole zone or service | Emergencies, key changes | Fastly's purge all is always hard; Fastly's hash includes a generation constant that "only changes when a purge all operation is performed," so purge-all is a counter bump, not a sweep |

**Soft versus hard.** A hard purge makes objects unusable, so the next request goes to the origin. A soft purge marks them stale, so they can still be served while revalidating or "when origin servers are down" (Fastly, for URL and key purges). Cloudflare's equivalent is **invalidation**: content is marked stale, revalidated on the next request, and reused if unchanged; it counts against the same limits as purge. Akamai's Fast Purge has the same pair as invalidate and delete. Soft is the default I want for content updates: a purge storm or an origin outage then degrades to stale content, not to an origin flood. Hard is for content that must not be served again: a takedown, a leaked file, a poisoned entry.

**Acknowledgment is not eviction.** Every provider's purge is asynchronous, and the API answer means less than it looks. Cloudflare: "A successful purge request returns `HTTP 200`," which only shows the request was received; verify by fetching the URL and checking `CF-Cache-Status` is no longer `HIT`. Akamai: instructions reach edge servers within seconds but "the final confirmation of completion takes time to arrive." Google: an invalidation may be reported complete before a few caches have processed it. CloudFront: `GetInvalidation` reports status for paths and tags. A provider's purge record therefore has three times (requested, acknowledged, completed) and the customer's has a fourth (verified by re-fetch), which is the shape UGP's [Takedowns and Cache Purges](/books/user-generated-platforms/storage-and-delivery#takedowns-and-cache-purges) uses on the customer side.

**Versioned URLs beat purges for deploys.** CloudFront recommends file versioning over invalidation for frequent updates (it also reaches browser and corporate proxy caches, which purges don't), and Google calls invalidation a tool for "exceptional circumstances, not as part of your normal workflow," warning that a large invalidation sends a traffic spike to the backends. Content-hashed asset names with year-long lifetimes, and tag purges for the HTML that references them, is the combination the rest of this chapter assumes; the playbook's [Invalidation](/docs/architecture/application-caching#invalidation) and [Caching](/docs/frontend/web-performance#caching) cover the application side.

## Purge Limits and Purge Billing

Purge fans out to every location, so providers ration it. As of October 2026:

| Provider | Limit | Billing |
| --- | --- | --- |
| **Cloudflare** | Per account, token buckets. Tag, hostname, prefix and everything: Free 5 a minute (bucket 25), Pro 5 a second (25), Business 10 a second (50), Enterprise 50 a second (500), 100 operations per request. Single URL: Free 800 URLs a second, Pro and Business 1,500, Enterprise 3,000 with 500 URLs per request; zones on one plan share the limits | Rate limits by plan; no per-purge price on the page opened |
| **Fastly** | URL and key purges "an average of 100,000 purges per hour, per customer," outside API rate limits; purge all counts against API limits | Not metered on the page opened |
| **CloudFront** | 150 paths or tags a second; 1 wildcard invalidation a second; no limit on files per tag or wildcard | First 1,000 paths or tags a month free per AWS account, across all distributions; then $0.005 each; a wildcard or tag counts as one path however many files it clears |
| **Google Cloud CDN** | 500 invalidation requests a minute; up to 10 tags per request | Not stated on the pages opened |
| **Bunny** | Per account and purge type: exact URL and tag 120-token burst refilling 5 a second; prefix and full zone 20 refilling 0.5 a second; HTTP 429 past it | Not stated on the pages opened |
| **Akamai** | No public numeric limits; CP code purges suggested above 10,000 objects | Contract |

Two design lessons follow. A token bucket per account (Cloudflare and Bunny describe theirs) allows a deploy's burst and caps a runaway loop; separate buckets for single-URL and bulk methods keep a tag-purge storm from blocking URL purges. And per-path pricing (CloudFront) prices the request, not the work: `/*` costs the same $0.005 as one file, which rewards coarse purges that empty the cache, the opposite of what an origin wants. A provider that bills purges should bill per call or per tag, not per object, and should say so on the pricing page.

## Takedowns and Cached Copies

A cache is also a legal category. The DMCA's caching safe harbor, 17 U.S.C. 512(b)(2)(E), obliges a provider to remove or disable cached material expeditiously only if the material "has previously been removed from the originating site or access to it has been disabled," or a court has ordered that, and the notice says so. The DSA's caching exemption (Article 5(1)(e)) has the same trigger: the provider "acts expeditiously to remove or to disable access to the information it has stored" once it learns the source removed it or an authority ordered removal, and Recital 29 places "the sole provision of content delivery networks, reverse proxies or content adaptation proxies" in the caching tier. The law, and the blocking orders that go beyond it, are the Conduits, Caches & Blocking Orders chapter's subject.

The engineering consequence is that a takedown purge is a different object from a deploy purge: it is hard, not soft; it is tied to the notice or case that caused it; it has a deadline; and it isn't done until a re-fetch from more than one location shows no hit. When the customer is a platform, its side of the same purge is UGP's `cdn_purges`; when the provider acts on its own notice for a pass-through site, the provider's record must carry the notice. Purging only what's cached doesn't stop the origin from refilling it, so a provider acting on an order also blocks the URL at the edge, and a platform answers with a tombstone or a 451 ([Takedowns and Cache Purges](/books/user-generated-platforms/storage-and-delivery#takedowns-and-cache-purges)).

## Hit Ratio and Cache Analytics

"Hit ratio" is at least three numbers, and customers compare providers on whichever looks best:

- **Request hit ratio at the edge:** edge hits over all cacheable requests. Inflated by collapsed requests (CloudFront logs them as `Hit`) and by tiny objects.
- **Byte hit ratio:** bytes served from cache over bytes served. The one that maps to the origin's egress bill.
- **Origin offload:** one minus origin requests (or bytes) over edge requests (or bytes). The one that maps to origin capacity, and the only one a tiered cache can't confuse.

Tiers confuse the first. Fastly: a request that misses at the edge and hits at the shield counts as a miss and a hit; one that reaches the origin counts as two misses; so the reported ratio "may therefore look lower than expected," and it recommends computing from raw stats. CloudFront logs shield hits as `OriginShieldHit` in `x-edge-detailed-result-type`, except a request routed to the REC acting as shield, which logs as `Hit`. Cloudflare marks tiered fills with `CacheTieredFill` in its `http_requests` logs and reports per-request outcomes in `CF-Cache-Status` (`HIT`, `MISS`, `EXPIRED`, `STALE`, `BYPASS`, `REVALIDATED`, `UPDATING`, `DYNAMIC`, `NONE/UNKNOWN`), where `BYPASS` means eligible but the origin's response wasn't cacheable and `DYNAMIC` means never eligible. RFC 9211's `Cache-Status` standardizes the shape: one list member per cache from origin to user, with `hit`, or `fwd` and a reason (`bypass`, `method`, `uri-miss`, `vary-miss`, `miss`, `request`, `stale`, `partial`), plus `fwd-status`, `ttl`, `stored`, `collapsed`, `key` and `detail`. My rule is to log the RFC 9211 shape per tier internally whatever each product's header says, so every ratio is computable from the same rows.

Real-time logs are their own product. CloudFront charges $0.01 per million log lines for real-time logs (standard logs are free); Fastly streams logs to S3, syslog and other endpoints "in near-real-time" on "a best-effort basis," with records rarely dropped to protect the platform. Analytics built on sampled or best-effort logs need to say so next to the number.

## Multi-CDN With a Shared Shield

Customers who split traffic across CDNs (for price, for resilience, for regional reach) multiply origin load: each CDN, and each location within it, misses independently. The fix is to put one shield in front of the origin and make it the origin for every CDN. CloudFront documents the pattern with Origin Shield: fewer redundant origin requests, "a common cache key across CDNs, and centralized management for origin-facing features," and traffic from other CDNs terminating at a nearby CloudFront location; it also says discounted multi-CDN pricing needs a sales conversation and "additional charges may apply."

The costs are the ones this chapter has already named: the shield's provider bills every other CDN's misses as its own requests and egress; purges must fan out to every CDN's edges and to the shield, in the right order (shield first, so edges don't refill from stale shield copies); and hit ratios must be computed across providers from logs, since each reports its own. A purge record that can name several targets and track each one's completion is what makes multi-CDN takedowns provable.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Short TTLs, no purge** | Everything expires in seconds or minutes | No invalidation system; correctness bounded by the TTL | Origin load scales with locations; every expiry is a stampede risk | Any CDN | Highest origin egress and compute | APIs, rapidly changing pages |
| **Versioned, immutable URLs** | Content-hashed names, year-long lifetimes, never purged | Perfect hit ratio for assets; reaches browser and proxy caches | Only for assets referenced from something else; HTML still needs another strategy | Build tooling | Lowest; storage for old versions | Static assets everywhere; recommended by CloudFront and Google |
| **Long TTL plus tag purge** | `s-maxage` or `CDN-Cache-Control` for hours or days, tags per entity, purge on change | High hit ratio on HTML and API responses with fast updates | Purge budget and propagation become correctness; a missed tag serves stale data until expiry | Each CDN's tag feature, not portable in header name | Purge limits; per-path billing at CloudFront | News, commerce, CMS-backed sites |
| **Soft purge and stale serving** | Purge marks stale; `stale-while-revalidate` and `stale-if-error` absorb refetches | Origin outages and purge storms degrade to stale content | Users see out-of-date content by design; wrong for takedowns | RFC 5861 plus vendor soft purge | Low | Sites that prefer availability to freshness |
| **Self-run reverse proxy cache** (Vinyl or Varnish Cache, Squid) | The customer or host runs its own cache tier | Full control of keys, VCL logic and purges | Capacity, global placement and DDoS absorption are yours | BSD-2-Clause for Varnish Cache; open source | Servers and operations | Hosts, large publishers, a shield in front of several CDNs |
| **Edge assembly** (ESI or edge functions) | Cache fragments separately, assemble per request | Personal pages with mostly cached parts | Per-request compute; fragment invalidation multiplies | ESI is a 2001 W3C Note; functions are proprietary runtimes | Compute per request | Commerce and portals with logged-in chrome |

## My Default

My default for a site on a CDN is three classes of response, set by the origin, not by edge rules. Assets get content-hashed URLs and `Cache-Control: public, max-age=31536000, immutable`, never purged. HTML and cacheable API responses get a short browser lifetime, a long CDN lifetime in `CDN-Cache-Control` (or `s-maxage` where the CDN doesn't read the targeted field), `stale-while-revalidate` and `stale-if-error`, and a tag per entity they render, with a soft tag purge on every change. Everything personal is `private, no-store` and sent through without a cache lookup. On the edge, the cache key is an allowlist (the query parameters and headers the origin actually reads, nothing else), with one shield near the origin and request collapsing on.

For takedowns and security purges I use a hard purge, record it against the notice, and verify by re-fetch from several locations before closing it. The tradeoff that would change this is the purge budget: if content changes faster than the provider's tag-purge bucket refills (thousands of entities a second on a small plan), I'd move those responses to short TTLs with `stale-while-revalidate` instead of purging, and accept the origin load.

## How to Build It

The chapter adds `cache_policies`, `cache_tierings`, `cache_tier_locations`, `cache_purges` and `cache_purge_progress`, plus cache meters, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Zones and origins are `cdn_zones` and `cdn_origins` from [The Edge Business](/books/hosting-and-cloud/edge-business#how-to-build-it); locations are `edge_locations` from [Networks, Peering & IP Addresses](/books/hosting-and-cloud/networks-peering-and-ip-addresses#how-to-build-it); notices and cases are UGP's `legal_notices` ([Hosting Liability](/books/user-generated-platforms/hosting-liability#how-to-build-it)) and the abuse tables the core model already points at.

```sql
CREATE TABLE cache_policies (            -- one cache rule on a zone, effective-dated
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  cdn_zone_id           UUID NOT NULL REFERENCES cdn_zones (resource_id),
  priority              INT NOT NULL,           -- lower runs first; first match wins
  match_expression      TEXT NOT NULL,          -- host and path pattern in the rules language
  eligibility           TEXT NOT NULL CHECK (eligibility IN ('cache', 'bypass')),
  key_scheme            BOOLEAN NOT NULL DEFAULT TRUE,
  key_host              TEXT NOT NULL DEFAULT 'request_host' CHECK (key_host IN
                          ('request_host', 'origin_host', 'none')),
  key_query             TEXT NOT NULL DEFAULT 'all' CHECK (key_query IN ('all', 'none',
                          'include', 'exclude')),
  key_query_params      TEXT[] NOT NULL DEFAULT '{}',  -- the include or exclude list
  key_query_sorted      BOOLEAN NOT NULL DEFAULT FALSE,
  key_headers           TEXT[] NOT NULL DEFAULT '{}',  -- lowercase names
  key_cookies           TEXT[] NOT NULL DEFAULT '{}',
  key_device_class      BOOLEAN NOT NULL DEFAULT FALSE,
  key_country           BOOLEAN NOT NULL DEFAULT FALSE,
  forward_headers       TEXT[] NOT NULL DEFAULT '{}',  -- sent to origin, not keyed
  forward_cookies       TEXT[] NOT NULL DEFAULT '{}',
  ttl_mode              TEXT NOT NULL CHECK (ttl_mode IN ('respect_origin',
                          'respect_origin_else_default', 'override')),
  default_ttl_seconds   INT CHECK (default_ttl_seconds >= 0),
  min_ttl_seconds       INT NOT NULL DEFAULT 0 CHECK (min_ttl_seconds >= 0),
  max_ttl_seconds       INT CHECK (max_ttl_seconds >= 0),
  status_ttls           JSONB NOT NULL DEFAULT '{}',   -- {"404": 180, "301": 7200}
  targeted_header       TEXT,                          -- 'CDN-Cache-Control', 'Surrogate-Control'
  stale_while_revalidate_seconds INT NOT NULL DEFAULT 0,
  stale_if_error_seconds INT NOT NULL DEFAULT 0,
  collapse_requests     BOOLEAN NOT NULL DEFAULT TRUE,
  deception_check       BOOLEAN NOT NULL DEFAULT TRUE, -- extension must match Content-Type
  valid_during          TSTZRANGE NOT NULL,
  created_by            TEXT NOT NULL,                 -- typed actor
  CHECK (ttl_mode = 'respect_origin' OR default_ttl_seconds IS NOT NULL),
  CHECK (key_query IN ('include', 'exclude') OR key_query_params = '{}'),
  EXCLUDE USING GIST (cdn_zone_id WITH =, priority WITH =, valid_during WITH &&)
);

CREATE TABLE cache_tierings (            -- how misses travel from edge to origin
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  cdn_zone_id           UUID NOT NULL REFERENCES cdn_zones (resource_id),
  origin_id             UUID REFERENCES cdn_origins (id),  -- null: every origin of the zone
  topology              TEXT NOT NULL CHECK (topology IN ('none', 'latency_selected',
                          'hashed_global', 'regional_hub', 'single_shield', 'custom')),
  sku_id                UUID REFERENCES skus (id),        -- when the tier is a paid feature
  valid_during          TSTZRANGE NOT NULL,
  created_by            TEXT NOT NULL,
  EXCLUDE USING GIST (cdn_zone_id WITH =, (COALESCE(origin_id::text, '')) WITH =,
    valid_during WITH &&)
);

CREATE TABLE cache_tier_locations (      -- the upper tiers, hubs and shields
  cache_tiering_id      UUID NOT NULL REFERENCES cache_tierings (id),
  edge_location_id      TEXT NOT NULL REFERENCES edge_locations (id),
  role                  TEXT NOT NULL CHECK (role IN ('upper_tier', 'regional_hub',
                          'shield', 'failover_shield')),
  PRIMARY KEY (cache_tiering_id, edge_location_id)
);

CREATE TABLE cache_purges (              -- every purge the provider accepted or refused
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  cdn_zone_id           UUID NOT NULL REFERENCES cdn_zones (resource_id),
  requested_by          TEXT NOT NULL,     -- 'api_credential:<id>', 'member:<id>',
                                           -- 'staff:<id>', 'system:takedown'
  api_credential_id     UUID REFERENCES api_credentials (id),
  idempotency_key       TEXT,              -- the caller's; a retried purge is one row
  method                TEXT NOT NULL CHECK (method IN ('url', 'tag', 'prefix', 'hostname',
                          'everything')),
  mode                  TEXT NOT NULL CHECK (mode IN ('soft', 'hard')),
  targets               TEXT[] NOT NULL,   -- URLs, tags, prefixes or hostnames as sent
  rate_limit_bucket     TEXT NOT NULL CHECK (rate_limit_bucket IN ('single_url', 'bulk')),
  reason                TEXT NOT NULL CHECK (reason IN ('content_update', 'deploy',
                          'takedown', 'legal_order', 'security', 'customer_request',
                          'provider_incident')),
  legal_notice_id       UUID REFERENCES legal_notices (id),
  moderation_case_id    UUID REFERENCES moderation_cases (id),
  due_at                TIMESTAMPTZ,       -- for takedowns: the notice's clock
  status                TEXT NOT NULL CHECK (status IN ('rejected', 'accepted',
                          'propagating', 'completed', 'partially_completed', 'failed')),
  rejection_reason      TEXT,              -- 'rate_limited', 'invalid_target', 'quota'
  requested_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at       TIMESTAMPTZ,       -- the API's 200: received, nothing more
  completed_at          TIMESTAMPTZ,       -- every location applied it
  verified_at           TIMESTAMPTZ,       -- a re-fetch showed no hit
  CHECK (cardinality(targets) > 0 OR method = 'everything'),
  CHECK (method <> 'everything' OR mode = 'hard'),
  CHECK (reason NOT IN ('takedown', 'legal_order')
         OR (mode = 'hard' AND num_nonnulls(legal_notice_id, moderation_case_id) >= 1)),
  CHECK ((status = 'rejected') = (rejection_reason IS NOT NULL)),
  CHECK (completed_at IS NULL OR completed_at >= requested_at),
  UNIQUE (account_id, idempotency_key)
);

CREATE INDEX cache_purges_open ON cache_purges (due_at)
  WHERE status IN ('accepted', 'propagating', 'partially_completed');

CREATE TABLE cache_purge_progress (      -- per location, so "completed" is a fact
  cache_purge_id        UUID NOT NULL REFERENCES cache_purges (id),
  edge_location_id      TEXT NOT NULL REFERENCES edge_locations (id),
  applied_at            TIMESTAMPTZ,       -- null while pending
  objects_affected      BIGINT,            -- what the location's tag or prefix index matched
  PRIMARY KEY (cache_purge_id, edge_location_id)
);
```

The meters, all `usage_events.meter` values. The delivery meters `cdn.egress_bytes` and `cdn.requests` are The Edge Business's; this chapter needs two dimensions on them, `cache_status` at the visitor-facing location (`hit`, `miss`, `expired`, `stale`, `revalidated`, `bypass`, `dynamic`) and `answered_by`, the layer that produced the response (`edge`, `upper`, `shield`, `origin`), so that hit ratios and shield billing come from the same rows:

| Meter | Unit | Counted when | Example price it rates |
| --- | --- | --- | --- |
| `cache.purge_paths` | path or tag | Each URL, prefix or tag in an accepted purge; a wildcard or tag counts once | CloudFront: 1,000 a month free per account, then $0.005 |
| `shield.requests` | request | Each request reaching a shield as an incremental layer (dynamic, or a miss from another region's tier) | CloudFront Origin Shield, per 10,000 |
| `cache.fill_bytes` | byte | Bytes fetched from the origin into the cache | Google Cloud CDN: $0.01 per GiB in North America |
| `logs.realtime_lines` | line | Each log line delivered to a real-time log destination | CloudFront: $0.01 per million lines |

The included 1,000 paths are an allowance on the plan version (`included` on `plan_versions`), applied across every zone of the account, so rating sums `cache.purge_paths` per account and month before pricing the excess. Purge rate limits are `quotas` rows (`purge.bulk_per_second`, `purge.bulk_bucket`, `purge.urls_per_second`) per plan, enforced by a token bucket in the purge API and refused with a `cache_purges` row of status `'rejected'`, so a customer asking why a purge failed gets the row, not a guess.

Hit ratios come straight from the delivery meters:

```sql
-- Edge hit ratio, tier hit ratio and origin offload for a zone ($1) over a window ($2).
-- Each visitor-facing request is counted once, tagged with the layer that answered it.
SELECT u.meter,
       ROUND(SUM(u.quantity) FILTER (WHERE u.dimensions->>'answered_by' = 'edge')
             / NULLIF(SUM(u.quantity), 0), 4)                    AS edge_hit_ratio,
       ROUND(SUM(u.quantity) FILTER (WHERE u.dimensions->>'answered_by'
               IN ('upper', 'shield'))
             / NULLIF(SUM(u.quantity), 0), 4)                    AS tier_hit_ratio,
       ROUND(1 - SUM(u.quantity) FILTER (WHERE u.dimensions->>'answered_by' = 'origin')
             / NULLIF(SUM(u.quantity), 0), 4)                    AS origin_offload
FROM usage_events u
WHERE u.resource_id = $1
  AND u.meter IN ('cdn.requests', 'cdn.egress_bytes')
  AND u.occurred_during && $2::tstzrange
  AND u.dimensions->>'cache_status' <> 'dynamic'                  -- cacheable traffic only
GROUP BY u.meter;
```

On `cdn.requests` the ratios are request ratios; on `cdn.egress_bytes` they are byte ratios. Counting each visitor request once, by the layer that answered, avoids Fastly's double counting, and origin offload doesn't care how many tiers a request crossed, which is why it is the number a provider should quote when it sells shielding. Traffic between tiers (what Fastly bills and CloudFront's `shield.requests` rates) is metered separately at the upper tier, so billing never has to infer it from visitor rows.

And the takedown rule is a query that should return nothing:

```sql
-- Takedown and legal purges past their clock without completion and verification.
SELECT p.id, p.cdn_zone_id, p.legal_notice_id, p.moderation_case_id, p.due_at,
       p.status, p.completed_at, p.verified_at,
       COUNT(g.*) FILTER (WHERE g.applied_at IS NULL) AS locations_pending
FROM cache_purges p
LEFT JOIN cache_purge_progress g ON g.cache_purge_id = p.id
WHERE p.reason IN ('takedown', 'legal_order')
  AND p.due_at < NOW()
  AND (p.completed_at IS NULL OR p.verified_at IS NULL)
GROUP BY p.id;
```

Notes on the sketch:

- **The key and the forward are separate columns.** `key_*` decides identity; `forward_*` decides what the origin sees. A header in `forward_headers` that changes the response is the poisoning risk, and a review can find every one with a query.
- **Policies are effective-dated rows.** A cache rule that leaked a private page is answered by "which rule matched that path at 14:02," which needs the rule as it was, its author and its priority; the exclusion constraint keeps one rule per priority at a time.
- **Purges are evidence, not fire-and-forget.** Four timestamps and per-location progress separate "received" from "done" from "verified"; a takedown purge can't be soft and can't lack its notice or case, by constraint.
- **Purge-all is a generation bump.** The edge stores a zone generation in every key; purging everything increments it, which is constant time at every location (Fastly's `req.vcl.generation`). Tag and prefix purges need a per-location index from tag or path prefix to objects, and `objects_affected` records what each location's index matched.
- **Tiering is configuration with a SKU.** Where the shield is paid, `cache_tierings.sku_id` names the SKU and `shield.requests` rates it; Smart-style free tiering carries no SKU.
- **Customer-side records stay customer-side.** A platform customer keeps its own `cdn_purges` (UGP); the provider's `cache_purges` is the other end, and `idempotency_key` lets the two be matched.
- **Events:** `cache.policy_changed`, `cache.tiering_changed`, `cache.purge_accepted`, `cache.purge_rejected`, `cache.purge_completed` and `cache.purge_verified` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the zone's audit log, billing and, for takedowns, the abuse desk.

## Auditing

- **Every cache rule, over time, with its author.** When a private page was cached or a poisoned entry spread, the first question is which rule matched, what it keyed on and what it forwarded, as it was at that moment.
- **Every purge, accepted or refused.** Who asked, with which credential, what it targeted, soft or hard, the bucket it drew from, and when it was acknowledged, completed everywhere and verified.
- **Takedown purges against their notices.** For each removal notice or order, the purge that answered it, its clock, its completion and the verification fetch, reproducible for a regulator or a court.
- **Shield and purge billing from events.** `shield.requests`, `cache.purge_paths` and `cache.fill_bytes` rated from `usage_events` with `answered_by` and `cache_status` dimensions, so a disputed bill can be recomputed.
- **Hit ratio claims from the same rows.** Edge hit ratio, byte hit ratio and origin offload computed from one log shape, so the number in a sales deck is the number in the customer's dashboard.

## What This Means for the System You Build

- **Key on an allowlist,** forward separately, and treat every unkeyed input the origin reads as a poisoning bug.
- **Never cache what carries a session:** honor `private`, `Set-Cookie` and `Authorization`, check extensions against content types, and fence off any cache-everything override.
- **Version assets, tag pages, soft-purge updates,** and keep hard purges for takedowns and security.
- **Record purges with four times** and per-location progress; an API 200 is a receipt, not an eviction.
- **Ration purges with token buckets** per account and method, refuse with a reason, and bill per call or tag, never per object.
- **Put one shield near the origin,** bill it honestly, and quote origin offload, not a hit ratio the shield distorts.
- **Purge every CDN and the shield** in a multi-CDN setup, shield first, and prove completion for each.

## References

**Specifications**

- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html), June 2022, shared and private caches, the cache key, directives, heuristic freshness, `Age` and `Authorization`
- [RFC 5861: HTTP Cache-Control Extensions for Stale Content](https://www.rfc-editor.org/rfc/rfc5861.html), May 2010, `stale-while-revalidate` and `stale-if-error`
- [RFC 9211: The Cache-Status HTTP Response Header Field](https://www.rfc-editor.org/rfc/rfc9211.html), June 2022, list members, `hit`, `fwd` reasons and parameters
- [RFC 9213: Targeted HTTP Cache Control](https://www.rfc-editor.org/rfc/rfc9213.html), June 2022, `CDN-Cache-Control`, precedence and its Akamai, Fastly and Cloudflare authors
- [RFC 1945: HTTP/1.0](https://www.rfc-editor.org/rfc/rfc1945.html), May 1996, `Expires`, conditional GET and `304`
- [RFC 2068: HTTP/1.1](https://www.rfc-editor.org/rfc/rfc2068.html), January 1997, `Cache-Control`, `ETag`, `If-None-Match` and `Vary`
- [RFC 2616: HTTP/1.1](https://www.rfc-editor.org/rfc/rfc2616.html), June 1999, replacing RFC 2068
- [RFC 2186: Internet Cache Protocol version 2](https://www.rfc-editor.org/rfc/rfc2186.html), September 1997, cache meshes, Harvest origin and Squid
- [W3C: ESI Language Specification 1.0](https://www.w3.org/TR/esi-lang/), 4 Aug 2001 Note, authors and `esi:include`
- [W3C: Edge Architecture Specification](https://www.w3.org/TR/edge-arch/), 4 Aug 2001 Note, `Surrogate-Control` and `Surrogate-Capability`

**History**

- [USENIX ATC '96: A Hierarchical Internet Object Cache](https://www.usenix.org/conference/usenix-1996-annual-technical-conference/hierarchical-internet-object-cache), January 1996, authors and venue
- [Chankhunthod et al.: A Hierarchical Internet Object Cache (paper)](https://www.usenix.org/legacy/publications/library/proceedings/sd96/full_papers/danzig-html/cache.html), hierarchy without added latency and the order-of-magnitude claim
- [Squid: Introduction](http://www.squid-cache.org/Intro/), Squid and NetCache as forks of the Harvest cache
- [Poul-Henning Kamp: Deadline partytime](https://ing.dk/holdning/deadline-partytime), 18 Sep 2006, Varnish 1.0, BSD license and Verdens Gang's sponsorship
- [The Vinyl Cache Project](https://vinyl-cache.org/), the 15 Sep 2025 rename announcement and Vinyl Cache 9.1.0 of 16 Sep 2026
- [Varnish Cache](https://www.varnish.org/), the downstream distribution and its BSD-2-Clause license

**Security**

- [Black Hat USA 2017: Web Cache Deception Attack](https://infocondb.org/con/black-hat/black-hat-usa-2017/web-cache-deception-attack), Omer Gil's talk of 26 Jul 2017 and its abstract
- [PortSwigger: Practical Web Cache Poisoning](https://portswigger.net/research/practical-web-cache-poisoning), James Kettle, 9 Aug 2018, unkeyed inputs and defenses
- [Cloudflare: Cache Deception Armor](https://developers.cloudflare.com/cache/cache-security/cache-deception-armor/), extension and content-type matching

**Providers: keys, freshness and collapsing**

- [Cloudflare: Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/), cached extensions, what isn't cached and status-code TTLs
- [Cloudflare: Cache keys](https://developers.cloudflare.com/cache/how-to/cache-keys/), default key components, custom key options and plan availability
- [Cloudflare: Cache Rules settings](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/), eligibility, TTL modes, strong ETags and Enterprise options
- [Cloudflare: Cache responses](https://developers.cloudflare.com/cache/concepts/cache-responses/), `CF-Cache-Status` values
- [Akamai: Learn about Akamai's caching](https://techdocs.akamai.com/property-mgr/docs/know-caching), cache key elements, honoring origin headers and `Edge-Control`
- [Fastly: Cache freshness](https://www.fastly.com/documentation/guides/concepts/edge-state/cache/cache-freshness/), TTL precedence, the 2-minute default and stale directives
- [Fastly: vcl_hash](https://www.fastly.com/documentation/reference/vcl/subroutines/hash/), the default hash and the generation constant
- [Fastly: Request collapsing](https://www.fastly.com/documentation/guides/concepts/edge-state/cache/request-collapsing/), waiting lists, hit-for-pass and clustering
- [AWS: Control the cache key with a policy](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html), cache policies and the fewer-values rule
- [AWS: Control origin requests with a policy](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-origin-requests.html), origin request policies versus cache policies
- [AWS: Request and response behavior for custom origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorCustomOrigin.html), the 24-hour default, conditional requests, cookies, `Vary`, device headers and request collapsing
- [AWS: CloudFront quotas](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html), cache policy limits and invalidation rates
- [Google Cloud CDN: Caching overview](https://docs.cloud.google.com/cdn/docs/caching), cache modes, defaults, uncached responses, coalescing and serve-while-stale

**Providers: tiers and shields**

- [Cloudflare: Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/), topologies, plan availability and `CacheTieredFill`
- [Akamai: Tiered Distribution](https://techdocs.akamai.com/property-mgr/docs/tiered-distribution), parent servers and Global versus Local maps
- [Fastly: Shielding](https://www.fastly.com/documentation/guides/concepts/shielding/), billing of POP-to-POP traffic, hit ratio effects and double execution
- [AWS: How CloudFront delivers content](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html), regional edge caches and what bypasses them
- [AWS: Use Amazon CloudFront Origin Shield](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/origin-shield.html), Regions, costing formulas, `OriginShieldHit`, multi-CDN use and Lambda@Edge placement
- [Bunny: Perma-Cache](https://bunny.net/docs/cdn/perma-cache), the storage-zone layer and its exclusion with Origin Shield

**Providers: purge**

- [Cloudflare: Purge cache](https://developers.cloudflare.com/cache/how-to/purge-cache/), methods, rate limits by plan, token buckets, the meaning of 200 and invalidation
- [Akamai: Purge](https://techdocs.akamai.com/purge-cache/docs/welcome-purge), invalidate and delete
- [Akamai: Purge mechanisms](https://techdocs.akamai.com/purge-cache/docs/purge-mechanisms), URL, ARL, CP code and cache tag, timing and confirmation
- [Fastly: Purging](https://www.fastly.com/documentation/guides/concepts/edge-state/cache/purging/), purge types, soft versus hard and the 100,000-per-hour limit
- [Fastly: Surrogate-Key](https://www.fastly.com/documentation/reference/http/http-headers/Surrogate-Key/), syntax and size limits
- [Fastly: Network map](https://www.fastly.com/network-map/), the "<150ms mean purge time" claim as of 31 Dec 2025
- [AWS: Invalidate files to remove content](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html), versioning versus invalidation
- [AWS: What you need to know when invalidating paths](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/invalidation-specifying-objects.html), case, query strings, variants and wildcards
- [AWS: Invalidating content by cache tags](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/invalidation-by-tags.html), `CacheTagConfig`, tag format and limits
- [AWS: Pay for file invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PayingForInvalidation.html), the 1,000 free paths per account, wildcards and tags as one path
- [Google Cloud CDN: Cache invalidation overview](https://docs.cloud.google.com/cdn/docs/cache-invalidation-overview), paths, hosts, cache tags, the rate limit and intended use
- [Bunny: Purge cache](https://bunny.net/docs/cdn/purge-cache), purge types, `CDN-Tag` and token-bucket limits

**Pricing**

- [AWS: CloudFront pay-as-you-go pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/), invalidation, Origin Shield, requests and real-time log prices
- [Google Cloud CDN pricing](https://cloud.google.com/cdn/pricing), cache egress, cache fill and lookup prices in North America (viewed 27 Oct 2026)
- [Bunny: CDN pricing](https://bunny.net/pricing/cdn/), per-GB prices and no request fees

**Logs**

- [Fastly: About real-time log streaming](https://www.fastly.com/documentation/guides/integrations/streaming-logs/about-fastlys-realtime-log-streaming-features/), endpoints and best-effort delivery

**Law**

- [17 U.S.C. 512](https://www.law.cornell.edu/uscode/text/17/512), the 512(b)(2)(E) condition for removing cached material
- [DSA Article 5: Caching](https://www.springlex.eu/en/packages/dsa/dsa-regulation/article-5/), conditions and the expeditious-removal trigger
- [DSA Recital 29](https://www.springlex.eu/en/packages/dsa/dsa-regulation/recital-29/), CDNs and reverse proxies in the caching tier
