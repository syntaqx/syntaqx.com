+++
title = "Collecting Events"
description = "Getting events from devices and servers to the warehouse: batching SDKs, retries with event IDs, two clocks, sampling, page lifecycle, CDPs, late data and cost."
category = "Telemetry & Analytics"
order = 1252
tags = ["telemetry", "analytics", "sdk", "ingestion", "sampling", "data-pipelines"]
+++

An event that was designed well ([Event Design & Instrumentation](/docs/telemetry/event-design)) still has to get from where it happened to a table someone can query, and the path is hostile. A browser tab closes mid-request. A phone goes into a tunnel, or the operating system suspends the app before it can send anything. An ad blocker drops every request to a known analytics host. A user's clock is three hours wrong. A collector deploy returns errors for ninety seconds and ten thousand clients retry at once. A game client sends a thousand position updates a minute and the bill arrives.

None of those is rare, and each one quietly biases the numbers if collection isn't designed for it. This chapter is that design: the client SDK as a durable queue, retries that can't double count, two clocks per event, sampling you can correct for, the browser and mobile lifecycles, first-party and server-side collection, and the path from collector to warehouse, including the data that arrives late. It applies whether the events come from a SaaS dashboard, a checkout, a game, a technician's app or a banking app.

## The SDK Is a Queue

Every serious analytics SDK has the same shape: `track()` appends to a local queue and returns immediately, and a separate loop uploads batches. Nothing on the user's path waits on the network.

- **Persist before acknowledging.** On mobile and desktop, the queue lives on disk (SQLite or a file), so events survive the app being killed. In a browser, an in-memory queue plus `localStorage` or IndexedDB for what hasn't been sent covers most closes and reloads.
- **Flush on whichever comes first:** a count, an interval or a lifecycle moment. Defaults differ by orders of magnitude, which tells you they're tuning choices, not truths. Segment's Kotlin SDK flushes at 20 events or every 30 seconds; Amplitude's browser SDK batches up to 30 events and flushes every second. A dashboard that needs freshness wants the short interval; a battery-powered device on a metered connection wants the long one.
- **Batch to the collector's limits.** Segment's HTTP API takes a maximum of 32 KB per event and 500 KB per batch request, and answers oversized payloads with `400`. Size batches below the limit and split rather than fail.
- **Bound the queue.** A device offline for a week shouldn't fill the disk. Cap the queue by count or bytes, drop the oldest low-value events first, and count what was dropped in a field on the next batch, so the loss is visible in the data instead of silent.

An analytics queue is not the same thing as a sync outbox. The [device outbox](/docs/architecture/offline-sync#the-device-outbox) for business commands must never lose an entry; an analytics queue may drop a scroll event under pressure and say so. That's another reason facts that count (orders, payments, completed jobs) come from the server ([Event Design & Instrumentation](/docs/telemetry/event-design#server-side-or-client-side)), not from the analytics queue.

## Retries Without Double Counting

Uploads fail, so the SDK retries, and a retry after a lost response sends events the collector already has. The answer is the one the playbook gives everywhere: **at-least-once delivery plus an idempotent receiver.**

- **The client generates the event ID** (a [UUID v7](/docs/fundamentals/identifier-conventions)) when the event is created, not when it's sent, and every retry carries the same ID. Segment deduplicates on `messageId` and asks that every event have a unique one "with fewer than 100 characters"; Snowplow's trackers generate the `event_id`; CloudEvents says consumers "MAY assume that Events with identical `source` and `id` are duplicates."
- **Retry what can succeed later:** network errors, `5xx`, and `429`. Segment's API returns `Retry-After` on `429` with the seconds to wait; honor it.
- **Never retry a `400` unchanged.** A malformed or oversized batch will fail forever. Split it, drop or quarantine the bad event, and send the rest.
- **Back off with full jitter** and cap the attempts, per [Retries & Timeouts](/docs/architecture/retries-and-timeouts#exponential-backoff-with-jitter). A collector outage is exactly when millions of clients would otherwise retry in lockstep. Amplitude's browser SDK, for comparison, caps retryable failures at 5 attempts by default.
- **Deduplicate in the pipeline, not only at the edge.** The collector can drop exact repeats it saw recently, but the warehouse model still deduplicates on `event_id` across the whole partition, because retries can land hours apart and on different collector instances.

## Two Clocks

Every client event has at least two times: when the device says it happened and when your server received it. Keep both, name them for what they are, and never let one overwrite the other ([Offline-First Sync](/docs/architecture/offline-sync#two-clocks) makes the same rule for commands).

Device clocks are wrong often enough to matter: dead batteries, manual changes, a game player winding the clock forward for a daily reward. The fix both major event pipelines use is to send a third time, when the batch was sent, and let the skew cancel out. Segment calculates `timestamp = receivedAt - (sentAt - originalTimestamp)`. Snowplow's `derived_tstamp` is "`collector_tstamp` minus the difference between the `dvce_sent_tstamp` and the `dvce_created_tstamp`," and Snowplow recommends it for reporting.

![Plan view of two clock lanes on one true-time axis, 1 second = 4 px. The device clock runs 30 seconds ahead (K1 = 30.00). On the device lane, an event is created at device time O1 = 40.00 and queued offline until it is sent at device time S1 = 120.00, so the dimension Q1 = S1 - O1 = 80.00 is the time in the queue, read entirely on the device clock. On the server lane, the batch is received at server time R1 = 91.00, and the highlighted dimension T1 = R1 - Q1 = 91.00 - 80.00 = 11.00 places the event on the server clock. The true creation time is 10, so the remaining error E1 = 1.00 is the transit time. A variable table defines each code.](/diagrams/tm-collection-clocks.svg "The skew cancels: the time in the queue is measured on one clock, so subtracting it from the server's receive time places the event correctly, wrong only by the transit time (illustrative values; formula from Segment and Snowplow).")

The derivation assumes the device clock didn't change while the event sat in the queue and that transit time is small; Snowplow states both assumptions. It's good enough for analytics. What it isn't good enough for is anything that grants value: a reward cooldown, an offer's expiry or a deadline is checked against the server's clock, always.

Order within a session needs something better than either clock. Give each event a **per-session sequence number** from the SDK; two events in the same millisecond, or a clock that jumped backward, still sort correctly.

## Sampling

Most events should never be sampled. Some should be, because they're plentiful, individually worthless, and expensive: scroll and mouse movement, per-frame performance samples in a game, verbose diagnostic events, high-frequency sensor readings from a vehicle. Sampling them is fine if the result can still be read as a population number.

- **Never sample anything that counts:** revenue, sign-ups, purchases, entitlement grants, anything someone can dispute or that reconciles to a ledger.
- **Sample by unit, deterministically.** Hash the user ID, session ID or match ID and keep the unit if the hash falls under the rate. All of a kept unit's events are kept, so funnels and sessions stay whole. Random per-event sampling keeps the totals right in expectation and destroys every per-user question.
- **Record the rate on every sampled event.** OpenTelemetry's probability sampling defines the adjusted count as "the mathematical inverse (reciprocal) of the sampling probability," so an event kept at 10% counts as 10. Summing adjusted counts gives an unbiased population estimate even when the rate changes mid-week, and keeps a rate change from being mistaken for a change in behavior.
- **Stratify for the rare cases.** If 1% of sessions are kept, the users on an unusual device or plan may vanish. Keep everything for small segments (a new build, a pilot customer, a new region) and sample the rest; then weight each stratum by its own rate.
- **Make rates remote configuration,** per event family and platform, so a noisy event can be turned down without a release, the same mechanism as a [feature flag](/docs/delivery/feature-flags).

Sampling at collection saves the pipeline and storage costs. Sampling in a query (reading 10% of a huge table) only saves query cost, and is a decision for the analyst, not the SDK.

## Web and Mobile Constraints

Browsers don't promise to run your code when a page goes away. Chrome's Page Lifecycle guide says the transition to hidden "is also often the last state change that's reliably observable by developers," that relying on `unload` is "extremely unreliable, especially on mobile," and "Never use the `unload` event on modern browsers"; it also blocks the back/forward cache. So:

- **Flush when the page becomes hidden,** on `visibilitychange` with `document.visibilityState === "hidden"`, and on `pagehide` as a fallback. MDN calls `visibilitychange` "the most reliable way" to send end-of-session analytics.
- **Use `navigator.sendBeacon()`** (or `fetch()` with `keepalive: true`) for that final flush. It queues a small POST that survives the page going away, and its queued data is limited to 64 KiB, so the final batch has to be small. A `true` return means the browser queued it, not that the server got it.
- **Don't count on a session-end event.** Sessions end by timeout in the pipeline after a period of inactivity you choose per product, not by a final event the browser may never send.

Mobile is stricter. iOS and Android suspend backgrounded apps and ration background work ([Offline-First Sync](/docs/architecture/offline-sync#background-execution-is-rationed)), so the SDK flushes when the app goes to the background, persists everything else, and drains on the next launch. Some users are on metered connections: batch larger and less often on cellular, and never upload bulky diagnostics outside Wi-Fi without the user's say.

## Ad Blockers and First-Party Collection

A meaningful share of web users run blockers that drop requests to well-known analytics hosts and scripts. The result is not just fewer events; it's biased events, because blocker use isn't evenly spread across audiences, devices or countries.

Collecting through your own domain reduces the bias. Snowplow's guidance is to "set up your collector to be on the same domain as the website," to change the tracker's default request path because "many ad blockers will block this path," and to rename the tracker script. It also notes that Safari can limit server-set cookie lifetimes "to a maximum of 7 days under some circumstances," even for first-party cookies, which shortens how long an anonymous visitor can be recognized.

My line here is firm: **first-party collection is for reliability, never for getting around a person's choice.** A blocker is not a consent signal, and routing around one doesn't remove any obligation; an analytics SDK that needs consent needs it on your domain too ([Consent & Privacy in Telemetry](/docs/telemetry/consent-and-privacy)). The more robust fix for numbers that matter is the one from [Event Design & Instrumentation](/docs/telemetry/event-design#server-side-or-client-side): record them on the server.

## Server-Side Tracking and CDPs

A customer data platform sits between your sources and the tools that want events. Segment, RudderStack and Snowplow all take events from client and server SDKs and deliver them elsewhere; RudderStack describes collecting with "client and server-side SDKs" and sending events to "200+ third-party tools," and Snowplow loads "your data off the real-time streams into the various destinations." The design choice that matters is where the fan-out happens:

- **Device mode:** the client loads each vendor's SDK and sends to each directly. Every tool adds script weight ([Web Performance](/docs/frontend/web-performance)), every tool sets its own identifiers, and server-side controls don't apply: Segment notes that device-mode destinations bypass its suppression point.
- **Cloud mode:** the client sends one stream to one collector, and the CDP or your pipeline forwards server-side. One SDK, one place to validate, one place to enforce consent and deletion.

I default to cloud mode, and to keeping the raw stream in my own storage whatever tool forwards it, so the warehouse is never downstream of a vendor's export. Device mode is for the few tools that genuinely need to run in the page (session replay, some ad measurement), each one reviewed for what it collects.

Server-side SDKs are also where backend events enter: the order service emitting `order_completed` from its [outbox](/docs/architecture/events#the-transactional-outbox) sends to the same collector with the same schema rules, carrying the anonymous and user IDs the client passed along with the request.

## From Collector to Warehouse

The ingestion path follows the [Data Pipelines & Analytics](/docs/architecture/data-pipelines) layers, with an event stream in front:

1. **Collector.** A stateless HTTP endpoint that authenticates the source (a write key for clients, credentials for servers), stamps the receive time, enforces size limits and writes the raw batch somewhere durable before acknowledging. Snowplow's collector "saves the raw events to storage" before anything else; that raw copy is what lets you rebuild after a bug.
2. **Validate and enrich.** Each event is checked against its schema; failures go to a failed-events stream to be fixed and replayed, never dropped. Enrichment adds what the client shouldn't be trusted with: the derived timestamp, a coarse location from the IP (after which the IP itself can be truncated or discarded), bot flags.
3. **Stream.** Valid events go to a partitioned log (Kafka, Kinesis, Pub/Sub), partitioned by the anonymous or user ID so one person's events stay in order. Real-time consumers (a live dashboard, an alert, a fraud rule) read here.
4. **Load.** A loader writes the stream to the raw layer as files partitioned by event date, and the warehouse models deduplicate, resolve identity and build the marts.

Every step is idempotent and replayable: reloading a day replaces that day's partition, and a deduplicated `event_id` means a replay can't double count.

## Late Data

Mobile and offline clients deliver events hours or days after they happened, and a pipeline that assumes "now" will put them in the wrong day or drop them. Stream processors make the decision explicit. Apache Beam's watermark is "the system's notion of when all data in a certain window can be expected to have arrived," and anything that arrives after it is late data; Beam's default configuration "does not allow late data," and you opt in with an allowed lateness.

For analytics I choose the policy deliberately:

- **Partition by event time,** the derived timestamp, not by load time, so a late event lands in the day it belongs to.
- **Rebuild a trailing window** of recent days on every run, sized from the lateness you measure (below), so late events are picked up without a manual backfill.
- **Close periods that money depends on.** Once a month's numbers feed an invoice, a revenue share or a commission, they're frozen; a late event updates the next open period as an adjustment ([Data Pipelines & Analytics](/docs/architecture/data-pipelines#versions-stamps-and-frozen-periods)).
- **Reject the implausible.** An event dated years ago or in the future is a broken clock, not a late arrival; quarantine it rather than letting it create a phantom day in a chart.
- **Measure lateness.** The distribution of receive time minus event time, by platform and app version, tells you how long the trailing window needs to be and when a release broke the uploader.

## Cost Control

Analytics cost grows with users times events per user times bytes per event, and vendors usually bill on events or tracked users, so the second factor is where cost runs away. The levers, in the order I pull them:

- **A budget per event family,** in events per user per session or hour, agreed at design review and checked in an automated test of the client.
- **Aggregate on the device.** One `video_watched` with a duration beats sixty `video_heartbeat` events; a histogram of frame times beats every frame.
- **Sample** the high-volume, low-value families, with the rate recorded.
- **Trim properties.** Context sent once per session instead of on every event, and no large blobs (full URLs with query strings, stack traces) in product events.
- **Tier retention.** Raw events for a defined window, aggregates for longer ([Data Retention & Deletion](/docs/architecture/data-retention)).
- **Kill switches** for every event family from remote configuration, because the day a release floods the pipeline is the day nobody can ship a fix quickly.
- **Report cost per thousand active users** beside the pipeline's own metrics, so a feature that doubles the bill is visible the week it ships ([Cost & FinOps](/docs/operations/cost-and-finops)).

## Checklist

- The SDK queues to durable storage, flushes on count, interval and lifecycle, and batches below the collector's limits.
- The queue is bounded, and dropped events are counted and reported.
- Event IDs are generated at creation, reused on retry, and deduplicated in the warehouse.
- Retries cover network errors, `5xx` and `429` with jittered backoff; `400` is never retried unchanged.
- Each event keeps device, sent and received times, a derived timestamp and a session sequence number.
- Sampling is per unit, deterministic, recorded on the event, and never applied to anything that counts.
- Web flushes on `visibilitychange` with `sendBeacon`; mobile flushes on backgrounding and drains on launch.
- First-party collection is used for reliability and never to bypass consent.
- One stream into your own raw store, with server-side fan-out to tools.
- Late data has a written policy: event-time partitions, a trailing rebuild window and frozen periods.
- Every event family has a volume budget and a kill switch.

## References

**Specifications**

- [CloudEvents 1.0](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md), `source` plus `id` as the duplicate key
- [OpenTelemetry: TraceState probability sampling](https://opentelemetry.io/docs/specs/otel/trace/tracestate-probability-sampling/), the adjusted count as the reciprocal of the sampling probability
- [OpenTelemetry: Sampling](https://opentelemetry.io/docs/concepts/sampling/), head and tail sampling and representativeness

**Reference**

- [MDN: Navigator.sendBeacon()](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon), sending analytics on `visibilitychange` and the 64 KiB queue limit
- [Chrome for Developers: Page Lifecycle API](https://developer.chrome.com/docs/web-platform/page-lifecycle-api), hidden as the last reliable state, and never using `unload`
- [Segment: Spec, common fields](https://www.twilio.com/docs/segment/connections/spec/common), `originalTimestamp`, `sentAt`, `receivedAt` and the clock skew formula
- [Segment: HTTP Tracking API](https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/server/http-api), 32 KB and 500 KB limits, `messageId` deduplication and `429` with `Retry-After`
- [Segment: Analytics-Kotlin](https://www.twilio.com/docs/segment/connections/sources/catalog/libraries/mobile/kotlin-android), `flushAt` and `flushInterval` defaults
- [Amplitude: Browser SDK 2](https://amplitude.com/docs/sdks/analytics/browser/browser-sdk-2), flush queue size, flush interval, retry limit and transport options
- [Snowplow: Canonical event model](https://docs.snowplow.io/docs/fundamentals/canonical-event/), device, sent, collector and derived timestamps
- [Snowplow: Timestamps](https://docs.snowplow.io/docs/events/timestamps/), how `derived_tstamp` is calculated and its assumptions
- [Snowplow: Fundamentals](https://docs.snowplow.io/docs/fundamentals/), collector, enrichment, streams, loaders and failed events
- [Snowplow: Cookies and ad blockers](https://docs.snowplow.io/docs/get-started/tracking/cookies-and-ad-blockers/), first-party collector domains, custom paths and Safari's cookie cap
- [RudderStack: Documentation](https://www.rudderstack.com/docs/), client and server SDKs, transformations and destinations
- [Segment: User deletion and suppression](https://www.twilio.com/docs/segment/privacy/user-deletion-and-suppression), device-mode destinations bypassing server-side suppression
- [Apache Beam: Programming guide](https://beam.apache.org/documentation/programming-guide/), watermarks, late data and allowed lateness
