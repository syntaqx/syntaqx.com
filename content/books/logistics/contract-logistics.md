+++
title = "Contract Logistics & 3PL Billing"
nav_title = "3PL Billing"
description = "Running warehouses for clients: contract models, rate cards, billing storage and handling from activity, SLAs, multi-client buildings, receipts and liens."
category = "Logistics & Supply Chain Industry"
order = 2842
part = "Warehouses and Yards"
tags = ["logistics", "warehouse", "3pl", "contract-logistics", "billing", "ucc-article-7", "data-model"]
+++

Contract logistics is running warehouses (and often the transportation around them) for someone else under a multi-year contract. GXO ran 1,043 facilities with about 221 million square feet for more than a thousand customers in 2025, on $13,178 million of revenue; Lineage, a cold storage operator, held 10.5 million pallet positions in 501 warehouses; Ryder's supply chain segment ran 319 warehouses with 105 million square feet. Beside them are thousands of regional and specialist operators, and the e-commerce 3PLs whose brand-facing side Commerce covers.

The software problem is billing, more than storage. A 3PL earns money from a rate card or a cost-plus formula applied to what happened in its buildings: pallets received, pallets on hand on the last day of the month, cases picked, orders shipped, labels applied, hours of labor on a special project. Every one of those quantities comes from the WMS, every client's contract prices them differently, and a client's finance team reconciles the invoice against its own records ([3PLs](/books/commerce/warehouses-and-3pls#3pls) describes that side). Billing that is a spreadsheet built from WMS reports at month end leaks revenue (activity never billed), invites disputes (a count nobody can trace) and can't answer "why is this line $4,312.50." Contract logistics also carries a legal relationship most software ignores: a warehouse that stores goods for hire is a bailee under UCC Article 7, with a duty of care, a lien for its charges and rules for what it must print on a warehouse receipt.

This chapter is the operator's side: who the operators are and how they contract, the rate card, billing from activity, worked numbers in Go and Rust, SLAs as the operator measures them, running many clients in one building, and warehouse receipts, liability and liens. It extends `rate_agreements`, `freight_charges` and `parties` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model), and builds on the balances, movements and tasks of [Warehouse Management Systems](/books/logistics/warehouse-management#how-to-build-it) and [Picking, Packing & Labor](/books/logistics/warehouse-operations#how-to-build-it). Contract warehousing economics across the industry (operating ratio, asset-light and asset-based models) are [How Carriers, Brokers & 3PLs Make Money](/books/logistics/logistics-economics).

## How the Operators Do It

As of November 2026, from 2025 annual reports:

| Operator | Footprint | Revenue | Contracts and billing |
| --- | --- | --- | --- |
| **Americold** | 231 temperature-controlled warehouses, about 1.4 billion cubic feet; 2,962 customers, the top 25 at 52% of warehouse revenue | $2,601.8 million, $2,377.1 million of it rent, storage and warehouse services | "Fixed-commitment" arrangements in which customers "pay for guaranteed warehouse space," long-term at production sites; billing "generally occurs monthly," payment terms "generally 0 - 30 days" |
| **GXO Logistics** | 1,043 facilities, about 221 million square feet, about 154,000 team members (about 49,000 of them temporary) in 26 countries | $13,178 million, including $655 million from Wincanton, acquired in April 2024 | "Fixed-price contracts (closed book or hybrid contracts) and cost-plus contracts (open book contracts)," most with a fixed part for the warehouse, technology and equipment and a variable part for volumes and labor; "the vast majority" long-term; no customer over 6% of revenue |
| **Lineage** | 501 warehouses, 3.1 billion cubic feet, 10.5 million pallet positions; more than 11,000 customers, none over 3.6% | $5,355 million, $3,950 million of it Global Warehousing | Warehouse agreements, rate letters and tariff sheets, the last "short-term in nature" and updatable "upon 30 days advance notice"; about 46.1% of storage revenue under minimum storage guarantees; handling "billed transactionally"; billing "no less frequently than on a monthly basis" |
| **Ryder** (Supply Chain Solutions) | 319 warehouses, 105 million square feet (254 and 93 million in the US) | $5,459 million, 43% of Ryder's revenue; about 36% of it distribution management and value-added services | "Long-term contractual arrangements" with "indexed price escalation clauses or permit renegotiation upon a material change" |

Three patterns:

- **Fixed plus variable is the norm.** GXO's contracts cover the building, equipment and technology with a fixed charge and volumes and labor with a variable one; Americold and Lineage sell committed space with transactional handling on top. The system must bill both halves from different sources: the fixed from the contract, the variable from activity.
- **Minimums carry the risk.** Lineage's minimum storage guarantees, on 46.1% of its storage revenue, limit a terminating customer's exposure "to the amount of the guarantee"; a minimum is a line on every period's invoice that tops up activity to the floor, and its arithmetic is part of the contract, not a credit memo.
- **Labor is the cost to price.** Labor was $1,498 million of Lineage's $2,466 million of Global Warehousing operating cost in 2025, and GXO's workforce is 52% in the UK alone. Cost-plus and labor-hour pricing put the labor record from [Picking, Packing & Labor](/books/logistics/warehouse-operations#labor-standards) directly on the invoice.

## Contract Models

The same building can be priced five ways, and a large operator runs all of them:

- **Transactional (rate card).** A price per unit of activity and storage, from a rate letter or tariff sheet. Lineage's tariff sheets can be updated on 30 days' notice; a contract's rate card usually changes only at an anniversary or by an index.
- **Fixed plus variable (closed book).** A monthly fixed fee for the dedicated building, systems and management, plus per-unit or per-hour variable rates. The operator keeps whatever efficiency it achieves and bears the overruns.
- **Cost-plus (open book).** The client pays the operator's allowable costs (labor, rent, equipment, systems) plus a management fee or margin; GXO describes cost-plus as allowable costs plus a specified margin. The client audits the books, so every cost line must trace to a source and an allocation.
- **Hybrid and gainshare.** Open book with a target, where savings or overruns against the target are split by a formula; GXO names hybrid contracts among its fixed-price forms. The target and the split are contract terms that produce a line of their own.
- **Committed space.** The client reserves a number of pallet positions or square feet and pays for them used or not (Americold's fixed commitment, Lineage's minimum guarantees), with activity billed on top.

Revenue recognition follows the shape. Lineage and Americold both separate lease components (accounted for under ASC 842, straight-line) from storage and handling services (ASC 606, satisfied over time), and Lineage counts storage renewals and handling above minimums as variable consideration. A billing system that keeps each line's kind, period and source lets finance apply the policy ([The Product Keeps Facts, Finance Picks Policy](/docs/money/accounting#the-product-keeps-facts-finance-picks-policy)).

## The Rate Card

The charges recur across operators and the WMS vendors that bill for them (Extensiv's rate categories are handling, storage, freight prepaid, freight third party, special charges and materials):

- **Storage.** Per pallet, per location, per cubic foot or per square foot, per period. Extensiv bills recurring storage "monthly, semi-monthly, or weekly," on "the inventory being counted at the end of the previous Billing Period," with examples of "$30 per month per pallet" and "$1 per day per pallet." **Initial storage** is charged "upon the delivery of a receipt" for the first month, and a split day set by the operator decides "if the full month or half month rate should be billed" (split-month billing). Some operators instead bill each receipt's storage on its own anniversary each month. <!-- source-gap: logistics-contract-logistics-anniversary | missing | Anniversary storage billing as an industry practice (storage billed per receipt on each monthly anniversary of its receipt date) | closes with: a WMS vendor's 3PL billing documentation or an operator's published tariff describing anniversary billing | checked: 2026-11-22 -->
- **Handling.** Per pallet, case or unit, in (receiving and putaway) and out (picking and loading), often charged once at receipt for both. Lineage bills handling "transactionally" and measures throughput as inbound plus outbound pallets divided by two.
- **Order and pick fees.** Per order, per line, per unit beyond the first, for e-commerce and store replenishment.
- **Value-added services.** Kitting, labeling, ticketing, inserts, returns processing, each per unit or per hour ([Value-Added Services](/books/logistics/warehouse-operations#value-added-services)).
- **Labor by the hour.** Special projects, cycle counts the client requests, after-hours receiving.
- **Pass-throughs.** Packaging, freight at the operator's carrier rates, and accessorials such as detention charged to the operator by carriers, rebilled at cost or with a markup.
- **Minimums and tiers.** Extensiv supports a "Total Rate Minimum" per transaction, standard tiering that "charges a specific rate for each tier that is utilized," and volume tiering that "charges a specific amount based on which tier the quantity falls within." Monthly account minimums sit on top ([3PLs](/books/commerce/warehouses-and-3pls#3pls) gives a brand-side example).
- **Escalation.** Annual increases fixed in the contract or tied to an index; Ryder's contracts carry "indexed price escalation clauses."

The rate card is data with validity ranges, per client, per facility and often per item class (frozen and ambient stored in the same building at different rates), and every billed line records which rate priced it ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).

## Billing From Activity

The billing pipeline is the playbook's usage billing applied to a warehouse ([The Pipeline](/docs/money/usage-based-billing#the-pipeline)): meter, aggregate, rate, invoice.

- **Meter from the ledger, not from reports.** Every billable event comes from a movement or a task the WMS already recorded: a receipt closed (handling in, initial storage), a pick task completed (pick fees), an order shipped (order fees), a VAS task completed, labor time entries on a project. A billable event points to its source row, so every invoice line can be traced to scans.
- **Storage is a snapshot.** Storage bills from the balances at a cutoff (the end of the previous period, in Extensiv's method), taken in the facility's time zone at a fixed moment and stored, because the balances will have changed by the time anyone asks.
- **Close the period, then rate.** Late scans and corrections arrive after the month ends; the period stays open for a defined grace window, then closes, and a later correction is an adjustment in the next period, not an edit of a sent invoice ([Late Events and Closing a Period](/docs/money/usage-based-billing#late-events-and-closing-a-period)).
- **Apply minimums last.** Activity charges are rated first; minimums and committed-space top-ups compare the total to the floor and add the difference as their own line.
- **Show the evidence.** A client disputing a pick count gets the tasks; one disputing storage gets the snapshot by plate and location ([Disputes Over Counts](/docs/money/usage-based-billing#disputes-over-counts)).

Worked numbers for one client in November, on illustrative rates: storage $14.00 a pallet a month, charged on each receipt as initial storage (half if received on or after the 16th) and then monthly on pallets on hand at the previous period's close; handling $6.50 a pallet in and $6.50 out; a $5,000.00 monthly minimum. The client had 420 pallets at the October 31 close; received 60 pallets on November 6 and 40 on November 20; and shipped 130 pallets.

| Line | Quantity | Rate | Amount |
| --- | --- | --- | --- |
| Recurring storage, on hand at October 31 | 420 pallets | $14.00 | $5,880.00 |
| Initial storage, received November 6 | 60 pallets | $14.00 | $840.00 |
| Initial storage, received November 20 (second half) | 40 pallets | $7.00 | $280.00 |
| Handling in | 100 pallets | $6.50 | $650.00 |
| Handling out | 130 pallets | $6.50 | $845.00 |
| **Total** (above the $5,000.00 minimum, so no top-up) | | | **$8,495.00** |

December's recurring storage then bills on the 390 pallets on hand at the November 30 close (420 + 100 − 130), $5,460.00. The arithmetic, in integer minor units with the split-month rule explicit:

```go tab="Go"
package billing

import "time"

// StorageTerms are one client's storage and handling rates, in minor units.
type StorageTerms struct {
	PerPalletMonth    int64 // recurring and initial storage
	SecondHalfFromDay int   // receipts on or after this day get the second-half rate
	SecondHalfBp      int64 // share of a month charged in the second half, basis points
	HandlingIn        int64 // per pallet
	HandlingOut       int64 // per pallet
	MonthlyMinimum    int64
}

// Receipt is one closed receipt; ReceivedOn is the facility-local date.
type Receipt struct {
	Pallets    int64
	ReceivedOn time.Time
}

// Line is one priced invoice line.
type Line struct {
	Kind     string
	Quantity int64
	Rate     int64
	Amount   int64
}

// roundBp applies basis points with half-up rounding on non-negative amounts.
func roundBp(amount, bp int64) int64 { return (amount*bp + 5000) / 10000 }

// Month prices one client's storage and handling for a period.
func Month(t StorageTerms, onHandAtPriorClose int64, receipts []Receipt, palletsOut int64) []Line {
	lines := []Line{{"storage_recurring", onHandAtPriorClose, t.PerPalletMonth,
		onHandAtPriorClose * t.PerPalletMonth}}
	var palletsIn int64
	for _, r := range receipts {
		rate := t.PerPalletMonth
		if r.ReceivedOn.Day() >= t.SecondHalfFromDay {
			rate = roundBp(t.PerPalletMonth, t.SecondHalfBp)
		}
		lines = append(lines, Line{"storage_initial", r.Pallets, rate, r.Pallets * rate})
		palletsIn += r.Pallets
	}
	lines = append(lines,
		Line{"handling_in", palletsIn, t.HandlingIn, palletsIn * t.HandlingIn},
		Line{"handling_out", palletsOut, t.HandlingOut, palletsOut * t.HandlingOut})

	var total int64
	for _, l := range lines {
		total += l.Amount
	}
	if total < t.MonthlyMinimum {
		lines = append(lines, Line{"minimum_adjustment", 1, t.MonthlyMinimum - total,
			t.MonthlyMinimum - total})
	}
	return lines
}
```

```rust tab="Rust"
use chrono::{Datelike, NaiveDate};

/// One client's storage and handling rates, in minor units.
pub struct StorageTerms {
    pub per_pallet_month: i64,     // recurring and initial storage
    pub second_half_from_day: u32, // receipts on or after this day get the second-half rate
    pub second_half_bp: i64,       // share of a month charged in the second half, basis points
    pub handling_in: i64,          // per pallet
    pub handling_out: i64,         // per pallet
    pub monthly_minimum: i64,
}

/// One closed receipt; received_on is the facility-local date.
pub struct Receipt {
    pub pallets: i64,
    pub received_on: NaiveDate,
}

#[derive(Debug, PartialEq)]
pub struct Line {
    pub kind: &'static str,
    pub quantity: i64,
    pub rate: i64,
    pub amount: i64,
}

/// Basis points with half-up rounding on non-negative amounts.
fn round_bp(amount: i64, bp: i64) -> i64 {
    (amount * bp + 5000) / 10000
}

/// Prices one client's storage and handling for a period.
pub fn month(t: &StorageTerms, on_hand_at_prior_close: i64, receipts: &[Receipt],
             pallets_out: i64) -> Vec<Line> {
    let mut lines = vec![Line {
        kind: "storage_recurring",
        quantity: on_hand_at_prior_close,
        rate: t.per_pallet_month,
        amount: on_hand_at_prior_close * t.per_pallet_month,
    }];
    let mut pallets_in = 0;
    for r in receipts {
        let rate = if r.received_on.day() >= t.second_half_from_day {
            round_bp(t.per_pallet_month, t.second_half_bp)
        } else {
            t.per_pallet_month
        };
        lines.push(Line { kind: "storage_initial", quantity: r.pallets, rate,
                          amount: r.pallets * rate });
        pallets_in += r.pallets;
    }
    lines.push(Line { kind: "handling_in", quantity: pallets_in, rate: t.handling_in,
                      amount: pallets_in * t.handling_in });
    lines.push(Line { kind: "handling_out", quantity: pallets_out, rate: t.handling_out,
                      amount: pallets_out * t.handling_out });

    let total: i64 = lines.iter().map(|l| l.amount).sum();
    if total < t.monthly_minimum {
        let top_up = t.monthly_minimum - total;
        lines.push(Line { kind: "minimum_adjustment", quantity: 1, rate: top_up,
                          amount: top_up });
    }
    lines
}
```

With `PerPalletMonth` 1400, `SecondHalfFromDay` 16, `SecondHalfBp` 5000, handling 650 each way and a minimum of 500000, the function returns the five lines in the table, totaling 849500. Every number on the line (quantity, rate, rule) is stored with it, so the invoice explains itself.

## SLAs From the Operator's Side

The brand's view of 3PL SLAs (cutoffs, ship times, dock-to-stock, accuracy, damage, loss caps) is [SLAs and What They Measure](/books/commerce/warehouses-and-3pls#slas-and-what-they-measure). The operator measures the same things from its own records, per client, per facility and per period, because the contract's credits, penalties and gainshare are computed from them:

- **Dock-to-stock** from the receipt's check-in to close ([Receiving](/books/logistics/warehouse-management#receiving)).
- **Ship on time** from the order's release and ship-by time to the ship confirmation ([Picking, Packing & Labor](/books/logistics/warehouse-operations#waves-waveless-and-order-streaming)).
- **Order accuracy** from mis-ship claims against shipped orders, and **inventory accuracy** from cycle count variances ([Cycle Counting](/books/logistics/warehouse-management#cycle-counting)).
- **Damage and loss** from adjustments with damage and loss reason codes, valued at the contract's liability rate, not the client's retail price.

An SLA's definition is versioned with the contract: what counts (business days, the facility's holidays, orders received before the cutoff), what is excluded (client-caused delays, force majeure, peak exceptions) and what a miss costs. A metric whose definition changed in March is computed with the March definition for March ([Logistics Metrics](/books/logistics/logistics-metrics) owns the catalog of definitions).

## Multi-Client Operations

A shared (multi-client) building holds many clients' stock, labor and dock time at once; a dedicated building serves one. The WMS must make sharing invisible to each client and exact for billing:

- **Owner on everything.** Balances, movements, tasks, receipts and orders all carry the owner, and no allocation crosses owners ([Inventory](/books/logistics/warehouse-management#inventory-where-what-whose-and-in-what-condition)).
- **Client rules as data.** Each client has its own allocation rules (FEFO, minimum shelf life), labels, carrier and routing guide rules, packing rules and billing; they're configuration keyed by owner, never code branches per client.
- **Shared cost allocated by driver.** In a cost-plus or open-book contract, shared labor, space and equipment are allocated to clients by a stated driver (labor hours from tasks by owner, pallet positions occupied, throughput), and the allocation is recorded so the client's audit can recompute it.
- **Data isolation for clients.** Client portals, inventory feeds (an 846 or an API) and reports show one owner's data; the isolation is enforced in the database, the same as any tenant boundary ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)).

## Warehouse Receipts, Liability and Liens

A warehouse that stores goods for hire is a bailee, and in the United States UCC Article 7 sets its duties. The duty of care: a warehouse "is liable for damages for loss of or injury to the goods caused by its failure to exercise care with regard to the goods that a reasonably careful person would exercise under similar circumstances" (UCC 7-204(a)). Liability may be limited by a stated amount per article or item, or per unit of weight, in the receipt or the storage agreement, with the depositor able to ask for higher liability at a higher rate; the limit doesn't apply to conversion of the goods to the warehouse's own use, and the agreement may set reasonable time limits for presenting claims (7-204(b) and (c)).

A **warehouse receipt** is the document the warehouse issues for stored goods, and 7-202 lists what it must contain: the location of the warehouse, the date of issue, the receipt's unique identification code, whether the goods will be delivered to the bearer, to a named person, or to a named person or its order, the rate of storage and handling charges, a description of the goods, the warehouse's signature, any ownership interest of the warehouse in the goods, and the advances made and liabilities incurred for which the warehouse claims a lien; a warehouse that omits one is liable to anyone injured by the omission. Most contract warehouses issue non-negotiable receipts under a master agreement, and the WMS's receipt confirmation (the 944 or its API equivalent) does the operational job; negotiable receipts survive in commodity and finance uses, where the receipt itself carries title.

The **warehouse lien** secures the charges: storage, transportation, insurance, labor and the expenses of preserving or lawfully selling the goods, and, if the receipt or agreement says so, a general lien on the depositor's other goods for unpaid charges on goods stored earlier (7-209). A warehouse "loses its lien on any goods that it voluntarily delivers or unjustifiably refuses to deliver" (7-209(e)), which is why an operator with an unpaid client holds shipments rather than releasing them. Enforcement is a sale: for a merchant's goods, a commercially reasonable sale after notice; for other goods, a demand for payment giving at least 10 days and a sale advertised once a week for two weeks and held at least 15 days after the first advertisement (7-210).

For the system:

- **Liability terms per client,** the per-item or per-weight limit, the claim deadline and any declared higher value, with effective dates; a loss adjustment is valued at the contract's limit and claimed within its deadline.
- **A lien flag per client account,** set by finance, that holds outbound orders for review and records every release decision, because releasing goods releases the lien on them.
- **Receipts that print the required terms,** where the warehouse issues them, generated from the same data the billing uses ([Generated Documents](/docs/building-blocks/generated-documents)).

## How to Build It

The core model prices freight with `rate_agreements` and records every charge as a `freight_charges` row. Contract logistics adds the client account, a warehouse rate table under each agreement, billing periods, billable events metered from the WMS, and storage snapshots; warehouse charges become `freight_charges` rows like any other, which takes two changes to that table's checks: new kinds, and a third subject besides a shipment or a load (a billing period). Changing a core check runs as drop-and-add `NOT VALID`, then `VALIDATE`; the constraint names below are the ones PostgreSQL generates for the core table's unnamed checks, and should be confirmed in `pg_constraint` before running ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
CREATE TABLE warehouse_clients (         -- an operator's client account, per building or network
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  operator_party_id  UUID NOT NULL REFERENCES parties (id),
  client_party_id    UUID NOT NULL REFERENCES parties (id),  -- the depositor; owner of the stock
  account_code       TEXT NOT NULL,
  facility_ids       UUID[] NOT NULL,    -- the buildings this account stores in
  rate_agreement_id  UUID REFERENCES rate_agreements (id),
  liability_per_unit BIGINT,             -- UCC 7-204(b) limit, minor units
  liability_basis    TEXT CHECK (liability_basis IN ('per_item', 'per_lb', 'per_kg',
                       'declared_value')),
  claim_deadline_days SMALLINT,
  general_lien       BOOLEAN NOT NULL DEFAULT FALSE,  -- the receipt or agreement grants one
  lien_hold          BOOLEAN NOT NULL DEFAULT FALSE,  -- finance is holding outbound for charges
  status             TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'exiting', 'closed')),
  UNIQUE (operator_party_id, account_code)
);

ALTER TABLE rate_agreements
  ADD COLUMN pricing_model     TEXT,     -- 'transactional', 'fixed_variable', 'cost_plus',
                                         -- 'hybrid_gainshare', 'committed_space'
  ADD COLUMN management_fee_bp INT,      -- cost-plus margin, basis points
  ADD COLUMN monthly_minimum   BIGINT,   -- minor units, in the agreement's currency
  ADD COLUMN escalation_rule   JSONB;    -- {"index": "...", "on": "anniversary", "cap_bp": 500}
ALTER TABLE rate_agreements ADD CONSTRAINT rate_agreements_pricing_model_check
  CHECK (pricing_model IS NULL OR pricing_model IN ('transactional', 'fixed_variable',
    'cost_plus', 'hybrid_gainshare', 'committed_space')) NOT VALID;

CREATE TABLE warehouse_rates (           -- one priced service inside an agreement
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  rate_agreement_id UUID NOT NULL REFERENCES rate_agreements (id),
  facility_id       UUID REFERENCES facilities (id),  -- null: every building on the account
  service           TEXT NOT NULL CHECK (service IN ('storage_recurring', 'storage_initial',
                      'handling_in', 'handling_out', 'order_fee', 'pick_fee', 'vas',
                      'labor_hour', 'fixed_fee', 'pass_through', 'committed_space')),
  service_code      TEXT,                -- the VAS or accessorial code, as the rate card names it
  basis             TEXT NOT NULL CHECK (basis IN ('per_pallet', 'per_case', 'per_unit',
                      'per_order', 'per_line', 'per_cubic_foot', 'per_location', 'per_hour',
                      'per_period', 'cost_plus_pct')),
  period            TEXT CHECK (period IN ('day', 'week', 'semi_month', 'month')),
  rate              NUMERIC(14, 4) NOT NULL,  -- minor units per basis unit
  split_month       BOOLEAN NOT NULL DEFAULT FALSE,  -- initial storage halves after the split day
  split_day         SMALLINT,
  item_class        TEXT,                -- 'frozen', 'ambient', 'hazmat'; null: all
  tiers             JSONB,               -- [{"from": 0, "to": 1000, "rate": 650}], with tier_mode
  tier_mode         TEXT CHECK (tier_mode IN ('standard', 'volume')),
  minimum_per_txn   BIGINT,
  valid_during      TSTZRANGE NOT NULL
);

CREATE TABLE warehouse_billing_periods ( -- one client's period, from open to invoiced
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  warehouse_client_id UUID NOT NULL REFERENCES warehouse_clients (id),
  period              TSTZRANGE NOT NULL, -- bounds at the facility's local midnight
  snapshot_at         TIMESTAMPTZ NOT NULL,  -- when storage was counted
  status              TEXT NOT NULL CHECK (status IN ('open', 'grace', 'closed', 'rated',
                        'invoiced')),
  freight_invoice_id  UUID REFERENCES freight_invoices (id),
  EXCLUDE USING gist (warehouse_client_id WITH =, period WITH &&)
);

CREATE TABLE warehouse_storage_snapshots (  -- what was on hand at the cutoff, by plate
  billing_period_id UUID NOT NULL REFERENCES warehouse_billing_periods (id),
  balance_id        UUID NOT NULL REFERENCES inventory_balances (id),
  lpn_id            UUID REFERENCES warehouse_lpns (id),
  location_id       UUID NOT NULL REFERENCES warehouse_locations (id),
  item_id           UUID NOT NULL REFERENCES items (id),
  quantity          NUMERIC(14, 3) NOT NULL,
  pallets           NUMERIC(8, 2) NOT NULL,  -- as the rate's basis counts them
  cubic_cm          BIGINT,
  PRIMARY KEY (billing_period_id, balance_id)
);

CREATE TABLE warehouse_billable_events ( -- metered activity, each traced to its source
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  warehouse_client_id UUID NOT NULL REFERENCES warehouse_clients (id),
  facility_id         UUID NOT NULL REFERENCES facilities (id),
  service             TEXT NOT NULL,     -- matches warehouse_rates.service
  service_code        TEXT,
  quantity            NUMERIC(14, 3) NOT NULL CHECK (quantity > 0),
  basis               TEXT NOT NULL,
  source_kind         TEXT NOT NULL CHECK (source_kind IN ('receipt', 'movement', 'task',
                        'order', 'labor_time', 'manual')),
  source_id           UUID NOT NULL,     -- the receipt, movement, task, order or time entry
  occurred_at         TIMESTAMPTZ NOT NULL,
  billing_period_id   UUID REFERENCES warehouse_billing_periods (id),  -- set when assigned
  freight_charge_id   UUID REFERENCES freight_charges (id),            -- set when rated
  UNIQUE NULLS NOT DISTINCT (service, source_kind, source_id, service_code)  -- billed once
);
CREATE INDEX ON warehouse_billable_events (warehouse_client_id, occurred_at);

ALTER TABLE freight_charges
  ADD COLUMN warehouse_billing_period_id UUID,
  ADD COLUMN warehouse_rate_id           UUID;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_warehouse_period_fkey
  FOREIGN KEY (warehouse_billing_period_id) REFERENCES warehouse_billing_periods (id) NOT VALID;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_warehouse_rate_fkey
  FOREIGN KEY (warehouse_rate_id) REFERENCES warehouse_rates (id) NOT VALID;

ALTER TABLE freight_charges DROP CONSTRAINT freight_charges_kind_check;
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_kind_check
  CHECK (kind IN ('linehaul', 'fuel_surcharge', 'accessorial', 'detention', 'layover',
    'truck_ordered_not_used', 'lumper', 'stop_off', 'minimum_adjustment', 'discount', 'reweigh',
    'demurrage', 'per_diem', 'chassis', 'terminal_handling', 'drayage', 'ocean_freight',
    'air_freight', 'duty', 'government_fee', 'brokerage_fee', 'filing_fee', 'quick_pay_fee',
    'chargeback', 'other',
    'storage', 'handling', 'order_fee', 'value_added_service', 'warehouse_labor',
    'fixed_fee', 'management_fee', 'gainshare')) NOT VALID;

ALTER TABLE freight_charges DROP CONSTRAINT freight_charges_check;  -- shipment or load
ALTER TABLE freight_charges ADD CONSTRAINT freight_charges_subject_check
  CHECK (shipment_id IS NOT NULL OR load_id IS NOT NULL
         OR warehouse_billing_period_id IS NOT NULL) NOT VALID;

ALTER TABLE rate_agreements VALIDATE CONSTRAINT rate_agreements_pricing_model_check;
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_warehouse_period_fkey;
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_warehouse_rate_fkey;
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_kind_check;
ALTER TABLE freight_charges VALIDATE CONSTRAINT freight_charges_subject_check;
```

Recurring storage for a period is a sum over its snapshot, priced by the rate in force at the snapshot:

```sql
SELECT c.id AS warehouse_client_id, r.id AS warehouse_rate_id,
       SUM(s.pallets) AS pallets, r.rate,
       ROUND(SUM(s.pallets) * r.rate) AS amount   -- minor units, rounded once
FROM warehouse_billing_periods p
JOIN warehouse_clients c ON c.id = p.warehouse_client_id
JOIN warehouse_storage_snapshots s ON s.billing_period_id = p.id
JOIN warehouse_rates r ON r.rate_agreement_id = c.rate_agreement_id
 AND r.service = 'storage_recurring' AND r.basis = 'per_pallet'
 AND r.valid_during @> p.snapshot_at
WHERE p.id = $1
GROUP BY c.id, r.id, r.rate;
```

Design notes:

- **Bill from sources, once.** Each billable event names its source row, and the unique key stops a receipt or task from being billed twice when the meter reruns ([Metering Events](/docs/money/usage-based-billing#metering-events)).
- **Snapshots are stored, not recomputed.** Storage is billed from the snapshot taken at the cutoff; a later count correction is an adjustment in a later period with its own line.
- **Charges are freight charges.** Warehouse lines are receivable `freight_charges` rows with the period as their subject, so revenue, accruals, invoicing and audit run through one table; payable lines (a subcontracted building, rented equipment) are the same rows with the other side.
- **The brand's records map.** A receivable storage or pick line here is, in the brand's Commerce records, an order charge of kind `fulfillment_fee` or a line on a reconciled monthly document ([How to Build It](/books/commerce/warehouses-and-3pls#how-to-build-it)); sharing the billable event's source references lets both sides reconcile line by line.
- **Minimums and gainshare are computed lines.** They're rated after activity, from the agreement's terms, with the inputs stored on the line.
- **Liability and liens are account data.** Limits, claim deadlines and lien holds live on the client account with effective dates, and outbound release checks the hold.
- **Emit billing events.** `billing_period.closed`, `billing_period.rated`, `warehouse_invoice.issued` and `lien_hold.changed` are what finance, the client portal and the WMS's outbound checks subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every rate,** with its agreement, validity, tiers and minimums, so a line can be repriced from the terms in force.
- **Every billable event** with its source row, and every source event with no billable event (the leakage report).
- **Every storage snapshot,** by plate and location at the cutoff time, as billed.
- **Every period's close, rating and invoice,** with late adjustments carried into the next period and the reason.
- **Every cost allocation** in open-book contracts, with the driver and its quantities, for the client's audit.
- **Every loss and damage adjustment** valued at the contract's limit, and every claim against its deadline.
- **Every lien hold and release decision,** by whom and when.

## What This Means for the System You Build

- **Keep the contract model on the agreement** and the rate card as versioned rows per client, facility and item class.
- **Meter billable events from WMS movements, tasks and receipts,** each traced to its source and billed once.
- **Bill storage from a stored snapshot** at a fixed cutoff in the facility's zone, with split-month or other proration as an explicit rule.
- **Close periods, rate, then apply minimums,** and correct sent invoices only with adjustments.
- **Record warehouse charges as freight charges** with the billing period as their subject.
- **Measure SLAs per client from your own timestamps** with versioned definitions.
- **Run multi-client buildings with owner on every row** and client rules as data.
- **Model UCC Article 7 terms on the account:** liability limits, claim deadlines, the lien and holds that protect it.

## References

**Filings**

- [GXO Logistics: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1852244/000185224426000007/gxo-20251231.htm), revenue, Wincanton, facilities, square footage, team members, countries, customer concentration and contract types
- [Lineage: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1868159/000186815926000012/line-20251231.htm), warehouses, cubic feet, pallet positions, customers, segment revenue and cost of operations, minimum storage guarantees, contract forms, transactional handling, throughput, revenue recognition and lease components
- [Americold Realty Trust: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1455863/000162828026012274/art-20251231.htm), warehouses, cubic feet, customers, revenue by type, fixed-commitment arrangements, monthly billing, payment terms and lease revenue
- [Ryder System: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/85961/000008596126000007/r-20251231.htm), Supply Chain Solutions revenue and mix, warehouses and square footage, and contract escalation terms

**Statutes**

- [UCC 7-202: Form of warehouse receipt; effect of omission](https://www.law.cornell.edu/ucc/7/7-202), the required terms
- [UCC 7-204: Duty of care; contractual limitation of warehouse's liability](https://www.law.cornell.edu/ucc/7/7-204), the duty of care, limits per item or weight, conversion and claim time limits
- [UCC 7-209: Lien of warehouse](https://www.law.cornell.edu/ucc/7/7-209), the charges secured, the general lien and loss of the lien on voluntary delivery
- [UCC 7-210: Enforcement of warehouse's lien](https://www.law.cornell.edu/ucc/7/7-210), sale of merchants' goods and the notice, advertising and timing for other goods

**WMS billing documentation**

- [Extensiv: Understanding recurring storage charges](https://help.extensiv.com/en_US/billing-setup/understanding-recurring-storage-charges), billing periods, end-of-period counts and per-pallet rates
- [Extensiv: Initial storage charges](https://help.extensiv.com/en_US/billing-best-practices-for-receiving/initial-storage-charges), charging the first month on receipt and the split day choosing a full or half month rate
- [Extensiv: Common terminologies in rate creation](https://help.extensiv.com/en_US/rate-concepts-terminology/common-terminologies-in-rate-creation), transaction minimums, standard and volume tiering, and charge categories
