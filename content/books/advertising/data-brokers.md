+++
title = "Data Brokers & Third-Party Data"
nav_title = "Data Brokers"
description = "Data marketplaces, segment pricing and data fees, the Data Transparency Standard, the Delete Act and DROP, state registries, FTC location cases and PADFAA."
category = "Advertising Industry"
order = 2931
part = "Identity and Audiences"
tags = ["advertising", "ad-tech", "data-brokers", "audiences", "privacy", "data-model"]
+++

Third-party data is audience data a buyer gets from someone who is neither the buyer nor the publisher: a segment of "auto intenders", "new movers" or "frequent travelers" assembled by a data provider from purchase records, app location signals, survey panels, browsing or offline files, and sold for use in targeting. A data broker, in California's words, is a business that knowingly collects and sells to "third parties the personal information of a consumer with whom the business does not have a direct relationship." In programmatic advertising, brokers' segments are listed in DSP and exchange data marketplaces, priced per impression or as a share of media, and paid from the advertiser's budget on top of the media cost.

It is hard because the data is about people who never dealt with the seller, which is exactly the situation privacy law treats most strictly. The buyer cannot see how a segment was built and has to rely on labels; the fee logic when several segments apply to one impression is non-obvious and varies by platform; and since 2024 the legal ground has moved fast: the FTC has banned several brokers from selling sensitive location data, including one that harvested it from bid requests it didn't win, California runs a one-stop deletion platform every registered broker must poll every 45 days, several states require brokers to register, and federal law restricts sales of sensitive data to foreign adversaries.

This chapter covers how third-party data reaches a buyer (marketplaces and how data fees are charged), what a segment label should say (IAB Tech Lab's Data Transparency Standard), the registration and deletion regimes (California's Delete Act and DROP, Oregon, Texas, Vermont), the FTC's location-data cases and what they mean for anyone touching bid requests, the federal foreign-adversary rules, and the records a broker, a marketplace and a buyer keep. It extends `organizations` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and its `invoice_lines` of kind `data_fee`. The fee itself is a row in the one fee table [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it) defines (`fee_terms`); segment IDs and taxonomies in the bid request are Targeting & Taxonomies; first-party and onboarded audiences are First-Party Data & Audiences; the opt-out signals a broker must honor are GPP, GPC & US Opt-Outs; the state laws' sale and sharing definitions are US State Privacy Law for Advertising; sensitive categories are Sensitive Data & Discriminatory Targeting. Licensing user content to AI and data buyers from a platform's side is the User-Generated Platforms volume's [Data Licensing as Revenue](/books/user-generated-platforms/ads-and-data-licensing#data-licensing-as-revenue).

## How the Platforms Do It

As of November 2026, from each platform's help pages and the regulators' sites.

| Platform or regime | What it is | Money or obligation | What the buyer or broker must do |
| --- | --- | --- | --- |
| **California Delete Act and DROP** | Registry of data brokers plus the Delete Request and Opt-out Platform, live January 1, 2026, reaching "over 600 registered data brokers" | Annual registration fee "$6,000 plus an associated third-party processing fee"; separate DROP access fees from August 1, 2026 | Register January 1 to 31; from August 1, 2026, access DROP "at least once every 45 days" and process deletions |
| **Display & Video 360** | Third-party audience lists from data providers, and commerce audiences from commerce media networks | Third-party list fees, which Google says "can range between $0.50 to more than $2 CPM"; commerce audiences "billed as a percent of media cost", optionally with a CPM cap | Read data costs by provider and list in the Third-Party Data Provider report; expect per-provider maximums under AND and exclusions, a random provider under OR |
| **FTC (federal)** | Orders against brokers selling sensitive location data (X-Mode, InMarket, Gravy Analytics and Venntel, Mobilewalla, Kochava) and PADFAA enforcement | Civil penalties under PADFAA "up to $53,088 per violation" | No sale of sensitive location data without consent; no retention of bid request data beyond the auction (Mobilewalla) |
| **IAB Tech Lab Data Transparency Standard** | A label for audience segments, "up to 20" standardized disclosure fields | Compliance program with "an annual business audit" | Publish a label per segment; listing in the Transparency Center |
| **Oregon** | Data broker registry since January 1, 2024 | $600 a year | Register before brokering Oregon residents' data; renew before year end |
| **Texas** | Data broker registration with the Secretary of State under Business and Commerce Code chapter 510 | $300, renewable yearly | Register to do business in Texas |

Three patterns run through the table:

- **Data fees are per impression and stack by provider.** A buyer's data cost depends on how many providers' segments matched and how the line item combined them, not on how many segments it selected.
- **Registration is turning into operations.** California's regime is not a filing; it is a deletion queue every broker must poll and process on a 45-day clock, with audits from 2028.
- **The FTC treats location from ad tech as sensitive by default.** Every recent order bans or restricts sensitive location data, and the Mobilewalla order reaches bidders that keep bid request data they didn't need to bid.

## How Third-Party Data Reaches a Buyer

The paths, from most to least direct:

- **DSP data marketplaces.** Providers list segments in a DSP; the buyer adds them to a line item's targeting; the DSP charges the data fee per impression with the media and pays the provider. DV360's third-party audience lists work this way, with a Third-Party Data Provider report of costs by provider and list.
- **Exchange and curator deals.** The segment is applied on the sell side: a curator or SSP packages inventory with audience data into a deal, and the data cost is in the deal price or the curator's fee ([Deals, PMPs & Curation](/books/advertising/deals-and-curation#curator-fees-and-fee-transparency) covers curation fees).
- **Seller-defined and curated segments.** The publisher or its data partner sends segment IDs in `user.data` with a `segtax` (Targeting & Taxonomies), so the buyer receives the audience without an identifier.
- **Onboarding to a platform.** A broker's file is matched to a platform's users and appears as an audience in the buyer's account, priced per use or by license.
- **Commerce audiences.** Retailers and other commerce media networks license shopper segments; in DV360 these are "billed as a percent of media cost", with an optional cap, and their licensing and fee terms are negotiated "directly between the advertiser and the commerce media network" while DV360 bills the brand and counts the fee against the line item budget.

## How Data Fees Are Charged

DV360 documents the combination rules a fee engine has to implement, and they are not obvious:

- **OR across providers:** when a line item targets any of several lists and an impression matches lists from several providers, "one of the providers will be randomly selected", and only that provider's cost applies.
- **OR with a first-party list:** when a first-party list also matches, DV360 "will defer to the first-party list in this case and not bill for those impressions."
- **AND across lists:** "you will pay each data provider for the most expensive list of theirs this line item targeted."
- **Exclusions:** "you will pay each data provider for the cost for the most expensive list", because excluding a provider's segment still uses that provider's data.
- **Combined rules:** "you will only pay the maximum of each rule per data provider, not the summation."
- **Percent of media with a cap:** a commerce audience at 15% of media with a $2.00 CPM cap "will never exceed $0.002 per impression."

Google's tips page puts third-party fees at "$0.50 to more than $2 CPM" and warns that a new audience can take up to 72 hours to become available after it is first targeted. Data fees are therefore one of the deductions between an advertiser's spend and the publisher's revenue that [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#a-fee-chain-worked) counts in the programmatic dollar.

A fee calculator for one impression, implementing those rules for the AND/exclusion case (each matched provider at its highest-priced targeted list) and the percent-of-media case with a cap, in micros:

```go tab="Go"
type ListFee struct {
	ProviderID string
	CPMMicros  int64 // the list's CPM in micros of the currency
}

// PerImpressionDataFeeMicros returns the data fee for one impression in
// micros: each provider once, at its most expensive targeted list
// (AND and exclusion rules), never the sum of a provider's lists.
func PerImpressionDataFeeMicros(targeted []ListFee) int64 {
	maxByProvider := map[string]int64{}
	for _, l := range targeted {
		if l.CPMMicros > maxByProvider[l.ProviderID] {
			maxByProvider[l.ProviderID] = l.CPMMicros
		}
	}
	var cpm int64
	for _, v := range maxByProvider {
		cpm += v
	}
	return cpm / 1000 // CPM to per impression; exact when CPMs move in $0.001 steps
}

// PercentOfMediaFeeMicros applies a percent-of-media fee (basis points) with
// an optional CPM cap, e.g. 1500 bp capped at 2,000,000 micros CPM.
func PercentOfMediaFeeMicros(mediaMicros int64, feeBP int64, capCPMMicros int64) int64 {
	fee := mediaMicros * feeBP / 10000
	if capCPMMicros > 0 && fee > capCPMMicros/1000 {
		fee = capCPMMicros / 1000
	}
	return fee
}
```

```rust tab="Rust"
use std::collections::HashMap;

pub struct ListFee<'a> {
    pub provider_id: &'a str,
    pub cpm_micros: i64, // the list's CPM in micros of the currency
}

/// Data fee for one impression in micros: each provider once, at its most
/// expensive targeted list (AND and exclusion rules), never the sum.
pub fn per_impression_data_fee_micros(targeted: &[ListFee]) -> i64 {
    let mut max_by_provider: HashMap<&str, i64> = HashMap::new();
    for l in targeted {
        let e = max_by_provider.entry(l.provider_id).or_insert(0);
        *e = (*e).max(l.cpm_micros);
    }
    max_by_provider.values().sum::<i64>() / 1000 // CPM to per impression
}

/// Percent-of-media fee (basis points) with an optional CPM cap,
/// e.g. 1500 bp capped at 2_000_000 micros CPM.
pub fn percent_of_media_fee_micros(media_micros: i64, fee_bp: i64, cap_cpm_micros: i64) -> i64 {
    let fee = media_micros * fee_bp / 10_000;
    if cap_cpm_micros > 0 {
        fee.min(cap_cpm_micros / 1000)
    } else {
        fee
    }
}
```

Worked example: an impression bought at a $4.00 CPM (4,000 micros of media) under a line item that ANDs a provider A list at $1.25 CPM and a provider B list at $1.50 CPM, and excludes a second provider A list at $0.75: A is charged once at $1.25 and B at $1.50, a $2.75 data CPM, 2,750 micros for the impression. The same impression under a 15% commerce audience capped at $2.00 CPM is 15% of 4,000 = 600 micros, under the 2,000-micro cap. The OR case needs a random choice among matched providers and the first-party deferral, which belong in the serving path where the matched lists are known.

## What a Segment Label Should Say

A buyer cannot audit a broker's segment directly, so the industry's answer is disclosure. IAB Tech Lab's Data Transparency Standard "establishes minimum disclosure requirements for audience data providers", covering standalone providers, providers that bundle data with media, and data marketplaces, with "up to 20 new standardized disclosure fields" on matters like recency, provenance and segmentation criteria; the field list is in the standard's version 1.2 document. It explicitly does not grade a segment's efficacy or quality. Organizations can complete a compliance program that "requires an annual business audit to confirm that the information provided within the labelling is reliable", typically 2 to 5 months, which earns a seal and a listing in the Tech Lab Transparency Center, a member-only repository that "will only house descriptive segment labels instead of the segment IDs themselves." The standard's page points to IAB Tech Lab's Audience Taxonomy as the matching vocabulary (Targeting & Taxonomies).

For a platform listing segments, the label fields become columns on the segment record (below), so buyers can filter on them and the platform can refuse segments whose label says something its policy forbids (a precise-location source, a sensitive category, a modeled segment presented as observed).

## Registration and Deletion Laws

**California: the Delete Act and DROP.** California requires every data broker to register each year, starting the year after it began brokering Californians' data, between January 1 and January 31 (for 2026, through DROP), paying "$6,000 plus an associated third-party processing fee". SB 361 (2025) expanded the registration disclosures: whether the broker collects sensitive data such as sexual orientation, union membership or citizenship status; the types of personal information collected, including mobile advertising IDs and login or account information; and selling and sharing practices, including sharing with foreign actors, law enforcement or generative AI developers. Brokers must publish, by July 1 after their first year, the number of deletion, access, opt-out and sensitive-data limitation requests received, complied with and denied, with median and mean response times; from January 1, 2028 and every three years they must undergo an independent audit, and from 2029 disclose their audit status. A broker that fails to register may face administrative fines and costs. Statutory per-day penalty amounts are in the Civil Code, which was not reachable for this chapter. <!-- source-gap: adv-delete-act-penalties | missing | California Delete Act per-day penalties for unregistered brokers and unprocessed deletions (Civ. Code 1798.99.82) | closes with: the leginfo.legislature.ca.gov text of Civ. Code 1798.99.82 or a CPPA page quoting the amounts | checked: 2026-11-22 -->

The Delete Request and Opt-out Platform (DROP) launched January 1, 2026. A Californian verifies residency through the California Identity Gateway, creates a profile with the identifiers they choose to share, and submits one request that reaches all registered brokers (also on behalf of a child or another relative). From August 1, 2026, brokers "must access DROP at least once every 45 days to begin processing deletion requests" and "must delete data every 45 days"; by November 2026 all brokers should have completed their initial download and upload cycle, and consumers may wait up to 90 days to see status updates. The California Privacy Protection Agency (which calls itself CalPrivacy) launched a Data Broker Enforcement Strike Force on November 19, 2025, announced on December 3, 2025 a fine against a marketing firm for "Selling Custom Audiences Without Data Broker Registration", and proposed Data Broker Updates and DROP Audit regulations with comments open from November 13, 2026 to January 6, 2027.

The engineering shape of DROP is a recurring batch job with a deadline: download the deletion list, match it against the broker's records using the identifiers DROP provides, delete and stop selling, upload status, and do it again within 45 days, keeping proof of each cycle.

**Oregon.** Oregon's registry requires a business that "collects and sells or licenses brokered personal data" about Oregon residents to register, from January 1, 2024, for $600 a year; registrations run to the end of each calendar year and are renewed at least 30 days before they expire.

**Texas.** Data brokers must register with the Secretary of State under Business and Commerce Code chapter 510 (section 510.005) for $300 a year; the Secretary of State is only the filing officer and does not investigate or enforce.

**Vermont.** Vermont also requires data brokers to register with its Secretary of State; the state's page refused automated access for this chapter, so its fee and disclosure requirements are not stated here. <!-- source-gap: adv-vermont-broker-registry | missing | Vermont data broker registration fee, deadline and disclosures | closes with: the Vermont Secretary of State data broker page or 9 V.S.A. chapter 62 text | checked: 2026-11-22 -->

Registration status belongs in the broker's records per state and year, and in a marketplace's records per provider: a platform that lists an unregistered broker's segments for California residents is buying from a seller the CPPA is now fining.

## The FTC's Location Data Cases

Location data from apps and ad tech has been the FTC's main data broker target. The orders, in sequence:

- **X-Mode Social and Outlogic (January 9, 2024).** The FTC's "first settlement with a data broker concerning the collection and sale of sensitive location information"; banned from selling sensitive location data.
- **InMarket (January 18, 2024).** Banned from selling or licensing any precise location data; the FTC cited nearly 2,000 audience lists such as "wealthy and not healthy".
- **Avast (February 22, 2024).** $16.5 million and a ban on selling browsing data for advertising; its Jumpshot subsidiary had sold browsing data to more than 100 parties from 2014 to 2020.
- **Mobilewalla (December 3, 2024).** The FTC alleged Mobilewalla collected location data "from real-time bidding exchanges and third-party aggregators", more than 500 million advertising IDs with precise location from January 2018 to June 2020, and that "it unfairly collected and retained the information in the bid request, even when it didn't have a winning bid." The proposed order bans use, sale and disclosure of sensitive location data and bars collecting or retaining auction data "for any other purpose than participating in the auction".
- **Gravy Analytics and Venntel (final January 14, 2025).** Barred from selling, disclosing or using sensitive location data except in limited national security or law enforcement circumstances; the FTC said Gravy used geofencing to build and sell lists of people who visited health care facilities and places of worship.
- **Kochava and Collective Data Solutions (May 4, 2026).** After litigation that began with a 2022 complaint, a stipulated order (approved by the Commission 2-0, entered June 26, 2026) bars both from selling, licensing, transferring, sharing or disclosing sensitive location data unless consumers give "affirmative express consent" and the data serves a service they directly requested; no monetary amount was stated.

What these mean for ad tech engineering:

- **A bid request is not a data source.** Mobilewalla's order makes explicit what exchange terms usually say: a bidder may use bid request data to bid, and keeping it to build profiles or sell it is unfair. A bidder's logging of losing auctions has to be limited to what bidding, billing and fraud detection need, with retention to match ([How Programmatic Works](/books/advertising/how-programmatic-works#who-sees-what) covers what a bid request reveals).
- **Precise location is sensitive by default.** Sensitive places (health care, religion, military, shelters, schools) are listed in the orders; a geofence around them is the conduct, and state laws such as Washington's My Health My Data Act ban it outright (Sensitive Data & Discriminatory Targeting).
- **Consent must be provable at the source.** The orders require supplier assessment programs and consent records; a buyer of location-derived segments keeps evidence that its suppliers obtained consent.

## Federal Rules on Foreign Adversaries

**PADFAA.** The Protecting Americans' Data from Foreign Adversaries Act bars data brokers from selling, releasing, disclosing or giving access to personally identifiable sensitive data about Americans to foreign adversaries (North Korea, China, Russia and Iran) or entities they control. Sensitive data includes health, financial, genetic, biometric, geolocation and sexual behavior information, account or device login credentials and government identifiers. On February 9, 2026, the FTC announced it had sent letters to 13 data brokers reminding them of the law, which carries civil penalties "up to $53,088 per violation."

**The DOJ Data Security Program** (28 CFR Part 202, under Executive Order 14117) "went into effect on April 8, 2025", restricting transactions that give countries of concern access to bulk sensitive personal data (genomic, geolocation, biometric, health, financial and other) and US government-related data, with due diligence, audit and reporting requirements effective October 5, 2025. Its bulk thresholds and the data brokerage prohibition are in the regulation itself, not restated here.

For a broker or a marketplace, both regimes turn into counterparty screening: who ultimately owns and controls each buyer, recorded and rechecked, and a block on sensitive categories for buyers that fail.

## How to Build It

The core model has `organizations` (a data provider is one, with `kinds` including `data_provider`) and `invoice_lines` with kind `data_fee`. This chapter adds the segment as a record with its label and policy flags, the daily usage that a data fee bills on, the broker's state registrations, and each deletion cycle. Prices are not columns here: a segment's fee is a row in `fee_terms`, the one table [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it) defines for every fee one party charges another.

```sql
CREATE TABLE data_segments (             -- a third-party segment offered for targeting
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  provider_org_id     UUID NOT NULL REFERENCES organizations (id),
  marketplace_org_id  UUID REFERENCES organizations (id),  -- the DSP or exchange listing it
  external_code       TEXT NOT NULL,      -- the provider's segment ID
  name                TEXT NOT NULL,
  taxonomy_node_id    UUID REFERENCES taxonomy_nodes (id),  -- an Audience Taxonomy node
  build_method        TEXT NOT NULL CHECK (build_method IN ('observed', 'declared',
                        'inferred', 'modeled')),
  data_sources        TEXT[] NOT NULL,    -- e.g. {'purchase','survey','app_location','offline'}
  uses_precise_location BOOLEAN NOT NULL,
  sensitive_category  BOOLEAN NOT NULL,   -- health, financial status, minors, religion...
  refresh_days        SMALLINT,
  lookback_days       SMALLINT,           -- how far back qualifying activity may be
  geography           TEXT[] NOT NULL,    -- countries or regions the members are in
  label_ref           TEXT,               -- the Data Transparency Standard label, if published
  label_audited_on    DATE,               -- last annual audit, if in the compliance program
  fee_term_id         UUID REFERENCES fee_terms (id),  -- the current price, a 'data_fee' row
  policy_status       TEXT NOT NULL DEFAULT 'pending' CHECK (policy_status IN ('pending',
                        'approved', 'restricted', 'rejected')),
  status              TEXT NOT NULL CHECK (status IN ('active', 'paused', 'retired')),
  UNIQUE NULLS NOT DISTINCT (provider_org_id, marketplace_org_id, external_code),
  CHECK (NOT sensitive_category OR policy_status <> 'approved'),
  CHECK (NOT ('bidstream' = ANY (data_sources)))   -- bid requests are not a data source
);

CREATE TABLE data_segment_usage_daily (  -- the impressions a data fee bills on
  day                 DATE NOT NULL,
  line_item_id        UUID NOT NULL REFERENCES line_items (id),
  data_segment_id     UUID NOT NULL REFERENCES data_segments (id),
  provider_org_id     UUID NOT NULL REFERENCES organizations (id),
  rule                TEXT NOT NULL CHECK (rule IN ('and', 'or', 'exclude')),
  impressions_charged BIGINT NOT NULL CHECK (impressions_charged >= 0),
  fee_micros          BIGINT NOT NULL CHECK (fee_micros >= 0),  -- sum of per-impression fees, rounded once
  currency            CHAR(3) NOT NULL,
  fee_term_id         UUID NOT NULL REFERENCES fee_terms (id),  -- the row priced on; a price change is a new row
  version             INT NOT NULL DEFAULT 1,  -- restated with delivery_daily
  PRIMARY KEY (day, line_item_id, data_segment_id)
);

CREATE TABLE data_broker_registrations ( -- this broker's (or a provider's) registration per state
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  jurisdiction        TEXT NOT NULL,      -- 'US-CA', 'US-OR', 'US-TX', 'US-VT'
  registration_year   SMALLINT NOT NULL,
  registration_ref    TEXT,               -- the registry's ID or certificate number
  fee_minor           BIGINT,             -- what was paid, in minor units
  currency            CHAR(3) NOT NULL DEFAULT 'USD',
  disclosures         JSONB NOT NULL DEFAULT '{}',  -- e.g. SB 361 answers as filed
  filed_at            TIMESTAMPTZ,
  expires_on          DATE,
  status              TEXT NOT NULL CHECK (status IN ('due', 'filed', 'active', 'lapsed',
                        'not_required')),
  UNIQUE (organization_id, jurisdiction, registration_year)
);

CREATE TABLE broker_deletion_runs (      -- one DROP cycle, or another registry's deletion batch
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id     UUID NOT NULL REFERENCES organizations (id),
  mechanism           TEXT NOT NULL CHECK (mechanism IN ('ca_drop', 'other')),
  list_downloaded_at  TIMESTAMPTZ NOT NULL,
  due_by              TIMESTAMPTZ NOT NULL,  -- download + 45 days for DROP
  requests_received   BIGINT NOT NULL,
  records_matched     BIGINT,
  records_deleted     BIGINT,
  suppressed_from_sale BIGINT,            -- kept on a do-not-sell list instead of re-collected
  exceptions          BIGINT,             -- retained under a stated exception
  status_uploaded_at  TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('downloaded', 'matching', 'processed',
                        'uploaded', 'late')),
  CHECK (due_by > list_downloaded_at)
);

-- A percent-of-media data fee can carry a CPM cap (DV360 commerce audiences).
ALTER TABLE fee_terms ADD COLUMN cap_cpm_micros BIGINT;
ALTER TABLE fee_terms ADD CONSTRAINT fee_terms_cap_check
  CHECK (cap_cpm_micros IS NULL OR (method = 'percent' AND cap_cpm_micros >= 0)) NOT VALID;

-- Which segments a line item uses comes from its targeting expression; billing joins usage to fees.
ALTER TABLE invoice_lines ADD COLUMN data_segment_id UUID;
ALTER TABLE invoice_lines ADD CONSTRAINT invoice_lines_data_segment_fk
  FOREIGN KEY (data_segment_id) REFERENCES data_segments (id) NOT VALID;
```

The check that keeps the next DROP cycle from being late:

```sql
-- Brokers whose last completed cycle leaves less than 7 days before the next is due.
SELECT r.organization_id,
       max(r.list_downloaded_at)                         AS last_download,
       max(r.list_downloaded_at) + interval '45 days'    AS next_due
FROM broker_deletion_runs r
WHERE r.mechanism = 'ca_drop' AND r.status IN ('processed', 'uploaded')
GROUP BY r.organization_id
HAVING max(r.list_downloaded_at) + interval '45 days' < now() + interval '7 days';
```

Design notes:

- **The segment record is its label.** Build method, sources, location use, sensitivity, refresh, lookback and geography are columns, not marketing copy, so a buyer filters on them and the platform's policy check reads them; a sensitive segment can never be `approved`.
- **Prices live in `fee_terms`.** A segment points at its current `data_fee` row (a CPM, or a percent of `media_cost` with `cap_cpm_micros`), and usage records the row it was priced on, so a provider's price change does not rewrite past invoices and every party's fees stay in one table.
- **Usage bills like delivery.** `data_segment_usage_daily` is computed from the same impression events and day rule as `delivery_daily`, restated with it when late data or IVT arrives, and becomes `invoice_lines` of kind `data_fee` tied to the segment; the per-provider maximum rules are applied when usage is computed, so a provider's charge is never the sum of its lists.
- **Registrations are per state and year.** A broker's compliance calendar and a marketplace's provider screening both read the same table; a lapsed California registration should pause that provider's segments for California inventory.
- **Deletion is a clocked batch.** Each DROP cycle has a due date 45 days out; matched people are deleted and suppressed from sale (a suppression list is the only way not to re-collect them from the next file), exceptions are counted and justified, and a late cycle is a status, not a silent gap.
- **Bid request data has one purpose.** If this system bids, its bid request logs are kept for bidding, billing and fraud detection only, with retention set accordingly; no segment's `data_sources` may include `bidstream`, which is the Mobilewalla conduct.

## Auditing

- **Every segment's label and policy decision.** The label fields, audit date and each approval or rejection with who decided, so a buyer or regulator can see what was represented.
- **Data fees by segment, provider and day.** Usage, rule, fee term version and restatements, so an advertiser can reconcile the data line on an invoice.
- **Registrations filed and disclosures made.** Per state and year, as filed.
- **Every deletion cycle.** Download time, due date, counts matched, deleted, suppressed and excepted, status upload time, for each DROP cycle, which is what the 2028 audits will ask for.
- **Supplier consent evidence.** For location-derived and other sensitive-source segments, the supplier assessments and consent records the FTC orders require.
- **Counterparty screening.** Who controls each buyer of sensitive data, rechecked under PADFAA and the DOJ rule.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails); retention rules are [Data Retention](/docs/building-blocks/data-retention).

## What This Means for the System You Build

- **Implement data fee rules exactly.** Per provider, the maximum targeted list under AND and exclusions; a random matched provider under OR; first-party deferral; percent of media with caps; all in micros, rounded once.
- **Keep prices in the shared fee table.** One `fee_terms` row per segment price, versioned, read by usage and billing.
- **Make segment labels data, and gate on them.** Build method, sources, location, sensitivity, refresh and geography as columns; sensitive and precise-location segments are restricted by policy before they can be targeted.
- **Run DROP as a 45-day job with proof.** Download, match, delete, suppress, upload, and alert before the next due date; register in every state that requires it, every year.
- **Never turn bid requests into data.** Use them to bid, bill and fight fraud, and keep them only as long as that takes.
- **Treat precise location as sensitive by default.** No sensitive-place geofences, no sale without provable consent, supplier assessments on file.
- **Screen who buys sensitive data.** Foreign adversary rules apply to brokers and marketplaces; record ownership and control of buyers.

## References

**Regulation**

- [California Privacy Protection Agency: Data brokers](https://cppa.ca.gov/data_brokers/), the definition, January registration window, $6,000 fee, SB 361 disclosures, request metrics, audits from 2028 and DROP obligations
- [California: Delete Request and Opt-out Platform (DROP)](https://privacy.ca.gov/drop/), the January 1, 2026 launch, over 600 brokers, the 45-day access and deletion cycle and status timing
- [California Privacy Protection Agency: Announcements](https://cppa.ca.gov/announcements/), the Data Broker Enforcement Strike Force and the custom audiences registration fine
- [California Privacy Protection Agency: Regulations](https://cppa.ca.gov/regulations/), the proposed Data Broker Updates and DROP Audit regulations and comment period
- [Oregon Division of Financial Regulation: Data broker registry](https://dfr.oregon.gov/business/licensing/data-broker-registry), who must register, the $600 fee, renewal and the January 1, 2024 start
- [Texas Secretary of State: Data broker registration](https://www.sos.state.tx.us/statdoc/data-brokers.shtml), chapter 510, the $300 fee and the filing-officer role
- [FTC: Order prohibits data broker X-Mode Social and Outlogic from selling sensitive location data (January 9, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-order-prohibits-data-broker-x-mode-social-outlogic-selling-sensitive-location-data), the first data broker location settlement
- [FTC: Order will ban InMarket from selling precise consumer location data (January 18, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-order-will-ban-inmarket-selling-precise-consumer-location-data), the ban and the audience lists
- [FTC: Order will ban Avast from selling browsing data (February 22, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/02/ftc-order-will-ban-avast-selling-browsing-data-advertising-purposes-require-it-pay-165-million-over), the $16.5 million order and Jumpshot sales
- [FTC: Action against Mobilewalla for collecting and selling sensitive location data (December 3, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/12/ftc-takes-action-against-mobilewalla-collecting-selling-sensitive-location-data), data from RTB exchanges, retained losing-bid data and the auction-data limit
- [FTC: Finalizes order prohibiting Gravy Analytics and Venntel from selling sensitive location data (January 14, 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-order-prohibiting-gravy-analytics-venntel-selling-sensitive-location-data), the ban, geofenced lists and the sensitive data program
- [FTC: Ban on Kochava and subsidiary selling sensitive location data (May 4, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/05/ftc-ban-kochava-subsidiary-selling-sensitive-location-data-settle-charges-they-sold-location-data), the stipulated order, consent requirement and 2-0 vote
- [FTC: Kochava case page](https://www.ftc.gov/legal-library/browse/cases-proceedings/ftc-v-kochava-inc), the 2022 complaint, litigation history and the June 26, 2026 stipulated order
- [FTC: Reminds data brokers of their obligations to comply with PADFAA (February 9, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/02/ftc-reminds-data-brokers-their-obligations-comply-padfaa), what PADFAA prohibits, the countries, sensitive data, 13 letters and the per-violation penalty
- [US Department of Justice: Data Security Program](https://www.justice.gov/nsd/data-security), 28 CFR Part 202 in effect April 8, 2025, covered data and the October 5, 2025 requirements

**Specifications**

- [IAB Tech Lab: Data Transparency Standard](https://iabtechlab.com/standards/data-transparency-standard/), minimum disclosures, up to 20 fields, versions 1.2 and 1.1, the audited compliance program and the Transparency Center

**Reference**

- [Display & Video 360 Help: Costs for using third-party audience lists](https://support.google.com/displayvideo/answer/3022829?hl=en), OR, AND, exclusion and combined-rule billing per provider and the first-party deferral
- [Display & Video 360 Help: Tips for using third-party audience lists](https://support.google.com/displayvideo/answer/6212219?hl=en), the $0.50 to more than $2 CPM range and 72-hour availability
- [Display & Video 360 Help: About commerce audiences](https://support.google.com/displayvideo/answer/16640028?hl=en), percent-of-media billing with a CPM cap and terms set between advertiser and network
