+++
title = "Demand-Side Platforms"
description = "How a DSP bids: the bidder pipeline, seats and budgets, value and bid shading, supply selection, fees and gross spend, and the major DSPs compared."
category = "Advertising Industry"
order = 2916
part = "Programmatic"
tags = ["advertising", "ad-tech", "programmatic", "dsp", "bidding", "data-model"]
+++

A demand-side platform (DSP) is the buyer's software for programmatic advertising. An advertiser or agency sets up campaigns, line items, budgets, targeting and creatives in it; the DSP connects to dozens of exchanges, receives their bid requests, and for each one decides in a few milliseconds which of its line items, if any, should buy the impression and at what price. It then counts what it won, spends the budgets, reports to the buyer and pays the exchanges. The Trade Desk, the largest independent DSP, reported $13.4 billion of gross spend on its platform in 2025.

The hard part is that a DSP makes millions of small decisions per second with money attached, against inputs it doesn't control. It sees each impression only as one exchange describes it, it competes with other DSPs whose bids it can't see, the auction type and fees differ by exchange, the same impression can arrive through several exchanges at once, and the value of a win (a click, a sale, a view) arrives hours or days later if at all. Every bid has to respect budgets and frequency caps that other bidder servers are spending against at the same moment.

This chapter covers the parties and the account structure inside a DSP, the bidder pipeline from request to response, value estimation and bid shading, budgets, pacing and spend counters across a fleet, supply selection and supply path optimization, fees and gross versus net, and the major DSPs compared, including Microsoft's exit and Amazon's move to Amazon Ads Agent. It extends `buyer_seats`, `line_items` and `bids` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and uses `bid_requests` and `bid_notices` from [How Programmatic Works](/books/advertising/how-programmatic-works#how-to-build-it) and [OpenRTB](/books/advertising/openrtb#how-to-build-it). Line item setup and targeting as data are Campaigns & Line Items; pacing controllers are Pacing & Frequency Capping; automated bid strategies (tCPA, tROAS, value bidding) are Automated Bidding; pCTR and pCVR models are Machine Learning for Ads; the ads.txt and supply-chain checks are [ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain#what-a-dsp-checks); deals are [Deals, PMPs & Curation](/books/advertising/deals-and-curation). The advertiser's own workflow across ad platforms is Commerce's [Acquisition & Attribution](/books/commerce/acquisition-and-attribution).

## How the Platforms Do It

As of November 2026, from each company's pages and filings:

| DSP | Owner | Supply and channels | Business model disclosed | Notes |
| --- | --- | --- | --- | --- |
| **Amazon DSP (now DVA+ in Amazon Ads Agent)** | Amazon | "Amazon-owned properties and thousands of premium third-party publishers"; display, video, audio and streaming TV including Prime Video, Twitch, Thursday Night Football and Fire TV | Self-service and managed-service options; no fee figures published | Amazon DSP "is now part of Amazon Ads Agent", with programmatic buying through DVA+; Microsoft named it the preferred transition partner for Invest customers |
| **Display & Video 360** | Google | Exchanges a partner enables ("You must enable an exchange to" target its inventory), public inventory, deals and auction packages, YouTube | Google stated a 15% standard DV360 rate in 2020 | Hierarchy advertiser, campaign, insertion order, line item; formerly DoubleClick Bid Manager |
| **Microsoft Invest** | Microsoft | Closed to buying | Not applicable | Microsoft stopped media buying through Invest from February 28, 2026, keeping Monetize (SSP) and Curate |
| **The Trade Desk** | Public company | Open internet across CTV, audio, display, through exchanges and OpenPath ("a simplified, direct connection to publishers") | "a platform fee generally based on a percentage of our clients' total platform spend"; reports "as an agent on a net basis" | 2025 revenue $2,896 million on $13.4 billion gross spend; Kokai is "our most recent and major upgrade to our platform" |
| **Yahoo DSP** | Yahoo | CTV, native, audio, digital out-of-home and display; Backstage, "Exclusive access to premium ad inventory with a direct path to top-tier supply" | Not published | Backstage described as "certified MFA-free by Jounce Media" |

Three patterns:

- **A DSP is a percentage of spend.** The Trade Desk's revenue is a fee on its clients' spend, about 21.6% of 2025 gross spend if revenue is divided by gross spend (it doesn't publish that as a take rate), and Google's 2020 disclosure put DV360's standard rate at 15%. The fee sits on top of the media price, so the advertiser's cost is always more than the exchange clears.
- **Every large DSP is shortening its supply paths.** OpenPath connects directly to publishers, Yahoo's Backstage is a "direct path", and Amazon's DSP buys its own properties first. Fewer hops mean fewer fees and less duplicate bidding on the same impression.
- **The independents are consolidating.** Microsoft closed its DSP in February 2026 and steered customers to Amazon; The Trade Desk reported its first year-over-year quarterly revenue decline in the third quarter of 2026 ($736 million against $739 million). The buy side is concentrating in a few platforms, most of them owned by companies that also sell their own inventory.

## Inside a DSP: Accounts, Seats and Line Items

A DSP's tenancy mirrors the core model. The **advertiser** owns the money; an **ad account** (a partner and advertiser in DV360, an advertiser in The Trade Desk) is that advertiser on this DSP, operated by an agency or by the advertiser; **campaigns** carry the goal and budget; **line items** (ad groups in some DSPs) carry the targeting, price and pacing the bidder actually evaluates; **creatives** are approved per exchange. DV360 makes the line item a child of an insertion order: "You'll need to add your line item to an insertion order in the campaign."

The DSP also has **seats** on each exchange: the identity under which it bids (`buyer_seats.seat_id`, sent as `seatbid.seat`). A DSP usually bids under its own seat and passes an agency or advertiser sub-seat where the exchange supports it, because deals are often granted to a specific buyer seat (`deal.wseat`), and an exchange's blocks and creative approvals attach to seats. The rule for the data model is that a seat belongs to the DSP's organization on one exchange, and a sub-seat names the ad account it buys for, so a deal granted to an agency's seat can be bid only by that agency's line items.

Supply is enabled per account: DV360 requires an exchange to be enabled before line items can target it, and lets a partner choose whether new exchanges are enabled and targeted automatically. That is a supply decision with money consequences (a new exchange may resell inventory already reachable elsewhere) and belongs in the same records as the rest of supply selection.

## The Bidder Pipeline

Every DSP's bidder runs the same stages, in roughly this order, under the exchange's deadline. The cheap filters come first, because most requests end in a no-bid and the cost of the bidder is the cost of saying no.

1. **Parse and authenticate.** Decode the OpenRTB request, identify the exchange connection, reject malformed requests with 400 and record test traffic separately ([OpenRTB](/books/advertising/openrtb#transport)).
2. **Request-level filters.** Is the seller authorized in the property's ads.txt or app-ads.txt; is the supply chain complete and free of blocked nodes; is the property, app or domain on a global blocklist (fraud, made-for-advertising, brand safety); is the device or IP flagged as invalid traffic; is there enough time left. Each failure is a no-bid with a reason: OpenRTB's no-bid codes include 11 and 12 for ads.txt authorization unavailable or violated, 16 "Incomplete SupplyChain", 4 "Suspected Non-Human Traffic" and 15 "Insufficient Auction Time".
3. **Consent and identity.** Read `regs` and the consent strings; decide what this DSP may use (under the TCF, its own vendor consent and purposes; under a US opt-out, no targeting on personal data); look up the user's identifiers (`buyeruid` from a sync, `eids`) only where allowed.
4. **Candidate retrieval.** Find the line items whose targeting matches this impression: geography, device, format and size, inventory lists, deals offered, audience segments the user is in, daypart. At scale this is an inverted index from attribute values to line items, not a loop over line items.
5. **Eligibility.** For each candidate: is it in flight, does it have budget left today, does pacing let it bid now, is the user under its frequency cap, does it have an approved creative for this size and exchange, is the deal it needs present and its seat allowed.
6. **Value estimation.** Predict what the impression is worth to each remaining line item under its goal: the probability of a click, a conversion or a completed view times the value of that outcome, or a flat value for a reach goal.
7. **Bid computation and shading.** Turn value into a bid under the auction type: in a second-price auction, bid the value; in a first-price auction, bid less than the value, as described below. Apply the line item's maximum bid and the deal or floor.
8. **Selection and response.** Pick the best line item per impression (or a few, where the exchange accepts several bids), attach the creative markup and the notice URLs, and respond before the deadline, or 204.
9. **After the auction.** Win, billing and loss notices arrive ([Notices and Macros](/books/advertising/openrtb#notices-and-macros)); the billing notice decrements budgets and increments frequency; the loss notice's minimum-to-win price feeds the shading model.

A bidder that follows this order spends almost all of its time in stages 2 to 5 on requests it will not bid on. That is why exchanges and DSPs both work to stop unwanted requests before they are sent: pretargeting on the exchange side ([SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges#traffic-shaping)) and supply selection on the DSP side.

## Value and Bid Shading

**Value.** For a line item with a cost-per-acquisition goal of $20.00 and a predicted conversion probability of 0.05% for this impression, the impression is worth $20.00 × 0.0005 = $0.01, a $10.00 CPM. For a click goal of $0.50 and a predicted click-through rate of 0.2%, it is worth $0.50 × 0.002 = $0.001, a $1.00 CPM. These are example figures; the predictions are the hard part and belong to Machine Learning for Ads, the strategies to Automated Bidding.

**Second price.** In a second-price auction the winner pays the second-highest bid plus an increment, so bidding the true value is safe: a higher bid never raises the price paid, only the chance of winning. OpenRTB's `at = 2` is that auction, "Second Price Plus".

**First price.** In a first-price auction (`at = 1`, now the default for display after Google Ad Manager's move announced in 2019) the winner pays its own bid, so bidding the full value gives away all the surplus. Bid shading is lowering the bid toward the lowest price that still wins often enough. The textbook form: choose the bid b that maximizes (v − b) × P(win | b), where v is the value and P(win | b) is the probability of winning at bid b. The DSP estimates P(win | b) per supply context from its own history: the prices it won at, the bids it lost with, and, where exchanges send it, the minimum bid that would have won (OpenRTB's `${AUCTION_MIN_TO_WIN}`).

A worked example with an observed win curve for one supply context, value $10.00 CPM:

| Bid (CPM) | P(win), observed | Expected surplus per 1,000 (v − b) × P(win) |
| --- | --- | --- |
| $10.00 | 0.95 | $0.00 |
| $8.00 | 0.85 | $1.70 |
| $6.00 | 0.60 | $2.40 |
| $5.00 | 0.40 | $2.00 |
| $4.00 | 0.20 | $1.20 |

The shaded bid is $6.00: it wins less often than $10.00 but earns the most per opportunity. Shading is the reason a DSP keeps every loss and every minimum-to-win: without them the win curve is a guess. Two cautions. Shading works on the advertiser's money only when the DSP passes the savings on (a DSP that bills the advertiser the unshaded bid and pays the exchange the shaded one is keeping the difference, which is a disclosure question under the MRC's auction transparency standards). And a dominant buyer's shading changes the auction for everyone: the US court described Google's "Project Poirot" (2017), under which DV360 lowered its bids on rival exchanges, and found that after a second version in late 2018, DV360 bids on rivals fell by up to 90% and rivals' DV360 revenue fell 15% on average.

The shading step in code: pick the bid that maximizes expected surplus over a set of candidate prices from the win curve, never above value or the line item's maximum, never below the floor.

```go tab="Go"
package shading

// Point is one observation of the win curve: at this bid (CPM micros), this win probability.
type Point struct {
	BidMicros int64
	WinProb   float64 // 0..1
}

// Shade returns the bid in CPM micros that maximizes (value - bid) * P(win | bid),
// bounded by the floor below and by min(value, maxBid) above. ok is false when no
// candidate clears the floor at a positive surplus, in which case the line item doesn't bid.
func Shade(valueMicros, maxBidMicros, floorMicros int64, curve []Point) (bid int64, ok bool) {
	ceiling := valueMicros
	if maxBidMicros > 0 && maxBidMicros < ceiling {
		ceiling = maxBidMicros
	}
	best, bestSurplus := int64(0), 0.0
	for _, p := range curve {
		if p.BidMicros < floorMicros || p.BidMicros > ceiling {
			continue
		}
		surplus := float64(valueMicros-p.BidMicros) * p.WinProb
		if surplus > bestSurplus {
			best, bestSurplus = p.BidMicros, surplus
		}
	}
	return best, bestSurplus > 0
}
```

```rust tab="Rust"
/// One observation of the win curve: at this bid (CPM micros), this win probability.
pub struct Point {
    pub bid_micros: i64,
    pub win_prob: f64, // 0..1
}

/// Returns the bid in CPM micros that maximizes (value - bid) * P(win | bid), bounded by
/// the floor below and by min(value, max_bid) above; None when nothing clears the floor
/// at a positive surplus, in which case the line item doesn't bid.
pub fn shade(value_micros: i64, max_bid_micros: Option<i64>, floor_micros: i64,
    curve: &[Point]) -> Option<i64> {
    let ceiling = max_bid_micros.map_or(value_micros, |m| m.min(value_micros));
    curve
        .iter()
        .filter(|p| p.bid_micros >= floor_micros && p.bid_micros <= ceiling)
        .map(|p| (p.bid_micros, (value_micros - p.bid_micros) as f64 * p.win_prob))
        .filter(|&(_, surplus)| surplus > 0.0)
        .max_by(|a, b| a.1.total_cmp(&b.1))
        .map(|(bid, _)| bid)
}
```

With the table above as the curve (value 10,000,000 micros), both return 6,000,000. A production shader fits a smooth curve per supply context rather than reading discrete points, and records which model version produced each bid, because "why did we bid $6" is a question someone will ask.

## Budgets and Spend Across a Fleet

A DSP's bidder runs on many servers in several regions, each answering requests independently, and every one of them spends the same line item budgets and the same users' frequency caps. Three facts shape the design.

**Spend is known late.** A bid is a commitment that might cost money; the exchange decides whether it won, and the billing notice says whether it became billable, seconds to minutes later (or, for video, after the impression event). Between the bid and the notice the money is in flight. A bidder that counts only confirmed spend overspends during a traffic spike; one that counts every bid as spent underspends. The usual answer is to reserve the bid price on the bid, convert the reservation to spend on the billing notice at the clearing price, and release it when the win doesn't arrive within the exchange's window (the bid's `exp` gives the advisory window).

**Counters are distributed.** Each region keeps local spend and frequency counters and syncs them with a central ledger often; the central side gives each region a share of the remaining budget (a budget lease) so a region can stop on its own when its share is gone, and the remainder is rebalanced. Overspend is bounded by the size of the leases and the notice delay, not eliminated; contracts and DSP terms decide who eats it.

**Pacing decides when, budgets decide how much.** The pacing controller turns a daily budget into a bid probability or a bid multiplier per minute, so the line item spends evenly through the day rather than in the first hour; it reads the same spend counters. Pacing controllers and frequency capping across devices are Pacing & Frequency Capping; the money rule here is that budget checks and spend counters live in the bidder, and the billable truth is still the roll-up in `delivery_daily`.

## Supply Selection and Supply Path Optimization

The same impression often reaches a DSP several times: a publisher's header auction asks five SSPs, each sends the DSP a bid request for the same slot, and resellers may add more. If the DSP bids on all of them, it bids against itself, raises its own clearing prices, multiplies its compute, and pays a different fee on each path. Supply path optimization (SPO) is choosing which paths to buy each publisher's inventory through, and buying the rest nowhere.

The inputs are public files and the DSP's own logs:

- **Authorization.** The property's ads.txt lists which exchange accounts may sell it, DIRECT or RESELLER; the exchange's sellers.json says who each seller account is; the request's SupplyChain object lists every hop ([ads.txt, sellers.json & SupplyChain](/books/advertising/ads-txt-sellers-json-and-schain)).
- **Duplicates.** `source.tid` is the same transaction ID across every copy of one opportunity, so the DSP can count how many paths offered the same impression.
- **Cost and quality per path.** The exchange's fee (where disclosed), win rates, clearing prices, the share of spend that becomes viewable, non-invalid impressions, and the share that reaches the publisher.

The policies follow: prefer DIRECT paths, cap the number of hops, prefer exchanges with lower fees for the same inventory, block paths through unknown or confidential sellers, and drop made-for-advertising and invalid-traffic-heavy supply. The industry measurement shows why this matters: the ANA and TAG TrustNet benchmark for the third quarter of 2025 measured 47.1% of participants' programmatic spend reaching publishers, up 11 points since 2023, and 81.6% of spend in private marketplaces; by the first quarter of 2026, made-for-advertising inventory had risen to 1.1% of spend, from 0.4-0.6% through 2025. The ISBA and PwC 2020 study found 15% of UK spend in an "unknown delta" that couldn't be traced; the second study cut it to 3%. Take Rates & Supply Quality covers the studies; the DSP's job is to turn them into supply rules it can apply per bid request.

DSPs also sell shorter paths as products: The Trade Desk's OpenPath connects it "directly" to publishers, and Yahoo's Backstage is "a direct path to top-tier supply." For an engineer, these are additional supply sources with their own connection, and the same records apply.

## Fees, Gross Spend and Net Revenue

A DSP's money has three layers, and the records must keep them apart:

- **Media cost.** What the exchange billed for the impressions won: the sum of clearing prices on billing notices, in micros, reconciled to the exchange's invoice.
- **Data and add-on costs.** Third-party audience segments, verification and brand-safety pre-bid filters, measurement, each priced per thousand impressions or as a share of media by its vendor, which the DSP passes through.
- **The DSP's platform fee.** A percentage of spend or a CPM, by contract.

The advertiser is billed the sum. The Trade Desk defines gross spend as client spend on inventory, data and add-on services plus the platform fee, and recognizes only its fee as revenue, "as an agent on a net basis"; it records receivables at gross billings, and it "typically pay[s] suppliers in advance of collections from our clients", so a DSP's working capital carries the media money between paying the exchange and collecting from the agency. Two holding companies each represented more than 10% of its gross billings in 2025, which is the credit risk Advertiser Payments & Credit covers. Advertising Revenue Accounting covers gross versus net.

For $10,000 of media won at clearing prices, with a $1.00 CPM data segment on 2,000,000 impressions and a 15% platform fee on media and data (example rates), the advertiser's invoice reads:

| Line | Basis | Amount |
| --- | --- | --- |
| Media | Sum of billing-notice clearing prices | $10,000.00 |
| Data | 2,000,000 impressions × $1.00 CPM | $2,000.00 |
| Platform fee | 15% × ($10,000 + $2,000) | $1,800.00 |
| **Total billed** | | **$13,800.00** |

The DSP's revenue is $1,800; the data vendor is owed $2,000 and the exchanges $10,000. Each is an `invoice_lines` row (`media`, `data_fee`, `platform_fee`) on the receivable invoice, with the fee schedule that produced it; the payables to the exchanges and the data vendor are their own invoices. A DSP that cannot show this split per line item cannot answer the first question in an agency audit.

## Microsoft's Exit and Amazon's Consolidation

Microsoft announced on May 14, 2025 that it would stop media buying through its DSP, Microsoft Invest, from February 28, 2026, and on October 7, 2025 named Amazon DSP the preferred transition partner, with Microsoft Monetize joining Amazon's Certified Supply Exchange; Microsoft keeps its search and native Advertising Platform, Monetize (its SSP) and Curate. Amazon, meanwhile, folded Amazon DSP into Amazon Ads Agent: its page now says Amazon DSP "was Amazon Ads' programmatic advertising solution", that "Programmatic capabilities are available through DVA+", and that "All campaign settings, audience segments, creative assets, deal management, and performance history are carried forward into DVA+ advanced in Amazon Ads Agent." <!-- source-gap: adv-amazon-dva-plus-date | status | the date Amazon DSP became DVA+ inside Amazon Ads Agent, and what DVA stands for | closes with: an Amazon Ads announcement or filing that dates the change and expands the name | checked: 2026-11-22 -->

For an engineer, a DSP closing or renaming is a migration: seats, deals, creative approvals and audience segments move from one platform's IDs to another's. The records that survive it are the ones that keep external IDs as attributes of stable internal rows (a deal is the same deal under a new buyer seat), which is the [crosswalk](/docs/building-blocks/record-linkage#crosswalks-of-external-ids) pattern.

## How to Build It

A DSP adds four things to the core model: its seats as a hierarchy that names whose money each sub-seat bids, the supply it will and won't buy (by exchange, seller account and property), fee schedules that turn delivery into invoice lines, and, on each bid, the value and shading that produced the price. The callouts arrive as `bid_requests` rows from the exchange's perspective; on the DSP side the same table records requests received, with `bidder_org_id` set to the DSP itself.

```sql
ALTER TABLE buyer_seats
  ADD COLUMN parent_seat_id UUID,        -- the DSP's own seat above an agency or advertiser sub-seat
  ADD COLUMN ad_account_id UUID;         -- the account a sub-seat bids for
ALTER TABLE buyer_seats ADD CONSTRAINT buyer_seats_parent_fk
  FOREIGN KEY (parent_seat_id) REFERENCES buyer_seats (id) NOT VALID;
ALTER TABLE buyer_seats ADD CONSTRAINT buyer_seats_ad_account_fk
  FOREIGN KEY (ad_account_id) REFERENCES ad_accounts (id) NOT VALID;

CREATE TABLE supply_sources (            -- what a buyer will and won't buy, and through which path
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  buyer_org_id        UUID NOT NULL REFERENCES organizations (id),  -- the DSP
  ad_account_id       UUID REFERENCES ad_accounts (id),  -- null: applies to every account
  line_item_id        UUID REFERENCES line_items (id),   -- null: account- or DSP-wide
  exchange_org_id     UUID REFERENCES organizations (id),
  seller_account_id   UUID REFERENCES seller_accounts (id),
  property_id         UUID REFERENCES properties (id),
  decision            TEXT NOT NULL CHECK (decision IN ('allow', 'block', 'prefer')),
  reason              TEXT NOT NULL CHECK (reason IN ('spo', 'unauthorized', 'reseller_depth',
                        'mfa', 'ivt', 'brand_safety', 'fee', 'duplicate_path', 'contract',
                        'exchange_enabled', 'manual')),
  max_hops            SMALLINT,          -- schain nodes allowed on this path
  effective           TSTZRANGE NOT NULL,
  decided_by          TEXT NOT NULL,     -- a person, an SPO job version, a vendor list version
  CHECK (exchange_org_id IS NOT NULL OR seller_account_id IS NOT NULL OR property_id IS NOT NULL)
);
CREATE INDEX supply_sources_lookup_idx
  ON supply_sources (buyer_org_id, exchange_org_id, seller_account_id, property_id);

CREATE TABLE fee_schedules (             -- a fee one party charges another, one concept for every chain
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  charged_by_org_id   UUID NOT NULL REFERENCES organizations (id),
  charged_to_org_id   UUID REFERENCES organizations (id),  -- null: every customer on standard terms
  ad_account_id       UUID REFERENCES ad_accounts (id),
  seller_account_id   UUID REFERENCES seller_accounts (id),
  deal_id             UUID REFERENCES deals (id),
  kind                TEXT NOT NULL CHECK (kind IN ('dsp_platform', 'data', 'verification',
                        'exchange_buy_side', 'exchange_sell_side', 'curator', 'ad_serving')),
  basis               TEXT NOT NULL CHECK (basis IN ('percent_of_media', 'percent_of_media_and_data',
                        'percent_of_clearing', 'cpm', 'flat_monthly')),
  rate_bp             INT CHECK (rate_bp BETWEEN 0 AND 10000),   -- basis points for percentages
  rate_cpm_micros     BIGINT CHECK (rate_cpm_micros >= 0),        -- for per-thousand fees
  currency            CHAR(3) NOT NULL,
  effective           TSTZRANGE NOT NULL,
  agreement_ref       TEXT NOT NULL,     -- the contract or rate card version; lands in invoice_lines.rule_ref
  CHECK ((basis = 'cpm') = (rate_cpm_micros IS NOT NULL)),
  CHECK ((basis LIKE 'percent%') = (rate_bp IS NOT NULL))
);

ALTER TABLE bids
  ADD COLUMN value_cpm_micros BIGINT,    -- the line item's estimated value for this impression
  ADD COLUMN unshaded_cpm_micros BIGINT, -- the bid before shading (equals value in second price)
  ADD COLUMN win_probability_ppm INT,    -- the shading model's P(win) at the bid, parts per million
  ADD COLUMN bid_model_version TEXT;     -- value and shading model versions that produced the price
ALTER TABLE bids ADD CONSTRAINT bids_shading_check
  CHECK (unshaded_cpm_micros IS NULL OR price_cpm_micros <= unshaded_cpm_micros) NOT VALID;
```

The duplicate-path view a supply team runs every day comes from the transaction ID and the callouts:

```sql
-- Per publisher property and day: opportunities, how many paths offered each, and spend per path.
WITH offers AS (
  SELECT r.source_tid, r.upstream_org_id AS exchange_org_id, a.id AS auction_id,
         p.id AS property_id, r.received_at::date AS day
  FROM ad_requests r
  JOIN ad_units u   ON u.id = r.ad_unit_id
  JOIN properties p ON p.id = u.property_id
  JOIN auctions a   ON a.ad_request_id = r.id AND a.started_at >= r.received_at
  WHERE r.received_at >= now() - interval '1 day' AND r.source_tid IS NOT NULL
)
SELECT property_id, day,
       count(DISTINCT source_tid)                                 AS opportunities,
       round(count(*)::numeric / NULLIF(count(DISTINCT source_tid), 0), 2) AS paths_per_opportunity,
       count(DISTINCT exchange_org_id)                            AS exchanges
FROM offers
GROUP BY 1, 2
ORDER BY paths_per_opportunity DESC;
```

Design notes:

- **Seats name whose money they bid.** A sub-seat points at its ad account, so a deal granted to an agency's seat (`deal.wseat`) is matched to that agency's line items only, and a seat's blocks and approvals are scoped correctly.
- **Supply rules are data with dates and authors.** Every allow, block and preference has a reason, an effective range and who decided (a person, an SPO job version, a vendor's list version), so a spend change can be traced to the rule that caused it ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **One fee table for every chain.** DSP fees, exchange fees on either side, curator fees and data fees are all `fee_schedules` rows, so an invoice line's `rule_ref` points at one place and a take-rate report is a sum over one table. [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges#how-to-build-it) reuses it.
- **The bid records its reasoning.** Value, unshaded bid, win probability and model versions on each bid row are what a shading audit, a pass-through check and a model rollback need; the check that the price never exceeds the unshaded bid catches a sign error before it costs money.
- **Reserve on bid, spend on billing.** Budget counters reserve the bid price when a bid is sent and convert to spend at the clearing price on the billing notice; reservations expire after the exchange's window. The ledger of record is the billing notices rolled into `delivery_daily`.
- **Gross and net are both columns.** The advertiser's cost and the DSP's revenue come from the same delivery rows through different fee lines; neither is stored as a typed total.

## Auditing

- **Every supply decision.** Allow, block and preference rules with reasons, dates and authors, and which rule applied to each request, for the advertiser asking why a publisher got no spend and the publisher asking the same.
- **Every bid's price formation.** Value, shading, model versions, the floor and the line item maximum, for a pass-through audit and for a dispute about bidding behavior; the court record in the US ad tech case turned partly on how one DSP shaded bids on rival exchanges.
- **Every fee as a line.** Media, data, verification and platform fees per line item and invoice, with the schedule and agreement version, so an agency can reconcile the DSP's invoice to the exchanges' and the vendors'.
- **Every seat and its owner.** Which agency or advertiser each sub-seat bid for, so deal access and billing stay attached to the right money.

## What This Means for the System You Build

- **Filter cheaply first:** authorization, supply chain, blocklists and invalid traffic before any line item lookup, with a no-bid reason on each.
- **Retrieve candidates through an index,** not a scan of line items.
- **Shade bids in first-price auctions from observed win curves,** record the unshaded bid and the model version, and pass the savings through.
- **Reserve budget on bid and spend on the billing notice,** with regional leases so overspend is bounded.
- **Choose supply paths deliberately:** count duplicates by transaction ID, prefer direct and cheaper paths, and record every rule with its reason.
- **Bill media, data and platform fees as separate lines** from one fee table, and keep gross spend and net revenue apart.
- **Keep external IDs as attributes of stable rows** so a platform migration moves seats and deals without rewriting history.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), auction types, seats, deals, source.tid, bid exp and the minimum-to-win macro
- [IAB Tech Lab: OpenRTB 3.0](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/main/OpenRTB%20v3.0%20FINAL.md), the no-bid reason codes 2.6 uses
- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), disclosure of bid-to-clearing conversion and fees

**Reference**

- [Amazon Ads: Amazon DSP](https://advertising.amazon.com/solutions/products/amazon-dsp), Amazon DSP as part of Amazon Ads Agent, DVA+, supply, self-service and managed service, and the migration statements
- [Google Display & Video 360 Help: Managing exchanges](https://support.google.com/displayvideo/answer/9230278), enabling exchanges and targeting new exchanges automatically
- [Google Display & Video 360 Help: Create a line item](https://support.google.com/displayvideo/answer/2891312?hl=en), line item types, inventory sources and the insertion order hierarchy
- [Google Ad Manager: Display buying share of revenue (June 23, 2020)](https://blog.google/products/admanager/display-buying-share-revenue-publishers/), the DV360 standard rate and publishers' share
- [Google Ad Manager: Rolling out first price auctions (September 5, 2019)](https://blog.google/products/admanager/rolling-out-first-price-auctions-google-ad-manager-partners/), the move to first price
- [Microsoft Advertising: May 2025 update](https://about.ads.microsoft.com/en/blog/post/may-2025/empowering-businesses-for-a-future-that-is-conversational-personal-and-agentic), Microsoft Invest buying ending February 28, 2026
- [Microsoft Advertising: Collaboration with Amazon (October 2025)](https://about.ads.microsoft.com/en/blog/post/october-2025/unlocking-more-opportunities-for-partners-and-customers-through-collaboration-with-amazon), Amazon DSP as preferred transition partner and Monetize in Amazon's Certified Supply Exchange
- [Yahoo DSP](https://www.yahooinc.com/yahoo-dsp), channels, Backstage and its MFA-free certification claim

**Filings**

- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), the platform fee, net reporting, gross spend definition, paying suppliers before collections, holding company concentration, Kokai and OpenPath
- [The Trade Desk: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000009/ttd-20260225x8kexx991.htm), 2025 revenue and gross spend
- [The Trade Desk: Third quarter 2026 results](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000115/ttd-20261109x8kexx991.htm), quarterly revenue of $736 million against $739 million

**Industry studies**

- [ANA: Programmatic Transparency Benchmark, third quarter 2025](https://www.ana.net/content/show/id/pr-2025-11-transparency), share of spend reaching publishers and the PMP share
- [ANA: Programmatic Transparency Benchmark, first quarter 2026](https://www.ana.net/content/show/id/pr-2026-05-programmatic), the made-for-advertising share of spend
- [ISBA: Programmatic Supply Chain Transparency Study, executive summary (2020)](https://www.isba.org.uk/system/files/media/documents/2020-12/executive-summary-programmatic-supply-chain-transparency-study.pdf), the 15% unknown delta
- [ISBA: Second programmatic supply chain study (January 18, 2023)](https://www.isba.org.uk/article/isbas-programmatic-supply-chain-study-finds-match-rate-increases-and-reduction), the unknown delta cut to 3%

**Court records**

- [United States v. Google LLC, No. 1:23-cv-00108 (E.D. Va.), Memorandum Opinion, Dkt. 1410 (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), Project Poirot and its effect on rival exchanges, and DV360 as the former DoubleClick Bid Manager
