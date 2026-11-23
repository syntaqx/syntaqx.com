+++
title = "Publisher Payouts & Revenue Share"
nav_title = "Publisher Payouts"
description = "Paying publishers: statements, estimated against finalized earnings, thresholds, holds, invalid activity deductions, net terms, tax forms and network chains."
category = "Advertising Industry"
order = 2967
part = "Contracts and Money"
tags = ["advertising", "publishers", "payouts", "revenue-share", "ad-networks", "data-model"]
+++

A publisher payout is the last money movement in the life of an impression: the network, exchange or managed partner that sold a publisher's inventory pays the publisher its share of what buyers paid, on a schedule, net of what was invalid, held back or owed. AdSense pays sites monthly once a balance reaches $100; an SSP pays a news publisher on net 60 or net 90 terms from the end of the month; a managed network pays its member sites on its own terms out of what Google and the SSPs paid it. The publisher sees a statement, and behind it are three numbers per month that rarely agree: what was estimated in daily reporting, what was finalized at the month close, and what was finally paid after deductions that can arrive months later.

The engineering is hard because the payer is in the middle of a chain it doesn't control. It owes the publisher a share of revenue it may not have collected yet; it finds invalid traffic after it has already paid for it; a publisher's balance can be held for missing tax forms, an unverified address or a policy review, or roll over because it is below the threshold; and the publisher may itself be paid through another intermediary that adds its own terms and deductions. Every one of those is a separate, dated record or the statement can't be explained, the payout can't be reconciled to the ad server, and a deduction can't be traced to the traffic that caused it.

This chapter covers the publisher statement and its three numbers, payment thresholds and rollover, payment holds, invalid activity deductions and clawbacks, net terms and paying before collecting, chains of intermediaries, and the tax forms a payout needs. It extends `invoices` (publisher statements are rows with `direction = 'payable'`) and `seller_accounts` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and reuses `network_revenue_shares` and `delivery_daily.publisher_net_micros` from [Publishers & Yield](/books/advertising/publishers-and-yield#how-to-build-it), whose [Payment, Thresholds and Deductions](/books/advertising/publishers-and-yield#payment-thresholds-and-deductions) has AdSense's monthly timeline and deduction rules from the publisher's side; this chapter is the payer's side. The Payments volume owns the money movement: payout schedules, holds and reserves ([Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)), negative balances and clawbacks, payout failures and the payee's reconciliation ([Reconciliation](/books/payments/payouts-and-settlement#reconciliation)). Tax form mechanics belong to Workforce and User-Generated Platforms, linked below. [Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud) owns the findings behind deductions.

## How the Platforms Do It

As of November 2026, the published payout terms of networks, SSPs and managed partners:

| Payer | Schedule | Threshold | Deductions and holds |
| --- | --- | --- | --- |
| **Google AdMob** | Monthly: earnings finalized on the 3rd, paid "on or around the 21st" | The balance on the 20th must reach the payment threshold; below it, earnings roll over | Invalid activity deductions taken during finalization may not appear as line items |
| **Google AdSense** | Monthly: finalized on the 3rd, balance checked on the 20th, paid between the 21st and the 26th | $100 (€70, £60, ¥8,000); payment method selection at $10; address verification by PIN at $10; tax information and identity verification at $0 | Holds for missing tax information, unverified address or identity, no form of payment, compliance or policy review, or a self-hold; deductions for invalid traffic and advertiser non-payment |
| **Ezoic** (managed network) | Net 30 by default (January paid at the end of February); net 60 with a 1.5% bonus; net 90 with a 2.25% bonus | $20 of finalized earnings, adjustable upward | Tax and payment changes by the 15th for that month's cycle |
| **Magnite** (SSP) | Collects the full price from buyers; "in some cases" pays sellers before it has collected | Not published | Not published |
| **Mediavine** (managed network) | "Net65 Terms"; payment date "the 5th of each month", issued on the first business day | Not on the page opened | Not on the page opened |
| **Microsoft Monetize** (SSP) | A fixed period such as net 60 or net 90 "from the last day of the month", disbursed on the last day of each month | $50 for the month; below it, held until $50 accumulates | Invalid traffic adjustments quoted on the seller remittance statement; payment withheld if the seller has unpaid invoices for buying |
| **PubMatic** (SSP) | Agreements with each publisher and buyer set payment terms "(typically ninety days or less)"; buyers invoiced at the end of each month | Not published | Not published |
| **Raptive** (managed network) | Guarantees payment to creators "whether we ultimately get paid or not" | Not on the page opened | Not on the page opened |

Raptive's help center returned an error to automated requests, so I could not confirm its net terms to creators or the terms its own partners pay it on, and no term from it is used here. <!-- source-gap: adv-raptive-payment-terms | missing | Raptive's net payment terms to creators and its partners' terms to Raptive | closes with: an openable Raptive help center or terms page stating both | checked: 2026-11-22 -->

Three patterns:

- **Monthly cycles, paid weeks to months later.** Google's networks pay in the month after the earnings month; SSPs and managed networks pay on net terms counted from month end, from about 30 days to 90.
- **A threshold, then rollover.** Below the threshold nothing is paid and the balance carries forward: AdSense at $100, Microsoft Monetize at $50, Ezoic at $20.
- **Deductions arrive after the money is earned.** Invalid activity comes out at finalization and later; an SSP's invalid traffic adjustments appear on the remittance statement when the revenue is paid. Earnings are provisional until the deduction window passes.

## The Statement

A publisher statement is the payer's invoice in reverse: a document listing what the payer owes for a period, in the core model an `invoices` row with `direction = 'payable'` and lines that tie to placements, deals and delivery rows. What makes it hard is that its amount changes after the period, three times:

1. **Estimated.** Daily reporting shows the publisher's share of what buyers paid, computed from `delivery_daily.publisher_net_micros` under the revenue share in force ([Publishers & Yield](/books/advertising/publishers-and-yield#how-to-build-it) has the arithmetic). It is a forecast of the statement, not a promise.
2. **Finalized.** At the month close the payer removes invalid activity it has found, applies late data and finalizes the month; AdSense and AdMob both finalize on the 3rd of the next month and both say invalid activity deductions taken at finalization may not appear as separate line items. The finalized amount is what the statement carries.
3. **Paid.** The payout pays the balance (finalized earnings plus carried balance, less holds, withholding and later deductions) on the schedule, if it is over the threshold.

Each step is its own record. A system that overwrites estimated earnings with finalized ones can't answer the publisher's first question ("why is it lower than my dashboard said?"), and one that edits a paid month for a later deduction can't reconcile the payout to the deposit. My rule is an append-only earnings ledger: estimates are posted and superseded, finalization is posted as the month's earnings with the difference visible, and every deduction, clawback, withholding and payout is a later entry with its own date and cause. The statement is a document drawn from the ledger for a period, and the payout lists the ledger entries it includes, which is what the Payments volume's payee reconciliation needs ([Reconciliation](/books/payments/payouts-and-settlement#reconciliation)).

## Thresholds and Rollover

A payment threshold keeps the cost of sending money proportionate to the money. AdSense's thresholds show that "threshold" is several rules:

| Threshold | AdSense (USD) | What happens |
| --- | --- | --- |
| Tax information | $0 | Tax information may be required before earning |
| Identity verification | $0 | Identity verified before the account can show ads and be paid |
| Address verification (PIN) | $10 | The payment address is verified by a PIN sent by mail |
| Payment method selection | $10 | A form of payment can be chosen only once the balance reaches it |
| Payment | $100 | Paid when outstanding earnings reach it and there are no holds |
| Cancellation | $10 | A closed account above it receives a final payment about 90 days after the end of the month |

Thresholds are per currency, set as round amounts in each currency rather than converted from $100 (AdSense's €70 and £60), so the threshold belongs to the publisher's payment settings in the payout currency. The rules a payout run applies:

- **The balance is checked on a cutoff date, not continuously.** AdSense and AdMob test the balance on the 20th; Ezoic takes changes to tax or payment details by the 15th. A change after the cutoff applies to the next cycle.
- **Below threshold rolls over.** The balance carries into the next month, combined with new earnings; AdMob's wording is that earnings "will be rolled over and combined with your next month's earnings." Rollover is not a hold and needs no reason; it is the absence of a payout.
- **Publishers can raise their own.** Ezoic's $20 default can be raised to any amount; a publisher that prefers fewer, larger payments sets it. The payer's minimum is a floor under the publisher's choice.
- **Closing pays out the remainder.** An account closed above the cancellation threshold gets a final payment; below it, the remainder is a balance the payer still owes, which becomes unclaimed property if the payee can't be reached ([Payout Failures](/books/payments/payouts-and-settlement#payout-failures)).

## Payment Holds

A hold stops a payout that the threshold would otherwise release. AdSense lists the common ones, and each releases on a different event:

| Hold | Released by |
| --- | --- |
| Tax information missing | The required tax information submitted |
| Address not verified | The PIN mailed to the payment address entered |
| Identity not verified | Identity verification completed |
| No form of payment | A payment method set up, once the balance reaches the selection threshold |
| Compliance hold | The information requested to confirm identity provided in the payments center |
| Policy review | The investigation ends with the account compliant and the traffic valid; the hold is removed automatically |
| Self-hold | The publisher removes the hold it placed |

Three more come from the money itself rather than the account. **A negative balance** after a deduction larger than the month's earnings holds payouts until new earnings cover it. **An offset** against what the publisher owes the payer for buying: Microsoft Advertising, paying Monetize sellers, "reserves the right to withhold payment if you have outstanding unpaid invoices for buying activity." **An invalid activity review** on a specific property or traffic source, where the hold should cover what the review covers, not the whole balance.

The design rules are the Payments volume's: every hold is an explicit record with a reason, who set it, the amount or scope it covers and what releases it, never a smaller "available" number ([Payout Schedules, Holds and Reserves](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves)); and holds that come from a trust and safety or fraud case point at the case, so closing one reviews the other, as User-Generated Platforms describes for creators ([Risk Holds, Negative Balances and Clawbacks](/books/user-generated-platforms/paying-creators-and-sellers#risk-holds-negative-balances-and-clawbacks)).

## Invalid Activity Deductions and Clawbacks

The payer finds invalid traffic after it has credited the publisher, and sometimes after it has paid. Two public rules show the range. AdSense deducts invalid activity from earnings in most cases within 60 to 90 days of the traffic, reimburses the advertisers who paid for it, treats deductions as final and not subject to appeal, and also takes back earnings when an advertiser didn't pay ([Payment, Thresholds and Deductions](/books/advertising/publishers-and-yield#payment-thresholds-and-deductions) has the quotes). Microsoft Monetize refunds a buyer what it paid for the claimed invalid impressions, reduces the seller's revenue "based on the average media cost for the month" with "an adjustment on the relevant sellers account", quoted on the seller remittance statement "when the associated revenue payment is released to them based on the contractual payment terms"; because buyer claims arrive after the seller statements are generated, the calculation uses "the original revenue amount, pre-adjustment."

What that means for the ledger:

- **A deduction is an entry, dated when it is taken, citing the period it corrects.** The publisher's March earnings stay as finalized; a deduction posted in June references March (or "the past 60 to 90 days") and the finding behind it. A payer that pays on net 60 can often take it before the money leaves; one that pays monthly will take it from a later month.
- **Both sides of one finding reconcile.** The buyer's credit (an `ivt_credit` line on the buyer's invoice) and the publisher's deduction come from one `ivt_adjustments` record in [Invalid Traffic & Ad Fraud](/books/advertising/invalid-traffic-and-ad-fraud); the deduction is the publisher's share of the credited amount, computed with the revenue share in force on the original day, not today's.
- **Advertiser non-payment is a different cause.** A clawback because the buyer never paid is not invalid traffic and should be labeled as such; it exists only where the payer's terms pass collection risk to the publisher, and a payer that guarantees payment (Raptive's stated policy) never posts it.
- **A deduction larger than the balance makes it negative.** Recovery follows the published order (next earnings first, then other methods), the same as a merchant's in [Negative Balances](/books/payments/payouts-and-settlement#negative-balances); pulling money back from a bank account is a [Clawback](/books/payments/payouts-and-settlement#clawbacks) with its own failure modes.

Detail is often limited by design. AdSense warns that "you may not view line items for invalid activity deductions taken during the finalization process," and networks generally don't disclose where invalid activity was detected, because detail teaches fraudsters what was caught. The publisher's statement carries the deduction's amount, date and the period it applies to; the evidence stays with the payer's finding.

## Net Terms and Paying Before Collecting

Net terms are the payer's working capital decision. An SSP invoices buyers monthly, collects on their terms, and pays publishers on its own; PubMatic's agreements with each publisher and buyer set payment terms "(typically ninety days or less)", and it notes that "the timing of cash receipts from buyers and payments to publishers can significantly impact our cash flows." Microsoft Advertising pays Monetize sellers "within a fixed period of time (e.g. Net 60, Net 90) from the last day of the month in which the reselling activity occurs." Magnite says that "in some cases, we may be required or elect to pay sellers for impressions delivered before we have collected", which uses working capital to fund its payables until buyers pay.

Two things follow for the system. **The due date is computed from the earnings period, not from the statement.** Net 60 from the last day of March is May 30; a payout run that counts from the statement's issue date pays late. The terms record names the basis (days after the month end, or a fixed day of a later month) and the run computes each period's due date from it. **Whether payment depends on collection is a term.** A payer that pays only from collected funds ("pay when paid") holds the publisher's money until each buyer pays and needs a per-buyer collection status on every earnings entry; one that pays regardless carries the credit risk itself, as Raptive's guarantee and Magnite's disclosure describe. I found no public standard term setting which applies between SSPs and publishers; each agreement does. <!-- source-gap: adv-ssp-pay-when-paid | missing | the prevalence of pay-when-paid terms in SSP and network agreements with publishers | closes with: a published industry survey or standard terms document for SSP publisher agreements | checked: 2026-11-22 -->

Ezoic prices the trade openly. Net 30 is its default; a publisher that chooses net 60 receives a 1.5% bonus and net 90 a 2.25% bonus, so January earnings of $10,000 are paid as $10,150 at the end of March or $10,225 at the end of April. Waiting one extra month for 1.5% is about an 18% simple annual rate (1.5% × 365 / 30, derived), which tells both sides what the float is worth. In the ledger the bonus is its own entry, not a change to the month's earnings, so the revenue share arithmetic stays checkable.

## Chains of Intermediaries

Many publishers are paid through more than one hop: a buyer's DSP pays an SSP, the SSP pays a managed network or a reseller, and the network pays the site. Each hop has its own share, its own terms, its own threshold and its own deductions, and [Networks and Revenue Share](/books/advertising/publishers-and-yield#networks-and-revenue-share) shows that a share is meaningful only with its basis. For payouts, a chain adds three problems:

- **Upstream terms bound downstream ones.** A network paid by its SSPs on net 60 and paying publishers on net 30 pays a month before it collects; one paid on net 90 and paying on net 65 has 25 days of float. The network's payment settings have to be checked against its own receivables, per upstream partner.
- **Deductions cascade.** An SSP's invalid traffic adjustment on the network's remittance statement becomes the network's deduction from the sites whose traffic it was, at the share that site was paid. That needs the network's earnings ledger to carry the upstream source of every entry, so a deduction from one SSP for one month can be allocated to the properties that earned it.
- **The publisher can't see the whole chain.** The site sees the network's statement; the SSP's terms, deductions and collection status are behind it. The ads.txt and sellers.json records ([Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality#supply-path-optimization)) say who was authorized to sell, not who paid whom; the earnings ledger is where the money path is recorded.

For the data model the rule is that **every earnings entry names its upstream source**: the partner organization and seller account the revenue came through, and the revenue share that applied. A network's statement to a site is then a sum over entries whose sources are known, and a deduction from upstream lands on exactly the entries it corrects.

## Tax Forms

A payer must know who it is paying before it pays. AdSense asks for US tax information "in order for Google to comply with its obligations under the United States" tax rules: a Form W-9 from US persons and generally a Form W-8BEN or W-8BEN-E from non-US individuals and entities who are the beneficial owners of the income, used to "identify the correct rate of withholding on applicable payments made to you." Google refreshes non-US forms "every 3 years" or when circumstances change. Missing tax information is a payment hold (above).

The mechanics belong elsewhere and are linked rather than repeated: the W-9, TIN matching and backup withholding for US payees in Workforce's [The W-9](/books/workforce/contractors-and-1099s#the-w-9) and [Backup Withholding](/books/workforce/contractors-and-1099s#backup-withholding); the forms a payer files at year end in [Forms 1099-NEC and 1099-MISC](/books/workforce/contractors-and-1099s#forms-1099-nec-and-1099-misc) and, for platforms paying worldwide, the tax interview, withholding on US-source earnings and Form 1042-S in User-Generated Platforms' [Tax Interviews and Withholding](/books/user-generated-platforms/paying-creators-and-sellers#tax-interviews-and-withholding) and [Information Returns](/books/user-generated-platforms/paying-creators-and-sellers#information-returns-1099-k-1099-misc-and-1042-s); and the payer's own collection of W-9s in Payments' [Tax: W-9s, TIN Matching and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s). Two advertising-specific consequences: **withholding depends on where the earnings came from,** so for a non-US publisher each earnings entry carries the source country of the revenue that withholding applies to, decided when it accrues; and **withholding is a ledger entry,** moved to a liability and reported, so the statement shows gross earnings, withholding and the net paid.

## How to Build It

The core model has the statement (`invoices` with `direction = 'payable'`, lines of kind `revenue_share` and `ivt_credit`) and the delivery rows with the publisher's net; [Publishers & Yield](/books/advertising/publishers-and-yield#networks-and-revenue-share) adds the revenue share terms. What a payer still needs is the publisher's payment settings, the earnings ledger the statements and payouts are drawn from, and the holds. Three tables:

```sql
CREATE TABLE publisher_payment_settings (   -- how and when one payer pays one publisher
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id      UUID NOT NULL REFERENCES organizations (id),
  payer_org_id          UUID NOT NULL REFERENCES organizations (id),  -- the network, SSP or managed partner
  seller_account_id     UUID REFERENCES seller_accounts (id),         -- null: every account of this publisher
  scope_seller_account_id UUID GENERATED ALWAYS AS (COALESCE(seller_account_id,
                          '00000000-0000-0000-0000-000000000000'::UUID)) STORED,
  currency              CHAR(3) NOT NULL,     -- the payout currency; thresholds are in it
  payment_threshold_minor BIGINT NOT NULL CHECK (payment_threshold_minor >= 0),
  publisher_threshold_minor BIGINT,           -- the publisher's own higher threshold
  schedule              TEXT NOT NULL CHECK (schedule IN ('net_days_after_month_end',
                          'day_of_following_month')),
  terms_days            SMALLINT CHECK (terms_days > 0),          -- e.g. 30, 60, 90
  pay_day_of_month      SMALLINT CHECK (pay_day_of_month BETWEEN 1 AND 28),
  months_after          SMALLINT NOT NULL DEFAULT 1,              -- day_of_following_month: 1 = the next month
  change_cutoff_day     SMALLINT CHECK (change_cutoff_day BETWEEN 1 AND 28),  -- e.g. 15 or 20
  pay_when_paid         BOOLEAN NOT NULL,     -- payout waits for the buyer's payment
  early_payment_bonus_bp INT NOT NULL DEFAULT 0,  -- a bonus for longer terms, e.g. 150 at net 60
  payout_method_ref     TEXT,                 -- the payee and method in the Payments volume's model
  tax_profile_ref       TEXT,                 -- the tax interview result, owned by the tax model
  valid_during          DATERANGE NOT NULL,
  terms_ref             TEXT NOT NULL,        -- the agreement or published terms version
  CHECK ((schedule = 'net_days_after_month_end') = (terms_days IS NOT NULL)),
  CHECK ((schedule = 'day_of_following_month') = (pay_day_of_month IS NOT NULL)),
  CHECK (publisher_threshold_minor IS NULL OR publisher_threshold_minor >= payment_threshold_minor),
  EXCLUDE USING gist (publisher_org_id WITH =, payer_org_id WITH =,
    scope_seller_account_id WITH =, valid_during WITH &&)
);

CREATE TABLE publisher_earnings_entries (   -- the append-only ledger statements and payouts come from
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id      UUID NOT NULL REFERENCES organizations (id),
  payer_org_id          UUID NOT NULL REFERENCES organizations (id),
  seller_account_id     UUID REFERENCES seller_accounts (id),
  property_id           UUID REFERENCES properties (id),
  upstream_org_id       UUID REFERENCES organizations (id),  -- the SSP, exchange or buyer the revenue came through
  kind                  TEXT NOT NULL CHECK (kind IN ('estimated', 'finalized', 'ivt_deduction',
                          'nonpayment_clawback', 'adjustment', 'bonus', 'tax_withholding',
                          'payout', 'payout_reversal')),
  earnings_month        DATE NOT NULL,      -- first day of the month the entry belongs to
  amount_micros         BIGINT NOT NULL,    -- signed: earnings positive, deductions and payouts negative
  currency              CHAR(3) NOT NULL,
  revenue_share_id      UUID REFERENCES network_revenue_shares (id),  -- the share that produced it
  ivt_adjustment_id     UUID REFERENCES ivt_adjustments (id),         -- ivt_deduction: the finding's money record
  source_country        CHAR(2),            -- where the revenue came from, for withholding
  statement_invoice_id  UUID REFERENCES invoices (id),  -- the payable statement that carries it
  payout_ref            TEXT,               -- payout and payout_reversal: the Payments record
  supersedes_entry_id   UUID REFERENCES publisher_earnings_entries (id),  -- a newer estimate or the finalization
  posted_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key       TEXT NOT NULL,
  UNIQUE (payer_org_id, idempotency_key),
  CHECK (earnings_month = date_trunc('month', earnings_month)::date),
  CHECK (kind <> 'ivt_deduction' OR (amount_micros <= 0 AND ivt_adjustment_id IS NOT NULL)),
  CHECK (kind NOT IN ('payout', 'payout_reversal') OR payout_ref IS NOT NULL)
);

CREATE TABLE payout_holds (                 -- why a payout that would be released isn't
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id      UUID NOT NULL REFERENCES organizations (id),
  payer_org_id          UUID NOT NULL REFERENCES organizations (id),
  reason                TEXT NOT NULL CHECK (reason IN ('tax_info_missing', 'address_unverified',
                          'identity_unverified', 'payment_method_missing', 'compliance',
                          'policy_review', 'ivt_review', 'negative_balance', 'buying_offset',
                          'self_hold')),
  scope_property_id     UUID REFERENCES properties (id),  -- null: the whole balance
  amount_micros         BIGINT CHECK (amount_micros > 0),  -- null: everything in scope
  ivt_finding_id        UUID REFERENCES ivt_findings (id), -- ivt_review: the finding under review
  case_ref              TEXT,               -- the policy or compliance case
  placed_by             TEXT NOT NULL,      -- 'system', a reviewer, or the publisher for a self-hold
  placed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at           TIMESTAMPTZ,
  release_reason        TEXT,
  CHECK (reason <> 'ivt_review' OR ivt_finding_id IS NOT NULL),
  CHECK ((released_at IS NULL) = (release_reason IS NULL))
);

CREATE INDEX publisher_earnings_entries_balance_idx
  ON publisher_earnings_entries (payer_org_id, publisher_org_id, earnings_month);
CREATE INDEX publisher_earnings_entries_upstream_idx
  ON publisher_earnings_entries (upstream_org_id, earnings_month) WHERE upstream_org_id IS NOT NULL;
CREATE INDEX payout_holds_active_idx
  ON payout_holds (payer_org_id, publisher_org_id) WHERE released_at IS NULL;
```

Statements point at the period's earnings, and statement lines at their source delivery rows through [Billing & Invoicing](/books/advertising/billing-and-invoicing)'s `invoice_line_sources`. The publisher's payable balance on a cutoff date excludes estimates (superseded by finalization), and the holds are listed beside it:

```sql
-- payable balance and active holds for one publisher at one payer, as of a cutoff
SELECT e.publisher_org_id,
       e.currency,
       SUM(e.amount_micros) AS balance_micros,
       SUM(e.amount_micros) FILTER (WHERE e.kind = 'finalized') AS finalized_micros,
       SUM(e.amount_micros) FILTER (WHERE e.kind IN ('ivt_deduction', 'nonpayment_clawback'))
         AS deductions_micros,
       (SELECT array_agg(h.reason ORDER BY h.placed_at)
          FROM payout_holds h
         WHERE h.payer_org_id = e.payer_org_id AND h.publisher_org_id = e.publisher_org_id
           AND h.released_at IS NULL AND h.scope_property_id IS NULL) AS account_holds
FROM publisher_earnings_entries e
WHERE e.payer_org_id = $1 AND e.publisher_org_id = $2
  AND e.kind <> 'estimated'
  AND e.posted_at < $3
GROUP BY e.payer_org_id, e.publisher_org_id, e.currency;
```

The payout decision on the cutoff is the application logic: a balance over the higher of the payer's and the publisher's thresholds, with no account-level hold, is paid on the period's due date; anything else rolls over or waits, with the reason recorded:

```go tab="Go"
type PayoutDecision struct {
	Pay         bool
	AmountMinor int64
	DueOn       time.Time
	Reason      string // "paid", "below_threshold", "hold:<reason>", "negative_balance"
}

const microsPerMinor = 10_000 // a two-decimal currency; read the exponent from a table

// DecidePayout runs on the cutoff for one publisher, one payer and one
// earnings month. Net terms count from the last day of the earnings month.
func DecidePayout(balanceMicros, thresholdMinor, publisherThresholdMinor int64,
	holds []string, earningsMonth time.Time, termsDays int) PayoutDecision {
	if len(holds) > 0 {
		return PayoutDecision{Reason: "hold:" + holds[0]}
	}
	if balanceMicros < 0 {
		return PayoutDecision{Reason: "negative_balance"}
	}
	threshold := max(thresholdMinor, publisherThresholdMinor)
	amount := balanceMicros / microsPerMinor // whole minor units; the remainder stays
	if amount < threshold {
		return PayoutDecision{Reason: "below_threshold"}
	}
	monthEnd := earningsMonth.AddDate(0, 1, -1)
	return PayoutDecision{Pay: true, AmountMinor: amount,
		DueOn: monthEnd.AddDate(0, 0, termsDays), Reason: "paid"}
}

// March 2027 earnings of $1,198.20 on net 60 from month end:
// DecidePayout(1_198_200_000, 5_000, 0, nil, time.Date(2027, 3, 1, 0, 0, 0, 0, time.UTC), 60)
//   == PayoutDecision{Pay: true, AmountMinor: 119_820, DueOn: 2027-05-30, Reason: "paid"}
```

```rust tab="Rust"
use chrono::{Days, Months, NaiveDate};

#[derive(Debug, PartialEq, Eq)]
pub enum PayoutDecision {
    Pay { amount_minor: i64, due_on: NaiveDate },
    BelowThreshold,
    Held(&'static str),
    NegativeBalance,
}

const MICROS_PER_MINOR: i64 = 10_000; // a two-decimal currency; read the exponent from a table

/// Runs on the cutoff for one publisher, one payer and one earnings month
/// (its first day). Net terms count from the last day of the month.
pub fn decide_payout(
    balance_micros: i64,
    threshold_minor: i64,
    publisher_threshold_minor: Option<i64>,
    holds: &[&'static str],
    earnings_month: NaiveDate,
    terms_days: u64,
) -> PayoutDecision {
    if let Some(&reason) = holds.first() {
        return PayoutDecision::Held(reason);
    }
    if balance_micros < 0 {
        return PayoutDecision::NegativeBalance;
    }
    let threshold = publisher_threshold_minor.map_or(threshold_minor, |p| p.max(threshold_minor));
    let amount_minor = balance_micros / MICROS_PER_MINOR; // whole minor units; the remainder stays
    if amount_minor < threshold {
        return PayoutDecision::BelowThreshold;
    }
    let month_end = earnings_month + Months::new(1) - Days::new(1);
    PayoutDecision::Pay { amount_minor, due_on: month_end + Days::new(terms_days) }
}

// decide_payout(1_198_200_000, 5_000, None, &[], NaiveDate::from_ymd_opt(2027, 3, 1).unwrap(), 60)
//   == PayoutDecision::Pay { amount_minor: 119_820, due_on: 2027-05-30 }
```

March has 31 days, so net 60 from March 31 is May 30. The payout itself is created in the Payments volume with an idempotency key of payer, publisher and earnings month, and posted back here as a `payout` entry for the amount in micros, so the balance goes to the sub-cent remainder, not to zero by assumption.

Design notes:

- **The ledger is in micros; payouts are in minor units.** Earnings accrue at delivery precision from `publisher_net_micros`; a payout converts once to minor units and leaves any remainder in the balance for the next cycle ([Rounding](/docs/money/amounts#rounding)).
- **Estimates are superseded, not edited.** Each daily estimate is an entry that a newer estimate or the month's finalization supersedes; balances exclude estimates, and the difference between the last estimate and the finalized amount is reported, not hidden.
- **Deductions cite their period and finding.** An `ivt_deduction` is posted when taken, with the earnings month it corrects and the `ivt_adjustments` record it came from, so the buyer's credit and the publisher's deduction trace to one finding.
- **Holds have scope.** A hold on one property's traffic under review holds only what that property earned; an account hold (tax, identity, address, compliance) holds everything. The decision lists every active hold, not only the first, in the payout run's log.
- **Terms are effective-dated and counted from the period.** `publisher_payment_settings` keeps the schedule, cutoff, thresholds and whether payment waits for collection per publisher and payer over time, the pattern in [Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows); the due date is computed from the earnings month the payout covers.
- **Upstream source on every entry.** `upstream_org_id` records the SSP, exchange or buyer each earning came through, which is what lets a network allocate an upstream deduction to the properties that earned it and, under pay-when-paid terms, release each entry when its buyer pays.
- **Tax and payment details are references.** The payee, payout method and tax profile live in the Payments and tax models; this model holds references and the holds their absence causes.

## Auditing

- **Every statement and the entries behind it.** Each payable statement with the earnings, deductions, bonuses, withholding and payouts it shows, recomputable from the ledger and, for earnings, from delivery rows and the revenue share in force.
- **Estimated, finalized and paid, per month.** The three numbers for every publisher and month, and the entries that explain each difference.
- **Every deduction with its cause.** Invalid activity deductions with the finding and period they correct, and non-payment clawbacks with the buyer invoice that went unpaid.
- **Every hold with its reason and release.** Who placed it, what it covered, what released it and when, and the case behind it.
- **Every payout and its terms.** The settings in force, the threshold and cutoff applied, the due date computed, and the Payments record of the transfer and any return.

The mechanics are the playbook's [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Run publisher earnings as an append-only ledger** and draw statements and payouts from it, never from a stored balance.
- **Keep estimated, finalized and paid as separate records** and show the publisher every difference.
- **Store thresholds per currency and cutoffs per cycle,** let publishers raise their own threshold, and roll over what falls below.
- **Make every hold an explicit record with a scope and a release condition,** tied to the case or missing information that caused it.
- **Post deductions as new entries that cite the period and finding they correct,** with the share from the original day.
- **Compute due dates from the earnings period under effective-dated terms,** and record whether payment waits for collection.
- **Name the upstream source on every earning** so deductions and collections in a chain of intermediaries land on the right entries.
- **Point at the Payments volume for the payout and at the tax models for forms and withholding,** and keep withholding as its own ledger entry.

## References

**Filings**

- [Magnite: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000007/mgni-20251231.htm), collecting the full purchase price from buyers and paying sellers before collection in some cases
- [PubMatic: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1422930/000142293026000010/pubm-20251231.htm), buyer invoicing at month end, payment terms of ninety days or less in its publisher and buyer agreements, and the cash flow effect of their timing

**In practice**

- [Google AdSense: Payment thresholds](https://support.google.com/adsense/answer/1709871?hl=en), the tax, identity, address, payment method selection, payment and cancellation thresholds by currency
- [Google AdSense: Payment timelines](https://support.google.com/adsense/answer/7164703?hl=en), finalization on the 3rd, the 20th balance check, payment between the 21st and 26th, rollover and deductions not shown as line items
- [Google AdSense: Common payment hold issues](https://support.google.com/adsense/answer/1714364?hl=en), the hold reasons and what releases each
- [Google AdSense: Deductions from earnings FAQs](https://support.google.com/adsense/answer/2808531?hl=en), deductions for traffic within the past 60 to 90 days, advertiser reimbursement, no appeal and deductions for advertiser non-payment
- [Google AdSense: FAQs about submitting US tax info](https://support.google.com/adsense/answer/10735961?hl=en), why tax information is collected, W-9 and W-8 forms, and refreshing non-US forms every three years
- [Google AdMob: Payments and transactions](https://support.google.com/admob/answer/2772140?hl=en), the monthly cycle, payment around the 21st, the threshold on the 20th, rollover and finalization deductions
- [Ezoic: Net 30/60/90 payment terms](https://support.ezoic.com/kb/article/net-306090-payment-terms?lang=en-US), the default net 30, the net 60 and net 90 bonuses with examples, the $20 minimum and the 15th deadline
- [Mediavine: Payment FAQ](https://help.mediavine.com/mediavine-payment-faq), Net65 terms and the payment date
- [Microsoft Monetize: Getting paid](https://learn.microsoft.com/en-us/xandr/finance/getting-paid-by-xandr), net terms from the last day of the month, the $50 minimum, month-end disbursement and withholding against unpaid buying invoices
- [Microsoft Monetize: Understanding invalid traffic](https://learn.microsoft.com/en-us/xandr/monetize/understanding-invalid-traffic), seller adjustments on the remittance statement and calculation on the pre-adjustment revenue
- [Raptive: We guarantee creator payments (April 29, 2020)](https://raptive.com/blog/adthrive-guarantees-publisher-payments/), payment to creators whether or not Raptive is paid
