+++
title = "Billing & Invoicing"
nav_title = "Billing & Invoicing"
description = "From billable count to invoice: billing periods and the broadcast calendar, invoice runs, agency and consolidated billing, credits, corrections and tax on ads."
category = "Advertising Industry"
order = 2964
part = "Contracts and Money"
tags = ["advertising", "billing", "invoicing", "broadcast-calendar", "agency-billing", "data-model"]
+++

Billing turns delivery into documents. At the end of a period the seller takes a count of what was delivered (impressions, clicks, views, a flat fee's share of the month), multiplies it by the contracted rate, adds or subtracts fees, credits and corrections, and sends an invoice to whoever owes it: an agency, an advertiser, a DSP, or, in the other direction, a statement to a publisher. In advertising the inputs are unusual. The count is one party's count of an event under one definition, and other parties have their own; the period may be a calendar month or a broadcast month; the debtor may be an agency that owes only what its client has paid it; and corrections arrive for months, as invalid traffic is found, discrepancies are reconciled and make-goods run.

The engineering is hard because an invoice is a document that can't change once sent, built from numbers that keep changing. Delivery is restated as late beacons and sophisticated invalid traffic arrive; the controlling count may come from a third party days after the month ends; and every adjustment after the invoice goes out has to be a new line or a new document, traceable to the delivery rows it corrects. A billing system that stores invoice totals without their sources can't answer the first question any agency asks ("which impressions is this?"), and one that recomputes old invoices from current data will issue different numbers for the same month.

This chapter covers what is billed (the billable count and the rate), billing periods and the broadcast calendar, the invoice run and its close, invoice content for agencies, agency and consolidated billing, credits, corrections and credit memos, prepayment and proration, and sales tax on advertising. It extends `invoices`, `invoice_lines` and `delivery_daily` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and uses `fee_terms` from [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it) for fee lines and `contract_terms` and `insertion_order_lines` from [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms#how-to-build-it) for the contract. Pricing Models (in Auctions and Pricing) owns billing events and what each model multiplies; [Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies) owns comparing counts; [Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit) owns card thresholds, prepay and credit lines; [Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts) owns the payable side. The generic machinery (metering, rating, closing a period, evidence on invoices) is the playbook's [Usage-Based Billing](/docs/money/usage-based-billing), and the document itself is [Generated Documents](/docs/building-blocks/generated-documents).

## How the Platforms Do It

As of November 2026:

| Platform or terms | Period and timing | Who is billed | Credits and corrections |
| --- | --- | --- | --- |
| **Display & Video 360** | Invoices per billing profile, at the invoice level and detail level the profile sets | The payer on the billing profile | Credit adjustments per advertiser (refunds, invalid traffic, over-delivery beyond the monthly budget credited automatically); credit memos applicable to outstanding invoices; IVT credits usable for future advertising only |
| **Google Ads** (monthly invoicing) | Costs accrue during the month, then a monthly invoice | The account's billing setup; with consolidated billing, one invoice for up to 50,000 accounts under a paying manager account, per currency | Invalid activity credits; the invoice shows spend per account, the purchase order number and the total due |
| **IAB/4A's terms 3.0** | First invoice after the first month's delivery or within 30 days of the IO's end, whichever is earlier; calendar months; all invoices within 90 days of delivery | The agency, for the net cost after any agency commission; the advertiser for sums not cleared to the agency | Make-good credits; corrections of previously provided invoices outside the 90-day rule |
| **Microsoft Advertising** (monthly invoicing) | New invoices emailed "on the 2nd business day of each month" for the prior month; payment within 30 days under the example credit terms | The bill-to customer; agencies manage IOs on clients' behalf | Billed on accrued spend against the IO, not the IO's budget |

Across them, an invoice is **a period, a billable count per line, a rate, and a debtor**, with credits as lines of their own. The differences (which count, which period, who owes) are configuration on the contract and the billing profile, and the run that produces invoices should read them rather than encode them.

## What Is Billed

Each media line multiplies a billable quantity by a rate. The quantity comes from one source's `delivery_daily` rows for the period, net of invalid traffic filtered before billing; the source is the IO's controlling measurement for direct buys and the platform's own count for self-serve and programmatic buys. Pricing Models covers the billing events (impression, viewable impression, click, view, completion, conversion, sale, period); the billing rules that sit on top:

- **Bill on a named source and version.** An invoice line records which source it priced (`invoice_lines.billable_source`, in the core) and which version of each `delivery_daily` row it read, so a later restatement is visibly a later number.
- **Wait for the window to close.** Impressions are final within hours, clicks after validation, viewable impressions when the measurer's report closes, conversions when the attribution window passes. The invoice run for a period runs after the slowest billing event in it has settled, or bills provisionally and corrects later. Under the IAB/4A's terms the first invoice is sent on completion of the first month's delivery (or within 30 days of the IO's end, if earlier); the third-party ad server's count must be available by then, which is one reason the terms require automated daily reporting for it to control.
- **Net cost, not gross.** Under 3.0 the publisher invoices "the net cost (i.e., the cost after subtracting Agency commission, if any) based on actual delivery, flat-fee, or based on prorated distribution of delivery over the term of the IO, as specified on the applicable IO." Where a rate is quoted gross of an agency commission, what the publisher invoices is the net the agency pays it. [Agencies & Media Buying](/books/advertising/agencies-and-media-buying#how-agencies-are-paid) covers commissions and fees.
- **Flat fees and sponsorships are prorated by rule.** A flat-fee line bills its period's share by days, by delivery, or whole, as the IO says (`line_items.proration` in Pricing Models), not by impressions.
- **Over-delivery isn't billed.** Under 3.0 the agency "will not be charged" for deliverables above a guaranteed or capped level; DV360 credits delivery beyond the monthly budget automatically. A billable quantity is capped at the line's booked quantity or budget, with the excess reported but not charged.
- **Fees are lines with their terms.** A DSP's platform fee, data and verification fees, ad serving fees: each its own line, computed from the `fee_terms` row in force and pointing at it, never folded into the media rate.

## Billing Periods and the Broadcast Calendar

Most digital billing is by calendar month in the account's or contract's time zone: the core model puts `delivery_daily.day` in that zone, so a month is a set of days that never moves. TV, radio and much video and audio advertising bill by the **broadcast calendar** instead, which TVB defines simply: "The standard broadcast week starts on Monday and ends on Sunday," and "The standard broadcast month ends on the last Sunday of the calendar month." Each broadcast month therefore starts the Monday after the previous month's last Sunday and has four or five whole weeks:

| Broadcast month | Starts | Ends | Days |
| --- | --- | --- | --- |
| November 2026 | Monday, October 26, 2026 | Sunday, November 29, 2026 | 35 |
| December 2026 | Monday, November 30, 2026 | Sunday, December 27, 2026 | 28 |
| January 2027 | Monday, December 28, 2026 | Sunday, January 31, 2027 | 35 |
| February 2027 | Monday, February 1, 2027 | Sunday, February 28, 2027 | 28 |

Delivery on December 28, 2026 is January 2027 business on a broadcast calendar and December 2026 business on a calendar month; a CTV buy sold with linear TV in an upfront and billed on the broadcast calendar has to be reported and invoiced that way, while the same advertiser's display buy bills by calendar month. The calendar is a property of the contract, not of the platform, and both kinds of period are rows a billing system computes once and stores. Linear TV, Upfronts & Addressable TV covers the rest of TV's billing conventions.

The broadcast month is computable from the rule alone:

```go tab="Go"
// lastSunday returns the last Sunday of year/month.
func lastSunday(year int, month time.Month) time.Time {
	d := time.Date(year, month+1, 0, 0, 0, 0, 0, time.UTC) // last day of month
	for d.Weekday() != time.Sunday {
		d = d.AddDate(0, 0, -1)
	}
	return d
}

// BroadcastMonth returns the first and last days (inclusive) of a broadcast month:
// it ends on the month's last Sunday and starts the day after the previous month's.
func BroadcastMonth(year int, month time.Month) (start, end time.Time) {
	end = lastSunday(year, month)
	prev := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC).AddDate(0, -1, 0)
	start = lastSunday(prev.Year(), prev.Month()).AddDate(0, 0, 1)
	return start, end
}
```

```rust tab="Rust"
use chrono::{Datelike, Duration, NaiveDate, Weekday};

/// The last Sunday of year/month.
fn last_sunday(year: i32, month: u32) -> NaiveDate {
    let (ny, nm) = if month == 12 { (year + 1, 1) } else { (year, month + 1) };
    let mut d = NaiveDate::from_ymd_opt(ny, nm, 1).unwrap() - Duration::days(1);
    while d.weekday() != Weekday::Sun {
        d -= Duration::days(1);
    }
    d
}

/// First and last days (inclusive) of a broadcast month.
pub fn broadcast_month(year: i32, month: u32) -> (NaiveDate, NaiveDate) {
    let end = last_sunday(year, month);
    let (py, pm) = if month == 1 { (year - 1, 12) } else { (year, month - 1) };
    let start = last_sunday(py, pm) + Duration::days(1);
    (start, end)
}
```

`BroadcastMonth(2027, time.January)` returns December 28, 2026 to January 31, 2027, the table's third row.

## The Invoice Run

An invoice run is a batch over one billing period and one set of billing profiles, and it has stages:

1. **Wait for close.** The period's delivery is settled when every billing event's window has passed and the controlling sources have reported, or a scheduled close date arrives. Late data after close goes to the next period as an adjustment, the playbook's rule in [Late Events and Closing a Period](/docs/money/usage-based-billing#late-events-and-closing-a-period).
2. **Snapshot the inputs.** The run reads each `delivery_daily` row's current version, the rates and fee terms in force, open credits (IVT adjustments, make-good credits, discrepancy settlements) and the billing profiles, and records exactly what it read.
3. **Rate.** Each media line is quantity x rate, computed in micros and converted to the invoice currency's minor units once, on the line, with the rounding recorded ([Money & Amounts](/docs/money/amounts)). Fee lines apply their terms to their basis. Credits are negative lines.
4. **Assemble.** Lines group into invoices by the billing profile's rules (per advertiser, per IO, per campaign, consolidated across accounts), each invoice gets its number, references (IO number, purchase order, advertiser and brand), tax and total.
5. **Review and issue.** Large or unusual invoices go to review (a total far from the previous month's, a credit larger than the media), then the document is rendered, sent and frozen: "What was sent is what you keep" ([Generated Documents](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep)).
6. **Post.** Issued invoices go to receivables and the general ledger, and the period closes ([Month-End Close](/docs/money/accounting#month-end-close)).

A run is idempotent per period and profile: rerunning it before issue replaces drafts; after issue, a rerun can only produce corrections.

### Worked example: one agency invoice

An agency's IO with a publisher for March has one guaranteed display line at a $12.00 net CPM, controlled by the third-party ad server's count. The 3PAS reports 1,180,000 impressions for March net of invalid traffic. In February, a finding credited 35,000 invalid impressions on the same line, not yet invoiced; and a make-good was agreed as a credit of 20,000 impressions after no make-good flight could be scheduled.

| Line | Quantity | Rate | Amount |
| --- | --- | --- | --- |
| Media, March, third-party ad server count | 1,180,000 impressions | $12.00 CPM | 1,180,000 x 12,000,000 / 1,000 = 14,160,000,000 micros = $14,160.00 |
| IVT credit, February, finding reference | -35,000 impressions | $12.00 CPM | -$420.00 |
| Make-good credit, under-delivery, February | -20,000 impressions | $12.00 CPM | -$240.00 |
| **Total** | | | **$13,500.00** |

Each line points at its sources: the media line at the 31 `delivery_daily` rows (one per day, source `third_party_ad_server`) and their versions; the IVT credit at the `ivt_adjustments` row of its finding ([Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud)); the make-good credit at its `make_goods` row (Pacing & Frequency Capping). The total is the sum of the lines, stored on the invoice for the document as issued. Under 3.0 the agency pays 30 days from receipt, and under sequential liability only to the extent the advertiser has paid it.

## What an Invoice Must Carry

Under the IAB/4A's terms, invoices "will include information reasonably specified by Agency, such as the IO number, Advertiser name, brand name or campaign name, and any number or other identifiable reference stated as required for invoicing on the IO," and on request the publisher provides "proof of performance for the invoiced period," which can be access to its reporting. Platforms make the same point with purchase order fields: Google's consolidated invoice shows "the amount spent for each Google Ads account, the purchase order number, and a total amount due," and Microsoft's insertion orders carry a purchase order value to reference on monthly invoices.

Agencies need these references because they rebill: an agency pays the media company and invoices its client for the same media plus its fee, and its client's accounts payable matches every line to a purchase order and a campaign. An invoice without the reference the IO required is an invoice that will be paid late. The rule for the system: the IO and billing profile name the required references, and the run refuses to issue an invoice missing one.

Agencies reconcile invoices against their own records, often in an agency billing system. DV360's integration with Mediaocean's Prisma "enables automated budget management, delivery data and invoice data reconciliation": budgets flow from Prisma into DV360 and Google's invoices flow back for matching against booked amounts, but a granular breakdown of IVT credits isn't supported. The formats differ, but every one needs the same identifiers on every line: IO or campaign, placement, period and the quantity and rate.

## Agency and Consolidated Billing

Who is billed is a choice of billing profile, separate from who owns the account and who operates it:

- **The advertiser directly,** for its own accounts and IOs.
- **The agency,** as agent for a disclosed advertiser, under sequential liability on IAB/4A's terms (an agency is liable "solely to the extent proceeds have cleared from Advertiser to Agency"), or as principal where it bought principal-based media ([Agencies & Media Buying](/books/advertising/agencies-and-media-buying#agent-and-principal)).
- **One invoice across many accounts.** With Google's consolidated billing "you'll receive just one monthly invoice" for accounts linked to one paying manager account (Google says the feature isn't available to media agencies), all on monthly invoicing and in one currency, with mixed currencies producing one invoice per currency and up to 50,000 accounts per invoice. DV360's billing profiles set an invoice level and detail level that decide how adjustments appear.

Consolidation is a presentation choice, not a liability change: the lines still belong to each advertiser's accounts and IOs, credits still apply to the advertiser that earned them, and a consolidated invoice with one unpaid advertiser is partly collectible. The model keeps each line's advertiser, ad account and IO, and the billing profile only decides how lines are grouped onto documents.

## Credits, Corrections and Credit Memos

Money changes after an invoice in four ways, and none of them edits the invoice:

- **A credit on a later invoice.** The usual path for invalid traffic credits, make-good credits and discrepancy settlements: a negative line on the next invoice for the same profile, pointing at what it corrects. Google's invalid activity credits and DV360's adjustment credits land this way; DV360 says its IVT adjustments can only be used for future advertising and can't be refunded.
- **A credit memo.** A separate document reducing what the buyer owes, which can be applied to an outstanding invoice; DV360 says "Credit memos can be applied to outstanding eligible invoices." A credit memo is a document with its own number in its own series, pointing at the invoice it corrects.
- **A corrected invoice.** A wrong invoice (wrong rate, wrong count, wrong debtor) is voided or credited in full and reissued. The 3.0 terms exempt "corrections of previously provided invoices" from the 90-day deadline, which is the only reason that deadline doesn't trap a correction.
- **A refund.** Where the buyer prepaid, a credit can become money back: under 3.0, an agency that "has made a cash prepayment" for an IO that under-delivered and is current on its other balances "may elect to receive a refund." The refund itself is a payment, the Payments volume's ([Payouts & Settlement](/books/payments/payouts-and-settlement)).

My rules: every credit or correction names the invoice line or delivery rows it corrects and the reason; a credit is never larger than what it corrects without a reviewed exception; and the credit's period is the period it is issued in, while its reference is the period it corrects, so both "what did March cost?" and "what did we credit in April?" have answers.

## Prepayment and Proration

Prepaid buys bill differently. A publisher may require "payment in advance" when an advertiser's or agency's credit "is or becomes impaired" (3.0), and many sponsorships and custom content are invoiced up front on a payment schedule set in the IO. A prepaid invoice is billed before delivery, so the billable count reconciles against it afterward: delivery draws down the prepayment, under-delivery becomes a make-good, credit or refund, and the accounting treats the prepayment as a liability until delivered ([Advertising Revenue Accounting](/books/advertising/advertising-revenue-accounting)). Custom material is invoiced separately and paid "within 30 days from receiving an invoice" under 3.0 even when the media is canceled. Advertiser Payments & Credit covers prepaid balances on self-serve platforms, which are a ledger rather than an invoice.

## Tax on Advertising

US tax on digital advertising is set state by state, and states are changing it. Two examples a billing system must handle:

- **Washington** treats advertising services as retail sales since October 1, 2025 under ESSB 5814: the Department of Revenue lists "Ad design, ad placement, campaign planning, lead generation, and acquisition of advertising space on the internet" as taxable and excludes "certain newspaper/in-print advertising, radio and television ads, fixed signage, out-of-home ads." The Department says it is in ongoing litigation over the classification of newly taxable services and that taxpayers must collect and remit under current guidance. A seller billing a Washington buyer for digital ad placement adds sales tax unless an exemption (such as resale) applies, which means the billing profile needs the buyer's location and exemption documents.
- **Maryland** taxes digital advertising gross revenues of large companies (a tax on the seller's revenue, not a sales tax on the buyer). Its pass-through provision barred passing the cost on "by means of a separate fee, surcharge, or line-item"; on August 15, 2025 the Fourth Circuit held that provision unconstitutional under the First Amendment and remanded for a remedy. Whether an invoice may show the tax as a line is therefore a legal setting, not a design choice. I didn't open the Comptroller's current guidance for the rates and thresholds. <!-- source-gap: adv-maryland-dat-rates | missing | the Maryland digital advertising gross revenues tax rates and thresholds as of 2026 | closes with: the Comptroller of Maryland's digital advertising tax page | checked: 2026-11-22 -->

The generic rules apply: tax is computed per line from the line's tax code and the buyer's location and exemptions, quoted on drafts and fixed when the invoice finalizes ([Tax Is a Quote Until the Invoice Finalizes](/docs/money/sales-tax#tax-is-a-quote-until-the-invoice-finalizes), [Taxability Varies by Place](/docs/money/sales-tax#taxability-varies-by-place)), and the core model's `invoice_lines.kind = 'tax'` holds it. EU and UK VAT on digital services to businesses is usually reverse-charged, which still needs the buyer's VAT number on the invoice ([VAT and GST on Digital Goods](/docs/money/sales-tax#vat-and-gst-on-digital-goods)).

## How to Build It

The core model has `invoices` (direction, counterparty, period, currency, total, status, dates) and `invoice_lines` (kind, line item or deal, billable source, quantity, rate, amount, rule reference), and [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it) adds `fee_term_id` to lines. This chapter adds billing profiles (who is billed and how invoices are grouped), billing periods (calendar or broadcast, with their close), invoice runs, the trace from each line to the delivery rows it priced, and the invoice's kind and correction links.

```sql
CREATE TABLE billing_profiles (            -- who is billed, how invoices are grouped and delivered
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_org_id       UUID NOT NULL REFERENCES organizations (id),  -- the issuer
  bill_to_org_id      UUID NOT NULL REFERENCES organizations (id),  -- agency or advertiser
  liability           TEXT NOT NULL CHECK (liability IN ('sequential', 'joint', 'agency',
                        'advertiser')),
  currency            CHAR(3) NOT NULL,
  calendar            TEXT NOT NULL DEFAULT 'calendar_month' CHECK (calendar IN
                        ('calendar_month', 'broadcast_month')),
  time_zone           TEXT NOT NULL,       -- days in billing are in this zone
  grouping            TEXT NOT NULL CHECK (grouping IN ('per_advertiser', 'per_insertion_order',
                        'per_campaign', 'consolidated')),
  detail_level        TEXT NOT NULL DEFAULT 'line' CHECK (detail_level IN ('summary', 'line',
                        'line_and_day')),
  required_references TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {'io_number','po_number','brand'}
  payment_days        SMALLINT NOT NULL,   -- from the contract terms or credit line
  tax_profile_ref     TEXT,                -- buyer location, VAT number, exemption documents
  delivery            JSONB NOT NULL,      -- email addresses, portal, EDI or billing integration
  status              TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'closed'))
);

CREATE TABLE billing_periods (             -- a period's days and its close, per calendar and zone
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  calendar            TEXT NOT NULL CHECK (calendar IN ('calendar_month', 'broadcast_month')),
  time_zone           TEXT NOT NULL,
  label               TEXT NOT NULL,       -- '2027-01'
  days                DATERANGE NOT NULL,  -- broadcast January 2027: [2026-12-28, 2027-02-01)
  close_after         TIMESTAMPTZ NOT NULL,  -- when the slowest billing event has settled
  closed_at           TIMESTAMPTZ,
  UNIQUE (calendar, time_zone, label),
  EXCLUDE USING gist (calendar WITH =, time_zone WITH =, days WITH &&)
);

CREATE TABLE billing_runs (                -- one batch over a period and a set of profiles
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  billing_period_id   UUID NOT NULL REFERENCES billing_periods (id),
  seller_org_id       UUID NOT NULL REFERENCES organizations (id),
  kind                TEXT NOT NULL CHECK (kind IN ('regular', 'correction', 'prepay')),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  inputs_as_of        TIMESTAMPTZ NOT NULL,  -- delivery and terms read as of this time
  status              TEXT NOT NULL CHECK (status IN ('drafting', 'in_review', 'issued',
                        'failed', 'superseded')),
  invoices_drafted    INT NOT NULL DEFAULT 0,
  invoices_issued     INT NOT NULL DEFAULT 0,
  completed_at        TIMESTAMPTZ
);
CREATE UNIQUE INDEX billing_runs_one_regular_idx ON billing_runs (billing_period_id, seller_org_id)
  WHERE kind = 'regular' AND status NOT IN ('failed', 'superseded');

ALTER TABLE invoices
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'invoice',
  ADD COLUMN corrects_invoice_id UUID,
  ADD COLUMN billing_profile_id UUID,
  ADD COLUMN billing_run_id UUID,
  ADD COLUMN billing_period_id UUID,
  ADD COLUMN po_number TEXT,
  ADD COLUMN references_json JSONB NOT NULL DEFAULT '{}',  -- IO number, brand, campaign as required
  ADD COLUMN document_ref TEXT;                           -- the rendered document, frozen at issue
ALTER TABLE invoices ADD CONSTRAINT invoices_kind_check
  CHECK (kind IN ('invoice', 'credit_memo', 'prepayment', 'statement')) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_credit_memo_target_check
  CHECK (kind <> 'credit_memo' OR corrects_invoice_id IS NOT NULL) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_corrects_fk
  FOREIGN KEY (corrects_invoice_id) REFERENCES invoices (id) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_billing_profile_fk
  FOREIGN KEY (billing_profile_id) REFERENCES billing_profiles (id) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_billing_run_fk
  FOREIGN KEY (billing_run_id) REFERENCES billing_runs (id) NOT VALID;
ALTER TABLE invoices ADD CONSTRAINT invoices_billing_period_fk
  FOREIGN KEY (billing_period_id) REFERENCES billing_periods (id) NOT VALID;

ALTER TABLE invoice_lines
  ADD COLUMN advertiser_id UUID,           -- kept per line, so consolidation never loses it
  ADD COLUMN insertion_order_line_id UUID,
  ADD COLUMN corrects_line_id UUID,        -- the line a credit or correction reverses
  ADD COLUMN reason TEXT,                  -- 'ivt', 'make_good', 'discrepancy', 'rate_error', ...
  ADD COLUMN amount_micros BIGINT,         -- before the single rounding to minor units
  ADD COLUMN rounding TEXT;                -- the rule applied, e.g. 'half_even'
ALTER TABLE invoice_lines ADD CONSTRAINT invoice_lines_advertiser_fk
  FOREIGN KEY (advertiser_id) REFERENCES advertisers (id) NOT VALID;
ALTER TABLE invoice_lines ADD CONSTRAINT invoice_lines_io_line_fk
  FOREIGN KEY (insertion_order_line_id) REFERENCES insertion_order_lines (id) NOT VALID;
ALTER TABLE invoice_lines ADD CONSTRAINT invoice_lines_corrects_fk
  FOREIGN KEY (corrects_line_id) REFERENCES invoice_lines (id) NOT VALID;
ALTER TABLE invoice_lines ADD CONSTRAINT invoice_lines_credit_reason_check
  CHECK (amount_minor >= 0 OR reason IS NOT NULL) NOT VALID;

CREATE TABLE invoice_line_sources (        -- which delivery rows, at which version, a line priced
  invoice_line_id     UUID NOT NULL REFERENCES invoice_lines (id),
  line_item_id        UUID REFERENCES line_items (id),
  deal_id             UUID REFERENCES deals (id),
  day                 DATE NOT NULL,
  source              TEXT NOT NULL,       -- the delivery_daily source
  source_org_id       UUID REFERENCES organizations (id),
  delivery_version    INT NOT NULL,        -- delivery_daily.version read by the run
  quantity            BIGINT NOT NULL,
  cost_micros         BIGINT NOT NULL,
  CHECK ((line_item_id IS NULL) <> (deal_id IS NULL))
);
CREATE INDEX invoice_line_sources_line_idx ON invoice_line_sources (invoice_line_id);
CREATE INDEX invoice_line_sources_delivery_idx
  ON invoice_line_sources (line_item_id, day, source);

CREATE INDEX CONCURRENTLY invoices_billing_period_idx ON invoices (billing_period_id);

-- after backfilling kinds, profiles and periods on existing invoices
ALTER TABLE invoices VALIDATE CONSTRAINT invoices_kind_check;
ALTER TABLE invoices VALIDATE CONSTRAINT invoices_credit_memo_target_check;
ALTER TABLE invoices VALIDATE CONSTRAINT invoices_corrects_fk;
ALTER TABLE invoices VALIDATE CONSTRAINT invoices_billing_profile_fk;
ALTER TABLE invoices VALIDATE CONSTRAINT invoices_billing_run_fk;
ALTER TABLE invoices VALIDATE CONSTRAINT invoices_billing_period_fk;
ALTER TABLE invoice_lines VALIDATE CONSTRAINT invoice_lines_advertiser_fk;
ALTER TABLE invoice_lines VALIDATE CONSTRAINT invoice_lines_io_line_fk;
ALTER TABLE invoice_lines VALIDATE CONSTRAINT invoice_lines_corrects_fk;
ALTER TABLE invoice_lines VALIDATE CONSTRAINT invoice_lines_credit_reason_check;
```

Finding the delivery restated after it was billed, which is what the next run turns into adjustments, is a join between the sources a line priced and the current roll-up:

```sql
-- delivery rows whose current version differs from the version an issued invoice priced
SELECT s.invoice_line_id, s.line_item_id, s.day, s.source,
       s.delivery_version AS billed_version, d.version AS current_version,
       d.impressions - s.quantity AS quantity_change,
       d.cost_micros - s.cost_micros AS cost_change_micros
FROM invoice_line_sources s
JOIN invoice_lines l ON l.id = s.invoice_line_id
JOIN invoices i ON i.id = l.invoice_id AND i.status IN ('issued', 'paid')
JOIN delivery_daily d ON d.line_item_id = s.line_item_id AND d.day = s.day
                     AND d.source = s.source
                     AND d.source_org_id IS NOT DISTINCT FROM s.source_org_id
WHERE d.version > s.delivery_version
```

Design notes:

- **The run reads a snapshot and records it.** `billing_runs.inputs_as_of` and each source row's `delivery_version` are what make an issued invoice reproducible: rerunning the same inputs gives the same lines, and current data gives the adjustments since ([One Log Per Sync Batch](/docs/money/accounting#one-log-per-sync-batch) is the same idea for the ledger).
- **Issued invoices are immutable.** Status moves forward (`issued`, `disputed`, `paid`, `credited`, `void`), but lines and totals don't change; corrections are credit memos or lines on later invoices, linked by `corrects_invoice_id` and `corrects_line_id` ([Closed Periods Stay Closed](/docs/money/accounting#closed-periods-stay-closed)).
- **Periods are rows, including broadcast months.** `billing_periods` stores each period's days once, computed from its calendar and zone, so a delivery day maps to exactly one period of each calendar and the exclusion constraint keeps periods from overlapping.
- **Every line keeps its advertiser.** Consolidated and agency invoices group lines; `invoice_lines.advertiser_id` keeps each line's party for credits, collections under sequential liability and agency rebilling.
- **Micros on the line, rounding once.** `amount_micros` keeps the exact product and `rounding` the rule, and `amount_minor` is the rounded figure the document shows; summing rounded lines is the only rounding a total gets.
- **Required references block issue.** The profile's `required_references` are checked before an invoice leaves `drafting`; an invoice the agency can't match to a purchase order is a late payment.
- **Numbering is per series, gapless where required.** Invoices and credit memos number in their own series per issuer ([Numbering](/docs/building-blocks/generated-documents#numbering)), and the number is assigned at issue, not at draft.

## Auditing

- **Every invoice line traced to its sources:** the delivery rows and versions it priced, the rate and terms version, the fee term for fee lines, and the finding, make-good or reconciliation for credits.
- **Every run with its inputs and outcome,** including drafts discarded and invoices reviewed before issue.
- **Every correction linked to what it corrects,** with its reason and period, so a buyer's question about a month's net cost has one answer and a question about a month's credits has another.
- **Contractual invoice deadlines met:** first invoice timing and the 90-day rule under IAB/4A's terms, and the payment due date each invoice set.
- **Tax by line,** with the buyer's location, exemption evidence and the rule applied, and whether a pass-through line was shown where the law allows it.

## What This Means for the System You Build

- **Bill from a named source at a recorded version,** after the slowest billing event in the period has settled.
- **Store billing periods as rows,** calendar and broadcast, in the contract's time zone, and map every delivery day to its period once.
- **Run invoices as reproducible batches** that snapshot their inputs, and never edit an issued invoice.
- **Keep the advertiser on every line** even on agency and consolidated invoices, and group lines by the billing profile, not by changing ownership.
- **Make every credit and correction its own line or credit memo** that names what it corrects and why.
- **Carry the references the buyer requires** and refuse to issue without them.
- **Compute tax per line** from location and exemptions, and treat state rules on advertising and on showing a tax as configuration that changes.

## References

**Specifications**

- [IAB/4A's: Standard Terms and Conditions for Internet Advertising, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), invoice timing and contents, net cost on calendar months, the 90-day rule and corrections, proof of performance, payment in 30 days, prepayment refunds, payment in advance when credit is impaired, custom material and the bonus impression charge rule
- [TVB: Broadcast calendar](https://www.tvb.org/research-measurement-analytics/research/tv-programming/broadcast-calendar-nielsen-survey-dates/), the broadcast week from Monday to Sunday and the month ending on its last Sunday

**Regulation**

- [Washington Department of Revenue: Services newly subject to retail sales tax](https://dor.wa.gov/taxes-rates/retail-sales-tax/services-newly-subject-retail-sales-tax), advertising services taxable from October 1, 2025 under ESSB 5814, what is included and excluded, and the pending litigation
- [Fourth Circuit: Chamber of Commerce v. Lierman, No. 24-1727 (August 15, 2025)](https://www.ca4.uscourts.gov/opinions/241727.P.pdf), Maryland's ban on passing the digital advertising tax through as a separate fee, surcharge or line-item held unconstitutional and remanded

**In practice**

- [Display & Video 360 Help: Invoices and adjustments to your account](https://support.google.com/displayvideo/answer/9373922?hl=en-GB), invoice level and detail level, credit adjustments, invalid traffic adjustments for future advertising only, automatic over-delivery credits and credit memos
- [Display & Video 360 Help: Display & Video 360 and Prisma billing integration](https://support.google.com/displayvideo/answer/16091581), budget, delivery and invoice reconciliation with an agency billing system, and no granular IVT credit breakdown
- [Google Ads Help: About consolidated billing](https://support.google.com/google-ads/answer/2375371?hl=en), one monthly invoice across accounts, the paying manager, monthly invoicing, one currency per invoice, the 50,000-account limit, no media agencies, and what the invoice shows
- [Google Ads Help: Invalid clicks](https://support.google.com/google-ads/answer/42995?hl=en), credits for invalid clicks on the next invoice
- [Microsoft Advertising API: InsertionOrder data object](https://learn.microsoft.com/en-us/advertising/customer-billing-service/insertionorder), the purchase order value printed on monthly invoices
- [Microsoft Advertising: Monthly invoice billing](https://raw.githubusercontent.com/MicrosoftDocs/Advertising/main/advertising/msa-help/hlp_BA_CONC_MonthlyInvoiceBilling.md), the credit line, invoices on the 2nd business day for the previous month's charges, billing on accrued charges, 30-day payment and agency management of insertion orders
