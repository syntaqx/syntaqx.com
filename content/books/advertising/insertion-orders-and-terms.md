+++
title = "Insertion Orders & Standard Terms"
nav_title = "IOs & Standard Terms"
description = "The insertion order as a contract: IAB/4A's terms 3.0, the 2026 IAB framework, cancellation, controlling measurement, sequential liability, programmatic terms."
category = "Advertising Industry"
order = 2963
part = "Contracts and Money"
tags = ["advertising", "insertion-orders", "contracts", "standard-terms", "sequential-liability", "data-model"]
+++

An insertion order (IO) is the contract for a direct advertising buy: an agency or advertiser agrees with a publisher to buy stated deliverables (impressions, clicks, a sponsorship, a share of voice) at stated prices, between stated dates, up to a stated budget. The IO itself is short, a form with lines and a signature; most of its rules come from a set of standard terms it incorporates by reference. For US digital media those terms have been the IAB/4A's Standard Terms and Conditions for Internet Advertising since 2001, version 3.0 since 2010, and since May 2026 a new modular IAB framework is available to replace them.

The engineering is hard because the terms are operational. They aren't legal text that sits in a drawer: they say when the IO is accepted (possibly by the first impression served), how many days' notice a cancellation needs and what the buyer still owes, when the publisher must warn of under-delivery, whose ad server's count is invoiced, what happens when the counts differ by more than 10%, when invoices must be sent, when payment is due and who owes it if the advertiser doesn't pay the agency. Each of those is a clock or a rule the ad server, the billing system and the collections process must run. A system that stores the IO as a PDF and the line items as configuration can't compute any of them.

This chapter covers what an IO contains, the IAB/4A's 3.0 terms clause by clause where they drive software (acceptance, revisions, cancellation and short rates, reporting, make-goods and bonus impressions, payment and sequential liability, third-party ad serving and the controlling measurement, force majeure), the 2026 IAB framework, programmatic and platform terms, and how to model terms as data. It extends `insertion_orders` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), which already carries the terms version, the controlling measurement, the discrepancy tolerance and the liability rule, and `agency_agreements` and `buy_basis` from [Agencies & Media Buying](/books/advertising/agencies-and-media-buying#how-to-build-it). Pacing & Frequency Capping (in Ad Serving and Creative) owns the under-delivery notice and the make-good as delivery; [Billing & Invoicing](/books/advertising/billing-and-invoicing), [Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies) and [Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit), in this part, own the invoice, the discrepancy process and agency credit; Linear TV, Upfronts & Addressable TV owns upfront deals.

## How the Platforms Do It

As of November 2026:

| Terms or platform | What "insertion order" means | Where the rules come from | Notes |
| --- | --- | --- | --- |
| **IAB/4A's Standard Terms and Conditions 3.0** (2010) | A direct-buy contract between an agency (for a disclosed advertiser) and a media company | The standard terms, incorporated into the IO; the IO prevails where they conflict | For "media buys one year or less"; not meant for publisher-network relationships or direct advertiser buys |
| **IAB General Terms v1.1, Direct Buy Addendum v1.0, Order-Specific Terms for IOs v1.0** (final May 20, 2026) | The same direct-buy contract, under a modular framework | A common General Terms core, an addendum per relationship type, and optional order-specific clauses | Programmatic and platform addenda are planned, not published |
| **Display & Video 360** | A budget container inside a campaign, whose line items share its budget | The platform's terms of service | Not a contract with a publisher; Campaigns & Line Items covers the hierarchy |
| **Microsoft Advertising** | A spend authorization under monthly invoicing: "an insertion order specifies the maximum of what you're willing to pay" | The credit line's terms | Agencies may "create, edit, approve, and cancel IOs on your client's behalf"; invoices go out on the 2nd business day for the prior month, payable in 30 days under the example terms |

The table's first lesson is about names: **"insertion order" is two different things.** In direct sales it is a signed contract with a seller; in DV360 and Microsoft Advertising it is a budget or spend authorization inside one platform, under that platform's terms. This volume's `insertion_orders` table is the contract (a buyer, a seller, terms, a controlling measurement); a DSP's insertion order is a `campaigns` or `shared_budgets` row (Campaigns & Line Items), and an external platform's IO object maps through `platform_entity_refs`. Calling both "IO" in one schema is how a billing system ends up applying the 10% discrepancy rule to a DSP budget.

## What an IO Contains

The 3.0 terms list what each IO specifies "as applicable": "(i) the type(s) and amount(s) of Deliverables, (ii) the price(s) for such Deliverables, (iii) the maximum amount of money to be spent pursuant to the IO, (iv) the start and end dates of the campaign, and (v) the identity of and contact information for any Third Party Ad Server," and optionally "reporting requirements, any special Ad delivery scheduling and/or Ad placement requirements, and specifications concerning ownership of data collected." In practice an IO also carries:

- **Parties:** the agency and the advertiser it acts for (the advertiser is the agency's "disclosed principal"), the media company, billing contacts and addresses.
- **Lines:** each placement or package with its ad unit or targeting, deliverable type (CPM, CPC, CPA, flat fee, share of voice), quantity, rate, dates, and whether it is guaranteed and cancelable.
- **Commercial terms:** the payment schedule if not the standard one, the invoice reference the agency requires (an IO number, a purchase order, a campaign name), short rates, any non-cancelable designation, custom material fees as their own line.
- **Measurement:** the third-party ad server, the controlling measurement, viewability or verification requirements, and editorial adjacency categories the advertiser wants to avoid ([Brand Safety & Suitability](/books/advertising/brand-safety-and-suitability), in Fraud and Brand Safety, covers the adjacency remedy).
- **The terms version** it incorporates, and the conflicts rule: under 3.0, "In the event of any inconsistency between the terms of an IO and these Terms, the terms of the IO will prevail," and modifications to the terms need writing "signed by both parties."

The terms define deliverable types by pricing basis ("CPM Deliverables", "CPC Deliverables", "CPA Deliverables", "CPL Deliverables") because the rules differ by type: cancellation notice, guarantees and make-goods all depend on it. Pricing Models, in Auctions and Pricing, covers the models and their billing events; the IO line needs the type as a field because the contract's clocks read it.

## Acceptance and Revisions

**Availability.** The publisher makes "commercially reasonable efforts to notify Agency within two (2) business days of receipt of an IO signed by Agency if the specified inventory is not available." Forecasting & Avails covers the availability check; the contract makes its answer due within two business days.

**Acceptance** is "the earlier of (i) written ... approval of the IO by Media Company and Agency, or (ii) the display of the first Ad impression by Media Company, unless otherwise agreed on the IO." Serving the first impression accepts the IO and its terms. A system must therefore never serve a line item from an IO it hasn't accepted, and must record when acceptance happened and how: the first impression's timestamp is a contract event.

**Revisions** "will be made in writing and acknowledged by the other party," and "modifications to the originally submitted IO will not be binding unless approved in writing by both." Every change to quantities, rates, dates or placements is a revision with both parties' approval, and the line items serving under the IO change only when the revision is approved. An ad ops user editing a line item's end date in the ad server is changing delivery; the contract changes only when the revision is signed. The make-good rule depends on this: under 3.0, "In no event will Media Company provide a makegood or extend any Ad beyond the period set forth on the IO without the prior written consent of Agency."

## Cancellation and Short Rates

Unless the IO marks lines non-cancelable, the advertiser may cancel all or part of an IO "without penalty" with prior written notice that depends on the deliverable:

| Deliverable | Notice | Examples in the terms |
| --- | --- | --- |
| Guaranteed | 14 days | "any guaranteed Deliverable, including, but not limited to, CPM Deliverables" |
| Non-guaranteed | 7 days | CPC, CPL and CPA deliverables, "as well as some non-guaranteed CPM Deliverables" |
| Flat fee or fixed placement | 30 days | "roadblocks, time-based or share-of-voice buys, and some types of cancelable sponsorships" |

The terms give a worked example for the 14-day rule: "if Advertiser cancels the guaranteed portions of the IO eight (8) days prior to serving of the first impression, Advertiser will only be responsible for the first six (6) days of those Deliverables." The notice period runs from the notice, and the advertiser owes whatever would have delivered inside it. Custom material (custom content or development "provided to Advertiser or completed by Media Company or its third-party vendor prior to the effective date of termination") is owed regardless, must be a separate line item on the IO, and is payable within 30 days of its invoice. "Short rates will apply to canceled buys to the degree stated on the IO": a discount that depended on the full volume can be repriced on what actually ran.

**For cause,** either party may terminate on a material breach "not cured within 10 days after receipt of written notice." The publisher may also terminate if the agency or advertiser violates "the same Policy three times" with timely notice each time, even if each was cured.

The cancellation rule is a computation over dates and deliverable types, which is why it belongs in code reading the IO's lines. The sketch below computes, for each line, the effective cancellation time and the portion of the line's booked delivery the advertiser still owes, prorating evenly over the flight for simplicity (a real system prorates on the line's pacing plan or its actual delivery inside the notice window, per the IO):

```go tab="Go"
type IOLine struct {
	ID          string
	Deliverable string // guaranteed, non_guaranteed, flat_fee
	Cancelable  bool
	Start, End  time.Time // flight, end exclusive
	BookedMinor int64     // the line's booked cost
}

type Cancellation struct {
	EffectiveAt time.Time
	OwedMinor   int64
}

var noticeDays = map[string]int{"guaranteed": 14, "non_guaranteed": 7, "flat_fee": 30}

// Cancel returns, per line, when the cancellation takes effect and the amount still owed
// for delivery scheduled between the line's start and that effective time.
func Cancel(lines []IOLine, noticeAt time.Time) map[string]Cancellation {
	out := make(map[string]Cancellation, len(lines))
	for _, l := range lines {
		if !l.Cancelable {
			out[l.ID] = Cancellation{l.End, l.BookedMinor}
			continue
		}
		eff := noticeAt.AddDate(0, 0, noticeDays[l.Deliverable])
		owedDays := int64(eff.Sub(l.Start).Hours() / 24)
		flightDays := int64(l.End.Sub(l.Start).Hours() / 24)
		var owed int64
		switch {
		case owedDays <= 0:
			owed = 0
		case eff.After(l.End):
			owed = l.BookedMinor
		default:
			owed = l.BookedMinor * owedDays / flightDays
		}
		out[l.ID] = Cancellation{eff, owed}
	}
	return out
}
```

```rust tab="Rust"
use chrono::{DateTime, Duration, Utc};
use std::collections::HashMap;

pub struct IoLine {
    pub id: String,
    pub deliverable: &'static str, // guaranteed, non_guaranteed, flat_fee
    pub cancelable: bool,
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>, // exclusive
    pub booked_minor: i64,
}

fn notice_days(deliverable: &str) -> i64 {
    match deliverable {
        "guaranteed" => 14,
        "non_guaranteed" => 7,
        _ => 30, // flat fee or fixed placement
    }
}

/// Per line: when the cancellation takes effect and the amount still owed.
pub fn cancel(lines: &[IoLine], notice_at: DateTime<Utc>) -> HashMap<String, (DateTime<Utc>, i64)> {
    let mut out = HashMap::new();
    for l in lines {
        if !l.cancelable {
            out.insert(l.id.clone(), (l.end, l.booked_minor));
            continue;
        }
        let eff = notice_at + Duration::days(notice_days(l.deliverable));
        let owed_days = (eff - l.start).num_days();
        let flight_days = (l.end - l.start).num_days();
        let owed = if owed_days <= 0 {
            0
        } else if eff > l.end {
            l.booked_minor
        } else {
            l.booked_minor * owed_days / flight_days
        };
        out.insert(l.id.clone(), (eff, owed));
    }
    out
}
```

With the terms' own example (a guaranteed line starting March 9, notice given March 1, so 8 days before the first impression), the effective time is March 15 and the advertiser owes 6 days of a 30-day line booked at $30,000.00: 3,000,000 x 6 / 30 = 600,000 minor units, $6,000.00. A non-cancelable line owes its whole booked amount.

## Reporting, Make-Goods and Bonus Impressions

The terms turn delivery into obligations with deadlines:

- **Confirmation of initiation** "within two (2) business days of the start date on the IO," stating whether the IO's components have begun delivery.
- **Reporting** "at least as often as weekly" when the publisher serves the campaign, broken out by day and summarized by creative, placement, impressions, clicks and cost. Once reports are provided, the agency and advertiser "are entitled to reasonably rely on" them.
- **Reporting failure** must be cured "within five (5) business days of receipt of such notice"; uncured, it "may result in nonpayment for all activity for which data is incomplete or missing until Media Company delivers reasonable evidence of performance," and the agency may start make-good discussions.
- **Under-delivery notice** "as soon as possible (and no later than 14 days before the applicable IO end date unless the length of the campaign is less than 14 days)."
- **Make-goods** for shortfalls or omitted ads are agreed "either on the IO or at the time of the shortfall"; if none can be agreed, the agency "may execute a credit equal to the value of the under-delivered portion of the IO for which it was charged," or, if it prepaid and is current, take a refund. For CPA, CPL and CPC deliverables, "guaranteed delivery, even delivery, and makegoods are not available."
- **Bonus impressions:** with a third-party ad server, the publisher "will not bonus more than 10% above the Deliverables specified on the IO without the prior written consent of Agency"; without one, it may bonus as many as it chooses.

Pacing & Frequency Capping turns the under-delivery notice into a projection with a due date and the make-good into a linked line item (`make_goods`, `delivery_projections`); this chapter's job is to make sure the deadlines it computes come from the IO's terms version, not constants. Two 10% rules sit in these terms, and they are different: the bonus cap is 10% over the deliverables; the discrepancy rule (below) is 10% between two counts.

## Payment and Sequential Liability

**Invoices.** "The initial invoice will be sent by Media Company upon completion of the first month's delivery, or within 30 days of completion of the IO, whichever is earlier." Invoices go to the agency's billing address with the references it specifies ("the IO number, Advertiser name, brand name or campaign name, and any number or other identifiable reference stated as required for invoicing on the IO"), on "a calendar-month basis with the net cost (i.e., the cost after subtracting Agency commission, if any) based on actual delivery, flat-fee, or based on prorated distribution of delivery over the term of the IO." All invoices "(other than corrections of previously provided invoices) ... will be sent within 90 days of delivery of all Deliverables," because a late invoice "may cause Agency to be contractually unable to collect payment from the Advertiser." Billing & Invoicing turns these into the invoice run.

**Payment.** "Agency will make payment 30 days from its receipt of invoice, or as otherwise stated in a payment schedule set forth on the IO." If unpaid in that period, the publisher may notify the agency that it intends to seek payment from the advertiser, and may do so "five (5) business days after providing such notice."

**Sequential liability.** Unless the IO says otherwise, the publisher holds the agency "liable for payments solely to the extent proceeds have cleared from Advertiser to Agency for Ads placed in accordance with the IO. For sums not cleared to Agency, Media Company agrees to hold Advertiser solely liable." The advertiser is the agency's "disclosed principal," and the agency "as agent, has no obligations relating to such payments, either joint or several" beyond that. Three further rules: the agency's "credit is established on a client-by-client basis"; one advertiser's non-payment doesn't bar the agency's other advertisers "if such other advertisers' credit is not in question"; and "If Advertiser's or Agency's credit is or becomes impaired, Media Company may require payment in advance." On request, the agency confirms its relationship with the advertiser and whether the advertiser has prepaid funds for the IO.

Sequential liability is why the core model's `insertion_orders.liability` exists and why the advertiser is always a separate party from the agency. For a publisher's receivables it means the debtor on an invoice is conditional: the agency for amounts the advertiser has paid it, the advertiser for the rest. A collections system has to track, per invoice, whether the agency has confirmed clearance, and switch the collection target (with the 5-business-day notice) when it hasn't. Advertiser Payments & Credit covers credit limits and agency credit risk.

## Third-Party Ad Serving and the Controlling Measurement

When the agency uses a third-party ad server (approved in writing by the publisher), both parties count, and the terms decide which count is invoiced, "the measurement used for invoicing advertising fees under an IO ('Controlling Measurement')":

1. It is "taken from an ad server that is certified as compliant with the IAB/AAAA Ad Measurement Guidelines."
2. If both comply, it is the third-party ad server's, "if such Third Party Ad Server provides an automated, daily reporting interface which allows for automated delivery of relevant and non-proprietary statistics to Media Company," with access within "one (1) day after campaign launch."
3. If neither complies or the reporting condition fails, it is the publisher's ad server, "unless otherwise agreed."

If the party with the controlling measurement fails to give the other access or reports, and both tracked from the start, the other party "may use or provide its ad server statistics as the basis of calculating campaign delivery for invoicing." When the counts diverge, "If the difference between the Controlling Measurement and the other measurement exceeds 10% over the invoice period and the Controlling Measurement is lower," the parties reconcile; if that fails after a good-faith effort, the agency may treat the gap as under-delivery (with any make-good "measured by the Third Party Ad Server") or "Pay invoice based on Controlling Measurement-reported data, plus a 10% upward adjustment to delivery." Reconciliation & Discrepancies covers the process.

Two operational clauses: if the third-party ad server can't serve, the agency has "a one-time right to temporarily suspend delivery under the IO for a period of up to 72 hours," the publisher has 24 hours to suspend after notice, and after the 72 hours the advertiser pays for ads that would have run; once fixed, the publisher has 72 hours to resume or owes a make-good. And the third-party ad server can't be substituted "without Media Company's prior written consent."

## Force Majeure and the Rest

Excluding payment, neither party is liable for delays "caused by conditions beyond its reasonable control"; the publisher proposes a substitute "within five (5) business days," otherwise the agency gets a pro rata reduction, and after five business days of a continuing event either party "has the right to cancel the remainder of the IO without penalty." A payment delay caused by a failure of "banking clearing systems or a state of emergency" is excused for its duration without reducing the amount owed. The terms also cover ad materials (late creative, the publisher's right to reject ads under its policies, no editing of submitted ads), indemnities, limitation of liability, confidentiality and the use of collected data (the advertiser may not use the publisher's site data to build profiles beyond the campaign without authorization), and survival of the payment, make-good, indemnity and confidentiality sections after termination.

## The 2026 IAB Framework

The ANA, the 4A's and the IAB announced a joint task force in March 2023 to revise the terms, first written in May 2001 and updated in 2010 and 2018. The IAB published the result as a modular framework: General Terms (a "common legal baseline document for all types of digital advertising agreements"), a Direct Buy Addendum ("Standardized terms for direct digital media buys"), and Order-Specific Terms for IOs ("a set of clauses on an as needed basis for addressing direct buy deal-specific terms," such as cancellation, sponsorships, custom content and upfront deals). Final versions (General Terms v1.1, Direct Buy Addendum v1.0, Order-Specific Terms for IOs v1.0) have been "available for industry use" since May 20, 2026. The IAB describes the general terms as covering liability, force majeure, payment term options, confidentiality and intellectual property, and also data usage, measurement and fraud prevention, and says programmatic and platform terms come next, in 2026.

The final documents are behind an IAB member login, so the clause-level changes below come from trade press reports of the public comment draft (open February 12 to March 31, 2026), not from the final text: <!-- source-gap: adv-iab-2026-terms-final-text | secondary | the clause-level terms of the IAB General Terms v1.1 and Direct Buy Addendum v1.0 (cancellation notice, IVT thresholds, default controlling measurement) | closes with: the final documents or an IAB public summary of their clauses | checked: 2026-11-22 -->

- **Cancellation notice** of 10 business days for guaranteed deliverables, 5 business days for non-guaranteed (PMP and preferred deals among them) and 30 days for flat-fee or fixed placements, changeable by the order, with the buyer liable only for business days between the cancellation and the start of delivery.
- **Discrepancies:** the same 10% test, triggered when the gap "exceeds 10% over applicable invoice periods and the controlling measurement is lower"; where the order names no controlling measurement, the ad server or system that renders the ad bills.
- **Invalid traffic:** sellers detect and filter IVT with commercially reasonable efforts, monitored weekly, IVT-driven impressions are non-billable, and remedies trigger above "greater than 2% for general invalid traffic or 0.1% for sophisticated invalid traffic."
- **Measurement:** MRC standards are the default definitions, including viewable impressions.
- **Scope:** the Direct Buy Addendum "applies specifically to non-programmatic direct relationships."

The engineering consequence is the same whichever terms an IO uses: the clocks and thresholds are parameters of a terms version, and an IO signed under 3.0 keeps 3.0's 14 calendar days while one signed under the Direct Buy Addendum (if the draft's numbers survived) counts business days. A system that hard-codes "14 days" or "10%" can't hold both.

## Programmatic and Platform Terms

Programmatic buying mostly runs without IOs. An open-auction or PMP buy is governed by the DSP's terms with its client, the exchange's terms with the DSP (its buyer terms) and with the publisher (its seller terms), each a platform agreement accepted once and amended by the platform; a deal ID is an agreement on price and inventory inside those terms, not a contract of its own. Programmatic guaranteed deals sit between: they carry an IO's guarantee and often an IO-like order between buyer and seller, executed through the platforms. As of November 2026 the IAB's programmatic addendum is not published, and I found no other public standard for programmatic buy terms (cancellation, discrepancy tolerance between a DSP's and an exchange's counts, IVT refunds); Reconciliation & Discrepancies notes the same gap for discrepancies, and [Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud) covers how platforms state IVT refunds in their own terms.

Self-serve platforms replace the IO with their terms of service and billing settings. Where a platform uses the word (Microsoft Advertising's IOs under monthly invoicing), the "IO" is a spend cap and invoice reference against a credit line, which Advertiser Payments & Credit covers.

## How to Build It

The core `insertion_orders` row names a terms version, the controlling measurement, the discrepancy tolerance and the liability rule; Agencies & Media Buying adds the agency agreement and the buy basis. This chapter makes the terms a versioned record with the parameters the system runs, adds the IO's contract lines (distinct from the line items that deliver them), and records every revision, acceptance and cancellation as an event with its approvals.

```sql
CREATE TABLE contract_terms (              -- a standard terms document version and its operative parameters
  id                        UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id          UUID REFERENCES organizations (id),  -- null: an industry standard (IAB/4A's)
  code                      TEXT NOT NULL,       -- 'iab-4as-3.0', 'iab-general-1.1+direct-buy-1.0'
  title                     TEXT NOT NULL,
  published_on              DATE,                -- when known
  cancel_notice_day_basis   TEXT NOT NULL CHECK (cancel_notice_day_basis IN ('calendar',
                              'business')),
  cancel_notice_guaranteed_days     SMALLINT NOT NULL,   -- 3.0: 14
  cancel_notice_non_guaranteed_days SMALLINT NOT NULL,   -- 3.0: 7
  cancel_notice_flat_fee_days       SMALLINT NOT NULL,   -- 3.0: 30
  availability_reply_business_days  SMALLINT,            -- 3.0: 2
  under_delivery_notice_days        SMALLINT,            -- 3.0: 14 before end
  report_cure_business_days         SMALLINT,            -- 3.0: 5
  invoice_within_days_of_delivery   SMALLINT,            -- 3.0: 90
  payment_days                      SMALLINT NOT NULL,   -- 3.0: 30 from receipt
  direct_collection_notice_business_days SMALLINT,       -- 3.0: 5
  bonus_cap_bp                      INT,                 -- 3.0: 1000 with a third-party ad server
  discrepancy_tolerance_bp          INT NOT NULL,        -- 3.0: 1000
  discrepancy_uplift_bp             INT,                 -- 3.0: 1000, "plus a 10% upward adjustment"
  breach_cure_days                  SMALLINT,            -- 3.0: 10
  ivt_remedy_givt_bp                INT,                 -- reported 2026 draft: 200
  ivt_remedy_sivt_bp                INT,                 -- reported 2026 draft: 10
  default_liability                 TEXT NOT NULL CHECK (default_liability IN ('sequential',
                                      'joint', 'agency', 'advertiser')),
  document_ref                      TEXT NOT NULL,       -- the document and its revision
  UNIQUE (publisher_org_id, code)
);

ALTER TABLE insertion_orders ADD COLUMN contract_terms_id UUID;
ALTER TABLE insertion_orders ADD CONSTRAINT insertion_orders_contract_terms_fk
  FOREIGN KEY (contract_terms_id) REFERENCES contract_terms (id) NOT VALID;
ALTER TABLE insertion_orders
  ADD COLUMN accepted_at TIMESTAMPTZ,                  -- written approval or first impression
  ADD COLUMN accepted_by TEXT,                         -- 'written' or 'first_impression'
  ADD COLUMN invoice_reference TEXT,                   -- PO or reference the agency requires
  ADD COLUMN third_party_ad_server_org_id UUID,
  ADD COLUMN overrides JSONB NOT NULL DEFAULT '{}';    -- IO terms that prevail over the standard terms
ALTER TABLE insertion_orders ADD CONSTRAINT insertion_orders_accepted_by_check
  CHECK (accepted_by IN ('written', 'first_impression')) NOT VALID;
ALTER TABLE insertion_orders ADD CONSTRAINT insertion_orders_third_party_ad_server_fk
  FOREIGN KEY (third_party_ad_server_org_id) REFERENCES organizations (id) NOT VALID;

CREATE TABLE insertion_order_lines (       -- the contract's lines, distinct from delivery
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insertion_order_id  UUID NOT NULL REFERENCES insertion_orders (id),
  line_number         SMALLINT NOT NULL,
  description         TEXT NOT NULL,       -- placement or package as written
  ad_unit_id          UUID REFERENCES ad_units (id),
  deliverable         TEXT NOT NULL CHECK (deliverable IN ('guaranteed', 'non_guaranteed',
                        'flat_fee', 'custom_material')),
  pricing_model       TEXT NOT NULL,       -- as line_items.pricing_model
  quantity            BIGINT,              -- impressions, clicks or views; null for flat fee
  rate_micros         BIGINT CHECK (rate_micros >= 0),
  booked_minor        BIGINT NOT NULL CHECK (booked_minor >= 0),
  flight              TSTZRANGE NOT NULL,
  cancelable          BOOLEAN NOT NULL DEFAULT TRUE,
  short_rate_terms    JSONB,               -- repricing if canceled short
  line_item_id        UUID REFERENCES line_items (id),  -- the delivery that fulfills it, once trafficked
  status              TEXT NOT NULL CHECK (status IN ('booked', 'delivering', 'cancelled',
                        'completed')),
  UNIQUE (insertion_order_id, line_number),
  CHECK (deliverable <> 'custom_material' OR cancelable = FALSE)
);

CREATE TABLE insertion_order_revisions (   -- every change to the contract, with both approvals
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insertion_order_id  UUID NOT NULL REFERENCES insertion_orders (id),
  revision            INT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('amendment', 'cancellation',
                        'termination_for_cause', 'makegood_extension', 'force_majeure')),
  changes             JSONB NOT NULL,      -- lines added, removed or changed, with before and after
  notice_at           TIMESTAMPTZ,         -- cancellation or breach notice
  effective_at        TIMESTAMPTZ NOT NULL,
  owed_minor          BIGINT,              -- cancellation: amounts still owed, computed
  requested_by        TEXT NOT NULL,
  buyer_approved_at   TIMESTAMPTZ,
  seller_approved_at  TIMESTAMPTZ,
  UNIQUE (insertion_order_id, revision),
  CHECK (kind = 'cancellation' OR (buyer_approved_at IS NOT NULL AND seller_approved_at IS NOT NULL)
         OR kind IN ('termination_for_cause', 'force_majeure'))
);

CREATE INDEX CONCURRENTLY insertion_order_lines_line_item_idx
  ON insertion_order_lines (line_item_id) WHERE line_item_id IS NOT NULL;

-- after backfilling terms onto existing IOs
ALTER TABLE insertion_orders VALIDATE CONSTRAINT insertion_orders_contract_terms_fk;
ALTER TABLE insertion_orders VALIDATE CONSTRAINT insertion_orders_accepted_by_check;
ALTER TABLE insertion_orders VALIDATE CONSTRAINT insertion_orders_third_party_ad_server_fk;
```

The 3.0 terms as a row; a row for the 2026 framework waits for the final text, with the reported draft values held under a separate draft code if needed meanwhile:

```sql
INSERT INTO contract_terms (code, title, cancel_notice_day_basis,
  cancel_notice_guaranteed_days, cancel_notice_non_guaranteed_days, cancel_notice_flat_fee_days,
  availability_reply_business_days, under_delivery_notice_days, report_cure_business_days,
  invoice_within_days_of_delivery, payment_days, direct_collection_notice_business_days,
  bonus_cap_bp, discrepancy_tolerance_bp, discrepancy_uplift_bp, breach_cure_days,
  default_liability, document_ref)
VALUES ('iab-4as-3.0', 'IAB/4A''s Standard Terms and Conditions 3.0', 'calendar',
  14, 7, 30, 2, 14, 5, 90, 30, 5, 1000, 1000, 1000, 10, 'sequential',
  'https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf');
```

Design notes:

- **Terms are parameters, not constants.** Every clock (availability reply, cancellation notice, under-delivery notice, report cure, invoice deadline, payment due, direct-collection notice) and every threshold (bonus cap, discrepancy tolerance and uplift, IVT remedy) is a column of the terms version, and the IO's `overrides` hold anything the IO changed, because "the terms of the IO will prevail." The core's `discrepancy_tolerance_bp` on the IO is the effective value after overrides.
- **Contract lines and delivery lines are different rows.** An IO line is what was sold; a line item is what the ad server delivers. One IO line can be fulfilled by several line items (split by creative or targeting), a make-good adds a line item with no new IO line, and a cancellation changes the IO line's status while the line item stops through pacing. `insertion_order_lines.line_item_id` links them; billing reads the IO line's rate and the line item's delivery.
- **Acceptance is recorded, including by impression.** `accepted_by = 'first_impression'` with the timestamp of the first impression is how the system shows when the terms bound the parties, and the ad server refuses to serve line items of IOs in `draft` or `sent`.
- **Revisions need two approvals; notices don't.** A cancellation is unilateral (a notice with a computed effective time and amount owed), a termination for cause starts with a notice and a cure period, and everything else needs both sides' approval before delivery changes.
- **The 2026 values are flagged until verified.** Rows for the new IAB framework carry the reported draft values in a separate version code so that, once the final text is read, a corrected row replaces them without touching 3.0 IOs.
- **Liability is per IO and drives collections.** `insertion_orders.liability` defaults from the terms; under `sequential`, the receivable's debtor depends on clearance confirmation, which Advertiser Payments & Credit tracks.

## Auditing

- **Every IO with its terms version, overrides, acceptance and approvals,** so a dispute is judged against the contract that bound the parties when each impression served.
- **Every revision and notice,** with who requested it, when it was effective, what it changed and what was still owed, and both approvals where required.
- **Every contractual deadline and whether it was met:** availability replies, initiation confirmations, weekly reports, under-delivery notices, report cures, invoice dates within 90 days of delivery, payment due dates and direct-collection notices.
- **The controlling measurement and its access,** including when the controlling party gave the other access, because missing access shifts invoicing to the other party's count.
- **The link from each IO line to the line items and delivery that fulfilled it,** for make-goods, credits and cancellation amounts.

## What This Means for the System You Build

- **Keep "insertion order" for the contract,** and map a DSP's or platform's IO object to campaigns, budgets or spend caps.
- **Model standard terms as versioned rows with their clocks and thresholds,** and apply IO-level overrides, since the IO prevails.
- **Separate IO lines (what was sold) from line items (what delivers),** and link them.
- **Record acceptance, including by first impression,** and never serve from an unaccepted IO.
- **Compute cancellations and amounts owed** from notice dates, deliverable types and the terms version.
- **Track contractual deadlines as scheduled obligations** and record whether each was met.
- **Make the debtor depend on the liability rule:** under sequential liability, the advertiser for what hasn't cleared to the agency.

## References

**Specifications**

- [IAB/4A's: Standard Terms and Conditions for Internet Advertising for Media Buys One Year or Less, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), IO details, acceptance, revisions, cancellation and its worked example, custom material, short rates, termination for cause, reporting, make-goods, bonus impressions, invoices, payment, sequential liability, controlling measurement, discrepancies, third-party ad server malfunction, force majeure and conflicts
- [IAB: Standard Advertising Services Terms and Conditions (May 20, 2026)](https://www.iab.com/guidelines/direct-buy-addendum-v1-0-final/), the final General Terms v1.1, Direct Buy Addendum v1.0 and Order-Specific Terms for IOs v1.0 and what each covers

**Reference**

- [IAB: Ad industry launches effort to revise standard terms and conditions (March 15, 2023)](https://www.iab.com/news/ad-industry-launches-effort-to-revise-new-standard-terms-conditions-for-digital-advertising/), the ANA, 4A's and IAB task force and the terms' history since 2001
- [IAB: IAB unites the industry with new standard terms (December 12, 2025)](https://www.iab.com/blog/iab-unites-the-industry-with-new-standard-terms/), the modular framework, the topics of the General Terms, and programmatic and platform terms planned for 2026
- [PPC Land: IAB's new contract framework addresses 15 years of advertising chaos](https://ppc.land/iabs-new-contract-framework-addresses-15-years-of-advertising-chaos/), the public comment period and the draft's cancellation notice, discrepancy, IVT and measurement clauses (secondary)

**In practice**

- [Microsoft Advertising: Monthly invoice billing](https://raw.githubusercontent.com/MicrosoftDocs/Advertising/main/advertising/msa-help/hlp_BA_CONC_MonthlyInvoiceBilling.md), insertion orders as spend caps under a credit line, agency management of client IOs, invoice timing and 30-day payment
