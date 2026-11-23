+++
title = "SSPs & Ad Exchanges"
description = "The sell side: seller onboarding, floors and blocks, traffic shaping, the exchange auction, fees and contribution ex-TAC, and the major SSPs compared."
category = "Advertising Industry"
order = 2917
part = "Programmatic"
tags = ["advertising", "ad-tech", "programmatic", "ssp", "ad-exchange", "data-model"]
+++

A supply-side platform (SSP) sells a publisher's ad impressions to programmatic buyers, and an ad exchange is the marketplace where that sale happens: it receives an impression from a publisher's ad server, a header bidding wrapper or another exchange, sends bid requests to the DSPs it is connected to, runs an auction among their bids, and returns the winner. Every large company that does one does the other, so this chapter uses "SSP" for the company and its publisher tools and "exchange" for the auction. Magnite, which calls itself the largest independent sell-side advertising company, reported $714.0 million of revenue in 2025; PubMatic said it processed "nearly 336.8 trillion impressions" that year.

The sell side is hard for different reasons than the buy side. An SSP has to know, for every request, who is really selling (the publisher, or one of several resellers), what the publisher allows (floors, blocked advertisers and categories, deals), which of hundreds of buyers want this impression enough to be worth a callout, and how to run an auction whose rules it must be able to disclose and defend. It takes its fee from the clearing price, so its revenue depends on the publisher's trust that the fee is what was agreed, and on the buyer's trust that the auction is what was described. And it is paid by DSPs on net terms while it pays publishers on its own, so it carries money between them.

This chapter covers what an SSP runs, seller onboarding and inventory mapping, floors and blocks, traffic shaping, the exchange auction and what it must disclose, fees and how SSPs report revenue (gross, net and contribution ex-TAC), ad quality on the sell side, CTV, and reporting and payouts, then the records. It extends `seller_accounts` and `auctions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), adds the bidder connection that [How Programmatic Works](/books/advertising/how-programmatic-works#how-to-build-it) leaves open, and reuses `fee_schedules` from [Demand-Side Platforms](/books/advertising/demand-side-platforms#how-to-build-it). Floors and yield management in depth are Floors & Yield Optimization; auction theory is Auction Mechanics; header bidding is [Header Bidding & Prebid](/books/advertising/header-bidding-and-prebid); deals are [Deals, PMPs & Curation](/books/advertising/deals-and-curation); sellers.json and ads.txt are [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain); publisher payouts as money movement are Payments' [Payouts & Settlement](/books/payments/payouts-and-settlement); query-per-second engineering is Real-Time Bidding at Scale.

## How the Platforms Do It

As of November 2026, from each company's pages, filings and the court record:

| SSP or exchange | Owner | Channels and products | Figures disclosed |
| --- | --- | --- | --- |
| **Google Ad Exchange (AdX)** | Alphabet | Open-web display, video and app through Ad Manager; Authorized Buyers for outside bidders; Open Bidding for rival exchanges inside Ad Manager | Overall take rate "around 20%" per the court record; Open Bidding "a 5% fee"; Google Network revenue $29.8 billion in 2025 |
| **Index Exchange** | Private | Streaming TV, online video, app developers; Index Cloud, "a neutral compute environment for decisioning closer to when impressions originate"; inventory packages | Not public |
| **Magnite** | Public company | "Streaming, online video, display, audio"; DV+, ClearLine, SpringServe; Showcase packages inventory "for discovery by buyer agents" | 2025 revenue $714.0 million, contribution ex-TAC $669.6 million, 45% from CTV; third quarter 2026 contribution ex-TAC $200.6 million, CTV $105.4 million |
| **Microsoft Monetize** | Microsoft | SSP and publisher ad server; joined Amazon's Certified Supply Exchange; Curate for curation | Not broken out |
| **OpenX** | Private | "The Intelligent SSP"; OpenXSelect for curation and deal creation, OpenXBuild, OpenXExchange, OpenXControl | Not public |
| **PubMatic** | Public company | Web, app and CTV supply; Activate for buyers | 2025 revenue $282.9 million, down from $291.3 million; "nearly 336.8 trillion impressions processed in 2025" |

Three patterns:

- **CTV carries the independents.** Magnite's CTV contribution was 45% of the total in 2025 and grew 39% in the third quarter of 2026; PubMatic's CTV revenue outside political spend grew over 50% in 2025. Magnite's DV+ business grew 5% in that quarter against CTV's 39%, so video pods, live events and SSAI are where the growth, and the engineering effort, go.
- **SSPs are moving toward the buyer.** Curation products (OpenXSelect, Microsoft Curate, Magnite's packages, Index's inventory packages) let the SSP assemble inventory and data into deals a DSP buys, and Magnite's Showcase is built for "buyer agents." The SSP is no longer only the publisher's tool.
- **A few buyers are most of the money.** PubMatic's first-quarter 2026 guidance named an impact "from one of our top DSP buyers" without naming it; when one DSP changes how it buys (moving spend to a direct path, changing its shading), an SSP's revenue moves with it.

## What an SSP Runs

**Seller onboarding.** A publisher (or an intermediary) signs up and gets a seller account: a seller ID that the SSP publishes in its sellers.json, with a seller type (PUBLISHER, INTERMEDIARY or BOTH), a name and a business domain unless the account is confidential. The publisher must list that seller ID in its ads.txt or app-ads.txt as DIRECT, and an intermediary's publishers list it as RESELLER. Onboarding is also where the SSP runs its own checks: who owns the domain or app, whether the traffic looks real, whether the content meets the SSP's policies, and the tax and payout details it needs to pay. sellers.json and ads.txt are [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain).

**Inventory mapping.** The publisher's ad units (from its tags, its Prebid configuration, its ad server or its SDK) are mapped to the SSP's own site, app, zone or placement IDs, which carry the floors, blocks and deals. A request that arrives with an unknown placement can still be sold, but with the SSP's defaults rather than the publisher's rules, and that difference should be visible in reporting.

**Demand connections.** The SSP connects to DSPs: each connection is an endpoint per region, a protocol (OpenRTB JSON or Protobuf, a 2.6 release), a deadline, a queries-per-second cap and the DSP's declared filters. The SSP is a buyer of DSP attention: it can send each DSP only as many requests as the DSP will accept, so which requests it sends is as much a product decision as which bids it accepts.

**The auction and the response.** For each request: enrich, select bidders, fan out, collect, validate, apply fees, choose the winner, and return it to the caller (an ad server, a wrapper, another exchange or an SSAI service) with the right price for that caller's comparison.

**Reporting, billing and payouts.** Publisher-facing reports (requests, bids, wins, impressions, revenue by placement, deal and buyer), buyer-facing reports and log-level data, invoices to DSPs, and statements and payouts to publishers.

## Floors and Blocks

Every request carries the publisher's rules into the auction.

**Floors.** A floor is the minimum price the publisher will accept, per impression, as a CPM in OpenRTB's `bidfloor` (and per deal in `deal.bidfloor`). Floors can be set per placement, size, geography, device, buyer or advertiser category, and can be static or set by a model that predicts what the impression would clear at. The basis matters: Google Ad Manager's pricing rules apply to the value of a bid after Google's revenue share, so a $1.00 bid on an 80/20 split is worth $0.80 against the floor; an SSP that sends a DSP a floor must say whether it is the price the DSP pays (gross) or the price the publisher receives (net), and the DSP must know which. Google's pricing rules "centralize the management of auction floor prices for your non-guaranteed demand", up to 200 per network, and apply to the open auction, private auctions, Open Bidding, remnant line items and header bidding trafficking, but not to programmatic direct deals. The MRC's auction transparency standards add a constraint any exchange should adopt, though the standard states it for closed-loop auctions that don't use OpenRTB: reserve prices must be reported to participants before and after the auction and "should not be set on a per-buyer basis." Floors & Yield Optimization covers floor setting and experiments.

**Blocks.** The publisher's blocklists ride in the request so DSPs can avoid wasted bids: `badv` (advertiser domains), `bcat` with `cattax` (categories in a taxonomy), `battr` (creative attributes such as auto-play audio), `bapp` (competing apps). The exchange enforces them again on the response, because a DSP may misdeclare or ignore them: a bid whose `adomain` or `cat` is blocked is filtered with loss reason 205 ("Advertiser Exclusions") or 209 ("Category Exclusions").

**Competitive separation.** In a video pod, the exchange or ad server must not place two ads from the same category or advertiser in one break, which needs the bid's declared category and advertiser and is one reason CTV bids must carry both. The pod is sketched in [A CTV Ad Pod](/books/advertising/advertising-business#a-ctv-ad-pod) and covered in Server-Side Ad Insertion & Ad Pods.

## Traffic Shaping

An SSP receives far more impression opportunities than any DSP wants to see, and sending every request to every DSP costs both sides bandwidth and compute for requests that end in a no-bid. Traffic shaping is choosing, per request, which bidders to call.

Two kinds of shaping stack:

- **Declared filters.** The DSP tells the exchange what it wants: formats, sizes, geographies, devices, publishers, deals. Google's Authorized Buyers calls this pretargeting: buyers "receive requests for only the impressions that match your targeting criteria." The exchange applies the filters before any callout.
- **Capacity and learned shaping.** Each connection has a callout limit; Google's quota system "guarantees that an endpoint does not get more callouts than its callout limit", manages quota across four trading locations (North America East, North America West, Europe and Asia Pacific), allows up to 8 endpoints per location, and when an endpoint "has high callout error rate, the system lightens its load", shifting callouts to spare endpoints or dropping excess impressions. Beyond the caps, an exchange can predict whether each DSP will bid on this request (from its history of bids by publisher, placement, user availability and price) and skip the DSPs unlikely to bid. <!-- source-gap: adv-ssp-learned-shaping | missing | public documentation of a sell-side platform's model-based traffic shaping (predicting bid likelihood to choose callouts) | closes with: an SSP's public developer or help documentation describing its traffic shaping model and inputs | checked: 2026-11-22 -->

Shaping has a cost the seller bears: a request not sent is a bid not received. My rules: keep a random exploration share of traffic that goes to every eligible bidder regardless of the model, so the model keeps learning what it would have missed; report to each DSP the volume it was eligible for and the volume it was sent; and treat a deal as a reason to send, never as a request to shape away, because a deal ID is a buyer saying it wants this inventory.

## The Exchange Auction

The exchange collects bids until its deadline ("All responses received after the deadline will be excluded from the auction", in Google's words), then:

1. **Validates** each bid: the impression exists, the creative is approved or pending under policy, the advertiser and category aren't blocked, the size or markup type matches, the deal was offered and the seat is allowed, the price is at or above the floor. Each failure is a loss reason ([No-bid and loss reasons](/books/advertising/openrtb#no-bid-and-loss-reasons)).
2. **Applies its fee.** The buyer's bid is a gross price; the value to the publisher is net of the exchange's fee. Whether floors are compared before or after the fee is a disclosed rule.
3. **Ranks.** Deals first where the deal terms require it (a programmatic guaranteed deal must win its booked impressions; a preferred deal gets first look at a fixed price), then the highest qualifying bid. Loss reason 103 ("Lost to a Bid for a Deal") exists because deals often outrank higher open-auction bids.
4. **Prices.** In a first-price auction the winner pays its bid; in a second-price auction, the second-highest qualifying bid or the floor plus an increment. A deal with `at = 3` clears at its agreed price.
5. **Returns** the winner to the caller. To a header bidding wrapper or an upstream exchange, it returns the bid at the price that caller compares: net of this exchange's fee, so the publisher's ad server compares like with like.
6. **Notifies** the winner (`nurl`) and, where policy allows, the losers (`lurl`) with the loss reason and, at some exchanges, the minimum bid that would have won, and fires `burl` when the impression becomes billable under its policy.

The MRC's Digital Advertising Auction Transparency Standards, final in January 2026, split their requirements. For auctions run over OpenRTB they require the transaction ID, the Global Placement ID (`gpid`) and a complete SupplyChain object, with reporting against them; the pricing disclosures are written for closed-loop auctions that don't use OpenRTB: the auction type (first, second or modified second price) and how a bid becomes a clearing price, without requiring proprietary algorithm detail; reserve prices before and after the auction, not set per buyer; and fees, which the standard encourages applying before the auction ("net bidding") with discounts after, both disclosed. My rule is to meet the closed-loop disclosures on an open exchange too, because a buyer asks the same questions of both. The court record in the US ad tech case shows what happens when an exchange's rules favor its own side: First Look gave AdX the first opportunity at Ad Manager impressions, Last Look let AdX see the best header bid and beat it, and Unified Pricing Rules (2019) "did not require a level playing field"; the remedies ban those practices for indirect transactions ([The Google Ad Tech Cases](/books/advertising/google-ad-tech-cases)).

## Fees, Revenue and Contribution ex-TAC

An exchange's fee is a share of the clearing price (a sell-side fee taken from what the publisher would receive), sometimes plus a buy-side fee charged to the DSP. With a $5.00 CPM clearing price and a 15% sell-side fee (an example rate), the publisher is owed $4.25 CPM and the exchange keeps $0.75 CPM. Disclosed rates are scarce and the court record is the best public source: AdX's overall take rate was "around 20%", varied per impression under its dynamic revenue share (15% or lower on some, 25% or higher on others), publisher ad server fees typically averaged "about 1% to 2%" of the impression's revenue for large publishers, Open Bidding charged rival exchanges "a 5% fee", and Amazon's TAM charges bidders "a transparent 2.5% service fee". The ISBA and PwC 2020 study found SSP fees of about 8% of advertiser spend and Exchange Bidding (Open Bidding) fees of about 1%.

How an SSP books that money depends on whether it acts as principal or agent, and the public SSPs show both and report a non-GAAP measure that removes the difference:

- **Revenue** may be gross (the whole clearing price, with the publisher's share as cost) where the SSP is principal, or net (only its fee) where it is agent. Magnite's revenue ($714.0 million in 2025) is higher than its contribution ex-TAC by the traffic acquisition cost on business it books gross.
- **Contribution ex-TAC** (revenue less traffic acquisition cost, the amount paid to publishers on gross-booked business) is the figure the SSPs steer by: Magnite's was $669.6 million in 2025, up 10%, with a 2026 target of at least 11% growth. Criteo, a buy-side company with the same accounting choice, reported $1,944.9 million of revenue and $1,174.6 million of contribution ex-TAC.

For an engineer the rule is the same as on the buy side: store the clearing price, the fee schedule applied and the publisher's share as separate amounts per impression or per delivery row, and let finance decide which total is revenue under its principal-versus-agent judgment (Advertising Revenue Accounting). An SSP that stores only its fee cannot produce a gross-booked revenue line, and one that stores only the gross cannot show a publisher its share.

## Ad Quality on the Sell Side

The exchange is the last system that can stop a bad ad before it reaches the publisher's page. Its controls:

- **Creative review.** Bids name a creative ID (`crid`) and often a sample image (`iurl`); the exchange scans new creatives (malware, redirects, prohibited content, misdeclared categories) and holds them as pending, approved or disapproved. Loss reasons 201 (pending) and 202 (disapproved) are the signals the DSP sees.
- **Advertiser and category enforcement.** The publisher's `badv` and `bcat` are enforced on the response, not trusted to the DSP.
- **Supply quality.** The exchange screens its own sellers: invalid traffic, made-for-advertising sites, domain spoofing, and resellers that misrepresent inventory, because a DSP's supply path rules will cut the whole exchange if its supply looks bad. Invalid Traffic & Ad Fraud and Ad Review, Policies & Malvertising cover the detection.

## CTV and the SSP

CTV requests look different. They come from an SSAI service or a CTV ad server rather than a device, so the device's IP and user agent arrive in forwarded headers (IAB Tech Lab's CTV guidance requires ad stitching providers to send `X-Device-IP` and `X-Device-User-Agent` on their ad tracking requests), the identifier is the device's IFA with an `ifa_type` (Microsoft's documentation lists values including `aaid`, `idfa`, `rida`, `tifa` and `vida`), and the request is a pod with `poddur`, `maxseq` and `mincpmpersec`. The exchange must fill the pod by value per second under competitive separation and return several bids at once. Magnite runs both sides of that path, a CTV ad server (SpringServe) and the exchange. Pods and SSAI are covered in Server-Side Ad Insertion & Ad Pods and Connected TV & Streaming.

## Reporting and Payouts

An SSP sends money two ways. It invoices DSPs for cleared impressions (on the billing notices it fired, net of credits for invalid traffic), and it pays publishers their share on its own schedule, often before or regardless of when the DSP pays. Publisher statements are `invoices` rows with `direction = 'payable'`, with lines tied to placements and deals; holds and clawbacks for invalid activity found later mirror Payments' [Clawbacks](/books/payments/payouts-and-settlement#clawbacks), and the payout as money movement is that volume's. Publisher Payouts & Revenue Share covers thresholds, net terms and tax forms.

The reports both sides ask for are the same funnel at different grains: requests received, requests sent per bidder, bids, wins, impressions, revenue and clearing price, per placement, deal, buyer and day, with the loss reasons that explain the gaps. Log-level data, one row per impression with its price and fee, is what a buyer needs to audit the supply chain end to end, and what the ISBA studies needed to match spend from advertiser to publisher.

## How to Build It

The sell side adds the connection to each DSP (endpoint, region, protocol, deadline, capacity) and its declared filters, puts the seller account and fee on each auction so the publisher's net is computed rather than typed, and closes the foreign key `bid_requests` left open. Floors in depth (`pricing rules`, experiments) belong to Floors & Yield Optimization; the auction row here records the floor that applied and its basis.

```sql
CREATE TABLE bidder_connections (        -- an exchange's configured endpoint for one bidder
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  exchange_org_id    UUID NOT NULL REFERENCES organizations (id),
  bidder_org_id      UUID NOT NULL REFERENCES organizations (id),  -- the DSP or downstream exchange
  region             TEXT NOT NULL,      -- the trading location: e.g. 'us-east', 'eu', 'apac'
  endpoint_url       TEXT NOT NULL,
  protocol           TEXT NOT NULL CHECK (protocol IN ('openrtb_json', 'openrtb_protobuf')),
  openrtb_release    TEXT NOT NULL,      -- e.g. '2.6-202611'
  tmax_ms            INT NOT NULL CHECK (tmax_ms > 0),
  max_qps            INT CHECK (max_qps > 0),   -- callout limit; null = no explicit cap
  gzip               BOOLEAN NOT NULL DEFAULT TRUE,
  exploration_bp     INT NOT NULL DEFAULT 100 CHECK (exploration_bp BETWEEN 0 AND 10000),
                                         -- share of eligible traffic sent regardless of shaping
  status             TEXT NOT NULL CHECK (status IN ('testing', 'active', 'paused', 'closed')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (exchange_org_id, bidder_org_id, region, endpoint_url)
);

CREATE TABLE connection_filters (        -- a bidder's declared filters (pretargeting), versioned
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  bidder_connection_id   UUID NOT NULL REFERENCES bidder_connections (id),
  version                INT NOT NULL,
  include                JSONB NOT NULL DEFAULT '{}',  -- e.g. {"formats":["video"],"countries":["US"]}
  exclude                JSONB NOT NULL DEFAULT '{}',  -- e.g. {"publishers":["pub-91"]}
  max_qps                INT CHECK (max_qps > 0),      -- a cap for this filter within the connection's
  effective              TSTZRANGE NOT NULL,
  submitted_by           TEXT NOT NULL,  -- the bidder's API user or the exchange's operator
  UNIQUE (bidder_connection_id, version)
);

ALTER TABLE bid_requests ADD CONSTRAINT bid_requests_connection_fk
  FOREIGN KEY (bidder_connection_id) REFERENCES bidder_connections (id) NOT VALID;
ALTER TABLE bid_requests
  ADD COLUMN shaping TEXT;               -- why this callout was sent: 'eligible', 'exploration', 'deal'
ALTER TABLE bid_requests ADD CONSTRAINT bid_requests_shaping_check
  CHECK (shaping IN ('eligible', 'exploration', 'deal')) NOT VALID;

ALTER TABLE auctions
  ADD COLUMN seller_account_id UUID,     -- whose inventory this exchange sold
  ADD COLUMN floor_basis TEXT,           -- 'gross' (buyer pays) or 'net' (after this exchange's fee)
  ADD COLUMN fee_schedule_id UUID,       -- the fee applied to the clearing price
  ADD COLUMN fee_cpm_micros BIGINT,      -- this exchange's fee on the winning price
  ADD COLUMN seller_net_cpm_micros BIGINT,  -- clearing price less the fee: what the seller is owed
  ADD COLUMN eligible_bidders INT;       -- bidders whose filters matched, before capacity and shaping
ALTER TABLE auctions ADD CONSTRAINT auctions_seller_account_fk
  FOREIGN KEY (seller_account_id) REFERENCES seller_accounts (id) NOT VALID;
ALTER TABLE auctions ADD CONSTRAINT auctions_fee_schedule_fk
  FOREIGN KEY (fee_schedule_id) REFERENCES fee_schedules (id) NOT VALID;
ALTER TABLE auctions ADD CONSTRAINT auctions_floor_basis_check
  CHECK (floor_basis IN ('gross', 'net')) NOT VALID;
ALTER TABLE auctions ADD CONSTRAINT auctions_net_check
  CHECK (seller_net_cpm_micros IS NULL OR
         seller_net_cpm_micros = clearing_cpm_micros - fee_cpm_micros) NOT VALID;
```

The report a publisher and the exchange both read is the funnel per placement and buyer, from the same rows:

```sql
-- Per seller account, bidder and day: eligible, sent, bids, wins, and the publisher's net revenue.
SELECT a.seller_account_id,
       br.bidder_org_id,
       a.started_at::date                                        AS day,
       sum(a.eligible_bidders)                                   AS eligible_callouts,
       count(br.id)                                              AS sent,
       count(br.id) FILTER (WHERE br.status = 'bid')             AS bid_responses,
       count(b.id)  FILTER (WHERE b.outcome = 'won')             AS wins,
       sum(a.seller_net_cpm_micros / 1000) FILTER (WHERE b.outcome = 'won') AS seller_net_micros
FROM auctions a
JOIN bid_requests br ON br.auction_id = a.id AND br.auction_started_at = a.started_at
LEFT JOIN bids b     ON b.auction_id = a.id AND b.auction_started_at = a.started_at
                    AND b.id = a.winning_bid_id
WHERE a.started_at >= now() - interval '1 day'
GROUP BY 1, 2, 3;
```

The sketch counts `eligible_bidders` once per callout row; a production report rolls eligibility up separately per auction before joining, and reads wins and revenue from billing notices rather than from auction outcomes, since a won auction is not yet a billable impression.

Design notes:

- **The connection is configuration with a history.** Endpoints, deadlines, caps and filters change often and are negotiated with the bidder; versioned `connection_filters` with effective ranges answer "why did our volume drop on Tuesday" ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Shaping is recorded on the callout.** `shaping` says whether a request went out because it matched, because it was in the exploration share, or because it carried the bidder's deal; the exploration share is what keeps a shaping model honest.
- **The publisher's net is computed and checked.** `seller_net_cpm_micros` equals the clearing price less the fee from a named schedule, enforced by a check, so a publisher statement line is a sum of auction rows and never a typed number.
- **Floors carry their basis.** `floor_basis` records whether the floor was compared against the buyer's price or the seller's net, which is the first question in any floor dispute.
- **Fees come from the shared fee table.** The exchange's sell-side and buy-side fees, a curator's fee and Open Bidding-style fees are all `fee_schedules` rows ([Demand-Side Platforms](/books/advertising/demand-side-platforms#how-to-build-it)), so the take on any path is one query.
- **Billable is the billing notice.** Invoices to DSPs and statements to publishers read the billing notices rolled into `delivery_daily` with `source = 'exchange'`, not auction wins.

## Auditing

- **Every auction's rules and outcome.** Type, floor and its basis, bids, winner, clearing price, fee and the seller's net, kept for the dispute window, because the MRC's standards and the US court record both make the auction's rules the thing to prove.
- **Every callout and why it was sent.** Eligible bidders, the ones called, the shaping reason, and the ones dropped by capacity, for the DSP asking where its volume went.
- **Every fee as applied.** The schedule and agreement version on each auction and statement line, so a publisher can verify the fee it agreed to and an auditor can recompute the take.
- **Every seller account and its sellers.json state.** Seller type, confidentiality and the onboarding checks, for the buyer tracing a supply path and the regulator asking who was paid.

## What This Means for the System You Build

- **Onboard sellers with a published identity:** a seller ID in sellers.json, matched to the publisher's ads.txt, with checks before the first auction.
- **Carry the publisher's floors and blocks into every request** and enforce them again on every response.
- **Shape traffic with declared filters and capacity first,** keep an exploration share, and never shape away a deal.
- **Disclose the auction:** type, bid-to-clearing rule, floors not set per buyer, and fees, as the MRC's standards require of closed-loop auctioneers, and send `tid`, `gpid` and a complete `schain`, as they require over OpenRTB.
- **Return the net price to whoever compares it,** so ad servers compare like with like.
- **Store clearing price, fee and seller net as separate amounts** from a named fee schedule, and let finance choose gross or net.
- **Bill and pay on billing notices,** not auction wins, and point at the Payments model for payouts.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), bidfloor, badv, bcat, battr, bapp, the pod fields and notices
- [IAB Tech Lab: OpenRTB 3.0](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/main/OpenRTB%20v3.0%20FINAL.md), the loss reason codes cited
- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), OpenRTB requirements (tid, gpid, schain) and the closed-loop disclosures of auction type and clearing, reserve prices not set per buyer, fees and net bidding
- [IAB Tech Lab: CTV Programmatic Guide](https://iabtechlab.com/standards-old/ctv-programmatic-guide/), X-Device-IP and X-Device-User-Agent from stitchers

**Reference**

- [Google Authorized Buyers: Get started with real-time bidding](https://developers.google.com/authorized-buyers/rtb/start), the response deadline and late responses excluded
- [Google Authorized Buyers: Pretargeting](https://developers.google.com/authorized-buyers/rtb/target-guide), pretargeting, trading locations, endpoint callout limits, the quota system and error-rate load reduction
- [Google Ad Manager Help: Pricing rules](https://support.google.com/admanager/answer/9298008?hl=en), centralized floors, the 200-rule limit, scope and the programmatic direct exclusion
- [Google Ad Manager Help: Floors and revenue share](https://support.google.com/admanager/answer/9298211?hl=en), floors applied after revenue share
- [Amazon Publisher Services: Transparent Ad Marketplace](https://aps.amazon.com/aps/transparent-ad-marketplace/), the 2.5% service fee charged to bidders
- [Microsoft Learn: Required parameters for CTV inventory](https://learn.microsoft.com/en-us/xandr/monetize/required-parameters-for-ctv-inventory), ifa_type values
- [Microsoft Advertising: Collaboration with Amazon (October 2025)](https://about.ads.microsoft.com/en/blog/post/october-2025/unlocking-more-opportunities-for-partners-and-customers-through-collaboration-with-amazon), Monetize in Amazon's Certified Supply Exchange and the focus on Monetize and Curate
- [Index Exchange](https://www.indexexchange.com/), self-description, channels, Index Cloud and inventory packages
- [Magnite](https://www.magnite.com/), self-description, channels, products and Showcase
- [OpenX](https://www.openx.com/), self-description and products

**Filings**

- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Google Network revenue
- [Magnite: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000010/a991-earningsq42025.htm), revenue, contribution ex-TAC, the CTV share and the 2026 outlook
- [Magnite: Third quarter 2026 results](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000039/a991-earningsq32026.htm), contribution ex-TAC and CTV growth
- [PubMatic: Fourth quarter and full year 2025 results](https://www.sec.gov/Archives/edgar/data/1422930/000142293026000008/fy25pressrelease.htm), revenue, impressions processed, CTV growth and the top DSP buyer impact
- [Criteo: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1576427/000157642726000004/exhibit991q42025.htm), revenue against contribution ex-TAC

**Industry studies**

- [ISBA: Programmatic Supply Chain Transparency Study, executive summary (2020)](https://www.isba.org.uk/system/files/media/documents/2020-12/executive-summary-programmatic-supply-chain-transparency-study.pdf), SSP and Exchange Bidding fees as shares of spend

**Court records**

- [United States v. Google LLC, No. 1:23-cv-00108 (E.D. Va.), Memorandum Opinion, Dkt. 1410 (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), AdX's take rate and dynamic revenue share, publisher ad server fees, the Open Bidding fee, First Look, Last Look and Unified Pricing Rules
