+++
title = "Advertiser Payments & Credit"
nav_title = "Payments & Credit"
description = "How advertisers pay: card billing thresholds, prepaid balances, monthly invoicing and credit lines, agency credit and sequential liability, and billing fraud."
category = "Advertising Industry"
order = 2966
part = "Contracts and Money"
tags = ["advertising", "billing", "credit", "self-serve", "agencies", "fraud", "data-model"]
+++

An ad platform delivers first and gets paid later, and the question this chapter answers is how much later, and how much it is willing to lose in between. Every impression or click accrues cost the moment it happens; the money arrives on one of three schedules. A self-serve advertiser's card is charged whenever accrued cost reaches a threshold or the billing date arrives. A prepaid advertiser funds a balance that delivery draws down and that stops the ads at zero. A larger advertiser or an agency is given a credit line and a monthly invoice, payable 30 days or more after the month it covers. The same platform usually runs all three, and the core model records which one applies as `ad_accounts.billing_mode` (`card_threshold`, `prepay` or `invoice`).

The engineering is hard because delivery is real time and payment is not. A campaign can spend thousands of dollars an hour, so a threshold that is checked once a day, a balance that is decremented from a report hours behind, or a credit limit that ignores the invoice already sent but not yet paid lets an account run far past what the platform meant to risk. The parties make it harder: an agency signs, an advertiser's money pays, and under the standard terms the agency owes the seller only what the advertiser has paid it, so credit is extended to one party on the strength of another. And the platform's own billing is a target: stolen cards, card testing and chargebacks turn advertising into a way to spend money that was never there.

This chapter covers the three payment modes and how platforms run each, billing thresholds and how they change, prepaid balances, monthly invoicing and credit lines, agency credit and sequential liability, and fraud against the platform's billing. It extends `ad_accounts` and `invoices` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). [Billing & Invoicing](/books/advertising/billing-and-invoicing) owns the invoice run, billing profiles and periods; [Self-Serve Ad Platforms](/books/advertising/self-serve-ad-platforms), in Walled Gardens, owns budgets, spending limits and advertiser verification; [Agencies & Media Buying](/books/advertising/agencies-and-media-buying#agent-and-principal) owns the agency's role as agent; and the Payments volume owns the money movement itself: the card authorization and capture ([Card Payments](/books/payments/card-payments)), card fraud ([Fraud & Risk](/books/payments/fraud-and-risk)) and disputes. The playbook's [Credits and Balances](/docs/money/usage-based-billing#credits-and-balances) has the generic rules for prepaid balances, and its usage billing chapter describes threshold invoicing as a risk tool in [Showing Customers Their Usage](/docs/money/usage-based-billing#showing-customers-their-usage).

## How the Platforms Do It

As of November 2026, from the platforms' help centers and filings:

| Platform | Card or automatic billing | Prepaid | Invoice and credit |
| --- | --- | --- | --- |
| **Amazon Ads** | Card or debit card kept as a backup payment method | Ad costs deducted from the seller's or vendor's account balance, the default for some advertisers from August 1, 2026 | Pay by Invoice: "an invoice at the end of each month, and payment is due 30 days later" |
| **Google Ads** | Postpay: charged when costs reach the payment threshold or on the first of the month; thresholds "automatically raised" as costs reach them; can be charged "multiple times a month" | Prepay, not offered in the countries the page lists; "When your payment is used up, your ads will stop running" | Monthly invoicing, a "line of credit"; eligibility criteria "include, but aren't limited to" a business registered for a year, an account in good standing for 6 months, and $5,000 a month (varies by country) in 3 of the last 12 months |
| **Meta** | Threshold billing with a monthly bill date, from its help center | Manual payments, deducted from funds the advertiser added | Monthly invoicing credit lines and credit limits |
| **Microsoft Advertising** | Postpay threshold: charged at the threshold or the monthly billing date, whichever comes first; a USD threshold starts at $50, rises with successful payments and falls after payment problems; requires verified advertiser identity | Prepay with cards, prepaid cards and, in some currencies, bank transfer | Monthly invoice, paid by bank transfer in the US payments table |
| **TikTok** | Automatic payment at the billing threshold or bill date, "whichever comes first"; weekly or monthly bill dates set by registration time and spend history | Manual payment | Credit line with monthly invoices; six months in good standing "including a positive payment history"; limit "determined on a case-by-case basis" |
| **The Trade Desk** (DSP) | Not applicable: clients are agencies and advertisers on contract | Not applicable | Receivables recorded "at the amount of gross billings"; two holding companies each over 10% of gross billings in 2025; suppliers typically paid "in advance of collections" |

Meta's help center pages are rendered by script and could not be opened for this chapter; the row comes from their titles and search summaries, and no figure from them is used. <!-- source-gap: adv-meta-billing-threshold | secondary | Meta's threshold billing, manual payments and monthly invoicing credit lines, and their amounts | closes with: an openable Meta Business Help Center or developer page stating the threshold and credit line rules | checked: 2026-11-22 -->

Three patterns hold across the gardens:

- **Thresholds start low and earn their way up.** Microsoft's starts at $50 in USD and rises after successful payments; Google's is raised automatically when costs reach it before month end. A threshold is a credit limit for card accounts, sized by payment history.
- **Credit lines are for proven accounts.** Google and TikTok both require months of good standing before monthly invoicing, and the platforms set the limit themselves (TikTok "on a case-by-case basis"). Self-serve advertisers start on cards or prepay.
- **The billing date is a backstop, not the trigger.** Every threshold scheme also charges on a calendar date, so a small account that never reaches its threshold still pays monthly.

## Three Ways to Pay

The three modes differ in who carries the money between delivery and payment:

| Mode | When the advertiser pays | What stops delivery | Platform's exposure |
| --- | --- | --- | --- |
| **Card threshold (postpay)** | Each time accrued cost reaches the threshold, and on the billing date | A declined charge, an account limit, a suspension | About one threshold plus what accrues while a charge is attempted |
| **Prepay** | Before delivery, by adding funds | The balance reaching zero | None on spend; a liability for unspent funds |
| **Invoice on credit** | Net terms after the monthly invoice | The credit limit, a past-due invoice, a suspension | Up to the credit limit, typically about two months of spend at net 30 |

The exposure on invoice terms is larger than it looks. An account spending $300,000 a month on net 30 invoicing accrues month one, is invoiced at the start of month two, and pays about 30 days later, near the end of month two; just before that payment the platform holds the unpaid month-one invoice plus almost all of month two's accrued cost, close to $600,000. A credit limit sized at one month's spend stops delivery every month before the payment arrives, which is why the limit check must count issued-but-unpaid invoices and unbilled accrued cost together.

Prepay moves the risk the other way: the platform holds the advertiser's money before it has earned it. A prepaid balance is a liability until delivery draws it down ([Advertising Revenue Accounting](/books/advertising/advertising-revenue-accounting) covers the contract liability), and it is money the advertiser can ask for back, so the balance is a ledger, not a counter ([Credits and Balances](/docs/money/usage-based-billing#credits-and-balances)).

## Billing Thresholds

A threshold account is charged whenever its accrued, unbilled cost reaches the threshold, and on its billing date for whatever accrued below it. Microsoft's help page gives the arithmetic as an example, and it is the cleanest public statement of the mechanism: an account opened on October 22 has a $50 threshold and a billing date on the 22nd. From October 22 to November 21 it spends $47.50, charged on November 22. Its campaign takes off and by December 7 it has $50 of charges, billed on December 8. It reaches the threshold "two more times, and we increase it to $100." Microsoft also skips the monthly charge "If you have made a successful payment within the past 10 days", so a busy account isn't charged twice in quick succession.

The rules that make a threshold safe:

- **The threshold is a ladder with a history.** It starts low, rises after a number of successful charges, and falls after a failed one (Microsoft says it "automatically decreases your billing threshold if you run into problems paying your charges"). Each step is a record with its reason and effective time, because a charge's amount and a dispute about it are judged against the threshold in force at that moment.
- **The advertiser can cap a charge below the threshold.** Microsoft lets an advertiser "set a limit on the amount Microsoft Advertising can charge your payment method", for a card with a low limit; it then charges at the lower of the two. Google lets advertisers opt out of automatic increases. The effective trigger is the minimum of the platform's threshold and the advertiser's cap.
- **Charges overshoot slightly.** Cost accrues between the moment the threshold is crossed and the moment the charge is created; Microsoft says charges "can exceed the billing threshold or your limit by a small amount," and Google that the charged amount may slightly exceed the threshold. The charge is for the accrued amount at the time of the charge, not exactly the threshold.
- **Taxes ride on top.** Microsoft's threshold "only reflects advertising costs" and taxes are charged on top, so the card sees more than the threshold. Tax is its own invoice line.
- **A charge may be preceded by an authorization.** Microsoft "may initiate an authorization hold on your card for the estimated amount", released in "usually, it's 7 days" or when the final payment arrives. That is the Payments volume's authorization and capture split ([Card Payments](/books/payments/card-payments)); the ad platform records that a charge was attempted and points at the payment, it doesn't rebuild it.

A threshold charge is a payment attempt with its own outcome. A declined card leaves the accrued cost unpaid; TikTok notes that an advertiser on automatic payment "may need to make manual payments in some situations, such as when your payment method fails." The platform's choices are to retry, pause delivery, lower the threshold, or suspend, and Google's billing policy lists suspension for "unpaid balances" or "concerns about your ability to make future payments." My rule is that a failed threshold charge pauses delivery on the account immediately, because the cost already accrued is the threshold the platform agreed to risk and every further impression is beyond it.

## Prepaid Balances

A prepaid account funds a balance, delivery draws it down, and the ads stop when it is used up; Google emails when the balance is low (about a week of budget) and again when it is gone. Amazon Ads' variant draws ad costs from money the platform already holds for the advertiser: from August 1, 2026, a group of advertisers it contacted default to "deduction from available seller or vendor account balance", with the card kept "as a backup payment method." For a retail media network that also pays its sellers, netting ad costs against sales proceeds is the lowest-risk collection there is.

Prepay changes the hard part from collection to accuracy:

- **The draw-down follows delivery, not reports.** A balance that is reduced from a daily report lets an account overspend by a day's delivery; the bidder or ad server needs a spend counter close to real time, and the ledger is reconciled to `delivery_daily` afterward. Pacing a budget against a fast counter is [Pacing & Frequency Capping](/books/advertising/pacing-and-frequency)'s; this chapter's concern is that the stop at zero is enforced from the same kind of counter.
- **Overspend is a small receivable.** Even a fast counter lags; the last few impressions before the stop can take the balance below zero. The negative amount is owed by the advertiser, collected from the next top-up or the card on file, and written off if neither arrives.
- **Credits and refunds are entries.** Invalid traffic credits ([Reconciliation & Discrepancies](/books/advertising/reconciliation-and-discrepancies)), promotional credits and refunds of unspent funds each add an entry with its source; promotional credits are drawn first and expire, paid funds don't.
- **Unspent funds belong to the advertiser.** A closed account's remaining paid balance is refunded or, if unclaimed, eventually owed to a state under unclaimed property law, as [Payout Failures](/books/payments/payouts-and-settlement#payout-failures) describes for unclaimed balances.

## Monthly Invoicing and Credit Lines

Monthly invoicing is a credit line: the platform delivers for a month, invoices, and waits for payment on net terms. Google describes it as "a line of credit for your advertising costs"; TikTok calls the product a credit line; Microsoft's monthly invoice is paid by bank transfer; Amazon's Pay by Invoice sends "an invoice at the end of each month, and payment is due 30 days later."

What a credit line record has to say:

- **Who is the borrower.** A monthly invoice line is extended to the payer, which is often an agency paying for many advertisers' accounts; Google's monthly invoicing for agencies runs through manager accounts ([Agencies & Media Buying](/books/advertising/agencies-and-media-buying#how-to-build-it) cites the help page). The line belongs to the payer's billing profile, and the ad accounts it covers draw on it.
- **The limit and the terms.** A credit limit in the line's currency, net payment days, and the invoice period. TikTok sets the limit "on a case-by-case basis"; Google's published eligibility (a business registered for a year, an account in good standing for six months, $5,000 a month in three of the last twelve months, varying by country) is a floor: the requirements "include, but aren't limited to" those criteria.
- **The basis for granting it.** Payment history on threshold billing, a credit check, financial statements, a parent company or holding company guarantee, or a deposit. The decision, its approver and its evidence are records, because a line granted on a guarantor's strength must be reviewed when the guarantor's credit changes.
- **A review date.** Credit is re-decided periodically and on events: a late payment, a jump in spend, a change of agency, a news event about the borrower.

Spend against a credit line is gated the same way as a threshold, on exposure: unbilled accrued cost plus issued, unpaid invoices. A past-due invoice stops new delivery regardless of headroom, and an account whose exposure reaches the limit pauses or is asked to prepay until a payment lands.

## Agency Credit and Sequential Liability

When an agency buys, the platform extends credit to one party for another's money. The IAB/4A's standard terms put it in two sentences: the seller agrees "to hold Agency liable for payments solely to the extent proceeds have cleared from Advertiser to Agency", and "For sums not cleared to Agency," the seller agrees "to hold Advertiser solely liable." The same section says "Agency's credit is established on a client-by-client basis", that an advertiser's non-payment doesn't bar the agency's other clients "if such other advertisers' credit is not in question", and that if the advertiser's or agency's "credit is or becomes impaired, Media Company may require payment in advance." Payment is due 30 days from the agency's receipt of the invoice; after notice that payment hasn't arrived, the seller may seek payment directly from the advertiser five business days later.

The filings show what that means at scale:

- **The DSP carries it.** The Trade Desk's 10-K says many agency contracts include sequential liability: "if the advertiser does not pay the agency, the agency is not liable to us", while it pays suppliers on shorter cycles than it collects and so must "remit payments from our own funds, and accept the risk of credit loss." Its receivables are "recorded at the amount of gross billings to clients, net of allowances": $3,770 million at December 31, 2025, net of a $12.2 million allowance for credit losses (about 0.32% of receivables), against $2,896 million of revenue for the year and $3,008 million of accounts payable. Receivables larger than a year's revenue are what net revenue reporting on gross billings looks like.
- **The exchange carries it too.** Magnite invoices and collects "the full purchase price" from buyers, says that "in some cases, we may be required or elect to pay sellers for impressions delivered before we have collected", and notes that some buyers, such as DSPs, may not be required to pay if they cannot collect from the advertiser.
- **The agency names where it ends.** Omnicom's 10-K says many of its agencies' contracts with media providers state the agencies are "not liable to the media and production providers under the theory of sequential liability" until and to the extent the client has paid, and that where agencies buy as principal or sequential liability doesn't apply, the risk from a client's payment default "could increase significantly."
- **Concentration is in holding companies.** The Trade Desk reports that "two holding companies would have each represented more than 10% of our gross billings in 2025." Credit decided client by client still rolls up to a handful of agency groups whose payment practices move the whole receivable.

For the system, three consequences. **Credit belongs to the advertiser as well as the agency.** A credit line for an agency's billing profile carries per-advertiser exposure, because under sequential liability the collectible party for an unpaid client is the advertiser, not the agency. **The cleared date is a fact to record.** The agency's liability starts when the advertiser's money clears to it; a payable or receivable that can't say whether that happened can't say who owes it. [Agencies & Media Buying](/books/advertising/agencies-and-media-buying#how-to-build-it)'s design notes make the same point from the agency's side. **Impaired credit switches the mode.** The terms allow requiring prepayment when credit is impaired; the account's billing mode changes to `prepay` with a dated reason, and delivery continues only against funds.

## Fraud on the Platform's Own Billing

An ad platform is a merchant whose product can be bought with a stolen card and consumed in minutes, so it attracts the fraud every card merchant does, plus some of its own. Google's suspicious payment policy names the patterns: "Using stolen credit card numbers to pay for Google Ads", "Using someone else's identity to apply for monthly invoicing terms", and signs like "suddenly using several new credit cards, having payments declined or chargebacks." Its billing policy adds chargebacks that "reverse a charge that was paid against a legitimate Google Ads balance" and promotional code abuse, and it suspends linked accounts: those using "the same email or payment method", and new accounts the advertiser creates.

The schemes and the controls:

| Scheme | How it works | Control |
| --- | --- | --- |
| **Stolen card on a new account** | Open an account, run ads (often for a scam, so the ad itself is harmful) until the threshold charge fails or the cardholder disputes | A low first threshold; payment verification; advertiser verification before threshold billing (Microsoft requires it); [Ad Review, Policies & Malvertising](/books/advertising/ad-review-and-malvertising) for the ads themselves |
| **Card testing** | Small authorizations to check stolen card numbers, using the platform's add-card or prepay flow | Rate limits and risk scoring on card adds and small charges ([Card Testing](/books/payments/fraud-and-risk#card-testing)) |
| **Run up and walk away** | Accrue to the threshold, let the charge fail, open another account | Pause on a failed charge; link accounts by payment method, identity and device; suspend the network |
| **Friendly chargeback** | Pay, consume the delivery, then dispute the card charge | Delivery evidence per charge (what accrued, when, for which campaigns); suspension on a chargeback against a valid balance |
| **Credit line fraud** | Apply for monthly invoicing in another company's name | Business verification against the applicant's identity, a credit check, and a contact at the real company before the line opens |
| **Promotional abuse** | Stack or resell new-advertiser credits | One promotion per verified advertiser; promotional credits drawn first and never refundable |

Two principles keep the losses bounded. **Exposure is decided before delivery.** The threshold, the prepaid balance and the credit limit are the platform's loss limits, and they work only if the bidder or ad server reads them at serve time, not after a nightly job. **The payment decision and the account decision are one record.** A declined charge, a chargeback or a fraud score on a card is a reason to pause or suspend the ad account; the decision record names the payment event that caused it, so an appeal (Google asks for "details about who owns the payment method listed on your account") can be judged against it. The generic decision record is the playbook's [The Decision Record](/docs/building-blocks/risk-scoring#the-decision-record).

What can't be collected ends as a write-off: the unpaid balance after retries, offsets and collections, written off as bad debt with a reason, never deleted from the account's history ([Write-Offs](/docs/money/accounting#write-offs)). A negative prepaid balance follows the same path as a merchant's in the Payments volume ([Negative Balances](/books/payments/payouts-and-settlement#negative-balances)).

## How to Build It

The core model gives every ad account a `billing_mode` and a `billing_ref` naming the payer in the Payments volume's model. What it lacks is the threshold history, each automatic charge, the credit line and the prepaid ledger. Four tables:

```sql
CREATE TABLE billing_thresholds (           -- the threshold ladder of a card account, effective-dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id       UUID NOT NULL REFERENCES ad_accounts (id),
  threshold_minor     BIGINT NOT NULL CHECK (threshold_minor > 0),
  advertiser_cap_minor BIGINT CHECK (advertiser_cap_minor > 0),  -- the advertiser's "limit each charge"
  currency            CHAR(3) NOT NULL,
  reason              TEXT NOT NULL CHECK (reason IN ('initial', 'automatic_increase',
                        'advertiser_request', 'risk_decrease', 'payment_failure', 'cap_change')),
  successful_charges  INT NOT NULL DEFAULT 0,  -- the count that earned this step, for the ladder rule
  valid_during        TSTZRANGE NOT NULL,
  set_by              TEXT NOT NULL,           -- 'system', or the user who changed the cap
  EXCLUDE USING gist (ad_account_id WITH =, valid_during WITH &&)
);

CREATE TABLE threshold_charges (            -- each automatic charge attempt on a card account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id       UUID NOT NULL REFERENCES ad_accounts (id),
  billing_threshold_id UUID REFERENCES billing_thresholds (id),  -- the step in force when triggered
  trigger             TEXT NOT NULL CHECK (trigger IN ('threshold', 'billing_date', 'manual',
                        'account_close', 'retry')),
  accrued_from        TIMESTAMPTZ NOT NULL,  -- the cost this charge covers
  accrued_until       TIMESTAMPTZ NOT NULL,
  accrued_micros      BIGINT NOT NULL CHECK (accrued_micros >= 0),
  amount_minor        BIGINT NOT NULL CHECK (amount_minor >= 0),  -- excluding tax
  tax_minor           BIGINT NOT NULL DEFAULT 0,
  currency            CHAR(3) NOT NULL,
  attempt             SMALLINT NOT NULL DEFAULT 1,
  idempotency_key     TEXT NOT NULL,         -- account + accrual window + attempt
  payment_ref         TEXT,                  -- the charge in the Payments volume's model
  invoice_id          UUID REFERENCES invoices (id),  -- the receipt or invoice issued for it
  status              TEXT NOT NULL CHECK (status IN ('pending', 'authorized', 'succeeded',
                        'declined', 'failed', 'disputed', 'refunded')),
  decline_code        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at          TIMESTAMPTZ,
  UNIQUE (ad_account_id, idempotency_key),
  CHECK (accrued_until > accrued_from)
);

CREATE TABLE credit_lines (                 -- monthly invoicing on credit, for a payer
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  borrower_org_id     UUID NOT NULL REFERENCES organizations (id),   -- the agency or advertiser that pays
  advertiser_id       UUID REFERENCES advertisers (id),              -- set: credit for one client, as the terms establish it
  billing_profile_id  UUID REFERENCES billing_profiles (id),         -- where the invoices go (Billing & Invoicing)
  guarantor_org_id    UUID REFERENCES organizations (id),            -- a parent or holding company guarantee
  credit_limit_minor  BIGINT NOT NULL CHECK (credit_limit_minor >= 0),
  currency            CHAR(3) NOT NULL,
  payment_terms_days  SMALLINT NOT NULL CHECK (payment_terms_days > 0),  -- e.g. 30 from invoice receipt
  liability           TEXT NOT NULL CHECK (liability IN ('sequential', 'agency', 'advertiser',
                        'joint')),
  basis               TEXT NOT NULL CHECK (basis IN ('payment_history', 'credit_check',
                        'financial_statements', 'guarantee', 'deposit')),
  decision_ref        TEXT NOT NULL,         -- the credit decision and its evidence
  approved_by         TEXT NOT NULL,
  approved_at         TIMESTAMPTZ NOT NULL,
  review_on           DATE NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('active', 'on_hold', 'suspended', 'closed')),
  valid_during        DATERANGE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE account_balance_entries (      -- prepaid funds and their draw-down, append-only
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  ad_account_id       UUID NOT NULL REFERENCES ad_accounts (id),
  kind                TEXT NOT NULL CHECK (kind IN ('funds_added', 'spend', 'promotional_credit',
                        'ivt_credit', 'refund', 'expiry', 'adjustment', 'reversal')),
  amount_micros       BIGINT NOT NULL,       -- signed: funding positive, spend negative
  currency            CHAR(3) NOT NULL,
  funding             TEXT NOT NULL CHECK (funding IN ('paid', 'promotional')),
  occurred_at         TIMESTAMPTZ NOT NULL,
  delivery_day        DATE,                  -- spend: the delivery_daily day it reconciles to
  payment_ref         TEXT,                  -- funds_added and refund: the Payments record
  invoice_line_id     UUID REFERENCES invoice_lines (id),  -- a credit that came from an invoice line
  reverses_entry_id   UUID REFERENCES account_balance_entries (id),
  idempotency_key     TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ad_account_id, idempotency_key),
  CHECK (kind <> 'spend' OR (amount_micros < 0 AND delivery_day IS NOT NULL)),
  CHECK (kind NOT IN ('funds_added', 'promotional_credit', 'ivt_credit') OR amount_micros > 0),
  CHECK ((funding = 'promotional') = (kind = 'promotional_credit')
         OR kind IN ('spend', 'expiry', 'reversal', 'adjustment'))
);

CREATE INDEX threshold_charges_account_idx ON threshold_charges (ad_account_id, created_at DESC);
CREATE INDEX account_balance_entries_account_idx ON account_balance_entries (ad_account_id, occurred_at);
CREATE INDEX credit_lines_borrower_idx ON credit_lines (borrower_org_id, status);
```

Ad accounts on invoice terms draw on a credit line, and the account's mode change is dated so a past invoice can be explained by the mode it was issued under. The alters are written for a live table ([Lock-Aware DDL](/docs/database/zero-downtime-migrations#lock-aware-ddl)):

```sql
ALTER TABLE ad_accounts
  ADD COLUMN credit_line_id UUID,
  ADD COLUMN billing_mode_since TIMESTAMPTZ,
  ADD COLUMN billing_mode_reason TEXT;
ALTER TABLE ad_accounts ADD CONSTRAINT ad_accounts_credit_line_fk
  FOREIGN KEY (credit_line_id) REFERENCES credit_lines (id) NOT VALID;
ALTER TABLE ad_accounts ADD CONSTRAINT ad_accounts_invoice_needs_credit_line
  CHECK (billing_mode <> 'invoice' OR credit_line_id IS NOT NULL) NOT VALID;
CREATE INDEX CONCURRENTLY ad_accounts_credit_line_idx
  ON ad_accounts (credit_line_id) WHERE credit_line_id IS NOT NULL;

-- after attaching existing invoice accounts to their credit lines
ALTER TABLE ad_accounts VALIDATE CONSTRAINT ad_accounts_credit_line_fk;
ALTER TABLE ad_accounts VALIDATE CONSTRAINT ad_accounts_invoice_needs_credit_line;
```

Exposure on a credit line is unbilled accrued cost on its accounts plus issued invoices not yet paid, in minor units; a past-due invoice is reported separately because it stops delivery on its own:

```sql
-- exposure and headroom on one credit line, now
SELECT cl.id AS credit_line_id,
       cl.credit_limit_minor,
       COALESCE(inv.open_minor, 0) AS open_invoices_minor,
       COALESCE(inv.past_due_minor, 0) AS past_due_minor,
       COALESCE(acc.unbilled_micros, 0) / 10000 AS unbilled_minor,  -- two-decimal currency
       cl.credit_limit_minor - COALESCE(inv.open_minor, 0)
         - COALESCE(acc.unbilled_micros, 0) / 10000 AS headroom_minor
FROM credit_lines cl
LEFT JOIN LATERAL (
  SELECT SUM(i.total_minor) AS open_minor,
         SUM(i.total_minor) FILTER (WHERE i.due_on < CURRENT_DATE) AS past_due_minor
  FROM invoices i
  JOIN ad_accounts a ON a.id = i.ad_account_id
  WHERE a.credit_line_id = cl.id AND i.direction = 'receivable'
    AND i.status IN ('issued', 'disputed')
) inv ON TRUE
LEFT JOIN LATERAL (
  SELECT SUM(d.cost_micros) AS unbilled_micros
  FROM delivery_daily d
  JOIN line_items li ON li.id = d.line_item_id
  JOIN campaigns c ON c.id = li.campaign_id
  JOIN ad_accounts a ON a.id = c.ad_account_id
  WHERE a.credit_line_id = cl.id AND d.source = 'first_party'
    AND d.day >= date_trunc('month', CURRENT_DATE)::date
) acc ON TRUE
WHERE cl.id = $1;
```

The query reads the month's first-party rows as unbilled, which is right once the previous month is invoiced; between month end and the invoice run, the closed month is also unbilled, and a real gate reads unbilled cost from the billing period's state ([Billing & Invoicing](/books/advertising/billing-and-invoicing)) rather than the calendar. The divisor assumes a two-decimal currency; a real system reads the exponent from the currency table ([Exponents Come From a Table](/docs/money/amounts#exponents-come-from-a-table)).

The serve-time gate is the application logic: given the account's mode and its current numbers, deliver, charge or pause. It runs on the fast spend counter, and its decisions are what pacing reads:

```go tab="Go"
type Mode string

const (
	CardThreshold Mode = "card_threshold"
	Prepay        Mode = "prepay"
	Invoice       Mode = "invoice"
)

type Account struct {
	Mode               Mode
	AccruedMicros      int64 // unbilled cost since the last charge or invoice
	ThresholdMinor     int64 // card: the step in force
	AdvertiserCapMinor int64 // card: 0 when the advertiser set no cap
	BalanceMicros      int64 // prepay: from the balance ledger and the live counter
	OpenInvoicesMinor  int64 // invoice: issued and unpaid
	PastDue            bool
	CreditLimitMinor   int64
}

type Decision struct {
	Action      string // "serve", "charge", "pause"
	ChargeMinor int64
	Reason      string
}

const microsPerMinor = 10_000 // a two-decimal currency; read the exponent from a table

// Gate decides what an account may do next.
func Gate(a Account) Decision {
	switch a.Mode {
	case Prepay:
		if a.BalanceMicros <= 0 {
			return Decision{Action: "pause", Reason: "funds_exhausted"}
		}
	case CardThreshold:
		trigger := a.ThresholdMinor
		if a.AdvertiserCapMinor > 0 && a.AdvertiserCapMinor < trigger {
			trigger = a.AdvertiserCapMinor
		}
		if a.AccruedMicros >= trigger*microsPerMinor {
			// charge what accrued, in whole minor units; the remainder stays accrued
			return Decision{Action: "charge", ChargeMinor: a.AccruedMicros / microsPerMinor,
				Reason: "threshold"}
		}
	case Invoice:
		if a.PastDue {
			return Decision{Action: "pause", Reason: "past_due"}
		}
		if a.OpenInvoicesMinor+a.AccruedMicros/microsPerMinor >= a.CreditLimitMinor {
			return Decision{Action: "pause", Reason: "credit_limit"}
		}
	}
	return Decision{Action: "serve"}
}

// Gate(Account{Mode: CardThreshold, AccruedMicros: 50_012_000, ThresholdMinor: 5_000})
//   == Decision{Action: "charge", ChargeMinor: 5_001, Reason: "threshold"}
```

```rust tab="Rust"
pub enum Mode {
    CardThreshold { threshold_minor: i64, advertiser_cap_minor: Option<i64> },
    Prepay { balance_micros: i64 },
    Invoice { open_invoices_minor: i64, past_due: bool, credit_limit_minor: i64 },
}

#[derive(Debug, PartialEq, Eq)]
pub enum Decision {
    Serve,
    Charge { amount_minor: i64 },
    Pause { reason: &'static str },
}

const MICROS_PER_MINOR: i64 = 10_000; // a two-decimal currency; read the exponent from a table

/// Decides what an account may do next, from its mode and unbilled accrued cost.
pub fn gate(mode: &Mode, accrued_micros: i64) -> Decision {
    match *mode {
        Mode::Prepay { balance_micros } if balance_micros <= 0 => {
            Decision::Pause { reason: "funds_exhausted" }
        }
        Mode::CardThreshold { threshold_minor, advertiser_cap_minor } => {
            let trigger = advertiser_cap_minor.map_or(threshold_minor, |c| c.min(threshold_minor));
            if accrued_micros >= trigger * MICROS_PER_MINOR {
                // charge what accrued, in whole minor units; the remainder stays accrued
                Decision::Charge { amount_minor: accrued_micros / MICROS_PER_MINOR }
            } else {
                Decision::Serve
            }
        }
        Mode::Invoice { past_due: true, .. } => Decision::Pause { reason: "past_due" },
        Mode::Invoice { open_invoices_minor, credit_limit_minor, .. }
            if open_invoices_minor + accrued_micros / MICROS_PER_MINOR >= credit_limit_minor =>
        {
            Decision::Pause { reason: "credit_limit" }
        }
        _ => Decision::Serve,
    }
}

// gate(&Mode::CardThreshold { threshold_minor: 5_000, advertiser_cap_minor: None }, 50_012_000)
//   == Decision::Charge { amount_minor: 5_001 }
```

In the example, a $50.00 threshold is crossed with $50.012 accrued: the charge is $50.01 and the remaining 2,000 micros stay accrued for the next one, so nothing is lost or rounded twice.

Design notes:

- **The threshold is effective-dated.** `billing_thresholds` keeps every step with its reason and the count of successful charges that earned it, one step in force at a time (the exclusion constraint), the pattern in [Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows). A charge points at the step that triggered it.
- **A charge is idempotent and points at Payments.** The idempotency key is the account, the accrual window and the attempt, so a retried job can't charge twice ([Idempotency](/docs/requests/idempotency)); `payment_ref` is the Payments volume's charge, which owns authorization, capture, decline codes and disputes. A decline or dispute there updates the status here through an event.
- **Accrued cost stays in micros until the charge.** The charge converts to minor units once, carrying the remainder, as the core model's rounding rule requires. The receipt or invoice for each charge is an `invoices` row, so card accounts have documents like invoice accounts do.
- **The prepaid ledger is in micros, too.** Spend draws down at delivery precision, and funding converts exactly from minor units; the balance is a sum of entries, never a stored number, and each spend entry names the delivery day it reconciles to ([Append-Only Records](/docs/money/payment-states#append-only-records)).
- **Credit is extended to a payer, tracked per advertiser.** A credit line can be for an agency's billing profile or narrowed to one advertiser, as the standard terms establish credit client by client; exposure is computed per advertiser under it, because sequential liability makes the advertiser the collectible party.
- **Mode changes are events.** Moving an account from `card_threshold` to `invoice`, or to `prepay` when credit is impaired, records when and why; the core's `billing_mode` holds the current value and `billing_mode_since` and `billing_mode_reason` the change.
- **The gate reads live numbers.** The serve-time decision uses the spend counter the pacer uses, not the daily roll-up; the roll-up reconciles the ledger and the charges afterward, and a difference between them is a finding.

## Auditing

- **Every charge and what it covered.** Each threshold charge with its trigger, accrual window, accrued amount, the threshold step in force, the payment it became and its outcome, so a disputed card charge can be answered with the delivery it paid for.
- **Every threshold change and why.** The ladder of an account, with each step's reason (automatic increase, advertiser request, risk decrease, payment failure) and who or what set it.
- **Every credit decision.** Each credit line's limit, terms, liability rule, basis and evidence, approver and review date, and every change of status.
- **Every prepaid balance, entry by entry.** Funding, spend by day, credits, refunds and expiries, reconcilable to `delivery_daily` and to the Payments volume's records.
- **Every pause and suspension tied to money.** The payment event, credit limit or past-due invoice that caused it, and the decision record behind it.

The mechanics are the playbook's [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Record the payment mode on the account and date its changes,** and treat card threshold, prepay and invoice as three different risk positions.
- **Keep thresholds as an effective-dated ladder** that rises with successful charges, falls on failures, and respects the advertiser's own cap.
- **Charge exactly what accrued, idempotently,** convert to minor units once, and point at the Payments volume for the charge itself.
- **Pause on a failed charge** rather than serving past the threshold the platform agreed to risk.
- **Run prepaid balances as a ledger** drawn down from the live spend counter, with promotional and paid funds kept apart.
- **Gate invoice accounts on exposure,** unbilled cost plus unpaid invoices, and stop on past due regardless of headroom.
- **Extend agency credit with the advertiser in view,** record when the advertiser's money clears, and switch impaired credit to prepay.
- **Treat billing fraud as account risk:** verify before threshold billing, link accounts by payment method and identity, and keep every pause tied to the payment event that caused it.

## References

**Specifications**

- [IAB/4A's: Standard Terms and Conditions for Internet Advertising for Media Buys One Year or Less, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), sequential liability, credit established client by client, payment in advance when credit is impaired, payment 30 days from invoice and direct collection from the advertiser after notice

**Filings**

- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), sequential liability in agency contracts, paying suppliers before collection, receivables at gross billings, the allowance for credit losses, receivables and payables at December 31, 2025, and holding company concentration
- [The Trade Desk: Fourth quarter 2025 results (Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000009/ttd-20260225x8kexx991.htm), 2025 revenue
- [Magnite: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000007/mgni-20251231.htm), collecting the full purchase price from buyers, paying sellers before collection in some cases, and buyers not required to pay if they can't collect
- [Omnicom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/29989/000002998926000006/omc-20251231.htm), sequential liability in agency contracts with media providers and higher default risk on principal buys

**In practice**

- [Amazon Ads: Update on advertiser payments (April 14, 2026)](https://advertising.amazon.com/en-us/library/news/update-on-advertiser-payments), deduction from seller or vendor account balances from August 1, 2026, Pay by Invoice terms, and the card as a backup
- [Google Ads: About the postpay payment setting](https://support.google.com/google-ads/answer/6311?hl=en), charges at the payment threshold or on the first of the month, automatic increases, multiple charges a month and opting out
- [Google Ads: About payment settings](https://support.google.com/google-ads/answer/2375432?hl=en), postpay, prepay and monthly invoicing, the eligibility criteria for monthly invoicing, and ads stopping when prepaid funds run out
- [Google Ads: Billing and payment suspensions](https://support.google.com/adspolicy/answer/13704200?hl=en), unpaid balances, suspicious payment activity, chargebacks, promotional code abuse and linked accounts
- [Google Ads: Suspicious payment activity](https://support.google.com/adspolicy/answer/15983318), stolen cards, false monthly invoicing applications, the warning signs, spending limits and the appeal
- [Microsoft Advertising: What is billing threshold and how does it work?](https://learn.microsoft.com/en-us/advertising/msa-help/hlp_ba_conc_billingthreshold), the $50 starting threshold, increases and decreases, the worked example, the 10-day rule, advertiser limits, overshoot, taxes, authorization holds and advertiser identity verification
- [Microsoft Advertising: United States payments table](https://learn.microsoft.com/en-us/advertising/msa-help/payment-methods/united-states), payment methods by postpay threshold, prepay and monthly invoice
- [TikTok Ads: Automatic payment](https://ads.tiktok.com/help/article/automatic-payment?lang=en), billing at the threshold or bill date, weekly and monthly bill dates, manual payment when a payment method fails
- [TikTok Ads: Learn about credit line](https://ads.tiktok.com/help/article/about-monthly-invoicing?lang=en), eligibility after six months in good standing and the case-by-case limit
