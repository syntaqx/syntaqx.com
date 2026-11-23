+++
title = "Freight Invoicing & Settlement"
nav_title = "Freight Invoicing"
description = "How a delivered load becomes a bill: who bills whom, POD-gated invoicing, the 210, presentment and credit rules, rebills, balance-due bills and short pays."
category = "Logistics & Supply Chain Industry"
order = 2843
part = "Freight Money"
tags = ["logistics", "freight", "invoicing", "edi", "accounts-receivable", "short-pay", "data-model"]
+++

A freight invoice is the bill for a movement that already happened, and it is only as good as the paper behind it. When a load delivers, the carrier bills whoever its contract says pays (a shipper, a broker, a forwarder, a 3PL), and on a brokered load the broker bills its own customer for the same movement at its own price. The carrier's bill has to arrive with a signed bill of lading, a proof of delivery and every receipt behind an accessorial; the broker's bill has to arrive in the customer's format, on the customer's portal or EDI connection, with the customer's reference numbers. C.H. Robinson tells its carriers that "a load confirmation is not an acceptable invoice" and that the invoice "should contain the load number, balance due, and your carrier ID number." TQL pays on 28-day terms against an invoice or rate confirmation, a signed bill of lading and any lumper and scale receipts. Cass, as one freight payment provider, processed 34.451 million transportation invoices in 2025.

It is hard because the bill is the last record in a chain that each company keeps differently, and the money depends on every link. A delivery receipt with a shortage noted turns a clean bill into a claim; a reweigh turns it into a rebill; a detention charge without the facility's in and out times turns it into a short pay; a bill sent to the wrong party, or before the paperwork is complete, sits unpaid until someone notices. Federal rules set some of the clocks (when a regulated carrier must present its bill, how long it may extend credit, how long either side has to dispute), contracts set the rest, and each correction has to leave the original intact. This chapter covers who bills whom, what gates a bill, the X12 210 as the bill's electronic form, the presentment and credit rules, corrections and balance-due bills, short pays and disputes, overcharge and duplicate payment claims, and applying the cash when it arrives. Auditing a received bill before paying it is [Freight Audit & Payment](/books/logistics/freight-audit-and-payment); paying the carrier, quick pay and factors are [Paying Carriers, Quick Pay & Factoring](/books/logistics/paying-carriers); when the revenue is recognized is [Logistics Accounting](/books/logistics/logistics-accounting).

## How the Platforms Do It

What the billed party asks for, as of November 2026, from published carrier pages, a published broker-carrier agreement, a carrier's EDI guide and filings:

| Party | Role | What a payable bill needs | Terms | Notes |
| --- | --- | --- | --- | --- |
| **Cass Information Systems** | Freight payment provider for shippers | Invoices in any format, rated, audited and coded to the shipper's ledger | The shipper's | "$37 Billion in freight spend processed & paid annually," "35 Million freight invoices each year" and more than 15,000 carriers in its payment network, by its own page; 34.451 million transportation invoices worth $36.447 billion in 2025, per its 10-K |
| **C.H. Robinson** | Broker | "the signed Bill of Lading (BOL) with receiver signature for each stop," plus lumper receipts, POD, weight tickets "as needed"; an invoice with load number, balance due and carrier ID | Not stated on the FAQ | Quick pay "standardized at 2.0%"; documents uploaded through Navisphere Carrier or its apps; only the booking office "can approve any discretionary amount" |
| **Flock Freight** | Broker | Proof of delivery, bill of lading and signed load confirmation; POD "within twenty-four (24) hours after delivery" | "within thirty (30) days of receipt of Carrier's undisputed invoice" | The carrier forfeits payment if documents aren't tendered within 90 days, and agrees never to seek payment from the shipper or consignee |
| **TQL** | Broker | "TQL invoice or TQL rate confirmation," signed BOL, lumper and scale tickets if applicable | "Our standard pay terms are 28-days" | 1-day pay at 5% and 7-day pay at 3%; "If you factor, please send all documents to your factoring company and not to TQL" |
| **XPO** | LTL carrier billing shippers by EDI | A 210 with invoice number, shipment ID, method of payment (collect or prepaid), billing date, net amount due and SCAC | The tariff's or contract's | Its 210 guide (version 4010) bills line charges with special charge codes for discount, fuel, hazardous cargo and priority service; for a shipment invoiced before delivery, the delivery date field carries the estimated date |

Three patterns:

- **The proof is part of the bill.** Every broker above names the signed bill of lading or POD as a condition of payment, and Flock Freight's agreement makes late paperwork a forfeiture. A bill without its documents isn't late; it isn't a bill yet.
- **The invoice must point at the payer's record.** C.H. Robinson wants its load number, TQL wants its PO number in the email subject, and a retailer wants its own shipment reference in the 210's reference segment. A carrier's invoice number means nothing to the payer's system until it is matched to the payer's load.
- **Terms are the contract's.** Standard terms around 28 to 30 days are the published pattern, and the regulation's 15-day credit period is a default that contracts and tariffs replace; quick pay and factoring, which change when and to whom the bill is paid, are [Terms, Quick Pay and Offsets](/books/logistics/paying-carriers#terms-quick-pay-and-offsets).

## Who Bills Whom

The core model's two sides apply to invoices as well as charges ([How the Money Splits](/books/logistics/logistics-business#how-the-money-splits)). A `freight_invoices` row is `payable` when this system received it and owes it, `receivable` when this system issued it and is owed; one brokered load produces one of each:

| Movement | Issuer | Bill-to | The other side of the same load |
| --- | --- | --- | --- |
| Asset carrier, prepaid | Carrier | Shipper | The carrier's own costs: driver pay, fuel, owner-operator settlement |
| LTL, collect | Carrier | Consignee, or the party the bill of lading names | Whether the shipper is still liable if the consignee doesn't pay is the bill of lading's terms and 13706's notice rule (below) |
| LTL, third party | Carrier | The third party on the bill of lading, often the shipper's freight payment provider or 3PL | |
| Brokered truckload | Carrier | Broker | Broker to shipper, a separate invoice at the broker's price |
| Ocean import through an NVOCC | Ocean carrier | NVOCC | NVOCC to importer, bundling ocean freight, fees and pass-through charges |

**The bill of lading's payment term picks the payer.** The core `shipments.payment_terms` is `prepaid`, `collect` or `third_party`, and the 210 carries the same choice in its method of payment code ("CC Collect" or "PP Prepaid (by Seller)" in XPO's guide). Collect freight follows a statutory rule: a consignee is liable for "rates billed at the time of delivery," but not for "additional rates that may be found to be due after delivery" if, before delivery, it gives the carrier written notice of its agency and absence of beneficial title, and the beneficial owner's name and address if the freight was reconsigned; the shipper or beneficial owner is then liable for the extra (49 U.S.C. 13706). A rebill after delivery on a collect shipment can therefore have a different payer from the original bill, and the notice is a document the carrier must be able to find.

**A broker's carrier may not go around it.** Brokers' agreements bar the carrier from billing the shipper: in Flock Freight's, "under no circumstances, will Carrier seek payment from the shipper, consignee, or third party." That clause is what separates a brokered load's two invoices; a carrier's system that bills the bill of lading's shipper on a brokered load is breaching its contract.

## The Proof That Gates the Bill

Delivery is the event; the documents prove it. My rule: a receivable invoice is issued, and a payable invoice is approved, only when every document the bill-to requires is attached and the delivery it proves is recorded. The requirements are data, per bill-to party and often per mode or customer program, because they differ:

- **Signed bill of lading or delivery receipt** with the consignee's signature, date and any exceptions (shortage, damage, refused pieces). An exception on the receipt is a claim's first record ([Claim Rules in 49 CFR 370](/books/logistics/cargo-claims#claim-rules-in-49-cfr-370)), and it changes what the bill should say.
- **Proof of delivery** where the consignee signs electronically or the carrier captures a photo or geofenced arrival instead of paper; the playbook's proof patterns are Field Operations' ([Proof When Nobody Signs](/books/field-operations/last-mile-delivery#proof-when-nobody-signs)).
- **Accessorial evidence:** a lumper receipt for unloading fees paid at the dock, a scale ticket for overweight or reweigh, in and out times from the facility or an ELD for detention, a TONU confirmation for a truck ordered and not used. Without it the payer short pays the line.
- **The contract's own documents:** the rate confirmation version the carrier accepted, a customs entry for a cross-border move, a reefer temperature download for a food shipper.

Billing before delivery exists, mainly in LTL, where prepaid freight is often billed on pickup: XPO's 210 guide says that "On collect freight bills" the delivery date field is the actual delivery date, while "For the shipments invoiced prior to delivery" it is "the estimated date of delivery." Such a bill is still subject to correction when delivery shows what happened, so the system records which date it billed on.

## The 210 as the Bill

The X12 210, "Motor Carrier Freight Details and Invoice," is the bill in EDI; rail (410) and ocean (310) have their own sets. Its segments, from the B3 header (invoice number, shipment ID, method of payment, billing date, net amount due, delivery date and its qualifier, SCAC) to the L1 charge lines and L3 totals, and how each maps to `freight_invoices` and `freight_invoice_lines`, are in [The 210 Freight Invoice](/books/logistics/transportation-edi#the-210-freight-invoice), with partner variance and versions. Billing adds two columns from it: the delivery the bill claims (B3-09, `delivered_on`) and whether it was billed before delivery (B3-10 qualifier `017`, `delivery_estimated`), which the proof gate above reads.

Two mapping rules matter more than any field. **The code as billed is kept.** `freight_invoice_lines.code` stores `FUE` or the carrier's accessorial code as received, and the mapping to a charge kind is a versioned table per partner, because two carriers' codes for the same accessorial differ and one carrier's code changes meaning between guides ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)). **The stated total is not the truth.** B3-07 is what the carrier says is due; the lines are what the audit checks; a 210 whose lines don't sum to its total is accepted and flagged, never silently corrected.

## Presentment, Credit and the Clocks

For regulated, for-hire, non-exempt motor carriers that extend credit to shippers, 49 CFR 377 Subpart B sets the default clocks; tariffs and contracts adjust them inside its limits:

- **Presenting the bill.** A carrier presents freight bills for prepaid shipments within 7 days "measured from the date the carrier received the shipment," and for collect shipments within 7 days "measured from the date the shipment was delivered at its destination," not counting Saturdays, Sundays or legal holidays (377.205). When bills are mailed, "the time of mailing shall be deemed to be the time of presentation" (377.207(a)).
- **The credit period.** "The credit period shall begin on the day following presentation of the freight bill" (377.203(b)); absent a tariff rule, "the credit period is 15 days" and it "includes Saturdays, Sundays, and legal holidays" (377.203(c)). A carrier may publish a different period in its tariff, but "Such credit periods shall not be longer than 30 calendar days" (377.203(d)), and service charges can't apply to payments made inside the standard period (377.203(e)(1)). A shipper's check mailed inside the period counts as paid inside it, by postmark (377.207(b) and (c)).
- **Additional charges.** When a carrier has collected the charges on a bill it presented as the total, and then presents a separate bill for more, it may extend credit on the additional charges for 30 calendar days from that second presentation (377.209).
- **Disputes.** A carrier that wants to bill more than it originally billed and collected must issue that bill within 180 days of the payer's receipt of the original, and a shipper must contest a bill within 180 days of receiving it, to keep the question before the Surface Transportation Board (49 U.S.C. 13710(a)(3)); suits to collect charges or recover overcharges must start within 18 months (14705). [Reweighs, Inspections and Reclassification](/books/logistics/freight-classification#reweighs-inspections-and-reclassification) works through these clocks on a reweighed LTL shipment.

In practice most freight moves under contracts that set their own terms (TQL's 28 days, Flock Freight's 30 days from an undisputed invoice), and the regulation is the floor and the default. The system computes each date from its rule and stores it with the rule that produced it ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)). The presentment deadline counts business days, the credit period counts calendar days, and the two start from different events:

```go tab="Go"
// PresentmentDeadline returns the last day a regulated carrier may present a
// freight bill: 7 days after the start event (receipt for prepaid, delivery for
// collect), not counting Saturdays, Sundays or legal holidays (49 CFR 377.205).
func PresentmentDeadline(start time.Time, holidays map[string]bool) time.Time {
	d := start
	for counted := 0; counted < 7; {
		d = d.AddDate(0, 0, 1)
		if d.Weekday() == time.Saturday || d.Weekday() == time.Sunday ||
			holidays[d.Format(time.DateOnly)] {
			continue
		}
		counted++
	}
	return d
}

// CreditDue returns the last day of the credit period: it begins the day after
// presentation and runs creditDays calendar days, 15 by default and never more
// than 30 (49 CFR 377.203(b) to (d)).
func CreditDue(presented time.Time, creditDays int) (time.Time, error) {
	if creditDays < 1 || creditDays > 30 {
		return time.Time{}, fmt.Errorf("credit period %d days is outside 1 to 30", creditDays)
	}
	return presented.AddDate(0, 0, creditDays), nil
}
```

```rust tab="Rust"
use chrono::{Datelike, Duration, NaiveDate, Weekday};
use std::collections::HashSet;

/// The last day a regulated carrier may present a freight bill: 7 days after the
/// start event, not counting Saturdays, Sundays or legal holidays (49 CFR 377.205).
fn presentment_deadline(start: NaiveDate, holidays: &HashSet<NaiveDate>) -> NaiveDate {
    let mut d = start;
    let mut counted = 0;
    while counted < 7 {
        d += Duration::days(1);
        if matches!(d.weekday(), Weekday::Sat | Weekday::Sun) || holidays.contains(&d) {
            continue;
        }
        counted += 1;
    }
    d
}

/// The last day of the credit period: it begins the day after presentation and
/// runs `credit_days` calendar days, 15 by default and never more than 30
/// (49 CFR 377.203(b) to (d)).
fn credit_due(presented: NaiveDate, credit_days: i64) -> Result<NaiveDate, String> {
    if !(1..=30).contains(&credit_days) {
        return Err(format!("credit period {credit_days} days is outside 1 to 30"));
    }
    Ok(presented + Duration::days(credit_days))
}
```

A collect shipment delivered on Thursday, November 19, 2026 must be billed by Tuesday, December 1 if Thanksgiving (November 26) is in the holiday set: seven weekdays, skipping two weekends and the holiday. Presented on December 1, it is due on December 16 under the 15-day default. The holiday calendar is data, per jurisdiction and year; the functions take it as input rather than knowing it.

## Corrections: Rebills, Balance-Due Bills and Credits

An issued invoice never changes. Every correction is a new document that points at the one it corrects, for three reasons: the payer's system already holds the original and matches by number; the regulatory clocks run from each bill's receipt; and an auditor or the Surface Transportation Board reads the sequence, not the last version. The kinds:

- **Corrected invoice (rebill).** The original was wrong (a missed accessorial, a wrong bill-to, a reweighed shipment re-rated) and is replaced in full. The original is voided with a reason, the rebill carries a suffix or new number by the issuer's convention, and if the original was already paid, the difference is what's due or owed.
- **Balance-due bill.** The original was paid and an additional charge is presented separately, the case 377.209 gives its own 30-day credit period. A reweigh fee, a reclassification, a detention charge approved after delivery and a storage charge at a terminal are typical. It must go out within 180 days of the original's receipt to keep the carrier's right to the additional charge in a contested case (13710(a)(3)(A)).
- **Credit memo.** The issuer owes money back: a duplicate bill, a refund of an overcharge, a negotiated reduction. It is a receivable invoice with a negative total, or a separate document type the payer's system recognizes; either way it references what it credits.

On the charge side, a correction is new `freight_charges` rows and voided old ones, never an update to an amount ([The Core Data Model](/books/logistics/logistics-business#the-core-data-model)'s design notes). The invoice lines then point at the new charges, and the old invoice's lines keep pointing at the voided ones, so a report of what was billed on a date is still answerable.

## Short Pays and Disputes

A **short pay** is a payment for less than the bill, usually with a reason: an accessorial without evidence, a rate higher than the confirmation, a fuel surcharge on the wrong index week, a duplicate stop charge, a deduction for a cargo claim. The carrier's receivable is now partly paid; the open balance is either disputed, written off, or rebilled with the missing evidence. A **dispute** is the payer's or payee's formal challenge of a bill or line, with a reason code, an amount, evidence, an owner and a deadline.

The practices that keep short pays from becoming write-offs:

- **Short pay per line, not per invoice.** The payer's remittance should say which line it reduced and why; a lump short pay against a 12-line invoice leaves the carrier guessing. When the payer is the system's own customer, the remittance advice usually doesn't say; the cash application step below has to infer it and record the inference.
- **Reason codes are data.** Each side keeps its own list (the payer's audit exception codes, the carrier's dispute codes) and a mapping between them for its large partners, because an aging report of disputes by reason is how a carrier finds which customer's process or which of its own documents is failing.
- **Deadlines from the rule.** The 180-day windows in 13710(a)(3), the contract's own dispute period, and a claim filing period each set when a dispute must be raised or answered; the dispute row carries them.
- **Offsets are explicit.** A broker that holds back money from a carrier's invoice for a cargo claim or another load's overpayment is applying a contract right; the offset is a line on the payment, linked to what it offsets, never a lower approved amount ([Terms, Quick Pay and Offsets](/books/logistics/paying-carriers#terms-quick-pay-and-offsets)).

## Overcharges and Duplicate Payments

The payer's side of a dispute, once it has paid, is an overcharge or duplicate payment claim, and for motor carriers 49 CFR 378 sets the procedure. An overcharge includes duplicate payments, "two or more payments for transporting the same shipment" (378.2(b) and (c)). A claim "shall not be paid unless filed in writing with the carrier that collected the transportation charges," which processes it; another participating carrier that receives one forwards it within 15 days, and one claim may cover several shipments with the same tariff issue or carriers (378.3). The collecting carrier acknowledges a claim "within 30 days after the date of receipt" unless it has paid or declined it by then, recording the receipt date on the claim (378.7), and pays, declines or settles it "within 60 days after its receipt," with written reasons citing tariff authority if it declines or settles for less, unless both sides agree in writing to extend (378.8).

Carriers also find overpayments nobody claimed. A payment the carrier "is unable to match" to an open receivable is an **unidentified payment** (378.2(e)); when a carrier discovers an overcharge or duplicate payment without a claim, it opens a file as if one had been filed and refunds the payer within 30 days (378.9(b)). A carrier's cash application that parks unmatched money in an unapplied account indefinitely is out of step with that rule; the unapplied balance needs an age and an owner.

## Applying the Cash

When money arrives (an ACH credit with remittance addenda, a check with a stub, a freight payment provider's batch file, a virtual card), it is a payment, and what it pays is an application: one payment can cover many invoices, and an invoice can be paid by several payments ([Payments Are Applied, Not Assigned](/docs/money/payment-states#payments-are-applied-not-assigned)). The rails and the remittance formats belong to Payments ([Remittance and Reconciliation](/books/payments/vendor-payouts#remittance-and-reconciliation)). What freight adds:

- **Matching on the payer's references.** A shipper's freight payment provider remits against the carrier's PRO or invoice number; a broker remits against its own load number; a retailer remits against its PO with deductions for chargebacks Commerce owns ([Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#routing-guides)). The matcher tries each identifier the invoice carries.
- **Partial applications at line level** where the remittance says which lines, and at invoice level with an inferred short pay reason where it doesn't.
- **A factor's payment is still the customer's.** When the carrier has sold its receivable, the broker pays the factor ([Paying Carriers, Quick Pay & Factoring](/books/logistics/paying-carriers)); on the carrier's own books the invoice was sold, not paid by the factor, and the carrier's system records the sale and the factor's later reserve release, not a customer payment.

## How to Build It

The deltas extend the core invoices with their kind, the document they correct and their clocks, and add document requirements, disputes, remittances and overcharge claims:

```sql
ALTER TABLE freight_invoices
  ADD COLUMN kind                TEXT NOT NULL DEFAULT 'original',
  ADD COLUMN corrects_invoice_id UUID REFERENCES freight_invoices (id),
  ADD COLUMN correction_reason   TEXT,
  ADD COLUMN delivered_on        DATE,           -- the delivery the bill claims (B3-09)
  ADD COLUMN delivery_estimated  BOOLEAN NOT NULL DEFAULT FALSE,  -- billed before delivery (B3-10 '017')
  ADD COLUMN presented_at        TIMESTAMPTZ,    -- sent or mailed (377.207), or received here
  ADD COLUMN presentment_due_on  DATE,           -- computed: 377.205, or the contract's
  ADD COLUMN credit_days         SMALLINT,       -- the tariff's or contract's period
  ADD COLUMN dispute_window_ends DATE,           -- computed: 180 days from receipt, 13710(a)(3)
  ADD COLUMN open_amount         BIGINT;         -- maintained from applications; minor units
ALTER TABLE freight_invoices ADD CONSTRAINT freight_invoices_kind_check
  CHECK (kind IN ('original', 'corrected', 'balance_due', 'credit_memo')) NOT VALID;
ALTER TABLE freight_invoices ADD CONSTRAINT freight_invoices_correction_check
  CHECK ((kind = 'original') = (corrects_invoice_id IS NULL)) NOT VALID;
ALTER TABLE freight_invoices ADD CONSTRAINT freight_invoices_credit_days_check
  CHECK (credit_days IS NULL OR credit_days BETWEEN 1 AND 120) NOT VALID;  -- contracts may exceed 377's 30
CREATE INDEX CONCURRENTLY freight_invoices_corrects_idx ON freight_invoices (corrects_invoice_id);
ALTER TABLE freight_invoices VALIDATE CONSTRAINT freight_invoices_kind_check;
ALTER TABLE freight_invoices VALIDATE CONSTRAINT freight_invoices_correction_check;
ALTER TABLE freight_invoices VALIDATE CONSTRAINT freight_invoices_credit_days_check;

ALTER TABLE freight_invoice_lines
  ADD COLUMN code_mapping_version INT,           -- which partner mapping turned code into kind
  ADD COLUMN line_number          SMALLINT;      -- L1-01 or the issuer's line order

CREATE TABLE invoice_document_requirements (    -- what a bill-to needs before it pays
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  bill_to_party_id UUID NOT NULL REFERENCES parties (id),
  mode             TEXT,                         -- null: every mode
  charge_kind      TEXT,                         -- null: the whole invoice; 'lumper': per line
  document_kind    TEXT NOT NULL,                -- a documents.kind value
  signed_by        TEXT CHECK (signed_by IN ('consignee', 'shipper', 'facility', 'any')),
  valid_during     TSTZRANGE NOT NULL,
  source_document_id UUID REFERENCES documents (id)  -- the agreement or routing guide that says so
);

CREATE TABLE freight_invoice_documents (        -- the proof attached to a bill
  freight_invoice_id UUID NOT NULL REFERENCES freight_invoices (id),
  document_id        UUID NOT NULL REFERENCES documents (id),
  requirement_id     UUID REFERENCES invoice_document_requirements (id),
  attached_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (freight_invoice_id, document_id)
);

CREATE TABLE freight_invoice_disputes (         -- a challenge to a bill or a line
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_invoice_id      UUID NOT NULL REFERENCES freight_invoices (id),
  freight_invoice_line_id UUID REFERENCES freight_invoice_lines (id),  -- null: the whole bill
  raised_by_party_id      UUID NOT NULL REFERENCES parties (id),
  reason_code             TEXT NOT NULL,        -- the raiser's code, as sent
  reason_kind             TEXT NOT NULL CHECK (reason_kind IN ('rate', 'accessorial_unsupported',
                            'fuel_index', 'duplicate', 'weight_or_class', 'service_failure',
                            'cargo_claim_offset', 'wrong_bill_to', 'missing_document', 'other')),
  disputed_amount         BIGINT NOT NULL CHECK (disputed_amount > 0),
  currency                CHAR(3) NOT NULL,
  raised_at               TIMESTAMPTZ NOT NULL,
  respond_by              DATE,                 -- computed from the contract or rule
  rule_ref                TEXT,                 -- e.g. '49 USC 13710(a)(3)(B)', or the contract clause
  status                  TEXT NOT NULL CHECK (status IN ('open', 'evidence_requested',
                            'accepted', 'rejected', 'settled', 'withdrawn', 'expired')),
  resolved_amount         BIGINT,               -- what the issuer conceded
  resolved_at             TIMESTAMPTZ,
  resolution_invoice_id   UUID REFERENCES freight_invoices (id),  -- the rebill or credit memo
  CHECK (status NOT IN ('accepted', 'settled') OR resolved_amount IS NOT NULL)
);

CREATE TABLE freight_remittances (              -- money received or sent, as a record
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  direction          TEXT NOT NULL CHECK (direction IN ('received', 'sent')),
  payer_party_id     UUID NOT NULL REFERENCES parties (id),
  payee_party_id     UUID NOT NULL REFERENCES parties (id),
  rail               TEXT NOT NULL CHECK (rail IN ('ach', 'wire', 'check', 'card', 'rtp',
                       'fednow', 'internal')),
  reference          TEXT NOT NULL,           -- the trace number, check number or batch ID
  amount             BIGINT NOT NULL CHECK (amount > 0),
  currency           CHAR(3) NOT NULL,
  received_on        DATE NOT NULL,
  advice_document_id UUID REFERENCES documents (id),  -- the remittance advice as received
  unapplied_amount   BIGINT NOT NULL,         -- maintained from applications
  UNIQUE (direction, payer_party_id, rail, reference)
);

CREATE TABLE freight_remittance_applications (  -- what a remittance paid
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  freight_remittance_id   UUID NOT NULL REFERENCES freight_remittances (id),
  freight_invoice_id      UUID NOT NULL REFERENCES freight_invoices (id),
  freight_invoice_line_id UUID REFERENCES freight_invoice_lines (id),
  amount                  BIGINT NOT NULL,     -- signed: a reversal is negative
  short_pay_reason        TEXT,                -- as stated, or inferred
  reason_inferred         BOOLEAN NOT NULL DEFAULT FALSE,
  applied_by_kind         TEXT NOT NULL CHECK (applied_by_kind IN ('rule', 'user')),
  applied_by              TEXT NOT NULL,
  applied_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE overcharge_claims (                -- 49 CFR 378, from either side
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  claimant_party_id       UUID NOT NULL REFERENCES parties (id),
  collecting_carrier_id   UUID NOT NULL REFERENCES parties (id),  -- processes it: 378.3(a)
  kind                    TEXT NOT NULL CHECK (kind IN ('overcharge', 'duplicate_payment',
                            'unidentified_payment')),
  freight_invoice_ids     UUID[] NOT NULL,      -- one claim may cover several shipments: 378.3(b)
  amount                  BIGINT NOT NULL CHECK (amount > 0),
  currency                CHAR(3) NOT NULL,
  received_at             TIMESTAMPTZ NOT NULL, -- recorded on the claim: 378.7
  discovered_by_carrier   BOOLEAN NOT NULL DEFAULT FALSE,  -- a 378.9 file with no claim
  acknowledge_by          DATE NOT NULL,        -- 30 days: 378.7
  dispose_by              DATE NOT NULL,        -- 60 days, or 30 to refund under 378.9(b)
  extension_document_id   UUID REFERENCES documents (id),  -- the written extension, if any
  acknowledged_at         TIMESTAMPTZ,
  disposition             TEXT CHECK (disposition IN ('paid', 'declined', 'settled')),
  disposition_reason      TEXT,                 -- tariff authority cited: 378.8
  disposed_at             TIMESTAMPTZ,
  CHECK (disposition IS NULL OR disposed_at IS NOT NULL),
  CHECK (disposition NOT IN ('declined', 'settled') OR disposition_reason IS NOT NULL)
);
```

A carrier's (or broker's) billing queue reads straight off these tables: delivered loads whose receivable can't be issued yet, and which document is missing:

```sql
SELECT l.id AS load_id, l.number, s.arrived_at AS delivered_at, r.document_kind AS missing
FROM loads l
JOIN stops s ON s.load_id = l.id AND s.kind = 'delivery'
 AND s.sequence = (SELECT max(sequence) FROM stops WHERE load_id = l.id)
JOIN load_shipments ls ON ls.load_id = l.id
JOIN shipments sh ON sh.id = ls.shipment_id
JOIN invoice_document_requirements r
  ON r.bill_to_party_id = sh.bill_to_party_id
 AND (r.mode IS NULL OR r.mode = sh.mode)
 AND r.charge_kind IS NULL
 AND r.valid_during @> s.arrived_at
WHERE l.owner_party_id = $1
  AND l.status = 'delivered'
  AND NOT EXISTS (
    SELECT 1 FROM documents d
    WHERE d.load_id = l.id AND d.kind = r.document_kind AND d.direction = 'inbound')
ORDER BY s.arrived_at;
```

Design notes:

- **An invoice is a document plus a state.** `freight_invoices.document_id` keeps the bill as exchanged (the 210 or the PDF); the row holds what was parsed and the state it's in. Every state change is a transition row with its actor ([Transition History](/docs/building-blocks/workflows#transition-history)), because "when did you receive it" and "when did you approve it" are the questions every dispute starts with.
- **Clocks are columns.** Presentment, credit, dispute window and claim deadlines are computed when the event that starts them is recorded, stored with the rule, and recomputed only by an explicit correction.
- **Duplicates are not corrections.** A bill audit confirms as a duplicate is marked with [Freight Audit & Payment](/books/logistics/freight-audit-and-payment#how-to-build-it)'s `duplicate_of_id` and declined; `corrects_invoice_id` is only for a rebill, balance-due bill or credit memo the issuer sent on purpose.
- **Idempotent intake.** Carriers resend 210s and email the same PDF twice. The core `UNIQUE (side, issuer_party_id, number)` stops a second row; a resend with different amounts under the same number is a correction to review, not a replacement ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **Open amounts are derived.** `open_amount` and `unapplied_amount` are maintained from applications in the same transaction and checked by a nightly sum; the applications are the truth.
- **Emit the events.** `freight_invoice.issued`, `freight_invoice.received`, `freight_invoice.disputed`, `freight_invoice.short_paid`, `freight_remittance.applied` and `overcharge_claim.due` feed audit, collections, accounting and carrier notifications ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **Every bill as exchanged,** with its hash, its parsed lines, the partner mapping version that read its codes, and its documents.
- **Every correction chain:** original, rebills, balance-due bills and credit memos, each with its reason and the charges it voided and created.
- **Every clock and the rule behind it:** presentment and credit dates, the 180-day dispute window, claim acknowledgment and disposition dates, and what happened by each.
- **Every dispute and short pay,** with reason, amount, evidence requested and supplied, and resolution.
- **Every remittance and its applications,** including inferred reasons, unapplied balances with their age, and refunds of unidentified payments.

## What This Means for the System You Build

- **Gate every bill on its proof,** with document requirements stored per bill-to and mode, so a bill is complete when it leaves or is approved.
- **Keep both sides as separate invoices** on a brokered load, and never let a carrier's bill reach the broker's customer.
- **Keep the code as billed** and map it through a versioned partner table; treat a carrier's stated total as a claim to check, not a number to trust.
- **Compute and store every clock** (presentment, credit, 180-day dispute, 30 and 60 days on claims) with the rule that set it.
- **Never edit an issued invoice;** correct it with a rebill, balance-due bill or credit memo that points at the original.
- **Short pay and dispute per line,** with reason codes as data, so aging by reason shows what's breaking.
- **Apply cash, don't assign it,** and give unapplied money an age, an owner and a refund deadline.

## References

**Regulations and statutes**

- [49 CFR 377.203: Extension of credit to shippers](https://www.law.cornell.edu/cfr/text/49/377.203), the credit period's start, 15-day default, 30-day tariff maximum and service charges
- [49 CFR 377.205: Presentation of freight bills](https://www.law.cornell.edu/cfr/text/49/377.205), 7 days from receipt or delivery, excluding weekends and holidays
- [49 CFR 377.207: Effect of mailing freight bills or payments](https://www.law.cornell.edu/cfr/text/49/377.207), mailing as presentation and as payment, and the postmark rule
- [49 CFR 377.209: Additional charges](https://www.law.cornell.edu/cfr/text/49/377.209), 30 calendar days of credit on a separate bill for more
- [49 CFR 378.2: Definitions](https://www.law.cornell.edu/cfr/text/49/378.2), overcharge, duplicate payment and unidentified payment
- [49 CFR 378.3: Filing and processing claims](https://www.law.cornell.edu/cfr/text/49/378.3), written claims to the collecting carrier, 15-day forwarding and multi-shipment claims
- [49 CFR 378.7: Acknowledgment of claims](https://www.law.cornell.edu/cfr/text/49/378.7), 30 days and the recorded receipt date
- [49 CFR 378.8: Disposition of claims](https://www.law.cornell.edu/cfr/text/49/378.8), 60 days, written extensions and reasons
- [49 CFR 378.9: Disposition of overcharges not supported by claims](https://www.law.cornell.edu/cfr/text/49/378.9), the file opened as if claimed and the 30-day refund
- [49 U.S.C. 13706: Liability for payment of rates](https://www.law.cornell.edu/uscode/text/49/13706), consignee liability and the notice of nonliability
- [49 U.S.C. 13710: Additional billing and collecting practices](https://www.law.cornell.edu/uscode/text/49/13710), the 180-day rules for carriers and shippers
- [49 U.S.C. 14705: Limitation on actions by and against carriers](https://www.law.cornell.edu/uscode/text/49/14705), 18 months to sue over charges and overcharges

**Brokers and carriers**

- [C.H. Robinson: Carrier FAQ](https://www.chrobinson.com/en/Carriers/FAQ/), required documents, invoice contents, the 2.0% quick pay fee and discretionary approvals
- [Flock Freight: Broker-carrier agreement](https://www.flockfreight.com/resources/broker-carrier-agreement), 30-day terms, 24-hour POD, 90-day forfeiture, no recourse to the shipper and setoff
- [TQL: Carrier FAQs](https://www.tql.com/carriers/faqs), 28-day terms, quick pay discounts, required documents and factored invoices
- [XPO: 210 Motor Carrier Freight Details and Invoice, version 4010](https://www.xpo.com/cdn/files/s8/210_spec.pdf), B3, N9, L1 and L3 elements and codes, and billing before delivery

**Filings and vendors**

- [Cass Information Systems: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/708781/000070878126000010/cass-20251231.htm), 34.451 million transportation invoices and $36.447 billion in 2025
- [Cass Information Systems: Freight audit and payment](https://www.cassinfo.com/freight-audit-payment), freight spend and invoices processed and carriers in its network, by its own account
