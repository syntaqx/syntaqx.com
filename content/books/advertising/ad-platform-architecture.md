+++
title = "Ad Platform Architecture"
nav_title = "Platform Architecture"
description = "How an ad platform is put together: request path and data path, serving snapshots, configuration propagation, budgets across regions, and consent plumbing."
category = "Advertising Industry"
order = 2969
part = "Running the Platform"
tags = ["advertising", "ad-tech", "architecture", "distributed-systems", "data-model"]
+++

An ad platform is two systems that share a vocabulary. One answers requests: a publisher ad server choosing a line item, an exchange running an auction, a bidder pricing an impression, a counter recording a beacon, all in milliseconds and all at a volume no transactional database could absorb. The other runs the business: campaigns and line items edited by people and APIs, budgets, pacing, review, reporting, billing and machine learning, on databases, streams and batch jobs. Every record in this volume belongs to one side or crosses between them, and most of what goes wrong in production happens at the crossing: a paused line item that keeps serving for ten minutes, a budget spent twice because two regions each thought it had the money, a consent string parsed differently by two services, an impression counted in one region and its click in another.

The architecture is hard because the request path can't wait for the control path and the control path can't trust the request path's view of the world. A bid decision made in 30 milliseconds reads a copy of configuration that is seconds or minutes old, a budget counter that is approximate, and a consent decision made at the edge; the billing roll-up hours later has to reconcile all of it into numbers a contract can rely on. This chapter covers the services and how data flows between them, the split between the request path and the data path, serving snapshots and how configuration propagates, budgets and state across regions, the identifiers that join the path end to end, how consent signals travel through every hop, and how each service fails. It extends every table in [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) by placing it on one side of the split, and adds the snapshot, rollout and kill-switch records the request path serves from.

Other chapters own the pieces. [Real-Time Bidding at Scale](/books/advertising/bidding-at-scale), the next chapter, owns the bidder's latency budget, traffic shaping and cost per query; [Reporting & Data Pipelines](/books/advertising/reporting-and-data-pipelines) owns the data path after the stream; [Machine Learning for Ads](/books/advertising/machine-learning-for-ads) owns the models the request path calls. [Ad Servers](/books/advertising/ad-servers) (in Ad Serving and Creative) owns the serving snapshot's contents and the decision function; [Consent Management & the TCF](/books/advertising/consent-and-the-tcf) (in Privacy and Law) owns the consent signal model this chapter wires through the platform. Generic infrastructure is the Hosting & Cloud volume's: [Control Plane and Data Plane](/books/hosting-and-cloud/regions-zones-and-cells#control-plane-and-data-plane), [Cells and Shuffle Sharding](/books/hosting-and-cloud/regions-zones-and-cells#cells-and-shuffle-sharding), [Kafka as a Service](/books/hosting-and-cloud/managed-queues-and-streaming#kafka-as-a-service) and [Request Collapsing](/books/hosting-and-cloud/caching-and-invalidation#request-collapsing). Generic streaming and pipelines are the playbook's [Streaming](/docs/data/streaming) and [Data Pipelines](/docs/data/data-pipelines).

## How the Platforms Do It

What the platforms publish about their own architecture is mostly what a partner has to design around: where to put servers, how long a change takes to reach serving, how traffic is shaped. As of November 2026:

| Platform | What it publishes | What it means for the architecture |
| --- | --- | --- |
| **Display & Video 360** (Google DSP) | A line item "can take up to 24 hours" to start serving after activation; pausing can take "several hours for the system to halt your ads completely"; an advertiser-level EU political ads setting takes up to 6 hours to reach all line items | Activation and pause are asynchronous; spend continues after a pause |
| **Google Ad Manager** (publisher ad server) | Line item changes "can take up to 10 minutes to affect ad serving"; network configuration (ad units, placements, labels) "generally take effect within 60 minutes, but can take up to 180 minutes"; inventory rules and deals up to 4 hours; blocking a previously approved ad up to 24 hours | Configuration of different kinds propagates on different schedules |
| **Google Authorized Buyers** (exchange) | Four trading locations (Northern Virginia, the San Francisco Bay Area, Amsterdam, Singapore); deadlines of 80 to 1,000 ms; 85% of responses required within the deadline; a callout quota per trading location and URL | Bidders run in each region they want traffic from, and capacity is per region |
| **Meta** (social) | A multi-stage system in which retrieval selects "from tens of millions of ad candidates into a few thousand" before larger ranking models score them | The request path is a funnel of increasingly expensive stages |
| **Microsoft Monetize** (SSP) | Supply Stream Efficiency "automatically discards low-scoring traffic" per bidder, and filters harder as a bidder approaches its QPS cap | The exchange shapes traffic per downstream connection |
| **Prebid Server** (open-source header bidding server) | Host-configured default and maximum `tmax`, a per-bidder deadline computed from it, stored requests loaded by ID, bids cached for later retrieval | Configuration is fetched by ID at request time; state that outlives the request goes to a cache |
| **The Trade Desk** (DSP) | Its 10-K says only that "Our platform infrastructure is hosted in data centers around the world" | Scale figures and topology are rarely published; design from partners' requirements |

The published numbers are about propagation and capacity, not internals, and that is the useful part: a platform that integrates with these has to tolerate a pause that takes hours, a deadline that varies by format, and capacity that is allocated per region.

## The Services

Whatever the business (publisher ad server, exchange, DSP, walled garden), the same services appear, because the same records have to be produced. The table places each on one side of the split, with the core tables it reads and writes:

| Service | Path | Reads | Writes | Owning chapter |
| --- | --- | --- | --- | --- |
| **Ingress** (tag endpoint, SDK gateway, SSAI callback, OpenRTB endpoint) | Request | Property and ad unit snapshot | `ad_requests` (sampled), the request ID | [Ad Servers](/books/advertising/ad-servers); [How Programmatic Works](/books/advertising/how-programmatic-works) |
| **Consent and signal parser** | Request | `privacy_rule_versions`, GVL | `ads_mode` and reasons on the request | [Consent Management & the TCF](/books/advertising/consent-and-the-tcf) |
| **Decision** (ad server) | Request | Serving snapshot, frequency store, pacing state | `ad_decisions` | [Ad Servers](/books/advertising/ad-servers#decisioning) |
| **Auction** (exchange or garden) | Request | Floors, auction rules, connections | `auctions`, `bid_requests`, `bids` | [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges); [Auction Mechanics](/books/advertising/auction-mechanics) |
| **Bidder** (DSP) | Request | Line item snapshot, models, budget counters, user store | `bids` and its reasoning columns | [Demand-Side Platforms](/books/advertising/demand-side-platforms); [Real-Time Bidding at Scale](/books/advertising/bidding-at-scale) |
| **Model serving** | Request | Feature stores, model versions | Predictions on the bid or decision | [Machine Learning for Ads](/books/advertising/machine-learning-for-ads) |
| **Creative and asset serving** | Request | Approved creative versions | Nothing transactional; CDN logs | [Creative Production, Review & DCO](/books/advertising/creative-production-and-dco) |
| **Beacon counter** | Request | Signing keys, counting policy | `beacon_receipts`, `ad_events` | [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks) |
| **Event stream** | Data | Everything the request path emits | Partitioned logs | [Reporting & Data Pipelines](/books/advertising/reporting-and-data-pipelines) |
| **Aggregation and billing** | Data | `ad_events`, billing notices, IVT findings | `delivery_daily`, `invoices`, `invoice_lines` | [Billing & Invoicing](/books/advertising/billing-and-invoicing); [Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies) |
| **Pacing and budget controllers** | Data, feeding the request path | Provisional delivery | `pacing_snapshots`, budget allocations | [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency) |
| **Campaign management** (UI and API) | Control | Everything configured | `campaigns`, `line_items`, `creatives`, `change_events` | [Campaigns & Line Items](/books/advertising/campaigns-and-line-items); [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms) |
| **Review and policy** | Control | Creatives, advertisers | `creative_reviews`, `policy_enforcements` | [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising) |
| **Snapshot builder** | Control, feeding the request path | Configuration tables | `serving_snapshots` (below) | This chapter |

The control-path services are ordinary transactional applications with the playbook's rules: [Service Boundaries](/docs/architecture/service-boundaries), [Multi-Tenancy](/docs/architecture/multi-tenancy) for a platform selling software to many publishers or buyers, and [The Transactional Outbox](/docs/architecture/events#the-transactional-outbox) for the life-cycle events (`line_item.paused`, `creative.reviewed`, `deal.activated`) the snapshot builder and partners consume. What is specific to advertising is the two services that feed the request path, the snapshot builder and the budget controller, and the rule that nothing on the request path writes to a transactional database synchronously.

## Request Path and Data Path

The **request path** is everything between an ad request arriving and the response leaving: ingress, consent parsing, decision, auction, callouts, bidding, model scoring and the markup returned. Its properties follow from its deadline. An exchange advertises `tmax`, which OpenRTB defines as the "Maximum time in milliseconds the exchange allows for bids to be received including Internet latency to avoid timeout"; Authorized Buyers waits "80 to 1000 ms" depending on format and auction type and drops responses after the deadline. Within that budget a service can read from memory and from a low-latency key-value store, and it can call a model, but it can't wait on a database transaction, a lock, a queue acknowledgment or another region.

The **data path** is everything that happens because the request path happened: the logs, the stream, the beacons that arrive seconds to days later, aggregation into `delivery_daily`, invalid traffic classification, attribution, reporting, billing and model training. It runs on event time, tolerates late data and restates ([Watermarks and Late Data](/docs/data/streaming#watermarks-and-late-data)); its outputs are the numbers contracts are priced on.

Four rules keep the split clean:

- **The request path emits, it doesn't write.** Every decision, auction, callout and bid is a record appended to a local buffer and shipped to the stream asynchronously. If the stream is slow, the buffer grows on local disk and drains later; the request is never held for it. The transactional database never sees a request-path write. The playbook's [The Log](/docs/data/streaming#the-log) is the shape; [Kafka as a Service](/books/hosting-and-cloud/managed-queues-and-streaming#kafka-as-a-service) has the managed options.
- **The request path reads snapshots, not tables.** Configuration arrives as immutable, versioned snapshots built by the control path (below), and per-user state (frequency counts, sync tables, recency) comes from a key-value store keyed by an identifier the consent state allows.
- **Money on the request path is a reservation.** A bidder reserves the bid price against a local budget allocation when it bids and converts the reservation to spend at the clearing price when the billing notice arrives, as [Demand-Side Platforms](/books/advertising/demand-side-platforms) describes; the ledger of record is the billing notices rolled into `delivery_daily`, never the request path's counters.
- **Every record carries the version that decided it.** A decision records its snapshot version, a request its privacy rule version, a bid its model versions, an auction its rule version. The data path can then explain any outcome without asking what the configuration "was at the time".

The split is the Hosting & Cloud volume's control plane and data plane in advertising's terms ([Control Plane and Data Plane](/books/hosting-and-cloud/regions-zones-and-cells#control-plane-and-data-plane)), with one difference that matters for design: in a cloud the data plane keeps serving if the control plane is down, and the same is true here. A campaign UI outage must not stop ads; it stops changes.

## Serving Snapshots and Configuration Propagation

[Ad Servers](/books/advertising/ad-servers#building-one) defines the serving snapshot for a publisher ad server: every active line item, its compiled targeting, creatives, caps, labels and pacing state, pushed to every serving node as an immutable versioned snapshot that nodes swap atomically. The same structure serves every request-path service: a bidder's snapshot holds line items, bid strategies, supply rules and creatives; an exchange's holds seller accounts, floors, bidder connections and filters; a counter's holds signing keys and counting policies.

A snapshot pipeline has four stages:

1. **Change capture.** Configuration changes commit with an outbox event or are read from the write-ahead log ([Change Data Capture](/docs/data/data-pipelines#change-data-capture)). The builder tracks the high-water mark it has consumed.
2. **Build.** The builder compiles the changed records into the serving form (targeting into an index, creatives into eligibility lists, pacing into participation rates), validates the result and writes it to object storage under a version number with a content hash. A full snapshot is rebuilt on a schedule and deltas in between.
3. **Rollout.** Regions and then nodes load the new version, canary first. A snapshot that fails validation on a node, or that moves a guarded metric (fill, bid rate, spend rate) beyond a bound on the canary, stops the rollout and the fleet stays on the previous version.
4. **Activation.** Each node swaps its in-memory pointer atomically; requests in flight finish on the old version, new requests use the new one.

The consequence is that **every change has a propagation delay**, and the delay differs by kind of change. Google publishes its own: line item changes within 10 minutes, network configuration within 60 to 180, inventory rules and deals within 4 hours, blocking an approved ad within 24 hours on Ad Manager, and activation within 24 hours and a pause that takes "several hours" on Display & Video 360. These are not defects; they are what a multi-region fleet serving from compiled snapshots costs, and they are why three things need their own path:

- **Pauses that must be immediate.** A malicious creative, a legal takedown, a brand safety emergency or a runaway budget cannot wait for the next snapshot. A **kill switch** is a small, separately distributed list (creative IDs, line item IDs, advertiser IDs, domains) that every request-path node polls every few seconds and checks on every request, before the snapshot is consulted. It overrides the snapshot and is never larger than a few thousand entries, so it can be checked in memory per request.
- **Budget exhaustion.** Budgets are not snapshot data; they are counters with their own allocation protocol (next section).
- **Consent and legal rules.** `privacy_rule_versions` are approved, scheduled and activated at an effective time, not on deploy, so every region switches together at the stated moment rather than when its snapshot happens to arrive.

My rule: show the propagation delay to the person making the change. A UI that says "paused" when the fleet will keep serving for ten minutes produces a support ticket and, on a guaranteed line item, a make-good dispute. The change history (`change_events` in [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms)) records when the change was made; the rollout record below records when each region started serving it; the gap between them is evidence.

The swap itself is small code. The node holds a pointer to the current snapshot and a kill list, and every request reads both once:

```go tab="Go"
package serving

import (
	"sync/atomic"
)

// Snapshot is immutable once built; a new version replaces it whole.
type Snapshot struct {
	Version   int64
	LineItems map[string]*LineItem
	// compiled targeting index, creatives, caps, pacing rates ...
}

type LineItem struct {
	ID           string
	AdvertiserID string
	CreativeIDs  []string
}

// KillList is small, polled every few seconds, and checked before the snapshot.
type KillList struct {
	Version     int64
	LineItems   map[string]struct{}
	Creatives   map[string]struct{}
	Advertisers map[string]struct{}
}

type Node struct {
	snap atomic.Pointer[Snapshot]
	kill atomic.Pointer[KillList]
}

// Swap installs a new snapshot; requests in flight keep the one they loaded.
func (n *Node) Swap(s *Snapshot) { n.snap.Store(s) }

func (n *Node) SetKillList(k *KillList) { n.kill.Store(k) }

// Eligible returns the line items a request may consider and the versions that decided,
// which the decision record carries.
func (n *Node) Eligible(candidates []string) (out []*LineItem, snapVer, killVer int64) {
	s, k := n.snap.Load(), n.kill.Load()
	for _, id := range candidates {
		li, ok := s.LineItems[id]
		if !ok {
			continue
		}
		if _, dead := k.LineItems[li.ID]; dead {
			continue
		}
		if _, dead := k.Advertisers[li.AdvertiserID]; dead {
			continue
		}
		out = append(out, li)
	}
	return out, s.Version, k.Version
}

// CreativeAllowed is checked again at creative selection, after the line item wins.
func (n *Node) CreativeAllowed(creativeID string) bool {
	_, dead := n.kill.Load().Creatives[creativeID]
	return !dead
}
```

```rust tab="Rust"
use arc_swap::ArcSwap;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;

/// Immutable once built; a new version replaces it whole.
pub struct Snapshot {
    pub version: i64,
    pub line_items: HashMap<String, LineItem>,
    // compiled targeting index, creatives, caps, pacing rates ...
}

pub struct LineItem {
    pub id: String,
    pub advertiser_id: String,
    pub creative_ids: Vec<String>,
}

/// Small, polled every few seconds, and checked before the snapshot.
pub struct KillList {
    pub version: i64,
    pub line_items: HashSet<String>,
    pub creatives: HashSet<String>,
    pub advertisers: HashSet<String>,
}

pub struct Node {
    snap: ArcSwap<Snapshot>,
    kill: ArcSwap<KillList>,
}

impl Node {
    pub fn new(s: Snapshot, k: KillList) -> Self {
        Node { snap: ArcSwap::from_pointee(s), kill: ArcSwap::from_pointee(k) }
    }

    /// Installs a new snapshot; requests in flight keep the Arc they loaded.
    pub fn swap(&self, s: Snapshot) { self.snap.store(Arc::new(s)); }

    pub fn set_kill_list(&self, k: KillList) { self.kill.store(Arc::new(k)); }

    /// The eligible line item IDs and the versions that decided, for the decision record.
    pub fn eligible(&self, candidates: &[String]) -> (Vec<String>, i64, i64) {
        let s = self.snap.load();
        let k = self.kill.load();
        let out = candidates
            .iter()
            .filter_map(|id| s.line_items.get(id))
            .filter(|li| !k.line_items.contains(&li.id) && !k.advertisers.contains(&li.advertiser_id))
            .map(|li| li.id.clone())
            .collect();
        (out, s.version, k.version)
    }

    /// Checked again at creative selection, after the line item wins.
    pub fn creative_allowed(&self, creative_id: &str) -> bool {
        !self.kill.load().creatives.contains(creative_id)
    }
}
```

The decision record stores both versions. When a creative served after it was blocked, the question "was it on the kill list yet in that region" has an answer.

## Budgets, Caps and State Across Regions

A request-path service in four regions spending one advertiser's daily budget has a distributed counting problem, and the honest answer is that it can't be solved exactly at request time. The design is to bound the error instead:

- **Allocate, then spend locally.** A budget controller on the data path splits each line item's remaining budget for the next interval into allocations per region (and per node, for large fleets) in proportion to forecast traffic. Each node spends its allocation from memory, reserving the bid price and releasing the unused part when the auction is lost or the reservation expires. The controller reallocates every interval from provisional delivery.
- **Overspend is bounded by what's in flight.** The worst case is every node spending its whole allocation at once and every reservation clearing. Smaller allocations and shorter intervals lower the bound at the cost of more controller traffic and more underdelivery when a region runs dry while another has money. The pacing controller in [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency#pacing-controllers) sets participation rates; this allocation is what stops a pacing error from becoming an overspend.
- **The terms decide who absorbs it.** Whether spend beyond a budget is billed, credited or absorbed is a platform or contract term ([Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms) and [Billing & Invoicing](/books/advertising/billing-and-invoicing) cover the published rules); either way the overspend is a measured number on `delivery_daily` against the budget, not a surprise.

**Frequency caps** have the same shape with a different consequence. A cap of three per day across regions needs the user's count, and a user's requests usually land in one region (routed by geography), so user state lives in the region the user is routed to and is replicated asynchronously to the others. A user who moves regions mid-day may see a fourth ad; caps are a best effort with a measured violation rate, and a guaranteed "never more than three" is a promise the architecture can't keep at request time. Frequency state is personal data keyed by an identifier, so it also inherits the consent rules: a request in `limited` mode has no user key and no frequency state ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).

**Sync tables and user stores** (`user_id_syncs` in [How Programmatic Works](/books/advertising/how-programmatic-works), audience membership in Identity and Audiences) are replicated per region with deletion and opt-out propagating as events; a deletion is not complete until every region's replica has applied it, which is a number the privacy team will ask for.

## Multi-Region

Advertising is regional by design, because latency is a cost on the request path. Authorized Buyers' guidance is explicit: "you should locate your servers close to the trading locations", and "to receive all impressions, you need to have servers reachable from all locations"; it requires "85 percent of responses be received within the deadline" and recommends peering for high-volume buyers, with the usual traffic requirement "waived for RTB clients". A bidder therefore runs a full request-path stack in each trading region it buys in, and an exchange runs one wherever its publishers' users are.

What is regional and what is global:

| Concern | Regional | Global |
| --- | --- | --- |
| Request path (ingress, decision, auction, bidding, counting) | Yes, per trading location | No |
| Serving snapshots | Built once, loaded in every region | One version sequence |
| Kill switches | Loaded in every region | One list, polled from every region |
| Budget allocations | Spent locally | One controller per line item |
| User state (frequency, syncs, recency) | Home region, async replicas | No single copy is authoritative at request time |
| Event logs | Written in the serving region | Merged into one partitioned log by event time |
| Campaign management, billing, reporting | No | One control plane, regional replicas for reads |
| EU personal data at rest | Where the residency commitment says | Never moved out by default |

Three practices come from the industry's own failure modes:

- **Fail to no-bid, not to error.** A bidder that can't reach its user store bids without user data or doesn't bid; an ad server that can't reach demand serves house or unfilled. Authorized Buyers throttles bidders whose error rate is too high ("Gradually lowers the outgoing QPS until the error rate or number of bid requests drops to an acceptable level") and adjusts "within minutes", so an erroring bidder loses traffic it then has to earn back. Returning HTTP 204 quickly is always cheaper than returning a 500 slowly.
- **Shed load at the edge, by value.** When a region is over capacity, drop the requests least likely to produce revenue before they consume the budget of every downstream stage: the exchange-side version is traffic shaping, the bidder-side version is a pre-filter on cheap features. The generic patterns are [Admission, Rate Limiting and Load Shedding](/docs/architecture/admission-control#admission-rate-limiting-and-load-shedding) and [Protecting What's Downstream](/docs/architecture/admission-control#protecting-what-s-downstream).
- **Isolate tenants.** A publisher ad server or exchange serving thousands of publishers keeps one publisher's traffic spike or bad configuration from taking down everyone, with cells and shuffle sharding ([Cells and Shuffle Sharding](/books/hosting-and-cloud/regions-zones-and-cells#cells-and-shuffle-sharding)) and per-tenant quotas ([Quotas as Protection](/books/hosting-and-cloud/regions-zones-and-cells#quotas-as-protection)).

Regional failover for the request path is mostly automatic, because the protocol already tolerates it: an exchange whose callout to one region times out records a timeout and moves on, and Authorized Buyers transfers a callout to the other North American location when one is full ("it transfers the callout to the other location"). The data path is where failover needs design: a region that was cut off for an hour comes back with an hour of buffered events, which land in their event-time partitions and restate the affected days.

## Identifiers That Join the Path

A request produces records in a dozen services in several regions over days. They join on a small set of identifiers, each minted once by one service and carried by every later one:

| Identifier | Minted by | Carried in | Joins |
| --- | --- | --- | --- |
| Request ID | Ingress | `ad_requests.id`, `ad_decisions.ad_request_id`, `auctions.ad_request_id` | Request to decision to auction |
| Transaction ID | The first exchange or wrapper | OpenRTB `source.tid`, "common across all participants in this bid request (e.g., potentially multiple exchanges)"; `ad_requests.source_tid` | The same opportunity across exchanges and hops |
| Auction ID | Auction service | `auctions.id`, `bid_requests.auction_id`, `bids.auction_id`, `ad_events.auction_id` | Auction to callouts, bids and events |
| Impression ID | Decision, at serve | Signed into every beacon; `ad_events.impression_id` and `dedupe_key` | Serve to impression, viewability, clicks |
| Click ID | Counter, at click | Landing URL parameter, returned with conversions | Click to conversion |
| Conversion event ID | Advertiser | `conversions.external_id`, `conversion_receipts.event_id` | Duplicate conversions across channels |

Two rules make the joins work at scale. **Every join is time-bounded**: the partitioned logs keep no foreign keys, and a join from an auction to its request filters the request's partition to a narrow window before the auction, so the warehouse prunes to one or two hourly partitions ([Consent Management & the TCF](/books/advertising/consent-and-the-tcf) has the query). **Every identifier that leaves the platform is signed or opaque**: the impression ID and landing URL are covered by the beacon's signature, as [Counting Impressions & Clicks](/books/advertising/counting-impressions-and-clicks#beacons-and-pixels) shows, so a beacon can't be forged for an impression that never served.

## Signal and Consent Plumbing

[Consent Management & the TCF](/books/advertising/consent-and-the-tcf) defines the volume's consent signal model: raw signals ride on `ad_requests` verbatim; the first service to receive the request parses them once into typed columns and one `ads_mode` (`personalized`, `non_personalized`, `limited`) with reason codes; the rules that map signals to modes are a versioned `privacy_rule_versions` row recorded on every request; and every downstream recipient gets its own decision, recorded on `bid_requests` with the basis it was sent under. What this chapter adds is where that runs and how it travels:

- **Parse at ingress, in every region, from the same rule version.** The parser is a library compiled into every ingress service, not a remote call; a remote consent service on the request path is a single point of failure that will be bypassed under load. The rule version is part of the snapshot pipeline, activated at its effective time.
- **Carry the decision, not the string, inside the platform.** Internal requests between the decision service, the auction and the bidder carry `ads_mode`, the reason codes and the rule version. Services that need vendor-level detail (the exchange deciding which bidder may receive identifiers) read the parsed TCF fields, never the raw string. A service that parses the string itself will disagree with ingress sooner or later.
- **Strip per recipient at the boundary.** The exchange builds each bidder's copy of the bid request from the decision: identifiers, precise geo and `user.eids` removed where that bidder has no basis, recorded as `bid_requests.personal_data_sent` and `fields_removed`. The raw signals still travel (`regs.gdpr`, `user.consent`, `regs.gpp`, `regs.gpp_sid`, `regs.coppa`), because a downstream party must apply them itself.
- **Fail closed.** If the parser can't parse a string, or the rule version isn't loaded, the request is `limited`. A consent outage reduces revenue; it never sends personal data without a basis.
- **Gate the data path too.** Logs keyed by identifiers inherit the request's mode: a `limited` request's events are logged without a user key, model training reads only records whose mode allowed the use, and deletion requests propagate to every regional store and to the warehouse. The generic rules are the playbook's [Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection) and [Deletion Reaches the Analytics Tools](/docs/telemetry/consent-and-privacy#deletion-reaches-the-analytics-tools).

The same plumbing carries the other request-scoped legal signals: the property's `child_directed` flag that sets COPPA on every request, the age band from [Children, Teens & Advertising](/books/advertising/children-and-teens), the advertiser's special ad category that restricts targeting, and political-ad flags. Each is decided once, recorded with the rule version, and read by every service downstream.

## Failure Modes

Each dependency on the request path has a defined degraded behavior, chosen in advance and tested, because under load there is no time to decide:

| Dependency down or slow | Degraded behavior | What it costs | What's recorded |
| --- | --- | --- | --- |
| Snapshot store (new versions can't load) | Keep serving the current version | Changes stop propagating; pauses wait | Rollout stuck; alert on snapshot age |
| Kill list poll | Keep the last list; stop serving if it is older than a hard limit | Blocks may lag; at the limit, revenue stops | Kill list age per node |
| Consent rule version not loaded | Every request `limited` | Personalized revenue | `ads_mode_reasons` code |
| Frequency or user store | Serve without user state, or don't bid where caps are contractual | Cap violations or lost bids | Decision filter counts |
| Budget allocation expired | Stop bidding for that line item | Underdelivery | Pacing snapshot |
| Model serving | Fall back to a simpler model or a prior; or don't bid | Price quality | `bid_model_version` on bids |
| A bidder or demand partner | Timeout, record it, continue | That partner's bids | `bid_requests.status = 'timeout'` |
| Event stream | Spool to local disk, drain later | Reporting freshness | Spool depth, late events on restatement |
| Campaign management | Serve as configured; reject changes | No changes | Change API errors |

Two of these are worth a sentence each. **Kill-list staleness has a hard limit**: a node that hasn't refreshed its kill list for longer than the limit (minutes, not hours) stops serving, because serving a blocked malicious creative is worse than serving nothing. **Spool before drop**: losing events loses billable impressions and the evidence behind invoices, so the request-path buffer goes to local disk and the node sheds requests before it drops events. Timeouts, retry budgets and circuit breakers for the calls themselves are the playbook's [Retries & Timeouts](/docs/architecture/retries-and-timeouts); alerting on the request path's error budget is [Alerting on Burn Rate](/docs/operations/slos#alerting-on-burn-rate).

## How to Build It

The core tables are already split by path: `ad_requests`, `auctions`, `bids`, `ad_events` and the partitioned logs other chapters add (`ad_decisions`, `bid_requests`, `beacon_receipts`, `feed_ad_decisions`) are request-path output, written to the stream and stored in the log store; everything else is control-path state. This chapter adds the records of what the request path served from: snapshot versions and where each was live, rollouts, and kill-switch entries. It also stamps the region on the request-path records so that a question about one region's behavior is a filter.

```sql
CREATE TABLE serving_snapshots (         -- one compiled, immutable configuration version
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  service            TEXT NOT NULL CHECK (service IN ('ad_server', 'exchange', 'bidder',
                       'counter', 'feed_ranker')),
  version            BIGINT NOT NULL,      -- what ad_decisions.snapshot_version and others record
  kind               TEXT NOT NULL CHECK (kind IN ('full', 'delta')),
  base_version       BIGINT,               -- the version a delta applies to
  source_high_water  TEXT NOT NULL,        -- the outbox ID or WAL position consumed
  content_ref        TEXT NOT NULL,        -- object storage key
  content_sha256     BYTEA NOT NULL,
  entity_counts      JSONB NOT NULL DEFAULT '{}',  -- {"line_items": 48210, "creatives": 91877}
  built_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  builder_version    TEXT NOT NULL,
  validation         TEXT NOT NULL CHECK (validation IN ('passed', 'failed')),
  UNIQUE (service, version),
  CHECK ((kind = 'delta') = (base_version IS NOT NULL))
);

CREATE TABLE snapshot_rollouts (         -- when each region started and stopped serving a version
  snapshot_id        UUID NOT NULL REFERENCES serving_snapshots (id),
  region             TEXT NOT NULL,        -- the trading location or cell
  stage              TEXT NOT NULL CHECK (stage IN ('canary', 'region', 'rolled_back')),
  started_at         TIMESTAMPTZ NOT NULL,
  live               TSTZRANGE,            -- null until fully active; upper bound when superseded
  halted_reason      TEXT,                 -- the guard metric that stopped it
  PRIMARY KEY (snapshot_id, region, stage)
);

CREATE TABLE kill_switches (             -- immediate blocks, distributed apart from snapshots
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  subject_kind       TEXT NOT NULL CHECK (subject_kind IN ('creative', 'line_item',
                       'advertiser', 'domain', 'seller_account', 'bidder_connection')),
  subject_ref        TEXT NOT NULL,        -- the ID or domain
  reason             TEXT NOT NULL CHECK (reason IN ('malvertising', 'legal', 'policy',
                       'brand_safety', 'budget_runaway', 'incident', 'other')),
  active             TSTZRANGE NOT NULL,   -- upper bound set when lifted
  list_version       BIGINT NOT NULL,      -- the kill list version that first carried it
  created_by         TEXT NOT NULL,        -- typed actor: a person, a policy job and version
  ticket_ref         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX kill_switches_active_idx ON kill_switches USING gist (active);

-- Request-path records carry the region that produced them.
-- (ad_requests.region is the user's coarse geography; serving_region is this system's.)
ALTER TABLE ad_requests  ADD COLUMN serving_region TEXT;
ALTER TABLE ad_decisions ADD COLUMN serving_region TEXT,
                         ADD COLUMN kill_list_version BIGINT;
ALTER TABLE auctions     ADD COLUMN serving_region TEXT;
ALTER TABLE ad_events    ADD COLUMN serving_region TEXT;   -- the counter's region, not the serve's
```

The `serving_region` columns are nullable and added without defaults, so the `ALTER`s are metadata-only on every partition; new partitions are created with them. At real scale these logs live in the log store and warehouse with the same columns; [Reporting & Data Pipelines](/books/advertising/reporting-and-data-pipelines) covers that side.

The question after every incident, "how long did the change take to reach serving, per region", is one join:

```sql
-- From a line item pause to the first snapshot carrying it being live in each region.
WITH pause AS (
  SELECT ce.resource_id AS line_item_id, ce.changed_at
  FROM change_events ce
  WHERE ce.resource_kind = 'line_item'
    AND ce.resource_id = $1
    AND ce.new_values ->> 'status' = 'paused'
    AND ce.changed_at >= $2 AND ce.changed_at < $3
)
SELECT p.line_item_id, r.region,
       p.changed_at,
       min(lower(r.live))                     AS live_in_region_at,
       min(lower(r.live)) - p.changed_at      AS propagation
FROM pause p
JOIN serving_snapshots s ON s.service = 'ad_server'
                        AND s.built_at >= p.changed_at
                        AND s.validation = 'passed'
JOIN snapshot_rollouts r ON r.snapshot_id = s.id AND r.stage = 'region'
                        AND r.live IS NOT NULL
GROUP BY p.line_item_id, r.region, p.changed_at
ORDER BY r.region;
```

The sketch assumes the first passed snapshot built after the change carries it, which holds when the builder consumes changes in commit order and records its high-water mark; a precise version compares `source_high_water` with the change's outbox position.

Impressions served after a kill switch was set, by region, which should be zero after the list's propagation time:

```sql
SELECT d.serving_region, count(*) AS decisions_after_block
FROM kill_switches k
JOIN ad_decisions d ON d.winning_creative_id::text = k.subject_ref
                   AND d.decided_at >= lower(k.active)
                   AND (upper(k.active) IS NULL OR d.decided_at < upper(k.active))
                   AND d.decided_at < lower(k.active) + interval '1 day'
WHERE k.subject_kind = 'creative' AND k.id = $1
GROUP BY d.serving_region;
```

Design notes:

- **One snapshot sequence per service.** Versions are monotonic per service, so "decided under version 81,442" means the same thing in every region; deltas name their base so a node can't apply a delta to the wrong version.
- **The rollout is a record, not a log line.** `snapshot_rollouts` answers what was live where and when, which is the evidence for a make-good, a guarantee dispute or a regulator asking when an ad stopped running.
- **Kill switches are few, explicit and expire on purpose.** Every entry has a reason, an actor and a ticket, and an upper bound when lifted; the list is small enough to check per request because blocking a whole class (a category, a country) is a snapshot change, not a kill switch.
- **Serving region is a column, never inferred.** Inferring the serving region from IP or time zone breaks the first time traffic fails over; the service writes its own region on every record.
- **The outbox feeds the builder.** Configuration changes commit with their events in one transaction ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)); the builder is one consumer among partners, pacing and reporting, and its high-water mark ties every snapshot to an exact point in the change history.
- **Budgets stay out of snapshots.** Budget allocations are counters with their own interval and their own controller; putting remaining budget into a snapshot ties spend accuracy to snapshot propagation, which is minutes.

## Auditing

- **What configuration served each request.** Snapshot and kill-list versions on every decision, the snapshots' content by hash, and the rollouts that say where each was live, so a disputed delivery can be replayed against what was actually serving.
- **How long changes took.** For pauses, activations, blocks and budget changes, the time from the change to live in each region, with the published or contracted propagation time beside it.
- **Every emergency block.** Kill-switch entries with actor, reason, ticket and the decisions that still served after each one, by region.
- **The consent rule each request ran under,** in every region, and evidence that a rule version became active everywhere at its effective time.
- **Degraded operation.** Periods when a region ran on a stale snapshot, a stale kill list, without user state or with consent fail-closed, with their start, end and affected volume.

## What This Means for the System You Build

- **Split the request path from the data path** and never write to a transactional database from the request path.
- **Serve from immutable, versioned snapshots** and record the version on every decision, bid and auction.
- **Give immediate blocks their own small, fast list** and stop serving when it goes stale.
- **Show propagation delay to the person making the change,** and record when each region started serving it.
- **Spend budgets from regional allocations with a bounded overspend,** reconciled to billing notices, never to request-path counters.
- **Keep user state in the user's home region,** replicated asynchronously, with consent and deletion applied in every replica.
- **Parse consent once at ingress from a versioned rule, carry the decision internally, strip per recipient at the boundary, and fail closed.**
- **Define each dependency's degraded behavior in advance:** no-bid over error, spool over drop, last-known-good over nothing.
- **Mint each identifier once and carry it everywhere,** with time-bounded joins and signed beacons.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6](https://github.com/InteractiveAdvertisingBureau/openrtb2.x/blob/main/2.6.md), `tmax`, `source.tid`, keep-alive and the consent fields carried in `regs` and `user`

**Reference**

- [Google Authorized Buyers: Real-time Bidding overview](https://developers.google.com/authorized-buyers/rtb/start), the 80 to 1000 ms deadline set by `tmax` and responses after the deadline excluded
- [Google Authorized Buyers: Trading locations and peering](https://developers.google.com/authorized-buyers/rtb/peer-guide), the four trading locations, the 85% within-deadline requirement, colocating servers and peering
- [Google Authorized Buyers: Callout Quota System](https://developers.google.com/authorized-buyers/rtb/callout-quota-system), quotas per trading location and URL, error throttling and callout transfer between North American locations
- [Google Ad Manager Help: Update periods for changes made in Ad Manager](https://support.google.com/admanager/answer/79203), propagation times for line items, network configuration, rules and deals, and blocks
- [Display & Video 360 Help: Line item activation and pausing](https://support.google.com/displayvideo/answer/2891312?hl=en), up to 24 hours to start serving, several hours to halt, and 6 hours for the EU political ads setting
- [Microsoft Learn: Supply Stream Efficiency](https://learn.microsoft.com/en-us/xandr/bidders/supply-stream-efficiency), traffic shaping per bidder and QPS cap filtering
- [Prebid Server: Auction endpoint](https://docs.prebid.org/prebid-server/endpoints/openrtb2/pbs-endpoint-auction.html), host-configured `tmax`, per-bidder deadlines, stored requests and bid caching
- [Meta Engineering: Meta Andromeda (December 2, 2024)](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/), retrieval from tens of millions of candidates to a few thousand ahead of ranking

**Filings**

- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), infrastructure "hosted in data centers around the world"
