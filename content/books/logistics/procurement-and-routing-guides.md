+++
title = "Freight Procurement & Routing Guides"
nav_title = "Freight Procurement"
description = "How shippers buy freight capacity: annual RFPs and mini-bids, carrier responses, awards and business shares, routing guide waterfalls and compliance."
category = "Logistics & Supply Chain Industry"
order = 2830
part = "Planning and Execution"
tags = ["logistics", "procurement", "rfp", "routing-guide", "truckload", "data-model"]
+++

Freight procurement is how a shipper decides, ahead of time, which carriers will move each of its lanes and at what price. Once or twice a year it runs a bid: it lists its lanes with forecast volumes and requirements, invites carriers and brokers to price them, compares the answers, and awards each lane to a primary carrier and a ranked set of backups. The awards become contract rates, and the ranked carriers become the **routing guide**: the per-lane list the TMS tenders down when a load is ready. DAT describes routing guides as "the electronic catalogs that result from an RFP," which "specify which contracted carriers to give the first right of refusal (load tenders)" on each lane, and estimates that "between 80 and 90 percent, on average" of freight transactions are executed through contracts.

It is hard because the contract is binding on price but not on capacity. DAT notes freight contracts are "usually binding only in price": volumes are estimates made months ahead, and a carrier that won a lane can reject any individual tender, and when the market tightens it does. In the third quarter of 2026 carriers rejected 14.5% of contracted loads on average, up from 5.3% a year earlier, by SONAR's tender rejection index. Every rejection pushes the load one step down the routing guide, to a backup at a higher rate, and eventually to the spot market. A bid that takes "four months on average" to run, with rates the market renders "obsolete about six months after that in a typical year" (FreightWaves, 2021), is constantly being outrun, which is why shippers run mini-bids between annual bids and measure how well each award actually performs.

This chapter covers the annual RFP and its bid package, carrier responses and rounds, awards and business shares, mini-bids, routing guides and their waterfall, and compliance: whether carriers accept what they were awarded and whether the shipper's own planners tender to the guide. It extends `rate_agreements`, `lane_rates` and `tenders` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Pricing the awarded rates on each load is [Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials); sending a load down the guide is [Tendering & Acceptance](/books/logistics/tendering). A retailer's routing guide (the instructions a retailer gives its vendors for shipping inbound to it) is a different document with the same name, owned by the Commerce volume's [Routing Guides](/books/commerce/wholesale-and-retail-distribution#routing-guides).

## How the Platforms Do It

As of November 2026, from vendor documentation and published research:

| Source | Bid and award | Routing guide | What it says |
| --- | --- | --- | --- |
| **SAP** (S/4HANA Transportation Management, strategic freight procurement) | A "freight agreement master RFQ" built from historical transportation, grouped by trade lane, commodity code or mode; carriers assigned with target business shares; responses compared in "ranking lists" with suggested business shares; negotiation rounds; "one-click freight agreement creation" from the award | Carrier selection by priority or lowest cost, with business share targets, tolerances and penalties per carrier, trade lane and period, and allocation capacities "such as volume, weight, and 20-foot equivalent units" | "The shortage penalty costs are added to all carriers, other than the one selected," and excess penalties to the selected one; continuous moves limited to simple moves, round trips, none, or decided per transportation lane |
| **Blue Yonder** (Transportation Management) | "Transportation Procurement," with "bid management, optimization and rapid bid awards across every mode" | Not described on the page | "Accelerate value with smarter carrier sourcing" |
| **Trimble** | "Sourcing & Settlement": "Automated freight sourcing and auditing solutions"; for 3PLs and brokers, "intelligent procurement tools to source cost-effective carrier capacity" | Not described on the page | Separate from its carrier TMS lines |
| **C.H. Robinson with MIT's Center for Transportation and Logistics** (research, May 23, 2023) | Not applicable | Backup carriers work "only to a certain point"; in a tight market "the fourth backup carrier is the extent of a route guide's ability to support rejected tenders," in a loose one guides "fully perform by the second backup" | Going through the guide before spot may cost 23% to 35% more; recommends a spot provider with guaranteed capacity as second backup (C.H. Robinson sells that service) |
| **DAT** | Annual RFPs "often a year or two in advance of starting new contracts"; mini-bids "a scaled down version of the annual RFP" | "The electronic catalogs that result from an RFP" | Contracts bind on price, not volume |
| **SONAR** (FreightWaves) | Not applicable | Outbound tender rejection index, "a direct measure of carrier compliance" | Below 4% loosest; "a healthy supply-demand balance seems to exist when rejection rates fall between 5–7%"; above 20% tightest; 14.5% average in Q3 2026 and 12.87% on November 13, 2026 |

Four patterns:

- **An award is a ranked list with shares, not a single winner.** SAP stores target business shares with tolerances and penalties; the research measures performance by guide depth. A procurement model with one carrier per lane can't represent what shippers actually award.
- **Price binds; capacity doesn't.** Every source agrees the contract fixes the rate and leaves acceptance to the carrier, load by load. Procurement data is incomplete without the tender outcomes that show what the award was worth.
- **The guide's depth is finite and market-dependent.** Two backups suffice in loose markets, four in tight ones, and beyond that the spot market decides. The guide needs a defined end and a spot step, not an ever-longer list.
- **Bids are outrun, so they are run more often.** Annual bids take months and go stale in about six; mini-bids re-price volatile lanes in between. A procurement system has to handle several overlapping bid events, each awarding a subset of lanes for a different period.

## The Annual RFP

A freight RFP (request for proposal, or in SAP's term a freight agreement RFQ) is a structured offer to price a set of lanes for a period. The bid package carries:

- **Lanes.** Origin and destination at a stated granularity (facility, five-digit or three-digit postal code, city, state or region), equipment type, and any service variants (team, expedited, temperature range, drop trailer).
- **Volume.** Forecast loads per lane per period (week, month or year), usually from the prior year's history adjusted for plans. SAP's process analyzes historic transportation "as a forecast for the next period," grouped by "trade lane, commodity code, or transportation mode." The volume is a forecast, not a commitment, and the bid should say so.
- **Service requirements.** Transit time, pickup and delivery windows, live or drop handling, appointment practices, tracking and EDI or API requirements, insurance minimums.
- **Commercial terms.** The rate basis requested (flat, per mile, all-in), the fuel surcharge schedule that will apply on top (bidding linehaul against a shipper's fixed schedule makes bids comparable), the accessorial schedule, payment terms and the contract period.
- **Response rules.** Which lanes a carrier may decline, capacity commitments it can state (loads per week it will accept), and the deadline and rounds.

A broker running procurement for a shipper (managed transportation) runs the same event; an asset carrier answers them. The package is a versioned document: answers are valid only against the version they priced, and a clarification that changes a lane's volume or equipment invalidates the answers to it.

## Responses, Rounds and Award

Carriers answer lane by lane: a rate (or decline), the capacity they offer per period, and comments. The shipper normalizes responses (all-in versus linehaul plus fuel, flat versus per mile at the lane's miles) so they can be compared, and ranks them. SAP's process produces "ranking lists" and suggests "optimal business shares," and negotiation rounds with carriers can follow. A second round typically goes to a short list per lane with feedback (rank, or distance from the best rate) and asks for a revised rate.

The award decides, per lane:

- **The primary carrier** and its rate and committed capacity.
- **Backups in order,** each with its own rate (often higher), so the guide's cost of going deeper is known in advance.
- **Shares,** where volume is split: SAP's process assigns target business shares when the RFQ goes out and suggests optimal shares from the responses, and carrier selection then applies the target shares per carrier, trade lane and period, with a tolerance outside which penalty costs apply.
- **Incumbency and risk.** Award decisions weigh more than price: a carrier's tender acceptance history on the lane, its service performance, its share of the shipper's total freight (concentration risk) and the carrier's own compliance and safety status. My rule is that every non-lowest award records its reason, because the next bid's analysis asks why the shipper paid more.

The award becomes data in three places: a `rate_agreements` row per carrier for the period, `lane_rates` for each awarded lane at its rate, and a routing guide entry per lane and carrier with its position and share. SAP's "one-click freight agreement creation" is the vendor version of the same step.

## Mini-Bids

A mini-bid re-prices a subset of lanes between annual events: lanes where the primary is rejecting, new lanes from a new facility or customer, seasonal surges. FreightWaves reported in 2021 that "mini bids have become more popular as shippers use data to isolate volatile and problematic lanes," and noted they "multiply the administrative work that shippers must do." A mini-bid's award supersedes the annual award on its lanes for its period; the annual award on every other lane stands. The data model has to let two bid events award the same lane for overlapping periods with an explicit precedence (the later event wins for its period), not by overwriting the earlier award.

## Routing Guides

The routing guide is the award in executable form: for each lane (and equipment and service), an ordered list of carriers with their agreements and rules, ending in a spot step. A load is offered to position 1; if the carrier rejects or doesn't answer by the tender's expiry, to position 2; and so on. The execution belongs to [Tendering & Acceptance](/books/logistics/tendering#the-waterfall); the guide supplies its inputs:

- **Order.** Primary, then backups. With shares, the order is dynamic: the carrier furthest below its target share for the period moves up, as SAP's business-share penalties do in carrier selection.
- **Eligibility rules per entry.** Capacity per day or week (the carrier's committed loads), allocation limits, days of week, equipment, hazmat or temperature capability, and the carrier's compliance status at tender time (authority and insurance; [Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding) owns the checks).
- **Response time per entry.** How long each carrier has to answer before the next one is tried; shorter in a tight market, because every hour spent waiting on a rejecting carrier is an hour less for the next.
- **The end of the guide.** What happens after the last backup: a spot quote request to brokers or a load board, a broker with guaranteed capacity at a known premium (the research's recommendation to place a spot provider as second backup), or an escalation to a person.

The C.H. Robinson and MIT research describes what depth is worth: in loose markets (2016, 2019) primary and first backup accept nearly everything and later positions are "seldom used"; in tight ones (2018, 2021) tenders fall through to the fourth backup, and "the deeper you go in your route guide, the higher the price." A guide is tuned with its own history: if loads on a lane routinely reach the third position, the first two positions aren't real capacity, and the lane belongs in the next mini-bid.

## Compliance

Routing guide compliance has two directions, and a procurement system measures both:

- **Carrier compliance: did the awarded carrier accept?** Per carrier and lane, the share of tenders it accepted out of tenders it received, compared with its committed capacity. A carrier that rejects within its committed weekly volume breaks its award; one that rejects above it does not. SONAR's index is the same measure for the whole market and describes rejections as "a direct measure of carrier compliance."
- **Shipper compliance: did the planner tender to the guide?** Per lane, the share of loads that went to the guide's carriers in order, versus loads tendered out of order, to a non-awarded carrier, or straight to spot. Off-guide tendering destroys the award's value (the primary never sees the volume it priced) and is often invisible unless each tender records the guide position it came from.

The cost of non-compliance is measurable from the tables: for each load, the awarded primary's rate versus the rate actually paid, summed by lane and cause (primary rejected, backup rejected, planner skipped, no award). That spend-leakage report is what justifies the next mini-bid.

## How to Build It

Procurement adds bid events, their lanes and responses, awards, and the routing guide that executes them. Agreements and lane rates gain a link to the award that created them; tenders gain the guide entry and position they were sent from. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE freight_bids (              -- one bid event: an annual RFP or a mini-bid
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id   UUID NOT NULL REFERENCES parties (id),  -- the shipper, or the 3PL running it
  kind             TEXT NOT NULL CHECK (kind IN ('annual', 'mini_bid', 'project', 'spot_event')),
  name             TEXT NOT NULL,
  package_version  INT NOT NULL DEFAULT 1,  -- bumped on any change that affects pricing
  award_period     TSTZRANGE NOT NULL,   -- when the awarded rates apply
  responses_due_at TIMESTAMPTZ NOT NULL,
  round            SMALLINT NOT NULL DEFAULT 1,
  fuel_surcharge_schedule_id UUID REFERENCES fuel_surcharge_schedules (id),  -- bids are linehaul
  currency         CHAR(3) NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('draft', 'open', 'evaluating', 'awarded',
                     'cancelled')),
  document_id      UUID REFERENCES documents (id)  -- the package as sent
);

CREATE TABLE freight_bid_lanes (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_bid_id  UUID NOT NULL REFERENCES freight_bids (id),
  lane_ref        TEXT NOT NULL,         -- the shipper's lane ID, stable across bids
  origin          TEXT NOT NULL,         -- a lane key: 'facility:<id>', 'zip3:606'
  destination     TEXT NOT NULL,
  equipment_type  TEXT NOT NULL,
  service         TEXT,                  -- 'team', 'expedited', 'drop', or null
  forecast_loads  INT NOT NULL CHECK (forecast_loads >= 0),
  forecast_per    TEXT NOT NULL CHECK (forecast_per IN ('week', 'month', 'period')),
  miles_tenths    INT,                   -- from the bid's named mileage engine
  requirements    JSONB NOT NULL DEFAULT '{}',
  UNIQUE (freight_bid_id, lane_ref)
);

CREATE TABLE freight_bid_responses (     -- one carrier's answer on one lane, per round
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_bid_lane_id UUID NOT NULL REFERENCES freight_bid_lanes (id),
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  round            SMALLINT NOT NULL,
  package_version  INT NOT NULL,         -- the version priced
  declined         BOOLEAN NOT NULL DEFAULT FALSE,
  basis            TEXT CHECK (basis IN ('flat', 'per_mile', 'all_in_flat', 'all_in_per_mile')),
  rate             NUMERIC(14, 4),       -- minor units per basis unit
  normalized_flat  BIGINT,               -- linehaul per load at the lane's miles, for ranking
  capacity_loads   INT,                  -- what the carrier commits per forecast_per
  comments         TEXT,
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (freight_bid_lane_id, carrier_party_id, round),
  CHECK (declined OR rate IS NOT NULL)
);

CREATE TABLE freight_bid_awards (        -- the decision per lane and carrier
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_bid_lane_id UUID NOT NULL REFERENCES freight_bid_lanes (id),
  response_id      UUID NOT NULL REFERENCES freight_bid_responses (id),
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  position         SMALLINT NOT NULL CHECK (position > 0),  -- 1 = primary
  target_share_bp  INT CHECK (target_share_bp BETWEEN 0 AND 10000),
  share_tolerance_bp INT CHECK (share_tolerance_bp BETWEEN 0 AND 10000),
  committed_loads  INT,
  reason           TEXT,                 -- required when not the lowest normalized rate
  awarded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  awarded_by       TEXT NOT NULL,
  UNIQUE (freight_bid_lane_id, position)
);

CREATE TABLE routing_guides (            -- the executable guide for a lane
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id UUID NOT NULL REFERENCES parties (id),
  lane_ref       TEXT NOT NULL,
  origin         TEXT NOT NULL,
  destination    TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  service        TEXT NOT NULL DEFAULT 'standard',  -- not null, so the exclusion compares it
  order_rule     TEXT NOT NULL CHECK (order_rule IN ('fixed', 'share_balanced', 'lowest_cost')),
  on_exhausted   TEXT NOT NULL CHECK (on_exhausted IN ('spot_quote', 'load_board', 'broker',
                   'escalate')),
  valid_during   TSTZRANGE NOT NULL,
  freight_bid_id UUID REFERENCES freight_bids (id),  -- the event that produced it
  EXCLUDE USING gist (owner_party_id WITH =, lane_ref WITH =, equipment_type WITH =,
    service WITH =, valid_during WITH &&)  -- one guide per lane at a time; needs btree_gist
);

CREATE TABLE routing_guide_entries (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  routing_guide_id  UUID NOT NULL REFERENCES routing_guides (id),
  position          SMALLINT NOT NULL CHECK (position > 0),
  carrier_party_id  UUID NOT NULL REFERENCES parties (id),
  lane_rate_id      UUID REFERENCES lane_rates (id),  -- null for a spot or broker step
  freight_bid_award_id UUID REFERENCES freight_bid_awards (id),
  response_minutes  INT NOT NULL CHECK (response_minutes > 0),  -- the tender's window
  capacity_loads    INT,                 -- per capacity_per; null = no limit
  capacity_per      TEXT CHECK (capacity_per IN ('day', 'week', 'month')),
  target_share_bp   INT,
  days_of_week      SMALLINT[],          -- ISO 1 to 7; null = any
  UNIQUE (routing_guide_id, position)
);

ALTER TABLE rate_agreements
  ADD COLUMN freight_bid_id UUID;
ALTER TABLE rate_agreements ADD CONSTRAINT rate_agreements_freight_bid_fkey
  FOREIGN KEY (freight_bid_id) REFERENCES freight_bids (id) NOT VALID;

ALTER TABLE lane_rates
  ADD COLUMN freight_bid_award_id UUID,
  ADD COLUMN lane_ref TEXT;              -- the shipper's stable lane ID
ALTER TABLE lane_rates ADD CONSTRAINT lane_rates_freight_bid_award_fkey
  FOREIGN KEY (freight_bid_award_id) REFERENCES freight_bid_awards (id) NOT VALID;

ALTER TABLE tenders
  ADD COLUMN routing_guide_entry_id UUID,
  ADD COLUMN guide_position SMALLINT,    -- snapshot: the position it was sent from
  ADD COLUMN off_guide_reason TEXT;      -- set when a planner tendered outside the guide
ALTER TABLE tenders ADD CONSTRAINT tenders_routing_guide_entry_fkey
  FOREIGN KEY (routing_guide_entry_id) REFERENCES routing_guide_entries (id) NOT VALID;

CREATE INDEX CONCURRENTLY tenders_guide_entry_idx ON tenders (routing_guide_entry_id);
```

Carrier compliance per award for a period, accepted tenders against tenders received at that position:

```sql
CREATE VIEW routing_guide_compliance AS
SELECT g.lane_ref,
       e.carrier_party_id,
       e.position,
       date_trunc('week', t.sent_at)                         AS week,
       count(*)                                              AS tenders,
       count(*) FILTER (WHERE t.status = 'accepted')         AS accepted,
       count(*) FILTER (WHERE t.status IN ('rejected', 'expired')) AS refused,
       e.capacity_loads
FROM tenders t
JOIN routing_guide_entries e ON e.id = t.routing_guide_entry_id
JOIN routing_guides g ON g.id = e.routing_guide_id
GROUP BY g.lane_ref, e.carrier_party_id, e.position, date_trunc('week', t.sent_at),
         e.capacity_loads;
-- a refusal while accepted < capacity_loads breaks the award; one above it doesn't
```

And spend leakage by lane, what was paid against what the primary would have charged:

```sql
SELECT g.lane_ref,
       count(*)                                         AS loads,
       SUM(paid.amount)                                 AS linehaul_paid,
       SUM(primary_rate.rate)::bigint                   AS linehaul_at_primary,  -- flat-rate lanes
       SUM(paid.amount) - SUM(primary_rate.rate)::bigint AS leakage
FROM loads l
JOIN tenders t ON t.load_id = l.id AND t.status = 'accepted'
JOIN routing_guide_entries e ON e.id = t.routing_guide_entry_id
JOIN routing_guides g ON g.id = e.routing_guide_id
JOIN routing_guide_entries p ON p.routing_guide_id = g.id AND p.position = 1
JOIN lane_rates primary_rate ON primary_rate.id = p.lane_rate_id
JOIN freight_charges paid ON paid.load_id = l.id AND paid.side = 'payable'
  AND paid.kind = 'linehaul' AND paid.status <> 'void'
WHERE l.owner_party_id = $1 AND l.created_at >= $2
GROUP BY g.lane_ref
ORDER BY leakage DESC;
```

Design notes:

- **Stable lane IDs across bids.** `lane_ref` is the shipper's own lane identifier, carried on bid lanes, lane rates and guides, so a lane's history (bids, awards, tender outcomes) reads across years even as granularity changes.
- **Bid packages are versioned documents.** A response records the package version it priced; a change in volume or equipment after responses arrive reopens that lane.
- **Normalize before ranking, and keep the raw answer.** `normalized_flat` is what ranks; the carrier's own basis and rate are what the agreement holds.
- **One guide per lane at a time.** The exclusion constraint stops two guides governing the same lane and period; a mini-bid's guide ends the annual one's validity for its lanes rather than coexisting ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **Every tender remembers its guide position.** Without it, carrier and shipper compliance can't be measured and spend leakage can't be explained.
- **Awards that aren't lowest record why.** The reason is the audit trail for a procurement decision, and the input to the next one ([Explaining a Decision](/docs/building-blocks/weighing-objectives#explaining-a-decision)).

## Auditing

- **Every bid package version** as sent, with its lanes, volumes and terms.
- **Every response,** including declines, with the round and package version it answered.
- **Every award,** with position, share, committed capacity, who decided and why when it isn't lowest.
- **Every guide and entry** with validity, so a tender can be checked against the guide in force when it was sent.
- **Every tender's guide position or off-guide reason,** the basis of both compliance measures.

## What This Means for the System You Build

- **Model an award as a ranked list with shares and capacity,** not one carrier per lane.
- **Keep bid events, responses and awards as their own records,** versioned, so overlapping annual and mini-bid awards resolve by validity and precedence.
- **Generate routing guides from awards** and give every guide a defined end: a spot step, a broker or an escalation.
- **Record the guide position on every tender,** and measure carrier compliance against committed capacity and shipper compliance against the guide.
- **Report spend leakage by lane and cause,** and use it to pick lanes for the next mini-bid.
- **Keep the retailer's inbound routing guide separate;** it is a vendor compliance document ([Routing Guides](/books/commerce/wholesale-and-retail-distribution#routing-guides)), not a carrier waterfall.

## References

**Vendors**

- [SAP Learning: Understanding strategic freight procurement](https://learning.sap.com/courses/charges-and-settlement-in-sap-s-4hana-transportation-management/understanding-strategic-freight-procurement), the freight agreement master RFQ, historic volumes as forecast, ranking lists, target and optimal business shares, rounds and agreement creation
- [SAP Learning: Carrier selection](https://learning.sap.com/courses/planning-and-execution-in-sap-s-4hana-transportation-management/carrier-selection), priority and cost strategies, business share targets, tolerances and penalties, allocation capacities, shortage and excess penalties, and continuous move types
- [Blue Yonder: Transportation management](https://blueyonder.com/solutions/transportation-management), transportation procurement and bid management
- [Trimble](https://transportation.trimble.com/), Sourcing & Settlement and procurement tools for 3PLs and brokers

**Market and research**

- [DAT: Spot and contract freight, what's the difference and why it matters (May 2, 2022)](https://www.dat.com/blog/spot-and-contract-freight-whats-the-difference-and-why-it-matters), contract share, price-only binding, RFPs, mini-bids and routing guides
- [FreightWaves: Rethinking freight procurement and the RFP process (January 14, 2021)](https://www.freightwaves.com/news/rethinking-freight-procurement-and-the-rfp-process), the four-month RFP, rates obsolete in about six months, and mini-bids
- [C.H. Robinson: Research proves why you should put your spot freight in your route guide (May 23, 2023)](https://www.chrobinson.com/en-us/resources/blog/why-you-should-put-spot-freight-in-your-route-guide/), route guide depth by market, the 23% to 35% premium and the spot provider position
- [FreightWaves: Q3 2026 freight earnings, rates, capacity and 2027 bid outlook (November 16, 2026)](https://www.freightwaves.com/?p=586024), the 14.5% Q3 2026 tender rejection average, 5.3% a year earlier, and 12.87% on November 13
- [SONAR: How to interpret tender rejection rates (June 26, 2025)](https://gosonar.com/freight-market-blog/how-to-interpret-tender-rejection-rates), rejection bands and rejections as carrier compliance
