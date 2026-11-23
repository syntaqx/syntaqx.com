+++
title = "Automated Bidding"
description = "Target CPA, target ROAS, maximize conversions and value, cost and bid caps, learning periods, seasonality and budget optimization, built as constrained bidding."
category = "Advertising Industry"
order = 2923
part = "Auctions and Pricing"
tags = ["advertising", "ad-tech", "bidding", "auctions", "data-model"]
+++

Automated bidding is the platform setting the bid for each auction on the advertiser's behalf, toward a goal the advertiser states as a budget and a target: as many conversions as possible at a $40 cost per acquisition, as much purchase value as possible at a 400% return on ad spend, the most clicks a $500 daily budget will buy. Google calls its version Smart Bidding, "bidding strategies that use Google AI to optimize for conversions or conversion value in every auction", which it also calls "auction-time bidding." Meta's bid strategies, LinkedIn's maximum delivery and cost cap, Apple Ads' Maximize Conversions, Pinterest's Performance+ bidding and every DSP's goal-based line items are the same idea. Every platform in the survey below offers it, next to or instead of manual bids.

It is hard for three reasons. The goal is a ratio over many auctions (cost per conversion, value per dollar), but each auction needs a price now, so the system must turn a ratio target into per-auction bids. The outcome it optimizes arrives late or never: a conversion can come days after the click, through an attribution model, and some never reach the platform at all. And the bidder shares the budget with a pacing system and the auction with a ranking system it may also run, so on a walled garden the same company sets the bid, ranks it and prices it, which is why the MRC's auction standards ask closed-loop auctioneers (the gardens) to disclose how their bid factors and pacing change what an advertiser's bid becomes.

This chapter covers the bidding problem as constrained optimization, the strategies across platforms, value bidding, learning periods, seasonality and data exclusions, budget optimization across line items, and what changes in first-price auctions, then the records a platform keeps so a strategy's bids can be explained. It extends `line_items`, `bids` and `conversions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The auctions the bids go into are [Auction Mechanics](/books/advertising/auction-mechanics); shading a value into a first-price bid is [Demand-Side Platforms](/books/advertising/demand-side-platforms); the daily and weekly budget rules and pacing controllers are [Campaigns & Line Items](/books/advertising/campaigns-and-line-items) and [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency); the pCTR and pCVR models are [Machine Learning for Ads](/books/advertising/machine-learning-for-ads); how conversions are attributed to the ads that bid for them is [Attribution](/books/advertising/attribution), in Measurement. Using these strategies from the advertiser's seat (feeding margin as conversion value, separating new customers) is Commerce's [Acquisition & Attribution](/books/commerce/acquisition-and-attribution#google-shopping-and-performance-max).

## How the Platforms Do It

As of November 2026, from each platform's help center and developer documentation:

| Platform | Strategies | Target units | Learning and data | Notes |
| --- | --- | --- | --- | --- |
| **Apple Ads** | Maximize Conversions (auto-bidder) or manual bids; target cost per acquisition on search results | Cost per tap, target CPA | Search Match is required for Maximize Conversions | Cost-per-install pricing on Basic |
| **Google Ads** | Target CPA, Target ROAS, Maximize conversions, Maximize conversion value (Smart Bidding); single-campaign or portfolio | Account currency for CPA; a percentage for ROAS | "Learning" status "never lasts more than 7 days"; at least 30 conversions recommended to evaluate, 50 for Target ROAS | Seasonality adjustments and data exclusions; pay for conversions in Display with Target CPA |
| **LinkedIn** | Maximum delivery (automated), cost cap, manual bidding | Per chargeable event | Not stated on the page opened | Chargeable event follows the optimization goal (impressions, clicks, views, sends, leads) |
| **Meta** | `LOWEST_COST_WITHOUT_CAP`, `COST_CAP`, `LOWEST_COST_WITH_BID_CAP`, `LOWEST_COST_WITH_MIN_ROAS` | `bid_amount` in cents for USD-like currencies; `roas_average_floor` scaled 10,000x | `learning_stage_info` on each ad set; "adherence to cost cap limits is not guaranteed" | Cost cap requires standard pacing |
| **Pinterest** | Performance+ automated bidding, ROAS bidding for advertisers passing revenue | ROAS | Not stated | Performance+ "flexes spend up or down by 25% per day, across a rolling 7-day average" |
| **TikTok** | Smart+ campaigns: a single AI campaign per performance objective (web sales, app promotion, lead generation, traffic) | Advertiser's KPIs | Not stated on the page opened | Automates targeting, optimization and creative refresh |

Three patterns:

- **Four shapes cover every platform.** Maximize volume within a budget; hit a cost per result on average; hit a value-per-spend floor; never exceed a per-auction bid. The names differ (Meta's "cost cap" is Google's target CPA in spirit, its "bid cap" a ceiling no Google Smart Bidding strategy exposes), and the model must map them, not copy one vendor's list.
- **Targets are averages, not caps.** Google: "Some conversions may cost more than your target and some may cost less." Meta: "Adherence to cost cap limits is not guaranteed." Only a bid cap bounds a single auction.
- **Automation absorbs the levers.** The newest products (Performance Max, Advantage+ campaigns, Smart+, Performance+) automate bidding together with targeting, budget and creative; [AI in Advertising](/books/advertising/ai-in-advertising), in Running the Platform, covers them as automated campaigns.

## The Bidding Problem

Every strategy is a constrained optimization over the auctions a line item will enter in its period: choose a bid for each to maximize the outcome (conversions, or conversion value) subject to spend staying within the budget and, for a target strategy, total spend over total outcomes staying at or under the target. The predicted outcome for one opportunity is the platform's model output (a conversion probability, a predicted value), and the advertiser's target turns it into money: with a target CPA of $20 and a predicted conversion probability of 5%, the opportunity is worth $20 × 0.05 = $1.00 to the strategy.

The research result that shapes every implementation: in a truthful auction, the optimal bid for such a constrained bidder is the opportunity's value times one multiplier shared by all its auctions. Aggarwal, Badanidiyuru and Mehta ("Autobidding with Constraints", WINE 2019) designed "optimal single-agent bidding strategies for the general bidding problem, in multi-slot truthful auctions" under "very general affine cost constraints", showed the formula is optimal exactly when the auction is truthful, and showed a multiplicative weights algorithm can learn it. So an autobidder is a model that predicts value per opportunity and a controller that learns one number, the multiplier, from how spend and outcomes are tracking against the budget and the target.

The multiplier can be above 1, which surprises people. A target-CPA bidder isn't maximizing profit, it's maximizing conversions at an average cost, so it can overbid on some opportunities as long as cheap ones elsewhere keep the average under target. A worked example: four opportunities, a $20 target CPA, a second-price auction, each opportunity's value at the target and the highest competing bid (example figures, dollars per opportunity):

| Opportunity | P(conversion) | Value at $20 CPA | Highest other bid | Wins at λ = 1.0 | At λ = 1.3 | At λ = 1.8 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 10% | $2.00 | $1.00 | Yes, pays $1.00 | Yes | Yes |
| 2 | 5% | $1.00 | $0.60 | Yes, pays $0.60 | Yes | Yes |
| 3 | 4% | $0.80 | $1.00 | No | Yes, pays $1.00 | Yes |
| 4 | 2% | $0.40 | $0.70 | No | No | Yes, pays $0.70 |
| **Spend** | | | | $1.60 | $2.60 | $3.30 |
| **Expected conversions** | | | | 0.15 | 0.19 | 0.21 |
| **CPA** | | | | $10.67 | $13.68 | $15.71 |

At a multiplier of 1.8 the strategy wins all four, including opportunity 4, whose own cost per conversion is $35, because the average stays at $15.71, under the $20 target. Add a $2.00 budget for these four and the budget binds first: only the λ = 1.0 outcome fits, and the strategy is, in Google's status vocabulary, "limited" by budget. That is the general shape: the target sets the multiplier when the budget is loose, the budget sets it when the budget is tight, and an advertiser who sets both is asking for whichever binds.

The controller in code, as a replay over logged opportunities: find the smallest multiplier that buys the most expected conversions within the budget and the target.

```go tab="Go"
package autobid

// Opportunity is one logged auction a line item could have entered: the model's
// conversion probability and the highest competing bid, per opportunity, in micros.
type Opportunity struct {
	PConv           float64
	CompetingMicros int64
}

// Choose returns the bid multiplier (parts per million) that maximizes expected
// conversions with spend <= budget and spend / conversions <= target CPA, replaying
// a second-price auction: bid = multiplier * pConv * targetCPA, win if above the
// competing bid, pay the competing bid.
func Choose(opps []Opportunity, targetCPAMicros, budgetMicros int64) (multPPM int64, conv float64, spend int64) {
	for m := int64(10_000); m <= 5_000_000; m += 10_000 { // 0.01 to 5.00
		var c float64
		var s int64
		for _, o := range opps {
			value := int64(o.PConv * float64(targetCPAMicros))
			if value*m/1_000_000 > o.CompetingMicros {
				s += o.CompetingMicros
				c += o.PConv
			}
		}
		withinTarget := c > 0 && float64(s) <= c*float64(targetCPAMicros)
		if s <= budgetMicros && withinTarget && c > conv+1e-12 {
			multPPM, conv, spend = m, c, s
		}
	}
	return multPPM, conv, spend
}
```

```rust tab="Rust"
/// One logged auction a line item could have entered: the model's conversion
/// probability and the highest competing bid, per opportunity, in micros.
pub struct Opportunity {
    pub p_conv: f64,
    pub competing_micros: i64,
}

/// Returns (multiplier ppm, expected conversions, spend micros) maximizing expected
/// conversions with spend <= budget and spend / conversions <= target CPA, replaying a
/// second-price auction: bid = multiplier * p_conv * target, win above the competing
/// bid, pay the competing bid.
pub fn choose(opps: &[Opportunity], target_cpa_micros: i64, budget_micros: i64)
    -> (i64, f64, i64) {
    let mut best = (0_i64, 0.0_f64, 0_i64);
    for m in (10_000..=5_000_000_i64).step_by(10_000) {
        let (mut c, mut s) = (0.0_f64, 0_i64);
        for o in opps {
            let value = (o.p_conv * target_cpa_micros as f64) as i64;
            if value * m / 1_000_000 > o.competing_micros {
                s += o.competing_micros;
                c += o.p_conv;
            }
        }
        let within_target = c > 0.0 && (s as f64) <= c * target_cpa_micros as f64;
        if s <= budget_micros && within_target && c > best.1 + 1e-12 {
            best = (m, c, s);
        }
    }
    best
}
```

On the table's four opportunities with a 20,000,000-micro target and no binding budget, both return a multiplier of 1,760,000 (the smallest that also wins opportunity 4, whose competing bid is exactly 1.75 times its value), 0.21 expected conversions and 3,300,000 micros of spend; with a 2,000,000-micro budget, 610,000, 0.15 and 1,600,000, where any multiplier from 0.61 to 1.25 buys the same two wins. A production controller doesn't replay a fixed log: it updates the multiplier continuously as spend and attributed conversions arrive, discounts recent hours for conversions not yet reported, and runs per line item or per portfolio with the budget's own pacing plan as the spend constraint.

## The Strategies

The four shapes, and how each platform names them:

| Shape | What it holds | Google Ads | Meta | LinkedIn | Others |
| --- | --- | --- | --- | --- | --- |
| **Maximize volume** | Spend the budget for the most outcomes | Maximize conversions | `LOWEST_COST_WITHOUT_CAP` | Maximum delivery | Apple Ads Maximize Conversions; TikTok Smart+ |
| **Average cost target** | Outcomes at or under a cost per result on average | Target CPA (or Maximize conversions with a target) | Cost cap (`COST_CAP`) | Cost cap | Apple Ads target CPA on search results |
| **Value target** | Value per spend at or above a floor on average | Target ROAS (or Maximize conversion value with a target) | Minimum ROAS (`LOWEST_COST_WITH_MIN_ROAS`) | | Pinterest ROAS bidding |
| **Per-auction ceiling** | No single bid above a cap | Manual max CPC, which actual CPC never exceeds without automated bidding | Bid cap (`LOWEST_COST_WITH_BID_CAP`) | Manual bidding | Apple Ads max cost per tap |

Three implementation consequences:

- **Average targets need a window.** "At or under a target on average" is undefined without the period and the attribution rules it's averaged over. Google recommends evaluating Target CPA over "the last 30 days, including at least 30 conversions" and suggests a starting target from "the average CPA from the last 30 days, adjusted for any conversion delays." The strategy record needs the window and the conversion actions it counts.
- **Cost targets and budgets interact.** A tight cost target with a large budget underspends (Meta: cost cap may not spend the full budget); a loose target with a small budget becomes budget-limited. Report both as statuses, not as errors.
- **A portfolio is one controller across many line items.** Google's strategies can cover one campaign or several, a "portfolio bid strategy", and Smart Bidding "can optimize based on data from all of your campaigns." The multiplier and the learned model then belong to the portfolio, and adding or removing a campaign changes what the controller is optimizing: Google lists "campaigns, ad groups, or keywords have been added to or removed from the bid strategy" as a reason for a learning status.

Google's signals list shows what an auction-time bidder conditions on: device, physical location, location intent, weekday and time of day, remarketing list, ad characteristics, interface language, browser and operating system, plus the actual search query and Search Network partner on Search and the web placement and site behavior on Display. A manual bidder sets a few adjustments on some of those; an automated one predicts per auction from all of them.

## Value Bidding

Value bidding replaces the count of conversions with their value. The strategy maximizes total conversion value, or holds value over spend at a floor: a 400% target ROAS means $4 of reported value per $1 of spend. The opportunity's worth is the predicted value of the conversion (the probability times the expected value given conversion) divided by the target ratio: with a predicted 2% chance of a purchase averaging $150 and a 400% target, the opportunity is worth 0.02 × $150 / 4 = $0.75.

Value bidding is only as good as the value the advertiser sends. Revenue is the easy value and often the wrong one: a strategy maximizing revenue will buy low-margin and returned orders as happily as profitable ones. Commerce's [Google: Shopping and Performance Max](/books/commerce/acquisition-and-attribution#google-shopping-and-performance-max) covers sending margin and adjusting for returns from the advertiser's side; the platform's side is three rules:

- **Value is a field on the conversion, in the account's currency, with its source.** The core's `conversions.value_micros` and `currency` carry it; restatements (a refund, a returned order) arrive as adjustments to the same conversion by its external ID, not as new conversions.
- **The target's scale is the platform's choice, so store it explicitly.** Meta's `roas_average_floor` "is an integer and scaled up 10000x", with 15000 meaning a minimum ROAS of 1.5 and valid values from 100 to 10,000,000; Google states ROAS as a percentage. A schema storing a ratio in basis points (40000 = 4.0x) maps both without floats.
- **Value targets need more data.** Google recommends at least 50 conversions for Target ROAS against 30 for CPA strategies, because the variance of value is higher than the variance of a count.

## Learning Periods

After a strategy is created or materially changed, its model and its multiplier have little data for the new configuration, and its delivery is noisier. Platforms surface this as a status.

**Google Ads** shows "Learning", which "never lasts more than 7 days", for three reasons: "The bid strategy was recently created or reactivated"; "Campaigns, ad groups, or keywords have been added to or removed from the bid strategy"; and "The conversion goals or actions you are optimizing to have significantly changed." Changes to targets and budgets do not trigger it: they "take effect in the next auction, but never trigger" the status. Google says performance "typically converges to your new goal within 1 to 2 conversion cycles", a conversion cycle being "the length of time it takes for a click to result in a conversion", and lists conversion volume, conversion cycles and "very restrictive settings, such as tight targets, low daily budgets, or narrow targeting" as what slows it. Its other statuses are Active, Inactive, Limited (by inventory, bid limits, budget or the strategy) and Misconfigured (for example, a conversion strategy with no usable conversion actions).

**Meta** exposes `learning_stage_info` on each ad set, "info about whether the ranking or delivery system is still learning for this ad set." The number of optimization events and the window Meta uses to end learning were not stated on any Meta page I could open; third-party guides cite about 50 events in seven days. <!-- source-gap: adv-meta-learning-phase-threshold | secondary | the number of optimization events and the time window Meta uses to exit the ad set learning phase, and which edits restart it | closes with: Meta Business Help Center "About the learning phase" text or Marketing API documentation of learning_stage_info values | checked: 2026-11-22 -->

What a platform building this needs:

- **Learning is a state with entry reasons and an exit rule.** Store each entry with its reason (new, composition change, goal change) and the time it ended, so a buyer's "why did CPA spike on the 4th" has an answer, and so the exit rule (events observed, days elapsed, a cap like Google's seven days) is applied consistently.
- **Separate edits that reset learning from edits that don't.** Google's split is the right one: a new strategy, a new set of members or a new goal changes what is learned; a target or budget change changes the constraint the controller applies to what it already knows.
- **Conversion delay is part of learning.** A strategy optimizing purchases with a median five-day lag sees this week's bids pay off next week. The controller must not read recent days' low conversion counts as poor performance; it predicts the conversions still to arrive (a lag model per conversion action) and discounts the recent window, which is why Google's guidance is stated in conversion cycles rather than days.

## Seasonality and Data Exclusions

A controller that learns from the recent past is wrong when the near future is different (a sale) or when the recent past was broken (a tracking outage). Google gives the advertiser two tools, and both are worth building on any platform:

- **Seasonality adjustments** schedule "a conversion rate adjustment, like an increase or a decrease" for an expected event; Google's example "increases the conversion rate by up to 50% for those 3 days." They are "ideal for short events of 1–7 days" and "may not work as well" over "more than 14 days at a time." They apply to Target CPA and Target ROAS on Search, Shopping, Demand Gen and Display, and to all strategies on Performance Max.
- **Data exclusions** tell the bidder to ignore conversion data from a period when tracking was broken (Google's examples include broken tracking, tags in the wrong place and offline conversions that couldn't be uploaded); they "don't affect conversion reporting", only what Smart Bidding learns from. Google advises applying them "as soon as a conversion data issue is identified", not "frequently or for prolonged periods", and expects performance to keep fluctuating for one to two conversion cycles when a week or more of clicks are affected.

The model point is that both are time-ranged overrides on the strategy's inputs, not edits to the strategy: they need a range, a scope (campaigns, a campaign type, a manager account's linked accounts), a value (the expected change, or "exclude"), who set it and why. Storing them as rows lets the platform show, next to any day's bids, what overrides were in force.

## Budget Optimization

An advertiser with several line items and one budget wants the money where the outcomes are cheapest. Three designs exist, and a platform usually offers all three:

- **Budgets on each line item.** Each line item's controller works alone; moving money is the advertiser's job.
- **One budget shared by several line items, each bidding alone.** A shared budget ([Campaigns & Line Items](/books/advertising/campaigns-and-line-items) covers the budget record) caps total spend; each line item's controller sees a share. Google's status vocabulary has a case for the mismatch: a "Maximize" strategy on campaigns sharing a budget is "Misconfigured" unless all of them are on one portfolio strategy.
- **One budget and one controller across line items.** The controller allocates across line items by marginal return: it moves spend from the line item whose next dollar buys the least to the one whose next dollar buys the most, until marginal costs per outcome are equal. Pinterest's Performance+ "flexes spend up or down by 25% per day, across a rolling 7-day average." In the multiplier formulation, one budget across line items means one shared multiplier on value, adjusted to the combined spend.

Equalizing marginal cost is the right rule, with two cautions a platform owes its advertisers. First, the controller allocates on attributed outcomes, so a line item that claims conversions another line item caused gets more money ([Incrementality & Lift](/books/advertising/incrementality-and-lift), in Measurement, is how an advertiser checks). Second, allocation is a pacing decision as much as a bidding one: the MRC's auction standards require closed-loop auctioneers to offer "even and buyer-defined pacing" options and to disclose "the extent to which the system adjusts bid levels or sits out auctions in order to conform with a buyer's campaign specifications." A platform that moves budget between line items or sits a line item out of auctions should log that decision per period, so the advertiser can see why one ad set spent nothing on a Tuesday.

## Automated Bidding in First-Price Auctions

The optimal-multiplier result holds in truthful auctions. On the open web the auctions are first price, and a DSP's automated bidder does two things in sequence: compute the line item's value for the opportunity (prediction times target, times the multiplier), then shade that value to the price that maximizes expected surplus given the win curve for this supply ([Demand-Side Platforms](/books/advertising/demand-side-platforms) covers shading with a worked example and code). The MRC's standards warn that "a bid strategy that is ideal for a first-price auction is suboptimal for a second-price auction", and the reverse; an autobidder must know each auction's type, which OpenRTB carries in `at` and a garden discloses in its documentation, and must treat an auction whose disclosed rules and observed prices disagree (a "second-price" auction where winners usually pay their bid) as first price. The FTC's August 2026 complaint against Amazon (allegations, not findings) says a 2023 internal Amazon memo made the same point: that if an auction "is first-price rather than second-price, or even if it is a second price auction that uses soft reserve prices, then 'the right thing to do ... is to shade the bids on behalf of the advertisers'" ([Reserve Prices](/books/advertising/auction-mechanics#reserve-prices)).

## How to Build It

The core `line_items` carry a pricing model, a rate (the fixed rate or a maximum bid), a budget and a goal quantity; [Campaigns & Line Items](/books/advertising/campaigns-and-line-items) adds shared budgets and the line item's version history, and [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency) adds the pacing plan. Automated bidding adds the strategy as its own record (a portfolio is one strategy shared by many line items), its status history, its time-ranged overrides, and on each bid the strategy, multiplier and predictions that produced it.

```sql
CREATE TABLE bid_strategies (            -- one controller: a line item's own, or a portfolio
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id       UUID NOT NULL REFERENCES ad_accounts (id),
  name                TEXT NOT NULL,
  shape               TEXT NOT NULL CHECK (shape IN ('maximize_volume', 'cost_target',
                        'value_target', 'bid_cap', 'manual')),
  outcome             TEXT NOT NULL CHECK (outcome IN ('conversions', 'conversion_value',
                        'clicks', 'impressions', 'views', 'impression_share')),
  target_cpa_micros   BIGINT CHECK (target_cpa_micros > 0),   -- cost per outcome, account currency
  target_roas_bp      INT CHECK (target_roas_bp > 0),         -- value over spend: 40000 = 4.0x
  bid_cap_micros      BIGINT CHECK (bid_cap_micros > 0),      -- per-auction ceiling, in bid_unit
  bid_unit            TEXT NOT NULL DEFAULT 'cpm' CHECK (bid_unit IN ('cpm', 'cpc', 'cpv',
                        'cpa', 'cpt')),
  conversion_kinds    TEXT[] NOT NULL DEFAULT '{}',  -- which conversions.kind values it counts
  attribution_window  TEXT,               -- as on conversions: the window it optimizes under
  evaluation_days     SMALLINT NOT NULL DEFAULT 30 CHECK (evaluation_days > 0),
  is_portfolio        BOOLEAN NOT NULL DEFAULT FALSE,
  platform_ref        TEXT,               -- the external strategy, e.g. 'COST_CAP', 'TARGET_CPA'
  status              TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'removed')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (shape <> 'cost_target'  OR target_cpa_micros IS NOT NULL),
  CHECK (shape <> 'value_target' OR target_roas_bp IS NOT NULL),
  CHECK (shape <> 'bid_cap'      OR bid_cap_micros IS NOT NULL),
  CHECK (shape NOT IN ('cost_target', 'value_target') OR cardinality(conversion_kinds) > 0)
);

ALTER TABLE line_items ADD COLUMN bid_strategy_id UUID;
ALTER TABLE line_items ADD CONSTRAINT line_items_bid_strategy_fk
  FOREIGN KEY (bid_strategy_id) REFERENCES bid_strategies (id) NOT VALID;
CREATE INDEX CONCURRENTLY line_items_bid_strategy_idx ON line_items (bid_strategy_id);

CREATE TABLE bid_strategy_states (       -- status history: learning, limited, misconfigured
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  bid_strategy_id   UUID NOT NULL REFERENCES bid_strategies (id),
  state             TEXT NOT NULL CHECK (state IN ('learning', 'active', 'limited',
                      'misconfigured', 'inactive')),
  reason            TEXT NOT NULL CHECK (reason IN ('new', 'reactivated', 'composition_change',
                      'goal_change', 'budget', 'bid_limit', 'inventory', 'target',
                      'no_conversion_actions', 'shared_budget_mismatch', 'paused', 'none')),
  entered_at        TIMESTAMPTZ NOT NULL,
  exited_at         TIMESTAMPTZ,          -- null while current
  outcomes_observed INT,                  -- events counted toward the exit rule
  CHECK (exited_at IS NULL OR exited_at >= entered_at)
);
CREATE UNIQUE INDEX bid_strategy_states_current_idx
  ON bid_strategy_states (bid_strategy_id) WHERE exited_at IS NULL;

CREATE TABLE bid_strategy_adjustments (  -- time-ranged overrides on what the controller learns
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id     UUID NOT NULL REFERENCES ad_accounts (id),
  bid_strategy_id   UUID REFERENCES bid_strategies (id),  -- null: every strategy in the account
  kind              TEXT NOT NULL CHECK (kind IN ('seasonality', 'data_exclusion')),
  effective         TSTZRANGE NOT NULL,
  conversion_rate_change_bp INT,          -- seasonality: +5000 = up to 50% higher
  reason            TEXT NOT NULL,        -- 'spring sale', 'tag removed in release 4.2'
  created_by        TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((kind = 'seasonality') = (conversion_rate_change_bp IS NOT NULL))
);

-- What produced each automated bid.
ALTER TABLE bids
  ADD COLUMN bid_strategy_id UUID,       -- no FK across partitioned logs
  ADD COLUMN multiplier_ppm INT,         -- the controller's multiplier at bid time
  ADD COLUMN predicted_conversion_ppm INT,   -- the model's P(outcome), parts per million
  ADD COLUMN predicted_value_micros BIGINT;  -- value strategies: expected value given conversion
```

The view a buyer and a support engineer both want, a strategy's target against what it achieved, with the states in force:

```sql
-- Per strategy and day: spend, attributed conversions and value, CPA and ROAS, and the state.
WITH daily AS (
  SELECT li.bid_strategy_id, d.day,
         sum(d.cost_micros)                    AS spend_micros
  FROM delivery_daily d
  JOIN line_items li ON li.id = d.line_item_id
  WHERE d.source = 'first_party' AND d.day >= current_date - 30
  GROUP BY 1, 2
), outcomes AS (
  SELECT li.bid_strategy_id, c.occurred_at::date AS day,
         count(*)                              AS conversions,
         sum(c.value_micros)                   AS value_micros
  FROM conversions c
  JOIN ad_events e  ON e.id = c.attributed_event_id   -- sketch: production joins on (occurred_at, id)
  JOIN line_items li ON li.id = e.line_item_id
  WHERE c.occurred_at >= current_date - 30
  GROUP BY 1, 2
)
SELECT s.name, d.day, d.spend_micros, o.conversions,
       d.spend_micros / NULLIF(o.conversions, 0)              AS cpa_micros,
       s.target_cpa_micros,
       10000 * o.value_micros / NULLIF(d.spend_micros, 0)     AS roas_bp,
       s.target_roas_bp,
       st.state, st.reason
FROM daily d
JOIN bid_strategies s      ON s.id = d.bid_strategy_id
LEFT JOIN outcomes o       ON o.bid_strategy_id = d.bid_strategy_id AND o.day = d.day
LEFT JOIN bid_strategy_states st ON st.bid_strategy_id = s.id
  AND st.entered_at < (d.day + 1)::timestamptz
  AND (st.exited_at IS NULL OR st.exited_at >= d.day::timestamptz)
ORDER BY s.name, d.day;
```

The sketch puts each conversion on the day it occurred; a platform reporting the way Meta's Insights API does for on-platform actions puts it on the day of the impression instead, and the strategy's evaluation must use one rule and say which ([Reporting & Data Pipelines](/books/advertising/reporting-and-data-pipelines) covers attribution-time versus conversion-time reporting).

Design notes:

- **The strategy is its own record, shared or not.** A line item's own strategy and a portfolio are the same row with `is_portfolio` set; line items point at it. Moving a line item between strategies is a composition change on both, recorded in `bid_strategy_states`.
- **Targets are in the account's currency and the platform's units, named.** `target_cpa_micros`, `target_roas_bp` and `bid_cap_micros` carry their units; `platform_ref` holds the external enum when the strategy mirrors another platform's (a Meta `COST_CAP`, a Google `TARGET_CPA`), and the import converts Meta's cents and 10,000x scale once ([Money & Amounts](/docs/money/amounts)).
- **Conversion kinds map to conversion actions.** `conversion_kinds` filters the core's `conversions.kind`; once [Attribution](/books/advertising/attribution#how-to-build-it) adds `conversion_actions`, the strategy counts the account's actions in those categories that have `primary_for_bidding` set, and `attribution_window` names the window of each action's current `attribution_settings` row, so the bidder and the report count the same conversions.
- **States are history with one current row.** The partial unique index allows one open state per strategy; every transition closes the old row and opens a new one with its reason. A target or budget change writes a line item version, not a learning state.
- **Overrides are ranged and scoped.** `bid_strategy_adjustments` rows apply to one strategy or the whole account for a time range; the controller reads the ones in force, and reporting shows them beside the day's results. Excluded data stays in reporting, as Google's does.
- **Every bid carries its provenance.** Strategy, multiplier and predictions on the bid row let a platform recompute why it bid what it did, which is the "nominal to effective bid conversion" the MRC's auction standards ask to be reported, and the input a pacing or shading change is debugged from.
- **The controller's own history is a log.** Multiplier changes per strategy per interval are high-volume; keep them in the same log store as bids, sampled after the dispute window ([Retention](/docs/telemetry/consent-and-privacy#retention)).
- **Experiments on bidding are holdouts.** A new controller or model version is tested on a random share of strategies or auctions, with the assignment recorded, never by switching everyone and comparing weeks ([Holdouts](/docs/telemetry/experimentation#holdouts)).

## Auditing

- **What the advertiser asked for.** Every strategy version: shape, outcome, targets, cap, conversion kinds and window, who set it and when, because a complaint that the platform "overspent the target" is judged against the target as it stood.
- **What state it was in.** Each learning, limited and misconfigured period with its reason, so a bad week can be tied to a change.
- **What overrides applied.** Seasonality adjustments and data exclusions with range, scope and author.
- **How each bid was formed.** Strategy, multiplier, prediction and value on the bid, and, for budget optimization, the allocation per line item per period, including periods a line item sat out.
- **What the outcomes were, by attribution rule.** Spend and attributed outcomes under the window the strategy optimized, kept with the attribution model's version.

## What This Means for the System You Build

- **Model bidding as value times a multiplier,** with the value from predictions and the multiplier from a controller tracking budget and target.
- **Map every platform's strategies to four shapes** (volume, cost target, value target, bid cap) and store targets with their units and scale.
- **Treat targets as averages over a stated window** and report under- and over-delivery as statuses, not errors.
- **Record learning and limited states with reasons,** and keep target and budget edits from resetting what was learned.
- **Predict delayed conversions** instead of reading a quiet recent window as failure.
- **Store seasonality adjustments and data exclusions as ranged overrides** on the controller's inputs.
- **Allocate a shared budget by marginal return** and log when a line item sits out.
- **Shade in first-price auctions** after computing value, and know each auction's real type.

## References

**Specifications**

- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), bid factors and pacing in nominal-to-effective bid conversion, required even and buyer-defined pacing options and pacing disclosure, and first- versus second-price bid strategies

**Court records**

- [FTC et al. v. Amazon.com, Inc., No. 2:26-cv-03097 (W.D. Wash.), Complaint (August 31, 2026)](https://ag.ny.gov/sites/default/files/court-filings/federal-trade-commission-et-al-v-amazon.com-inc-complaint-2026_0.pdf), the quoted statement on shading bids in first-price and soft-reserve auctions

**Reference**

- [Aggarwal, Badanidiyuru and Mehta: Autobidding with Constraints (WINE 2019)](https://research.google/pubs/autobidding-with-constraints/), optimal bidding under affine cost constraints in truthful auctions, the truthfulness condition and learning the formula with multiplicative weights
- [Aggarwal et al.: Auto-bidding and Auctions in Online Advertising: A Survey (2024)](https://arxiv.org/abs/2408.07685), the research area on bidding algorithms and auction design for autobidders

**In practice**

- [Google Ads Help: About Smart Bidding](https://support.google.com/google-ads/answer/7065882?hl=en), the definition, auction-time bidding, the four strategies, the signals, portfolio strategies and the 30 and 50 conversion recommendations
- [Google Ads Help: About Target CPA bidding](https://support.google.com/google-ads/answer/6268632?hl=en), bidding by likelihood to convert, conversions costing more or less than target, the 30-day recommendation and evaluation window
- [Google Ads Help: Duration of the learning period](https://support.google.com/google-ads/answer/13020501), the seven-day cap, the three reasons, convergence in conversion cycles, slowing factors and target and budget changes not triggering learning
- [Google Ads Help: About bid strategy statuses](https://support.google.com/google-ads/answer/6263057), Active, Inactive, Learning, Limited and Misconfigured, including the shared-budget case
- [Google Ads Help: About seasonality adjustments](https://support.google.com/google-ads/answer/10369906?hl=en), scheduled conversion rate adjustments, the 1-7 day and 14-day guidance and supported campaigns
- [Google Ads Help: About data exclusions](https://support.google.com/google-ads/answer/10370710?hl=en), excluding broken conversion data from bidding without changing reporting, and the guidance on timing and duration
- [Meta for Developers: Bid strategies](https://developers.facebook.com/docs/marketing-api/bidding/overview/bid-strategy), the four strategy enums, cost cap adherence, roas_average_floor scaling and range, and the standard pacing requirement
- [Meta for Developers: Ad set reference](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/), learning_stage_info, bid_strategy and bid_amount in cents
- [Meta for Developers: Insights API best practices](https://developers.facebook.com/docs/marketing-api/insights/best-practices), impression-based timing for on-Meta actions in reporting
- [LinkedIn Help: Bidding strategies](https://www.linkedin.com/help/lms/answer/a427513), maximum delivery, cost cap and manual bidding, and chargeable events
- [Apple Ads: Ad placement options](https://ads.apple.com/app-store/help/ad-placements/0081-ad-placement-options), Maximize Conversions with Search Match and target cost per acquisition on search results
- [Apple Ads: How pricing works](https://ads.apple.com/app-store/help/advanced/0003-how-pricing-works), the auto-bidder and cost-per-tap and cost-per-install pricing
- [Pinterest Business: Pinterest Performance+](https://business.pinterest.com/pinterest-performance-plus), automated and ROAS bidding and the 25% daily budget flex over a rolling seven days
- [TikTok Ads Help: About Smart+ campaigns](https://ads.tiktok.com/help/article/about-smart-plus-campaign?lang=en), one AI campaign per performance objective and what it automates
- [Google Ads Help: Actual cost-per-click](https://support.google.com/google-ads/answer/6297?hl=en), the max CPC limit and its exception for automated bidding
- [Google Ads Help: Use pay for conversions in Display campaigns](https://support.google.com/google-ads/answer/7528254?hl=en), paying for conversions with Target CPA
