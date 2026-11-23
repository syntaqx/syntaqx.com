+++
title = "Pacing & Frequency Capping"
nav_title = "Pacing & Frequency"
description = "Even and ASAP delivery, pacing controllers, catch-up for guaranteed goals, frequency caps across domains and devices, over- and under-delivery, make-goods."
category = "Advertising Industry"
order = 2908
part = "Ad Serving and Creative"
tags = ["advertising", "ad-tech", "pacing", "frequency-capping", "make-goods", "data-model"]
+++

Pacing is spending a budget, or delivering a goal, at the rate the buyer asked for over the flight: not all on the first morning, not left over at the end. Frequency capping is limiting how often one person sees the same ad. Both are controls the ad server or bidder applies on every request, both decide eligibility before any price is computed, and both are where buyers most often feel a platform failed them: the campaign that spent its month's budget in a week, the guaranteed line item that ended 12% short, the viewer who saw the same car ad nine times in an evening.

They are hard because the system controls only its own participation, not the supply. Requests arrive in a daily and weekly shape that shifts with news, weather and holidays; win rates change as competitors' budgets come and go; a decision made at one serving node doesn't reach the others for seconds or minutes; and the count that pacing steers on arrives late. A frequency cap needs to recognize a person across requests, which depends on an identifier the consent state may not allow and the browser may not keep. And both controls trade against yield: a line item that holds back to pace evenly leaves impressions for others, and a cap that stops a buyer from bidding lowers the price an exchange clears.

This chapter covers delivery speed settings and what they promise, how pacing controllers work (throttling against bid modification, traffic shape, catch-up, the last hours), budget pacing for self-serve buyers, frequency caps and what identifier they need, over- and under-delivery, and make-goods. It extends `line_items` (the core's `pacing` and `frequency_caps` columns) and reads `ad_events` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The ad server decision that consumes pacing output is in [Ad Servers](/books/advertising/ad-servers); budgets and their overspend rules are in [Campaigns & Line Items](/books/advertising/campaigns-and-line-items#budgets); what a goal could deliver before it was booked is in [Forecasting & Avails](/books/advertising/forecasting-and-avails); bid optimization under a budget (tCPA, tROAS, bid shading) is Automated Bidding, in Auctions and Pricing.

## How the Platforms Do It

As of November 2026, from each platform's documentation:

| Platform | Pacing options | Over-delivery allowance | Catch-up | Frequency caps |
| --- | --- | --- | --- | --- |
| **Display & Video 360** (Google) | Per period (daily or the whole flight): ASAP, even, ahead ("attempts to spend faster than evenly") | `dailyMaxMicros` and `dailyMaxImpressions` as caps | Not described on the API page | A cap object from minutes to one month, on impressions or (YouTube) views |
| **Google Ad Manager** | Evenly (default), frontloaded, as fast as possible | Evenly "could deliver up to 5% higher than the goal"; frontloaded starts "as much as 40% higher" | Missed delivery made up "during the next calendar/civil day"; final hour runs as fast as possible; grace period up to 7 days (Ad Manager 360) | Up to 10 per line item; time-based caps need "a USERID or a PPID" |
| **Google Ads** | Standard delivery only, since accelerated delivery was removed (Search and Shopping in 2019; Display, Video, App and Hotel from April 2020) | Daily spend up to 2x the average daily budget; monthly 30.4x | Built into the averaging | Display: per day, week or month at campaign, ad group or ad; Video: campaign level, by signed-in user or device |
| **Meta** | Pacing of daily or lifetime budgets; daily budget as a weekly average since API v24.0 | Up to 75% over on a day; weekly spend at most 7x the daily budget | Built into the weekly averaging | Not covered on the pages opened |
| **Microsoft Monetize** (guaranteed delivery) | Even across the flight, with forecast-shaped pacing as an option | Daily goal at "105% of even lifetime delivery by default"; bidders "go to sleep" when ahead | Even (spread over remaining days) or ASAP (default, within the next 24 hours); daily budgeting at midnight in the line item's zone | Not covered on the pages opened |

The common shape:

- **Even is the default and has headroom.** Ad Manager's evenly paced line items aim up to 5% ahead; Monetize's daily goal is 105% of even. Both deliberately run slightly ahead so a bad final day doesn't cause a shortfall.
- **Behind schedule means catching up soon.** Ad Manager makes up a shortfall on the next day; Monetize's default makes it up in the next 24 hours, with an option to spread it. A paused line item restarts hungry.
- **Self-serve platforms pace by averaging.** Google Ads and Meta don't offer an "as fast as possible" mode for most campaigns any more; they let a day overspend and enforce the budget over a month or a week.
- **Time-based caps need an identifier.** Ad Manager won't serve a line item with a time-based cap and no identifier; Google Ads counts video caps by signed-in user or device. A cap is only as good as the identity it counts on.

## Delivery Speed

The pacing setting is the buyer's instruction about the shape of delivery over the flight.

**Even.** The goal spread across the flight in proportion to expected traffic. Ad Manager's evenly paced line items use hourly delivery goals and "could deliver up to 5% higher than the goal as a safeguard against underdelivery". On a 10,000-impression, 10-day line item, Ad Manager's own example targets 1,050 on day one, not 1,000.

**Frontloaded.** More early, tapering. Ad Manager's frontloaded line items begin "as much as 40% higher than its goal briefly", deliver the first half "as much as 25% higher than expected without frontloading", and decline to about 5% ahead near the end; on the same example, day one targets 1,400, and about 63% of the goal is delivered in the first half. Buyers ask for it when the tail of a flight is risky (a product launch, an event date).

**Ahead.** DV360's variant: "attempts to spend faster than evenly, to make sure the entire budget is spent by the end of the flight". It is frontloading stated as an objective, not a curve.

**As fast as possible.** Take every eligible impression until the goal is met. Ad Manager's ASAP line items are "Never considered 'on schedule'", never take impressions from line items of equal or higher priority, and may end early. DV360 keeps ASAP as a pacing type. Google Ads removed its equivalent, accelerated delivery: for Search, Shopping and shared budgets in 2019, and for new Display, Video, App and Hotel campaigns "starting April 2020". Google's reason in the 2019 notice was that, "for campaigns that are limited by budget, this method can increase CPCs due to increased competition early in the day."

The setting is a promise only where the delivery goal is: a guaranteed line item paced evenly is expected to be within its tolerance each day, while a non-guaranteed line item's pacing is a preference the auction may not let it meet.

## Pacing Controllers

A controller turns "how far ahead or behind plan is this line item?" into an action on each request. There are two families, and the choice between them is the first design decision.

**Throttling.** Decide whether the line item participates in this request at all, with a probability (the pacing rate) the controller raises when behind and lowers when ahead. The price, if it competes, is set separately. **Bid modification** instead adjusts the price: bid more when behind to win more, less when ahead. The KDD 2015 paper "Smart Pacing for Effective Online Ad Campaign Optimization" lays out the trade: earlier work used bid modification (Mehta et al., Abrams et al., Borgs et al.) or probabilistic throttling (Agarwal et al. at LinkedIn, Lee et al.), and the authors chose throttling because "the bid win-rate curve is usually not smooth so modifying bid can cause significant changes in budget spending", because "the bid landscape can be changed dramatically over time", because a lowered bid can fall below an SSP's reserve, and because throttling "decouples pacing control from bid calculation" so each can be built independently. Microsoft describes the same two levers for its guaranteed line items, "Raising or lowering the bid price" and "Deciding whether to bid or not", and uses both: a pCPM set "slightly higher than strictly necessary to ensure robust win rates", and bidders that stop bidding "when ahead of even delivery by a certain percentage".

My default for anything that bids into auctions is throttling with a separate bid optimizer, for the reasons the paper gives; inside a publisher's own ad server, where guaranteed line items compete through an opportunity cost, the opportunity cost is the price lever and throttling caps the rate ([Guaranteed Demand Against the Auction](/books/advertising/ad-servers#guaranteed-demand-against-the-auction)).

**Selection among equals.** When several paced line items are eligible for the same impression, the one furthest behind should usually win. Ad Manager computes a satisfaction index "to measure how far ahead or behind schedule a line item is", and line items further behind are selected more often; the threshold is "calculated at least once every ten minutes". Monetize chooses "based on a weighted average of their target win rates", so "most of the time" the line item "further from meeting its delivery goals" serves. Both use a weighted choice, not a strict maximum, so a slightly-behind line item doesn't starve one slightly less behind.

### The plan: traffic shape

Even doesn't mean equal per hour. Requests at 3 a.m. are a fraction of requests at 9 p.m., so an "even" plan that wants the same impressions every hour starves at night and overruns in the evening. The plan is the goal distributed in proportion to expected traffic. Ad Manager's expected traffic shape uses "average of your network's overall past traffic patterns" for line items under two weeks and the targeted inventory's own traffic for longer ones, looking back "up to 4 weeks if the line item runs long enough". Monetize offers forecast-shaped pacing including day-of-week shape. The traffic shape is a forecast (Forecasting & Avails covers building them); the controller needs only a curve per inventory slice saying what share of a day's traffic arrives in each interval.

### Feedback and its lag

Each control interval (minutes) the controller compares delivered against planned and adjusts. The delivered number is always behind: impressions count when the creative begins to render, beacons arrive late, and the serving nodes report in batches. Ad Manager warns that pacing changes can take "up to 48 hours" to show in traffic and that a line item's delivered total "might exceed the daily or lifetime cap by a small amount" because of delayed counting or simultaneous requests. Monetize recalculates pCPM "locally by the bidder every few minutes", with a "global budget update that goes out to all bidders" about every 15 minutes, and explains why it doesn't try to update bidders in real time: request rates and win rates are too volatile and information propagates "at slower-than-realtime speeds", so each bidder would have "either a very outdated estimate of the request and win rate ... or a very noisy one".

Three consequences for building one:

- **Pace on a fast count, bill on the slow one.** The controller reads a provisional, near-real-time count (decisions won, impressions begun) that is good enough to steer; billing reads the deduplicated, IVT-filtered roll-up hours later. They will differ, and the controller must not be retuned to chase the billing number.
- **Distribute the budget, don't share a counter.** A single global counter every node increments on every impression is a hot spot and a single point of failure. Give each node an allocation for the interval (its share of the plan), let it spend locally, and rebalance each interval. A node that loses contact keeps spending its allocation, never more.
- **Damp the controller.** Adjust the rate by a fraction of the error each interval and bound how fast it can change; a controller that doubles the rate whenever it's behind oscillates, overspending one interval and starving the next.

### Catch-up

A line item behind plan (paused, under-supplied, blocked by a creative rejection) must make up the gap before the flight ends. How fast is a policy:

- **Ad Manager** catches up by default "during the next calendar/civil day" in the account's time zone. Its example: a 100,000-impression goal over 10 days is delivered for two days, paused four, restarted on day 7 with 80,000 left, and targets about 50,000 that day.
- **Monetize** offers both. **ASAP catch-up** (the default) makes up the shortfall "within the next 24-hour period": behind 400,000 on a 100,000-a-day line item, it targets 500,000 on the restart day. **Even catch-up** has unspent budget "evenly redistributed across the remaining days of the flight": the same line item with two days left targets 300,000 a day. Its daily budgeting runs "once per day at midnight in the timezone of the line item" and divides the catch-up amount by the average under-delivery rate over the past four days "to account for persistent underdelivery".

Fast catch-up recovers more of the goal and concentrates delivery (frequency caps bind, quality drops, the publisher's other line items lose share for a day); even catch-up is gentler and riskier. Store the choice on the line item.

### The end of the flight

The last hours decide whether a guaranteed line item meets its goal. Ad Manager adjusts delivery near the end of a fixed-goal line item that hasn't met it, and in the last hour the line item behaves as if it should deliver "as fast as possible", even serving ahead of higher-priority campaigns. Monetize states the opposite: "Currently there is no special behavior that takes place during the final hours of the line item's flight." Ad Manager 360 also offers a **delivery grace period**: the end date extended by up to 7 days, during which the line item "will serve as fast as possible" with the status "Delivery extended", and stops serving at the new end if the goal is still unmet. A grace period changes the flight, so it needs the buyer's consent under the IAB/4A's terms, which forbid extending "any Ad beyond the period set forth on the IO without the prior written consent of Agency".

A sketch of a controller's per-interval update, for a throttled line item with a daily goal and ASAP or even catch-up (the traffic shape and the provisional count come from elsewhere):

```go tab="Go"
type PacingState struct {
	DayGoal        int64   // today's planned impressions, including catch-up
	ShapeSoFar     float64 // share of today's expected traffic already elapsed, 0..1
	DeliveredToday int64   // provisional count
	Rate           float64 // participation probability, 0..1
}

// DailyGoal runs at midnight in the line item's time zone.
func DailyGoal(remaining int64, daysLeft int, base int64, asap bool, headroomBP int64) int64 {
	if daysLeft <= 0 {
		return 0
	}
	shortfall := remaining - base*int64(daysLeft)
	if shortfall < 0 {
		shortfall = 0
	}
	goal := base
	if asap {
		goal += shortfall // make it all up today
	} else {
		goal += shortfall / int64(daysLeft) // spread it over the remaining days
	}
	return goal * (10000 + headroomBP) / 10000 // e.g. 500 bp = the 5% safety margin
}

// Update runs every control interval on the provisional count.
func (s *PacingState) Update() {
	planned := float64(s.DayGoal) * s.ShapeSoFar
	if planned < 1 {
		planned = 1
	}
	ratio := float64(s.DeliveredToday) / planned // 1.0 = on plan
	adj := 1 + 0.5*(1-ratio)                     // damped: half the error per interval
	adj = math.Max(0.5, math.Min(2.0, adj))      // and bounded
	s.Rate = math.Max(0.001, math.Min(1.0, s.Rate*adj))
	if s.DeliveredToday >= s.DayGoal {
		s.Rate = 0 // today's goal met; resume tomorrow
	}
}

// Participate is the per-request throttle, before any price is computed.
func (s *PacingState) Participate(r *rand.Rand) bool { return r.Float64() < s.Rate }
```

```rust tab="Rust"
pub struct PacingState {
    pub day_goal: i64,        // today's planned impressions, including catch-up
    pub shape_so_far: f64,    // share of today's expected traffic elapsed, 0..1
    pub delivered_today: i64, // provisional count
    pub rate: f64,            // participation probability, 0..1
}

/// Runs at midnight in the line item's time zone.
pub fn daily_goal(remaining: i64, days_left: i64, base: i64, asap: bool, headroom_bp: i64) -> i64 {
    if days_left <= 0 {
        return 0;
    }
    let shortfall = (remaining - base * days_left).max(0);
    let goal = if asap { base + shortfall } else { base + shortfall / days_left };
    goal * (10_000 + headroom_bp) / 10_000
}

impl PacingState {
    /// Runs every control interval on the provisional count.
    pub fn update(&mut self) {
        let planned = (self.day_goal as f64 * self.shape_so_far).max(1.0);
        let ratio = self.delivered_today as f64 / planned;
        let adj = (1.0 + 0.5 * (1.0 - ratio)).clamp(0.5, 2.0); // damped and bounded
        self.rate = (self.rate * adj).clamp(0.001, 1.0);
        if self.delivered_today >= self.day_goal {
            self.rate = 0.0;
        }
    }

    /// The per-request throttle, before any price is computed.
    pub fn participate(&self, rng: &mut impl rand::Rng) -> bool {
        rng.gen::<f64>() < self.rate
    }
}
```

Run against Monetize's example (100,000 a day, 400,000 behind with two days left, so 600,000 remaining): `DailyGoal(600000, 2, 100000, true, 0)` gives 500,000 and the even form gives 300,000, the two targets its documentation states. A real controller adds the traffic shape per inventory slice, a floor rate so a line item never stops learning its win rate, the last-hour behavior and a node allocation so the rate is applied against a local budget.

## Budget Pacing for Self-Serve Buyers

On search, social and retail platforms the advertiser sets a budget in money, not a goal in impressions, and the platform paces spend while its bidding optimizes the outcome. The control problem is the same; the promise is different.

**The budget is an average.** Google Ads lets a day spend up to "two times your average daily budget for most campaigns" and caps the month at "30.4 times"; Meta, since Marketing API v24.0, lets a day spend up to 75% over and caps the Sunday-to-Saturday week at seven times ([Budgets](/books/advertising/campaigns-and-line-items#budgets)). The pacer's job is to put the spend on the days and hours where the outcome is cheapest while staying inside the period's cap, which is why Google says standard delivery "takes into account expected ad performance throughout the day".

**The cap is enforced on billing, the pacing on the fast count.** A self-serve pacer that reads only the billed number overruns: clicks keep arriving after the budget is hit. Track spend in flight (committed by won auctions not yet billed) and stop bidding before the cap, with margin for in-flight wins. A small overrun from wins in flight is normal; Ad Manager describes the same thing, a cap exceeded "by a small amount" because of simultaneous requests. Whether the platform charges the overrun or absorbs it is a billing policy that should be written down (Billing & Invoicing, in Contracts and Money).

**Budget changes reset the plan.** A budget raised mid-day changes what the rest of the day may spend; Monetize treats "a budget ... increased mid-flight" as entering catch-up. Store budget changes with their effective time and recompute the plan from the change.

## Frequency Capping

A frequency cap limits impressions (or views, or clicks) per person per period: three a day, ten a week, one per session for a video pre-roll. It protects the viewer from repetition and the advertiser from paying for the fifth view that does nothing.

**What platforms offer.** Ad Manager allows "up to 10 frequency caps per line item", over periods from an hour to "monthly or lifetime", plus caps on creatives sharing a label within a set of ad slots and period, and applies "the more restrictive rule" when two caps apply. Google Ads offers caps "per day, week, or month" on Display at the campaign, ad group or ad, and on Video only at the campaign level, counting impressions or views. DV360's API carries a frequency cap object counting impressions (or, on YouTube, views) over minutes, hours, days, weeks or a month. Caps nest: a campaign cap of 10 a week and a line item cap of 3 a day both apply.

**The identifier.** A cap counts per person, so it needs to recognize the person across requests:

- Ad Manager: "Time-based frequency capping requires availability of a user identifier, which could be a USERID or a PPID", and "If a time-based cap is set without an available identifier, the line item is not eligible to serve." Video pod and stream caps are the exception: the line item "may still serve even when an identifier is not present".
- On mobile websites, Ad Manager notes, "frequency caps are only effective within a single domain, not across domains"; in apps without a device identifier, Ad Manager "may use a first-party ID" and caps work "within a single app, not across apps".
- Google Ads video caps "apply to signed in users, or to devices if the user is signed out".

So a cap's reach is the identifier's reach: a signed-in platform caps across devices, a publisher with a first-party ID caps across its own pages, a buyer across many publishers with no shared ID caps per site at best. That is the practical case for identity graphs and publisher-provided IDs (Identifiers After Cookies, in Identity and Audiences), and also the reason a cap set by a buyer is honored only as well as the identifiers it can see. Storing and reading an identifier for capping is itself processing that needs the consent state's permission where consent is required ([Consent Before Collection](/docs/telemetry/consent-and-privacy#consent-before-collection)); without it, the line item should either serve uncapped where the advertiser allows or not serve, and the choice is the advertiser's, recorded on the line item.

**Counting the cap.** The counter is incremented by impressions, not by decisions: a decision whose creative never renders didn't use up the viewer's exposure. Ad Manager applies caps "based on code served by default", and uses the impression instead when the impression is delayed more than 60 seconds; it notes a cap of 5 a day can occasionally show 6 "in rare cases such as a new Chrome session", and that caps on roadblocked line items "count page views instead of individual ad impressions" (a three-creative roadblock capped at 6 lifetime shows 18 impressions). The engineering choice is the same: increment at serve time for speed, correct from impressions, and accept a small overshoot from requests in flight.

**Storing the counts.** A frequency counter is a key (identifier, cap scope such as line item or campaign or label, window) and a count with an expiry at the window's end, read on every request and written on every impression. That is a key-value store with TTLs, not a relational table: the access pattern is millions of point reads per second, and the data should expire on its own. Hash the identifier into the key so the store never holds the raw ID, and expire by the longest window in use ([Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous)). Lifetime caps make counts long-lived; a campaign with a lifetime cap should keep its counts only for its flight plus a margin.

**Forecasting ignores some caps.** Ad Manager's forecasts don't capture "monthly or lifetime frequency caps", so "forecasting can overpredict" for line items that have them. A cap shrinks the supply a line item can buy, and a booked guarantee with a tight cap needs more inventory than its impression goal suggests (Forecasting & Avails covers the arithmetic).

## Over- and Under-Delivery

Pacing ends in one of three states: on goal, over or under. Each has a rule.

**Over-delivery.** Impressions beyond the goal are, for the publisher, inventory given away; for the buyer, free. The IAB/4A's terms set the limit when the agency uses a third-party ad server: the media company "will not bonus more than 10% above the Deliverables specified on the IO without the prior written consent of Agency", the agency "will not be charged ... for any additional Deliverables above any level guaranteed or capped", and once the agency says the cap is reached, the media company must suspend delivery and, within 48 hours, either serve further ads itself or pay the incremental third-party serving charges for over-delivery more than 10% above the cap. Without a third-party ad server, the publisher "may bonus as many ad units as Media Company chooses". The pacing controller's headroom (Ad Manager's 5%, Monetize's 105%) sits inside the 10%; a delivery system that routinely ends 12% over is giving away inventory and exposing the publisher to serving charges.

**Under-delivery.** The terms require the publisher to monitor delivery and notify the agency "as soon as possible (and no later than 14 days before the applicable IO end date unless the length of the campaign is less than 14 days)" if under-delivery is likely. That is a pacing alert with a contractual deadline: a guaranteed line item projected to end short must raise a notice at least 14 days before its end, which means the projection has to run daily from the start of the flight, not only near the end.

**Discrepancy as under-delivery.** When the controlling measurement is lower than the other by more than 10% over the invoice period and reconciliation fails, the agency may treat the gap as under-delivery and require a make-good "measured by the Third Party Ad Server", or pay on the controlling count "plus a 10% upward adjustment" ([A Direct-Sold Insertion Order](/books/advertising/advertising-business#a-direct-sold-insertion-order)). Pacing on the publisher's own count when the third party's count controls invites exactly this: the pacer thinks the goal is met while the billable count is short. When the third-party count controls and is known to run lower, pace toward a goal inflated by the observed gap.

## Make-Goods

A make-good is the remedy for a guaranteed shortfall: more delivery, later, to make up what was missed. Under the IAB/4A's terms, if "actual Deliverables for any campaign fall below guaranteed levels" or an ad was omitted, the agency and the media company "will use commercially reasonable efforts to agree upon the conditions of a makegood flight"; "If no makegood can be agreed upon, Agency may execute a credit equal to the value of the under-delivered portion of the IO"; if the agency prepaid and is current, it may take a refund instead; and the media company may not extend any ad beyond the IO's period without the agency's written consent. For CPA, CPL and CPC deliverables "guaranteed delivery, even delivery, and makegoods are not available".

In the system a make-good is:

- **A new line item, linked to the one it makes good,** with the shortfall as its goal, its own flight (agreed with the buyer) and usually the same targeting, at a zero rate, because the original line item's rate already priced those impressions. It should not be the original line item with its end date moved: the original's delivery and its shortfall stay as they were, and the make-good's delivery is reported against the shortfall.
- **Or a credit,** an invoice line of kind `make_good_credit` for the value of the shortfall at the booked rate, when no make-good flight is agreed ([The Core Data Model](/books/advertising/advertising-business#the-core-data-model)).
- **Measured on the controlling count.** A make-good owed because the third-party count was short is delivered until the third-party count closes the gap.

Linear TV, where make-goods for audience shortfalls on guaranteed ratings are routine, is covered in Linear TV, Upfronts & Addressable TV, in Channels; the contract terms are in Insertion Orders & Standard Terms.

## How to Build It

These are deltas against [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The core gives `line_items.pacing` (`even`, `front_loaded`, `asap`) and `frequency_caps` as JSONB; this chapter adds the pacing period, catch-up mode, headroom and daily caps on the line item, a schema for the caps, the pacing snapshots the controller writes, delivery projections with their under-delivery notices, and make-goods. Frequency counts live in a key-value store; their key shape is given in the design notes.

```sql
-- How a line item paces, beyond its speed.
ALTER TABLE line_items
  ADD COLUMN pacing_period TEXT NOT NULL DEFAULT 'flight',
  ADD COLUMN catch_up TEXT NOT NULL DEFAULT 'asap',
  ADD COLUMN pacing_headroom_bp INT NOT NULL DEFAULT 500,  -- 500 = aim 5% ahead
  ADD COLUMN daily_max_micros BIGINT,
  ADD COLUMN daily_max_impressions BIGINT,
  ADD COLUMN grace_period_days SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN cap_without_identifier TEXT NOT NULL DEFAULT 'do_not_serve',
  ADD COLUMN makes_good_line_item_id UUID;               -- set on a make-good line item

ALTER TABLE line_items ADD CONSTRAINT line_items_pacing_period_check
  CHECK (pacing_period IN ('daily', 'flight')) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_catch_up_check
  CHECK (catch_up IN ('asap', 'even', 'none')) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_headroom_check
  CHECK (pacing_headroom_bp BETWEEN 0 AND 1000) NOT VALID;  -- inside the 10% bonus limit
ALTER TABLE line_items ADD CONSTRAINT line_items_grace_check
  CHECK (grace_period_days BETWEEN 0 AND 7) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_cap_without_id_check
  CHECK (cap_without_identifier IN ('do_not_serve', 'serve_uncapped')) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_frequency_caps_shape_check
  CHECK (jsonb_typeof(frequency_caps) = 'array'
         AND jsonb_array_length(frequency_caps) <= 10) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_makes_good_fk
  FOREIGN KEY (makes_good_line_item_id) REFERENCES line_items (id) NOT VALID;

-- One row per line item per control interval: what was planned, delivered, and decided.
CREATE TABLE pacing_snapshots (
  line_item_id          UUID NOT NULL,
  interval_start        TIMESTAMPTZ NOT NULL,   -- e.g. every 5 or 10 minutes
  day_goal              BIGINT NOT NULL,        -- impressions or micros, per the goal's unit
  goal_unit             TEXT NOT NULL CHECK (goal_unit IN ('impressions', 'clicks',
                          'views', 'micros')),
  planned_to_date       BIGINT NOT NULL,        -- today's plan through this interval, by traffic shape
  delivered_to_date     BIGINT NOT NULL,        -- the provisional count the controller used
  in_flight             BIGINT NOT NULL DEFAULT 0,  -- won, not yet counted
  participation_rate_ppm INT NOT NULL CHECK (participation_rate_ppm BETWEEN 0 AND 1000000),
  opportunity_cost_cpm_micros BIGINT,           -- guaranteed line items in a publisher ad server
  satisfaction_bp       INT,                    -- delivered / planned, 10000 = on plan
  controller_version    TEXT NOT NULL,
  PRIMARY KEY (interval_start, line_item_id)
) PARTITION BY RANGE (interval_start);

-- The daily projection, and the under-delivery notice the IO terms require.
CREATE TABLE delivery_projections (
  line_item_id         UUID NOT NULL REFERENCES line_items (id),
  as_of_day            DATE NOT NULL,           -- in the line item's time zone
  goal_quantity        BIGINT NOT NULL,
  delivered_controlling BIGINT NOT NULL,        -- on the controlling measurement, as far as known
  projected_final      BIGINT NOT NULL,
  projected_shortfall  BIGINT NOT NULL DEFAULT 0,
  notice_due_by        DATE,                    -- 14 days before end, for IAB/4A's terms
  notice_sent_at       TIMESTAMPTZ,
  PRIMARY KEY (line_item_id, as_of_day)
);

-- A shortfall and how it was settled.
CREATE TABLE make_goods (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  original_line_item_id UUID NOT NULL REFERENCES line_items (id),
  insertion_order_id    UUID REFERENCES insertion_orders (id),
  reason                TEXT NOT NULL CHECK (reason IN ('under_delivery', 'omission',
                          'discrepancy', 'reporting_failure', 'other')),
  shortfall_quantity    BIGINT NOT NULL CHECK (shortfall_quantity > 0),
  measured_on           TEXT NOT NULL CHECK (measured_on IN ('first_party',
                          'third_party_ad_server', 'measurement_vendor')),
  remedy                TEXT NOT NULL CHECK (remedy IN ('makegood_flight', 'credit',
                          'refund', 'pending')),
  makegood_line_item_id UUID REFERENCES line_items (id),
  invoice_line_id       UUID REFERENCES invoice_lines (id),  -- the credit or refund line
  agreed_at             TIMESTAMPTZ,
  agreed_by_buyer_ref   TEXT,                   -- the written consent, as the terms require
  status                TEXT NOT NULL CHECK (status IN ('proposed', 'agreed', 'delivering',
                          'settled', 'disputed')),
  CHECK (remedy <> 'makegood_flight' OR makegood_line_item_id IS NOT NULL),
  CHECK (remedy NOT IN ('credit', 'refund') OR status NOT IN ('settled')
         OR invoice_line_id IS NOT NULL)
);
```

The caps JSONB follows one shape per element, validated in the application on save:

```json
[
  {"events": 3, "per": {"unit": "day", "count": 1}, "scope": "line_item", "counts": "impression"},
  {"events": 10, "per": {"unit": "week", "count": 1}, "scope": "campaign", "counts": "impression"},
  {"events": 1, "per": {"unit": "pod", "count": 1}, "scope": "line_item", "counts": "impression"}
]
```

Design notes:

- **Pacing output is a log, not a column.** `pacing_snapshots` keeps what the controller planned, saw and decided each interval, with the controller version, so "why did my line item stop at 2 p.m.?" is answered by reading the interval where the rate dropped. It is hourly-partitioned like the other logs and kept for the flight plus the dispute window.
- **Rates in parts per million, not floats.** `participation_rate_ppm` keeps the rate exact and comparable across controller versions; the serving path converts once.
- **Headroom is bounded by the contract.** `pacing_headroom_bp` can't exceed 1,000 basis points so the controller's deliberate overshoot never crosses the IAB/4A's 10% bonus limit on its own; ending over goal beyond that is an incident, not a setting.
- **Projections carry the notice.** `delivery_projections` runs daily from day one on the controlling count where it is known, computes the shortfall, and sets `notice_due_by` 14 days before the end date so the under-delivery notice the terms require is a scheduled obligation the system can show it met ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **A make-good is a separate line item.** `makes_good_line_item_id` links it back; the original keeps its own flight and shortfall. Its rate is zero, so it adds delivery without adding revenue, and its `delivery_daily` rows are reported against the shortfall.
- **Every remedy is traceable to money.** A credit or refund make-good points at its invoice line; a settled credit without one fails the check.
- **The cap without an identifier is the advertiser's choice.** `cap_without_identifier` records whether a capped line item serves uncapped or not at all when no identifier is available or the consent state forbids using one; Ad Manager's default is not to serve.
- **Frequency counts are keys with TTLs.** In the key-value store, `fc:{hash(identifier)}:{scope}:{scope_id}:{window_start}` holds a count and expires at the window's end; the identifier is hashed with a per-platform key so the store holds no raw IDs, and lifetime-cap keys expire at the flight's end plus a margin. Counts increment on serve for speed and are corrected from impressions when the serve-to-render gap is long.
- **The grace period is bounded and consented.** `grace_period_days` is at most 7, matching the longest grace any platform documents, and using it extends the flight, which under the IAB/4A's terms needs the buyer's written consent recorded on the insertion order.

## Auditing

- **Plan against delivery, by interval.** Every line item's planned and delivered counts and its participation rate per interval, with the controller version, so pacing complaints and over-delivery incidents can be reconstructed.
- **Projections and notices.** The daily shortfall projection and when the under-delivery notice was sent, against the 14-day deadline.
- **Make-goods and their remedies.** Each shortfall, the count it was measured on, the remedy agreed, the buyer's consent, and the line item or invoice line that settled it.
- **Caps and their identifiers.** The caps on each line item version and how it behaved without an identifier, so a frequency complaint is judged against what was configured and what identity was available.

## What This Means for the System You Build

- **Throttle participation to pace, and set the price separately;** in a publisher ad server, let the guaranteed line item's opportunity cost be the price lever.
- **Plan against a traffic shape,** compare against a fast provisional count, damp the controller, and allocate budget to serving nodes rather than sharing a counter.
- **Make catch-up and end-of-flight behavior explicit settings,** and bound headroom inside the contract's bonus limit.
- **Project delivery daily from the first day** and send under-delivery notices before the contract's deadline.
- **Count frequency on impressions with an identifier the consent state allows,** keep counts in a TTL store under hashed keys, and record what happens when no identifier is available.
- **Book make-goods as linked zero-rate line items or as credits,** measured on the controlling count, with the buyer's consent recorded.

## References

**Specifications**

- [IAB/4A's: Standard Terms and Conditions for Internet Advertising, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), under-delivery notice 14 days before the end, the makegood procedure, credits and refunds, the 10% bonus limit and 48-hour suspension, no makegoods for CPA, CPL and CPC deliverables, discrepancy as under-delivery

**Reference**

- [Xu et al.: Smart Pacing for Effective Online Ad Campaign Optimization (KDD 2015)](https://arxiv.org/abs/1506.05851), probabilistic throttling against bid modification, pacing rates per request group, adjustment per time slot

**In practice**

- [Google Ad Manager: Delivery speed](https://support.google.com/admanager/answer/82244?hl=en), evenly up to 5% ahead, frontloaded up to 40% early, as fast as possible
- [Google Ad Manager: Pacing](https://support.google.com/admanager/answer/2669484?hl=en), the satisfaction index, traffic shape, next-day catch-up and its example, the final hour, changes taking up to 48 hours, small overruns
- [Google Ad Manager: Delivery grace period](https://support.google.com/admanager/answer/1387903?hl=en), up to 7 days, as fast as possible, Ad Manager 360 only
- [Google Ad Manager: Frequency capping](https://support.google.com/admanager/answer/82242?hl=en), up to 10 caps, the identifier requirement, single-domain and single-app scope, roadblocks, forecasting overpredicting with monthly and lifetime caps
- [Microsoft Monetize: Guaranteed delivery pacing](https://learn.microsoft.com/en-us/xandr/monetize/guaranteed-delivery-pacing), the two levers, the 105% default, bidders sleeping when ahead, pCPM recalculation and 15-minute budget updates, even and ASAP catch-up and their examples, no end-of-flight behavior
- [Microsoft Monetize: Guaranteed delivery auction mechanics](https://learn.microsoft.com/en-us/xandr/monetize/guaranteed-delivery-auction-mechanics), choosing among guaranteed line items by distance from goal
- [Display & Video 360 API: Pacing](https://developers.google.com/display-video/api/reference/rest/v4/Pacing), pacing periods, ASAP, even and ahead, daily maximums
- [Display & Video 360 API: FrequencyCap](https://developers.google.com/display-video/api/reference/rest/v4/FrequencyCap), time units and impression or view caps
- [Google Ads: All campaigns will now use Standard delivery](https://support.google.com/google-ads/answer/9712796?hl=en), accelerated delivery removed for Display, Video, App and Hotel from April 2020, standard delivery considering expected performance
- [Google Ads: Changes to ad delivery methods (2019)](https://support.google.com/google-ads/answer/9448876), accelerated delivery removed for Search, Shopping and shared budgets and the reason given
- [Google Ads: Average daily budgets](https://support.google.com/google-ads/answer/6385083?hl=en), two times on a day and 30.4 times in a month
- [Google Ads: Frequency capping](https://support.google.com/google-ads/answer/117579?hl=en), Display and Video caps, levels and signed-in users
- [Meta Marketing API: Version 24.0 changelog](https://developers.facebook.com/documentation/ads-commerce/marketing-api/marketing-api-changelog/version24.0), 75% daily flexibility and the seven-times weekly cap
