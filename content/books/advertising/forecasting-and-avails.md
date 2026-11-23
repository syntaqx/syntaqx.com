+++
title = "Forecasting & Avails"
description = "Inventory forecasting for guaranteed sales: availability checks, matched, available and contended units, overbooking, proposal holds and allocation plans."
category = "Advertising Industry"
order = 2909
part = "Ad Serving and Creative"
tags = ["advertising", "ad-tech", "ad-serving", "forecasting", "guaranteed-delivery", "data-model"]
+++

A publisher that sells a guaranteed line item promises impressions it doesn't have yet: two million impressions on the sports section to men in California during the playoffs, delivered evenly, at a fixed CPM, with a make-good if it falls short. "Avails" (available impressions) is the answer to whether it can make that promise. The forecast behind it predicts how many future ad requests will match the targeting, then subtracts what other guaranteed line items will take from the same requests, then says how much is left to sell without hurting anyone already booked. Every direct-sold campaign starts with that check, and every proposal sent to a buyer is a bet on it.

It is hard for three reasons. Traffic is seasonal, trending and lumpy, so the forecast is a prediction of a distribution, not a count. Contracts overlap: the playoff line item competes with a sitewide sponsorship, a California auto campaign and a sports video package for some of the same impressions, so availability for one depends on how the ad server will allocate the others, which is a simulation, not a subtraction. And the answer changes while a salesperson is holding it: a proposal sent on Monday may describe inventory a competing proposal reserved on Tuesday. Forecasting systems are therefore three things at once: a traffic model, a simulator of the ad server's own decisions, and a reservation ledger.

This chapter covers how forecasts are built (history, seasonality, the simulation), what they report (matched, available, possible and contended impressions), availability versus delivery forecasts, contention, overbooking, reservations and holds before an insertion order is signed, and the allocation plans from the public research that turn a forecast into serving decisions. It extends `ad_units` and `line_items` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The ad server's decisioning and priority classes are [Ad Servers](/books/advertising/ad-servers); line item structure and targeting expressions are [Campaigns & Line Items](/books/advertising/campaigns-and-line-items); pacing a booked line item and frequency caps are [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency); programmatic guaranteed deals as a trading arrangement are [Deals, PMPs & Curation](/books/advertising/deals-and-curation); and the contract an availability check supports is [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms). The generic model of requests, holds, bookings and overbooking is the playbook's [Reservations & Holds](/docs/building-blocks/reservations-and-holds), which this chapter applies to impressions.

## How the Platforms Do It

As of November 2026, from each ad server's documentation:

| Ad server | Forecast basis | What it reports | Horizon | Notes |
| --- | --- | --- | --- | --- |
| **Google Ad Manager** | Unsampled traffic "from the last 24 months or more," sampled recent ad characteristics, seasonality; a simulation against booked line items | Matched, available and possible units; delivered and reserved units; contending line items on request; future sell-through across the network | Check inventory up to two years; sell-through reports 90 days daily or one year monthly | Monthly and lifetime frequency caps "are not captured," so forecasts "can overpredict"; wait 28 days after adding ad units, sizes or key-values |
| **Kevel** | A 90-day ramp-up of history, with seasonality and trend | Past and forecast daily "selection opportunities" with upper and lower bounds | 90 days | Beta; dimensions limited to the top 25 values |
| **Microsoft (Ad Server)** | Log-level, per-impression data, "rather than on sampling"; simulates "how the ad server will behave in future auctions" | Capacity, availability, contention, delivery | Up to 15 months | Daily granularity; frequency caps and roadblocks included; vCPM line items forecast in viewable impressions |

The convergence is clear: every ad server that sells guarantees forecasts from its own logs, simulates its own allocation rather than subtracting bookings, and reports at least two numbers, what matches and what is still free. The differences are in horizon, granularity, and which constraints the simulation models (frequency caps, roadblocks, viewability).

## Building a Forecast

A forecast has two layers: a model of future supply and a simulation of how that supply will be divided.

**Supply.** Google Ad Manager builds future volumes from unsampled traffic over "the last 24 months or more," adds "sampled ad characteristics from the more recent past" for detail, and accounts for seasonal trends. Kevel needs a 90-day ramp-up of history and forecasts "the unique seasonality of your data and its current trend," limiting a dimension with more than 25 values to its top 25. Microsoft's forecasting adjusts automatically to seasonal patterns and adds "spike detection and mitigation." The practical rules follow from the history requirement: a new ad unit, size or key-value has no history, so Ad Manager recommends waiting 28 days after adding one before relying on its forecasts, and notes that pre-tagging a site before launch gives forecast data from the start. A forecast for targeting the system has never seen (a new audience segment, a new section) is a guess, and the system should say so rather than return a number.

**Demand and the simulation.** Ad Manager's check inventory runs the proposed line item through a simulation of the ad server against booked line items: it first places the line item at "an artificially lowered priority" below all the others so that it can't take impressions from them, then reruns the simulation at its actual priority, and compares the two. Microsoft's engine likewise simulates future auctions with "low-level knowledge of the ad server's behavior" for guaranteed delivery, targeting and pacing. The two runs answer different questions: the first says what the line item can get without disturbing anyone (available), the second what it could get by taking from equal and lower priority line items (possible).

**Sampling.** Forecast simulations run on samples of traffic, not every request. Ad Manager says projections "reference a sample of the overall data" and are "not guaranteed"; Microsoft says its forecasts are based on log-level data "rather than on sampling," and the Yahoo allocation research (below) runs its offline phase on a sample of visits. Whichever it is, a forecast of a narrow targeting combination on a small site is a small sample with a wide error band, and Kevel reports upper and lower bounds for that reason.

**What a forecast ignores.** Each ad server documents its blind spots, and those are where forecasts go wrong. Ad Manager's forecasts don't capture monthly or lifetime frequency caps, so a capped line item "can overpredict," while check inventory does account for creative count and other serving restrictions such as frequency capping. Microsoft forecasts daily, so "individual start and end times are not considered." Neither can know about a news event. My rule is to store, with every forecast, which constraints the forecaster modeled, so the person reading a 2-million-impression availability knows whether the frequency cap was in it.

## What a Forecast Reports

Ad Manager's API defines the numbers most precisely, and the other ad servers report close equivalents:

- **Matched units:** "The number of units ... that match the specified targeting and delivery settings." All the future impressions the line item could serve on, ignoring competition.
- **Available units:** the number "that can be booked without affecting the delivery of any reserved line items." Exceeding it "will not cause an overbook, but lower priority line items may not run."
- **Possible units:** "The maximum number of units" the line item could get; "Booking this number may cause lower priority line items and some same priority line items to underdeliver."
- **Delivered units:** what has already served, when the line item is running.
- **Reserved units:** the quantity requested, absolute or a percentage.
- **Contending line items:** the booked line items competing for the same impressions, with how much each contends for.

The unit is the line item's goal unit: impressions, clicks or, for viewable CPM, viewable impressions, which Microsoft forecasts directly for vCPM line items. Microsoft's terms are **capacity** ("the total amount of inventory"), **availability** (inventory "that isn't already booked and matches the proposed targeting and flight dates"), **contention** (the number of line items competing for it) and **delivery** (whether the line item will deliver in full), with the warning that availability for a standard (non-guaranteed) line item is computed "from the perspective of a guaranteed line item" and shouldn't be relied on.

One detail trips up anyone building one: a roadblock (several creatives that must serve together) is limited by its scarcest slot: Microsoft computes capacity and availability per creative, takes the lowest, and multiplies by the number of creatives.

### Availability versus delivery forecasts

Ad Manager's API separates two forecasts. An **availability forecast** "reports the maximum number of available units with which the line item can be booked," one line item (existing or prospective) at a time. A **delivery forecast** simulates "the delivery of multiple competing line items," accounting for the displacement between them, which is not the same as running several availability forecasts and adding them up. A salesperson checking one proposal line item wants the first; a planner checking whether a set of proposals can all be booked together, or an ad ops lead checking whether the booked book will deliver, wants the second. A prospective line item can be forecast "without persisting it," and setting the advertiser applies the network's blocking rules, so a forecast for a brand the publisher blocks on some sections excludes them. Forecasts are "computationally expensive," quota errors are expected, and the API can return `NO_FORECAST_YET` or `NOT_ENOUGH_INVENTORY` when history is thin.

### Check inventory versus sell-through

A network-wide view answers a different question from a per-line-item check. Ad Manager compares them: check inventory is "up to the minute," looks up to two years ahead, accounts for creative count and frequency capping, includes manual and historical adjustments, and simulates in real time for the line item's dates; future sell-through reports update daily, cover 90 days at daily or one year at monthly granularity, count only rows that match their filters, skip adjustments and use data simulated over 18 months, so they "are more likely to overestimate available inventory." (Google's page says its legacy Reports tool was to be "fully deactivated" in Q3 2026, with Interactive reports replacing it.) The lesson for any system: a dashboard of sell-through is for planning; the binding number for a booking is the per-line-item check, run at the moment of booking.

## Contention

Contention is the overlap between line items' eligible impressions. Ad Manager counts standard and sponsorship line items as contending when they compete for the same forecast impressions, shows them in check inventory (omitting any with fewer than 100 contending impressions, and at most 3,000), and in the API returns them only on request (`includeContendingLineItems`). Microsoft's forecasting pane lists contending line items filterable by priority.

Contention is what makes availability a simulation. Suppose a site has 10 million sports impressions next month and two booked line items: a sitewide sponsorship (higher priority) taking 20% of all impressions, and a California auto campaign (same priority as the new one) for 1.5 million impressions, half of which could come from sports. The new playoff line item's available sports impressions are not 10 million minus the bookings' totals; they are what is left after the simulation lets the sponsorship take its share everywhere and the auto campaign take what it needs, from sports or elsewhere, by the ad server's own allocation rules. If the auto campaign can be satisfied outside sports, the playoff line item is barely contended; if California sports is its only path, it is heavily contended. The contention list tells the seller which line items to move, extend or renegotiate to free inventory.

Contention also has a delivery-time face. Ad Manager's forecasting FAQ distinguishes "Available" and "Likely to deliver" (impressions a line item would win "without impressions that would be taken away from contending line items") from "Expected to deliver" in underdelivery views, counted "including impressions that would be taken away from contending line items" and so more aggressive. A booked line item that underdelivers is usually losing to a contender, and the contention view is where ad ops looks first.

## Overbooking

Overbooking is booking more than is available. Ad Manager states the consequence plainly: "overbooking one reservation impacts all existing reservations that are at equal or lower priority," because the system tries to complete all existing reservations, so a new booking can reduce the availability shown for older ones. Booking above available but within possible means lower priority (and some same priority) line items may underdeliver; booking above possible means the new line item itself won't deliver in full. The API's reservation action "does not overbook inventory unless allowOverbook is set to true," which makes overbooking an explicit act rather than an accident.

Publishers overbook deliberately for the same reason airlines do: forecasts carry error, some booked campaigns pause or cancel, and unsold guaranteed inventory is worth less sold remnant. The playbook's rule applies directly: overbooking is "a policy, not a bug," modeled as a capacity number set from measured error rather than a hole in the constraint, with the consequence decided in advance ([Overbooking Is a Policy, Not a Bug](/docs/building-blocks/reservations-and-holds#overbooking-is-a-policy-not-a-bug)). In advertising the consequence is a make-good: extra delivery, an extended flight or a credit when a guaranteed line item underdelivers, which [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency) and [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms) cover. My default is that only a named role can overbook, the overbook is recorded with its percentage over available and the forecast it was judged against, and a report of overbooked line items and their delivery risk runs daily until the flights end.

## Reservations and Holds Before Signature

Between "the buyer is interested" and "the IO is signed" there are days or weeks, and the inventory has to be held or it will be sold to someone else. Ad Manager's proposals allow reserving inventory "at any time during the negotiation process for guaranteed campaigns," for all proposal line items or selected ones; if the seller doesn't, Ad Manager creates the order and line items and "reserves inventory when the buyer accepts a proposal." Reserved inventory can be released, and "pausing line items doesn't release inventory." Programmatic guaranteed works the same way at the deal level: "Programmatic Guaranteed campaigns have inventory reserved only for the buyer in the deal," at the agreed price, while a preferred deal's inventory "isn't reserved for the buyer" and "Buyers aren't required to buy the inventory."

The playbook's three states map exactly ([Requests, Holds and Bookings](/docs/building-blocks/reservations-and-holds#requests-holds-and-bookings)):

- **Request:** an availability check on a prospective line item. It claims nothing.
- **Hold:** a reservation on a proposal line item during negotiation. It claims impressions from the forecast, so other checks see less available, and it has an expiry.
- **Booking:** the signed IO's line item, reserved for its flight.

Ad Manager's public documentation doesn't state an expiry for proposal reservations, so the hold lifetime is the publisher's policy, which the playbook says to store per hold, computed from a per-channel policy rather than a constant ([Hold Lifetimes Are Policy](/docs/building-blocks/reservations-and-holds#hold-lifetimes-are-policy)), and to enforce on read so an expired hold stops blocking availability the moment it lapses ([Expiry Is Enforced on Read](/docs/building-blocks/reservations-and-holds#expiry-is-enforced-on-read)). A hold of impressions differs from a hold of a hotel room in one way: it is a claim on a forecast, so the "capacity" it draws from moves every night as the forecast is recomputed. A hold that was within available on Monday can be an overbook on Thursday without anyone booking anything, because traffic came in under forecast. The reservation therefore records the forecast it was judged against, and a daily job re-checks live holds and bookings and flags the ones now over.

## Allocation Plans

A forecast says whether the book fits; something must then decide, impression by impression, which guaranteed line item gets each one, so that every contract delivers and none takes impressions another needs. Ad servers do this with an allocation plan computed offline from the forecast and consulted at serve time. The public research on this problem, from Yahoo's guaranteed display business, is the best description of how it works.

**The model.** Chen et al. model allocation as a bipartite graph: supply nodes are forecast user visits, each with total supply s_i ("Each node on the supply side is annotated with the total forecasted number of visits"), demand nodes are contracts with demand d_j, and an arc joins a visit to each contract it can satisfy. The offline phase runs on a sample of visits. The goal is a plan that is small enough to ship to every ad server and stateless enough that servers don't coordinate per impression.

**Optimal online assignment with forecasts.** Vee, Vassilvitskii and Shanmugasundaram (EC 2010) formulate "the online assignment with forecast problem," motivated by ad allocation for display publishers, and give a solution that serves users online in a way that is "provably nearly optimal," describing the primal solution compactly through a subspace of the dual.

**High Water Mark (HWM).** Chen et al. (2012) trade those guarantees for speed and simplicity. Contracts are ordered by eligible supply, scarcest first, because highly targeted contracts have less flexibility. With remaining supply r_i starting at s_i, each contract j in order gets a serving rate α_j solving Σ min(r_i, s_i·α_j) = d_j over its eligible visits (α_j = 1 if no solution exists), and the impressions it takes are subtracted from r_i before the next contract. The plan is two numbers per contract, the order and α_j, "O(1) space for contract," and "Finding an allocation plan takes only a few minutes, even with a billion arcs in the demand-supply forecast graph." At serve time, the ad server lists the matching contracts in allocation order and picks contract j with probability α_j, truncating when the rates sum past 1; when they sum to less than 1, the impression may go unallocated, to the non-guaranteed marketplace. A feedback loop regenerates the plan periodically from actual remaining demand.

**SHALE.** Bharadwaj et al. (2012) give a "compact allocation plan" that "uses just O(1) state per guaranteed contract, is robust to noise, and allows us to serve (provably) nearly optimally," with an optimization that is "scalable, with a small in-memory footprint," linear time per iteration, and "stop-anytime," so a time-critical run can stop early and still serve well.

A worked HWM example. Two supply nodes for next week: A (sports, California) with 100,000 impressions and B (sports, elsewhere) with 100,000. Contract 1 targets California sports and needs 40,000; contract 2 targets all sports and needs 120,000. Eligible supply is 100,000 for contract 1 and 200,000 for contract 2, so contract 1 goes first:

| Step | Contract | Solve | α | Remaining A | Remaining B |
| --- | --- | --- | --- | --- | --- |
| start | | | | 100,000 | 100,000 |
| 1 | 1 (needs 40,000 from A) | min(100,000, 100,000·α) = 40,000 | 0.4 | 60,000 | 100,000 |
| 2 | 2 (needs 120,000 from A and B) | min(60,000, 100,000·α) + min(100,000, 100,000·α) = 120,000 | 0.6 | 0 | 40,000 |

At serve time, an impression from A matches both contracts in order: contract 1 with probability 0.4, contract 2 with 0.6. An impression from B matches only contract 2: 0.6, and 0.4 unallocated. Expected delivery is 40,000 to contract 1 and 60,000 + 60,000 = 120,000 to contract 2, both exactly, and 40,000 of B left for non-guaranteed demand. The order is the point. If contract 1 needed 70,000 instead, scarcest-first gives it α = 0.7 (70,000 of A), and contract 2 then solves 30,000 + 100,000·α = 120,000 for α = 0.9, taking the last 30,000 of A and 90,000 of B: both deliver. Had the broad contract gone first at α = 0.6, it would take 60,000 of A, and contract 1 would find only 40,000 left.

The forecast and the plan are the same model seen from two ends: availability is "what would the plan give a new contract," and a booking changes the plan. That is why the reservation ledger, the forecast and the allocation plan belong in one system with one version of the book, and why an availability check run against yesterday's plan can be wrong today.

## How to Build It

The core's `ad_units` and `line_items` hold what is sold and booked; forecasting adds the checks, their results, the reservations and the plans. A check can be for an existing line item or a prospective one that isn't persisted, so the targeting and goal are snapshotted on the check:

```sql
CREATE TABLE availability_checks (       -- one request for a forecast; claims nothing
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  kind               TEXT NOT NULL CHECK (kind IN ('availability', 'delivery')),
  line_item_id       UUID REFERENCES line_items (id),   -- null: a prospective line item
  proposal_ref       TEXT,                 -- the proposal line item, before an IO exists
  advertiser_id      UUID REFERENCES advertisers (id),  -- applies blocking rules
  targeting          JSONB NOT NULL,       -- snapshot of the expression checked
  flight             TSTZRANGE NOT NULL,
  goal_unit          TEXT NOT NULL CHECK (goal_unit IN ('impressions', 'viewable_impressions',
                       'clicks', 'completed_views')),
  goal_quantity      BIGINT CHECK (goal_quantity > 0),
  priority           SMALLINT NOT NULL,
  frequency_caps     JSONB NOT NULL DEFAULT '[]',
  requested_by       TEXT NOT NULL,        -- typed actor: a seller, an API client, a nightly job
  requested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_forecasts (       -- the answer to one check, for one line item
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  availability_check_id UUID NOT NULL REFERENCES availability_checks (id),
  line_item_id        UUID REFERENCES line_items (id),  -- delivery forecasts answer for several
  status              TEXT NOT NULL CHECK (status IN ('ok', 'no_forecast_yet',
                        'not_enough_inventory', 'error')),
  matched_units       BIGINT,
  available_units     BIGINT,              -- bookable without affecting reserved line items
  possible_units      BIGINT,              -- may displace lower and same priority
  delivered_units     BIGINT,
  predicted_units     BIGINT,              -- delivery forecasts
  lower_bound_units   BIGINT,              -- where the forecaster reports an interval
  upper_bound_units   BIGINT,
  model_version       TEXT NOT NULL,       -- forecaster code and model
  traffic_as_of       TIMESTAMPTZ NOT NULL, -- the history the supply model used
  book_version        BIGINT NOT NULL,     -- the reservation ledger version simulated against
  modeled_constraints TEXT[] NOT NULL,     -- e.g. {'frequency_caps_daily','roadblocks','viewability'}
  computed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'ok' OR (matched_units IS NOT NULL AND available_units IS NOT NULL)),
  CHECK (available_units IS NULL OR possible_units IS NULL OR available_units <= possible_units)
);

CREATE TABLE forecast_contenders (       -- booked line items competing for the same impressions
  inventory_forecast_id UUID NOT NULL REFERENCES inventory_forecasts (id),
  line_item_id          UUID NOT NULL REFERENCES line_items (id),
  contended_units       BIGINT NOT NULL CHECK (contended_units >= 0),
  PRIMARY KEY (inventory_forecast_id, line_item_id)
);

CREATE TABLE inventory_reservations (    -- holds and bookings in one table, one ledger
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  line_item_id          UUID REFERENCES line_items (id),  -- set once the line item exists
  proposal_ref          TEXT,              -- the proposal line item while negotiating
  deal_id               UUID REFERENCES deals (id),       -- programmatic guaranteed
  status                TEXT NOT NULL CHECK (status IN ('held', 'confirmed', 'released',
                          'expired', 'completed')),
  goal_unit             TEXT NOT NULL,
  quantity              BIGINT NOT NULL CHECK (quantity > 0),
  flight                TSTZRANGE NOT NULL,
  hold_expires_at       TIMESTAMPTZ,       -- held only; from the hold policy
  basis_forecast_id     UUID NOT NULL REFERENCES inventory_forecasts (id),  -- judged against this
  overbook_units        BIGINT NOT NULL DEFAULT 0 CHECK (overbook_units >= 0),  -- above available at booking
  overbook_approved_by  TEXT,              -- a named role; required when overbooking
  reserved_by           TEXT NOT NULL,
  reserved_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at              TIMESTAMPTZ,
  CHECK (line_item_id IS NOT NULL OR proposal_ref IS NOT NULL OR deal_id IS NOT NULL),
  CHECK ((status = 'held') = (hold_expires_at IS NOT NULL)),
  CHECK (overbook_units = 0 OR overbook_approved_by IS NOT NULL)
);

CREATE TABLE allocation_plans (          -- the compact plan shipped to ad servers
  plan_version     BIGINT NOT NULL,
  line_item_id     UUID NOT NULL REFERENCES line_items (id),
  allocation_order INT NOT NULL,           -- scarcest eligible supply first
  serving_rate_ppm INT NOT NULL CHECK (serving_rate_ppm BETWEEN 0 AND 1000000),  -- alpha x 1,000,000
  remaining_goal   BIGINT NOT NULL,        -- demand the plan was solved for
  computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (plan_version, line_item_id),
  UNIQUE (plan_version, allocation_order)
);

ALTER TABLE ad_units ADD COLUMN forecast_ready_at TIMESTAMPTZ;  -- history long enough to trust
ALTER TABLE ad_units ADD COLUMN special BOOLEAN NOT NULL DEFAULT FALSE;  -- only when explicitly targeted
ALTER TABLE line_items ADD COLUMN reservation_id UUID;
ALTER TABLE line_items ADD CONSTRAINT line_items_reservation_fk
  FOREIGN KEY (reservation_id) REFERENCES inventory_reservations (id) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_guaranteed_reserved_check
  CHECK (delivery_type <> 'guaranteed' OR status IN ('draft', 'archived')
         OR reservation_id IS NOT NULL) NOT VALID;

CREATE INDEX CONCURRENTLY inventory_reservations_live_idx ON inventory_reservations
  USING gist (flight) WHERE status IN ('held', 'confirmed');
CREATE INDEX CONCURRENTLY inventory_forecasts_check_idx ON inventory_forecasts (availability_check_id);
CREATE INDEX CONCURRENTLY forecast_contenders_line_item_idx ON forecast_contenders (line_item_id);
```

What blocks inventory right now is confirmed reservations and unexpired holds, read with expiry in the predicate, the playbook's pattern:

```sql
SELECT r.*
FROM inventory_reservations r
WHERE r.flight && $1                       -- the window being checked
  AND (r.status = 'confirmed'
       OR (r.status = 'held' AND r.hold_expires_at > now()));
```

The daily re-check compares each live reservation's quantity with a fresh forecast and flags those now beyond available:

```sql
WITH latest AS (                           -- the newest nightly forecast per booked line item
  SELECT DISTINCT ON (f.line_item_id) f.line_item_id, f.available_units
  FROM inventory_forecasts f
  JOIN availability_checks c ON c.id = f.availability_check_id
  WHERE c.requested_by = 'job:nightly_recheck' AND f.status = 'ok'
  ORDER BY f.line_item_id, f.computed_at DESC
), delivered AS (
  SELECT line_item_id, SUM(impressions) AS delivered
  FROM delivery_daily
  WHERE source = 'first_party'
  GROUP BY line_item_id
)
SELECT r.id, r.line_item_id, r.quantity, COALESCE(d.delivered, 0) AS delivered, l.available_units
FROM inventory_reservations r
JOIN latest l ON l.line_item_id = r.line_item_id
LEFT JOIN delivered d ON d.line_item_id = r.line_item_id
WHERE r.status IN ('held', 'confirmed')
  AND upper(r.flight) > now()
  AND r.quantity - COALESCE(d.delivered, 0) > l.available_units;
```

Design notes:

- **A check claims nothing; a reservation claims a forecast.** `availability_checks` are requests in the playbook's sense: cheap, frequent, never blocking. `inventory_reservations` are the ledger, holds and bookings in one table, so one read decides what is taken. Confirming a hold is the same row moving to `confirmed` when the IO is signed, idempotently ([Confirming a Hold, Idempotently](/docs/building-blocks/reservations-and-holds#confirming-a-hold-idempotently)).
- **Every forecast says what it simulated against.** `book_version` is the ledger version (incremented on every reservation change), `traffic_as_of` the history, `model_version` the code, and `modeled_constraints` what the simulation honored. Two forecasts for the same targeting disagree for a reason, and these columns name it.
- **Store the snapshot, not a pointer.** A check on a prospective line item keeps its targeting, goal, priority and caps on the row, because the proposal will change and the forecast must stay explainable.
- **Overbooking is a recorded decision.** `overbook_units` above available at the moment of booking, with the approving role, is the policy made visible; a reservation without approval can't exceed available, the same as Ad Manager's reservation refusing to overbook unless told to.
- **Holds expire on read.** `hold_expires_at` is computed from the publisher's hold policy per channel (a direct sale and a programmatic guaranteed proposal may differ) and every availability read applies it, with a sweeper marking expired holds as housekeeping.
- **Re-check live reservations nightly.** Because capacity is a forecast, a reservation can become an overbook without anyone acting. The nightly job forecasts each booked line item for its remaining flight, so `available_units` is what it can still get, and compares that with what it still owes. The sketch assumes an impression goal and the first-party count; a viewable or click goal reads the matching `delivery_daily` column. The point is that the flag is computed and stored daily, not discovered at month end.
- **Allocation plans are versioned and small.** `allocation_plans` holds the order and α per line item (in parts per million) per version, which is what ad servers load; a new plan is a new version, and serving logs record the plan version so delivery can be explained against the plan in force.
- **New inventory isn't forecastable at once.** `ad_units.forecast_ready_at` marks when a unit has enough history (Ad Manager's guidance is 28 days), and the forecaster returns `no_forecast_yet` rather than a number for targeting that depends on newer units. `special` units count only when targeted explicitly, as Ad Manager treats them.
- **The guaranteed-must-be-reserved check is `NOT VALID`,** so historical line items without a reservation keep their state, while every new guaranteed line item beyond draft needs one ([Zero-Downtime Migrations](/docs/database/zero-downtime-migrations#lock-aware-ddl)).

## Auditing

- **Every availability check and its answer,** with the targeting snapshot, the book version, the traffic date, the model version and the constraints modeled, so "you told us 2 million were available" can be shown or refuted.
- **Every reservation's life:** held, extended, confirmed, released or expired, by whom and when, with the forecast it was judged against.
- **Every overbook,** its size above available, the approver and the reason, and the delivery outcome of every line item it put at risk.
- **Every allocation plan version** and which version each ad server loaded when, so underdelivery can be traced to the plan or to the forecast behind it.
- **Forecast accuracy over time:** predicted against delivered units by targeting class, which is what sets the overbooking allowance.

The mechanics (typed actors, append-only history) are in [Audit Trails](/docs/building-blocks/audit-trails#typed-actors).

## What This Means for the System You Build

- **Forecast from your own logs with enough history,** model seasonality and trend, and return "no forecast yet" for targeting you have no history for.
- **Simulate allocation, don't subtract bookings:** report matched, available and possible units and the contending line items, in the line item's goal unit.
- **Separate availability checks from delivery forecasts,** and use the per-line-item check at booking time, not a sell-through dashboard.
- **Keep holds and bookings in one reservation ledger,** with expiry enforced on read and confirmation as a state change on the same row.
- **Make overbooking an approved, recorded decision** sized from measured forecast error, with make-goods decided in advance.
- **Re-check live reservations against fresh forecasts daily,** because the capacity under them moves.
- **Ship compact, versioned allocation plans** to the ad servers and log which plan version served each impression.
- **Store with every forecast what it modeled and what it ignored,** frequency caps above all.

## References

**Reference**

- [Vee, Vassilvitskii and Shanmugasundaram: Optimal online assignment with forecasts (EC 2010)](https://www.sciweavers.org/node/152451), the online assignment with forecast problem, motivated by display ad allocation, and a provably nearly optimal online solution described through the dual
- [Chen et al.: Ad Serving Using a Compact Allocation Plan (arXiv, 2012)](https://arxiv.org/abs/1203.3593), guaranteed contracts, compact stateless allocation plans with O(1) space per contract
- [Chen et al.: Ad Serving Using a Compact Allocation Plan, full text](https://ar5iv.labs.arxiv.org/html/1203.3593), the supply forecast graph, the High Water Mark order and serving rates, online serving, the feedback loop and the few-minutes, billion-arc claim
- [Bharadwaj et al.: SHALE, an efficient algorithm for allocation of guaranteed display advertising (arXiv, 2012)](https://arxiv.org/abs/1203.3619), a compact allocation plan with O(1) state per contract, near-optimal serving, linear time per iteration and stop-anytime optimization

**In practice**

- [Google Ad Manager Help: How forecasting works](https://support.google.com/admanager/answer/7649125?hl=en), the 24-month history, seasonality, the lowered-priority simulation, available and matched results, sampling and the 28-day wait
- [Google Ad Manager Help: Frequency capping](https://support.google.com/admanager/answer/82242?hl=en), monthly and lifetime caps not captured in forecasts and overprediction
- [Google Ad Manager Help: Forecasting FAQ](https://support.google.com/admanager/answer/4395249), contending line items, the 100-impression and 3,000-item display limits, available versus expected to deliver, and overbooking's effect on equal and lower priority reservations
- [Google Ad Manager Help: Check inventory and future sell-through](https://support.google.com/admanager/answer/3096917), the two ways to predict availability, their freshness, horizons, adjustments and simulation, and the Reports deactivation
- [Google Ad Manager API: AvailabilityForecast](https://developers.google.com/ad-manager/api/reference/v202508/ForecastService.AvailabilityForecast), matched, available, possible, delivered and reserved units and contending line items
- [Google Ad Manager API: Forecasting](https://developers.google.com/ad-manager/api/forecasting), availability versus delivery forecasts, prospective line items, blocking rules, quota errors and NO_FORECAST_YET
- [Google Ad Manager Help: Reserve and release inventory in proposals](https://support.google.com/admanager/answer/7455776?hl=en), reserving during negotiation, automatic reservation on acceptance, releasing and pausing
- [Google Ad Manager API: ReserveProposalLineItems](https://developers.google.com/ad-manager/api/reference/v202408/ProposalLineItemService.ReserveProposalLineItems), no overbooking unless allowOverbook is set
- [Google Ad Manager Help: Programmatic Guaranteed vs. Preferred Deals](https://support.google.com/admanager/answer/7637485?hl=en), inventory reserved for the PG buyer and not for preferred deals
- [Kevel: Forecasting](https://dev.kevel.com/docs/forecasting), the 90-day ramp-up, seasonality and trend, top-25 dimension values, bounds and the 90-day horizon
- [Microsoft Learn: Inventory forecasting](https://learn.microsoft.com/en-us/xandr/monetize/inventory-forecasting), capacity, availability, contention and delivery, log-level data, the 15-month horizon, daily granularity, vCPM and roadblocks
