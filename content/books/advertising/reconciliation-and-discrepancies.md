+++
title = "Reconciliation & Discrepancies"
nav_title = "Reconciliation"
description = "Whose count bills: the IAB/4A's 10% rule, first-party against third-party counts, why ad servers disagree, log-level matching, and invalid traffic credits."
category = "Advertising Industry"
order = 2965
part = "Contracts and Money"
tags = ["advertising", "reconciliation", "discrepancies", "billing", "invalid-traffic", "data-model"]
+++

Reconciliation is comparing one party's count of a campaign's delivery with another's before money moves on it. A publisher's ad server says it served 1,960,000 impressions; the agency's ad server, which the insertion order names as the controlling measurement, says 1,720,000; the invoice can only carry one number. Every buy in this volume has at least two counts (the seller's and the buyer's), most have three or four (an exchange, a DSP, a verification vendor), and none of them agree, because each counts at a different moment in the life of an impression, filters invalid traffic its own way, cuts the day in its own time zone and loses a different share of beacons.

The engineering is hard because the disagreement is normal and the contract only decides part of it. The IAB/4A's standard terms say which count controls and what happens when the gap passes 10%, but not how to compute the 10%, what to do when the controlling count is the higher one, or how a programmatic buy is reconciled; Google's own help pages call gaps of up to 20% common for third-party creatives. So the system has to keep every party's count as its own record, compare them over the period the contract names, explain the gap with causes it can test, and turn the outcome into exactly one remedy: an invoice that stands, a make-good, a credit or payment on the controlling count plus 10%. Invalid traffic found after billing adds a second loop, a credit computed from a later finding, often weeks after the invoice.

This chapter covers the 10% rule and the controlling-measurement rule as the standard terms write them, first-party against third-party counts and the causes the platforms document, log-level reconciliation for programmatic buys, invalid traffic credits, and the period close. It extends `delivery_daily` and `invoice_lines` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), which already keeps one billable row per source per day and an `insertion_orders.discrepancy_tolerance_bp` of 1000. Other chapters own the neighbors: [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms) has the contract itself and `contract_terms`; [Billing & Invoicing](/books/advertising/billing-and-invoicing) has the invoice run, billing periods and credit memos; Counting Impressions & Clicks, in Ad Serving and Creative, owns how each count is made and when late beacons stop counting; Pacing & Frequency Capping owns `make_goods`; [Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud), in Fraud and Brand Safety, owns detection, `ivt_findings` and `ivt_adjustments`; and [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it) owns `log_match_runs`, which this chapter reuses. The generic rules for disputed usage counts are the playbook's [Disputes Over Counts](/docs/money/usage-based-billing#disputes-over-counts).

## How the Platforms Do It

As of November 2026, what the standard terms and the platforms' public pages say about count gaps and credits:

| Source | Expected gap | Rule or remedy | Credit for invalid traffic |
| --- | --- | --- | --- |
| **Campaign Manager 360** (Google, advertiser ad server) | Discrepancies "up to 20 percent are considered normal" | Lists causes to check: mismatched date ranges, modified or wrapped tags, cache-busting, duplicate tags, invalid traffic filtering, methodology, click trackers | Not on the page |
| **Display & Video 360** (Google, DSP) | "It is common to see campaign variances of up to 20%"; compare only on "over 1000" impressions | DV360 counts when it wins and requests the ad, Campaign Manager 360 when the creative begins to render | Not on the page |
| **Google Ad Manager** (publisher ad server) | Within 2% with Campaign Manager 360 tags; "up to 20%" for third-party creatives | Check the same dates, time zone, line items, and exclude unfilled impressions; "it's possible that there will be no resolution", so agree terms with the buyer upfront | Not on the page |
| **Google Ads** (search and display) | Not stated | Invalid traffic found before the billing cycle ends is never charged | A billing adjustment labeled "Invalid activity", usually in the next cycle; campaign metrics are not rewritten; investigation requests cover the last 60 days |
| **IAB/4A's Standard Terms 3.0** | 10% over the invoice period | When the controlling count is lower by more than 10% and reconciliation fails, the agency treats the gap as under-delivery or pays on the controlling count "plus a 10% upward adjustment" | Not addressed |
| **Microsoft Monetize** (SSP) | Not stated | Buyers claim non-human traffic for the previous month within 10 days of month close, with a report from an approved verification partner | A credit note to the buyer at the month's average CPM, and an adjustment on the seller's remittance statement |

Three patterns:

- **A tolerance is a contract term, not a measurement fact.** The vendors publish what is common (2% when both sides use one vendor's tags, 20% across vendors); only the contract says what gap triggers a remedy, and the IAB/4A's 10% is the only published default.
- **Credits for invalid traffic don't rewrite the counts.** Google Ads credits the money and leaves campaign metrics frozen; Microsoft Monetize credits at an average CPM rather than per impression. The credit is a money record on a later document, not a restatement of the original delivery rows.
- **Nobody promises resolution.** Ad Manager's help page says a discrepancy investigation may end without one. The remedy has to be decidable from records the parties already hold.

## The 10% Rule

The IAB/4A's Standard Terms and Conditions for Internet Advertising for Media Buys One Year or Less, version 3.0 (2010), are still the published default for direct-sold digital buys, and most insertion orders either adopt them or amend them. Section XIII applies when the agency uses a third-party ad server, and its four rules are the ones a reconciliation system implements:

1. **Which count controls.** If both parties track delivery, the controlling measurement is taken from an ad server "certified as compliant with the IAB/AAAA Ad Measurement Guidelines." If both are compliant, it is the third-party ad server, provided that server gives the publisher "an automated, daily reporting interface"; if neither qualifies, it is the publisher's ad server unless the parties agree otherwise in writing. The core model stores the result as `insertion_orders.controlling_measurement`.
2. **Access to the controlling count.** The party with the controlling measurement gives the other party online or automated access to its statistics "within one (1) day after campaign launch." If both have tracked the campaign from the start and the controlling party fails to provide access, the other party "may use or provide its ad server statistics as the basis of calculating campaign delivery for invoicing." Controlling is conditional on reporting.
3. **When a gap triggers reconciliation.** "If the difference between the Controlling Measurement and the other measurement exceeds 10% over the invoice period and the Controlling Measurement is lower, the parties will facilitate a reconciliation effort."
4. **What happens if it fails.** If the discrepancy can't be resolved after a good-faith effort, the agency may either treat it as an under-delivery, with a make-good flight whose delivery "will be measured by the Third Party Ad Server", or "Pay invoice based on Controlling Measurement-reported data, plus a 10% upward adjustment to delivery."

The terms leave three things open, and a system has to decide them explicitly:

- **The denominator.** "Exceeds 10%" of what? A gap of 240,000 impressions is 12.24% of a publisher count of 1,960,000 and 13.95% of a third-party count of 1,720,000. The terms don't say; contracts that care write it down. My default is to compute the gap as a share of the higher, non-controlling count, which is how the publisher's side will read it, and to record the denominator on every run so the other reading can be recomputed.
- **The direction.** The remedy applies only when the controlling count is lower. When the controlling count is the higher one, the terms give the publisher nothing more; the invoice stands on the controlling count, and the gap is a finding, not a claim.
- **The grain.** "Over the invoice period" means the comparison is of period totals, not of days. A daily 30% gap on a day split differently by two time zones can wash out over the month; a monthly 12% gap is a claim even if no single day looks bad. Days are diagnostics.

**A worked example.** A publisher books 2,000,000 homepage impressions at a $12.00 CPM (an example rate) for one month, $24,000, with the agency's third-party ad server controlling. At month end the publisher's ad server counts 1,960,000 and the third-party server 1,720,000:

| Step | Arithmetic | Result |
| --- | --- | --- |
| Gap | 1,960,000 − 1,720,000 | 240,000 impressions |
| Gap as a share of the publisher's count | 240,000 × 10,000 / 1,960,000 | 1,224 bp (12.24%), over the 1,000 bp tolerance |
| Invoice on the controlling count | 1,720,000 × $12.00 / 1,000 | $20,640.00 |
| Remedy (ii): controlling count plus 10% | 1,720,000 × 1.10 = 1,892,000 × $12.00 / 1,000 | $22,704.00 |
| Remedy (i): under-delivery against the booking | 2,000,000 − 1,720,000 | 280,000 impressions owed as a make-good, measured by the third-party server, or a credit of $3,360.00 |

Two properties fall out of the arithmetic. Paying the controlling count plus 10% never pays for more than the publisher counted, because the remedy only applies when the gap is over 10%: the publisher's count is then more than 1.111 times the controlling one, above the 1.10 the remedy pays. And it can exceed the booking when the controlling count is close to the goal, which the terms' bonus rule forbids billing: Section VII says the agency "will not be charged" for deliverables above any level "guaranteed or capped." My rule is to cap the adjusted quantity at the booked quantity.

A make-good from a discrepancy is the same record as a make-good from a shortfall, with `reason = 'discrepancy'` and `measured_on` set to the controlling source, delivered until the controlling count closes the gap (Make-Goods, in Pacing & Frequency Capping, has the table and the rules).

## First-Party and Third-Party Counts

"First-party" is the seller's own count: the publisher's ad server for a direct IO, the exchange for programmatic, the platform itself for a walled garden. "Third-party" is a count by someone else, usually the advertiser's ad server (Campaign Manager 360, Flashtalking, Innovid) serving or tracking the creative, or a measurement vendor counting viewable or valid impressions. The core model has the sources as `delivery_daily.source`; the IO's `controlling_measurement` picks one.

The two counts are made at different points of the same impression, which is why they never match. The causes the platforms document, grouped by what the system can check:

| Cause | Why the counts differ | What the system checks |
| --- | --- | --- |
| **Counting point** | DV360 counts when it wins and requests the ad; Campaign Manager 360 counts when the creative begins to render. A reader who leaves between the two is in one count only | Each source's counting policy (Counting Impressions & Clicks keeps it as data) |
| **Latency and abandonment** | The page or app is closed after the request, before the creative loads | Gap grows with slow creatives and heavy pages; compare by ad size and format |
| **Ad blocking** | Blocking software stops the third party's call after the publisher counted | Gap by browser and device |
| **Passbacks and chained servers** | A third party with no ad passes back; each additional server in the chain widens the gap | Count of hops in the creative's wrapper chain |
| **Third-party targeting and caps** | Day, time or frequency rules on the advertiser's server return no creative after the publisher counted | The advertiser's server settings for the line |
| **Invalid traffic filtering** | Each party filters with its own lists and models, at its own time | `invalid_impressions` per source; the same day before and after each party's filtering |
| **Dates and time zones** | Reports cut days at different midnights, or cover different date ranges | Both rows in the IO's time zone, or comparison only at the period total |
| **Unfilled and house impressions** | An ad server report that includes unfilled impressions inflates the publisher side | Report definitions and filters |
| **Tag and trafficking errors** | A click tracker without its impression tracker, a modified or wrapped tag, missing cache-busting, the same tag on several placements | A gap far above the usual range, or one that starts on a trafficking change |
| **Small volumes** | 30 impressions missing from a line delivering 100 a day is a 30% gap | Minimum volume before a comparison counts; DV360 suggests over 1,000 impressions |

Three rules follow. **Compare like with like before comparing counts.** The same line items, the same date range and time zone, the same impression definition, unfilled impressions out; Ad Manager's help page lists these checks before any investigation, and most "discrepancies" end there. **Know the usual gap per pair of sources.** A publisher that sees a steady 6% gap with one advertiser ad server and 18% with another has two different normal ranges, and a sudden change in either is the signal; the baseline belongs in the system, per source pair, format and device. **Pace on the count that bills.** A guaranteed line paced on the publisher's own count when the third party controls finishes "on goal" and short on the invoice; Over- and Under-Delivery, in Pacing & Frequency Capping, covers inflating the pacing goal by the observed gap.

Viewable-impression buys add a third count. When a buy is priced on viewable impressions, the measurement vendor's count is often the controlling one, and its measured rate is the denominator that moves; Viewability & Attention, in Measurement, covers the standard and why measured and viewable differ.

## Reconciling Programmatic Buys

Programmatic buys reconcile money, not just counts, and they have no published equivalent of the 10% rule. A DSP is billed by each exchange for cleared impressions; it bills its client for media plus fees; the exchange pays the publisher its share. Each hop's invoice comes from that party's log, and the billable event is set by each exchange's policy: OpenRTB's billing notice fires when a win "becomes billable based on exchange-specific business policy" (OpenRTB, in Programmatic, covers `burl` and the notice records). I found no public standard term for the tolerance or remedy between a DSP and an exchange; each agreement sets its own, and the system should store it per agreement rather than assume the IO default. <!-- source-gap: adv-programmatic-discrepancy-terms | missing | a published standard tolerance or remedy for DSP-to-exchange billing discrepancies | closes with: a public IAB Tech Lab, exchange or DSP terms document stating the tolerance and remedy | checked: 2026-11-22 -->

Reconciliation at the programmatic hop is therefore log-level: match impressions one by one across the two parties' logs, then compare what each side says was paid for the matched ones. The match is a `log_match_runs` row ([Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#how-to-build-it)): a period, the buyer's and seller's logs, a match key, the match rate, matched spend and the unknown delta. The best key is OpenRTB's `source.tid`, the transaction ID shared by every participant, which lets two companies join logs without impression-level guesswork; where it's missing, impression and auction IDs chain the match hop by hop, at lower rates. A reconciliation run at this hop points at the log match and compares totals the match explains:

- **Matched and billed by both.** The common case; differences are price differences (a fee applied differently, a currency conversion, rounding), and each is a fee term question.
- **Billed by the seller, not in the buyer's log.** A billing notice the buyer never received, a late beacon, or a duplicate; the seller's log row with its notice time is the evidence.
- **In the buyer's log, not billed.** An impression the buyer thought it won that the exchange never counted as billable: rendered but filtered, or a win notice without a billing notice.
- **Unmatched on both sides.** The unknown delta, reported with the match rate; ISBA's studies are why no derived figure should be quoted without it.

The money side of the same comparison is the DSP's working capital problem: The Trade Desk says it "typically pay[s] suppliers in advance of collections from our clients," so an exchange invoice the DSP has already paid is reconciled against a client invoice it hasn't collected. [Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit) covers that exposure.

## Invalid Traffic Credits

Invalid traffic is the other reason a billed count changes, and it arrives on a different clock. Filtering before the count removes general invalid traffic (known bots, data center traffic) from every party's `delivery_daily` row as it is built; Google Ads states the rule as invalid traffic found "before the end of your billing cycle" is removed and never charged. Sophisticated invalid traffic is often found later, after the invoice: by the platform's own review, by a verification vendor's report, or by a buyer's claim. Then the remedy is a credit, and three platform rules show its shape:

- **Credit, don't restate.** Google Ads issues "credits in the form of a billing adjustment for the value of the invalid activity", labeled "Invalid activity" on the invoice, "in the next billing cycle, when appropriate and possible", and it "won't retroactively adjust your campaign data." The delivery rows that billed stay as they were; the credit is a new line on a new document.
- **A claim window and evidence.** Microsoft Monetize takes buyer claims for the previous month "within 10 days of the month's close", one claim per month, with reporting from an approved verification partner; Google Ads takes investigation requests for activity "within the last 60 days." A claim without the window and the evidence type in the agreement is a negotiation, not a process.
- **Average price, both sides.** Microsoft Monetize refunds the buyer the cost of the claimed impressions and reduces the seller's revenue "based on the average media cost for the month", quoting the adjustment on the seller's remittance statement. A credit computed at an average CPM is simpler than one priced per impression, and it means the buyer's credit and the seller's deduction are two computations from one claim that must reconcile to each other.

In this volume's model, the finding (what was invalid, from which source, over which period) is an `ivt_findings` row and its money consequence per party and period an `ivt_adjustments` row, both in Invalid Traffic & Ad Fraud. Reconciliation consumes them: the buyer's credit is an `invoice_lines` row of kind `ivt_credit` on the next invoice, pointing at the adjustment; the publisher's side is a deduction on its statement ([Publisher Payouts & Revenue Share](/books/advertising/publisher-payouts)). The adjustment is not a reason to reopen the original reconciliation run; the run compared counts as they were billed, and the credit is a later event with its own date.

## Closing the Period

Reconciliation needs a closed period to compare, and the close is where late data, restatements and disputes meet. Beacons arrive late, `delivery_daily` rows are restated with a new `version` as they do, and the billing period closes on a date; after close, late events go to a separate late count that the next invoice can carry as an adjustment (Late Data and the Billing Close, in Counting Impressions & Clicks; the generic rule is [Late Events and Closing a Period](/docs/money/usage-based-billing#late-events-and-closing-a-period)).

The order that keeps the numbers consistent:

1. **Wait for the controlling source to close.** A third-party ad server's month is final some days after month end; a run made earlier compares an estimate.
2. **Run the reconciliation on the versions that will bill,** and record each `delivery_daily` version the run read. A later restatement then shows up as a changed input, not as a silently different answer.
3. **Invoice from the controlling count,** or from the remedy the agency elected, with the reconciliation run on the invoice line's evidence.
4. **Carry everything after close as new lines.** Late beacons, invalid traffic credits and a dispute settled in the publisher's favor are adjustment, credit or debit lines on the next invoice, never edits to the issued one ([Closed Periods Stay Closed](/docs/money/accounting#closed-periods-stay-closed)).

The terms add their own clocks to the close. Invoices are sent after the first month's delivery or within 30 days of the IO's completion, and all invoices within 90 days of the delivery of all deliverables, because a later invoice "may cause Agency to be contractually unable to collect payment from the Advertiser." If the publisher's reporting is incomplete or inaccurate, it has five business days after notice to cure, and failure "may result in nonpayment for all activity for which data is incomplete or missing." Billing & Invoicing owns the invoice timing; reconciliation owns making sure the count is ready before those clocks run out.

## Resolving a Discrepancy

A discrepancy case is the workflow between a run that exceeds tolerance and the remedy. It has a small number of honest outcomes:

- **Restated.** One party finds an error (a missing day, a report filter, a tag fix), restates its rows, and a new run is within tolerance. The case closes with the restated version as its evidence.
- **Explained and accepted.** The cause is a known methodology difference within the pair's usual range; the agency accepts the controlling count. The invoice stands.
- **Make-good.** The agency elects remedy (i); a make-good line delivers the gap, measured by the controlling source.
- **Credit.** No make-good is agreed and the agency takes a credit for the shortfall against the booking, an `invoice_lines` row of kind `make_good_credit` (the terms' under-delivery credit), or, if it prepaid and is current, a refund.
- **Paid on the controlling count plus 10%.** The agency elects remedy (ii); the invoice line carries the adjusted quantity, or the original line plus a `discrepancy_adjustment` line for the difference.

A case records which cause the parties settled on, from the same list the comparison checks, so that the next month's baseline for that source pair can exclude what was fixed and keep what is structural. What a case should never do is change a delivery row by hand: every number it relies on is a run over recorded versions.

## How to Build It

The core model keeps one billable row per line item or deal, day and source, and names the controlling source on the insertion order. What it lacks is the comparison itself, its detail, and the dispute it starts. Three new tables, all appended to; log-level matches reuse `log_match_runs`, the make-good is a `make_goods` row, and invalid traffic money is `ivt_adjustments`:

```sql
CREATE TABLE reconciliation_runs (           -- one comparison of the controlling count against another source
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  insertion_order_id    UUID REFERENCES insertion_orders (id),
  deal_id               UUID REFERENCES deals (id),            -- a programmatic deal reconciled on its own
  line_item_id          UUID REFERENCES line_items (id),       -- narrower: one line item
  billing_period_id     UUID REFERENCES billing_periods (id),  -- the invoice period, from Billing & Invoicing
  period                DATERANGE NOT NULL,                    -- in the contract's days
  metric                TEXT NOT NULL CHECK (metric IN ('impressions', 'viewable_impressions',
                          'clicks', 'completed_views', 'cost_micros')),
  controlling_source    TEXT NOT NULL CHECK (controlling_source IN ('first_party',
                          'third_party_ad_server', 'measurement_vendor', 'exchange', 'buyer')),
  controlling_org_id    UUID REFERENCES organizations (id),
  compared_source       TEXT NOT NULL CHECK (compared_source IN ('first_party',
                          'third_party_ad_server', 'measurement_vendor', 'exchange', 'buyer')),
  compared_org_id       UUID REFERENCES organizations (id),
  controlling_quantity  BIGINT NOT NULL CHECK (controlling_quantity >= 0),
  compared_quantity     BIGINT NOT NULL CHECK (compared_quantity >= 0),
  denominator           TEXT NOT NULL DEFAULT 'compared' CHECK (denominator IN ('compared',
                          'controlling')),                     -- which count the gap is a share of
  discrepancy_bp        INT NOT NULL,        -- positive: controlling lower; rounded for display only
  tolerance_bp          INT NOT NULL CHECK (tolerance_bp >= 0),  -- copied from the IO or agreement at run time
  outcome               TEXT NOT NULL CHECK (outcome IN ('within_tolerance', 'controlling_higher',
                          'exceeds_tolerance', 'below_minimum_volume', 'incomplete')),
  log_match_run_id      UUID REFERENCES log_match_runs (id),   -- programmatic: the match the totals came from
  terms_ref             TEXT NOT NULL,       -- the IO terms version or agreement the rule came from
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(insertion_order_id, deal_id, line_item_id) >= 1),
  CHECK (controlling_source <> compared_source OR controlling_org_id IS DISTINCT FROM compared_org_id)
);

CREATE TABLE reconciliation_lines (          -- the run's detail per line item or deal and day
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  reconciliation_run_id UUID NOT NULL REFERENCES reconciliation_runs (id),
  line_item_id          UUID REFERENCES line_items (id),
  deal_id               UUID REFERENCES deals (id),
  day                   DATE NOT NULL,
  controlling_quantity  BIGINT NOT NULL DEFAULT 0,
  compared_quantity     BIGINT NOT NULL DEFAULT 0,
  controlling_version   INT,                 -- the delivery_daily version read; null: no row that day
  compared_version      INT,
  controlling_cost_micros BIGINT NOT NULL DEFAULT 0,
  compared_cost_micros  BIGINT NOT NULL DEFAULT 0,
  CHECK ((line_item_id IS NULL) <> (deal_id IS NULL)),
  UNIQUE NULLS NOT DISTINCT (reconciliation_run_id, line_item_id, deal_id, day)
);

CREATE TABLE discrepancy_cases (             -- the dispute a failed run starts, and how it ended
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  reconciliation_run_id UUID NOT NULL REFERENCES reconciliation_runs (id),
  opened_by_org_id      UUID NOT NULL REFERENCES organizations (id),
  opened_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status                TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved',
                          'withdrawn')),
  cause                 TEXT CHECK (cause IN ('counting_point', 'latency', 'ad_blocking',
                          'passback', 'third_party_targeting', 'ivt_filtering', 'time_zone',
                          'unfilled_included', 'tag_error', 'late_data', 'low_volume',
                          'unexplained')),
  resolution            TEXT CHECK (resolution IN ('restated', 'accepted_as_billed', 'make_good',
                          'credit', 'refund', 'paid_controlling_plus_adjustment')),
  restated_run_id       UUID REFERENCES reconciliation_runs (id),  -- the run on the restated versions
  adjusted_quantity     BIGINT CHECK (adjusted_quantity >= 0),   -- remedy (ii): what the invoice pays on
  make_good_id          UUID REFERENCES make_goods (id),
  invoice_line_id       UUID REFERENCES invoice_lines (id),      -- the credit or adjustment line
  agreed_by_ref         TEXT,               -- the buyer's written election, as the terms require
  resolved_at           TIMESTAMPTZ,
  CHECK ((status = 'resolved') = (resolution IS NOT NULL AND resolved_at IS NOT NULL)),
  CHECK (resolution IS DISTINCT FROM 'restated' OR restated_run_id IS NOT NULL),
  CHECK (resolution IS DISTINCT FROM 'make_good' OR make_good_id IS NOT NULL),
  CHECK (resolution NOT IN ('credit', 'refund', 'paid_controlling_plus_adjustment')
         OR resolution IS NULL OR invoice_line_id IS NOT NULL),
  CHECK (resolution IS DISTINCT FROM 'paid_controlling_plus_adjustment'
         OR adjusted_quantity IS NOT NULL)
);

CREATE INDEX reconciliation_runs_io_idx ON reconciliation_runs (insertion_order_id, period);
CREATE INDEX discrepancy_cases_open_idx ON discrepancy_cases (status) WHERE status IN ('open',
  'investigating');
```

Invoice lines priced on a run point back at it, so a buyer's auditor can go from the line to the comparison and from the comparison to the delivery versions. The alter is written for a live table ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE invoice_lines ADD COLUMN reconciliation_run_id UUID;
ALTER TABLE invoice_lines ADD CONSTRAINT invoice_lines_reconciliation_run_fk
  FOREIGN KEY (reconciliation_run_id) REFERENCES reconciliation_runs (id) NOT VALID;
CREATE INDEX CONCURRENTLY invoice_lines_reconciliation_run_idx
  ON invoice_lines (reconciliation_run_id) WHERE reconciliation_run_id IS NOT NULL;

-- after backfilling the runs behind invoices already issued
ALTER TABLE invoice_lines VALIDATE CONSTRAINT invoice_lines_reconciliation_run_fk;
```

A run's totals come from the two sources' rows for the IO's line items over the period, with the versions kept for the detail lines:

```sql
-- period totals of the controlling source and one compared source for one IO
SELECT io.id AS insertion_order_id,
       io.controlling_measurement,
       io.discrepancy_tolerance_bp,
       COALESCE(SUM(d.impressions) FILTER (WHERE d.source = io.controlling_measurement), 0)
         AS controlling_quantity,
       COALESCE(SUM(d.impressions) FILTER (WHERE d.source = $4), 0) AS compared_quantity,
       COUNT(DISTINCT d.day) FILTER (WHERE d.source = io.controlling_measurement)
         AS controlling_days
FROM insertion_orders io
JOIN campaigns c ON c.insertion_order_id = io.id
JOIN line_items li ON li.campaign_id = c.id
JOIN delivery_daily d ON d.line_item_id = li.id
WHERE io.id = $1 AND d.day >= $2 AND d.day < $3
GROUP BY io.id, io.controlling_measurement, io.discrepancy_tolerance_bp;
```

`controlling_days` against the days in the period is the completeness check: a run with missing controlling days is `incomplete`, not a discrepancy.

The classification and the remedy (ii) quantity are the application logic, kept exact by comparing cross-multiplied integers rather than a rounded percentage, so a gap of 10.004% is over 10% even though it rounds to 1,000 bp:

```go tab="Go"
type Outcome string

const (
	WithinTolerance    Outcome = "within_tolerance"
	ControllingHigher  Outcome = "controlling_higher"
	ExceedsTolerance   Outcome = "exceeds_tolerance"
	BelowMinimumVolume Outcome = "below_minimum_volume"
)

// Classify compares the controlling count with another source over the
// period. The gap is a share of the compared count (the contract's
// denominator); toleranceBP is the IO's, 1000 for the IAB/4A's 10% rule.
func Classify(controlling, compared, toleranceBP, minVolume int64) (Outcome, int64) {
	if compared < minVolume {
		return BelowMinimumVolume, 0
	}
	if controlling >= compared {
		return ControllingHigher, 0
	}
	gap := compared - controlling
	bp := (gap*10_000 + compared/2) / compared // for display only
	if gap*10_000 > toleranceBP*compared {     // exact: "exceeds"
		return ExceedsTolerance, bp
	}
	return WithinTolerance, bp
}

// AdjustedQuantity is remedy (ii): the controlling count plus an upward
// adjustment, capped at the booked quantity because billing above a
// guaranteed or capped level isn't allowed.
func AdjustedQuantity(controlling, adjustmentBP, booked int64) int64 {
	q := controlling + controlling*adjustmentBP/10_000
	return min(q, booked)
}

// Classify(1_720_000, 1_960_000, 1_000, 1_000) == (ExceedsTolerance, 1224)
// AdjustedQuantity(1_720_000, 1_000, 2_000_000) == 1_892_000
```

```rust tab="Rust"
#[derive(Debug, PartialEq, Eq)]
pub enum Outcome {
    WithinTolerance,
    ControllingHigher,
    ExceedsTolerance,
    BelowMinimumVolume,
}

/// Compares the controlling count with another source over the period. The
/// gap is a share of the compared count; `tolerance_bp` is the IO's, 1000
/// for the IAB/4A's 10% rule. Returns the outcome and the gap in bp.
pub fn classify(controlling: i64, compared: i64, tolerance_bp: i64, min_volume: i64) -> (Outcome, i64) {
    if compared < min_volume {
        return (Outcome::BelowMinimumVolume, 0);
    }
    if controlling >= compared {
        return (Outcome::ControllingHigher, 0);
    }
    let gap = (compared - controlling) as i128;
    let compared = compared as i128;
    let bp = ((gap * 10_000 + compared / 2) / compared) as i64; // display only
    if gap * 10_000 > tolerance_bp as i128 * compared {
        (Outcome::ExceedsTolerance, bp)
    } else {
        (Outcome::WithinTolerance, bp)
    }
}

/// Remedy (ii): the controlling count plus an upward adjustment, capped at
/// the booked quantity.
pub fn adjusted_quantity(controlling: i64, adjustment_bp: i64, booked: i64) -> i64 {
    let q = controlling + controlling * adjustment_bp / 10_000;
    q.min(booked)
}

// classify(1_720_000, 1_960_000, 1_000, 1_000) == (Outcome::ExceedsTolerance, 1224)
// adjusted_quantity(1_720_000, 1_000, 2_000_000) == 1_892_000
```

The invoice amount for the adjusted quantity is the core's arithmetic: 1,892,000 impressions × 12,000,000 micros CPM / 1,000 = 22,704,000,000 micros, $22,704.00, converted to minor units once on the line ([Rounding](/docs/money/amounts#rounding)).

Design notes:

- **A run is immutable and reproducible.** It records the two sources, the period, the metric, the tolerance and denominator in force and, in its lines, the `delivery_daily` version of every day it read. Rerunning after a restatement creates a new run; the case points at both.
- **The tolerance is copied, not looked up later.** `tolerance_bp` and `terms_ref` are what applied on the day of the run. An IO amended next month must not change why last month's invoice stood.
- **The controlling count can lose its status.** Under the terms, a controlling party that fails to give access to its statistics lets the other party invoice on its own. The run records which source it treated as controlling, and the IO's reporting access (owned by Insertion Orders & Standard Terms) is checked before it does.
- **Days are detail, the period decides.** The rule compares period totals; `reconciliation_lines` exist to find the cause (one bad day, a time zone edge, a trafficking change), not to trigger a remedy on their own.
- **Programmatic runs cite a log match.** A run at a DSP-exchange hop compares totals from a `log_match_runs` row and carries the match rate's run ID, because a gap over unmatched impressions is a different finding from a gap over matched ones.
- **Credits arrive as their own records.** An invalid traffic credit is an `ivt_adjustments` row turned into an `ivt_credit` invoice line, with its own date and evidence; it never edits a run or a delivery row. The run explains the invoice as billed; the credit explains what changed later.
- **Baselines are per source pair.** Keep the trailing gap between each pair of sources by format and device, computed from closed runs. A gap far outside that pair's range is the signal for a tag or trafficking error; a steady gap is methodology.

## Auditing

The records an agency's auditor, a publisher's finance team or a court asks for:

- **Which count billed, and why that one.** For every invoice line, the source it was priced on, the IO's controlling measurement and terms version, and the reconciliation run behind it, so the choice is evidence rather than habit.
- **Every comparison, as run.** Each run with its inputs (sources, versions, period, tolerance, denominator) and outcome, kept for the IO's dispute window and the audit rights in the agency agreement.
- **Every remedy and who elected it.** The case, the cause settled on, the remedy, the buyer's written election and the resulting make-good or invoice line.
- **Every credit after billing.** Invalid traffic credits with the finding, the claim date against the window, the evidence source and the average price used, on both the buyer's invoice and the seller's statement.
- **Access to the controlling count.** When reporting access was given, by whom, and whether it was ever withdrawn, since it decides whose count controls.

The mechanics are the playbook's [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Keep every party's count as its own row** per line item or deal, day and source, and never overwrite one with another.
- **Store the controlling source, tolerance and denominator on the contract,** and copy them onto every reconciliation run.
- **Compare period totals for the remedy and days for the cause,** after checking dates, time zones, line items and report definitions match.
- **Classify gaps with exact integer comparisons** and record the outcome, including "controlling higher" and "incomplete".
- **Cap the controlling-plus-10% remedy at the booked quantity** and record the buyer's election before invoicing on it.
- **Reconcile programmatic hops at log level** on the shared transaction ID, and report the match rate with every gap.
- **Treat invalid traffic credits as later records** with a claim window, an evidence source and a price basis, on both sides of the hop.
- **Close the period before reconciling it,** and carry everything after close as new invoice lines.

## References

**Specifications**

- [IAB/4A's: Standard Terms and Conditions for Internet Advertising for Media Buys One Year or Less, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), the controlling measurement rules, reporting access within one day, the 10% discrepancy rule and its two remedies, makegoods and credits, the bonus cap, invoice timing and the 90-day limit, reporting cure periods
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), the billing notice and exchange-specific billing policy, `source.tid`

**Filings**

- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), paying suppliers in advance of collections from clients

**In practice**

- [Campaign Manager 360: Click and impression counting discrepancies](https://support.google.com/campaignmanager/answer/2835377?hl=en), discrepancies up to 20% as normal and the causes to check
- [Display & Video 360: Reporting discrepancies](https://support.google.com/displayvideo/answer/2721749?hl=en), variances of up to 20%, comparisons over 1,000 impressions, counting at bid win against begin to render
- [Google Ad Manager: Investigate report discrepancies](https://support.google.com/admanager/answer/6160380?hl=en), within 2% for Campaign Manager 360 tags, up to 20% for third-party creatives, the pre-investigation checks, the causes, and no guaranteed resolution
- [Google Ads: Invalid traffic](https://support.google.com/google-ads/answer/2549113), removal before the billing cycle ends, invalid activity credits in the next cycle, frozen metrics and the 60-day investigation window
- [Microsoft Monetize: Understanding invalid traffic](https://learn.microsoft.com/en-us/xandr/monetize/understanding-invalid-traffic), the 10-day claim window, verification partner evidence, credits at the average CPM and seller remittance adjustments
