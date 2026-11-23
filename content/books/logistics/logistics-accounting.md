+++
title = "Logistics Accounting"
description = "The accounting freight systems feed: principal or agent, revenue over the transit, in-transit cutoff, accrued purchased transportation, and claims reserves."
category = "Logistics & Supply Chain Industry"
order = 2847
part = "Freight Money"
tags = ["logistics", "accounting", "revenue-recognition", "asc-606", "accruals", "claims-reserves", "data-model"]
+++

Logistics companies report revenue in ways that look inconsistent until the judgment behind them is clear. A broker that contracts with the carrier and sets the price reports the customer's whole charge as revenue and the carrier's cost as purchased transportation; the same company reports only its fee when it acts as an agent, in customs brokerage or managed transportation. Revenue for a load is earned while the truck moves, so at month end some of it belongs to a shipment still on the road. The carrier's bill for that load hasn't arrived, so the cost is an estimate. And a carrier that self-insures its trucks carries a reserve for accidents that have happened and haven't been reported yet. C.H. Robinson recorded $156.4 million of revenue at the end of 2025 "for services we have provided while a shipment was still in-transit"; RXO's accrued "transportation and facility charges" were $262 million; Landstar's insurance claims liability was $150.0 million.

It is hard because each number is an estimate built from operational records, and auditors test the records. Principal-versus-agent is decided per contract and service, and the system has to know which applies to each load. In-transit revenue needs pickup and delivery times and a measure of progress, at a cutoff in the reporting time zone. The accrual needs every load that moved without a matched carrier invoice, at the right estimate. A reserve needs every claim's history, paid and open, by the date it happened and the date it was reported. Generic accounting (the five steps of ASC 606, recognition schedules, month-end close, write-offs) is the playbook's [Accounting](/docs/money/accounting); how gross and net revenue change the comparison between companies is [How Carriers, Brokers & 3PLs Make Money](/books/logistics/logistics-economics). This chapter covers what logistics adds: the companies' policies, principal versus agent in freight, revenue over the transit, accrued purchased transportation, claims and insurance reserves, and the tables that let finance compute each one from facts.

## How the Companies Report It

As of November 2026, from 2025 Forms 10-K:

| Company | Gross or net | When revenue is recognized | Accrued cost and reserves |
| --- | --- | --- | --- |
| **C.H. Robinson** | Gross where "we are primarily responsible for fulfilling the promise" and "have discretion in establishing the price"; net for "customs brokerage, managed solutions, freight forwarding, and sourcing managed procurement" | "as they are satisfied over the contract term," which generally represents the transit period; $156.4 million recorded for in-transit shipments at year end ($200.3 million a year earlier), a critical audit matter for its auditor | Accrued transportation expense $120.7 million ($153.3 million a year earlier) |
| **Landstar System** | "recognized on a gross basis over the freight transit period"; fuel surcharges on BCO Independent Contractor freight are excluded from revenue and "paid in entirety" to the BCOs | "A days in transit output method is used to measure the progress"; purchased transportation and agent commissions also "recognized over the freight transit period" | Insurance claims $87.3 million current and $62.7 million long-term at December 27, 2025, estimated "primarily on an actuarially determined basis," including claims incurred but not reported; $5 million self-insured retention per trucking occurrence and $250,000 per cargo claim |
| **RXO** | Revenue when "we transfer control of promised services"; "When we do not control the specific services," net | "proportionally as a shipment moves from origin to destination"; transit times "usually less than one week"; contract assets $26 million | Accrued transportation and facility charges $262 million ($211 million a year earlier); its auditor's critical audit matter is self-insured automobile liabilities, including incurred but not reported claims |
| **Uber Freight** (Uber segment) | "in most markets we are responsible for the Freight services," and revenue is presented "on a gross basis," with carrier payments "within cost of revenue" | Not stated in the excerpt opened | Freight revenue $5,099 million in 2025 |

Three patterns:

- **Gross is the default for brokerage, net for advisory and pass-through work.** All four report their freight revenue gross; C.H. Robinson names the services it reports net (customs brokerage, managed solutions, forwarding, sourcing) and RXO reports net where it doesn't control the specific services. One company, two presentations, chosen per service.
- **Revenue follows the truck, and so does cost.** All three that state a method recognize over the transit (days in transit at Landstar, proportional progress at RXO and C.H. Robinson), and Landstar recognizes purchased transportation and commissions on the same basis, so a load's margin is recognized in step with its revenue.
- **The estimates are what auditors test.** C.H. Robinson's in-transit revenue and RXO's self-insured auto liabilities are named critical audit matters; the system's records of pickup, delivery, progress and claims are the evidence.

## Principal or Agent

ASC 606 asks whether a company promises to provide the specified service itself (a principal, recording revenue gross) or to arrange for another party to provide it (an agent, recording its fee or commission net), and it decides by whether the company controls the service before it is transferred to the customer (ASC 606-10-55-36 through 55-40). The indicators of control in ASC 606-10-55-39, as Norfolk Southern quoted them to the SEC staff in 2018 when it explained why it reports a connecting railroad's share of an interline move net, are that "the entity is primarily responsible for fulfilling the promise to provide the specified good or service," that it "has inventory risk before the specified good or service has been transferred to a customer," and that it "has discretion in establishing the price for the specified good or service." Echo Global Logistics, answering the staff in 2019 on why it reports brokerage gross, walked the same three for a broker: primary responsibility from contract to delivery, some inventory risk because it stays liable to the carrier if the customer doesn't pay and owes a truck-ordered-not-used charge if the customer cancels, and prices negotiated independently of carrier cost. In freight the facts that decide it are concrete:

- **Who contracts with the carrier.** A broker that issues the rate confirmation, owes the carrier regardless of whether the shipper pays, and is liable to the shipper for the service is primarily responsible for it; a managed transportation provider that tenders on the shipper's own carrier contracts, on the shipper's TMS, is arranging.
- **Who sets the price.** A broker that quotes the shipper a price independent of what it pays the carrier has discretion; a 3PL billing cost plus a fixed management fee does not, on the transportation.
- **Who bears the risk of a failed move.** Re-covering a load the carrier dropped, at whatever the spot market charges, is fulfillment risk the principal carries.

The judgment is finance's and is made per contract or service line, not per load ([The Product Keeps Facts, Finance Picks Policy](/docs/money/accounting#the-product-keeps-facts-finance-picks-policy)). The system's job is to record the facts the judgment reads (who issued the carrier's confirmation, whose contract the rate came from, the service line, the billing basis) and to tag each load with the policy that applied, so the same lines can be presented gross or net. Margin doesn't change with the presentation: it's the receivable lines minus the payable lines either way ([A Brokered Truckload](/books/logistics/logistics-business#a-brokered-truckload)).

**Pass-throughs are their own case.** Landstar excludes from revenue the fuel surcharges it bills on BCO freight and pays them "in entirety" to the BCOs; duties and government fees a customs broker advances for an importer are owed to CBP, not earned ([An Ocean Import](/books/logistics/logistics-business#an-ocean-import)). Each is a `freight_charges` line with its side and kind; whether it is revenue is a presentation rule on the kind, recorded with the policy, never a separate set of books.

## Revenue Over the Transit

Recognizing a load's revenue over its transit means that at a cutoff, each load in motion has earned a share of its revenue. The methods in the filings measure progress by time: Landstar's "days in transit output method," RXO's revenue "proportionally as a shipment moves from origin to destination." For a load picked up at 08:00 on the 30th and scheduled to deliver at 20:00 on the 1st (36 hours), a month-end cutoff at midnight ending the 30th has 16 of 36 hours complete: 44.4% of the receivable lines are this month's revenue and the rest next month's. The inputs are the pickup's actual departure, the delivery's actual arrival if it happened, otherwise its appointment or ETA, and the cutoff in the reporting time zone ([Month-End Close](/docs/money/accounting#month-end-close)).

What the system has to get right:

- **Actual times, from the events.** `stops.departed_at` and `arrived_at` are set from the events that proved them ([The Core Data Model](/books/logistics/logistics-business#the-core-data-model)); a load whose pickup event arrives after the cutoff (a late 214) moves revenue between periods, so the cutoff run records the received time of every event it used.
- **Which lines.** Accessorials earned at a point (detention at the consignee, a lumper fee, a TONU) aren't spread over the transit; linehaul and fuel are. The rule is per charge kind, set by finance.
- **Costs in step.** Purchased transportation recognized on the same progress as the revenue keeps the load's margin intact in each period (Landstar recognizes both over the transit).
- **Estimates trued up.** C.H. Robinson's filing says its estimate relies on "contract data for the first few days following the reporting date" and history, and that "weather events, port congestion, or other delays" can change it; the next period's actuals replace the estimate, and the difference is measured.

## Accrued Purchased Transportation

The cost side of the same cutoff is the accrual: what the company owes carriers and vendors for freight that moved and hasn't been invoiced, or has been invoiced and not approved. The core model's charge states carry it (`estimated` at tender, `accrued` at pickup, matched to an invoice line when billed), and [Accruals](/books/logistics/freight-audit-and-payment#accruals) computes it, posts the true-up in the period the invoice is approved, and measures accrual accuracy by carrier and lane. The accounting requirements on top:

- **One estimate per line, from the agreement.** An accrued charge carries its source (the rate confirmation, the contract lane rate, a standard cost) so an auditor can see why the amount is what it is; a load with no rate yet accrues at a stated standard, flagged.
- **Accessorials without invoices.** Detention, lumper and layover the company knows it owes (from stop times and receipts) accrue when the event is recorded, not when the carrier bills them, or the accrual is short in exactly the months detention is high.
- **Snapshots at close.** The accrual as booked is kept per period and charge, so the true-up against the approved invoice is measurable and a closed period's accrual is never rewritten ([Closed Periods Stay Closed](/docs/money/accounting#closed-periods-stay-closed)).

## Claims and Insurance Reserves

Carriers, and brokers with contractual liability, carry reserves for claims: cargo loss and damage, auto liability for accidents, workers' compensation, general liability. Each self-insures to a retention and buys insurance above it (Landstar retains "up to $5 million per occurrence" on commercial trucking claims and $250,000 per cargo claim), and the reserve for the retained part is an estimate of what reported claims will cost plus claims incurred but not yet reported, set "primarily on an actuarially determined basis" in Landstar's case and named a critical audit matter in RXO's. The actuary's method is outside the system; its inputs are not:

- **Every claim's dates:** when the loss occurred, when it was reported, when the claim was filed, acknowledged and closed ([Claim Rules in 49 CFR 370](/books/logistics/cargo-claims#claim-rules-in-49-cfr-370) sets the cargo clocks).
- **Every reserve change and payment,** as a history: the case reserve set by the claims handler, each revision with its reason, each payment and recovery (salvage, subrogation, the carrier's payment on a claim the broker paid its customer).
- **The retention that applies,** from the policy in force on the occurrence date, so the retained and insured parts of each claim are known.

From those, the loss development data an actuary reads (losses by occurrence period, valued at each later date) is a query, and the incurred-but-not-reported estimate is the actuary's, recorded as a period entry with its source.

## How to Build It

The deltas tag loads with their recognition policy, record each period's recognition and accrual snapshots, and keep claim reserves as a history:

```sql
CREATE TABLE revenue_recognition_policies (    -- finance's decision, per service line, versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id   UUID NOT NULL REFERENCES parties (id),  -- the reporting entity
  service_line     TEXT NOT NULL,             -- 'truckload_brokerage', 'managed_transportation', 'customs_brokerage'
  presentation     TEXT NOT NULL CHECK (presentation IN ('gross', 'net')),
  progress_method  TEXT NOT NULL CHECK (progress_method IN ('transit_time', 'point_in_time',
                     'distance')),
  point_in_time_kinds TEXT[] NOT NULL DEFAULT '{}',  -- charge kinds recognized when earned
  pass_through_kinds  TEXT[] NOT NULL DEFAULT '{}',  -- kinds excluded from revenue
  rationale        TEXT NOT NULL,             -- the facts the judgment rests on
  version          INT NOT NULL,
  valid_during     TSTZRANGE NOT NULL,
  approved_by      TEXT NOT NULL,
  UNIQUE (owner_party_id, service_line, version)
);

ALTER TABLE loads
  ADD COLUMN service_line                  TEXT,
  ADD COLUMN revenue_recognition_policy_id UUID REFERENCES revenue_recognition_policies (id);
ALTER TABLE loads ADD CONSTRAINT loads_service_line_check
  CHECK (revenue_recognition_policy_id IS NULL OR service_line IS NOT NULL) NOT VALID;
ALTER TABLE loads VALIDATE CONSTRAINT loads_service_line_check;

CREATE TABLE accounting_periods (              -- what's open, per reporting entity
  owner_party_id UUID NOT NULL REFERENCES parties (id),
  period         DATE NOT NULL,                -- the first day of the month
  cutoff_at      TIMESTAMPTZ NOT NULL,         -- end of the period in the reporting zone
  closed_at      TIMESTAMPTZ,
  PRIMARY KEY (owner_party_id, period)
);

CREATE TABLE freight_revenue_recognitions (    -- one load's share in one period
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),
  period            DATE NOT NULL,
  load_id           UUID NOT NULL REFERENCES loads (id),
  policy_id         UUID NOT NULL REFERENCES revenue_recognition_policies (id),
  side              TEXT NOT NULL CHECK (side IN ('receivable', 'payable')),  -- revenue or cost
  progress_bp       INT NOT NULL CHECK (progress_bp BETWEEN 0 AND 10000),     -- cumulative at cutoff
  basis_amount      BIGINT NOT NULL,           -- the spread lines, minor units
  point_amount      BIGINT NOT NULL DEFAULT 0, -- point-in-time lines earned by cutoff
  cumulative_amount BIGINT NOT NULL,           -- recognized through this period
  period_amount     BIGINT NOT NULL,           -- cumulative minus prior periods
  currency          CHAR(3) NOT NULL,
  inputs            JSONB NOT NULL,            -- departed_at, arrived_at or ETA, event received times
  computed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (owner_party_id, period) REFERENCES accounting_periods (owner_party_id, period),
  UNIQUE (period, load_id, side)
);

CREATE TABLE freight_accrual_snapshots (       -- the accrual as booked at close
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id  UUID NOT NULL REFERENCES parties (id),
  period          DATE NOT NULL,
  freight_charge_id UUID NOT NULL REFERENCES freight_charges (id),
  accrued_amount  BIGINT NOT NULL,
  currency        CHAR(3) NOT NULL,
  estimate_source TEXT NOT NULL CHECK (estimate_source IN ('rate_confirmation', 'contract',
                    'standard_cost', 'event', 'manual')),
  approved_amount BIGINT,                      -- filled when the invoice is approved: the true-up
  approved_period DATE,
  FOREIGN KEY (owner_party_id, period) REFERENCES accounting_periods (owner_party_id, period),
  UNIQUE (period, freight_charge_id)
);

CREATE TABLE claim_reserve_changes (           -- a claim's case reserve, paid and recovered, over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id     UUID NOT NULL REFERENCES parties (id),
  line_of_coverage   TEXT NOT NULL CHECK (line_of_coverage IN ('cargo', 'auto_liability',
                       'physical_damage', 'workers_compensation', 'general_liability')),
  cargo_claim_id     UUID REFERENCES cargo_claims (id),  -- for cargo; other lines use external_claim_ref
  external_claim_ref TEXT,                     -- the TPA's or insurer's claim number
  occurred_on        DATE NOT NULL,
  reported_on        DATE NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('reserve_set', 'reserve_change', 'payment',
                       'recovery', 'close', 'reopen')),
  amount             BIGINT NOT NULL,          -- signed: the change, payment or recovery
  currency           CHAR(3) NOT NULL,
  retention_amount   BIGINT,                   -- the self-insured retention in force on occurred_on
  reason             TEXT NOT NULL,
  recorded_by        TEXT NOT NULL,
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (cargo_claim_id IS NOT NULL OR external_claim_ref IS NOT NULL),
  CHECK (reported_on >= occurred_on)
);
```

Revenue earned by a load in motion at the cutoff, on the transit-time method: the share of hours from pickup departure to delivery (actual, or the appointment's end if it hasn't happened) that falls before the cutoff, applied to the spread lines:

```sql
WITH legs AS (
  SELECT l.id AS load_id, p.departed_at AS started,
         COALESCE(d.arrived_at, upper(d.appointment)) AS ends
  FROM loads l
  JOIN stops p ON p.load_id = l.id AND p.sequence = 1
  JOIN stops d ON d.load_id = l.id
   AND d.sequence = (SELECT max(sequence) FROM stops WHERE load_id = l.id)
  WHERE l.owner_party_id = $1 AND p.departed_at < $2  -- $2: the cutoff
), progress AS (
  SELECT load_id,
         LEAST(10000, GREATEST(0, (10000 * EXTRACT(EPOCH FROM ($2 - started))
           / NULLIF(EXTRACT(EPOCH FROM (ends - started)), 0))::INT)) AS progress_bp
  FROM legs
)
SELECT c.load_id, c.currency, pr.progress_bp,
       SUM(c.amount) AS basis_amount,
       SUM(c.amount) * pr.progress_bp / 10000 AS earned_through_cutoff  -- rounded once, down
FROM freight_charges c
JOIN progress pr ON pr.load_id = c.load_id
JOIN loads l ON l.id = c.load_id
JOIN revenue_recognition_policies rp ON rp.id = l.revenue_recognition_policy_id
WHERE c.side = 'receivable' AND c.status <> 'void'
  AND NOT (c.kind = ANY (rp.point_in_time_kinds || rp.pass_through_kinds))
GROUP BY c.load_id, c.currency, pr.progress_bp;
```

Design notes:

- **Facts here, policy in versions.** The product stores loads, stops, events and charges; the policy table says how finance reads them, and a new version regenerates recognitions for open periods without touching the facts ([Recognition Schedules](/docs/money/accounting#recognition-schedules)).
- **Recognitions are cumulative.** Each period stores progress and the cumulative amount, and the period amount is the difference from the prior period, so a late event changes the open period only and rounding never drifts.
- **Snapshots, not recomputation, for closed periods.** The accrual and recognition rows for a closed period are what was booked; a rerun under a corrected input writes the open period's true-up.
- **Reserves are append-only.** A case reserve's current value is the sum of its changes, and the history is what the actuary and the auditor read.
- **Sync summarized, with detail on demand.** The general ledger gets summary journals per period, entity and account; the detail stays here, keyed so any journal line can be expanded to its loads ([Summary Journals or Detail](/docs/money/accounting#summary-journals-or-detail)).

## Auditing

- **Every policy version** with its rationale, approver and validity, and which loads it governed.
- **Every period's recognition and accrual rows,** with the inputs (event times and when they were received) and the cutoff used.
- **Every true-up,** from accrual to approved invoice and from estimated to actual recognition, by period.
- **Every claim reserve change,** payment and recovery, with occurrence and report dates and the retention in force.
- **Every pass-through,** with the kind rule that excluded it from revenue.

## What This Means for the System You Build

- **Record the facts principal-versus-agent reads,** and tag every load with the versioned policy finance chose for its service line.
- **Keep both sides as lines** so gross and net are presentations of the same data, and margin never changes with them.
- **Recognize from actual event times,** at a cutoff in the reporting zone, with point-in-time accessorials and pass-throughs handled by kind.
- **Accrue from charge lines with their sources,** including accessorials known from events, and true up forward.
- **Keep claims reserves as an append-only history** with occurrence and report dates, so loss development is a query.
- **Close periods for real:** snapshots for what was booked, corrections in the open period.

## References

**Filings**

- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), gross and net criteria, net services, transit-period recognition, in-transit revenue and its estimation, the critical audit matter, and accrued transportation expense
- [Landstar System: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/853816/000119312526064756/d66072d10k.htm), gross recognition over transit, the days in transit method, BCO fuel surcharge exclusion, purchased transportation and commissions over transit, insurance claims balances, actuarial estimates and retentions
- [RXO: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1929561/000192956126000013/rxo-20251231.htm), control-based recognition, net presentation, proportional recognition, transit times, contract assets, accrued transportation and facility charges, and the self-insurance critical audit matter
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), Freight presented gross with carrier payments in cost of revenue, and 2025 Freight revenue
- [Norfolk Southern: response to SEC staff comments, September 21, 2018](https://www.sec.gov/Archives/edgar/data/702165/000070216518000048/filename1.htm), the ASC 606-10-55-39 indicators quoted, applied to interline rail revenue reported net
- [Echo Global Logistics: response to SEC staff comments, July 31, 2019](https://www.sec.gov/Archives/edgar/data/1426945/000110465919042936/filename1.htm), the principal indicators applied to brokerage reported gross
