+++
title = "Social Advertising"
description = "Meta, TikTok, Snap, Pinterest, Reddit and LinkedIn: delivery systems, total value auctions, ad load in feeds, automated campaigns, audiences, transparency."
category = "Advertising Industry"
order = 2944
part = "Walled Gardens"
tags = ["advertising", "social", "walled-gardens", "feeds", "auctions", "data-model"]
+++

Social advertising is ads placed among the posts, videos and stories of a platform people visit to see other people and creators. There is no query: the platform decides, every time someone opens the app or scrolls, which ad (if any) to put in the next slot, chosen from millions of candidates by predicted interest. It is now the largest channel by IAB's cut: US social advertising was $117.7 billion in 2025, up 32.6%, ahead of search. Meta alone reported $196.2 billion of advertising revenue for 2025, about 97.6% of its revenue, and in the third quarter of 2026 its ad impressions grew 10% and its average price per ad 14% year over year.

The engineering is hard in ways search isn't. Without a query, relevance is entirely predicted, from what the person has done and what similar people did, so the ad system is a recommender with prices attached and its quality is the quality of its models. The ad competes with the organic feed for the same screen, so the platform has to decide how many ads to show and where, trading revenue now for attention later. Advertisers mostly can't say what they want in keywords, so they state an objective and let the platform find the audience, which makes the platform's optimization and measurement the product. And the targeting that makes it work is regulated: special categories of data can't be used for ads in the EU, housing, employment and credit ads are constrained in the US, and gatekeepers must offer a less personalized choice.

This chapter covers the platforms, how a social delivery system works (retrieval, ranking and the total value auction), ad load and placement in feeds, objectives, optimization goals and billing events, automated campaigns (Advantage+, Smart+, Performance+), audiences and lookalikes at the system level, special ad categories and fairness constraints, and ad transparency, then the records. It extends `campaigns`, `line_items` and `auctions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). Auction theory and quality-weighted ranking are [Auction Mechanics](/books/advertising/auction-mechanics#quality-weighted-ranking); bid strategies (cost cap, bid cap, ROAS goal) are [Automated Bidding](/books/advertising/automated-bidding); billing events are [Pricing Models](/books/advertising/pricing-models#billing-events); the organic feeds the ads sit in are UGP's [Feeds & Recommendations](/books/user-generated-platforms/feeds-and-recommendations) and [Interest-Graph Feeds](/books/user-generated-platforms/interest-graph-feeds); ads on creators' content and content suitability labels are UGP's [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing); customer lists, hashing and lookalike mechanics are First-Party Data & Audiences, in Identity and Audiences; the models are Machine Learning for Ads; DSA ad repositories and political ads are DSA, DMA & Political Ads; discriminatory targeting is Sensitive Data & Discriminatory Targeting. Running Advantage+ sales campaigns as a store is Commerce's [Meta: Advantage+ Sales Campaigns](/books/commerce/acquisition-and-attribution#meta-advantage-sales-campaigns).

## How the Platforms Do It

As of November 2026, from filings and each platform's documentation:

| Platform | Auction and delivery | Automated campaigns | Scale disclosed |
| --- | --- | --- | --- |
| **LinkedIn** | "The cost of your ads is determined by an online auction system"; bid strategies maximum delivery, cost cap, manual | Not covered here | Part of Microsoft; LinkedIn revenue up 11% in fiscal 2026 |
| **Meta** | "Total value": bid times estimated action rate, plus ad quality; retrieval by Andromeda, then ranking models | Advantage+ campaigns (Advantage+ sales, app) | Advertising revenue $196.2 billion in 2025 |
| **Pinterest** | Not public on pages opened | Performance+ (campaigns, bidding, budgets, targeting, creative) | Revenue $4,221.8 million in 2025; 619 million monthly active users |
| **Reddit** | Not public on pages opened | Not covered here | Advertising revenue $2.1 billion in 2025, up 74% |
| **Snap** | Not verifiable on pages opened | Not covered here | Revenue $5,931.4 million in 2025, including subscriptions |
| **TikTok** | Not public on pages opened | Smart+ ("a single campaign powered by AI for all of your performance objectives") | Private; not reported |

Three patterns:

- **Delivery is a recommender with an auction at the end.** Meta describes retrieval narrowing "tens of millions of ad candidates into a few thousand", then larger models ranking them, then an auction on total value; every platform with an interest feed works the same way, and the published detail is mostly Meta's.
- **The bid is a minority of the score.** Meta's auction does not "pick a winner based on the highest bid"; the estimated action rate and ad quality decide as much as price.
- **Automation is the default product.** Advantage+, Smart+ and Performance+ automate audience, placement, budget and creative together; the advertiser supplies an objective, assets, a budget and constraints.

## The Delivery System

A social ad request starts when the feed has a slot to fill and ends with one ad (or none) in it. The stages, generalized from Meta's public engineering descriptions and the MRC's account of closed-loop auctions:

1. **Eligibility.** Which ads may be shown to this person here: targeting, the advertiser's exclusions, policy status of the creative, frequency caps, the person's ad preferences and consent state, legal limits (no profiling-based ads to minors in the EU, special category limits), budget remaining.
2. **Retrieval.** From the eligible ads, a cheap model picks a few thousand candidates likely to be worth ranking. Meta's Andromeda, announced December 2, 2024, is its retrieval stage, narrowing "tens of millions of ad candidates into a few thousand relevant ad candidates", with "+6% recall improvement to the retrieval system" and "+8% ads quality improvement on selected segments."
3. **Ranking.** Larger models predict, for each candidate, the probability of the advertiser's optimization event (a click, a purchase, an install) and quality signals. Meta's GEM, "Meta's most advanced ads foundation model", trains large and transfers what it learns to "hundreds of user-facing vertical models"; Meta reported a 5% increase in ad conversions on Instagram and 3% on Facebook Feed in the second quarter of 2025 after launching it.
4. **Auction.** The ranked candidates compete on total value: Meta finds "advertiser value by multiplying an ad's bid by the estimated action rate" and then adds "the ad quality score", where quality draws on signals including low-quality attributes such as engagement bait and sensational wording. The highest total value wins.
5. **Pricing and pacing.** The winner's charge depends on its billing event (impression, click, ThruPlay), its bid strategy and the auction's price rule, which Meta doesn't publish in detail; the pacing system decides whether a budget-limited ad set enters at all ([Budget Optimization](/books/advertising/automated-bidding#budget-optimization)).

The bid itself is usually set by the platform: under the default highest-volume strategy, "Meta automatically bids on your behalf and gets you the lowest cost results." So the advertiser's inputs are an objective, an optimization event, a budget, an optional cost or ROAS constraint and creative; the platform supplies the audience, the bid, the quality term and the price. That concentration is why the MRC's auction standards, final in January 2026, ask closed-loop auctioneers to disclose and report "the method for determining ad relevance scores" and the likelihood-to-convert estimates, with model cards and feature importance for ML-driven auctions.

## Ad Load and Placement in Feeds

The ad competes with the feed for the same screen, and two decisions sit above every auction: how many slots are ads (**ad load**), and where they go (**placement** and **spacing**). UGP's feed chapters own the organic ranking; the ad side is this volume's.

**Ad load is a policy, not an auction outcome.** A feed with an ad every three items earns more today and less next month if people scroll less. No large platform publishes its ad load or the model that sets it; Meta reports impressions and average price per ad, which together move revenue, so ad load is visible only as impression growth. <!-- source-gap: adv-feed-ad-load | missing | a social platform's published ad load (ads per organic items) or the rule that sets it | closes with: a platform filing, help page or engineering post stating ad load or its policy | checked: 2026-11-22 --> The engineering shape is common, though: a minimum gap between ads, a first eligible position, a cap per session, sometimes a dynamic adjustment by user, and a quality bar below which a slot stays organic.

**A slot can stay organic.** If the best ad's total value is below a threshold (a reserve in value terms, or a comparison with the organic item it would replace), the slot shows organic content. My default: compare the winning ad's total value with the predicted value of the organic item it displaces, in the same units the feed ranks in, and show the ad only when it wins, with the comparison logged. That makes ad load an output of a rule rather than a fixed ratio, and makes the trade-off auditable.

**Placement is a targeting dimension the platform increasingly chooses.** Feed, stories, short video, search results and an off-platform network have different formats, prices and outcomes. Automatic placement lets the platform choose per auction; manual placement restricts it. The record needs both the advertiser's allowed set and the surface each impression actually ran on.

**Adjacency is the brand-safety question in feeds.** In a feed, the content above and below an ad is chosen per person in real time, so suitability controls are inventory filters (excluding categories of content near ads) and post-hoc reports, not page-level blocklists. UGP's [Ads, Brand Safety & Data Licensing](/books/user-generated-platforms/ads-and-data-licensing#brand-safety-and-suitability) covers the labels; Brand Safety & Suitability, in Fraud and Brand Safety, covers the frameworks.

A feed inserter that applies the spacing rules and the organic comparison:

```go tab="Go"
package feed

// Item is a ranked organic item or the winning ad for a slot, scored in the same
// units the feed ranks in (expected value of showing it here).
type Item struct {
	ID    string
	IsAd  bool
	Value float64
}

// Rules are the ad load policy for one surface.
type Rules struct {
	FirstAdPosition int // 0-based; no ad before it
	MinGap          int // organic items required between ads
	MaxAds          int // per feed page
}

// Insert walks the organic ranking and, at each eligible position, asks the auction
// for an ad (nextAd); the ad is shown only if its value beats the organic item it would
// displace. It returns the page and, per ad shown, the position it took.
func Insert(organic []Item, rules Rules, nextAd func(position int) (Item, bool)) ([]Item, []int) {
	page := make([]Item, 0, len(organic)+rules.MaxAds)
	var adPositions []int
	sinceAd := rules.MinGap // allow an ad at the first eligible position
	for _, o := range organic {
		pos := len(page)
		if pos >= rules.FirstAdPosition && sinceAd >= rules.MinGap && len(adPositions) < rules.MaxAds {
			if ad, ok := nextAd(pos); ok && ad.Value > o.Value {
				page = append(page, ad)
				adPositions = append(adPositions, pos)
				sinceAd = 0
			}
		}
		page = append(page, o)
		sinceAd++
	}
	return page, adPositions
}
```

```rust tab="Rust"
/// A ranked organic item or the winning ad for a slot, scored in the units the feed ranks in.
#[derive(Clone)]
pub struct Item {
    pub id: String,
    pub is_ad: bool,
    pub value: f64,
}

/// The ad load policy for one surface.
pub struct Rules {
    pub first_ad_position: usize, // 0-based; no ad before it
    pub min_gap: usize,           // organic items required between ads
    pub max_ads: usize,           // per feed page
}

/// Walks the organic ranking and, at each eligible position, asks the auction for an ad;
/// shows it only if it beats the organic item it would displace. Returns the page and the
/// positions ads took.
pub fn insert(organic: &[Item], rules: &Rules,
    mut next_ad: impl FnMut(usize) -> Option<Item>) -> (Vec<Item>, Vec<usize>) {
    let mut page = Vec::with_capacity(organic.len() + rules.max_ads);
    let mut ad_positions = Vec::new();
    let mut since_ad = rules.min_gap;
    for o in organic {
        let pos = page.len();
        if pos >= rules.first_ad_position && since_ad >= rules.min_gap
            && ad_positions.len() < rules.max_ads {
            if let Some(ad) = next_ad(pos).filter(|ad| ad.value > o.value) {
                page.push(ad);
                ad_positions.push(pos);
                since_ad = 0;
            }
        }
        page.push(o.clone());
        since_ad += 1;
    }
    (page, ad_positions)
}
```

With a first position of 2, a gap of 4 and a cap of 3, a 20-item organic page can carry ads at positions 2, 7 and 12 at most, and fewer when an ad loses to the organic item it would replace. `nextAd` runs one auction per eligible slot, so each shown ad has its own `auctions` row, and a slot where the ad lost to organic still records the auction with its outcome; the inserter's decision (position, the organic value it beat or lost to, the rule version) is the row this chapter's schema adds.

## Objectives, Optimization Goals and Billing Events

A social campaign is structured as objective, then delivery unit, then ad: Meta's campaign, ad set and ad; TikTok's campaign, ad group and ad. Campaigns & Line Items maps the hierarchies. Three settings on the delivery unit are easy to conflate and must be stored apart:

- **Objective**, on the campaign: what the advertiser wants (awareness, traffic, engagement, leads, app promotion, sales). It constrains what can be set below. TikTok's Smart+ campaigns, for example, exist per objective: "driving sales (web), app promotion, lead generation, and traffic."
- **Optimization goal**, on the ad set: the event the delivery system predicts and maximizes (Meta's `optimization_goal`).
- **Billing event**, on the ad set: what is charged. Meta's enum includes `IMPRESSIONS`, `LINK_CLICKS`, `THRUPLAY`, `APP_INSTALLS` and others; LinkedIn's chargeable event "depends on the optimization goal and bidding strategy" (impressions, clicks, video views, sends, leads). An ad set optimized for purchases and billed per impression is the common case ([Billing Events](/books/advertising/pricing-models#billing-events)).

The bid strategy sits beside them: highest volume, cost per result goal, ROAS goal, bid cap on Meta; maximum delivery, cost cap, manual on LinkedIn ([The Strategies](/books/advertising/automated-bidding#the-strategies)). The budget may sit on the ad set or move to the campaign, where the platform distributes it.

## Automated Campaigns

Every large social platform now sells a campaign type where the platform chooses most of the settings:

- **Meta Advantage+.** Meta's Marketing API describes Advantage+ sales campaigns as "the updated, streamlined versions of Advantage+ shopping campaigns"; from v24.0 (October 8, 2025) new campaigns could no longer be created with the legacy Advantage+ shopping (ASC) and app (AAC) APIs, and v25.0 removed creation. Commerce's [Meta: Advantage+ Sales Campaigns](/books/commerce/acquisition-and-attribution#meta-advantage-sales-campaigns) covers what changed for advertisers (the end of the existing-customer budget cap).
- **TikTok Smart+.** "A single campaign powered by AI for all of your performance objectives", automating targeting and optimization, refreshing ad combinations when fatigue is detected, shifting budget toward "the highest-performing creative" and pausing poor performers; advertisers supply KPIs, assets, geography and language, and can turn off Smart+ generated creatives (help page last updated June 2025).
- **Pinterest Performance+.** A suite covering campaigns, bidding, budgets ("flexing up or down 25% daily over a rolling 7-day average"), targeting and creative generation from catalogs, with human review of AI-generated backgrounds; Pinterest's own tests report gains such as "50% fewer setup inputs."

For the platform, an automated campaign is the same delivery system with the advertiser's settings replaced by defaults the platform controls, which has two modeling consequences. The platform's choices per impression (audience segment, placement, creative combination, budget allocation) must be logged because the advertiser didn't make them and can't infer them. And versioning the campaign type matters: when an API version retires a campaign type, existing campaigns keep running under old rules while new ones follow new ones, so the type and its API version belong on the campaign record. AI in Advertising, in Running the Platform, covers automated campaigns as a design.

## Audiences and Lookalikes

Social targeting has three sources, each with its own rules:

- **Platform-derived interests and demographics,** inferred from activity on the platform, subject to the platform's own policy and to law on sensitive data.
- **Advertiser-supplied audiences:** customer lists uploaded hashed, site and app visitors from the pixel or SDK, engagement audiences. First-Party Data & Audiences covers hashing, normalization and match rates; the data is personal data under the advertiser's consents ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)).
- **Expansion and lookalikes:** the platform finds people similar to a seed audience, or expands beyond the advertiser's targeting when it predicts better results, which is what automated audiences do by default.

Expansion is where fairness law reaches the system. In the US, the Department of Justice's 2022 settlement with Meta under the Fair Housing Act ended the "Special Ad Audience" tool (a lookalike for housing ads), required that housing ads not be targeted on FHA-protected characteristics, and required a Variance Reduction System that measures the demographics of each housing ad's delivered audience against its eligible audience and adjusts delivery; Meta says it launched VRS for US housing in January 2023 and later "for US employment and credit ads." Sensitive Data & Discriminatory Targeting covers the case and the method. The system point: for special ad categories, targeting options are restricted at setup and delivery is monitored and corrected after the fact, so the category must be a field on the campaign that both the targeting UI and the delivery system read.

In the EU, the Digital Services Act forbids ads "based on profiling" using special categories of personal data (Art. 26(3)) and profiling-based ads to recipients a platform knows "with reasonable certainty" are minors (Art. 28(2)), and the Digital Markets Act requires a gatekeeper to get specific consent before combining personal data across services for ads (Art. 5(2)). The Commission fined Meta €200 million on April 23, 2025 over the absence of a less-personal-data choice, and Meta committed to offer EU users a less personalized ads option from January 2026. The delivery system therefore needs a per-person ads mode (personalized, less personalized, contextual only for minors) on the request, read by eligibility and ranking alike. GDPR & ePrivacy for Ads and DSA, DMA & Political Ads cover the law.

## Ad Transparency

Two regimes require social platforms to show who is advertising and why:

- **At the ad.** DSA Art. 26(1) requires that a user see, in real time, that content is an ad, on whose behalf it is shown, who paid if different, and "meaningful information" about the main targeting parameters. That is a per-impression explanation, generated from the delivery decision, which only works if the decision recorded which parameters applied.
- **In a repository.** DSA Art. 39 requires very large platforms to keep a searchable ad repository "until one year after the advertisement was presented for the last time", with the content, on whose behalf, who paid, the period, the targeting and exclusion parameters, and total reach broken down by member state. DSA, DMA & Political Ads covers the obligations and political ads; Ad Review, Policies & Malvertising covers ad libraries and transparency centers as products.

Both read from records the delivery system already has if it keeps them: the advertiser and payer on the campaign, the targeting parameters that matched on each impression, and reach by country, which is why the decision log in this chapter stores the matched targeting rather than only the configured one.

## How to Build It

A social delivery system adds the surfaces ads run on and their ad load rules, the advertiser's allowed placements per line item, the feed-level decision that put an ad in a slot, and on the campaign the objective type, special category and campaign type version. Audiences are referenced from `line_items.targeting` by ID (First-Party Data & Audiences owns the audience records); the auction and bids are the core's.

```sql
CREATE TABLE ad_surfaces (               -- where ads run: a feed, stories, short video, search
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id        UUID NOT NULL REFERENCES properties (id),
  code               TEXT NOT NULL,       -- 'feed', 'stories', 'reels', 'search', 'network'
  formats            TEXT[] NOT NULL,     -- as in creatives.format
  ad_unit_id         UUID REFERENCES ad_units (id),  -- the slot type impressions are counted on
  status             TEXT NOT NULL CHECK (status IN ('active', 'paused', 'retired')),
  UNIQUE (property_id, code)
);

CREATE TABLE ad_load_rules (             -- the ad load policy per surface, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_surface_id      UUID NOT NULL REFERENCES ad_surfaces (id),
  version            INT NOT NULL,
  first_ad_position  SMALLINT NOT NULL CHECK (first_ad_position >= 0),
  min_gap            SMALLINT NOT NULL CHECK (min_gap >= 0),   -- organic items between ads
  max_ads_per_page   SMALLINT NOT NULL CHECK (max_ads_per_page >= 0),
  max_ads_per_session SMALLINT,
  organic_comparison BOOLEAN NOT NULL DEFAULT TRUE,  -- an ad must beat the item it displaces
  audience           JSONB NOT NULL DEFAULT '{}',     -- e.g. {"ads_mode":"less_personalized"}
  effective          TSTZRANGE NOT NULL,
  approved_by        TEXT NOT NULL,
  UNIQUE (ad_surface_id, version)
);

CREATE TABLE line_item_surfaces (        -- manual placements; no rows means automatic
  line_item_id       UUID NOT NULL REFERENCES line_items (id),
  ad_surface_id      UUID NOT NULL REFERENCES ad_surfaces (id),
  PRIMARY KEY (line_item_id, ad_surface_id)
);

CREATE TABLE feed_ad_decisions (         -- one eligible slot in one feed page: ad or organic
  id                 UUID NOT NULL DEFAULT uuidv7(),
  decided_at         TIMESTAMPTZ NOT NULL,
  ad_surface_id      UUID NOT NULL,       -- no FK across partitioned logs
  ad_load_rule_id    UUID NOT NULL,
  position           SMALLINT NOT NULL,
  auction_id         UUID,                -- null: no auction ran (gap, cap or no eligible ads)
  outcome            TEXT NOT NULL CHECK (outcome IN ('ad_shown', 'lost_to_organic',
                       'no_eligible_ads', 'cap_reached', 'not_eligible_position')),
  ad_value_micro     BIGINT,              -- the winning ad's total value, in feed units x 1e6
  organic_value_micro BIGINT,             -- the displaced item's predicted value, same units
  ads_mode           TEXT NOT NULL CHECK (ads_mode IN ('personalized', 'less_personalized',
                       'contextual')),
  matched_targeting  JSONB,               -- the parameters that made the ad eligible, for Art. 26
  country            CHAR(2),
  PRIMARY KEY (decided_at, id)
) PARTITION BY RANGE (decided_at);

-- On the campaign: what kind of campaign, under which legal regime.
ALTER TABLE campaigns
  ADD COLUMN campaign_type TEXT,          -- 'manual', 'advantage_plus_sales', 'smart_plus', ...
  ADD COLUMN campaign_type_api_version TEXT,  -- the API version the type was created under
  ADD COLUMN special_category TEXT,       -- 'housing', 'employment', 'credit', 'issues_elections_politics'
  ADD COLUMN payer_name TEXT;             -- who paid, when not the advertiser (DSA Art. 26)
ALTER TABLE campaigns ADD CONSTRAINT campaigns_special_category_check
  CHECK (special_category IN ('housing', 'employment', 'credit', 'issues_elections_politics'))
  NOT VALID;

-- On the line item: the optimization goal and billing event, apart from the objective.
ALTER TABLE line_items
  ADD COLUMN optimization_goal TEXT;      -- the event delivery predicts: 'link_click', 'purchase', ...
```

Pricing Models adds `line_items.billing_event`; this chapter adds the optimization goal beside it. Ad load is reported from the decisions, per surface and day, including slots the ad lost:

```sql
-- Per surface and day: eligible slots, ads shown, ads that lost to organic, and the ad rate.
SELECT s.code, d.decided_at::date AS day,
       count(*)                                              AS eligible_slots,
       count(*) FILTER (WHERE d.outcome = 'ad_shown')        AS ads_shown,
       count(*) FILTER (WHERE d.outcome = 'lost_to_organic') AS lost_to_organic,
       round(100.0 * count(*) FILTER (WHERE d.outcome = 'ad_shown') / count(*), 1) AS ad_rate_pct
FROM feed_ad_decisions d
JOIN ad_surfaces s ON s.id = d.ad_surface_id
WHERE d.decided_at >= now() - interval '7 days'
GROUP BY s.code, d.decided_at::date
ORDER BY s.code, day;
```

Design notes:

- **Surfaces are properties' slots with policies.** `ad_surfaces` names each surface on a property and points at the ad unit its impressions count on, so delivery, counting and billing use the core's `ad_units` unchanged.
- **Ad load is a versioned rule.** `ad_load_rules` holds spacing, caps and the organic comparison with an effective range and an approver; a change in ad load is a new version, and every decision names the version it ran under ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Every eligible slot is a decision, ad or not.** `feed_ad_decisions` records slots where the ad lost to organic or no ad was eligible, so ad load and its revenue cost are measurable; it is a high-volume log, partitioned and sampled like the core's.
- **The matched targeting is kept for transparency.** Art. 26's "meaningful information" on targeting and Art. 39's targeting parameters come from `matched_targeting` and the campaign's configuration; retention follows the one-year repository rule and the privacy limits on per-person logs ([Retention](/docs/telemetry/consent-and-privacy#retention)).
- **The ads mode rides on the request.** Personalized, less personalized or contextual is decided before eligibility, from consent and age signals, and logged on the decision, so a regulator's question about a minor's feed is answerable.
- **Special categories are a campaign field read by setup and delivery.** The targeting UI restricts options and the delivery system applies variance monitoring for campaigns with a special category; both read the same field.
- **Placements default to automatic.** No `line_item_surfaces` rows means the platform chooses; rows restrict. The surface an impression ran on is in the decision log either way.

## Auditing

- **Every ad load rule version** with its effective range and approver, because ad load changes revenue and user experience at once.
- **Every eligible slot's outcome,** sampled where volume demands, including the organic value an ad beat or lost to.
- **Each campaign's type, special category and payer,** as they stood when each impression served.
- **The targeting that matched,** per impression or per aggregate, for the DSA's at-the-ad explanations and repositories.
- **Every ads-mode decision** for requests from the EU and from minors.
- **Delivery-audience monitoring for special categories,** with the variance measured and the corrections applied.

## What This Means for the System You Build

- **Build delivery as eligibility, retrieval, ranking and a total value auction,** and log each stage's output for the winning ad.
- **Make ad load a versioned rule** with spacing, caps and an organic comparison, and record every eligible slot's outcome.
- **Store the objective, optimization goal, billing event and bid strategy separately.**
- **Log what an automated campaign chose** (audience, placement, creative, budget split) per impression.
- **Put the ads mode on the request** and the special category on the campaign, and have every stage read them.
- **Keep the matched targeting and the payer** so every ad can be explained and listed in a repository.

## References

**Regulation**

- [Regulation (EU) 2022/2065, Digital Services Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2065), Art. 26(1) ad disclosures, Art. 26(3) special categories, Art. 28(2) minors and Art. 39 ad repositories and their retention
- [Regulation (EU) 2022/1925, Digital Markets Act](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R1925), Art. 5(2) consent to combine personal data for ads
- [European Commission: Apple and Meta breach the Digital Markets Act (April 23, 2025)](https://digital-markets-act.ec.europa.eu/commission-finds-apple-and-meta-breach-digital-markets-act-2025-04-23_en), the €200 million fine on Meta
- [European Commission: Meta commits to give EU users a choice on personalised ads (December 8, 2025)](https://digital-markets-act.ec.europa.eu/meta-commits-give-eu-users-choice-personalised-ads-under-digital-markets-act-2025-12-08_en), the less personalized ads option from January 2026

**Court records**

- [US Department of Justice: United States v. Meta Platforms, Inc. (S.D.N.Y.)](https://www.justice.gov/crt/case/united-states-v-meta-platforms-inc-fka-facebook-inc-sdny), the 2022 settlement, the end of Special Ad Audience and the Variance Reduction System

**Specifications**

- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), disclosure of relevance scores, likelihood-to-convert estimates and complex ML auction systems

**Filings**

- [Meta: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm), advertising revenue and its share of total revenue
- [Meta: Third quarter 2026 results](https://www.sec.gov/Archives/edgar/data/1326801/000162828026066700/meta-09302026xexhibit991.htm), ad impressions and average price per ad growth
- [Pinterest: Fourth quarter and full year 2025 results](https://www.sec.gov/Archives/edgar/data/1506293/000150629326000019/q4-25xpressrelease.htm), revenue and monthly active users
- [Snap: Fourth quarter and full year 2025 results](https://www.sec.gov/Archives/edgar/data/1564408/000156440826000011/snap-20260204xexx991pressr.htm), revenue
- [Reddit: Fourth quarter and full year 2025 results](https://www.sec.gov/Archives/edgar/data/1713445/000171344526000020/earningspressreleaseq425.htm), advertising revenue and growth
- [Microsoft: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/789019/000119312526323660/msft-20260630.htm), LinkedIn revenue growth

**Reference**

- [IAB: Digital ad revenue climbs to nearly $300B (April 16, 2026)](https://www.iab.com/news/digital-ad-revenue-climbs-to-nearly-300b-as-iab-celebrates-30-year-anniversary/), US social advertising in 2025

**In practice**

- [Meta Engineering: Meta Andromeda (December 2, 2024)](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/), retrieval narrowing candidates before ranking, and the recall and quality gains
- [Meta Engineering: Meta's Generative Ads Model (GEM) (November 10, 2025)](https://engineering.fb.com/2025/11/10/ml-applications/metas-generative-ads-model-gem-the-central-brain-accelerating-ads-recommendation-ai-innovation/), the foundation model, knowledge transfer to vertical models and the reported conversion gains
- [Meta: How does Facebook use machine learning to deliver ads? (June 11, 2020)](https://business.meta.com/news/good-questions-real-answers-how-does-facebook-use-machine-learning-to-deliver-ads/), total value from bid, estimated action rate and ad quality
- [Meta: About the ad auction](https://www.facebook.com/business/ads/ad-auction), not the highest bid, relevance from action rates and quality, and quality signals
- [Meta for Developers: Bid strategies](https://developers.facebook.com/docs/marketing-api/bidding/overview/bid-strategy), the default highest-volume strategy bidding on the advertiser's behalf
- [Meta for Developers: Ad set reference](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/), optimization_goal and billing_event
- [Meta for Developers: Upcoming ASC and AAC deprecation (October 8, 2025)](https://developers.facebook.com/blog/post/2025/10/08/upcoming-asc-and-aac-mapi-deprecation-migration-options-to-advantage-plus/), Advantage+ sales campaigns and the end of legacy creation in v24.0 and v25.0
- [Meta: An update on our ads fairness efforts](https://about.fb.com/news/2023/01/an-update-on-our-ads-fairness-efforts/), the Variance Reduction System for housing, employment and credit ads
- [TikTok Ads Help: About Smart+ campaigns](https://ads.tiktok.com/help/article/about-smart-plus-campaign?lang=en), objectives and what Smart+ automates
- [Pinterest Business: Pinterest Performance+](https://business.pinterest.com/pinterest-performance-plus), the suite, budget flex and Pinterest's reported test results
- [LinkedIn Help: Bidding strategies](https://www.linkedin.com/help/lms/answer/a427513), the auction, bid strategies and chargeable events
