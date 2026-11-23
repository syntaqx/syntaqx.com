+++
title = "Floors & Yield Optimization"
nav_title = "Floors & Yield"
description = "Hard, soft and dynamic floors, pricing rules, floors across header bidding and deals, the fill-versus-price trade-off, yield management and floor experiments."
category = "Advertising Industry"
order = 2925
part = "Auctions and Pricing"
tags = ["advertising", "ad-tech", "floors", "yield", "auctions", "data-model"]
+++

A floor is the lowest price a seller will accept for an impression: below it, a bid doesn't compete. It is the publisher's main price lever in every auction it doesn't run itself and the platform's main revenue lever in every auction it does. Google Ad Manager's pricing rules "centralize the management of auction floor prices for your non-guaranteed demand"; Prebid's floors module sets "the lowest CPM price a bid will need to meet for each Prebid auction"; OpenRTB carries the floor to every bidder as `bidfloor`, "minimum bid for this impression expressed in CPM"; a search engine's Ad Rank thresholds and a retailer's hard and soft reserves are floors with other names.

Floors are hard because a floor trades one thing for another and the trade can't be observed directly. A higher floor raises the price of the impressions that still sell and loses the ones that don't; whether that's a gain depends on the bids that would have come in under it, which the seller by definition doesn't see. Bidders respond: in a first-price auction a bidder shading toward the lowest winning price learns the floor and bids at it, so a floor set from last week's bids is partly set from last week's floor. Floors set per buyer turn an auction into a negotiation the buyer can't see, which is why the MRC's auction standards say reserve prices "should not be set on a per-buyer basis", and why the US court found that Google's Unified Pricing Rules, which forced one floor across exchanges, "did not require a level playing field."

This chapter covers hard, soft and dynamic floors, rule-based floors and how overlapping rules combine, floors through header bidding, exchanges and deals (the gross-versus-net basis), the fill-versus-price trade-off with a worked example, yield management across direct and indirect demand, and floor experiments, then the records. It extends `auctions` and `deals` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and turns `exchange_floors`, which The Google Ad Tech Cases (in Programmatic) adds for the per-exchange remedy, into the general floor rule. Reserve prices in auction theory and the Amazon soft-reserve complaint are [Reserve Prices](/books/advertising/auction-mechanics#reserve-prices); the exchange's own floor enforcement and loss codes are SSPs & Ad Exchanges; the wrapper and its price buckets are Header Bidding & Prebid; deal floors and why a deal doesn't spend are Deals, PMPs & Curation; the publisher's yield metrics (eCPM, RPM, fill) are Publishers & Yield; dynamic allocation is Ad Servers.

## How the Platforms Do It

As of November 2026:

| System | Floor types | How rules combine | Basis | Notes |
| --- | --- | --- | --- | --- |
| **Amazon Ads, Sponsored Products** | A "hard reserve" to enter and a "soft reserve" the winner may pay | Not public | Per click | Subject of the FTC's August 2026 complaint |
| **Google Ad Manager** | "Set floor prices"; "Set target CPMs" (the default), which "dynamically adjusts the floor price on matching inventory"; "Let Google optimize floor prices" (beta), per query by machine learning | "If two pricing rules target overlapping inventory, the rule with the higher price applies" | Net: "the value of a bid that would be paid to a publisher, after removing Google's revenue share" | Up to 200 rules per network; targeting by inventory, demand source and bidder, advertiser and brand, size, sensitive category, creative type and video options; not on programmatic direct |
| **Google Ads, Search** | Ad Rank thresholds by position, and a reserve price when no ad is below | Thresholds vary by location on the page | Ad Rank, not price | Quality affects the threshold an ad faces |
| **OpenRTB** | `imp.bidfloor` and `bidfloorcur`; `deal.bidfloor` per deal | Exchange-defined | The CPM the buyer pays, unless the exchange states otherwise | `deal.bidfloorcur` "does not inherit from Imp.bidfloorcur" |
| **Prebid.js floors module** | Rules by `gptSlot`, `adUnitCode`, `mediaType`, `size`, `domain` and custom fields, from config or a provider endpoint | One rule matches per request; `floorMin` raises it; schema 2 samples among weighted model groups | CPM, USD by default, converted by the currency module | Enforcement on by default; `skipRate` for testing; deals not enforced by default |

Three patterns:

- **Static floors are giving way to modeled ones.** Ad Manager's default is a target CPM, which adjusts the floor to hit an average, and its optimized floors set one per query; Prebid's module takes floors from providers (its page lists Magnite, OpenX, PubMatic, Assertive Yield, pubX and Mile). The publisher sets a policy and a model sets the number.
- **Floors are compared net unless someone says otherwise.** Ad Manager compares the publisher's share, after Google's revenue share; an SSP sending `bidfloor` to a DSP must say whether it is the price the DSP pays or the price the publisher receives. Every floor needs a stated basis.
- **Floors don't apply to everything.** Ad Manager's pricing rules skip programmatic guaranteed and preferred deals, house line items and CPA line items; Prebid's floors don't apply to deal bids unless `floorDeals` is on. A floor policy has to name its scope.

## Hard, Soft and Dynamic Floors

**Hard floors** filter: a bid below the floor doesn't compete. Every OpenRTB `bidfloor`, every Ad Manager floor price and every Prebid rule with enforcement on is a hard floor; Prebid "will mark all bids below the floor as bids rejected", and an exchange reports a below-floor loss reason to the bidder (OpenRTB covers the codes).

**Soft floors** only make sense in second-price auctions. Above the hard floor, a winner whose runner-up is below the soft floor pays the soft floor instead of the runner-up's price; a winner between the hard and soft floors pays its own bid. In a first-price auction the winner already pays its bid, so a soft floor does nothing a hard floor doesn't. Amazon's description of its own Sponsored Products auction is the clearest public statement of the two: the hard reserve is "the minimum a bid must surpass to enter an auction", the soft reserve "a real-time minimum value that seeks to better reflect what each placement is actually worth." A soft floor set per auction from a prediction of the winner's bid converges on the winner's bid and turns the auction into first price for a buyer bidding as if it were second; [Reserve Prices](/books/advertising/auction-mechanics#reserve-prices) covers the theory and the FTC's allegations about exactly that.

**Dynamic floors** are hard or soft floors set per request (or per segment, refreshed often) by a model predicting what the impression would clear at. Ad Manager's two dynamic options differ in what they promise: a **target CPM** aims at an average and moves the floor to get there ("an alternative way of setting a floor price", which "dynamically adjusts the floor price on matching inventory"), while "Let Google optimize floor prices" "automatically sets per-query floors to maximize yield." Prebid's module fetches floors from an endpoint at auction time, waits up to `auctionDelay` for it, and falls back to configured rules when the endpoint is late.

The MRC's rule for closed-loop auctions applies to all three kinds: the reserve must be "directly reported to auction participants before an auction is run and after it concludes", "the same floor should apply simultaneously to all buyers", and "where dynamic pricing strategies and optimization is applied, aggregated insights for campaigns should at minimum be reported." For OpenRTB it says reserve prices "should be managed through a Deal ID structure." The practical reading for a dynamic floor model: one floor per auction for everyone in it, its value logged on the auction with the model version, and the model's effect reportable in aggregate.

## Rule-Based Floors

Most floors are rules: a price for the requests matching some targeting. Ad Manager's pricing rules target inventory, "specific demand sources and individual bidders", "advertisers and brands (exact matches only)", sizes, sensitive categories, creative types and video duration and skippability; Prebid's rules key on slot, ad unit code, media type, size and domain, joined with a delimiter (`|` by default) and with `*` as a wildcard, plus a `default` for requests nothing matches.

How overlapping rules combine is the first design decision, and the two big systems chose differently:

- **Highest wins.** Ad Manager: "If two pricing rules target overlapping inventory, the rule with the higher price applies", and within one rule "the higher of the specific-item price and the 'Pricing for everything' price applies." Simple to explain, and adding a rule can only raise floors.
- **One matching rule wins.** Prebid's module matches a single rule per request from its field values, with `*` as a catch-all and a `default` when nothing matches, and `floorMin` sets a minimum under any match ("the greater of floorMin and the matched rule's CPM"). Writing those rules so the right one matches is a most-specific-wins design in practice.

Either works; mixing them doesn't. My rule: pick one combination rule per system, store it on the floor policy, and log on each auction which rule supplied the floor, so "why was this request floored at $3.40" has one answer.

Two targeting dimensions need care:

- **Advertiser and brand floors aren't sent to bidders.** Ad Manager's item-specific floors (advertiser, brand, size) "are not sent to buyers in bid requests": the bidder sees the general floor, bids, and its bid is then checked against the higher floor for its brand after the fact. That is legitimate (a publisher charging more for a category it dislikes) and also exactly the information asymmetry the MRC's reserve rule worries about. Record such floors as not disclosed, and report how many bids they removed.
- **Bidder and demand-source floors are per-buyer floors.** Ad Manager allows floors for individual bidders and demand sources; the remedies in the US ad tech case require that publishers may set different floors on different exchanges; the MRC says closed-loop auctioneers shouldn't set reserves per buyer. These fit together once the level is clear: a publisher setting a floor per exchange (a supply path) is pricing its channels, and the floor is still the same for every buyer inside each exchange's auction. A floor per individual DSP or advertiser inside one auction is the per-buyer reserve to avoid.

A floor resolver, highest-wins with item-specific rules applied after the bid:

```go tab="Go"
package floors

// Rule is one pricing rule. Empty match fields are wildcards. ItemSpecific rules
// (advertiser, brand) aren't sent in the bid request; they're checked against the bid.
type Rule struct {
	ID           string
	AdUnit       string
	MediaType    string
	Size         string
	Country      string
	Exchange     string // a demand source; "" = all indirect demand
	Advertiser   string // ItemSpecific when set
	FloorMicros  int64  // CPM micros, on the rule's basis
	ItemSpecific bool
}

// Request is what the resolver matches on before bids arrive.
type Request struct{ AdUnit, MediaType, Size, Country, Exchange string }

func matches(field, value string) bool { return field == "" || field == value }

func (r Rule) matchesRequest(q Request) bool {
	return matches(r.AdUnit, q.AdUnit) && matches(r.MediaType, q.MediaType) &&
		matches(r.Size, q.Size) && matches(r.Country, q.Country) && matches(r.Exchange, q.Exchange)
}

// Disclosed returns the floor sent to bidders: the highest matching rule that isn't
// item-specific, and its ID, or 0 and "" if none matches.
func Disclosed(rules []Rule, q Request) (int64, string) {
	var best int64
	var id string
	for _, r := range rules {
		if !r.ItemSpecific && r.matchesRequest(q) && r.FloorMicros > best {
			best, id = r.FloorMicros, r.ID
		}
	}
	return best, id
}

// ForBid returns the floor a bid from this advertiser is held to: the disclosed floor
// or a higher item-specific one, with the rule that set it.
func ForBid(rules []Rule, q Request, advertiser string) (int64, string) {
	best, id := Disclosed(rules, q)
	for _, r := range rules {
		if r.ItemSpecific && r.Advertiser == advertiser && r.matchesRequest(q) && r.FloorMicros > best {
			best, id = r.FloorMicros, r.ID
		}
	}
	return best, id
}
```

```rust tab="Rust"
/// One pricing rule. `None` match fields are wildcards. Item-specific rules
/// (advertiser, brand) aren't sent in the bid request; they're checked against the bid.
pub struct Rule {
    pub id: String,
    pub ad_unit: Option<String>,
    pub media_type: Option<String>,
    pub size: Option<String>,
    pub country: Option<String>,
    pub exchange: Option<String>,   // a demand source; None = all indirect demand
    pub advertiser: Option<String>, // set on item-specific rules
    pub floor_micros: i64,          // CPM micros, on the rule's basis
    pub item_specific: bool,
}

/// What the resolver matches on before bids arrive.
pub struct Request<'a> {
    pub ad_unit: &'a str,
    pub media_type: &'a str,
    pub size: &'a str,
    pub country: &'a str,
    pub exchange: &'a str,
}

fn m(field: &Option<String>, value: &str) -> bool {
    field.as_deref().map_or(true, |f| f == value)
}

impl Rule {
    fn matches(&self, q: &Request) -> bool {
        m(&self.ad_unit, q.ad_unit) && m(&self.media_type, q.media_type)
            && m(&self.size, q.size) && m(&self.country, q.country)
            && m(&self.exchange, q.exchange)
    }
}

/// The floor sent to bidders: the highest matching rule that isn't item-specific.
pub fn disclosed<'r>(rules: &'r [Rule], q: &Request) -> Option<&'r Rule> {
    rules
        .iter()
        .filter(|r| !r.item_specific && r.matches(q))
        .max_by_key(|r| r.floor_micros)
}

/// The floor a bid from this advertiser is held to, and the rule that set it.
pub fn for_bid<'r>(rules: &'r [Rule], q: &Request, advertiser: &str) -> Option<&'r Rule> {
    let item = rules
        .iter()
        .filter(|r| r.item_specific && r.advertiser.as_deref() == Some(advertiser) && r.matches(q))
        .max_by_key(|r| r.floor_micros);
    match (disclosed(rules, q), item) {
        (Some(d), Some(i)) if i.floor_micros > d.floor_micros => Some(i),
        (Some(d), _) => Some(d),
        (None, i) => i,
    }
}
```

Both return the rule as well as the price, because the auction records which rule set the floor; a tie between two rules at the same price goes to the first in the list, which the stored rule order makes deterministic.

## Floors Across the Chain

A floor is set in one place and compared in several, and each comparison has a basis.

**Gross or net.** An exchange that takes a 20% fee and receives a $5.00 bid pays the publisher $4.00. A $4.50 floor compared gross passes the bid; compared net, it fails. Ad Manager compares net: in its example "a $1.00 bid on an 80/20 split is worth $0.80" against the floor, and "a pricing rule with a floor above $0.80 would filter it." An exchange passing a publisher's net floor to DSPs as `bidfloor` must gross it up by its fee (a $4.00 net floor at a 20% fee is a $5.00 `bidfloor`), or say that it didn't. The floor's basis belongs on the rule and the auction.

**Header bidding.** Prebid's module passes floors to bidders through `getFloor()` in Prebid.js (adapters call it per media type, size and currency) and as `imp.bidfloor` and `imp.bidfloorcur` through Prebid Server, enforces them on responses in the browser (`enforceJS`) and in the server (`enforcePBS`), and can adjust the floor with the same per-bidder bid adjustment applied to bids (`bidAdjustment`, on by default), which is how a floor stays net when a bidder's bids are adjusted for its fee. The header auction's winner then goes to the ad server, where pricing rules apply again "to header bidding trafficking", so the same impression may meet a floor in the wrapper and another in the ad server. Two floors in sequence are fine if both are on the same basis and the higher is the binding one; a wrapper floor gross and an ad server floor net double-count the fee.

**Per exchange.** The remedies in the US ad tech case, per reports of the unsealed opinion, let publishers set different floors on different exchanges for indirect demand. In practice a publisher with five exchanges and a header wrapper has a floor per exchange per segment, and a reason to vary them: an exchange whose fee is higher needs a higher gross floor to return the same net, and one whose demand is mostly a single DSP may deserve a different price. The record is a floor rule scoped to one demand source.

**Deals.** A private auction deal carries its own floor in `deal.bidfloor`, which "does not inherit from Imp.bidfloorcur" for its currency; a programmatic guaranteed or preferred deal has a fixed price (`at = 3`), and Ad Manager's pricing rules don't apply to programmatic direct at all. Prebid doesn't enforce floors on deal bids unless `floorDeals` is set. The rule I'd keep: open-market floors never apply to deals, a deal's floor is a term of the deal, and an open-market floor above a deal's floor on the same inventory is a signal that the deal is priced below market (Deals, PMPs & Curation covers the troubleshooting).

**Currency.** Floors are set in one currency and bids arrive in others. Prebid converts in `getFloor()` and during enforcement and warns that omitting the currency module "can cause unexpected behavior"; if it "can't derive a comparable CPM during enforcement, the bid passes through as if no floor matched." Store the floor with its currency, convert at a recorded rate per auction, and treat a failed conversion as a logged event, not a silent pass ([Multi-Currency](/docs/money/multi-currency)).

## The Fill-Versus-Price Trade-off

A floor raises the price of what sells and loses what doesn't. In a second-price auction the effect is easy to compute from logged bids: with floor f, an auction whose top bid is below f doesn't sell, and one whose top bid clears pays the higher of the runner-up and f. Ten example auctions, top and second bids (CPM):

| Auction | Top bid | Second bid | Revenue at f = $0 | f = $1.00 | f = $1.50 | f = $1.80 | f = $2.00 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | $4.00 | $3.00 | $3.00 | $3.00 | $3.00 | $3.00 | $3.00 |
| 2 | $3.50 | $1.00 | $1.00 | $1.00 | $1.50 | $1.80 | $2.00 |
| 3 | $2.50 | $2.00 | $2.00 | $2.00 | $2.00 | $2.00 | $2.00 |
| 4 | $2.20 | $0.50 | $0.50 | $1.00 | $1.50 | $1.80 | $2.00 |
| 5 | $1.80 | $1.20 | $1.20 | $1.20 | $1.50 | $1.80 | unsold |
| 6 | $1.50 | $0.40 | $0.40 | $1.00 | $1.50 | unsold | unsold |
| 7 | $1.20 | $1.00 | $1.00 | $1.00 | unsold | unsold | unsold |
| 8 | $0.90 | $0.30 | $0.30 | unsold | unsold | unsold | unsold |
| 9 | $0.60 | $0.20 | $0.20 | unsold | unsold | unsold | unsold |
| 10 | $0.40 | none | $0.00 | unsold | unsold | unsold | unsold |
| **Revenue** | | | $9.60 | $10.20 | $11.00 | $10.40 | $9.00 |
| **Fill** | | | 10 of 10 | 7 | 6 | 5 | 4 |

The best floor here is $1.50: it sells 6 of 10 and earns 15% more than no floor, because it lifts four auctions whose runner-up was far below the winner. At $2.00 the lost auctions cost more than the lifted ones gain. Ostrovsky and Schwarz found the same shape at scale in sponsored search, where reserves set from optimal auction theory raised revenue "substantially." Four things make the real problem harder than the table:

- **Unsold isn't zero.** An impression that fails the floor falls to the next demand: a house ad, a lower-priority line item, a backfill network, or nothing. The comparison is the floor's revenue against the fallback's, and a floor that sends impressions to a $0.30 backfill instead of a $0.60 bid lost money on that impression even if total eCPM rose.
- **First price moves the bids.** In a first-price auction there is no runner-up price to lift; the floor only removes bids, and bidders shading toward the lowest winning price respond by bidding at the floor. A floor raised from $1.00 to $1.50 may see the same bidders win at $1.50 next week, which looks like success and may be; it may also lose bidders who stop bidding on the inventory.
- **The metric is revenue per opportunity, not eCPM.** A floor always raises eCPM (average price of what sold) and can lower revenue per thousand requests. Publishers judge floors on page or session RPM for that reason (Publishers & Yield defines them), and ad requests the floor turned away must stay in the denominator.
- **Floors affect user experience indirectly.** A floor that leaves more slots empty lowers ad load; one that fills them with house ads doesn't. Neither is a revenue number, and both belong in the evaluation.

## Yield Management

Yield management is getting the most from a publisher's inventory across all its demand: direct-sold guarantees, deals, header bidding, exchanges and networks. Floors are one lever; the others are allocation and packaging.

- **Guarantees are a floor the auction must beat.** Under Ad Manager's dynamic allocation, a guaranteed line item "competes using a temporary CPM" (the opportunity cost of not serving it), so non-guaranteed demand wins only by paying more than the guarantee needs the impression to be worth. That temporary CPM is a per-request floor computed from pacing, and it ranks but never bills (Ad Servers covers it).
- **Unified auctions make floors comparable.** When every source competes in one first-price decision, one floor (or one per exchange, on one basis) applies to all of them; under a waterfall, each position's expected price was its own floor.
- **Packaging sets the price before the auction.** Deals, curated packages and direct sales put inventory in front of buyers at agreed prices; the open-market floor decides how much stays in the open market and at what price. A floor much above recent clearing prices pushes buyers toward deals, which may be the intent.
- **Inventory quality changes the floor that's right.** A viewable, above-the-fold, logged-in impression clears higher than a below-the-fold one on the same page; segmenting floors by the features buyers price (viewability, position, identifier availability) beats one floor per page.

My default for a publisher's floor policy: a low hard floor per format and region that blocks only bids not worth serving; a modeled floor per segment above it, refreshed daily, capped below the segment's recent median winning price; per-exchange values on one net basis; deals excluded; and a standing experiment comparing the model with a fixed control.

## Floor Experiments

A floor change is a pricing experiment, and the usual experiment rules apply with two twists.

**Randomize the floor, not the inventory.** Prebid's `skipRate` (0 to 100, default 0) skips floor logic on a share of auctions "for A/B testing" and flags skipped requests in analytics; schema 2's model groups with weights (a model's share is "its weight divided by the total", "re-sampled on every auction") run several floor models side by side. Either gives randomized arms within the same traffic. Assignment by auction is cheap; assignment by page view or user keeps one page from mixing arms, which matters when slots on a page compete for the same buyers ([Randomization Units and Assignment](/docs/telemetry/experimentation#randomization-units-and-assignment)).

**Measure revenue per opportunity, with the fallback.** The primary metric is revenue per thousand requests (or page RPM), including whatever filled the impressions the floor turned away; eCPM and fill are diagnostics. Guardrails: fill rate, ad load, page latency, and deal delivery, which an open-market floor shouldn't touch ([Guardrail Metrics](/docs/telemetry/experimentation#guardrail-metrics)).

**Twist one: buyers learn across arms.** A DSP's shading model doesn't know which arm an auction is in; it learns one win curve from all of them. So a floor tested on 10% of traffic sees bidders who haven't adapted to it, and a floor rolled out to 100% sees bidders who have. Small, short tests overstate the gain of a higher first-price floor. This is interference between arms ([Interference and Network Effects](/docs/telemetry/experimentation#interference-and-network-effects)); the mitigations are longer tests, larger arms, randomizing by site or region where traffic allows, and a long-running holdout after rollout ([Holdouts](/docs/telemetry/experimentation#holdouts)).

**Twist two: the sample is the floor's own output.** Bids under a floor are often not sent (a DSP that knows the floor doesn't bid below it), so a floor model trained on bids received under its own floors never sees what it filtered. The skip arm, with floors off or at a fixed minimum, is the only unbiased sample of the bid distribution, and it should run continuously, small, for that reason alone.

## How to Build It

The Google Ad Tech Cases adds `exchange_floors`: a publisher's floor for one exchange and ad unit, with a gross or net basis and an effective range. Pricing rules need more (targeting, a kind, scope, disclosure, the model that set a dynamic value), and they are the same concept, so this chapter widens `exchange_floors` into the general floor rule rather than adding a parallel table: a null exchange is all indirect demand. It adds the floor policy each publisher's rules combine under, floor experiments and their arms, and on each auction the rule, arm and model behind its floor.

```sql
CREATE TABLE floor_policies (            -- how a publisher's floor rules combine, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id    UUID NOT NULL REFERENCES organizations (id),
  version             INT NOT NULL,
  combine             TEXT NOT NULL CHECK (combine IN ('highest', 'most_specific')),
  floor_min_cpm_micros BIGINT NOT NULL DEFAULT 0 CHECK (floor_min_cpm_micros >= 0),
  basis               TEXT NOT NULL CHECK (basis IN ('gross', 'net')),
  applies_to_deals    BOOLEAN NOT NULL DEFAULT FALSE,
  currency            CHAR(3) NOT NULL,
  effective           TSTZRANGE NOT NULL,
  approved_by         TEXT NOT NULL,
  UNIQUE (publisher_org_id, version)
);

-- exchange_floors becomes the floor rule: one exchange, or all indirect demand.
ALTER TABLE exchange_floors ALTER COLUMN exchange_org_id DROP NOT NULL;  -- null: every demand source
ALTER TABLE exchange_floors
  DROP CONSTRAINT exchange_floors_publisher_org_id_exchange_org_id_ad_unit_id_key;
                                         -- targeted rules can share unit, exchange and dates
ALTER TABLE exchange_floors
  ADD COLUMN floor_policy_id UUID,
  ADD COLUMN name TEXT,
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'hard',   -- 'hard', 'soft', 'target_cpm', 'optimized'
  ADD COLUMN targeting JSONB NOT NULL DEFAULT '{}',
             -- {"media_type":"video","sizes":["300x250"],"countries":["US"],"devices":["phone"]}
  ADD COLUMN item_specific JSONB,        -- {"advertiser_domains":[...]} or brands; checked after the bid
  ADD COLUMN disclosed BOOLEAN NOT NULL DEFAULT TRUE,  -- sent to bidders in the request
  ADD COLUMN target_cpm_micros BIGINT,   -- target_cpm: the average the model aims at
  ADD COLUMN model_version TEXT,         -- target_cpm and optimized: what sets the value per request
  ADD COLUMN sort_order INT NOT NULL DEFAULT 0;  -- tie-break among equal floors
ALTER TABLE exchange_floors ADD CONSTRAINT exchange_floors_policy_fk
  FOREIGN KEY (floor_policy_id) REFERENCES floor_policies (id) NOT VALID;
ALTER TABLE exchange_floors ADD CONSTRAINT exchange_floors_kind_check
  CHECK (kind IN ('hard', 'soft', 'target_cpm', 'optimized')) NOT VALID;
ALTER TABLE exchange_floors ADD CONSTRAINT exchange_floors_dynamic_check
  CHECK (kind NOT IN ('target_cpm', 'optimized') OR model_version IS NOT NULL) NOT VALID;
ALTER TABLE exchange_floors ADD CONSTRAINT exchange_floors_disclosure_check
  CHECK (item_specific IS NULL OR NOT disclosed) NOT VALID;  -- brand floors aren't in the request
CREATE INDEX CONCURRENTLY exchange_floors_lookup_idx
  ON exchange_floors (publisher_org_id, exchange_org_id, ad_unit_id);

CREATE TABLE floor_experiments (         -- one randomized comparison of floor treatments
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id    UUID NOT NULL REFERENCES organizations (id),
  name                TEXT NOT NULL,
  hypothesis          TEXT NOT NULL,
  unit                TEXT NOT NULL CHECK (unit IN ('auction', 'page_view', 'user', 'site',
                        'region')),
  primary_metric      TEXT NOT NULL DEFAULT 'revenue_per_thousand_requests',
  scope               JSONB NOT NULL DEFAULT '{}',  -- which inventory is in the test
  running             TSTZRANGE NOT NULL,
  decision            TEXT,                -- what was decided, with the result
  decided_at          TIMESTAMPTZ
);

CREATE TABLE floor_experiment_arms (     -- a treatment and its share
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  floor_experiment_id UUID NOT NULL REFERENCES floor_experiments (id),
  name                TEXT NOT NULL,       -- 'control', 'skip', 'model-v7'
  treatment           TEXT NOT NULL CHECK (treatment IN ('current_rules', 'skip_floors',
                        'fixed_floor', 'model')),
  share_bp            INT NOT NULL CHECK (share_bp BETWEEN 1 AND 10000),
  fixed_floor_cpm_micros BIGINT,
  model_version       TEXT,
  UNIQUE (floor_experiment_id, name),
  CHECK (treatment <> 'fixed_floor' OR fixed_floor_cpm_micros IS NOT NULL),
  CHECK (treatment <> 'model' OR model_version IS NOT NULL)
);

-- What set each auction's floor.
ALTER TABLE auctions
  ADD COLUMN floor_rule_id UUID,          -- the exchange_floors row that supplied the disclosed floor
  ADD COLUMN floor_model_version TEXT,    -- for a dynamic floor
  ADD COLUMN floor_experiment_arm_id UUID,
  ADD COLUMN floors_skipped BOOLEAN NOT NULL DEFAULT FALSE;  -- the skip arm, or skipRate
ALTER TABLE auctions ADD CONSTRAINT auctions_floor_rule_fk
  FOREIGN KEY (floor_rule_id) REFERENCES exchange_floors (id) NOT VALID;
ALTER TABLE auctions ADD CONSTRAINT auctions_floor_arm_fk
  FOREIGN KEY (floor_experiment_arm_id) REFERENCES floor_experiment_arms (id) NOT VALID;
```

The experiment readout, revenue per thousand opportunities by arm, including auctions that sold nothing:

```sql
-- Per arm: opportunities, fill, eCPM of what sold, and revenue per thousand opportunities.
SELECT arm.name,
       count(*)                                                          AS auctions,
       round(100.0 * count(*) FILTER (WHERE a.status = 'won') / count(*), 1) AS fill_pct,
       sum(a.clearing_cpm_micros) FILTER (WHERE a.status = 'won')
         / NULLIF(count(*) FILTER (WHERE a.status = 'won'), 0)          AS ecpm_micros,
       sum(COALESCE(a.clearing_cpm_micros, 0)) / NULLIF(count(*), 0)    AS revenue_per_mille_micros
FROM auctions a
JOIN floor_experiment_arms arm ON arm.id = a.floor_experiment_arm_id
WHERE arm.floor_experiment_id = $1
  AND a.started_at >= $2 AND a.started_at < $3
GROUP BY arm.name
ORDER BY arm.name;
```

`revenue_per_mille_micros` is the average clearing CPM over all auctions, sold or not, which is revenue per thousand opportunities; the sketch omits what the fallback earned on unsold impressions, which a production readout adds from the ad server's decision for the same request (Ad Servers' `ad_decisions`), and it reads clearing prices where a publisher's readout reads its net share.

Design notes:

- **One floor table, widened.** `exchange_floors` keeps its per-exchange meaning when `exchange_org_id` is set and becomes an all-demand rule when it is null; the dropped unique key had made two targeted rules on the same unit and dates impossible. Overlap between rules is resolved by the policy's `combine` rule at read time, not prevented at write time.
- **The policy is versioned with its combination rule.** `floor_policies` holds how rules combine, the minimum, the basis and whether deals are in scope, with an effective range and an approver, the same discipline as `auction_rule_versions` ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Undisclosed floors are marked.** `item_specific` rules are `disclosed = false` by constraint, and bids they remove keep their loss reason, so a report can show how often a floor buyers never saw decided an outcome.
- **Every auction names its floor's source.** `floor_rule_id`, `floor_model_version` and `floor_experiment_arm_id` on the auction, with `floor_cpm_micros` (hard) and `soft_reserve_micros` from [Auction Mechanics](/books/advertising/auction-mechanics#how-to-build-it), answer the MRC's "reported before and after" and a publisher's "why this floor" from one row.
- **Experiments are records with a decision.** Arms, shares, unit, metric and the decision with its date are kept, so a floor that has been at $1.50 for a year can be traced to the test that chose it ([Holdouts](/docs/telemetry/experimentation#holdouts)).
- **Currency and basis are stored, not assumed.** A rule's floor, its currency and the policy's basis are on the rows; each auction converts once at a recorded rate ([Multi-Currency](/docs/money/multi-currency)).

## Auditing

- **Every floor rule as it stood.** Kind, value, targeting, scope, disclosure, model version and effective range, with who set it, because floors were part of the conduct in the ad tech case and of the complaint against Amazon.
- **Every auction's floor source.** The rule, model and arm that set each auction's floor, and its basis and currency.
- **What undisclosed floors removed.** Bids filtered by item-specific floors, counted per period.
- **Every experiment and decision.** Design, arms, metric, result and what was rolled out.
- **That floors are the same for every buyer in an auction.** A periodic check that no auction applied different disclosed floors to different bidders, and that per-exchange floors differ only by exchange.

## What This Means for the System You Build

- **State every floor's basis and currency,** and compare on one basis through the whole chain.
- **Pick one rule for overlapping floors** (highest or most specific), store it, and log which rule set each auction's floor.
- **Keep one floor per auction for every bidder;** vary floors by exchange or segment, never by buyer inside an auction.
- **Mark floors bidders don't see** and report what they removed.
- **Use soft floors only in second-price auctions,** and never let one track the winner's bid.
- **Exclude deals from open-market floors** and treat a deal's price as its own term.
- **Judge floors on revenue per opportunity with the fallback,** not on eCPM.
- **Run floors as experiments with a small, permanent skip arm,** and expect bidders to adapt after rollout.

## References

**Specifications**

- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), reserve disclosure before and after the auction, no per-buyer reserves, aggregated insights for dynamic pricing, and reserves through Deal IDs in OpenRTB
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), imp.bidfloor and bidfloorcur, deal floors and their currency, and the fixed-price deal auction type

**Court records**

- [United States v. Google LLC, No. 1:23-cv-00108 (E.D. Va.), Memorandum Opinion, Dkt. 1410 (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), Unified Pricing Rules not requiring a level playing field
- [FTC et al. v. Amazon.com, Inc., No. 2:26-cv-03097 (W.D. Wash.), Complaint (August 31, 2026)](https://ag.ny.gov/sites/default/files/court-filings/federal-trade-commission-et-al-v-amazon.com-inc-complaint-2026_0.pdf), the soft reserve allegations

**Reference**

- [Ostrovsky and Schwarz: Reserve Prices in Internet Advertising Auctions: A Field Experiment (Journal of Political Economy, 2023)](https://econpapers.repec.org/RePEc:ucp:jpolec:doi:10.1086/725702), reserve prices from optimal auction theory raising revenue in sponsored search

**In practice**

- [Google Ad Manager Help: Pricing rules](https://support.google.com/admanager/answer/9298008?hl=en), the 200-rule limit, where pricing rules apply and don't, targeting options, floor price, target CPM and Google-optimized floors, overlapping rules and item-specific floors not sent to buyers
- [Google Ad Manager Help: Pricing rules and revenue share](https://support.google.com/admanager/answer/9298211?hl=en), floors applied after Google's revenue share, the 80/20 example, overlapping rules, header bidding and remnant line items, and target CPM
- [Prebid: Price Floors Module](https://docs.prebid.org/dev-docs/modules/floors.html), rule schema and fields, enforcement options, floorMin, skipRate, floor providers, model groups and weights, getFloor and imp.bidfloor, floor data for analytics, rejected bids and currency conversion
- [Google Ads Help: About Ad Rank](https://support.google.com/google-ads/answer/1722122?hl=en), Ad Rank thresholds by position
- [Google Ads Help: Actual cost-per-click](https://support.google.com/google-ads/answer/6297?hl=en), the reserve price when no ad is below
- [Amazon: Amazon's response to the FTC's lawsuit regarding Sponsored Ads](https://www.aboutamazon.com/md/company-news/amazon-ftc-sponsored-ads-lawsuit-response), hard and soft reserves
