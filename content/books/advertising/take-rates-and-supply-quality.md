+++
title = "Take Rates & Supply Quality"
nav_title = "Take Rates & Supply"
description = "What each intermediary keeps: the ISBA/PwC and ANA studies, the court record's AdX fees, made-for-advertising sites, and supply path optimization as data."
category = "Advertising Industry"
order = 2905
part = "The Business"
tags = ["advertising", "programmatic", "take-rates", "supply-path-optimization", "transparency", "data-model"]
+++

A take rate is the share of a transaction an intermediary keeps. In programmatic advertising there are several on every impression: the agency or trading desk, the DSP, data and verification vendors on the buy side, the SSP or exchange, and supply-side technology, before the publisher is paid. Advertisers call the sum the "ad tech tax", and the industry's best-known studies found that about half of an advertiser's programmatic spend reached publishers, that a large part of it could not be traced at all, and that much of what was traced bought impressions nobody would choose: unviewable, fraudulent or on sites built only to show ads.

The engineering is hard because no single party sees the whole chain. A DSP knows what it charged and what it paid the exchange; the exchange knows the clearing price and what it paid the publisher; the publisher knows what arrived. Each hop logs its own IDs, its own time zone and its own count, and some hops are resellers that appear in nobody's contract. Measuring a take rate means joining logs across companies that never agreed to share them, and reducing it means choosing supply paths from the supply chain files (ads.txt, sellers.json and the SupplyChain object) that only work if everyone keeps them accurate. This chapter covers the published fees, the ISBA/PwC and ANA studies and what they measured, the fees found in the US court record, made-for-advertising sites, and supply path optimization, and turns them into records: fee terms per agreement, observed supply paths, log-level match results and site quality assessments. It extends `seller_accounts` and `invoice_lines` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and builds on [How the Money Splits](/books/advertising/advertising-business#how-the-money-splits), which has the per-model splits; Publishers & Yield has the publisher's view of network shares and `network_revenue_shares`; ads.txt, sellers.json & SupplyChain, in Programmatic, owns the files' specifications and validation; and Invalid Traffic & Ad Fraud owns detection.

## How the Platforms Do It

As of November 2026, the fees intermediaries publish or that the court record found. Most fees are negotiated and unpublished; a blank is an honest blank, not a zero:

| Intermediary | Side | Fee | Basis | Source |
| --- | --- | --- | --- | --- |
| **Alphabet traffic acquisition costs** | Network and search partners | 20.3% of advertising revenues paid to partners in 2025 | Blended across search distribution and Network publishers | Alphabet 10-K |
| **Amazon Transparent Ad Marketplace** | Sell side (server-to-server header bidding) | "A transparent 2.5% service fee charged to bidders" | Charged to the buyer | Amazon Publisher Services |
| **Google AdSense** | Buy and sell (network) | Buy side keeps "on average 15% of advertiser spend"; publishers receive 80% of what reaches AdSense | Two fees, applied in sequence | Google help center and blog |
| **Google Ad Manager (DFP)** | Publisher ad server | About 1.3 to 1.7% take rate, per defense expert testimony | A flat fee per impression, equal to that share of the publisher's revenue | EDVA opinion |
| **Google AdX** | Exchange | "around 20%" overall, varied per impression under dynamic revenue share | On the clearing price | EDVA opinion |
| **Google Open Bidding** | Exchange-to-exchange | "a 5% fee" on rival exchanges' bids | On the rival's bid | EDVA opinion |
| **Google Display & Video 360** | DSP | A standard rate of 15% in Google's 2020 disclosure | On media | Google blog (2020) |
| **The Trade Desk** | DSP | "a platform fee generally based on a percentage of our clients' total platform spend"; 2025 revenue was 21.6% of gross spend (derived) | On platform spend, including data and services | The Trade Desk 10-K |
| **Agencies and trading desks** | Buy side | Set in each agency agreement; 7% of spend in ISBA's 2020 sample | Varies | ISBA/PwC 2020 |

Three patterns:

- **Fees stack multiplicatively.** Each intermediary takes its share of what reaches it, not of the advertiser's original dollar. Two 20% fees in sequence leave 64%, not 60%.
- **Basis matters as much as rate.** AdSense's 80% is a share of spend after the buy side's 15%, so the publisher's net is about 68% of advertiser spend. The Trade Desk's fee is on total spend that includes data and value-added services; AdX's is on a clearing price. A "20% take rate" from two companies can be two different numbers.
- **The highest fees are the least visible.** A principal buy's margin, a reseller's share inside a supply chain, and the spread between a DSP's charge and the exchange's clearing price don't appear on any published rate card; they show up only when logs from both sides are matched.

## What the Studies Measured

Three study programs give the industry its numbers. They measured different things, and most misquotes come from mixing them.

### ISBA and PwC (UK, 2020 and 2023)

ISBA, the UK advertisers' association, commissioned PwC to trace programmatic spend from advertisers through agencies, DSPs, SSPs and publishers using log-level data from all of them. The first study, published in May 2020, found this split of advertiser spend:

| Line | Share of advertiser spend |
| --- | --- |
| Agency fee | 7% |
| DSP fee | 8% |
| Demand-side technology fee | 10% |
| SSP fee | 8% |
| Supply-side technology fee | 1% |
| **Unknown delta** | **15%** |
| Publisher revenue | 51% |

The headline that made news was the **unknown delta**: 15% of spend that the study could not attribute to anyone, because only 12% of impressions could be matched end to end. An unknown delta is a measure of missing data as much as of hidden fees: spend that can't be matched can't be assigned to anyone, which is why ISBA's later recommendations are mostly about data access, quality and retention.

The second study, on 2022 data and published January 18, 2023, raised the impression match rate to 58% and cut the unknown delta to 3% (3% in open marketplaces and under 1% in private marketplaces), and found the share of spend reaching publishers rose by 8% against the first study. It took nine months and used ISBA's Programmatic Financial Audit Toolkit (launched February 2022). Its recommendations are a specification for the data a buyer should hold: separate DSP seats for each advertiser; well-curated, auditable private marketplaces; ads.txt; regular supply chain audits; data quality standards so every vendor can supply every Toolkit field. It named data access, retention and transfer protocols as the area still needing industry work, since some SSPs still required additional manual DSP permissions before granting data access.

### ANA (US, 2023)

The ANA's Programmatic Media Supply Chain Transparency Study measured quality, not only fees. The "First Look" (June 19, 2023) covered $123 million of spend and 35.5 billion impressions from 21 advertisers, September 2022 to January 2023:

- **Made-for-advertising sites** were 21% of impressions and 15% of spend.
- **The average campaign ran on 44,000 domains.**
- **Waste of up to $20 billion,** 23% of an estimated $88 billion open-web programmatic market.

The complete report (December 2023) concluded that "Only 36 cents of every dollar that enters a demand-side platform (DSP) effectively reaches the consumer," and sized an efficiency opportunity of $22 billion. The 36 cents is **not** the publisher's share (the later benchmark, below, puts that near half): it is what the ANA counts as effectively reaching the consumer, and ANA's public page doesn't define the measure or split the other 64 cents between transaction costs and impressions that weren't worth buying. <!-- source-gap: adv-ana-2023-waterfall | secondary | the definition behind the ANA December 2023 study's 36 cents and the split of the remaining 64 cents between transaction costs and productivity loss | closes with: a public copy of the complete report's waterfall and definitions | checked: 2026-11-22 -->

### ANA and TAG TrustNet benchmark (2025 onward)

The ANA now publishes a quarterly Programmatic Transparency Benchmark with TAG TrustNet and Fiducia from participating marketers' data:

| Measure | Q3 2025 (Nov 5, 2025) | Q1 2026 (May 27, 2026) |
| --- | --- | --- |
| Share of spend reaching publishers | 47.1%, up 11 points since 2023 | Not reported on the release |
| TrueAdSpend (share of spend delivering "fraud-free, measurable, viewable, and MFA-free impressions") | 39% | 43.3% |
| Made-for-advertising share of spend | 0.39% | 1.1%, with "AI slop" flagged as a new subtype |
| CTV share of programmatic spend | 45.6% | |
| Private marketplace share of spend | 81.6% | |
| Spend converted to qualified impressions, high vs low performers | | 54.0% vs 32.1% |
| TrueCPM (per thousand qualified impressions), high vs low performers | | $7.46 vs $19.04 |
| Average CPM | | $4.42, down from $5.55 in Q4 2025 |
| Participating marketers | | 86, up from 54 |

Read across the three programs, the picture is consistent. **Fees are not most of the loss.** On ISBA's 2020 numbers, named fees were 34% of spend; on ANA's, the larger loss was spend on impressions that weren't worth buying, which no fee schedule shows. **The share reaching publishers has risen toward ISBA's half:** 47.1% in the US benchmark in late 2025, up 11 points since 2023, in a sample where private marketplaces carried 81.6% of spend. **Low performers pay more than twice as much per qualified impression,** which is a supply-selection problem, not a fee problem.

## The Court Record's Fees

The US ad tech case put Google's own fee data into a public opinion (April 17, 2025):

- **AdX took "around 20%"** overall. Under its sell-side dynamic revenue share it varied by impression: 15% or lower where competition was strong, 25% or higher elsewhere, around an overall rate of about 20%.
- **DFP's fees came to roughly 1.3 to 1.7%** as a take rate, per Google's own expert; the opinion contrasts it with AdX's 20%.
- **"Typically, between $20 to $40 of every $100 spent on digital advertising goes to the ad tech companies that develop and operate these tools."**
- **Open Bidding charged rival exchanges "a 5% fee"** to compete inside DFP, one reason the court found it no substitute for header bidding.

Two lessons carry past Google. **A per-impression take rate can be dynamic while the average stays fixed,** so an auditor comparing an exchange's published rate to one impression's clearing log will see apparent violations that average out; the comparison has to be over the period the contract defines. **The ad server's fee is small and the exchange's is large,** which is why control of the ad server's decision (who gets called, in what order, against which floor) was the case's center. The Google Ad Tech Cases, in Programmatic, covers liability and remedies.

## Made-for-Advertising Sites

A made-for-advertising (MFA) site exists to sell ad impressions bought with cheap paid traffic. The ANA, 4A's, WFA and ISBA published a shared definition on September 26, 2023, listing the signals:

- a high ad-to-content ratio, "at least twice the internet average" (for example over 30% on desktop);
- rapidly auto-refreshing ads;
- a high share of traffic from paid sources;
- generic, templated content; and
- poorly designed, templated sites.

MFA inventory is usually not invalid traffic: the visitors can be real people who arrived from a paid link, saw several ads and left. It passes ads.txt checks (the sellers are authorized) and often viewability thresholds. That is why it reached 21% of impressions in the ANA's 2023 sample and why the fix was buyers excluding it, not fraud filters catching it. By the third quarter of 2025 it was 0.39% of benchmark spend; the first quarter of 2026's rise to 1.1%, with AI-generated content sites named as a new form, shows that an exclusion list needs maintenance, not a one-time cleanup.

For the system, MFA is a **property-level classification with a source and a date**, not a property flag: vendors classify differently and change their minds, the ANA definition names signals rather than a threshold, and an advertiser's exclusion decision should record which classification it relied on. Brand Safety & Suitability covers the suitability side of the same lists.

## Supply Path Optimization

The same impression is often offered to a DSP several times: through the publisher's direct SSP account, through a reseller's account at the same SSP, and through other SSPs called by the publisher's header bidding. **Supply path optimization** (SPO) is a buyer choosing which of those paths to bid on, preferring the ones with fewer hops, lower fees and better data, and dropping the rest.

The supply chain files make the paths visible:

| File or object | What it says | Where SPO uses it |
| --- | --- | --- |
| **ads.txt / app-ads.txt** | The publisher's list of ad systems and seller account IDs authorized to sell its inventory, each `DIRECT` or `RESELLER`; version 1.1 adds `OWNERDOMAIN` and `MANAGERDOMAIN` | Drop unauthorized paths; prefer `DIRECT` |
| **sellers.json** | Each ad system's list of seller accounts, typed `PUBLISHER`, `INTERMEDIARY` or `BOTH`, with the business domain | Identify who each seller ID is and whether it owns the inventory |
| **SupplyChain object (schain)** | In each bid request, every node (`asi`, `sid`) that handled it, and whether the chain is `complete` back to the inventory owner | Count hops; reject incomplete chains; detect undisclosed resellers |

A path is the ordered list of `(asi, sid)` nodes on a request, from the inventory owner to the sender. Three measures decide whether a buyer keeps it:

- **Hops.** A one-node chain (the publisher's own account at the SSP that sent the request) is direct; every intermediary node is a hop with its own fee and log.
- **Cost.** The share of the buyer's price that reaches the publisher on that path, measured from matched logs (below) or estimated from published fees.
- **Quality.** Win rate, viewability, invalid traffic and MFA share on the path, from the buyer's own measurement.

The forms SPO takes in the market follow from those measures. DSPs build direct connections to publishers: The Trade Desk describes OpenPath as "a simplified, direct connection to publishers". SSPs and curators package supply into deals, which is part of why private marketplaces were 81.6% of benchmark spend in late 2025 (Deals, PMPs & Curation, in Programmatic). Buyers maintain allowlists of domains, apps and seller IDs instead of buying from 44,000 domains per campaign. And ISBA's recommendation of a separate DSP seat for each advertiser is SPO's audit side: a seat shared across advertisers can't produce one advertiser's path-level data.

SPO has a cost the take-rate studies don't show. Cutting paths cuts reach and competition: a publisher whose inventory reaches a DSP only through a reseller loses that DSP's bids, and an SSP removed from many DSPs' paths has less demand to offer the publishers that remain. The ANA's benchmark reports participation and CPMs next to its quality measures.

### A Fee Chain, Worked

An illustrative chain (example rates, not market rates) for $100,000 of advertiser budget on an open-auction path through one SSP:

| Hop | Rule | Takes | Remaining |
| --- | --- | --- | --- |
| Agency fee | 5% of budget | $5,000 | $95,000 to the DSP as gross spend |
| DSP platform fee | 15% of gross spend | $14,250 | $80,750 |
| Data and verification | 8% of gross spend | $7,600 | $73,150 clearing at the exchange |
| SSP fee | 20% of the clearing price | $14,630 | $58,520 |
| **Publisher** | | | **$58,520, 58.5% of budget** |

Every rate is on a different basis, and the publisher's share is the product of the complements of the sequential ones. The same arithmetic, as code that keeps amounts in micros and rounds each hop once:

```go tab="Go"
// Hop is one intermediary's fee on a fee chain.
type Hop struct {
	Party   string
	RateBP  int64  // basis points
	OfGross bool   // true: on the gross spend entering the DSP; false: on what reaches this hop
}

type Take struct {
	Party        string
	AmountMicros int64
}

// Chain applies hops to a budget and returns each party's take and the publisher's remainder.
// grossIndex is the hop after which the amount becomes the DSP's gross spend.
func Chain(budgetMicros int64, hops []Hop, grossIndex int) ([]Take, int64) {
	remaining := budgetMicros
	var gross int64
	takes := make([]Take, 0, len(hops))
	for i, h := range hops {
		base := remaining
		if h.OfGross {
			base = gross
		}
		fee := (base*h.RateBP + 5000) / 10000 // round half up, once per hop
		remaining -= fee
		takes = append(takes, Take{h.Party, fee})
		if i == grossIndex {
			gross = remaining
		}
	}
	return takes, remaining
}
```

```rust tab="Rust"
/// One intermediary's fee on a fee chain.
pub struct Hop {
    pub party: &'static str,
    pub rate_bp: i64,   // basis points
    pub of_gross: bool, // true: on the gross spend entering the DSP
}

/// Applies hops to a budget; returns each party's take and the publisher's remainder.
/// `gross_index` is the hop after which the amount becomes the DSP's gross spend.
pub fn chain(budget_micros: i64, hops: &[Hop], gross_index: usize) -> (Vec<(&'static str, i64)>, i64) {
    let mut remaining = budget_micros;
    let mut gross = 0;
    let mut takes = Vec::with_capacity(hops.len());
    for (i, h) in hops.iter().enumerate() {
        let base = if h.of_gross { gross } else { remaining };
        let fee = (base * h.rate_bp + 5_000) / 10_000; // round half up, once per hop
        remaining -= fee;
        takes.push((h.party, fee));
        if i == gross_index {
            gross = remaining;
        }
    }
    (takes, remaining)
}
```

With hops agency (500 bp), DSP (1,500 bp of gross), data and verification (800 bp of gross) and SSP (2,000 bp), a budget of 100,000,000,000 micros ($100,000) and `grossIndex` 0, the publisher's remainder is 58,520,000,000 micros. A real chain reads the rates from fee terms in force on the day and the actual amounts from matched logs; the computed chain is the expectation the matched logs are checked against.

## How to Build It

Measuring take rates needs three kinds of records the core model doesn't have: the fee each intermediary is entitled to under its agreement, the paths impressions actually took, and the result of matching one party's logs to another's. Site quality classifications are a fourth. `fee_terms` is the one table for every fee one party charges another, on either side of the chain: an agency's fee, a DSP's platform fee, an exchange's or SSP's take from the buyer or the publisher, a curator's fee, data, verification and ad serving. A fee is a percentage of a named basis, a CPM or a flat amount per period, and later chapters add their fee kinds here rather than a table of their own:

```sql
CREATE TABLE fee_terms (                   -- every fee one party charges another, and on what
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  charging_org_id     UUID NOT NULL REFERENCES organizations (id),  -- who takes it: agency, DSP, exchange or SSP, curator, vendor
  charged_org_id      UUID REFERENCES organizations (id),           -- who pays it; null: every customer on the standard rate card
  kind                TEXT NOT NULL CHECK (kind IN ('agency_fee', 'dsp_platform_fee',
                        'exchange_buy_side_fee', 'exchange_sell_side_fee', 'curation_fee',
                        'data_fee', 'verification_fee', 'ad_serving_fee', 'other')),
  -- at most one narrower scope; none set: the whole relationship
  agency_agreement_id UUID REFERENCES agency_agreements (id),       -- an agency's fee under its agreement
  ad_account_id       UUID REFERENCES ad_accounts (id),
  buyer_seat_id       UUID REFERENCES buyer_seats (id),
  seller_account_id   UUID REFERENCES seller_accounts (id),         -- an exchange's take on one seller
  deal_id             UUID REFERENCES deals (id),                   -- a curator's or exchange's fee on one deal
  scope_id            UUID GENERATED ALWAYS AS (COALESCE(agency_agreement_id, ad_account_id,
                        buyer_seat_id, seller_account_id, deal_id,
                        '00000000-0000-0000-0000-000000000000'::UUID)) STORED,
  method              TEXT NOT NULL CHECK (method IN ('percent', 'cpm', 'flat')),
  rate_bp             INT CHECK (rate_bp BETWEEN 0 AND 10000),      -- percent: basis points of the basis
  basis               TEXT CHECK (basis IN ('budget', 'gross_spend', 'media_cost', 'net_media',
                        'clearing_price')),                         -- percent: what the rate applies to
  cpm_micros          BIGINT CHECK (cpm_micros >= 0),               -- cpm: micros per thousand impressions
  flat_minor          BIGINT CHECK (flat_minor >= 0),               -- flat: minor units per period
  flat_period         TEXT CHECK (flat_period IN ('month', 'quarter', 'year', 'flight')),
  currency            CHAR(3),                                      -- cpm and flat amounts
  disclosed           BOOLEAN NOT NULL,                             -- shown to the party paying it
  valid_during        DATERANGE NOT NULL,                           -- effective dates, in the agreement's days
  agreement_ref       TEXT NOT NULL,                                -- contract, rate card or terms URL and version
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(agency_agreement_id, ad_account_id, buyer_seat_id, seller_account_id,
         deal_id) <= 1),
  CHECK ((method = 'percent') = (rate_bp IS NOT NULL AND basis IS NOT NULL)),
  CHECK ((method = 'cpm') = (cpm_micros IS NOT NULL)),
  CHECK ((method = 'flat') = (flat_minor IS NOT NULL AND flat_period IS NOT NULL)),
  CHECK (method = 'percent' OR currency IS NOT NULL),
  EXCLUDE USING gist (charging_org_id WITH =,
    (COALESCE(charged_org_id, '00000000-0000-0000-0000-000000000000'::UUID)) WITH =,
    kind WITH =, scope_id WITH =, valid_during WITH &&)
);

CREATE TABLE supply_paths (                -- a distinct chain of sellers an impression arrived through
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id         UUID NOT NULL REFERENCES properties (id),
  nodes               JSONB NOT NULL,      -- [{"asi": "ssp.example", "sid": "123", "hp": 1}, ...] owner first
  path_hash           BYTEA NOT NULL,      -- hash of the normalized node list
  hops                SMALLINT NOT NULL CHECK (hops >= 1),
  complete            BOOLEAN NOT NULL,    -- schain.complete as received
  final_seller_account_id UUID REFERENCES seller_accounts (id),  -- the node that sent the request
  first_seen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (property_id, path_hash)
);

CREATE TABLE supply_path_daily (           -- the buyer's view of each path, per day
  supply_path_id      UUID NOT NULL REFERENCES supply_paths (id),
  buyer_seat_id       UUID NOT NULL REFERENCES buyer_seats (id),
  day                 DATE NOT NULL,
  bid_requests        BIGINT NOT NULL DEFAULT 0,
  bids                BIGINT NOT NULL DEFAULT 0,
  wins                BIGINT NOT NULL DEFAULT 0,
  impressions         BIGINT NOT NULL DEFAULT 0,
  viewable_impressions BIGINT NOT NULL DEFAULT 0,
  ivt_impressions     BIGINT NOT NULL DEFAULT 0,
  spend_micros        BIGINT NOT NULL DEFAULT 0,  -- what the buyer paid on this path
  ads_txt_status      TEXT NOT NULL CHECK (ads_txt_status IN ('direct', 'reseller',
                        'unauthorized', 'unknown')),
  decision            TEXT CHECK (decision IN ('preferred', 'allowed', 'blocked')),
  PRIMARY KEY (supply_path_id, buyer_seat_id, day)
);

CREATE TABLE log_match_runs (              -- one cross-party reconciliation of logs
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id       UUID REFERENCES advertisers (id),
  period              DATERANGE NOT NULL,
  buyer_source_org_id UUID NOT NULL REFERENCES organizations (id),   -- the DSP whose log is the left side
  seller_source_org_id UUID NOT NULL REFERENCES organizations (id),  -- the SSP or publisher on the right
  match_key           TEXT NOT NULL,       -- e.g. 'source.tid', 'imp_id+auction_id'
  buyer_impressions   BIGINT NOT NULL,
  matched_impressions BIGINT NOT NULL CHECK (matched_impressions <= buyer_impressions),
  buyer_spend_micros  BIGINT NOT NULL,
  matched_spend_micros BIGINT NOT NULL,
  publisher_revenue_micros BIGINT,          -- on matched impressions, from the seller's log
  unknown_delta_micros BIGINT,              -- matched spend not explained by known fees and revenue
  method_ref          TEXT NOT NULL,        -- the toolkit or audit specification followed
  completed_at        TIMESTAMPTZ
);

CREATE TABLE property_quality_assessments (  -- MFA and similar classifications, by source and date
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id         UUID NOT NULL REFERENCES properties (id),
  source_org_id       UUID NOT NULL REFERENCES organizations (id),  -- verification vendor, or this system
  classification      TEXT NOT NULL CHECK (classification IN ('mfa', 'not_mfa', 'suspected_mfa',
                        'ai_generated', 'other')),
  signals             JSONB NOT NULL DEFAULT '{}',  -- ad-to-content ratio, refresh rate, paid traffic share
  definition_ref      TEXT NOT NULL,       -- e.g. 'ana-4as-wfa-isba-2023-09'
  assessed_at         TIMESTAMPTZ NOT NULL,
  expires_at          TIMESTAMPTZ
);

-- fees on invoices point at the term that produced them
ALTER TABLE invoice_lines ADD COLUMN fee_term_id UUID;
ALTER TABLE invoice_lines ADD CONSTRAINT invoice_lines_fee_term_fk
  FOREIGN KEY (fee_term_id) REFERENCES fee_terms (id) NOT VALID;

-- when this seller account's sellers.json row was last checked against the schain nodes that cite it
ALTER TABLE seller_accounts ADD COLUMN sellers_json_checked_at TIMESTAMPTZ;

CREATE INDEX property_quality_assessments_current_idx
  ON property_quality_assessments (property_id, assessed_at DESC);

-- after backfilling fee_term_id on fee lines
ALTER TABLE invoice_lines VALIDATE CONSTRAINT invoice_lines_fee_term_fk;
```

A take rate is never a stored percentage: it is `publisher_revenue_micros / matched_spend_micros` on a log match run, reported with that run's match rate. What a seat bought by path is a query over the daily rows:

```sql
-- one seat's spend, viewability and invalid traffic by path hop count, for a period
SELECT p.hops,
       SUM(d.spend_micros) AS spend_micros,
       SUM(d.impressions) AS impressions,
       ROUND(100.0 * SUM(d.viewable_impressions) / NULLIF(SUM(d.impressions), 0), 1) AS viewable_pct,
       ROUND(100.0 * SUM(d.ivt_impressions) / NULLIF(SUM(d.impressions), 0), 2) AS ivt_pct
FROM supply_path_daily d
JOIN supply_paths p ON p.id = d.supply_path_id
WHERE d.buyer_seat_id = $1 AND d.day >= $2 AND d.day < $3
GROUP BY p.hops
ORDER BY p.hops;
```

Design notes:

- **A fee is a term with a method and a basis, not a percentage.** `method` says whether the fee is a percentage, a CPM or a flat amount per period, and each method has exactly its own columns. For a percentage, `basis` says what the rate applies to (budget, gross spend including data and fees, media cost, media net of passed-through rebates, or the clearing price), so the chain can be recomputed in order. `disclosed` records whether the paying party could see it, which is what a transparency audit asks.
- **The charging and the charged party are both explicit.** The same exchange appears twice: as `exchange_buy_side_fee` charged to a DSP (a bidder fee such as TAM's 2.5%) and as `exchange_sell_side_fee` charged to a publisher (AdX's take). A null `charged_org_id` is the standard rate card; a negotiated term for one payer, or one narrower scope (an agency agreement, ad account, seat, seller account or deal), overrides it, and the most specific term in force on the day wins. The exclusion constraint (it needs the `btree_gist` extension for the equality columns) keeps two terms of the same kind, payer and scope from overlapping in time.
- **One fee table, two views of a share.** A network's or exchange's own system records what it charges as `fee_terms`; a publisher's system records what it receives as `network_revenue_shares` in Publishers & Yield, the same agreement seen from the payee's side, with the publisher's share as the complement of the take on the same basis. Agency fees live here too, pointing at the agency agreement in Agencies & Media Buying.
- **Every fee line points at its term.** An invoice line keeps the core's coarse `kind`; `fee_term_id` gives the exact fee, rate and agreement that produced it.
- **Paths are normalized and hashed.** The same `(asi, sid)` sequence arrives on millions of requests; storing it once per property, keyed by a hash of the normalized node list (lowercased domains, trimmed IDs), makes path-level reporting a join instead of a JSON scan. An incomplete chain (`complete = false`) is kept as its own path, because incompleteness is the signal.
- **ads.txt status is per day.** A seller authorized today may be removed tomorrow; `supply_path_daily.ads_txt_status` records what the crawled file said on the day the impressions ran, read from the crawl history that ads.txt, sellers.json & SupplyChain models.
- **Matching is a run with a method.** A log match covers a period, two parties, a key and a specification (ISBA's Toolkit or the audit contract); it records the match rate (`matched_impressions / buyer_impressions`) and the unknown delta on matched spend. Unmatched spend is not assumed to be fee; the match rate is reported next to every take rate derived from it, because a 12% match rate and a 58% one support different conclusions.
- **The best match key is the shared transaction ID.** OpenRTB's `source.tid` is common to every participant in a transaction; DSPs and SSPs that both log it can match without impression-level guesswork. Where it is missing, impression and auction IDs per hop chain the match, with lower rates.
- **Quality is assessed, dated and sourced.** `property_quality_assessments` keeps every vendor's MFA classification with its signals and the definition it applies, and expires it; an exclusion list is built from the current assessments by a rule the advertiser chose, and the decision records which assessments it used.
- **Data access is a contract term the system enforces.** Log-level matching only works if the agreement grants it; the fields required, the retention period and the delivery method belong on the agreement, and a vendor that fails to deliver them is a finding, not a data gap ([Privacy Erasure and the Audit Store](/docs/building-blocks/audit-trails#privacy-erasure-and-the-audit-store) applies to the identifiers inside them).

## Auditing

- **Every fee with its term.** Each fee charged on the advertiser's spend, with the term, rate, basis and whether it was disclosed, recomputable from delivery rows.
- **The path each impression took.** For any line item and day, the supply paths that delivered it, their hop counts, their ads.txt status on the day and whether the chain was complete.
- **Every log match and its coverage.** The run, its period, parties, key, method, match rate and unknown delta, kept with the derived take rates so no figure is quoted without its match rate.
- **Which quality classifications drove exclusions.** The assessment, source, definition and date behind every MFA exclusion.
- **Who could see what.** Whether the advertiser had log-level access at each hop, and when it was granted or refused.

## What This Means for the System You Build

- **Record fees as terms with a basis and a disclosure flag,** and link every fee line on an invoice to its term.
- **Compute take rates from matched logs,** never from rate cards alone, and report the match rate beside every one.
- **Log the SupplyChain object on every bid and impression,** normalize it into paths, and report spend, quality and fees by path.
- **Prefer direct, complete paths,** keep resellers only where they add demand or reach, and record each path decision with its date.
- **Keep the shared transaction ID** from the bid request through every log, because it is what makes cross-party matching possible.
- **Classify site quality by source, signal and date,** and build exclusion lists from current assessments by an explicit rule.
- **Put log-level data access, fields and retention in the contract,** so an audit is a query, not a negotiation.

## References

**Specifications**

- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), `source.tid` as the transaction ID shared by all participants and schain in the source object
- [IAB Tech Lab: SupplyChain object](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb/main/supplychainobject.md), nodes, `asi`, `sid`, `hp` and `complete`
- [IAB Tech Lab: sellers.json 1.0](https://iabtechlab.com/wp-content/uploads/2019/07/Sellers.json_Final.pdf), seller types and seller IDs matching ads.txt and schain
- [IAB Tech Lab: ads.txt 1.1](https://iabtechlab.com/wp-content/uploads/2022/04/Ads.txt-1.1.pdf), DIRECT and RESELLER records, OWNERDOMAIN and MANAGERDOMAIN

**Court records**

- [United States v. Google LLC, E.D. Va. No. 1:23-cv-00108, Memorandum Opinion (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), AdX's take rate of around 20% and dynamic revenue share, DFP fees of about 1.3 to 1.7%, $20 to $40 of every $100, and the Open Bidding fee

**Filings**

- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), traffic acquisition costs as 20.3% of advertising revenues
- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), the platform fee on total platform spend, OpenPath, net reporting
- [The Trade Desk: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000009/ttd-20260225x8kexx991.htm), 2025 revenue and gross spend

**Reference**

- [ISBA: Programmatic Supply Chain Transparency Study, executive summary (2020)](https://www.isba.org.uk/system/files/media/documents/2020-12/executive-summary-programmatic-supply-chain-transparency-study.pdf), the split of advertiser spend and the 15% unknown delta
- [ISBA: Second programmatic supply chain study (2023)](https://www.isba.org.uk/article/isbas-programmatic-supply-chain-study-finds-match-rate-increases-and-reduction), the 58% match rate, 3% unknown delta, open and private marketplace deltas, and the recommendations
- [ANA: Programmatic Media Supply Chain Transparency Study, First Look (June 2023)](https://www.ana.net/content/show/id/pr-2023-06-programmaticstudy), the sample, MFA share of impressions and spend, domains per campaign and the $20 billion waste estimate
- [ANA: Programmatic Media Supply Chain Transparency Study](https://www.ana.net/content/show/id/media-programmatic-transparency), 36 cents of every dollar reaching the consumer and the $22 billion opportunity
- [ANA: Programmatic transparency benchmark, third quarter 2025](https://www.ana.net/content/show/id/pr-2025-11-transparency), share reaching publishers, TrueAdSpend, MFA, CTV and PMP shares, and the partners
- [ANA: Programmatic transparency benchmark, first quarter 2026](https://www.ana.net/content/show/id/pr-2026-05-programmatic), TrueAdSpend definition and value, MFA rise and AI slop, high and low performers, TrueCPM, CPMs and participants
- [ANA, 4A's, WFA and ISBA: Definition of made-for-advertising sites (September 2023)](https://ana.net/content/show/id/81828), the MFA signals

**In practice**

- [Google AdSense: Revenue share](https://support.google.com/adsense/answer/180195?hl=en), the 80% sell-side share and the 68% net through Google Ads
- [Google: Evolving how publishers monetize with AdSense](https://blog.google/products/adsense/evolving-how-publishers-monetize-with-adsense/), the 15% average buy-side fee
- [Google: Display buying and publisher revenue share (2020)](https://blog.google/products/admanager/display-buying-share-revenue-publishers/), DV360's standard rate and publishers keeping over 69% in 2019
- [Amazon Publisher Services: Transparent Ad Marketplace](https://aps.amazon.com/aps/transparent-ad-marketplace/), the 2.5% service fee charged to bidders
