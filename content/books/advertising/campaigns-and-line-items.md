+++
title = "Campaigns & Line Items"
description = "The account hierarchy across ad platforms, objectives and goals, budgets and their overspend rules, flighting, and targeting expressions stored as data."
category = "Advertising Industry"
order = 2907
part = "Ad Serving and Creative"
tags = ["advertising", "ad-tech", "campaigns", "targeting", "budgets", "data-model"]
+++

Every buying and selling tool in advertising asks the buyer the same questions in a different shape: what are you trying to achieve, how much will you spend and over what dates, who and where should see it, at what price, and with which ads? Google Ads answers them across a campaign and its ad groups; Meta across a campaign, its ad sets and its ads; Ad Manager across an order, its line items and their creatives; Display & Video 360 across a campaign, insertion orders and line items. The volume calls the level that carries the goal and the approved budget the **campaign** and the level that actually delivers the **line item**, and every platform's hierarchy maps onto those two plus the creative ([The Core Data Model](/books/advertising/advertising-business#the-core-data-model)).

The mapping is harder than it looks because platforms disagree about which level owns what. The budget lives on the campaign at Google Ads and Microsoft Advertising, on the ad set at Meta unless the advertiser turns on a campaign budget, and on the insertion order at DV360, shared by its line items. A "daily budget" means a hard daily cap on one platform, an average that can be exceeded by 100% on a given day on another, and an average over a seven-day week on a third. Targeting inherits down the hierarchy on some platforms and is set only at the lowest level on others. An agency system that reads all of them, a self-serve platform building its own, and a publisher ad server booking direct orders each need one model that keeps those differences instead of flattening them.

This chapter covers the hierarchy across platforms, objectives and goals, budgets and how each platform lets them be exceeded, flighting and time zones, targeting as stored data, and how configuration is versioned so every impression can be judged against what was set when it served. It extends `campaigns`, `line_items` and `line_items.targeting` from the core model. The pacing that spends the budget is in [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency); the ad server that evaluates the targeting is in [Ad Servers](/books/advertising/ad-servers); what targeting may lawfully use is in the Identity and Audiences and Privacy and Law parts; and a brand's own account structure for acquisition is in Commerce's [Acquisition & Attribution](/books/commerce/acquisition-and-attribution).

## How the Platforms Do It

As of November 2026, from each platform's documentation:

| Platform | Hierarchy, top to delivery | Where the budget lives | Daily budget rule | Targeting lives on | Published limits |
| --- | --- | --- | --- | --- | --- |
| **Display & Video 360** (Google) | Partner, advertiser, campaign, insertion order, line item (and ad groups for YouTube) | The insertion order; "Line items in an insertion order share the same budget" | Pacing per period (`PACING_PERIOD_DAILY` or `PACING_PERIOD_FLIGHT`) with types ASAP, even or ahead, and `dailyMaxMicros` | Line items, with partner and advertiser brand safety enforced above | Not stated on the hierarchy page |
| **Google Ad Manager** | Order, line item, creative | The line item's goal (impressions, a percentage) or cost cap | Delivery evenly or frontloaded, with catch-up on the next day | Line item, required to "target at least one ad unit or placement" | 450 line items per order, 260 creatives per line item, 800 targeted criteria per entity |
| **Google Ads** | Account, campaign, ad group, ad | The campaign: "campaigns have their own budget and settings" | An average: up to two times on a day, 30.4 times in a month | Campaign and ad group criteria | Not stated on the structure page |
| **Kevel** | Advertiser, campaign, flight, ad | The flight's goal | Paced goals including daily revenue | The flight and ad | Not stated |
| **Meta** | Ad account, campaign, ad set, ad (with an ad creative) | The ad set, or the campaign when an Advantage campaign budget is on | An average: up to 75% over on a day, no more than seven times the daily budget in a Sunday-to-Saturday week (API v24.0 and later) | The ad set | 500 custom audiences included and 500 excluded per targeting spec |
| **Microsoft Advertising** | Customer, account, campaign, ad group, ad and keyword | The campaign, or a shared budget across campaigns | Not stated on the limits page | Campaign and ad group criteria | 10,000 campaigns per account, 20,000 ad groups per campaign, 20,000 keywords per ad group, 11,000 shared budgets per account |

What holds across them:

- **Two delivery levels, not one.** Each has a level that owns intent (objective, sometimes budget) and a level that owns delivery (targeting, bid, schedule). DV360 adds one more between them, the insertion order, which owns the budget. The volume's `campaigns` row is the intent level and `line_items` is the delivery level; DV360's insertion order is a campaign-level budget container under the campaign.
- **Budgets are averages, except where they are caps.** Google Ads and Meta both let a day overspend and enforce the limit over a longer period; Ad Manager and DV360 treat the line item or insertion order goal as a total to pace toward. A system that stores "daily budget" without the rule that goes with it will misreport spend on every platform.
- **Money is in small units.** Meta takes budgets "at ad account currencies minimum denomination level, such as cents for USD" (`daily_budget=2000` is $20.00); DV360 takes `dailyMaxMicros` "in micros of advertiser's currency". Neither is a decimal.
- **Targeting is a tree of criteria.** Every platform stores it as criteria with inclusion and exclusion, combined by fixed rules, not as free-form logic.

## The Hierarchy

The levels differ in name, number and what they own. Side by side, mapped to the volume's tables:

| Volume | Google Ads | Microsoft Advertising | Meta | DV360 | Ad Manager | Kevel |
| --- | --- | --- | --- | --- | --- | --- |
| `ad_accounts` | Account | Account (under a customer) | Ad account | Advertiser (under a partner) | Network, then the advertiser company | Advertiser |
| `campaigns` | Campaign | Campaign | Campaign | Campaign, and its insertion orders | Order | Campaign |
| `line_items` | Ad group | Ad group | Ad set | Line item | Line item | Flight |
| `creatives` | Ad | Ad | Ad and ad creative | Creative | Creative | Ad (creative) |

Notes on the fit:

- **Google Ads.** "Google Ads is organized into three layers: account, campaigns, and ad groups"; campaigns "have their own budget and settings that determine where your ads appear", ad groups "contain a set of similar ads and keywords". Keywords are targeting on the ad group (a line item's targeting criteria), not a level.
- **Microsoft Advertising.** A customer holds "between one and six accounts"; the campaign "is the top level object of an advertising campaign and is where you set the campaign's budget"; an ad group "specifies the default bid values for each match type" and the networks it serves on. Performance Max campaigns replace ad groups with **asset groups**, "up to 100" per campaign, which are line items whose creative is assembled from assets.
- **Meta.** A campaign "should represent a single objective" and setting that objective "enforces validation on any ads you add to that campaign"; "The budget, billing, and duration are set at the ad set level and apply to all ads in the set", and "All ads contained within an ad set should also have the same targeting and optimization goal". Ad creatives "contain only the visual elements of the ad, and you can't change them once they're created": creative is immutable and an ad points at a version of it.
- **DV360.** Partners own advertisers and "enforce further brand safety targeting"; advertisers own campaigns and creatives; "Campaigns contain multiple insertion orders" and their settings "serve as a framing by which to measure the progress and success" of their ads; "Insertion orders contain multiple line items" and "provide default values for absent line item settings"; line items "control which ads are served, when they are served, and to whom". The objective is on the insertion order, and it "determines the key performance indicators (KPI), bid strategies, and line item types that are available".
- **Ad Manager.** The order is the contract (one advertiser, often one insertion order's worth of line items) and the line item is the delivery unit with its type, priority, goal and targeting ([Ad Servers](/books/advertising/ad-servers#priority-classes)).
- **Kevel.** Advertiser, campaign, flight and ad; the flight carries the goal, the weight and the priority the decision engine reads.

The mapping rule: **the level that owns targeting and the bid is the line item.** Where a platform splits budget and targeting across two levels (Meta without a campaign budget puts both on the ad set; DV360 puts the budget on the insertion order and targeting on the line item), the budget goes where it is shared. A budget shared by several delivery units is a campaign-level (or shared-budget) record; a budget owned by one delivery unit is on the line item.

Retail media fits the same shape: an Amazon Sponsored Products campaign holds the budget and its ad groups hold the keywords and products, and the seller's view of that structure is in Commerce's [Amazon Ads](/books/commerce/retail-media#amazon-ads).

## Objectives and Goals

The objective is what the advertiser wants; the goal is how the line item is judged and, increasingly, what the platform's bidding optimizes.

**Objectives** are a short fixed list per platform, set at the top and constraining everything below. Meta's campaign objective validates the ads under it. DV360's insertion order objective picks the KPIs and line item types available: "Brand awareness, Clicks, Conversion, Custom, and Insertion order without objective", with KPIs such as CPA, click and impression conversion rates and value/cost for conversion goals. The core's `campaigns.objective` (awareness, reach, traffic, engagement, video views, app installs, leads, sales) is a superset that each platform's list maps into.

**Goals** come in two kinds that the model must not confuse:

- **A delivery goal** is a quantity promised or capped: 2,000,000 impressions by the end date on a standard line item, 100% share of voice on a sponsorship, a cap of 500,000 on a bulk line item. It drives pacing and, when guaranteed, contracts and make-goods. The core holds it as `goal_quantity` and requires it on guaranteed line items.
- **A performance goal** is a target for a ratio: a CPA of $40, a ROAS of 400%, a viewability rate above 70%. It drives bid optimization (Automated Bidding, in Auctions and Pricing) and reporting, and it is never guaranteed: the IAB/4A's terms say that for CPA, CPL and CPC deliverables "guaranteed delivery, even delivery, and makegoods are not available".

A line item can carry both (deliver 1,000,000 impressions evenly while keeping CPA under $40), and the delivery goal wins when they conflict, because only the delivery goal is a promise.

## Budgets

A budget is an amount, a period and a rule for how far a single day may deviate. The rule is where platforms differ most.

**Google Ads.** The campaign's average daily budget is an average, not a cap. The account is charged no more than "two times your average daily budget for most campaigns" on any one day and no more than "30.4 times your average daily budget for most campaigns" in a month. So a $100 daily budget can spend $200 on a busy Tuesday and $3,040 over the month, and an advertiser who reads the daily budget as a cap will think the platform overspent.

**Meta.** "The average amount you're willing to spend on an ad set or campaign each day." Meta's budget page still says "up to 25% more than your daily budget may be spent" on days with better opportunities, but Marketing API v24.0 (October 8, 2025) changed it: "Daily budget flexibility is increasing from 25% to 75%", "Your daily budget is used as an average over a seven-day calendar week from Sunday through Saturday", and weekly spend "will not be greater than 7 times your daily budget". A $100 daily budget can spend $175 on a day and $700 in the week. A lifetime budget is never exceeded "unless you change your delivery settings". With an Advantage campaign budget the budget moves from the ad sets to the campaign and Meta distributes it among them.

**Microsoft Advertising.** Budgets are on the campaign, or on a **shared budget**: "a single daily budget that can be used by any campaign within the same account", up to 11,000 per account, each assignable "to up to 10,000 campaigns; however, a campaign can only have one budget".

**DV360.** The insertion order holds the budget its line items share, with pacing settings that name the period (daily or the whole flight), the type ("ASAP", "even", or "ahead", which "attempts to spend faster than evenly, to make sure the entire budget is spent by the end of the flight") and optional daily maximums in micros or impressions.

**Ad Manager.** Direct-sold line items have goals in impressions rather than money budgets; the money is the goal times the rate, and the pacing setting decides how it's spread ([Ad Servers](/books/advertising/ad-servers#decisioning)). Price-priority line items can carry daily or lifetime caps.

**Amazon Sponsored Products** illustrates the monthly form of the average: a $100 daily budget can buy up to $3,100 of clicks in a 31-day month ([Amazon Ads](/books/commerce/retail-media#amazon-ads)).

Three modeling rules follow:

- **Store the budget with its rule.** Amount, period (daily, weekly, lifetime, monthly), the daily overspend allowance and the enforcement period, as data. The platform's rule is versioned (Meta's changed in 2025), so it belongs on the budget row with the date it applied, not in code.
- **A shared budget is its own record.** Microsoft's shared budgets, Google Ads' shared budgets, Meta's campaign budget and DV360's insertion order budget all have the same shape: one amount, many delivery units drawing on it. The delivery units point at it; the amount isn't copied onto each.
- **Budget changes are events with a time.** A budget raised at 3 p.m. changes what the rest of the day may spend under every platform's averaging rule. Store each change with its effective time so spend can be checked against the budget that applied ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).

## Flighting and Time Zones

A flight is the period a line item may deliver. Three details make it more than a date range:

- **Days are in the account's time zone.** Daily budgets, daily caps and daily reporting are days in the ad account's zone for self-serve platforms and in the contract's for a direct deal; the core fixes the zone on the ad account for life ([Design Notes](/books/advertising/advertising-business#the-core-data-model)). Ad Manager's catch-up runs on "the next calendar/civil day" in the account's zone. A flight ending "on March 31" ends at midnight there.
- **A flight can be segmented.** A line item booked for a quarter with different budgets per month, or an insertion order whose budget is released in tranches, is a sequence of segments with their own amounts and dates under one line item. Pacing reads the current segment; reporting rolls them up.
- **Day-parting is targeting, not flighting.** Running only 6 a.m. to 10 a.m. is a time-of-day criterion in the targeting expression, evaluated at request time in the account's zone. Microsoft allows up to 49 day-and-time criteria per campaign or ad group, with no overlapping ranges and at most seven per day.

## Targeting as Data

Targeting is the part of a line item that the ad server evaluates on every request, and the part most often stored badly: as a free-form string, as columns per dimension, or as a JSON blob nothing validates. Every large platform stores it the same way underneath: a set of criteria, each an attribute, an operator and values, combined by fixed rules.

**The shapes.** Ad Manager's custom targeting is a three-level tree: the top level "can only contain" an OR of its children, the second level an AND of theirs, and "the third level can only comprise of CustomCriteria objects". That is disjunctive normal form, an OR of ANDs, and it sits beside typed dimensions (geography, inventory, day-part, technology, content, video position, mobile application, size, request platform) that are each ANDed with the custom tree. Meta's targeting spec ORs values within a field by default ("By default, Facebook ORs combinations together"), ANDs fields, and adds `flexible_spec` groups and exclusions. Google Ads and Microsoft Advertising store targeting as criteria rows on the campaign and ad group, each positive or negative. The paper that framed ad targeting as an indexing problem models every campaign as a DNF or CNF Boolean expression over "a high-dimensional multi-valued attribute space", with NOTs, which is what all of these are.

**The rule.** Store targeting as a typed expression tree: a root that ANDs dimensions; each dimension a set of included and excluded values; custom key-values as an OR of ANDs. Validate it against a catalog of known attributes and values. Compile it, at publish time, into whatever the serving index needs. A shape like:

```json
{
  "all": [
    {"dim": "inventory", "include": ["au_0192", "au_0381"], "exclude": ["au_0404"]},
    {"dim": "geo.country", "include": ["US", "CA"]},
    {"dim": "device_type", "include": ["phone", "tablet"]},
    {"dim": "daypart", "include": [{"days": ["mon", "tue", "wed", "thu", "fri"],
                                    "from": "06:00", "to": "10:00"}]},
    {"any": [
      {"all": [{"key": "section", "include": ["sports"]},
               {"key": "team", "include": ["nyj", "nyg"]}]},
      {"all": [{"key": "section", "include": ["finance"]}]}
    ]}
  ]
}
```

**The catalog.** Key-values are the publisher's own vocabulary and need limits: Ad Manager allows 200 active keys, 100,000 active values per key, 2,500,000 active key-value pairs, 20 characters per key name and 40 per value, and 800 targeted criteria per entity. Keys are predefined (a fixed list of values, validated at trafficking) or dynamic (any value the page sends). Keeping a catalog table of keys and values gives the trafficking UI a picker, the validator a list and forecasting a dimension to slice on.

**Inheritance.** Some targeting is enforced from above: DV360's partners and advertisers "enforce brand safety targeting" on everything under them, and insertion orders "provide default values" for line item settings left unset. The effective targeting of a line item is its own expression ANDed with its ancestors' enforced constraints. Store each level's own expression and compute the effective one at publish time; storing only the effective one loses who required what.

**What targeting may use.** A targeting expression is also a record of what data was used to choose who saw an ad, which matters for consent (personal data in the EEA needs a lawful basis), for children (no targeted advertising to known children without separate parental consent under the amended COPPA Rule) and for discrimination law in housing, employment and credit. Those rules are the Privacy and Law part's; this chapter's job is to make the expression inspectable so they can be enforced and shown.

A small evaluator over that shape, for a request's attribute set (the serving path compiles this into an index instead; this is the reference semantics the index must match):

```go tab="Go"
type Node struct {
	All     []Node   `json:"all,omitempty"`
	Any     []Node   `json:"any,omitempty"`
	Dim     string   `json:"dim,omitempty"` // a typed dimension, e.g. "geo.country"
	Key     string   `json:"key,omitempty"` // a custom key-value key
	Include []string `json:"include,omitempty"`
	Exclude []string `json:"exclude,omitempty"`
}

// Attrs maps a dimension or key to the request's values for it
// (multi-valued: an ad unit and its ancestors, several segments).
type Attrs map[string][]string

func (n Node) Match(a Attrs) bool {
	switch {
	case len(n.All) > 0:
		for _, c := range n.All {
			if !c.Match(a) {
				return false
			}
		}
		return true
	case len(n.Any) > 0:
		for _, c := range n.Any {
			if c.Match(a) {
				return true
			}
		}
		return false
	}
	field := n.Dim
	if field == "" {
		field = n.Key
	}
	vals := a[field]
	for _, v := range vals {
		if slices.Contains(n.Exclude, v) {
			return false
		}
	}
	if len(n.Include) == 0 {
		return true // exclusion-only criterion
	}
	for _, v := range vals {
		if slices.Contains(n.Include, v) {
			return true
		}
	}
	return false // an absent attribute never satisfies an include
}
```

```rust tab="Rust"
use std::collections::HashMap;

#[derive(serde::Deserialize)]
pub struct Node {
    #[serde(default)] pub all: Vec<Node>,
    #[serde(default)] pub any: Vec<Node>,
    #[serde(default)] pub dim: Option<String>,  // a typed dimension
    #[serde(default)] pub key: Option<String>,  // a custom key-value key
    #[serde(default)] pub include: Vec<String>,
    #[serde(default)] pub exclude: Vec<String>,
}

pub type Attrs = HashMap<String, Vec<String>>;

impl Node {
    pub fn matches(&self, a: &Attrs) -> bool {
        if !self.all.is_empty() {
            return self.all.iter().all(|c| c.matches(a));
        }
        if !self.any.is_empty() {
            return self.any.iter().any(|c| c.matches(a));
        }
        let field = self.dim.as_ref().or(self.key.as_ref());
        let vals: &[String] = field.and_then(|f| a.get(f)).map_or(&[], |v| v.as_slice());
        if vals.iter().any(|v| self.exclude.contains(v)) {
            return false;
        }
        self.include.is_empty() || vals.iter().any(|v| self.include.contains(v))
    }
}
```

Two semantic choices in it are deliberate and should be written down wherever targeting is specified: an attribute missing from the request never satisfies an include (a request with no known country doesn't match `geo.country include US`), and an exclusion beats any inclusion on the same criterion. Platforms make both choices, and a forecast, an index and a reference evaluator that disagree on them will report inventory the line item can't buy.

## Versioning the Configuration

A line item changes while it delivers: the budget rises, a creative is swapped, a geography is added, the bid is cut. Every impression must be judged against the configuration that was live when it served, for three audiences: the advertiser disputing delivery against its plan, the publisher proving a guarantee was eligible for what it sold, and a regulator or court asking what targeting was used.

The pattern is an append-only version history per line item: every change writes a new version row with the full configuration (targeting, bid or rate, caps, pacing, budget pointer) and its effective time, and the serving snapshot records which version of each line item it carried ([Versioned Entities](/docs/database/temporal-data#versioned-entities)). The `line_items` row stays the current state for the UI and the API; the version rows are the history. Ad events and decisions point at the version through the snapshot, so "what did this line item target when it served this impression?" is one join.

Changes that alter what was sold need more than a version. Changing the targeting of a guaranteed line item mid-flight changes the inventory it was sized against ([Forecasting & Avails](/books/advertising/forecasting-and-avails) covers re-checking availability), and changing the rate on a signed insertion order changes the contract (Insertion Orders & Standard Terms, in Contracts and Money). Both should be blocked or routed through approval when the line item is guaranteed.

## Syncing External Platforms

An agency tool, a reporting product or an advertiser's own system holds copies of campaigns that live on other platforms. Every external entity gets a reference row with the platform, its kind there (campaign, ad group, ad set, insertion order, flight), its external ID and its parent's, mapped to the volume's table and row. Three rules:

- **The platform owns its entities.** The local row is a mirror refreshed from the platform's API; a local edit is a request to the platform, applied when the platform accepts it, never a divergent fork.
- **Map levels, don't merge them.** A Meta ad set and a DV360 line item both map to `line_items`; DV360's insertion order maps to a campaign-level budget record under the campaign, not to a fourth core level.
- **Store the platform's money units with the value.** Meta's budgets arrive in the currency's minimum denomination, DV360's in micros, others in decimal strings. Convert once at import into the column's declared unit ([Money & Amounts](/docs/money/amounts)).

## How to Build It

These are deltas against [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The core gives campaigns an objective, an optional budget and a flight, and line items a budget, a goal, a pricing model and a `targeting` JSONB "owned by Campaigns & Line Items". This chapter adds shared budgets with their overspend rules, flight segments, the targeting catalog and a validated targeting shape, the version history, and external references.

```sql
-- A budget shared by campaigns or line items, with the rule for how far a day may go over.
CREATE TABLE shared_budgets (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id          UUID NOT NULL REFERENCES ad_accounts (id),
  name                   TEXT NOT NULL,
  amount_micros          BIGINT NOT NULL CHECK (amount_micros >= 0),
  period                 TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly',
                           'lifetime')),
  daily_overspend_bp     INT NOT NULL DEFAULT 0 CHECK (daily_overspend_bp >= 0),
                           -- 10000 = may double on a day (Google Ads), 7500 = +75% (Meta)
  enforcement_period     TEXT NOT NULL CHECK (enforcement_period IN ('day', 'week',
                           'month', 'lifetime')),
  enforcement_multiple_bp INT,             -- e.g. 304000 = 30.4 days' worth per month
  rule_ref               TEXT,             -- the platform rule version, e.g. 'meta-api-v24'
  flight                 TSTZRANGE,
  status                 TEXT NOT NULL CHECK (status IN ('active', 'paused', 'ended')),
  UNIQUE (ad_account_id, name)
);

ALTER TABLE campaigns ADD COLUMN shared_budget_id UUID;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_shared_budget_fk
  FOREIGN KEY (shared_budget_id) REFERENCES shared_budgets (id) NOT VALID;
ALTER TABLE line_items ADD COLUMN shared_budget_id UUID;
ALTER TABLE line_items ADD CONSTRAINT line_items_shared_budget_fk
  FOREIGN KEY (shared_budget_id) REFERENCES shared_budgets (id) NOT VALID;

-- Line item settings the core leaves out.
ALTER TABLE line_items
  ADD COLUMN budget_period TEXT NOT NULL DEFAULT 'lifetime',
  ADD COLUMN performance_goal JSONB,       -- e.g. {"kpi": "cpa", "target_micros": 40000000}
  ADD COLUMN current_version INT NOT NULL DEFAULT 1;
ALTER TABLE line_items ADD CONSTRAINT line_items_budget_period_check
  CHECK (budget_period IN ('daily', 'weekly', 'monthly', 'lifetime')) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_one_budget_check
  CHECK (budget_micros IS NULL OR shared_budget_id IS NULL) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_targeting_shape_check
  CHECK (jsonb_typeof(targeting) = 'object'
         AND (targeting = '{}'::jsonb OR targeting ? 'all')) NOT VALID;

-- Budget or goal segments inside a flight: a quarter booked by month.
CREATE TABLE flight_segments (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  line_item_id   UUID NOT NULL REFERENCES line_items (id),
  segment        TSTZRANGE NOT NULL,
  budget_micros  BIGINT CHECK (budget_micros >= 0),
  goal_quantity  BIGINT CHECK (goal_quantity > 0),
  CHECK (budget_micros IS NOT NULL OR goal_quantity IS NOT NULL),
  EXCLUDE USING gist (line_item_id WITH =, segment WITH &&)   -- needs btree_gist
);

-- The targeting vocabulary: typed dimensions and the publisher's own key-values.
CREATE TABLE targeting_keys (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_org_id  UUID NOT NULL REFERENCES organizations (id),  -- the publisher or platform
  name          TEXT NOT NULL CHECK (length(name) <= 20),    -- the shortest common limit
  kind          TEXT NOT NULL CHECK (kind IN ('dimension', 'predefined', 'dynamic')),
  value_type    TEXT NOT NULL CHECK (value_type IN ('string', 'integer', 'boolean',
                  'geo', 'daypart', 'segment')),
  sensitive     BOOLEAN NOT NULL DEFAULT FALSE,  -- needs a policy check before use
  status        TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  UNIQUE (owner_org_id, name)
);

CREATE TABLE targeting_values (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  targeting_key_id  UUID NOT NULL REFERENCES targeting_keys (id),
  value             TEXT NOT NULL CHECK (length(value) <= 40),
  display_name      TEXT,
  status            TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  UNIQUE (targeting_key_id, value)
);

-- Every version of a line item's delivery configuration, append-only.
CREATE TABLE line_item_versions (
  line_item_id       UUID NOT NULL REFERENCES line_items (id),
  version            INT NOT NULL,
  effective_at       TIMESTAMPTZ NOT NULL,
  targeting          JSONB NOT NULL,         -- the line item's own expression
  effective_targeting JSONB NOT NULL,        -- ANDed with ancestors' enforced constraints
  rate_micros        BIGINT,
  budget_micros      BIGINT,
  shared_budget_id   UUID,
  goal_quantity      BIGINT,
  pacing             TEXT NOT NULL,
  frequency_caps     JSONB NOT NULL,
  priority           SMALLINT NOT NULL,
  changed_by         UUID NOT NULL,          -- a user or a service, per Audit Trails
  change_reason      TEXT,
  approved_by        UUID,                   -- required for guaranteed line items in flight
  PRIMARY KEY (line_item_id, version)
);

-- A row on another platform, mirrored here.
CREATE TABLE platform_entity_refs (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  platform         TEXT NOT NULL,            -- 'google_ads', 'meta', 'dv360', 'gam', ...
  external_kind    TEXT NOT NULL,            -- 'ad_group', 'ad_set', 'insertion_order', 'flight'
  external_id      TEXT NOT NULL,
  external_parent_id TEXT,
  local_table      TEXT NOT NULL CHECK (local_table IN ('ad_accounts', 'campaigns',
                     'line_items', 'creatives', 'shared_budgets')),
  local_id         UUID NOT NULL,
  money_unit       TEXT CHECK (money_unit IN ('micros', 'minor', 'decimal')),  -- as the API sends it
  last_synced_at   TIMESTAMPTZ,
  sync_status      TEXT NOT NULL CHECK (sync_status IN ('in_sync', 'pending_push',
                     'rejected', 'deleted_remote')),
  UNIQUE (platform, external_kind, external_id)
);
CREATE INDEX CONCURRENTLY platform_entity_refs_local_idx
  ON platform_entity_refs (local_table, local_id);
```

Design notes:

- **Overspend rules are data.** `daily_overspend_bp` and `enforcement_multiple_bp` encode Google Ads' "two times" and "30.4 times" and Meta's 75% and seven-times-weekly as numbers, and `rule_ref` names the version, so the change Meta made in API v24.0 is a new row value with a date, not a code release. Reports that compare spend to budget read the rule from the row.
- **One budget per delivery unit.** A line item has its own budget or draws on a shared one, never both (`line_items_one_budget_check`); a campaign-level budget (Meta's campaign budget, DV360's insertion order) is a shared budget the campaign and its line items point at.
- **Segments can't overlap.** The exclusion constraint makes two segments of one flight covering the same instant impossible, which is the bug that double-releases budget ([Exclusion Constraints for Time](/docs/building-blocks/reservations-and-holds#exclusion-constraints-for-time)).
- **The targeting check is a shape check, not a validator.** Postgres can confirm the JSON has the root shape; whether `section` is a known key and `sports` a valid value is checked by the application against `targeting_keys` and `targeting_values` at save time, and the result is stored as the version's targeting. The 20- and 40-character checks mirror Ad Manager's limits as the tightest common bound.
- **Sensitive keys are marked.** `targeting_keys.sensitive` flags keys that carry health, financial, children's or other sensitive categories, so the save path can route their use through the policy checks the Privacy and Law part describes.
- **Versions are the history, the row is the present.** `line_item_versions` is append-only; every update to `line_items` writes the next version in the same transaction and bumps `current_version`. The serving snapshot records the version it loaded, which is what [Ad Servers](/books/advertising/ad-servers#how-to-build-it) stores on each decision.
- **Effective targeting is stored, not recomputed.** Ancestors' constraints change too; storing the ANDed expression on the version keeps what was actually enforced, even after the advertiser's brand safety settings change.
- **External references keep the unit.** `money_unit` records how the source API expresses money for that entity, so the import converts once and a later audit can see why `daily_budget=2000` became `20000000` micros.

## Auditing

- **What was configured when each impression served.** Line item versions with targeting (own and effective), rate, budget, caps and pacing, joined to decisions and events through the serving snapshot. Delivery disputes, make-good claims and discriminatory-targeting complaints are judged against these.
- **Who changed what, and who approved it.** Every version's actor and reason, and an approval on changes to guaranteed line items in flight.
- **Budgets and their rules.** Each budget's amount, period and overspend rule over time, so a "the platform overspent my budget" complaint can be answered with the rule that applied that day.
- **What targeting data was used.** The keys and values in each version, with sensitive keys flagged, for privacy audits and data-use questions.

## What This Means for the System You Build

- **Map every platform onto campaign, line item and creative,** with the line item as the level that owns targeting and the bid, and keep the platform's own level names in external references.
- **Store each budget with its period and overspend rule,** versioned, and make shared budgets their own record.
- **Keep delivery goals and performance goals apart;** only the delivery goal is a promise.
- **Store targeting as a typed expression tree** validated against a catalog, with documented semantics for missing attributes and exclusions, and compile it for serving.
- **Store each level's own targeting and the effective result** so inherited constraints stay attributable.
- **Version every line item change** and point every decision and impression at the version that served it.
- **Convert platform money units once, at import,** and record which unit the source used.

## References

**Specifications**

- [IAB/4A's: Standard Terms and Conditions for Internet Advertising, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), no guaranteed or even delivery or makegoods for CPA, CPL and CPC deliverables

**Reference**

- [Whang et al.: Indexing Boolean Expressions (VLDB 2009)](https://www.vldb.org/pvldb/vol2/vldb09-83.pdf), campaign targeting as DNF and CNF expressions over multi-valued attributes

**In practice**

- [Google Ads: How Google Ads is organized](https://support.google.com/google-ads/answer/1704396?hl=en), account, campaigns and ad groups, budgets on campaigns
- [Google Ads: Average daily budgets](https://support.google.com/google-ads/answer/6385083?hl=en), two times on a day and 30.4 times in a month
- [Meta Marketing API: Campaign structure](https://developers.facebook.com/docs/marketing-api/campaign-structure), campaign objective, budget and targeting on the ad set, immutable ad creatives
- [Meta Marketing API: Budgets](https://developers.facebook.com/documentation/ads-commerce/marketing-api/bidding/overview/budgets.md), daily and lifetime budgets, the 25% statement, minimum currency units
- [Meta Marketing API: Version 24.0 changelog](https://developers.facebook.com/documentation/ads-commerce/marketing-api/marketing-api-changelog/version24.0), 75% daily flexibility, the Sunday-to-Saturday week and the seven-times cap
- [Meta Marketing API: Advantage campaign budget](https://developers.facebook.com/docs/marketing-api/bidding/guides/advantage-campaign-budget), the campaign-level budget distributed across ad sets
- [Meta Marketing API: Advanced targeting](https://developers.facebook.com/docs/marketing-api/audiences/reference/advanced-targeting), OR within combinations, flexible_spec requirements, 500 included and 500 excluded custom audiences
- [Microsoft Advertising API: Entity limits](https://learn.microsoft.com/en-us/advertising/guides/entity-hierarchy-limits?view=bingads-13), customers and accounts, campaigns, ad groups, keywords, asset groups, shared budgets, day-and-time criteria
- [Display & Video 360 API: Resource hierarchy](https://developers.google.com/display-video/api/guides/concepts/campaign-resources/resource-hierarchy?hl=en), partners to line items, ad groups for YouTube, and what each level enforces
- [Display & Video 360: Create an insertion order](https://support.google.com/displayvideo/answer/2696705?hl=en), shared insertion order budgets, objectives and KPIs
- [Display & Video 360 API: Pacing](https://developers.google.com/display-video/api/reference/rest/v4/Pacing), pacing periods and types, daily maximums in micros
- [Google Ad Manager API: Targeting](https://developers.google.com/ad-manager/api/reference/v202508/LineItemService.Targeting), the OR-of-ANDs custom targeting tree, typed dimensions, required inventory targeting
- [Google Ad Manager: System maximums and limits](https://support.google.com/admanager/answer/1628457?hl=en), key-value limits, line items per order, creatives per line item, targeted criteria
- [Google Ad Manager: Pacing](https://support.google.com/admanager/answer/2669484?hl=en), catch-up on the next civil day in the account's time zone
- [Kevel: Ad Decision Engine overview](https://dev.kevel.com/docs/delivery-basics), flights, weights and paced goals
- [Kevel API: Advertisers](https://dev.kevel.com/reference/advertisers), advertisers with campaigns under them
