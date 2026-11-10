+++
title = "Insurance System Architecture"
nav_title = "System Architecture"
description = "The policy, billing and claims split, effective dating and bitemporal records, the rating service, documents, the insurance ledger and its feeds, and events."
category = "Insurance Industry"
order = 2771
part = "Running the Platform"
tags = ["insurance", "architecture", "ledger", "events", "bitemporal", "integration"]
+++

An insurer's core is three systems that run on three different clocks. Policy administration lives in effective time: what was covered, from when, as a sequence of transactions that can arrive out of order. Billing lives in cash time: what was invoiced, what was paid, what is past due. Claims lives in loss time: what happened, when it was reported, what has been reserved and paid. Around them sit the rating service that prices every transaction, the document engine that renders every contract and notice, the ledger that turns all of it into accounting, and the feeds that carry it out to the general ledger, the statutory statement, reinsurers, agents, regulators and statistical agents. Every vendor suite in [Core Platforms](/books/insurance/core-platforms) is shaped this way, and so is every carrier's in-house system that works.

This chapter is the map: why the split exists and where its seams are, how effective dating and recorded time run through all of it, what the rating service and the document engine must guarantee, how the insurance ledger is structured and posted (with a policy worked from transaction to general ledger), and how events and integration carry changes out. The chapters before it own each piece in depth; this one says how they fit together. The generic patterns (the transactional outbox, idempotent consumers, temporal data, accounting syncs) are in the playbook and linked, not repeated.

## How the Platforms Do It

As of November 2026, from 10-Ks and vendor documentation:

| Vendor | How the core is split | Public detail |
| --- | --- | --- |
| **Duck Creek** | Policy, Rating, Billing, Claims and Underwriting as products; an Integration Hub with "insurance-ready APIs and prebuilt connections" | Its last 10-K (fiscal 2022) listed Policy, Billing, Claims, Rating, Insights and Distribution Management, bought and deployed "via Duck Creek OnDemand, our SaaS solution" |
| **Guidewire** | InsuranceSuite is "primarily comprised of five core applications": PolicyCenter, ClaimCenter, BillingCenter, PricingCenter and UnderwritingCenter | Guidewire Cloud Platform is "a Guidewire-developed infrastructure layer enabled by and hosted on Amazon Web Services" (10-K for fiscal 2026) |
| **Sapiens** | CoreSuite for P&C (policy, billing, claims) in North America; PolicyPro, BillingPro and ClaimsPro as separate products | 20-F for 2024 |
| **Socotra** | "A policy administration and billing service"; claims outside the core | Charges on each transaction "are sent to the billing system, which slices them across installments"; a double-entry, append-only financial ledger; an event stream and signed webhooks |

The agreement across vendors: **policy, billing and claims are separate applications** with their own data and their own lifecycles, joined by interfaces, never one database with three screens. Rating is either a separate service (Guidewire's PricingCenter, Duck Creek's Rating) or a plugin called by policy administration (Socotra's rating plugin), but always a function the policy system calls, not logic spread through it. Accounting is either an internal double-entry ledger (Socotra) or a feed to the carrier's general ledger, and in both cases the core keeps the facts and the finance system keeps the books ([The Product Keeps Facts, Finance Picks Policy](/docs/money/accounting#the-product-keeps-facts-finance-picks-policy)).

## The Policy, Billing and Claims Split

The three systems are split because their records answer different questions and change for different reasons.

| System | Owns | Clock | Changes when |
| --- | --- | --- | --- |
| **Policy administration** | Submissions, quotes, policies, terms, transactions, versions, risks, coverages, written premium | Effective time, with recorded time | An underwriter, agent or customer changes the contract |
| **Billing** | Billing accounts, plans, invoices, installments, payments, refunds, nonpay notices | Cash time: due dates, receipt dates | Money is due, received, returned or refunded |
| **Claims** | Claims, exposures, reserves, payments, recoveries, diaries | Loss time and reported time | A loss is reported, investigated, reserved, paid or closed |

The seams between them are where systems break, so each one is an explicit interface with its own record:

- **Policy to billing: charges.** Every policy transaction that changes premium, taxes or fees sends billing its charges. Socotra's model is the clearest public one: charges are "objects that record financial amounts on quotes and policy transactions," in six categories (Premium, Tax, Fee, Surcharge, Credit and Nonfinancial); the billing side "slices them across installments according to your billing settings"; charges of category Nonfinancial (technical premium, for example) "will not be processed for presentation on invoices"; and zero-value items are not sent at all. Billing never computes premium; it schedules what policy administration wrote ([Billing & Premium Finance](/books/insurance/billing-and-premium-finance)).
- **Billing to policy: nonpayment.** When an installment goes unpaid past the plan's grace, billing asks policy administration for a cancellation, and policy administration issues the notice under the state's rules ([Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal)). Payment after the notice, before the effective date, rescinds the request. The two systems must agree on which side owns the decision; mine is that billing owns delinquency and policy owns cancellation.
- **Policy to claims: the coverage snapshot.** At first notice, claims looks up the policy version in force at the loss time and copies what it needs (coverages, limits, deductibles, parties, risks); Guidewire's ClaimCenter copies the policy from the policy system into the claim's own policy graph ([First Notice, Coverage & Triage](/books/insurance/first-notice-and-triage)). The copy is a snapshot as recorded on the day, so a later backdated endorsement that changes coverage on the loss date must reach open claims as an event, not silently.
- **Claims to billing: money owed by the insured.** A deductible the insurer advanced and must collect, a premium owed that a claim payment may offset where the state allows it, a return premium on a total loss. These cross as receivables, with the claim as the reference.
- **All three to the ledger.** Written premium, receivables, cash, commissions, taxes, reserves, payments, recoveries and cessions all post to accounting. Each system emits entries; none of them is the general ledger.

## Effective Dating and Bitemporal Records

Every record in an insurance system answers "as of when?" in two senses, and the core model keeps both ([Two Clocks on Everything](/books/insurance/insurance-business#the-core-data-model), [Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)). Effective time is when coverage, a change, a loss or a payment is in force in the world. Recorded time is when the system learned it. They differ constantly: an endorsement processed today is effective last month; a loss reported in March happened in January; a payment received Friday was due Monday.

The rule that keeps the system coherent: **policy data is ordered by effective time, money is ordered by recorded time.** A backdated endorsement replays the policy versions after its effective date so coverage reads correctly on every date ([Bitemporal Policy Versions](/books/insurance/endorsements-and-renewals#bitemporal-policy-versions)). The premium, commission, tax and cession entries it produces are dated by when they were processed, because a closed accounting month stays closed ([Closed Periods Stay Closed](/docs/money/accounting#closed-periods-stay-closed)). Socotra states the same split for its own ledger: financial transactions follow the order in which transactions were issued, not their effective dates, and "financial ledgers are fundamentally append-only, preserving a complete audit trail."

Three queries every part of the system must be able to answer, and the columns that answer them:

| Question | Read |
| --- | --- |
| What was covered on the loss date, as known when the claim was paid? | `policy_versions` where `effective` contains the loss time and `recorded` contains the payment time |
| What was written premium for March, as booked? | `premium_entries` with `accounting_date` in March |
| What would March have looked like with everything known now? | The same entries grouped by the transaction's `effective_at`, which is the actuarial and statistical view, not the accounting one |

The third question is why statistical reporting, loss triangles and accounting can disagree on the same month and all be right ([Regulatory & Statistical Reporting](/books/insurance/regulatory-and-statistical-reporting)).

## The Rating Service

Rating is a pure function: given a product version (rate tables, algorithm, rules) and the rating inputs of one transaction, it returns the premium for every coverage and the worksheet of every step ([How a Rate Is Built](/books/insurance/how-a-rate-is-built)). Socotra's plugin contract shows the shape: a pricing request "trigger[s] the Rating Plugin," which returns a `RatingSet` of `RatingItem`s, each with an `elementLocator` (the coverage or exposure it prices), a `chargeType` and a `rate`, one charge per charge type per element, after which the transaction moves to `priced`. What the architecture must guarantee:

- **Determinism and replay.** The same inputs and product version always give the same result, so a market conduct examiner who rerates a sample gets the filed premium, and an out-of-sequence endorsement can rerate later transactions. No clock reads, no live data calls inside the function; data the rate needs (a credit-based score, a territory) is fetched before rating and passed in as an input with its own record.
- **Versioned products.** The product version is chosen by the transaction's effective date and the new-business or renewal rule, and recorded on the quote ([Rate Changes, Versions and Dates](/books/insurance/how-a-rate-is-built#rate-changes-versions-and-dates)).
- **The worksheet is output, not a log.** Every factor, lookup and rounding step is returned and stored with the quote, because the worksheet is the evidence that the filed rate was charged.
- **Price per coverage and per state.** Charges come back at the grain that taxes, commissions, statement lines, statistical codes and cessions need, so nothing downstream has to allocate a policy-level total.

## Documents

Every declarations page, policy packet, ID card, certificate, notice and claim letter is a generated document that the law treats as the contract or as proof that notice was given. The architecture keeps three things for each: the template version, the data snapshot it was rendered from, and the rendered file with its delivery proof ([Issuance and the Declarations](/books/insurance/quote-bind-and-issue#issuance-and-the-declarations), [What Was Sent Is What You Keep](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep)). Forms attach by rule from the product version ([Products, Coverages & Forms](/books/insurance/products-and-coverages)), notices are generated by the notice engine with their deadlines ([Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal)), and claims correspondence by the diary. The document service never decides content; it renders what policy, billing and claims tell it to, and returns the proof.

## The Insurance Ledger

The insurance ledger is a set of subledgers, each fed by one system, that roll up to the general ledger and out to every financial report the insurer files.

| Subledger | Fed by | Holds |
| --- | --- | --- |
| **Premium** | Policy administration | Written premium by transaction, coverage, state and statement line; unearned premium derived by the earning rule |
| **Receivables** | Billing | Premium receivable by billing account, installments, cash applied, refunds |
| **Commissions** | Policy and billing | Commission payable and paid by producer, accrued at write, clawed back on cancellation |
| **Taxes, fees and assessments** | Policy | Premium taxes, surplus lines taxes, fees and assessments payable by state |
| **Losses** | Claims | Case reserves by cost type, payments, recoveries, by exposure, accident date and statement line |
| **Reinsurance** | Cession calculation | Ceded premium, ceding commission, ceded reserves and recoverables, by contract |

The feeds out of it:

- **General ledger.** Summary journals by account, legal entity, statement line and state, posted once per batch with a log, idempotently ([Syncing to the Accounting System](/docs/money/accounting#syncing-to-the-accounting-system)).
- **Statutory statement.** The annual and quarterly statements, Schedule P, Schedule F and the State Page are built from the subledgers by statement line and state, not from the general ledger alone ([What the Ledger Must Keep](/books/insurance/statutory-accounting#what-the-ledger-must-keep)).
- **Reinsurance.** Cessions and statements per contract ([Reinsurance Operations](/books/insurance/reinsurance-operations)).
- **Agents.** Commission statements and downloads ([Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting)).
- **Regulators and statistical agents.** Premium tax returns, statistical plan records and data calls ([Regulatory & Statistical Reporting](/books/insurance/regulatory-and-statistical-reporting)).

### Worked Numbers: One Policy From Transaction to General Ledger

The core model's example, extended with my rates: a six-month personal auto policy written for $900.00, effective March 1, 2026, a term of 184 days; a 12% agency commission; a 2% premium tax (rates vary by state; [Regulatory & Statistical Reporting](/books/insurance/regulatory-and-statistical-reporting)); a 20% quota share with a 30% ceding commission. Simplified GAAP-style postings; statutory differences (acquisition costs expensed at once rather than deferred) are in Statutory Accounting.

| Date | Event | Debit | Credit | Amount |
| --- | --- | --- | --- | --- |
| Mar 1 | Written premium | Premium receivable | Unearned premium | $900.00 |
| Mar 1 | Commission accrued | Deferred acquisition costs | Commission payable | $108.00 |
| Mar 1 | Premium tax accrued | Deferred acquisition costs | Premium tax payable | $18.00 |
| Mar 1 | Ceded premium (20%) | Prepaid reinsurance premium | Reinsurance payable | $180.00 |
| Mar 1 | Ceding commission (30% of ceded) | Reinsurance payable | Deferred ceding commission | $54.00 |
| Mar 31 | Earn 31 of 184 days | Unearned premium | Premium earned | $151.63 |
| Mar 31 | Earn ceded 31 of 184 days | Ceded premium earned | Prepaid reinsurance premium | $30.33 |
| Mar 31 | Amortize acquisition costs 31 of 184 days | Commission and tax expense | Deferred acquisition costs | $21.23 |
| Mar 31 | Amortize ceding commission 31 of 184 days | Deferred ceding commission | Ceding commission income | $9.10 |

The arithmetic: $900.00 × 31 / 184 = $151.63; $180.00 × 31 / 184 = $30.33; ($108.00 + $18.00) × 31 / 184 = $21.23; $54.00 × 31 / 184 = $9.10. Net retained earned premium for March is $151.63 − $30.33 = $121.30. If the insured cancels on May 1 (61 days in), every one of these unwinds pro rata from the same transaction: return premium $900.00 × 123 / 184 = $601.63, commission clawback $108.00 × 123 / 184 = $72.20, and the reinsurer's share of each.

Two properties matter more than the accounts. **Every line traces to one policy transaction and one premium entry,** so the earned premium on the State Page, the commission on the agent's statement and the ceded premium on the reinsurer's statement all come from the same rows and can't disagree. **Earning is computed, not posted by hand**: the month-end earning journal is a query over `premium_entries` as of the period end (the core model's earned premium query), run per state and statement line, so a backdated endorsement changes next month's journal, not last month's.

A sketch of turning one premium entry into balanced journal lines, with the invariant enforced where it is created:

```go tab="Go"
type Line struct {
	Account string
	Debit   int64 // cents
	Credit  int64
}

// WritePremium posts a written premium entry with its commission, tax and cession.
func WritePremium(premium int64, commBP, taxBP, cedeBP, cedeCommBP int64) ([]Line, error) {
	comm := premium * commBP / 10000
	tax := premium * taxBP / 10000
	ceded := premium * cedeBP / 10000
	cedeComm := ceded * cedeCommBP / 10000
	lines := []Line{
		{"premium_receivable", premium, 0}, {"unearned_premium", 0, premium},
		{"deferred_acquisition_costs", comm + tax, 0},
		{"commission_payable", 0, comm}, {"premium_tax_payable", 0, tax},
		{"prepaid_reinsurance", ceded, 0}, {"reinsurance_payable", cedeComm, ceded},
		{"deferred_ceding_commission", 0, cedeComm},
	}
	var dr, cr int64
	for _, l := range lines {
		dr, cr = dr+l.Debit, cr+l.Credit
	}
	if dr != cr {
		return nil, fmt.Errorf("unbalanced: %d != %d", dr, cr)
	}
	return lines, nil
}
```

```rust tab="Rust"
pub struct Line { pub account: &'static str, pub debit: i64, pub credit: i64 }

/// Posts a written premium entry with its commission, tax and cession (amounts in cents).
pub fn write_premium(premium: i64, comm_bp: i64, tax_bp: i64, cede_bp: i64, cede_comm_bp: i64)
    -> Result<Vec<Line>, String> {
    let comm = premium * comm_bp / 10_000;
    let tax = premium * tax_bp / 10_000;
    let ceded = premium * cede_bp / 10_000;
    let cede_comm = ceded * cede_comm_bp / 10_000;
    let lines = vec![
        Line { account: "premium_receivable", debit: premium, credit: 0 },
        Line { account: "unearned_premium", debit: 0, credit: premium },
        Line { account: "deferred_acquisition_costs", debit: comm + tax, credit: 0 },
        Line { account: "commission_payable", debit: 0, credit: comm },
        Line { account: "premium_tax_payable", debit: 0, credit: tax },
        Line { account: "prepaid_reinsurance", debit: ceded, credit: 0 },
        Line { account: "reinsurance_payable", debit: cede_comm, credit: ceded },
        Line { account: "deferred_ceding_commission", debit: 0, credit: cede_comm },
    ];
    let (dr, cr) = lines.iter().fold((0, 0), |(d, c), l| (d + l.debit, c + l.credit));
    if dr != cr { return Err(format!("unbalanced: {dr} != {cr}")); }
    Ok(lines)
}
```

With $90,000 cents, 1,200, 200, 2,000 and 3,000 basis points, the lines match the March 1 rows above and both sides total $1,260.00 ($900 + $126 + $180 + $54).

## Events and Integration

Everything outside the core (agents' systems, the data warehouse, the reinsurance system, document delivery, customer notifications, partners) learns of changes through events, and the core publishes them the only reliable way: in the same database transaction as the change, through an outbox, relayed to consumers that are idempotent ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox), [Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)). Socotra's public design is a working example of both delivery styles:

- **A readable event stream:** "a chronological feed of activity within Socotra Insurance Suite," read with a `pagingToken` "in ascending chronological order," with billing events ("delinquency, payment, and invoice generation") carrying the affected `policyLocators`, and custom events allowed.
- **Signed webhooks:** an endpoint receives "an EventResponse payload whenever the relevant event occurs"; retries are configurable from 1 to 10 attempts (default 3), linear or exponential; delivery can be suspended after retries run out and failed messages diverted to a Diverted Events API; "The timeout on a webhook is 10000 milliseconds"; each request carries a `socotra-signature` header with a timestamp, an HMAC-SHA256 signature over the timestamp, payload and a tag, and a tag that supports secret rotation. Without a failure handling setting, delivery behaves "with indifference as to whether message delivery succeeds."

The last point is the design lesson: a webhook that may be dropped is a notification, not an integration. For anything that must not be missed (a cancellation reaching a mortgagee system, a payment reaching an agency's ledger), the consumer reconciles against the stream or an API by cursor, and the webhook only tells it to look ([Receiving Their Webhooks](/docs/building-blocks/integrations#receiving-their-webhooks)).

The event catalog an insurance core needs, at minimum, by system: policy (`quote.priced`, `policy.bound`, `transaction.issued` with kind and effective date, `transaction.reversed`, `version.replayed`), billing (`invoice.generated`, `payment.received`, `payment.returned`, `account.delinquent`, `refund.issued`), claims (`claim.reported`, `exposure.opened`, `reserve.changed`, `payment.issued`, `claim.closed`), and documents (`document.rendered`, `document.delivered`, `notice.mailed`). Every event carries both clocks (effective and recorded), the legal entity, and the identifiers a consumer needs to fetch the full record, never the full record itself.

## Reconciliation

Three systems and a ledger produce three versions of the truth unless they are reconciled every day:

| Reconciliation | Compares | A break means |
| --- | --- | --- |
| Policy to billing | Written premium, taxes and fees per transaction against charges billed | A transaction never reached billing, or billed twice |
| Billing to cash | Payments applied against bank deposits and processor settlements ([Reconciliation](/docs/money/payment-states#reconciliation)) | Unapplied cash, or applied money that never arrived |
| Subledgers to GL | Each subledger's balances by account and entity against the general ledger | A failed or duplicated sync batch |
| Claims to ledger | Reserves and payments per exposure against the loss subledger and the bank's cleared checks | A payment issued outside the claim system, or a void not posted |
| Third-party data to core | Bordereaux, enrollment files, downloads against the core's own records ([The Bordereau](/books/insurance/mgas-programs-and-fronting#the-bordereau)) | Business the insurer is liable for but hasn't recorded |

When these fail, it shows up in filings. Atlantic American's 10-K for 2025 reported material weaknesses because it "did not design and maintain effective controls to timely and accurately reconcile enrollment, billing and cash receipt information" and to "resolve differences among third-party enrollment data, the policy administration system and the general ledger" on group business. That is the seam between the three systems and the ledger, failing where an auditor can see it.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model). The core model is already split by system: policy administration owns `submissions` through `premium_entries`, billing owns `billing_accounts` through `payments`, claims owns `claims` through `claim_tasks`, and the chapters that define each table keep it. This chapter adds the outbox, the ledger entries and the feed batches:

```sql
CREATE TABLE outbox_events (               -- written in the same transaction as the change
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  source             TEXT NOT NULL CHECK (source IN ('policy', 'billing', 'claims',
                       'documents', 'reinsurance')),
  type               TEXT NOT NULL,         -- 'transaction.issued', 'reserve.changed', ...
  subject_id         UUID NOT NULL,         -- the row that changed
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  effective_at       TIMESTAMPTZ,           -- the business clock, when there is one
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload            JSONB NOT NULL,        -- identifiers and a summary, not the record
  published_at       TIMESTAMPTZ            -- set by the relay
);
CREATE INDEX outbox_unpublished ON outbox_events (recorded_at) WHERE published_at IS NULL;

CREATE TABLE ledger_entries (              -- one balanced journal line, from one source row
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  journal_id         UUID NOT NULL,         -- lines of one journal balance to zero
  insurer_id         UUID NOT NULL REFERENCES insurers (id),  -- the legal entity
  account            TEXT NOT NULL,         -- 'unearned_premium', 'commission_payable', ...
  amount             BIGINT NOT NULL,       -- signed: debits positive, credits negative
  state              TEXT,                  -- for State Page, tax and stats
  statement_line     TEXT,                  -- statement_line_mappings (Statutory Accounting)
  source_table       TEXT NOT NULL,         -- 'premium_entries', 'claim_payments', 'cessions', ...
  source_id          UUID NOT NULL,
  accounting_date    DATE NOT NULL,
  feed_id            UUID,                  -- the GL batch it went out in
  UNIQUE (source_table, source_id, account, journal_id)
);

CREATE TABLE ledger_feeds (                -- one batch to one destination
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  destination        TEXT NOT NULL CHECK (destination IN ('general_ledger', 'statutory',
                       'reinsurance', 'commission', 'premium_tax', 'statistical')),
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  period             DATERANGE NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('building', 'sent', 'acknowledged',
                       'rejected', 'superseded')),
  totals             JSONB NOT NULL,        -- by account: what was sent, for reconciliation
  idempotency_key    TEXT NOT NULL UNIQUE,  -- destination, entity, period, version
  sent_at            TIMESTAMPTZ
);
```

The balance rule is a deferred constraint or a check in the posting function: the lines of one `journal_id` sum to zero. Design choices that matter:

- **Every ledger line points at its source row,** so any balance can be drilled to transactions, and a reversal of a transaction produces reversing lines, never edits.
- **Legal entity, state and statement line on every line,** because the statutory statement, premium tax and the State Page are all per insurer, per state and per line.
- **Feeds are batches with totals and an idempotency key,** so a resent GL batch is recognized and a rejected one is visible.
- **Events carry identifiers, not records;** consumers fetch the record as of the event and reconcile by cursor.

## Auditing

- **Every financial balance drills to transactions:** a sample of GL balances traced through feeds and ledger lines to premium entries, claim payments and cessions.
- **Subledgers reconcile to the GL daily,** with breaks owned and aged.
- **Closed periods stay closed:** backdated transactions post in the open period, and the effective-date view is produced separately.
- **Rating is reproducible:** a sample of quotes rerated from stored inputs and product versions returns the stored premium.
- **No lost events for critical consumers:** mortgagee, agency and reinsurance feeds reconciled against the source by cursor.
- **Documents match data:** a sample of rendered declarations matches the policy version and premium they claim to show.

## What This Means for the System You Build

- **Split policy, billing and claims** and make every seam an explicit interface with its own record.
- **Order coverage by effective time and money by recorded time,** and keep both clocks on every row and event.
- **Make rating a pure, versioned function** that returns its worksheet at coverage and state grain.
- **Build the ledger from source rows,** balanced at creation, tagged with entity, state and statement line.
- **Publish events through an outbox,** and treat webhooks as hints, with reconciliation for anything that must arrive.
- **Reconcile every seam daily,** because the filings show what happens when a carrier doesn't.

## References

**Filings**

- [Guidewire Software: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1528396/000152839626000046/gwre-20260731.htm), InsuranceSuite's five core applications and Guidewire Cloud Platform on AWS
- [Duck Creek Technologies: Form 10-K for fiscal 2022](https://www.sec.gov/Archives/edgar/data/1160951/000095017022020470/dct-20220831.htm), the product set and Duck Creek OnDemand
- [Sapiens International: Form 20-F for 2024](https://www.sec.gov/Archives/edgar/data/885740/000101376225003193/ea0235334-20f_sapiens.htm), CoreSuite and the Pro products
- [Atlantic American: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/8177/000114036126039933/ef20060652_10k.htm), material weaknesses in reconciling enrollment, billing, cash, the policy administration system and the general ledger

**Vendor documentation**

- [Duck Creek: Products](https://www.duckcreek.com/products/), Policy, Rating, Billing, Claims, Underwriting and the Integration Hub
- [Socotra: Introduction to Socotra](https://docs.socotra.com/getting-started/introduction-to-socotra), a policy administration and billing service
- [Socotra: Transactions and billing](https://docs.socotra.com/learning/transactions-and-billing), charges sliced into installments, invoices, append-only financial transactions in issuance order
- [Socotra: Charges](https://docs.socotra.com/features/financials/charges), charge categories, nonfinancial charges and zero-value items
- [Socotra: Accounting primer](https://docs.socotra.com/features/financials/accounting-primer), double-entry accounting, account types and accrual basis
- [Socotra: Rating plugin](https://docs.socotra.com/configuration/plugins/rating), the RatePlugin, RatingSet and RatingItem and the priced state
- [Socotra: Events](https://docs.socotra.com/configuration/general-topics/events), the chronological event stream, paging tokens and billing events
- [Socotra: Webhooks](https://docs.socotra.com/configuration/general-topics/webhooks), retries, diverted events, the 10-second timeout, the signature header and failure handling
