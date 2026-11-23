+++
title = "Freight Audit & Payment"
description = "Checking freight bills before and after payment: what an audit tests, duplicates, tolerances, GL coding, accruals, and how audit-and-pay providers fund."
category = "Logistics & Supply Chain Industry"
order = 2844
part = "Freight Money"
tags = ["logistics", "freight", "freight-audit", "accounts-payable", "accruals", "gl-coding", "data-model"]
+++

Freight audit is checking a carrier's bill against what was agreed and what happened before the money leaves; freight payment is paying it, on time, to the right party, and telling accounting where the cost belongs. A shipper with hundreds of carriers across parcel, LTL, truckload, ocean and air receives bills in every format, at every level of accuracy, against rate agreements that change by lane and by month, and most shippers of size hand the job to a freight audit and payment (FAP) provider or run it inside their TMS. Cass Information Systems paid 34.451 million transportation invoices worth $36.447 billion for its customers in 2025; Triumph's Payments segment "processed 33,562,731 invoices paying a total of $40.517 billion" the same year, on a network that connects brokers, shippers, factors and carriers. A broker runs the same audit on the buy side of every load before it pays the carrier.

It is hard because an audit is a join across records that arrive at different times from different companies. The rate in force on the pickup date, the fuel index for the right week, the accessorial terms in the contract version the carrier signed, the stop times that prove detention, the reweigh certificate, the carrier's earlier bill for the same shipment: each is a separate record, and a bill is only as right as the weakest match. The audit has to decide quickly, because terms are short and carriers short-paid without a reason call; it has to be explainable, because every exception is a negotiation; and it has to feed accounting twice, once as an accrual before the bill arrives and again as an actual when it is approved. This chapter covers how the providers do it, what an audit checks, duplicates, tolerances and exceptions (with a matcher in Go and Rust), GL coding and allocation, accruals, how payment is funded, and the broker's version of the same work. Issuing and receiving the bill is [Freight Invoicing & Settlement](/books/logistics/freight-invoicing); paying carriers and factors is [Paying Carriers, Quick Pay & Factoring](/books/logistics/paying-carriers); the accounting entries are [Logistics Accounting](/books/logistics/logistics-accounting).

## How the Platforms Do It

As of November 2026, from filings and vendor pages:

| Provider | Model | Scale and claims (dated) | What it says it does |
| --- | --- | --- | --- |
| **Cass Information Systems** | Freight audit and payment with its own commercial bank | 34.451 million transportation invoices, $36.447 billion in 2025 (10-K); more than 15,000 carriers in its payment network (">15,000" on its page) | "freight invoice rating, payment processing, auditing, and the generation of accounting and transportation information"; owning a bank lets it "manage the movement of funds from its customers to their suppliers"; acquired AcuAudit, which its 10-K credits with offsetting lower volumes in processing fees |
| **CTSI-Global** | Freight audit and payment, parcel spend management, a TMS | "FOUNDED 1957" | "Freight invoice audit, processing, and payment" |
| **Data2Logistics** | Freight and parcel audit and carrier payments | Claims of "5-7%" spend reduction from audits, by its own page | "Automate 99% of freight and parcel audits"; works with carriers "to produce accurate invoices" |
| **Intelligent Audit** | Freight and parcel audit, claims | "2.1B+ shipments audited last year," by its own page | "150+ audit points for any mode"; parcel "direct integrations with top carriers"; a claims management program |
| **Trax** | Freight audit and payment, global | "$25B" of transportation spend managed and 120 countries supported, by its own page | "100% invoice audit across all modes, carriers, and regions down to the charge code level"; normalizes carrier data; "general ledger assignment including SKU and charge-level" |
| **Triumph (Payments segment)** | A payments network for brokers, shippers, factors and carriers | 33,562,731 invoices and $40.517 billion paid in 2025; 11% of segment revenue (10-K) | "the presentment, audit and payment of transportation invoices"; HubTran's "workflow solutions for the processing and approval of Carrier Invoices"; quick pay; "the management of notices of assignment" |

Three patterns:

- **Audit is sold as coverage.** Trax claims every invoice to the charge code, Intelligent Audit 150+ audit points for any mode, Data2Logistics automation of 99% of audits: the pitch is checking each bill, line by line, rather than sampling. The claims are vendors' own and unaudited; the point for a buyer's system is that line-level audit needs line-level data (charge codes, not totals).
- **Payment and audit come together because the money is the leverage.** A provider that audits but doesn't pay can only recommend; one that pays holds the payment until the exception is resolved. Cass's bank and Triumph's network exist for that reason.
- **Normalization is the product.** Trax lists normalizing "thousands of global data formats" as a feature, and every provider's first step is turning 210s, ocean invoices, parcel files and PDFs into one line model. That model is the core `freight_invoice_lines` with its code as billed and a mapped kind.

## Pre-Audit, Post-Audit and Recovery

**Pre-audit** (or pre-payment audit) checks a bill before it is approved for payment; exceptions are held, short paid or sent back. **Post-audit** reviews bills already paid, usually by a different firm, looking for overcharges and duplicates to recover; its findings become overcharge claims against the collecting carrier, under the 49 CFR 378 procedure and the 180-day and 18-month clocks in [Overcharges and Duplicate Payments](/books/logistics/freight-invoicing#overcharges-and-duplicate-payments). Parcel adds **service refunds**: a carrier's money-back guarantee, where it offers one and hasn't suspended it, makes delivery timestamps an audit input, not just a tracking display; FedEx's guarantee, for example, can be "suspended, modified, or revoked" at its discretion, and the shipper's side of parcel service is Commerce's ([Shipping & Carriers](/books/commerce/shipping-and-carriers)).

My rule: build pre-audit into the payment path, so no payable invoice reaches `approved` without an audit result, and keep post-audit as a separate review that writes claims, never edits approved invoices.

## What an Audit Checks

Each check reads specific records, in this order (a bill that fails the first has no point being rated):

1. **Is it a bill this company owes?** The issuer is a known carrier party with the carrier role; the bill-to is this company (or a client, for a 3PL); the shipment or load exists and this carrier was the one tendered and accepted (the `tenders` row [Tendering & Acceptance](/books/logistics/tendering#the-tender-state-machine) records). A bill from a carrier the load was never awarded to is either a misroute or a fraud signal ([Freight Fraud & Cargo Theft](/books/logistics/freight-fraud) covers double brokering).
2. **Is it a duplicate?** The next section.
3. **Did it happen?** The load is delivered, with the proof the bill-to requires attached ([The Proof That Gates the Bill](/books/logistics/freight-invoicing#the-proof-that-gates-the-bill)).
4. **Is the rate right?** Re-rate the shipment with the rate agreement and lane rate in force on the pickup date, not today's, and compare line by line: linehaul, minimums, discounts off a base tariff, fuel surcharge at the index value for the week the schedule names. The rating engine and fuel tables are [Rating, Tariffs & Accessorials](/books/logistics/rating-and-accessorials#the-rating-engine); the audit calls the same engine with the same inputs and keeps the result.
5. **Are the measurements right?** Weight, class, density and dimensions against the bill of lading and the handling units as tendered, and against the carrier's reweigh or inspection record where it billed a correction ([Reweighs, Inspections and Reclassification](/books/logistics/freight-classification#reweighs-inspections-and-reclassification)).
6. **Is every accessorial supported?** Each billed accessorial has an agreed rate (in the contract or tariff) and the evidence its rule needs: arrival and departure times for detention, a lumper receipt, a liftgate or residential flag on the shipment, a TONU confirmation.
7. **Is the math right?** Quantity times rate equals each line's amount, rounded once; lines sum to the stated total ([Rounding](/docs/money/amounts#rounding)).
8. **Is the payee right?** The invoice's payee is the carrier, or the factor on a verified notice of assignment; never a new bank account without the controls in [Paying Carriers, Quick Pay & Factoring](/books/logistics/paying-carriers).

The output is a result per line and per invoice, kept with the inputs it read: which agreement version, which index value, which events. A carrier disputing a short pay months later gets the same answer the audit gave, because the audit stored what it saw rather than re-reading today's data.

## Duplicates

Duplicate payment is the most expensive audit failure, because the money is gone and recovering it is a claim. The regulation defines it plainly, "two or more payments for transporting the same shipment" (49 CFR 378.2(c)), and a carrier that finds one must refund it within 30 days (378.9(b)), but the payer's system is where it should be stopped. The layers:

- **Exact.** Same issuer, same invoice number: the core `UNIQUE (side, issuer_party_id, number)` refuses the second row.
- **Same shipment, different number.** The carrier rebills with a suffix, sends a PDF and a 210 with different numbers, or bills through a factor and directly. Match on the shipment's identifiers (PRO, BOL number, load number) and the charge kinds: a second linehaul on the same shipment from the same carrier is a duplicate unless the first was voided.
- **Same load, different carrier.** Two carriers bill the same load: one hauled it, one is claiming it (a double-brokering pattern) or a carrier change wasn't recorded. Hold both until the tender and pickup records say who hauled it.
- **Across channels.** The same bill arriving by EDI, email, portal and a FAP provider's file. Intake deduplicates on the document's content hash (the core `documents.sha256`) and on the identifier match above before the audit runs.

A bill flagged as a possible duplicate is held, never auto-rejected: a balance-due bill and a corrected invoice look like duplicates and are legitimate ([Corrections: Rebills, Balance-Due Bills and Credits](/books/logistics/freight-invoicing#corrections-rebills-balance-due-bills-and-credits)).

## Tolerances and Exceptions

Few bills match the rating to the cent, and chasing every cent costs more than it saves. Every audit program therefore has tolerances: an amount or a percentage, per charge kind and often per carrier, inside which a difference is accepted. Outside it, the line is an exception with one of three dispositions: **approve at rated** (pay what the audit computed, short paying the difference with a reason), **hold** (wait for evidence or a rebill), or **approve as billed** by a person with authority, recorded with the reason. The tolerances are rules as data with effective dates, because a buyer that tightens them in March must still be able to explain February's approvals ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).

A worked match, on the carrier side of the business chapter's brokered truckload ([A Brokered Truckload](/books/logistics/logistics-business#a-brokered-truckload)): the confirmed lines are $1,700.00 linehaul, $624.00 fuel and $100.00 detention. The carrier's 210 bills $1,700.00 linehaul, $648.00 fuel (800 miles at $0.81, from the prior week's $6.127 index: 81 whole steps), $150.00 detention (three hours) and a $75.00 lumper charge. With illustrative tolerances (linehaul exact; fuel the greater of $5.00 or 1%; detention exact; an unrated accessorial always an exception):

| Line | Rated | Billed | Difference | Tolerance | Result | Approved now |
| --- | --- | --- | --- | --- | --- | --- |
| Linehaul | $1,700.00 | $1,700.00 | $0.00 | $0.00 | Match | $1,700.00 |
| Fuel surcharge | $624.00 | $648.00 | +$24.00 | $6.24 | Over: approve at rated | $624.00 |
| Detention | $100.00 | $150.00 | +$50.00 | $0.00 | Over: hold for stop times | $100.00 |
| Lumper | none | $75.00 | +$75.00 | none | Unrated: hold for receipt | $0.00 |
| **Total** | **$2,424.00** | **$2,573.00** | **+$149.00** | | | **$2,424.00** |

The approved amount pays on terms; $24.00 is short paid with a fuel-index reason; $125.00 waits for evidence (stop times showing a third billable hour, the lumper receipt), and becomes payable or disputed when it arrives. The matcher, in integer minor units and basis points:

```go tab="Go"
// Tolerance is the accepted difference for one charge kind: the greater of an
// absolute amount and a share of the rated amount.
type Tolerance struct {
	AbsMinor int64 // minor units
	PctBP    int64 // basis points of the rated amount
}

type Line struct {
	Kind  string // a freight_charges kind, mapped from the billed code
	Minor int64  // signed minor units
}

type Result struct {
	Kind           string
	Rated, Billed  int64
	Approved, Held int64
	ShortPaid      int64
	Outcome        string // "match", "within_tolerance", "over_short_pay", "over_hold", "under", "unrated", "not_billed"
}

// Match compares billed lines with rated ones, kind by kind. holdKinds lists the
// kinds whose overage waits for evidence instead of being short paid.
func Match(rated, billed []Line, tol map[string]Tolerance, holdKinds map[string]bool) []Result {
	sum := func(lines []Line) map[string]int64 {
		m := map[string]int64{}
		for _, l := range lines {
			m[l.Kind] += l.Minor
		}
		return m
	}
	r, b := sum(rated), sum(billed)
	var out []Result
	for kind, billedAmt := range b {
		ratedAmt, ok := r[kind]
		res := Result{Kind: kind, Rated: ratedAmt, Billed: billedAmt}
		switch {
		case !ok:
			res.Outcome, res.Held = "unrated", billedAmt
		case billedAmt == ratedAmt:
			res.Outcome, res.Approved = "match", billedAmt
		case billedAmt < ratedAmt:
			res.Outcome, res.Approved = "under", billedAmt // pay what was billed; flag the rating
		default:
			t := tol[kind]
			allowed := max(t.AbsMinor, ratedAmt*t.PctBP/10000)
			diff := billedAmt - ratedAmt
			switch {
			case diff <= allowed:
				res.Outcome, res.Approved = "within_tolerance", billedAmt
			case holdKinds[kind]:
				res.Outcome, res.Approved, res.Held = "over_hold", ratedAmt, diff
			default:
				res.Outcome, res.Approved, res.ShortPaid = "over_short_pay", ratedAmt, diff
			}
		}
		out = append(out, res)
	}
	for kind, ratedAmt := range r {
		if _, ok := b[kind]; !ok {
			out = append(out, Result{Kind: kind, Rated: ratedAmt, Outcome: "not_billed"})
		}
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Kind < out[j].Kind })
	return out
}
```

```rust tab="Rust"
use std::collections::{BTreeMap, HashMap, HashSet};

/// The accepted difference for one charge kind: the greater of an absolute
/// amount and a share of the rated amount.
#[derive(Clone, Copy, Default)]
pub struct Tolerance {
    pub abs_minor: i64, // minor units
    pub pct_bp: i64,    // basis points of the rated amount
}

#[derive(Debug, PartialEq)]
pub enum Outcome { Match, WithinTolerance, OverShortPay, OverHold, Under, Unrated, NotBilled }

#[derive(Debug)]
pub struct AuditResult {
    pub kind: String,
    pub rated: i64,
    pub billed: i64,
    pub approved: i64,
    pub held: i64,
    pub short_paid: i64,
    pub outcome: Outcome,
}

fn sum(lines: &[(String, i64)]) -> BTreeMap<String, i64> {
    let mut m = BTreeMap::new();
    for (kind, minor) in lines {
        *m.entry(kind.clone()).or_insert(0) += minor;
    }
    m
}

/// Compares billed lines with rated ones, kind by kind. `hold_kinds` lists the
/// kinds whose overage waits for evidence instead of being short paid.
pub fn match_lines(
    rated: &[(String, i64)],
    billed: &[(String, i64)],
    tol: &HashMap<String, Tolerance>,
    hold_kinds: &HashSet<String>,
) -> Vec<AuditResult> {
    let (r, b) = (sum(rated), sum(billed));
    let mut out = Vec::new();
    for (kind, &billed_amt) in &b {
        let mut res = AuditResult { kind: kind.clone(), rated: 0, billed: billed_amt,
            approved: 0, held: 0, short_paid: 0, outcome: Outcome::Unrated };
        match r.get(kind) {
            None => res.held = billed_amt,
            Some(&rated_amt) => {
                res.rated = rated_amt;
                if billed_amt == rated_amt {
                    (res.outcome, res.approved) = (Outcome::Match, billed_amt);
                } else if billed_amt < rated_amt {
                    (res.outcome, res.approved) = (Outcome::Under, billed_amt);
                } else {
                    let t = tol.get(kind).copied().unwrap_or_default();
                    let allowed = t.abs_minor.max(rated_amt * t.pct_bp / 10_000);
                    let diff = billed_amt - rated_amt;
                    if diff <= allowed {
                        (res.outcome, res.approved) = (Outcome::WithinTolerance, billed_amt);
                    } else if hold_kinds.contains(kind) {
                        (res.outcome, res.approved, res.held) = (Outcome::OverHold, rated_amt, diff);
                    } else {
                        (res.outcome, res.approved, res.short_paid) =
                            (Outcome::OverShortPay, rated_amt, diff);
                    }
                }
            }
        }
        out.push(res);
    }
    for (kind, &rated_amt) in &r {
        if !b.contains_key(kind) {
            out.push(AuditResult { kind: kind.clone(), rated: rated_amt, billed: 0,
                approved: 0, held: 0, short_paid: 0, outcome: Outcome::NotBilled });
        }
    }
    out.sort_by(|x, y| x.kind.cmp(&y.kind));
    out
}
```

On the table's inputs, with fuel at 500 minor units or 100 basis points and detention in the hold set, both return linehaul `match` (170,000 approved), fuel `over_short_pay` (62,400 approved, 2,400 short paid), detention `over_hold` (10,000 approved, 5,000 held) and lumper `unrated` (7,500 held): 242,400 approved of 257,300 billed. Two choices are policy, not code, and belong in the rules: whether an underbilled line is paid as billed (the default above, flagged so the rating can be fixed) or as rated, and which kinds hold rather than short pay. The kinds are compared after the billed codes are mapped, so an unmapped code (a carrier's new accessorial code) arrives as its own kind and lands in `unrated`, which is the right answer.

## GL Coding and Allocation

An approved bill becomes cost, and accounting needs to know whose: which legal entity, cost center, plant or customer, which general ledger account (inbound freight, outbound freight, returns, expedited, demurrage), and for some companies which order, SKU or product line. FAP providers sell this as a feature (Trax lists "general ledger assignment including SKU and charge-level"); a shipper's TMS does it from the shipment's own records. The rules:

- **Code from the shipment, not the invoice.** The bill carries the carrier's view; the shipment knows its origin, destination, order type, customer and business unit. Coding rules read shipment facts and the charge kind, versioned as rules with effective dates.
- **Allocate multi-shipment costs by a stated basis.** A multi-stop truckload's linehaul is one carrier charge serving several shipments and orders; allocate it by weight, cube, distance, pallet count or revenue, by policy, and store each allocation row with the basis and the inputs, so the allocations sum exactly to the charge (remainders go to one row by rule).
- **Inbound and outbound differ.** Whether inbound freight is part of inventory cost or a period expense is the company's accounting policy, decided by finance; the system's job is to tag the charge as inbound and link it to the receipt and the purchase order line, so either policy can be applied ([The Product Keeps Facts, Finance Picks Policy](/docs/money/accounting#the-product-keeps-facts-finance-picks-policy)).

## Accruals

Freight is incurred when it moves and billed days or weeks later, so at month end a shipper (and a broker on its buy side) owes carriers for shipments not yet invoiced. The accrual is the estimate of that cost, and the core model already holds it: a tender creates `estimated` payable charges and pickup moves them to `accrued` ([The Core Data Model](/books/logistics/logistics-business#the-core-data-model)'s design notes). At close, the accrual is the sum of accrued payable charges not yet matched to an approved invoice line; when the invoice is approved, the matched charges become actuals and the difference between accrual and invoice is recognized in the period the invoice is approved, not reached back into a closed period ([Closed Periods Stay Closed](/docs/money/accounting#closed-periods-stay-closed)). How the accrual and the matching revenue are presented is [Logistics Accounting](/books/logistics/logistics-accounting); what the audit adds is the accrual's accuracy, measured as the difference between accrued and approved amounts by carrier and lane, which is a direct test of the rate data.

## Funding the Payment

A FAP provider that pays carriers on the shipper's behalf needs the shipper's money first, or pays first and collects later. Cass describes both sides in its 10-K: "In certain circumstances, Cass remits payment of invoices prior to receiving funds from its customers," and "Cass could experience losses if such funds are not received from customers after payment is remitted"; its average payments in advance of funding were $175.1 million in 2025. The money it holds between collecting from shippers and paying carriers earns it income: its interest income and payment fees "are affected by the amount of time Cass holds the funds prior to payment and the dollar volume processed," and its average accounts and drafts payable were $1.16 billion in 2025. Triumph says the same of its network: "at any given time, we may be holding or directing funds of Payments customers."

For a system that pays on someone else's behalf, the funding model is a design decision with regulatory weight: pull then pay, prefund a balance, or pay then collect under a credit line, each with the risks [Funding: Whose Money, and When](/books/payments/vendor-payouts#funding-whose-money-and-when) describes, and the money-transmission question it raises. The freight-specific parts are the funding request (a file of approved invoices with their due dates sent to the shipper, who funds the total by a cutoff) and the hold: an invoice approved but not funded is not paid, and the carrier asking where its money is needs to hear which.

## The Broker's Version

A broker audits the buy side of every load against its own rate confirmation rather than a contract rate table: the confirmed linehaul, the confirmed accessorials, and any accessorial approved after pickup as a new confirmation version ([How Freight Brokerage Works](/books/logistics/freight-brokerage#how-to-build-it) records them as `rate_confirmations` versions). The documents arrive from the carrier or its factor (TQL asks factored carriers to send documents to the factor, not to TQL), the payee check carries more weight because carriers change factors and fraud targets the remit-to, and the margin view ([A Brokered Truckload](/books/logistics/logistics-business#a-brokered-truckload)) shows the cost of every approved exception directly. Triumph's network sells brokers the same functions a shipper buys from a FAP provider: invoice capture, the match to the load, approval, and payment to carrier or factor.

## How to Build It

The deltas add audit results and exceptions, tolerances as rules, GL allocations and funding requests:

```sql
ALTER TABLE freight_invoices
  ADD COLUMN audit_status       TEXT,          -- null until audited
  ADD COLUMN audited_at         TIMESTAMPTZ,
  ADD COLUMN approved_amount    BIGINT,        -- the sum of approved line amounts
  ADD COLUMN duplicate_of_id    UUID REFERENCES freight_invoices (id);
ALTER TABLE freight_invoices ADD CONSTRAINT freight_invoices_audit_status_check
  CHECK (audit_status IN ('passed', 'passed_with_adjustments', 'exceptions', 'duplicate_suspect',
    'rejected')) NOT VALID;
-- cross-channel duplicates match on the core documents.sha256, through freight_invoices.document_id
CREATE INDEX CONCURRENTLY documents_sha256_idx ON documents (sha256);
ALTER TABLE freight_invoices VALIDATE CONSTRAINT freight_invoices_audit_status_check;

CREATE TABLE freight_audit_tolerances (        -- accepted differences, as rules
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),  -- the shipper or broker auditing
  carrier_party_id  UUID REFERENCES parties (id),           -- null: every carrier
  charge_kind       TEXT NOT NULL,             -- a freight_charges kind
  abs_minor         BIGINT NOT NULL DEFAULT 0 CHECK (abs_minor >= 0),
  pct_bp            INT NOT NULL DEFAULT 0 CHECK (pct_bp BETWEEN 0 AND 10000),
  over_action       TEXT NOT NULL CHECK (over_action IN ('short_pay', 'hold', 'approve')),
  under_action      TEXT NOT NULL DEFAULT 'pay_billed' CHECK (under_action IN ('pay_billed',
                      'pay_rated', 'hold')),
  currency          CHAR(3) NOT NULL,
  valid_during      TSTZRANGE NOT NULL,
  approved_by       TEXT NOT NULL
);

CREATE TABLE freight_audit_runs (              -- one audit of one invoice, with what it read
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_invoice_id  UUID NOT NULL REFERENCES freight_invoices (id),
  kind                TEXT NOT NULL CHECK (kind IN ('pre_audit', 'post_audit', 're_audit')),
  engine_version      TEXT NOT NULL,           -- the rating engine and rule set used
  rate_agreement_id   UUID REFERENCES rate_agreements (id),
  inputs              JSONB NOT NULL,          -- index values, event IDs, mileage lookups read
  rated_total         BIGINT,
  billed_total        BIGINT NOT NULL,
  approved_total      BIGINT,
  ran_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ran_by_kind         TEXT NOT NULL CHECK (ran_by_kind IN ('rule', 'user', 'provider')),
  ran_by              TEXT NOT NULL            -- a user, the engine, or the FAP provider's name
);

CREATE TABLE freight_audit_line_results (
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_audit_run_id    UUID NOT NULL REFERENCES freight_audit_runs (id),
  charge_kind             TEXT NOT NULL,
  freight_invoice_line_id UUID REFERENCES freight_invoice_lines (id),  -- null: rated, not billed
  freight_charge_id       UUID REFERENCES freight_charges (id),        -- the rated or accrued line
  tolerance_id            UUID REFERENCES freight_audit_tolerances (id),
  rated_amount            BIGINT,
  billed_amount           BIGINT,
  approved_amount         BIGINT NOT NULL DEFAULT 0,
  held_amount             BIGINT NOT NULL DEFAULT 0,
  short_paid_amount       BIGINT NOT NULL DEFAULT 0,
  outcome                 TEXT NOT NULL CHECK (outcome IN ('match', 'within_tolerance',
                            'over_short_pay', 'over_hold', 'under', 'unrated', 'not_billed',
                            'duplicate')),
  reason_code             TEXT,                -- sent to the carrier with a short pay
  CHECK (approved_amount + held_amount + short_paid_amount = COALESCE(billed_amount, 0)
         OR outcome = 'not_billed')
);

CREATE TABLE freight_audit_exceptions (        -- work for a person
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_audit_line_result_id UUID NOT NULL REFERENCES freight_audit_line_results (id),
  assigned_to                TEXT,
  evidence_requested         TEXT,             -- 'stop_times', 'lumper_receipt', 'reweigh_certificate'
  requested_at               TIMESTAMPTZ,
  due_at                     TIMESTAMPTZ,
  resolution                 TEXT CHECK (resolution IN ('approved_as_billed', 'approved_at_rated',
                               'carrier_rebilled', 'disputed', 'written_off')),
  resolved_by                TEXT,
  resolution_note            TEXT,
  resolved_at                TIMESTAMPTZ,
  CHECK (resolution IS NULL OR (resolved_by IS NOT NULL AND resolved_at IS NOT NULL)),
  CHECK (resolution <> 'approved_as_billed' OR resolution_note IS NOT NULL)
);

CREATE TABLE freight_cost_allocations (        -- where an approved cost belongs
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_charge_id       UUID NOT NULL REFERENCES freight_charges (id),
  shipment_id             UUID REFERENCES shipments (id),
  order_line_id           UUID REFERENCES order_lines (id),
  legal_entity            TEXT NOT NULL,
  gl_account              TEXT NOT NULL,
  cost_center             TEXT,
  direction               TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'transfer',
                            'return')),
  basis                   TEXT NOT NULL CHECK (basis IN ('whole', 'weight', 'cube', 'distance',
                            'pallets', 'revenue', 'manual')),
  basis_quantity          NUMERIC(14, 3),
  amount                  BIGINT NOT NULL,     -- rows for one charge sum to its amount
  currency                CHAR(3) NOT NULL,
  rule_version            TEXT NOT NULL,
  period                  DATE NOT NULL        -- the accounting month
);

CREATE TABLE freight_funding_requests (        -- a FAP provider asking a shipper for money
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  provider_party_id  UUID NOT NULL REFERENCES parties (id),
  shipper_party_id   UUID NOT NULL REFERENCES parties (id),
  freight_invoice_ids UUID[] NOT NULL,
  amount             BIGINT NOT NULL CHECK (amount > 0),
  currency           CHAR(3) NOT NULL,
  requested_at       TIMESTAMPTZ NOT NULL,
  fund_by            TIMESTAMPTZ NOT NULL,     -- the cutoff for the payment run
  funded_at          TIMESTAMPTZ,
  advanced           BOOLEAN NOT NULL DEFAULT FALSE,  -- paid carriers before funding arrived
  status             TEXT NOT NULL CHECK (status IN ('requested', 'funded', 'partially_funded',
                       'overdue', 'cancelled'))
);
```

Accrual at close, by carrier, as the business chapter's spine computes it, with what has since been invoiced:

```sql
SELECT c.payee_party_id AS carrier_party_id, c.currency,
       SUM(c.amount) FILTER (WHERE c.freight_invoice_line_id IS NULL) AS accrued_not_invoiced,
       SUM(c.amount) FILTER (WHERE c.freight_invoice_line_id IS NOT NULL
                               AND fi.status NOT IN ('approved', 'paid')) AS invoiced_not_approved
FROM freight_charges c
LEFT JOIN freight_invoice_lines fil ON fil.id = c.freight_invoice_line_id
LEFT JOIN freight_invoices fi ON fi.id = fil.freight_invoice_id
WHERE c.side = 'payable'
  AND c.status IN ('accrued', 'billed')
  AND c.payer_party_id = $1
  AND c.created_at < $2                      -- the period end, in the reporting zone
GROUP BY c.payee_party_id, c.currency;
```

Design notes:

- **Audit is a run, not a field.** An invoice can be audited, re-audited after a rebill and post-audited a year later; each run keeps its engine version and inputs, and the invoice points at its current result.
- **Approved, held and short paid partition the bill.** The check on `freight_audit_line_results` makes every billed cent land in exactly one bucket, so a carrier's statement and the payer's remittance always reconcile.
- **An automated decision says so.** A rule that approves inside tolerance records itself as the actor, and an AI extraction that read a PDF records its model and confidence ([Automated and AI Decisions](/docs/building-blocks/audit-trails#automated-and-ai-decisions)).
- **Providers are integrations.** A FAP provider's audit result, payment file and funding request arrive as files or APIs mapped into these tables, with the provider as `ran_by` ([Integrations](/docs/building-blocks/integrations)).
- **Emit the events.** `freight_audit.completed`, `freight_audit.exception_opened`, `freight_invoice.approved`, `freight_invoice.short_paid` and `freight_funding.overdue` drive payment runs, carrier notices and the close.

## Auditing

- **Every audit run with its inputs:** agreement version, fuel index values, events, mileage, tolerances and the engine version, so any result can be reproduced.
- **Every exception and who resolved it how,** with a note on every approval as billed.
- **Every duplicate suspicion and its outcome,** including the content hashes and identifier matches that raised it.
- **Every allocation** with its rule version and basis, summing to its charge.
- **Every funding request, advance and payment,** so the provider, the shipper and the carrier can each see whose money moved when.

## What This Means for the System You Build

- **Audit every payable before approval,** and keep post-audit as a separate process that writes claims.
- **Re-rate with the agreement in force on the pickup date,** and store what the audit read, not just what it decided.
- **Stop duplicates in layers:** exact numbers, shipment identifiers, load and carrier, and document hashes across channels.
- **Put tolerances and dispositions in versioned rules,** per kind and carrier, and partition every billed cent into approved, held or short paid.
- **Code and allocate from the shipment's facts,** by a stated basis that sums exactly.
- **Accrue from the charge lines,** and measure accrual accuracy as a test of the rate data.
- **Treat funding as a ledger state:** approved, funded, paid, with advances made visible.

## References

**Filings**

- [Cass Information Systems: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/708781/000070878126000010/cass-20251231.htm), services, invoice and dollar volumes, AcuAudit, paying before funding, average payments in advance of funding and accounts and drafts payable, and income tied to holding time
- [Triumph Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1539638/000153963826000007/tfin-20251231.htm), the payments network, HubTran, invoices and dollars paid in 2025, segment share, notices of assignment and holding customer funds

**Regulations**

- [49 CFR 378.2: Definitions](https://www.law.cornell.edu/cfr/text/49/378.2), duplicate payment
- [49 CFR 378.9: Disposition of overcharges not supported by claims](https://www.law.cornell.edu/cfr/text/49/378.9), the 30-day refund of a discovered duplicate payment

**Vendors**

- [FedEx: 2026 Service Guide](https://www.fedex.com/content/dam/fedex/us-united-states/services/Service_Guide_2026.pdf), the money-back guarantee that can be suspended, modified or revoked
- [Cass Information Systems: Freight audit and payment](https://www.cassinfo.com/freight-audit-payment), freight spend, invoices and carriers in its network, by its own account
- [CTSI-Global](https://www.ctsi-global.com/), freight audit, processing and payment, and its founding year
- [Data2Logistics](https://www.data2logistics.com/), audit automation and claimed savings
- [Intelligent Audit](https://www.intelligentaudit.com/), audit points, parcel integrations, claims and shipments audited
- [Trax](https://www.traxtech.com/), line-level audit, normalization, GL assignment, spend managed and countries
- [TQL: Carrier FAQs](https://www.tql.com/carriers/faqs), factored carriers sending documents to the factor
