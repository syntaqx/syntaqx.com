+++
title = "Header Bidding & Prebid"
description = "Client and server-side header bidding: Prebid.js, Prebid Server and Mobile, Amazon TAM, Open Bidding, timeouts, price buckets, key-values and line items."
category = "Advertising Industry"
order = 2918
part = "Programmatic"
tags = ["advertising", "ad-tech", "programmatic", "header-bidding", "prebid", "data-model"]
+++

Header bidding is a publisher asking several exchanges for a price at once, before its own ad server decides what to show. A wrapper on the page (Prebid.js), in a server (Prebid Server, Amazon's Transparent Ad Marketplace) or in an app SDK (Prebid Mobile) sends one request to each configured exchange, waits a fixed time, and hands the bids it got to the ad server as key-values, where they compete with direct-sold line items and with the ad server's own exchange. It exists because the older arrangement, a waterfall that called one exchange after another and let the ad server's affiliated exchange see the impression first, left money on the table: the US court record says header bidding "achieved widespread adoption by large publishers in 2015" and that the winning header bid was often entered into Google's ad server as a floor against AdX.

It is hard because it is an auction bolted onto an ad server that was not built for one. The ad server only understands line items, priorities and key-value targeting, so a bid of $3.87 has to become a key-value (`hb_pb=3.80`) that matches a line item priced at $3.80, and every possible price needs a line item. The wrapper runs in the reader's browser, on the publisher's page-load budget, with a timeout that trades revenue against latency. Each exchange needs its own adapter, parameters, user sync and consent handling. Bids arrive in different currencies, gross or net of fees, and the wrapper's view of the auction (every bid, every timeout) is not the ad server's view (one winning line item), so the two have to be joined to know what happened.

This chapter covers the forms header bidding takes (client-side, server-side, in-app, and the ad server's own server-side alternative, Google's Open Bidding), Prebid's three products and how they are configured, timeouts, price granularity and the targeting keys, the ad server line item setup, bid caching, user ID and consent modules, analytics adapters, and how to model all of it. It extends three core tables from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model): `ad_units` (which bidders are configured on each placement), `auctions` (the header auction is a stage of its own, before the ad server's) and `bids` (each header bid with its bidder code, source and bucket). [How Programmatic Works](/books/advertising/how-programmatic-works) owns the full bid request lifecycle and its latency budget; OpenRTB owns the bid request and response objects that Prebid Server and most adapters speak; [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges) owns the exchange's own auction once a header request reaches it; Auction Mechanics owns first-price and second-price theory; Floors & Yield Optimization owns floors, including the Prebid floors module and the ad server's pricing rules; Identifiers After Cookies owns the identifiers that the user ID modules carry; and [The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases) owns the court's findings and remedies, which this chapter only summarizes where they change how header bidding integrates. Ad mediation in apps, where the same idea runs inside an SDK, is the Gaming volume's [Ad Mediation and Rewarded Ads](/books/gaming/mobile-games#ad-mediation-and-rewarded-ads) from the studio's seat and In-App Advertising & Mediation here.

## How the Platforms Do It

As of November 2026, from each product's public documentation:

| Product | Where the auction runs | Who it calls | How bids reach the ad server | Fees and terms published |
| --- | --- | --- | --- | --- |
| **Amazon Transparent Ad Marketplace (TAM)** | Amazon's servers, from "a single call" made by the page's APS tag | Contracted demand partners; the publisher needs its own contracts with them | Through the APS tag into the publisher's ad server (Amazon's integration guide is behind a publisher login) | "A transparent 2.5% service fee charged to bidders" |
| **Amazon Unified Ad Marketplace (UAM)** | Amazon's servers | Partners Amazon adds for the publisher, "a turn-key monetization solution for publishers of all sizes" | As TAM | Not published on the product page |
| **Google Ad Manager Open Bidding** | Ad Manager's servers, inside its own auction during dynamic allocation | Third-party exchanges as yield partners in yield groups, through the existing Google tag | No key-values: bids compete directly in the ad server's auction | Not on the help page; the court record found "a 5% fee" on rivals' bids |
| **Google Ad Manager header bidding trafficking** | The page (Prebid.js), read by Google Publisher Tag | The publisher's Prebid bidders | GPT reads the Prebid wrapper's bids directly, which Google describes as more granular than price priority line items; web display only | Not stated |
| **Prebid Mobile** | Prebid Server, called from the iOS or Android SDK | Prebid Server's bidders | Into Google Ad Manager as key-values, or through AdMob and AppLovin MAX adapters, or rendered with no ad server | Open source; Prebid Server hosting is the host's terms |
| **Prebid Server** | A server the publisher or a host runs, in Go or Java | Bidders configured in stored requests or in the request | Targeting keys in the OpenRTB response (`hb_pb`, `hb_bidder`, `hb_size`, `hb_cache_id`) | Open source; hosted by Prebid.org members on their own terms |
| **Prebid.js** | The reader's browser | Each configured bidder adapter in parallel, plus any server-side bidders through Prebid Server | Key-values on the ad server request (`hb_pb`, `hb_adid`, `hb_size`, `hb_deal`) | Open source; "more than 300 demand partners" in the ecosystem |

Three patterns:

- **Everything converges on one ad server decision.** Whatever runs the header auction, the publisher's ad server still makes the final call against direct-sold line items, and the header winner reaches it either as key-values matched by price-bucketed line items (Prebid's classic setup, Amazon), or as a bid the ad server reads natively (Open Bidding, Ad Manager's header bidding trafficking).
- **Server-side moves the fan-out, not the decision.** Prebid Server, TAM and Open Bidding all trade a dozen browser requests for one call to a server that fans out, which cuts page weight and lets apps and CTV take part, at the cost of the browser's own cookies: a server can't read the reader's cookies for each exchange, so match rates depend on user syncs and shared identifiers.
- **Prebid is the open standard everyone else integrates with.** Prebid is "free, open-source", run by a membership organization, and the remedies ordered against Google in September 2026 were reported to require integrations "that allow Prebid, the open-source header bidding platform, to solicit real-time AdX bids" for indirect open-web display, which makes a Prebid integration the reference path for exchanges as well as publishers (The Google Ad Tech Cases covers the remedies; the detail here is from secondary reporting).

## From Waterfalls to Header Auctions

Before header bidding, a publisher's ad server called non-guaranteed demand in sequence. Each exchange or network got an estimated price (an average eCPM the publisher typed in) and a place in line; if the first passed, the request fell to the next. The estimates were averages, so an impression worth $8 to a bidder at the third exchange could be sold for $2 at the first. The ad server's affiliated exchange had a structural advantage on top: the court found that AdX got a "First Look" at impressions even when publishers preferred other exchanges, and a "Last Look" that let it see the winning header bid and outbid it.

Header bidding replaced the sequence with a simultaneous auction among exchanges, run before the ad server request, and passed the winning price into the ad server so that the ad server's own exchange had to beat a real number instead of an estimate. Google's response in 2018 was Open Bidding, an in-ad-server alternative; the court found it was not a substitute for header bidding because of its 5% fee, its ban on rival exchanges bidding with their own DSPs' bids, and its sharing of bid data. Google Ad Manager moved its own auction to unified first price in September 2019, which made the header winner and AdX compete on the same basis. Auction Mechanics covers why a first-price auction changes bidding; this chapter covers the plumbing.

The modern open-web impression usually has three auction stages, each a separate `auctions` row in this volume's model:

1. **The header auction.** Prebid.js or Prebid Server (or TAM) collects bids from SSPs and keeps the best per ad unit (or all of them).
2. **Each exchange's own auction.** Every SSP that received a header request runs its own auction among DSPs over OpenRTB and returns its winner to the wrapper as its bid. This is the auction SSPs & Ad Exchanges and OpenRTB describe.
3. **The ad server's decision.** The publisher's ad server ranks direct-sold line items, the header bids (as price-priority line items or natively), its own exchange and any Open Bidding partners, and picks the impression's winner. Ad Servers covers the decision.

The header auction's winner is not the impression's winner until stage 3 says so, and an SSP's "win" in stage 2 is only a bid in stage 1. Every reconciliation problem in this chapter comes from treating one stage's winner as another's.

## Client-Side, Server-Side and In-App

**Client-side (Prebid.js).** "Prebid.js is a JavaScript library that runs in the browser, and is the core product of the Prebid suite." The publisher builds a bundle with the adapters it needs, defines ad units with their sizes and each bidder's parameters, and calls `requestBids`; every adapter builds its own HTTP request to its exchange from the browser, the exchanges answer in parallel, and when all have answered or the timeout fires Prebid sets the targeting on the ad server's slots and lets the ad server request go. Browser requests carry the exchange's own cookies, which is the main reason client-side still pays better on the open web; they also add network requests and script to the page, which is the main reason to move bidders server-side. The general rule for any third-party script applies, load it without blocking the page and budget its cost ([Third-Party Scripts](/docs/frontend/web-performance#third-party-scripts)); Ad Tags, Rendering & Page Performance covers the page side.

**Server-side (Prebid Server).** "Prebid Server (PBS) provides a powerful framework for a server-side solution to header bidding"; the overview calls it "an open-source solution for server-to-server header bidding", a server, not a library, that needs hosting that is "scalable, distributed, and fast". Prebid.js reaches it through the Prebid Server adapter (`s2sConfig`), and apps, AMP pages, CTV and long-form video, digital out-of-home and audio reach it directly. The auction endpoint, `POST /openrtb2/auction`, "accepts an OpenRTB 2.x bid request"; bidder parameters sit under `imp[].ext.prebid.bidder`, keyed by bidder code; stored requests (`imp[].ext.prebid.storedrequest.id`) let a short request from an app or a page pull a full configuration kept on the server; and the response's `ext.responsetimemillis` reports each bidder's response time, with `ext.errors` codes for timeouts (1), bad input (2) and bad server responses (3). Prebid Server runs its own user sync endpoints (`/cookie_sync`, `/setuid`) so exchanges can map their IDs to the server's cookie.

**Hybrid.** Most web setups split bidders: the highest-paying exchanges stay client-side, the long tail moves to Prebid Server, and Prebid.js merges both sets of bids into one header auction. `s2sConfig.bidders` lists the server-side bidders; an ad unit can list the same bidder in both places only if the publisher wants duplicate requests.

**In-app (Prebid Mobile).** Prebid Mobile is "an end-to-end header bidding solution for both iOS and Android", and in every integration "the SDK sends bid requests to Prebid Server". It has three integration shapes: GAM bidding-only (the SDK passes Prebid Server's bids into Google Ad Manager as key-values and the Prebid Universal Creative renders the winner; formerly the "Original API"), GAM Prebid-rendered (the SDK renders the winning bid when a Prebid line item wins; formerly the "Rendering API"), and mediation, where AdMob or AppLovin MAX adapters render winning Prebid bids. In-app bidding inside a mediation SDK is the same pattern under another name; In-App Advertising & Mediation covers it.

**Amazon's server-side wrapper.** TAM is "a single call to our server-to-server marketplace", for display, pre-roll on desktop and mobile web, and streaming TV in open beta, with in-app needing Amazon's SDK; UAM is the managed version for smaller publishers. The only technical requirement on the product page is "an active integration with APS's multi-slot header bidding tag", and publishers contract with each demand partner themselves. Many publishers run APS alongside Prebid, with both wrappers' bids reaching the ad server before it decides. Amazon's integration guide, with the APS key-value names and how prices are encoded into them, is behind a publisher login, so this chapter doesn't cite them. <!-- source-gap: adv-aps-key-values | missing | APS/TAM key-value names and price encoding into Google Ad Manager line items | closes with: a public Amazon Publisher Services integration page listing the keys and price mapping | checked: 2026-11-22 -->

**The ad server's own server-side auction.** Open Bidding "allows you to invite third-party SSPs (supply-side platforms) to compete for your inventory" through "a server-to-server connection", with no extra integration per exchange; the ad server calls all Open Bidding yield partners at once during dynamic allocation, while mediation partners in the same yield group are called one at a time. Pricing rules apply to Open Bidding; deals from Open Bidding partners "compete with Ad Exchange Preferred Deals and Private Auctions based on price, with higher priority than other Open Auction bids"; and only certain partners (the help page lists Equativ, Index Exchange, Magnite DV+, MobileFuse, OpenX and PubMatic) support deals. The publisher still needs a contract with each partner. Ad Manager 360 also reads a page's Prebid wrapper directly ("header bidding trafficking"): GPT collects the bids from Prebid with no tagging changes, which the help page says gives more granular bidding than price priority line items, for web display only, and reports them under a "Header bidding" demand channel.

## Configuring Prebid.js

A Prebid.js page has three parts: the ad units with their bidders, the global configuration, and the call that runs the auction and hands off to the ad server. A minimal sketch with two client-side bidders, one server-side bidder, consent modules and a user ID module (bidder names and parameters are placeholders; each adapter documents its own):

```js
const adUnits = [{
  code: "div-article-top",                       // matches the ad server slot
  mediaTypes: { banner: { sizes: [[300, 250], [300, 600]] } },
  bids: [
    { bidder: "bidderA", params: { placementId: "13144370" } },
    { bidder: "bidderB", params: { siteId: "1234", zoneId: "5678" } },
    { bidder: "bidderC", params: { accountId: "42" } },   // routed to Prebid Server below
  ],
}];

pbjs.que.push(() => {
  pbjs.setConfig({
    bidderTimeout: 1000,                         // ms the auction waits for bids
    enableSendAllBids: true,                     // every bidder's keys, not only the winner's
    priceGranularity: "dense",
    targetingControls: { alwaysIncludeDeals: true },
    useBidCache: false,
    consentManagement: {
      gdpr: { cmpApi: "iab", timeout: 8000, defaultGdprScope: true },
      gpp: { cmpApi: "iab", timeout: 8000 },
    },
    userSync: {
      syncsPerBidder: 5,
      filterSettings: { iframe: { bidders: "*", filter: "exclude" } },
      userIds: [{ name: "sharedId", storage: { type: "cookie", name: "_sharedid", expires: 365 } }],
    },
    s2sConfig: [{
      accountId: "1001",
      enabled: true,
      bidders: ["bidderC"],
      timeout: 700,                              // below bidderTimeout, so its bids arrive in time
      endpoint: "https://pbs.example.com/openrtb2/auction",
      syncEndpoint: "https://pbs.example.com/cookie_sync",
    }],
  });
  pbjs.addAdUnits(adUnits);
  pbjs.requestBids({
    bidsBackHandler: () => {
      pbjs.setTargetingForGPTAsync();            // writes hb_* keys onto the GPT slots
      googletag.pubads().refresh();
    },
  });
});
```

What each setting does, from Prebid's reference:

- **`bidderTimeout`** is how long the auction waits. The reference's example is 3000 ms and it states no default; it warns that the timeout can trigger later than expected. `secondaryBidders` names bidders the auction does not wait for.
- **`enableSendAllBids`** defaults to `true`: every bidder's best bid goes to the ad server under bidder-suffixed keys. With it off, only the top bid goes, and `targetingControls.alwaysIncludeDeals` sends deal bids along with it.
- **`useBidCache`** has been `false` by default since Prebid.js 2.0; when on, an unused bid from an earlier auction on the page can be reused while its `ttl` lasts, filtered by `bidCacheFilterFunction`.
- **`userSync`** defaults: syncing enabled, 5 syncs per bidder, a 3000 ms delay after the auction, image syncs on and iframe syncs off.
- **`s2sConfig.timeout`** defaults to "75% of bidderTimeout or 750ms, whichever is lesser"; the module page recommends setting it "approximately 200ms-300ms less than your Prebid.js timeout", and the timeouts page recommends "within the range of 50%-75%" of the auction timeout.
- **`maxBid`** rejects bids above a CPM ceiling, 5000 by default.
- **`cache.url`** points at Prebid Cache, where video bids' VAST is stored so the ad server's creative can fetch it by key; it is required unless `cache.useLocal` is set.

Prebid releases often: Prebid.js 11.53.0 was released on November 20, 2026, two days after 11.52.0. A publisher pins a version in its build and upgrades on a schedule, because adapter behavior changes between releases.

## Timeouts

Every header bid is a race against the ad server call. My rule is the general one, every call has a deadline and the caller stops waiting at it ([Every Call Has a Timeout](/docs/architecture/retries-and-timeouts#every-call-has-a-timeout)), but header bidding has four deadlines nested inside each other, and getting their order wrong silently drops bids:

| Timeout | Set where | What it bounds | Rule |
| --- | --- | --- | --- |
| Failsafe | Page code, outside Prebid | Calls the ad server if Prebid itself fails | "Much larger than the auction timeout" |
| Auction (`bidderTimeout`) | Prebid.js | How long the header auction waits for any bid | The publisher's revenue-versus-latency choice; no default stated |
| Prebid Server (`s2sConfig.timeout`, sent as `tmax`) | Prebid.js to Prebid Server | How long Prebid Server waits for its bidders | 50% to 75% of the auction timeout, by default at most 750 ms |
| Each exchange's `tmax` | Prebid Server or the exchange, to DSPs | How long an exchange waits for DSP bids | Below the caller's remaining time, after network latency |

Prebid Server shaves its own buffer: on PBS-Go, a bidder's time is `tmax` minus request processing time, a network latency buffer and a minimum response duration, and if what's left is below the time PBS needs to prepare its response, the bidder is not called at all; on PBS-Java the per-bidder `tmax` is bounded by defaults of 5000 ms maximum and 50 ms minimum, with at least 150 ms recommended for the minimum. If `tmax` is absent, the host's configured default applies. A bid that arrives after the auction timeout is lost to this impression; the adapter's `onTimeout` hook lets the exchange learn it was too slow.

Measuring the cost of a timeout needs both sides of the race: each bidder's response time and status (from Prebid's `bidTimeout` and `bidResponse` events or Prebid Server's `responsetimemillis`) and the revenue of the impressions that waited. How Programmatic Works owns `bid_requests`, one row per callout per bidder with its latency and response status; this chapter's header auction rows join to it.

## Price Granularity and Targeting Keys

The ad server can't read a bid; it can only match key-values. Prebid rounds each bid's CPM down into a bucket and writes the bucket as the value of `hb_pb` ("header bidding price bucket"). "Bids received from your Prebid demand partners are rounded down according to your price granularity", and "Rounding does not impact the price paid, only the auction on the ad server": the winning exchange still charges its bid, but the ad server compared the bucket, not the bid, against everything else.

The standard granularities in Prebid's reference:

| Setting | Buckets | Cap |
| --- | --- | --- |
| `low` | $0.50 increments | $5 |
| `medium` | $0.10 increments | $20 |
| `high` | $0.01 increments | $20 |
| `auto` | $0.05 to $5, $0.10 to $10, $0.50 to $20 | $20 |
| `dense` | $0.01 to $3, $0.05 to $8, $0.50 to $20 | $20 |
| custom | An ordered list of `{max, increment}` ranges, `precision` 2 by default | The last `max` |

`mediaTypePriceGranularity` sets a different table for banner, video, instream and outstream video, and native. Prebid's ad ops guide counts the line items each needs: auto needs 171 per bidder and dense 425, and its Google Ad Manager setup guide uses "medium granularity (201 line items)" for banner. The built-in tables were designed for 2016 prices in currencies like USD, EUR and GBP; for currencies like JPY, INR and CZK the guide recommends custom buckets or the currency module's granularity multiplier.

A worked example (illustrative bids). Three bidders answer for a 300x250: bidder A at $3.87, bidder B at $4.02 and bidder C at $1.19, all in USD and net. Under `dense` ($0.05 steps from $3 to $8, $0.01 below $3), A's bucket is $3.85, B's $4.00 and C's $1.19. The ad server sees `hb_pb=4.00` and matches the $4.00 line item. If a direct-sold price priority line item at $4.01 also targets the slot, it wins, although bidder B's actual bid of $4.02 would have beaten it: a bucket can understate a bid by up to one increment, and here the $0.02 between bid and bucket was enough to lose to a $4.01 line item. Under `medium` the gap can be up to $0.10 per impression; under `low`, $0.50. That loss is real revenue, which is why publishers pay for more line items, and part of the appeal of integrations where the ad server reads the bid itself (Open Bidding, Ad Manager's header bidding trafficking).

The targeting keys (key names from Prebid's and Prebid Server's documentation):

| Key | Value | Used for |
| --- | --- | --- |
| `hb_pb` | The price bucket, e.g. `4.00` | Line item targeting |
| `hb_bidder` | The winning bidder's code | Reporting, rendering |
| `hb_adid` | The bid's ID in Prebid's bid store | Rendering: the creative asks Prebid for this bid's markup |
| `hb_size` | The creative size, e.g. `300x250` | Rendering, size matching |
| `hb_deal` | The deal ID, when the bid is for a deal | Deal line item targeting |
| `hb_format` | `banner`, `video` or `native` | Line item targeting by format |
| `hb_source` | Whether the bid came from the page or through Prebid Server | Reporting |
| `hb_uuid`, `hb_cache_id`, `hb_cache_host`, `hb_cache_path` | Where the cached VAST or bid lives in Prebid Cache | Video and AMP or app rendering |
| `hb_env` | `mobile-app` or `amp` | Prebid Server requests from apps or AMP |
| `hb_pb_BIDDER`, `hb_adid_BIDDER`, ... | Per-bidder copies under send-all-bids | Per-bidder line items and reporting |

Two limits shape the keys. Google Ad Manager truncates key names after 20 characters, so `hb_size_BidderWithLongNameABC` becomes `hb_size_BidderWithLo` and line items must target the truncated name; and Prebid requires a bidder code's first 6 characters to be unique across adapters for the same reason. `targetingControls.auctionKeyMaxChars` caps the total characters of keys Prebid adds, keeping only the bids that fit, and `allowTargetingKeys` masks which default keys are sent.

## The Ad Server Line Item Setup

In the classic integration, the publisher's ad server holds one price priority line item per price bucket (per bidder, under send-all-bids), each targeting `hb_pb` (or `hb_pb_BIDDER`) equal to its bucket and priced at that bucket's CPM, with a creative that asks Prebid to render the winning bid. Prebid's Google Ad Manager guide:

- **Orders and advertisers.** Line items belong to orders, and "GAM has a limit of 450 line items per order", so a granularity with hundreds of buckets spans several orders. Send-top-price uses one general Prebid advertiser; send-all-bids can use one per bidder.
- **Type and priority.** "Price priority (12)", the same priority value Ad Manager gives network, bulk, AdSense and Ad Exchange demand, so the header line items compete on price with the ad server's exchange under dynamic allocation; deals are "usually prioritized higher".
- **Rate and targeting.** Each line item's rate is its bucket, and its key-value targeting is that bucket. Long-form video adds a category and duration key (`hb_pb_cat_dur_BIDDERCODE`).
- **Creatives.** One creative per size, duplicated because "GAM will display only one creative per line item per page"; the creative calls Prebid with `hb_adid` (or the cached ID) to render the bid.
- **How many.** Send-top-price: 200 prices for one bidder is 200 line items. Send-all-bids: 200 prices for 10 bidders is 2,000 line items. Prebid's guide notes that combining Prebid.js and Prebid Mobile groups can reach 1,002 line items.

Deal line items work the same way with a deal key: a key per bidder (`hb_deal_BIDDERCODE`), a line item targeting it with the deal ID ("`hb_deal_BidderA=BDA_123`"), start and end dates matching the deal agreement, and a higher priority than open-market Prebid line items. [Deals, PMPs & Curation](/books/advertising/deals-and-curation) covers the deal itself.

The setup is configuration that drifts. A bucket line item that is paused, targets a mistyped key or carries the wrong rate is invisible until revenue drops, and an ad server with thousands of nearly identical line items is where that happens. My default is to generate the line items from the granularity table, store the mapping from bucket to line item, and check it daily (below, under Auditing).

## Bid Caching and Rendering

A Prebid bid lives in the page's bid store until it renders or expires. Each bid response carries a `ttl`, "how long (in seconds) Prebid can use this bid", and Prebid subtracts a `ttlBuffer` (one second by default) before treating it as usable. Three cases matter:

- **Rendering a winner.** When the ad server picks a Prebid line item, its creative asks Prebid for the bid by `hb_adid` and Prebid writes the stored markup into the slot, firing the adapter's `onBidWon` and the `bidWon` event.
- **Reusing an unused bid.** With `useBidCache` on, a bid that lost or was never used in an earlier auction on the same page can enter a later one (a refreshed slot, a lazy-loaded unit) while its TTL lasts. It is off by default because a bid reused for a different impression may not reflect the exchange's price for that impression; turning it on is a contract question with each exchange, not only a setting.
- **Server-side caching.** Video and AMP or app bids are stored in Prebid Cache (by Prebid.js's `cache.url` or Prebid Server's `ext.prebid.cache`), and the ad server's creative fetches the VAST or markup by `hb_uuid` or `hb_cache_id`. Prebid Server's cache entries take a `ttlseconds`, and the Prebid Server adapter in Prebid.js applies a `defaultTtl` of 60 seconds when the server returns none.

In the data model, a cached bid that enters a second auction is the same `bids` row's offer appearing again; I keep the original bid and record its reuse as a new bid row pointing back at it, so the exchange's single win is not counted twice and the second auction's record is complete.

## User IDs, Consent and Analytics

**User ID modules.** Prebid's User ID module lets a publisher run identity providers' submodules (the docs list names such as `sharedIdSystem`, `id5IdSystem` and `uid2IdSystem`) once on the page, store each ID in a cookie or local storage for a configured number of days, and pass them to every bidder: Prebid.js adapters read `bidRequest.userIdAsEids` in the OpenRTB EIDs format, and Prebid Server adapters read them from the request's `user.ext.eids`. It replaces having each exchange sync its own ID with dozens of DSPs. It can also hand IDs to Google Publisher Tag as secure signals; the docs note that Prebid "doesn't actually encrypt these signals", it base64-encodes them. Identifiers After Cookies covers the identifiers.

**Consent modules.** The TCF module fetches the consent string (and Google's additional consent string) from the CMP and adds it to every bidder request as `bidderRequest.gdprConsent`; its CMP `timeout` defaults to 10,000 ms, and `defaultGdprScope` (default `false`) decides whether GDPR applies when the CMP doesn't answer. The GPP module does the same for the Global Privacy Platform string, which adapters read from `bidderRequest.ortb2.regs` as the OpenRTB 2.6 `gpp` and `gpp_sid`, also with a 10,000 ms default. Enforcement is separate: the TCF control module (`tcfControl`) blocks activities the string doesn't permit, adapters declare their Global Vendor List ID (`gvlid`) or "Prebid.js may block requests to your adapter", and GPP activity controls (a `usnat` control module) suppress activities for US opt-outs. Since Prebid.js 11.14 a failed CMP lookup stops the User ID module from running. The rule is the general one ([Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection), [Gating SDKs](/docs/telemetry/consent-and-privacy#gating-sdks)): no ID is read, stored or sent before the consent that allows it, and Consent Management & the TCF and GPP, GPC & US Opt-Outs cover the signals.

**Analytics adapters.** Prebid emits events for every step of the header auction: `auctionInit`, `bidRequested`, `bidResponse`, `bidTimeout`, `bidderDone`, `auctionEnd`, `setTargeting`, `bidWon`, `adRenderSucceeded` and `adRenderFailed`. Analytics adapters, enabled with `pbjs.enableAnalytics`, subscribe to them and send them to a vendor or the publisher's own collector. This is the only record of losing bids and timeouts: the ad server sees one winning line item, so the bids it never saw exist only in these events. My default is to collect them into the same header auction and bid records the server side produces, sampled if volume demands it, so that every bidder's bid rate, timeout rate, win rate and revenue come from one table.

## Writing a Bidder Adapter

An exchange joins Prebid by writing an adapter: a JavaScript module for Prebid.js (and usually a Go or Java one for Prebid Server) with a fixed set of functions. `isBidRequestValid` checks each ad unit's parameters; `buildRequests` turns valid requests into HTTP requests; `interpretResponse` turns the exchange's response into Prebid bids, or an empty array; `getUserSyncs` registers the sync pixels or iframes; and hooks fire on timeout, win, targeting and HTTP errors. Each bid must carry `requestId`, `cpm`, `currency` (ISO 4217), `width` and `height`, the `ad` markup, `ttl`, `creativeId`, `netRevenue` (true when the price is net of the exchange's fees, false when gross) and `meta.advertiserDomains`, with `dealId` when the bid is for a deal. Bidder codes are lowercase alphanumerics and underscores, unique, unique in their first 6 characters, and not one of the reserved names (`all`, `context`, `data`, `general`, `prebid`, `skadn`).

The exchange's server behind the adapter is an ordinary OpenRTB-style endpoint with one header bidding twist: the price it returns becomes a key-value in an ad server it does not control, so it must be net of anything the publisher won't receive, in the currency the publisher compares in. Prebid Server does the bucketing on its side. The function that turns a price into `hb_pb` is small and has to agree with the line items exactly, so it belongs in shared code with tests on the boundaries:

```go tab="Go"
package hb

import "fmt"

// Range is one row of a price granularity table: buckets of Increment
// from the previous range's Max up to Max, all in CPM micros.
type Range struct {
	MaxMicros       int64
	IncrementMicros int64
}

// Dense is Prebid's "dense" table: $0.01 to $3, $0.05 to $8, $0.50 to $20.
var Dense = []Range{
	{3_000_000, 10_000},
	{8_000_000, 50_000},
	{20_000_000, 500_000},
}

// Bucket rounds a bid down to its bucket and caps it at the last Max.
// Negative bids are invalid and return false.
func Bucket(bidMicros int64, table []Range) (int64, bool) {
	if bidMicros < 0 || len(table) == 0 {
		return 0, false
	}
	capMicros := table[len(table)-1].MaxMicros
	if bidMicros >= capMicros {
		return capMicros, true
	}
	var lo int64
	for _, r := range table {
		if bidMicros < r.MaxMicros {
			return lo + (bidMicros-lo)/r.IncrementMicros*r.IncrementMicros, true
		}
		lo = r.MaxMicros
	}
	return capMicros, true
}

// HbPb formats a bucket the way the line items' key-values are written.
func HbPb(bucketMicros int64) string {
	return fmt.Sprintf("%d.%02d", bucketMicros/1_000_000, bucketMicros%1_000_000/10_000)
}
```

```rust tab="Rust"
/// One row of a price granularity table: buckets of `increment_micros`
/// from the previous range's max up to `max_micros`, all in CPM micros.
pub struct Range {
    pub max_micros: i64,
    pub increment_micros: i64,
}

/// Prebid's "dense" table: $0.01 to $3, $0.05 to $8, $0.50 to $20.
pub const DENSE: &[Range] = &[
    Range { max_micros: 3_000_000, increment_micros: 10_000 },
    Range { max_micros: 8_000_000, increment_micros: 50_000 },
    Range { max_micros: 20_000_000, increment_micros: 500_000 },
];

/// Rounds a bid down to its bucket and caps it at the last max.
/// Negative bids are invalid and return None.
pub fn bucket(bid_micros: i64, table: &[Range]) -> Option<i64> {
    let cap = table.last()?.max_micros;
    if bid_micros < 0 {
        return None;
    }
    if bid_micros >= cap {
        return Some(cap);
    }
    let mut min = 0;
    for r in table {
        if bid_micros < r.max_micros {
            return Some(min + (bid_micros - min) / r.increment_micros * r.increment_micros);
        }
        min = r.max_micros;
    }
    Some(cap)
}

/// Formats a bucket the way the line items' key-values are written.
pub fn hb_pb(bucket_micros: i64) -> String {
    format!("{}.{:02}", bucket_micros / 1_000_000, bucket_micros % 1_000_000 / 10_000)
}
```

With the worked example's bids, `Bucket(3_870_000, Dense)` is 3,850,000 (`"3.85"`), 4,020,000 becomes 4,000,000 (`"4.00"`) and 1,190,000 stays 1,190,000 (`"1.19"`); 25,000,000 caps at 20,000,000 (`"20.00"`). Integer micros keep the floor exact, which floating-point CPMs do not: in double precision 0.29 / 0.01 is 28.999999999999996, so flooring it puts a $0.29 bid in the $0.28 bucket.

## How to Build It

Header bidding adds four things to the core model: which bidders are configured on which ad units, with what parameters and on which side; the wrapper's settings (timeouts, granularity, send-all-bids) as versioned configuration; the header auction as its own stage linked to the ad server's; and each header bid's bidder code, source, bucket and timing. The tables below are a publisher's, or a Prebid Server host's, view. `bid_requests` (one callout per bidder per auction, with latency and response status) is defined in How Programmatic Works and reused here; header auctions join to it by auction.

```sql
CREATE TABLE wrapper_configs (           -- a versioned header bidding setup for a property
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id           UUID NOT NULL REFERENCES properties (id),
  version               INT NOT NULL,
  wrapper               TEXT NOT NULL CHECK (wrapper IN ('prebid_js', 'prebid_server',
                          'prebid_mobile', 'aps', 'open_bidding', 'other')),
  wrapper_version       TEXT,            -- e.g. '11.53.0', pinned in the build
  auction_timeout_ms    INT NOT NULL CHECK (auction_timeout_ms > 0),
  s2s_timeout_ms        INT CHECK (s2s_timeout_ms > 0),
  failsafe_timeout_ms   INT,
  send_all_bids         BOOLEAN NOT NULL DEFAULT TRUE,
  always_include_deals  BOOLEAN NOT NULL DEFAULT TRUE,
  use_bid_cache         BOOLEAN NOT NULL DEFAULT FALSE,
  granularity_id        UUID NOT NULL,   -- price_granularities, below
  effective             TSTZRANGE NOT NULL,
  created_by            TEXT NOT NULL,
  UNIQUE (property_id, wrapper, version),
  CHECK (s2s_timeout_ms IS NULL OR s2s_timeout_ms < auction_timeout_ms),
  CHECK (failsafe_timeout_ms IS NULL OR failsafe_timeout_ms > auction_timeout_ms)
);

CREATE TABLE price_granularities (       -- a named bucket table; rows are immutable once used
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  name        TEXT NOT NULL,             -- 'dense', 'medium', or a custom name
  media_type  TEXT NOT NULL DEFAULT 'all' CHECK (media_type IN ('all', 'banner', 'video',
                'video_instream', 'video_outstream', 'native')),
  currency    CHAR(3) NOT NULL DEFAULT 'USD',
  UNIQUE (name, media_type, currency)
);

ALTER TABLE wrapper_configs ADD FOREIGN KEY (granularity_id) REFERENCES price_granularities (id);

CREATE TABLE price_granularity_buckets ( -- the ranges, as Prebid's custom granularity takes them
  granularity_id     UUID NOT NULL REFERENCES price_granularities (id),
  max_cpm_micros     BIGINT NOT NULL CHECK (max_cpm_micros > 0),
  increment_micros   BIGINT NOT NULL CHECK (increment_micros > 0),
  PRIMARY KEY (granularity_id, max_cpm_micros)
);

CREATE TABLE header_bidder_configs (     -- one bidder on one ad unit, with its parameters
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  wrapper_config_id UUID NOT NULL REFERENCES wrapper_configs (id),
  ad_unit_id        UUID NOT NULL REFERENCES ad_units (id),
  bidder_code       TEXT NOT NULL CHECK (bidder_code ~ '^[a-z0-9_]+$'),  -- Prebid's rule
  adapter           TEXT NOT NULL,       -- the adapter the code runs on; an alias may differ
  seller_account_id UUID REFERENCES seller_accounts (id),  -- the seller ID the params map to
  side              TEXT NOT NULL CHECK (side IN ('client', 'server')),
  params            JSONB NOT NULL,      -- the adapter's parameters, as the adapter documents them
  media_types       TEXT[] NOT NULL,
  enabled           BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (wrapper_config_id, ad_unit_id, bidder_code)
);

CREATE TABLE price_bucket_line_items (   -- which ad server line item matches which bucket
  granularity_id     UUID NOT NULL REFERENCES price_granularities (id),
  bidder_code        TEXT NOT NULL DEFAULT '',  -- '' under send-top-price
  bucket_cpm_micros  BIGINT NOT NULL CHECK (bucket_cpm_micros >= 0),
  key_name           TEXT NOT NULL CHECK (length(key_name) <= 20),  -- as the ad server stores it
  key_value          TEXT NOT NULL,      -- e.g. '4.00'
  line_item_id       UUID NOT NULL REFERENCES line_items (id),
  PRIMARY KEY (granularity_id, bidder_code, bucket_cpm_micros)
);
```

The header auction is an `auctions` row like any other, with a stage, the wrapper configuration it ran under, and a pointer to the ad server auction it fed. The header bids are `bids` rows with the bidder code, the side they came from, their bucket, their timing and the deal ID string the exchange sent (which may not be a `deals` row in this system):

```sql
ALTER TABLE auctions
  ADD COLUMN stage TEXT NOT NULL DEFAULT 'exchange',
  ADD COLUMN parent_auction_id UUID,     -- the ad server auction a header auction fed; joined by time
  ADD COLUMN wrapper_config_id UUID,
  ADD COLUMN timeout_ms INT;

ALTER TABLE auctions ADD CONSTRAINT auctions_stage_check
  CHECK (stage IN ('header', 'exchange', 'ad_server', 'mediation')) NOT VALID;
ALTER TABLE auctions ADD CONSTRAINT auctions_wrapper_config_fk
  FOREIGN KEY (wrapper_config_id) REFERENCES wrapper_configs (id) NOT VALID;

ALTER TABLE bids
  ADD COLUMN bidder_code TEXT,           -- the header bidder; null for non-header bids
  ADD COLUMN bid_source TEXT,            -- 'client' or 's2s': the page or Prebid Server
  ADD COLUMN bucket_cpm_micros BIGINT,   -- what the ad server compared
  ADD COLUMN response_ms INT,
  ADD COLUMN net_revenue BOOLEAN,        -- the adapter's netRevenue flag
  ADD COLUMN bid_currency CHAR(3),       -- as received, before conversion
  ADD COLUMN bid_cpm_micros_original BIGINT,
  ADD COLUMN external_deal_code TEXT,    -- dealId as the exchange sent it
  ADD COLUMN ttl_seconds INT,
  ADD COLUMN reused_bid_id UUID;         -- a cached bid entering a later auction

ALTER TABLE bids ADD CONSTRAINT bids_bid_source_check
  CHECK (bid_source IN ('client', 's2s')) NOT VALID;
ALTER TABLE bids ADD CONSTRAINT bids_bucket_le_price_check
  CHECK (bucket_cpm_micros IS NULL OR bucket_cpm_micros <= price_cpm_micros) NOT VALID;

ALTER TABLE bids DROP CONSTRAINT bids_outcome_check;
ALTER TABLE bids ADD CONSTRAINT bids_outcome_check
  CHECK (outcome IN ('won', 'lost', 'filtered', 'timed_out', 'rejected')) NOT VALID;

-- per partition, then attached to an index created ON ONLY the parent
CREATE INDEX CONCURRENTLY bids_2026112210_bidder_idx
  ON bids_2026112210 (bidder_code, auction_started_at);
```

Design notes:

- **The header auction is a stage, not the auction.** `auctions.stage = 'header'` rows hold the wrapper's view; the ad server's decision is a `stage = 'ad_server'` row, and the header row's `parent_auction_id` points at it. A header "win" is `bids.outcome = 'won'` on the header row only; whether it served is the ad server row's winner and the `ad_events` impression. Reporting "Prebid revenue" from header wins overstates it by every header winner that lost to a direct line item.
- **Store the bid and the bucket.** `price_cpm_micros` is what the exchange bid and will charge; `bucket_cpm_micros` is what the ad server compared. Their difference, summed, is the revenue the granularity cost, and it is the number that justifies a finer table.
- **Normalize currency once, keep the original.** Bids arrive in the exchange's currency, gross or net. Convert to the comparison currency at receipt with a recorded rate, keep the original price, currency and `net_revenue` flag, and never compare a gross bid to a net one ([Money & Amounts](/docs/money/amounts)).
- **Configuration is versioned and effective-dated.** A timeout change or a new bidder is a new `wrapper_configs` version with an `effective` range, and every auction records the version it ran under, so a revenue change can be attributed to a change ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)). Experiments on timeouts or bidders split traffic by version.
- **Bidder parameters map to seller accounts.** An adapter's `params` contain the publisher's account at that exchange; `header_bidder_configs.seller_account_id` makes that explicit so the ads.txt line for that seller ID can be checked against what the page actually calls ([ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain)).
- **Line items are generated, mapped and checked.** `price_bucket_line_items` is the source the ad server's line items are generated from and checked against; `key_name` is limited to the 20 characters the ad server keeps.
- **Late and timed-out bids are rows.** A bid that arrived after the timeout is a `bids` row with `outcome = 'timed_out'` and its `response_ms`; without it, a slow bidder looks like a bidder that never bid.
- **Losing bids come from the wrapper's events.** The ad server never sees them; the analytics adapter's events (or Prebid Server's logs) are the source, sampled consistently by auction so a sampled auction keeps all its bids.

## Auditing

- **Every bucket has a working line item.** Daily, for each active granularity and bidder: every bucket in `price_bucket_line_items` has a line item that is active, priced at the bucket, targeting the right (truncated) key and value, with creatives for every size the ad units request. A missing bucket is a price at which a bidder can never win.
- **Header wins against ad server outcomes.** For a sample of auctions, the header winner's bucket, the ad server's chosen line item and the impression event agree; a header winner whose bucket matched no line item, or a Prebid line item that served without a matching header bid, is a setup defect.
- **Timeout and bid rate per bidder.** Bid rate, timeout rate, median and 95th percentile response time per bidder and side, by wrapper version, so a bidder that degrades or a timeout change that drops bids is visible the next day ([Alert Design](/docs/observability/dashboards-and-alerts#alert-design)).
- **Exchange revenue against header records.** Each exchange's reported revenue per day against the sum of its won-and-served header bids at their bid prices; a large gap means gross bids, currency errors or cached bids counted twice.
- **Consent applied before each callout.** For sampled auctions, the consent state on the request and the set of bidders called agree with the enforcement rules: no bidder without a vendor ID called where GDPR applied, no ID module run where storage was not permitted.
- **Configuration history.** Who changed a timeout, a bidder or a granularity and when, in [Audit Trails](/docs/building-blocks/audit-trails), so revenue changes trace to configuration changes.

## What This Means for the System You Build

- **Model three auction stages** (header, exchange, ad server) as separate `auctions` rows linked to each other, and only call an impression won when the ad server stage and an impression event say so.
- **Keep the bid and its bucket,** in integer micros, and measure what the granularity costs.
- **Nest the timeouts** (failsafe above auction above Prebid Server above each exchange's `tmax`) and record every timed-out bid as a row.
- **Generate ad server line items from the granularity table** and check every bucket daily, with key names that survive the ad server's truncation.
- **Version the wrapper configuration** with effective dates, and tag every auction with the version it ran under.
- **Collect the wrapper's events** into the same bid records as the server side; they are the only record of losing bids and timeouts.
- **Gate every bidder, ID module and sync on consent,** and give every adapter its vendor ID.
- **Normalize currency and net versus gross once,** at receipt, and keep the original.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), the bid request Prebid Server accepts, `tmax`, EIDs and the `regs.gpp` and `gpp_sid` fields

**Reference**

- [Prebid: Introduction](https://docs.prebid.org/overview/intro.html), Prebid.js, Prebid Server and Prebid Mobile, more than 300 demand partners, and Prebid.org membership
- [Prebid.js: setConfig reference](https://docs.prebid.org/dev-docs/publisher-api-reference/setConfig.html), bidderTimeout, the standard price granularities and their ranges, mediaTypePriceGranularity, enableSendAllBids, targetingControls, useBidCache, userSync defaults, cache.url, ttlBuffer and maxBid
- [Prebid.js: Prebid Server module (s2sConfig)](https://docs.prebid.org/dev-docs/modules/prebidServer.html), s2sConfig fields, the 75%-or-750 ms timeout default, the 200-300 ms recommendation and the 60-second default TTL
- [Prebid: Timeouts](https://docs.prebid.org/features/timeouts.html), the failsafe, auction and Prebid Server timeouts and the 50% to 75% range
- [Prebid: Price granularity for ad ops](https://docs.prebid.org/adops/price-granularity.html), rounding down, that rounding doesn't change the price paid, line item counts for auto and dense, and currency notes
- [Prebid: Send all bids versus top price](https://docs.prebid.org/adops/send-all-vs-top-price.html), bidder-suffixed keys, 20-character truncation and line item counts
- [Prebid: Google Ad Manager step-by-step setup](https://docs.prebid.org/adops/step-by-step.html), 450 line items per order, price priority 12, rates per bucket, one creative per size, and the 201 and 1,002 line item counts
- [Prebid: Deals for ad ops](https://docs.prebid.org/adops/deals.html), `hb_deal_BIDDERCODE` keys, deal line item dates and priority
- [Prebid: Ad server key-values](https://docs.prebid.org/features/adServerKvps.html), hb_pb, hb_deal, hb_format, hb_adid, hb_size, hb_uuid, hb_source, auctionKeyMaxChars and alwaysIncludeDeals
- [Prebid Server: OpenRTB auction endpoint](https://docs.prebid.org/prebid-server/endpoints/openrtb2/pbs-endpoint-auction.html), the request extensions, stored requests, bidder parameters, tmax handling on PBS-Go and PBS-Java, response times and error codes, the targeting and cache keys, hb_env and price granularity ranges
- [Prebid Server: Overview](https://docs.prebid.org/prebid-server/overview/prebid-server-overview.html), server-to-server header bidding, its uses for app, AMP, CTV, DOOH and audio, stored requests and Prebid Cache
- [Prebid Mobile](https://docs.prebid.org/prebid-mobile/prebid-mobile.html), the GAM bidding-only, Prebid-rendered and mediation integrations through Prebid Server
- [Prebid.js: User ID module](https://docs.prebid.org/dev-docs/modules/userId.html), submodules, storage, EIDs to adapters, secure signals and consent gating
- [Prebid.js: TCF consent management module](https://docs.prebid.org/dev-docs/modules/consentManagementTcf.html), cmpApi, the 10,000 ms timeout, defaultGdprScope, gdprConsent to adapters and tcfControl
- [Prebid.js: GPP consent management module](https://docs.prebid.org/dev-docs/modules/consentManagementGpp.html), the GPP string and sections in ortb2.regs and the usnat activity control
- [Prebid.js: Bidder adapter guide](https://docs.prebid.org/dev-docs/bidder-adaptor.html), adapter functions, required bid fields, netRevenue, ttl, gvlid and bidder code rules
- [Prebid.js: Events](https://docs.prebid.org/dev-docs/publisher-api-reference/getEvents.html), the auction, bid, targeting and render events
- [Prebid.js: Analytics adapters](https://docs.prebid.org/overview/analytics.html), enabling an analytics adapter
- [Prebid.js: Releases](https://github.com/prebid/Prebid.js/releases), 11.53.0 on November 20, 2026 and the release cadence

**In practice**

- [Amazon Publisher Services: Transparent Ad Marketplace](https://aps.amazon.com/aps/transparent-ad-marketplace/), the single server-to-server call, formats, the 2.5% bidder fee, UAM and the multi-slot tag requirement
- [Google Ad Manager: Open Bidding](https://support.google.com/admanager/answer/7128453?hl=en), server-to-server yield partners, yield groups with mediation, deals priority, deal-eligible partners and contracts
- [Google Ad Manager: Header bidding trafficking with the Prebid wrapper](https://support.google.com/admanager/answer/12273163?hl=en), GPT reading Prebid bids, web display only, and the Header bidding demand channel
- [Google Ad Manager: Line item types and priorities](https://support.google.com/admanager/answer/177279?hl=en), price priority at 12 alongside network, bulk, AdSense and Ad Exchange
- [Google: Rolling out first price auctions to Google Ad Manager partners](https://blog.google/products/admanager/rolling-out-first-price-auctions-google-ad-manager-partners/), the September 2019 move to a unified first-price auction

**Court records**

- [United States v. Google LLC, E.D. Va. No. 1:23-cv-00108, Memorandum Opinion (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), header bidding's adoption in 2015, the header bid as a floor against AdX, First Look and Last Look, and Open Bidding's 5% fee and why it was not a substitute

**Secondary**

- [National Law Review: Court declines to order AdX divestiture (September 18, 2026)](https://natlawreview.com/article/court-declines-order-adx-divestiture-google-ad-tech-case), the reported remedies: Prebid integrations to solicit AdX bids, AdX bids for rival ad servers, and the ban on First Look, Last Look and Unified Pricing Rules for indirect transactions
