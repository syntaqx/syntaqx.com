+++
title = "Tendering & Acceptance"
description = "Offering a load to a carrier: the tender state machine, response windows and expiry, rejections, changes and cancellations, the waterfall and spot fallback."
category = "Logistics & Supply Chain Industry"
order = 2831
part = "Planning and Execution"
tags = ["logistics", "tendering", "edi", "routing-guide", "state-machine", "truckload", "data-model"]
+++

A tender is an offer of a load to one carrier: here are the stops, the dates, the equipment and the rate, answer by this time. The carrier accepts, rejects, or says nothing and lets it expire; an accepted tender makes the carrier responsible for the load, and a rejected or expired one sends the load to the next carrier in the routing guide, and eventually to the spot market. Tenders travel as an X12 204 ("Motor Carrier Load Tender") answered by a 990 ("Response to a Load Tender"), as API calls, through carrier portals, or by email and phone, and most shippers and brokers use several channels at once.

It is hard because a tender is a negotiation compressed into a timer, run between two systems that each hold their own copy. The offer can change after it was sent (a new appointment, an added stop) and partners signal that differently: CN's 204 marks a change with purpose code 04 ("update"), Kroger's Harris Teeter 204 with 05 ("replace"). The answer can come late, twice or in a code the sender reads differently: in the X12 code list a 990 decline is D, "Reservation Cancelled," but C.H. Robinson's truckload guide adds that "if you use R we will consider this as a Decline." A carrier can accept and later hand the load back; a shipper can accept a carrier and later cancel the load after the truck is rolling, which owes the carrier a truck-ordered-not-used charge. And all of it runs against the clock of a pickup appointment that doesn't move.

This chapter covers the tender as a state machine, response windows and expiry, rejections and their reasons, changes and cancellations after acceptance, the waterfall that runs a load down the routing guide (sequential and broadcast), the spot fallback, and how acceptance is measured. It extends `tenders` and `loads` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). Where the guide comes from is [Freight Procurement & Routing Guides](/books/logistics/procurement-and-routing-guides#routing-guides); the price on the tender is [Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials); the segment-level detail of the 204 and 990 (envelopes, loops, partner variance) is Transportation EDI.

## How the Platforms Do It

As of November 2026, from published implementation guides, vendor documentation and carrier rules:

| Source | Channel | Response and expiry | Codes and rules, as published |
| --- | --- | --- | --- |
| **CN** (204 guide, version 004010) | EDI 204 in, 990 out | A 990 "is generated for every EDI 204 Load Tender received by CN within a half hour of receipt"; the 204 carries a G62 date qualified 64, "Must Respond By," in local time | "All orders are automatically accepted via our current EDI 990 response"; B2A-01 purpose codes 00 original, 01 cancellation, 04 update; B2A-02 LT, "Load Tender - Truckload (TL) Carrier Only" |
| **Kroger** (Harris Teeter 204, version 4030) | EDI 204 | Not stated in the purpose code section | B2A-01 codes 00 Original, 01 Cancellation, 05 Replace |
| **C.H. Robinson** (truckload 990 guide, version 4010) | EDI 990 from carriers | Not stated | B1-04 is mandatory; codes A Reservation Accepted, D Reservation Cancelled, R Delete, U Change; "If you use R we will consider this as a Decline," "If you use U will consider this as an Accept"; B1-02 echoes its load number from the 204's B2-04 |
| **XPO** (990 guide, version 4010) | EDI 990 | Not stated | B1-04 codes A Reservation Accepted, B Conditional Acceptance, C Counter Proposal Made, D Reservation Cancelled, N New, R Delete, U Change; optional N9 references and K1 remarks |
| **SAP** (S/4HANA and TM tendering) | Freight requests for quotation or direct tendering of freight orders | A maximum response duration per tendering step; in direct tendering the system "generally awards a carrier if he or she does not reject the FO within a given time limit" | Four types: peer-to-peer with response required, peer-to-peer with no response required, broadcast with best offer, broadcast with first acceptable offer; multi-step tendering plans mix them; tendering can be set to stop when the freight order changes |
| **J.B. Hunt** (Carrier 360 rules, buy side, published December 11, 2020) | App and API | Not stated | Truck ordered not used pays only if the load was dispatched (driver en route or arrived) or cancelled the same day as pickup and tendered more than 30 minutes before the pickup appointment |

Oracle Transportation Management's online help, which documents its tender statuses and timers, is rendered by script and could not be read for this chapter. <!-- source-gap: logistics-tendering-otm | missing | OTM tender statuses, response-time calculation and retender properties | closes with: a readable copy of OTM's Tender Shipment and Secure Resources help topics | checked: 2026-11-22 -->

Four patterns:

- **Silence means different things.** In SAP's "no response required" and direct tendering, silence past the deadline is acceptance; in its "response required" type and in most 204 trading, silence is expiry and the load moves on. The rule is per tender, and it has to be on the tender row.
- **Change codes and decline codes vary by partner.** 04 versus 05 for a change; D versus R for a decline; U treated as an accept. A tendering system reads partner messages through a per-partner map, never the bare X12 code list.
- **Some carriers accept everything.** CN auto-accepts every 204 within half an hour; others answer only what they want. A carrier's tender acceptance is only comparable once the channel's automatic behavior is known.
- **Acceptance creates obligations in both directions.** The carrier owes the pickup; the shipper owes a TONU if it cancels late. Both rules depend on timestamps (acceptance, dispatch, cancellation, appointment) that the tender record has to keep.

## The Tender State Machine

A tender is one offer to one carrier. Its states and the transitions between them, with who causes each:

| From | To | Caused by | Notes |
| --- | --- | --- | --- |
| (new) | `sent` | Sender | The 204, API call or portal post goes out; `expires_at` is set |
| `sent` | `accepted` | Carrier | A 990 with A (or U where the partner means accept), or an API accept |
| `sent` | `conditionally_accepted` | Carrier | XPO's B: accepted with conditions in remarks (a later pickup, a different rate) |
| `sent` | `countered` | Carrier | XPO's C: a counter proposal, usually a rate |
| `sent` | `rejected` | Carrier | D, or R where the partner means decline, or an API reject with a reason |
| `sent` | `expired` | Timer | No answer by `expires_at`, under a "response required" rule |
| `sent` | `accepted` | Timer | No rejection by `expires_at`, under a "no response required" rule |
| `sent` | `withdrawn` | Sender | The load was covered elsewhere (broadcast), cancelled, or re-planned |
| `sent`, `accepted` | `superseded` | Sender | A material change was sent as a new revision (04 or 05); the new revision starts at `sent` |
| `conditionally_accepted`, `countered` | `accepted` | Sender | The sender agrees to the conditions or counter; the agreed terms become a new revision |
| `conditionally_accepted`, `countered` | `rejected`, `withdrawn` | Sender | The sender declines the conditions and moves on |
| `accepted` | `dropped` | Carrier | The carrier hands back a load it accepted |
| `accepted` | `cancelled` | Sender | The shipper or broker cancels the load; TONU rules decide whether it owes the carrier |

`accepted` is the only state that covers the load: setting it sets `loads.carrier_party_id` and moves the load to `covered`, in one transaction. `dropped` and `cancelled` uncover it. Everything else is terminal for that tender and leaves the load where it was, for the waterfall to decide the next step.

Five rules keep the machine honest:

- **One accepted tender per load at a time.** In a broadcast, two carriers can accept within seconds; the first committed acceptance wins and every other open tender is withdrawn. A partial unique index on `tenders (load_id) WHERE status = 'accepted'` makes the database enforce it ([Unique Keys for Discrete Units](/docs/building-blocks/reservations-and-holds#unique-keys-for-discrete-units)).
- **Expiry is computed, stored and enforced on read.** `expires_at` is set when the tender is sent, from the guide entry's response window or the 204's "Must Respond By" date, converted from the local time the message states to an instant using the zone the trading partner agreement names. A timer job moves expired tenders, but any code that reads a `sent` tender past its expiry treats it as expired ([Expiry Is Enforced on Read](/docs/building-blocks/reservations-and-holds#expiry-is-enforced-on-read)).
- **Late answers follow a rule, not luck.** An acceptance that arrives after expiry is accepted only if the load is still uncovered and no later tender is open; otherwise it is recorded and answered with a cancellation. The rule is the sender's to set and the tender's to record.
- **Answers are idempotent.** The same 990 delivered twice, or an API accept retried, applies once; an answer that conflicts with the tender's current state (an accept on a withdrawn tender) is stored as received and flagged, never applied ([Every Step Is Idempotent](/docs/building-blocks/workflows#every-step-is-idempotent)).
- **The carrier's code is kept beside the meaning.** `response_code` stores the B1-04 value as received; the state records what the partner map said it meant, so a map correction can be traced.

## Changes and Cancellations

After a tender is sent, the load can change: an appointment moves, a stop is added, the weight goes up, the rate is renegotiated. My rule is that a material change (any date, stop, equipment, rate or hazmat change) is a new revision of the tender that needs a new answer, and a non-material one (a reference number, a contact) is a message that doesn't. The partner's 204 purpose code carries the revision: 04 at CN, 05 at Kroger's Harris Teeter, and SAP can be set to stop tendering when a freight order changes. The prior revision becomes `superseded`, and if the carrier had accepted it, the carrier is still covering the load until it answers the new revision; a rejection of the change is a decision the sender then makes (accept the old terms, or re-tender). Revisions are rows, not updates, so the terms the carrier accepted are always recoverable.

Cancellation after acceptance is where money changes hands. J.B. Hunt's carrier rule, as published in December 2020, pays $200 for a truck ordered not used ($150 if the carrier's location services were off), but only if the load was dispatched (the driver en route or arrived) or was cancelled the same day as pickup and tendered more than 30 minutes before the pickup appointment. Each condition is a timestamp the system has: acceptance, dispatch, cancellation, appointment. The TONU charge is computed from them as an event accessorial ([Accessorials](/books/logistics/rating-and-accessorials#accessorials)) and references the tender. A carrier dropping an accepted load is the mirror case: often no charge, but a mark against the carrier's acceptance record, and a new tender for the load that is often more expensive and closer to pickup.

## Rejections and Reasons

A rejection is the most useful data a tender produces, and most of it is thrown away. X12's 990 can carry a reason (XPO's guide includes N9 references and K1 remarks), APIs and portals usually have a reason field, and phone rejections have whatever the planner typed. My default reason codes, mapped from whatever the partner sent:

- **No capacity** (no truck in the area on that date).
- **Rate** (the carrier would take it at a different price; a counter is the structured form).
- **Service** (can't make the appointment, transit too tight, the facility's hours).
- **Equipment** (no reefer, no team, no hazmat-qualified driver).
- **Lane** (the carrier doesn't serve it or no longer wants it).
- **Late tender** (offered too close to pickup to plan).
- **Unknown** (expired or no reason given).

Reasons feed procurement (a lane rejected on rate goes to the next mini-bid) and operations (late tenders are the shipper's own problem, and tender lead time is a number planners can change).

## The Waterfall

The waterfall is the process that runs a load through the routing guide until it is covered. It is a workflow with its own record, because one load's waterfall can involve a dozen tenders over a day, and its outcome (covered at position 1, at position 3, on spot, not covered) is the routing guide's performance ([Timers, Deadlines and Escalations](/docs/building-blocks/workflows#timers-deadlines-and-escalations)).

Two strategies, which SAP's tendering types name:

- **Sequential (peer-to-peer).** One carrier at a time, in guide order, each with its response window; SAP describes it as "sequential tendering to preselected carriers," waiting for an answer "or until the maximum response time has passed." It respects the guide and the award, and it is slow: four positions at two hours each is eight hours of a load's lead time.
- **Broadcast.** Several carriers at once; "best offer" waits for answers and picks, "first acceptable offer" takes the first acceptance. It is fast and buys at whatever price is acceptable, and it needs the one-accepted-tender rule and immediate withdrawal of the others.

Most guides mix them: sequential through the contracted positions, then broadcast to a spot pool or a set of brokers, as SAP's multi-step tendering plans and the routing guide's `on_exhausted` step allow. Each step skips carriers that can't take the load now: one already tried in this waterfall, one over its capacity for the period, one whose authority or insurance check failed (Carrier Onboarding & Vetting), one that doesn't run that day of the week. The skip is recorded with its reason, because a skip looks exactly like a rejection in an acceptance report unless it is labeled.

Choosing the next step, from the guide's entries, the tenders already sent and the carriers' current usage:

```go tab="Go"
type Entry struct {
	Position        int
	CarrierID       string
	ResponseMinutes int
	CapacityLoads   *int // nil: no limit for the period
	DaysOfWeek      []time.Weekday
}

type Skip struct {
	Position int
	Reason   string // "already_tendered", "over_capacity", "not_eligible", "day_of_week"
}

// NextStep returns the next entry to tender, the entries skipped on the way and why,
// or ok=false when the guide is exhausted and the load goes to its spot step.
func NextStep(guide []Entry, tried map[string]bool, used map[string]int,
	eligible func(carrierID string) bool, pickup time.Time) (next Entry, skipped []Skip, ok bool) {
	for _, e := range guide { // guide is sorted by Position
		switch {
		case tried[e.CarrierID]:
			skipped = append(skipped, Skip{e.Position, "already_tendered"})
		case e.CapacityLoads != nil && used[e.CarrierID] >= *e.CapacityLoads:
			skipped = append(skipped, Skip{e.Position, "over_capacity"})
		case len(e.DaysOfWeek) > 0 && !slices.Contains(e.DaysOfWeek, pickup.Weekday()):
			skipped = append(skipped, Skip{e.Position, "day_of_week"})
		case !eligible(e.CarrierID):
			skipped = append(skipped, Skip{e.Position, "not_eligible"})
		default:
			return e, skipped, true
		}
	}
	return Entry{}, skipped, false
}

// ExpiresAt bounds the window so a carrier can't hold the load past the point
// where the next one could still plan it.
func ExpiresAt(sent, pickup time.Time, e Entry, minLead time.Duration) time.Time {
	exp := sent.Add(time.Duration(e.ResponseMinutes) * time.Minute)
	if latest := pickup.Add(-minLead); exp.After(latest) && latest.After(sent) {
		return latest
	}
	return exp
}
```

```rust tab="Rust"
use chrono::{DateTime, Duration, Utc, Weekday};
use std::collections::{HashMap, HashSet};

pub struct Entry {
    pub position: u16,
    pub carrier_id: String,
    pub response_minutes: i64,
    pub capacity_loads: Option<u32>, // None: no limit for the period
    pub days_of_week: Vec<Weekday>,
}

pub struct Skip {
    pub position: u16,
    pub reason: &'static str, // "already_tendered", "over_capacity", "not_eligible", "day_of_week"
}

/// The next entry to tender and the skips on the way, or None when the guide is
/// exhausted and the load goes to its spot step.
pub fn next_step<'a>(
    guide: &'a [Entry], // sorted by position
    tried: &HashSet<String>,
    used: &HashMap<String, u32>,
    eligible: impl Fn(&str) -> bool,
    pickup_day: Weekday, // the pickup's weekday in the origin facility's zone
) -> (Option<&'a Entry>, Vec<Skip>) {
    let mut skipped = Vec::new();
    for e in guide {
        let reason = if tried.contains(&e.carrier_id) {
            Some("already_tendered")
        } else if e.capacity_loads.is_some_and(|cap| used.get(&e.carrier_id).copied().unwrap_or(0) >= cap) {
            Some("over_capacity")
        } else if !e.days_of_week.is_empty() && !e.days_of_week.contains(&pickup_day) {
            Some("day_of_week")
        } else if !eligible(&e.carrier_id) {
            Some("not_eligible")
        } else {
            None
        };
        match reason {
            Some(reason) => skipped.push(Skip { position: e.position, reason }),
            None => return (Some(e), skipped),
        }
    }
    (None, skipped)
}

/// Bound the window so a carrier can't hold the load past the point where the
/// next one could still plan it.
pub fn expires_at(sent: DateTime<Utc>, pickup: DateTime<Utc>, e: &Entry, min_lead: Duration) -> DateTime<Utc> {
    let exp = sent + Duration::minutes(e.response_minutes);
    let latest = pickup - min_lead;
    if exp > latest && latest > sent { latest } else { exp }
}
```

The pickup's weekday is taken in the origin facility's time zone (Go's `pickup` carries the facility's location; Rust's `pickup_day` is computed from it before the call): a Sunday 20:00 pickup in Chicago is a Sunday, although it is already Monday in UTC.

## The Spot Fallback

When the guide is exhausted, the load still has to move. The spot step is one of a small set of moves, chosen by the guide's `on_exhausted` rule and the time left:

- **Request spot quotes** from a set of carriers and brokers, with a short validity, and tender to the best acceptable quote. The quote becomes a one-load `rate_agreements` row (`spot_quote`), and the tender references it.
- **Post to a load board** (DAT, Truckstop) and book a carrier that responds, which for a broker is daily work (Load Boards & Digital Freight Matching covers the boards and auto-booking).
- **Tender to a broker with guaranteed capacity** at an agreed premium, the arrangement the C.H. Robinson and MIT research recommends placing as second backup rather than last resort.
- **Escalate to a person,** with the waterfall's history in front of them, when the pickup is close.

Spot coverage is measured as its own outcome. A lane covered on spot week after week is a procurement failure, and the premium paid over the primary's contract rate is the leakage that justifies the next mini-bid ([Compliance](/books/logistics/procurement-and-routing-guides#compliance)).

## Measuring Acceptance

Tender acceptance is the industry's simplest metric and the easiest to compute wrongly:

- **Per tender or per load.** The carrier-facing measure is per tender: of the tenders this carrier received, how many did it accept. The shipper-facing measure is per load: of the loads tendered, how many were accepted by the first carrier (first-tender acceptance), and at what position the rest were covered.
- **What counts in the denominator.** Skipped entries never received a tender and don't count; withdrawn tenders (covered elsewhere in a broadcast) aren't the carrier's refusal and don't count; expired tenders do count as refusals for the carrier; auto-accepting channels (CN's half-hour 990) inflate a carrier's rate and should be shown separately.
- **Dropped loads.** An acceptance followed by a drop is worse than a rejection, because it costs lead time; count drops separately and subtract them from the carrier's effective acceptance.
- **Market context.** SONAR's national outbound tender rejection index (14.5% in the third quarter of 2026, 12.87% on November 13, 2026) is the market's version of the same measure; a carrier rejecting 15% of a shipper's tenders in that quarter is behaving like the market, and one rejecting 40% is not.

The definitions are the same ones Logistics Metrics uses for its scorecards; what matters here is that the tender rows carry enough state (position, skip, withdrawal, channel, drop) to compute any of them.

## How to Build It

The core `tenders` row is one offer and its answer. Tendering adds the revision and the waterfall it belongs to, the rule for silence, the conditions and counter on a conditional answer, a normalized reason, and the cancellation and drop times; it widens the status list. New tables hold the waterfall run and an append-only log of every tender event. `ALTER`s run on a live database as the business chapter describes ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)); the widened status check replaces the core one by adding a new constraint `NOT VALID`, validating it, then dropping the old:

```sql
CREATE TABLE tender_waterfalls (         -- one run of a load through its guide
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  load_id          UUID NOT NULL REFERENCES loads (id),
  routing_guide_id UUID REFERENCES routing_guides (id),  -- null: tendered without a guide
  strategy         TEXT NOT NULL CHECK (strategy IN ('sequential', 'broadcast_best',
                     'broadcast_first', 'mixed')),
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at         TIMESTAMPTZ,
  outcome          TEXT CHECK (outcome IN ('covered_in_guide', 'covered_spot',
                     'covered_manual', 'not_covered', 'cancelled')),
  covered_position SMALLINT,             -- the guide position that accepted, if any
  skips            JSONB NOT NULL DEFAULT '[]',  -- position, carrier and reason per skip
  CHECK ((ended_at IS NULL) = (outcome IS NULL))
);
CREATE UNIQUE INDEX tender_waterfalls_one_open ON tender_waterfalls (load_id)
  WHERE ended_at IS NULL;

ALTER TABLE tenders
  ADD COLUMN tender_waterfall_id UUID,
  ADD COLUMN revision          SMALLINT NOT NULL DEFAULT 1,
  ADD COLUMN previous_tender_id UUID,    -- the revision this one supersedes
  ADD COLUMN silence_means     TEXT NOT NULL DEFAULT 'expired',  -- or 'accepted'
  ADD COLUMN respond_by_source TEXT,     -- 'guide_entry', 'edi_g62_64', 'manual'
  ADD COLUMN conditions        TEXT,     -- a conditional acceptance's remarks, as received
  ADD COLUMN counter_amount    BIGINT,   -- a counter proposal, minor units
  ADD COLUMN reason_code       TEXT,     -- normalized, from the partner's reason
  ADD COLUMN cancelled_at      TIMESTAMPTZ,
  ADD COLUMN dropped_at        TIMESTAMPTZ,
  ADD COLUMN spot_quote_agreement_id UUID;  -- the spot quote it was sent at
ALTER TABLE tenders ADD CONSTRAINT tenders_waterfall_fkey
  FOREIGN KEY (tender_waterfall_id) REFERENCES tender_waterfalls (id) NOT VALID;
ALTER TABLE tenders ADD CONSTRAINT tenders_previous_fkey
  FOREIGN KEY (previous_tender_id) REFERENCES tenders (id) NOT VALID;
ALTER TABLE tenders ADD CONSTRAINT tenders_spot_quote_fkey
  FOREIGN KEY (spot_quote_agreement_id) REFERENCES rate_agreements (id) NOT VALID;
ALTER TABLE tenders ADD CONSTRAINT tenders_silence_means_check
  CHECK (silence_means IN ('expired', 'accepted')) NOT VALID;
ALTER TABLE tenders ADD CONSTRAINT tenders_reason_code_check
  CHECK (reason_code IS NULL OR reason_code IN ('no_capacity', 'rate', 'service',
    'equipment', 'lane', 'late_tender', 'unknown')) NOT VALID;
ALTER TABLE tenders ADD CONSTRAINT tenders_status_check_v2
  CHECK (status IN ('sent', 'accepted', 'conditionally_accepted', 'countered', 'rejected',
    'expired', 'withdrawn', 'superseded', 'dropped', 'cancelled')) NOT VALID;
ALTER TABLE tenders VALIDATE CONSTRAINT tenders_status_check_v2;
ALTER TABLE tenders DROP CONSTRAINT tenders_status_check;  -- the core check

CREATE UNIQUE INDEX CONCURRENTLY tenders_one_accepted ON tenders (load_id)
  WHERE status = 'accepted';
CREATE INDEX CONCURRENTLY tenders_open_expiry ON tenders (expires_at)
  WHERE status = 'sent';

CREATE TABLE tender_events (             -- every send, answer, timer and change, append-only
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tender_id     UUID NOT NULL REFERENCES tenders (id),
  kind          TEXT NOT NULL CHECK (kind IN ('sent', 'resent', 'answer_received',
                  'answer_applied', 'answer_ignored', 'expired', 'withdrawn', 'revised',
                  'cancelled', 'dropped', 'acknowledged')),
  from_status   TEXT,
  to_status     TEXT,
  partner_code  TEXT,                    -- the B1-04 or API value, as received
  document_id   UUID REFERENCES documents (id),  -- the 204, 990 or 997 as exchanged
  note          TEXT,                    -- why an answer was ignored, for example
  occurred_at   TIMESTAMPTZ NOT NULL,    -- the partner's time, where it states one
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON tender_events (tender_id, recorded_at);
```

The timer's work, run every minute and safe to run twice:

```sql
WITH due AS (
  UPDATE tenders
  SET status = 'expired'
  WHERE status = 'sent' AND expires_at <= NOW() AND silence_means = 'expired'
  RETURNING id, expires_at
)
INSERT INTO tender_events (tender_id, kind, from_status, to_status, occurred_at)
SELECT id, 'expired', 'sent', 'expired', expires_at FROM due;
-- tenders where silence means 'accepted' go one at a time through the same function
-- as a 990, because acceptance also covers the load; the unique index rejects one whose
-- load another tender already covers, without failing the rest of the batch
```

And first-tender acceptance and coverage position by lane for a month:

```sql
SELECT g.lane_ref,
       count(*)                                                    AS loads,
       count(*) FILTER (WHERE w.covered_position = 1)              AS first_tender_accepted,
       round(avg(w.covered_position) FILTER (WHERE w.outcome = 'covered_in_guide'), 2)
                                                                   AS avg_position,
       count(*) FILTER (WHERE w.outcome = 'covered_spot')          AS spot
FROM tender_waterfalls w
JOIN routing_guides g ON g.id = w.routing_guide_id
WHERE w.started_at >= date_trunc('month', $1::timestamptz)
  AND w.started_at <  date_trunc('month', $1::timestamptz) + interval '1 month'
GROUP BY g.lane_ref
ORDER BY spot DESC, avg_position DESC;
```

Design notes:

- **One function applies every answer.** A 990, an API accept, a portal click and the timer all call the same transition function, which checks the state, applies the partner map, writes the event and the outbox message, and covers or uncovers the load ([One Function Moves the State](/docs/building-blocks/workflows#one-function-moves-the-state)).
- **Revisions are rows.** A changed offer is a new tender with `previous_tender_id`; the superseded one keeps the terms the carrier saw.
- **Partner maps are data.** Which B1-04 code means decline, which B2A code means change, and whether a partner auto-accepts are per-partner rules with validity ([The Shape of a Rule](/docs/building-blocks/rules-as-data#the-shape-of-a-rule)); the 204 and 990 segment detail and the partner-variance tables are Transportation EDI's.
- **Times are the facility's and the partner's.** A "Must Respond By" in local time is converted with the zone the partner agreement names and stored as an instant; the original text stays in the document.
- **Skips are data.** `tender_waterfalls.skips` keeps every skipped position and reason, so acceptance reports don't count a skip as a refusal.
- **Emit the events.** `tender.sent`, `tender.accepted`, `tender.rejected`, `tender.expired`, `tender.dropped` and `load.covered` go through the outbox; rating subscribes to `tender.cancelled` for TONU, visibility to `load.covered` ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every tender and revision** with the terms offered, the channel, the expiry and how it was set.
- **Every partner message** (204 sent, 990 received, the 997 acknowledging either) as exchanged, linked from the event it caused or the note explaining why it was ignored.
- **Every waterfall** with its strategy, skips, outcome and covered position.
- **Every acceptance, drop and cancellation** with its time, which is what TONU charges and carrier scorecards rest on.
- **Partner map versions,** so a disputed reading of a code can be traced to the rule in force.

## What This Means for the System You Build

- **Model the tender as a state machine with an explicit rule for silence,** and keep `accepted` the only state that covers a load.
- **Enforce one accepted tender per load in the database,** and withdraw the rest the moment one wins.
- **Compute and store expiry,** enforce it on read, and decide late answers by rule.
- **Treat material changes as revisions** that need a new answer, and keep the old terms.
- **Read partner codes through per-partner maps,** keeping the raw code beside its meaning.
- **Run the waterfall as a workflow record** with skips and an outcome, ending in a defined spot step.
- **Capture rejection reasons and drops,** and compute acceptance with honest denominators.

## References

**Implementation guides**

- [CN: EDI 204 implementation guide, version 4010](https://www.cn.ca/-/media/files/customer-centre/customer-centre-documents/204-implementation-guide-4010.pdf), the half-hour 990, automatic acceptance, purpose codes 00, 01 and 04, and the G62 "Must Respond By" date in local time
- [Kroger: Harris Teeter 204 guidelines, version 4030](https://edi.kroger.com/EDIPortal/documents/Maps/ht/HT_204_X12_4030_Guidelines.pdf), purpose codes 00, 01 and 05
- [C.H. Robinson: Truckload carrier X12 990 (version 4010)](https://www.chrobinson.com/en-US/-/media/ChRobinson/documents/carrier-specs-docs/truckload-carrier-specs/CHR990IB.pdf), the B1 segment, the codes it accepts and its reading of R and U
- [XPO: 990 specification, X12 4010](https://www.xpo.com/cdn/files/s8/990_spec_x12_4010.pdf), the full B1-04 reservation action code list and the N9 and K1 segments

**Vendors and carriers**

- [SAP Documentation: Freight tendering](https://help.sap.com/saphelp_tm94/helpdata/en/6c/921d2b67584ec2a2a7c0bcc8a0b8dc/content.htm), freight RFQs, direct tendering and award on no rejection, multi-step plans and the option to stop on change
- [SAP Documentation: Peer-to-peer tendering](https://help.sap.com/saphelp_tm91/helpdata/en/5f/57f175cde9425ba738335c6ef75c11/content.htm), sequential tendering and the maximum response time
- [SAP Documentation: Tendering profile](https://help.sap.com/saphelp_tm91/helpdata/en/43/01feea1b5241e1be095e05e5c9072d/content.htm), the four tendering types and the maximum response duration
- [J.B. Hunt: Standardized accessorials in Carrier 360 (December 11, 2020)](https://www.jbhunt.com/blog/j-b-hunt-360/carrier/standardized-accessorials-in-carrier-360), the conditions for truck ordered not used

**Market**

- [FreightWaves: Q3 2026 freight earnings, rates, capacity and 2027 bid outlook (November 16, 2026)](https://www.freightwaves.com/?p=586024), the tender rejection averages and the November 13, 2026 value
- [SONAR: How to interpret tender rejection rates (June 26, 2025)](https://gosonar.com/freight-market-blog/how-to-interpret-tender-rejection-rates), the outbound tender rejection index and its bands
- [C.H. Robinson: Research proves why you should put your spot freight in your route guide (May 23, 2023)](https://www.chrobinson.com/en-us/resources/blog/why-you-should-put-spot-freight-in-your-route-guide/), spot providers as a guide position
