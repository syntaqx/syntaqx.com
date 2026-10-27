+++
title = "Ledger & Reconciliation at Provider Scale"
nav_title = "Ledger & Reconciliation"
description = "A provider's chart of accounts, the three-way match of ledger, settlement files and bank statements, matching engines, breaks, suspense and the close."
category = "Payments Industry"
order = 1424
part = "Paying Out"
tags = ["payments", "ledger", "reconciliation", "accounting", "treasury"]
+++

A merchant's ledger has one bank account and one processor. A provider's has every merchant's money in a handful of pooled accounts, a settlement file per processor and network per day, a statement per bank account, fees that are estimates until a file says otherwise, and a sponsor bank that wants to know, any morning it asks, whose money is in the pool. [Payment States & Ledgers](/docs/payments/payment-states#double-entry-ledger) covers double entry itself and [Money & Amounts](/docs/payments/money) the amounts; this chapter is what changes when the ledger is the system of record for other people's money, and reconciliation is how you prove it every day. [Payouts & Settlement](/books/payments/payouts-and-settlement) produces the entries, [Treasury & Bank Operations](/books/payments/treasury) runs the accounts they describe, and this chapter is where the two are made to agree.

## How the Platforms Do It

The public providers all expose the same idea from different ends: every movement is an itemized record, and every lump sum (a payout, a settlement batch, a bank deposit) decomposes into those records and sums back to the cent.

**Stripe** records every movement of funds in or out of an account as a **balance transaction**, and an automatic payout lists the balance transactions it contains: filter the list by payout ID and you get the charges, refunds, fees and the payout itself. Its payout reconciliation report groups them by reporting category, with an itemized export that carries the charge, payment and the bank's trace ID for the payout. Two details are worth copying. Instant and manual payouts can't be decomposed, because the merchant chose their timing and amount, so Stripe leaves those for the merchant to reconcile. And report data runs on its own schedule, so a payout can arrive before its reconciliation data does.

**Adyen** reconciles at two levels. The batch-level report shows payout batches and their costs for matching to the bank statement; the transaction-level settlement details report lists every payment, refund and chargeback in a batch, with gross, net, commission, markup, scheme fees and interchange per row, keyed by Adyen's PSP reference and the merchant's own reference. Its stated rule is the one every provider's files obey: add up the net credits, subtract the net debits, and the result equals the batch's payout line.

**Modern Treasury** reconciles bank activity to **expected payments**: records created ahead of time for money you expect to move, matched by rules made of field, operator and value conditions run in order, specific rules first. Many transactions can reconcile to one expected payment (it's `partially_reconciled` until the total is reached), and one transaction can reconcile to a group of expected payments whose amounts sum to it.

**TigerBeetle**, a ledger database built for this workload, models a hold as a **two-phase transfer**: a pending transfer reserves its amount in `debits_pending` and `credits_pending` without touching the posted balances, and is later posted (in full or part), voided, or expired by timeout.

| | Unit of record | What decomposes | Matching keys | Unmatched handling |
| --- | --- | --- | --- | --- |
| Adyen | Settlement detail row | Batch into payments, refunds, chargebacks and costs | PSP reference, merchant reference, batch number | Net credits less net debits must equal the payout |
| Modern Treasury | Expected payment | Bank transactions against expectations | Rule conditions on amount, date, custom identifiers | Partial reconciliation; rules ordered to catch exceptions |
| Stripe | Balance transaction | Automatic payout into its transactions | Payout ID, charge ID, bank trace ID | Manual and instant payouts left to the merchant |
| TigerBeetle | Transfer | Pending reserved, then posted or voided | Transfer ID (idempotent) | Pending expires on timeout |

None of them reconciles for you across sources. A provider holds the processor's view, the bank's view and its own, and the work of this chapter is the join.

## A Provider's Chart of Accounts

[A Chart of Accounts](/docs/payments/payment-states#a-chart-of-accounts) names the accounts a merchant-facing ledger posts to. A provider's ledger has two halves that must equal each other: liabilities that say who the money belongs to, and assets that say where it physically is.

| Account | Side | Holds |
| --- | --- | --- |
| `merchant_balance:{merchant}:pending` | Liability | Captured, not yet available, per merchant and currency |
| `merchant_balance:{merchant}:available` | Liability | Payable now, less holds |
| `reserves:{merchant}` | Liability | Held back against disputes and refunds, with release dates |
| `disputes_held:{merchant}` | Liability | Withdrawn by open disputes |
| `merchant_receivable:{merchant}` | Asset | Negative balances and clawbacks owed back to you |
| `network_payable:{network}` | Liability | Interchange and assessments owed for refunds, disputes and fee billing not yet netted |
| `processor_fees_payable:{processor}` | Liability | Fees billed on an invoice rather than netted from settlement |
| `acquirer_settlement_clearing:{processor}` | Asset | Settlement the processor owes you, from capture until the deposit lands |
| `payouts_in_transit:{rail}` | Asset | Sent, not yet confirmed by the bank |
| `cash:{bank_account}` | Asset | One per real bank account (FBO, reserve, operating), per currency |
| `suspense:{bank_account}` | Liability | Money received that nobody has identified yet |
| `processing_costs` | Expense | Interchange, network fees, processor markup |
| `platform_revenue` | Income | What you keep |
| `fx_gain_loss` | Income or expense | Differences from conversion at different times |

Three rules make it work at scale.

- **Merchant money and your money never share an account.** Every merchant liability is backed by the FBO cash accounts, and fees move to operating only by a ledger-computed sweep ([The Accounts You Run](/books/payments/treasury#the-accounts-you-run)). The daily identity is that the FBO cash equals merchant balances plus reserves plus held disputes plus unswept fees, adjusted for money in transit either way, and it's the first check the close runs.
- **Clearing accounts are zero by design.** `acquirer_settlement_clearing` rises at capture and falls when the deposit arrives; `payouts_in_transit` rises when a payout leaves and falls when the bank confirms it. A balance that doesn't drain on schedule is a list of specific items that didn't arrive, and the aging report on those accounts is half of break management.
- **Accounts are dimensioned, not multiplied.** A provider has hundreds of thousands of merchants; the account is the pair of a type and its dimensions (merchant, currency, processor, bank account), so a report can sum `merchant_balance` across every merchant in EUR without a chart of accounts that lists each one.

## Double Entry at Provider Scale

The rules don't change at scale: balanced transactions, append-only rows, idempotent postings, corrections as reversals ([Append-Only Records](/docs/payments/payment-states#append-only-records)). What changes is what breaks first.

- **Hot accounts.** Every payment credits `platform_revenue` and `processing_costs`, so those two rows take a write from every transaction on the platform. A ledger that locks a cached balance row per posting serializes the whole business on them. Post entries without locking the balance, compute balances from entries plus periodic snapshots, and reserve row-level locking for accounts where an overdraft check is the point (a merchant's available balance before a payout).
- **Pending and posted are separate balances.** A capture is pending until settlement confirms it, a payout until the bank does. Track them as separate figures on the account, the way TigerBeetle keeps `debits_pending` beside `debits_posted`, so available balance is computed from posted entries and nothing pays out against money that might not come.
- **Three dates per entry.** When it happened at the source (`effective_at`), when you recorded it (`created_at`), and which accounting period it belongs to. Settlement files describe yesterday and arrive today; a correction found in March belongs to February's activity but is posted in March once February is closed.
- **Estimates are entries too.** The fee at capture is an estimate until the processor's file supplies the real interchange and network fees ([Fees Are Separate Entries](/books/payments/payouts-and-settlement#fees-are-separate-entries)). Post the estimate, then post the true-up as its own transaction linked to the first. Overwriting the estimate destroys the one number that tells you whether your pricing engine is right.
- **Postings come from events, never from people.** Every transaction carries the ID of the event that caused it (a capture, a file row, an approved adjustment), with a unique constraint. A person who needs to move money in the ledger raises an adjustment that someone else approves, and the adjustment posts; nobody inserts entries by hand.

## Three Sources of Truth

Every movement of money is described three times, by three systems that never consult each other:

1. **Your ledger,** which says what should have happened.
2. **The processor's and network's files,** which say what they did: settlement and fee files per processor, network settlement reports for a provider that clears directly ([Inside a Processor](/books/payments/inside-a-processor#settlement)), ACH return and NOC files, card payout confirmations.
3. **The bank's statements,** which say what money actually moved: in the US mostly BAI2, elsewhere MT940, and increasingly ISO 20022's `camt.053` (the prior day's booked entries), `camt.052` (intraday) and `camt.054` (individual debit and credit notifications). Each bank populates them in "their own flavour", in the words of one practitioner guide: the detail record (BAI2 record 16, MT940 tag 61) carries references however the bank chose to.

The ledger can balance perfectly while a wire you think you sent never left, which is why the ledger's own checks are not reconciliation. The general rules (breaks are records with owners, fixed by correcting entries, on a data path separate from the payment flow) are in [Reconciliation](/docs/payments/payment-states#reconciliation). A **three-way match** is two joins, at different grains, and a daily check of balances:

- **Ledger to processor, per transaction.** Every capture, refund, dispute and fee in the ledger matches a row in the processor's file, and every row in the file matches the ledger. This is where fee true-ups happen and where a transaction the processor dropped, or one you never recorded, shows up.
- **Processor to bank, per batch.** Each settlement batch's net amount matches one deposit on the bank statement. Adyen's rule (net credits minus net debits equals the payout) and Stripe's itemized payout are the processor side of this join.
- **And the ledger's cash accounts to the bank's closing balance,** every day, account by account and currency by currency, which is the check that catches everything the first two miss: a wire that never left, a fee the bank took, a deposit nobody expected.

A provider routing across several processors runs the first two joins per processor, and the third once per bank account ([Processor Routing](/books/payments/processor-routing) covers why there are several). Each rail adds its own source: an ACH payout reconciles against settlement and return files, a card payout against the push-to-card confirmations, a check against the bank's paid-items file, a wire against the bank's confirmation ([Vendor Payouts](/books/payments/vendor-payouts#remittance-and-reconciliation)). The pattern is the same for all of them; only the importer differs.

### One Importer per Source

Every file family gets an importer that turns it into **external records** of one canonical shape: source, source reference, amount and currency, value date, counterparty, and the raw row it came from. The matcher only ever sees canonical records.

- **Keep the raw file,** immutable, with its hash, and keep the raw row on every record. A parser bug fixed next month needs to re-read last month's file, and an examiner asks for the original, not your interpretation of it ([Bank Files](/books/payments/treasury#bank-files)).
- **A file is complete or it isn't processed.** Check its trailer counts and control totals before importing a row, and check that the day's expected files arrived at all. A missing settlement file looks identical to a quiet day unless something expects it.
- **Version the parsers per bank and per processor.** The standard is a starting point; the bank's implementation is the spec.

## A Matching Engine

Matching is a function from two sets of records (ledger-side and external) to a set of matches and a set of leftovers. Build it to be deterministic, rerunnable and explainable.

**Keys, strongest first.** Every rule runs in priority order, and the strongest key that both sides carry wins:

| Strength | Key | Example |
| --- | --- | --- |
| Exact reference you put there | Your ID echoed back | A payout ID in the ACH entry's individual ID, an end-to-end reference on an ISO 20022 transfer, a merchant reference on an Adyen row |
| Exact reference they assigned | Their ID you stored | Processor transaction ID, acquirer reference number, bank trace ID |
| Composite | Amount, value date window, counterparty | An incoming wire with no reference |
| Probabilistic | Amount and fuzzy name | Unidentified receipts, as a suggestion for a person, never an automatic match |

The cheapest reconciliation improvement is putting your own ID into every outbound instruction that has a field for it, so the first row of the table does most of the work.

**Cardinality.** One to one is a wire matched to the transfer you sent. One to many is a net settlement deposit matched to thousands of transactions and fees. Many to one is a payout batch that left as one debit. Many to many happens when a processor nets several days into one deposit after a holiday. The engine matches groups by summing one side and comparing to the other, and stores the group as the match, so the explanation of a $3,812.40 deposit is a list, not a calculation someone repeats.

**Tolerances.** A tolerance is a documented reason a difference is expected: a bank's per-wire fee, a correspondent's deduction on an incoming international wire, an FX rounding remainder. Each tolerance names the account the difference posts to. "Within five dollars" with no reason is how a slow leak becomes a large one.

**Date windows.** A card capture on Friday settles on Monday, an ACH debit on its settlement date, a wire the same day. Each match rule carries a window per rail, measured in banking days from the [banking calendar](/books/payments/treasury#the-banking-calendar), not calendar days.

**Expected records.** Where you know in advance that money should arrive (a settlement deposit forecast from yesterday's captures, a sponsor bank's monthly fee, a merchant's wire to cure a negative balance), create the expectation before the money comes. Matching against expectations turns "what is this deposit?" into "which expectation does this satisfy?", and an expectation that's still open past its window is itself a break.

**Rerunnable by construction.** A match run reads both sides as of a point in time, writes matches with the rule version that produced them, and never edits a ledger entry to make something match. Unmatching is allowed, recorded, and reversible. When a rule changes, the next run applies it to open items only; closed periods stay as they were.

## Breaks

A **break** is anything the engine couldn't match, or matched with a difference. Each one is a record with a type, an amount, an owner, an age and a deadline.

| Break | Typical cause | Usual resolution |
| --- | --- | --- |
| **Timing** | The external record hasn't arrived yet: weekend, holiday, late file | Clears itself within its window; ages into a real break if it doesn't |
| **Missing external** | The processor dropped a transaction, or a payout never left | Query the processor or bank by your reference; resend only after confirming it didn't happen |
| **Missing internal** | A refund made in the processor's dashboard, a dispute you never ingested, a bank fee | Post the missing event from the external record, linked to it |
| **Amount difference** | Fee true-up, partial capture recorded wrong, interchange downgrade | Correcting entry against the right account, with the reason |
| **Duplicate** | A file imported twice, a payout sent twice | Reverse the duplicate entry; recover the money if it really moved twice |
| **FX difference** | Conversion at a different rate or time than recorded | Post to `fx_gain_loss` with both rates ([Multi-Currency & FX](/docs/payments/multi-currency#refunds-and-fx-gains-and-losses)) |
| **Unidentified cash** | A deposit with no usable reference | Into suspense, then claimed or returned |
| **Misapplied** | Money matched to the wrong merchant | A transfer between merchant accounts, never an edit ([Payments Are Applied, Not Assigned](/docs/payments/payment-states#payments-are-applied-not-assigned)) |

**Aging is the control.** Report breaks in age buckets (today, 1 to 3 days, 4 to 7, 8 to 30, older), by type and amount, with the oldest and largest at the top. A timing break that's two days old is normal; one that's ten days old is a missing transaction. Set a deadline per type, and escalate past it, first to the team lead and then to whoever signs the financial statements.

**Unexplained breaks stop money.** A break in the FBO cash reconciliation holds the next payout run until someone explains it, because paying out against an account that doesn't reconcile is how one merchant's money ends up paying another. Breaks in merchant-level matching hold that merchant's payouts, not everyone's. A reconciliation that only reports is a dashboard; one that holds payouts is a control.

## Suspense Accounts and Who Works Breaks

A **suspense account** is where money goes when it has definitely arrived and nobody knows whose it is: a wire with no reference, an ACH credit to the FBO account from an unknown originator, a settlement deposit that doesn't match any forecast. It's a liability, because the money belongs to someone, and it is never revenue.

- **One suspense account per bank account and currency,** so each item is traceable to where it landed.
- **Every item in suspense is a break** with an owner and a deadline. Claimed items move to the right merchant or receivable by a transfer that cites the evidence. Unclaimed items go back to the sender after a fixed period, and what can't be returned follows the [unclaimed property](/books/payments/payouts-and-settlement#payout-failures) rules for dormant balances.
- **Suspense is never a plug.** Posting a difference to suspense to make a reconciliation balance hides the break; only money that actually arrived goes in.

Who works breaks depends on where they came from, and naming the owner is half of resolving them:

| Team | Owns | Because |
| --- | --- | --- |
| **Payments operations** | Ledger-to-processor breaks, missing or duplicate transactions, disputes not ingested | They can query the processor and correct the payment's events |
| **Treasury** | Processor-to-bank and cash breaks, suspense, failed or missing transfers | They hold the bank relationship and approve movements ([Moving Money Safely](/books/payments/treasury#moving-money-safely)) |
| **Finance** | Fee variances, FX differences, write-offs, the period close | They own the books and the policies the differences post under |
| **Engineering** | Importer failures, parser changes, rule bugs | A break caused by code is fixed in code, then the run is repeated |

Write-offs and manual adjustments need two people: one to propose with evidence, one to approve, with thresholds that add approvers as amounts grow, the same separation of duties a wire release has.

## Two Audiences for the Same Numbers

A provider serving software platforms reconciles for two readers at once. A **merchant** reconciles payouts to sales: every payout traces to the payments, refunds, fees and disputes it nets, which is what Stripe's itemized payout and Adyen's settlement details deliver. A **platform** reconciles its revenue: every residual or fee traces to the merchants and transactions that produced it ([Pricing Per Merchant](/books/payments/software-platforms#pricing-per-merchant) has the two fee layers). A residual statement the platform can't recompute from its own records is one it can only take on trust. Both views are queries over the same entries, and both tie to the same settlement files. Build the payout-to-transactions link and the fee-to-transaction link into the ledger itself; a report that reconstructs them later will one day reconstruct them differently.

## Multi-Currency Ledgers

Everything above runs per currency. A transaction balances in each currency it touches, a conversion is two balanced legs linked by one ID, and no account ever sums two currencies ([Storing Both Amounts](/docs/payments/multi-currency#storing-both-amounts)). At provider scale that adds:

- **Cash accounts per bank account per currency.** A multi-currency account at one bank is several ledger accounts, each reconciled to its own statement balance.
- **Conversion as a recorded trade.** When the provider converts a merchant's EUR settlement into a USD payout, the conversion is a transaction with the rate, its source, the quote it executed against, and the FX provider's confirmation, reconciled against that provider's statement like any other counterparty ([Cross-Border Payments & FX](/books/payments/cross-border-and-fx)).
- **FX differences have their own account.** A refund converted at a different rate than the charge, a dispute months later, a processor converting at settlement at a rate you didn't record: each difference posts to `fx_gain_loss`, never into the merchant's balance unless the merchant agreed to carry it.
- **Revaluation is a reporting step.** Balances held in foreign currencies are revalued into the functional currency at period end for the financial statements, by a documented rate policy ([Reporting in One Currency](/docs/payments/multi-currency#reporting-in-one-currency)). Revaluation entries live in the accounting books, not in merchant balances; a merchant's EUR balance is a EUR balance whatever the dollar did.

## Closing the Day and the Month

**The daily close** is a checklist the system runs and a person signs.

1. **Every expected file arrived and was imported:** each processor's settlement and fee files, each bank's statement for each account, the ACH return files.
2. **The roll-forward holds** for every cash and clearing account: opening balance plus the day's entries equals closing balance, and the closing balance equals the bank's.
3. **The FBO identity holds:** custodial cash equals what you owe merchants plus unswept fees, adjusted for transit.
4. **Breaks are aged and owned,** and any unexplained cash break has held the next payout run.
5. **The per-owner balance file is produced,** summing exactly to the custodial balance (below).

**The month-end close** adds the accounting layer, and the general mechanics (period locks, accruals, journals to the general ledger) are in [Accounting](/docs/payments/accounting). For a provider, the payments-specific steps are:

- **Lock the period** so nothing posts into it, and post late-arriving corrections into the open period with the original effective date; a break found after the close is a correction in the next open period, never an edit to a closed one ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)).
- **Reconcile the processor's and network's invoices** against the per-transaction costs you recorded. When they differ, the difference is either a fee you didn't know about or a transaction you didn't record ([Interchange & Pricing](/books/payments/interchange-and-pricing#a-pricing-engine) prices them; this is where you find out whether the prices were right).
- **Accrue what's owed but not billed,** like a monthly sponsor-bank fee, and reverse estimates that the files have since replaced.
- **Produce the merchant statements** from the closed ledger, so every number a merchant sees ties to a locked period ([Operating the Platform](/books/payments/operating-the-platform#statements-and-reports)).
- **Summarize to the general ledger.** The payments ledger is a subledger; the general ledger gets summary journals by account and currency, each with a link back to the entries behind it.

## Proving It to Auditors and Sponsor Banks

Reconciliation is also evidence, and the people who ask for it want specific artifacts.

- **The sponsor bank** wants to know that every dollar in the FBO account belongs to someone identifiable. The FDIC's 2024 proposal for custodial accounts would have banks keep each beneficial owner's balance and reconcile "no less frequently than at the close of business daily" ([FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance) has its status). Produce the file daily whether or not anyone asks: one row per owner, summing to the account's closing balance to the cent, with the reconciliation that proves the sum.
- **UK and EU safeguarding** asks for the same thing in rules: the FCA's supplementary regime has payment and e-money firms reconcile safeguarded funds every reconciliation day and file a monthly safeguarding return ([Safeguarding Outside the US](/books/payments/treasury#safeguarding-outside-the-us)).
- **Financial auditors** test by tracing: pick a payout and show the balance transactions it paid, the payments behind them, the settlement rows and the bank line; pick a bank line and walk it back. If each hop is a stored link, a sample takes minutes. Customers' auditors ask the same of you as a service organization, which is what a SOC 1 report covers ([Who Carries What](/books/payments/payments-rulebook#who-carries-what)).
- **Roll-forwards and break reports by period,** retained, so the state of reconciliation on any past day can be shown as it was then, not recomputed with today's rules.

## How to Build It

The tables below extend the core `ledger_accounts`, `ledger_transactions`, `ledger_entries`, `payments` and `payouts` from [the core data model](/books/payments/card-payments#the-core-data-model), with the double-entry rules of [Payment States & Ledgers](/docs/payments/payment-states#double-entry-ledger) enforced on them. The core already gives every account a `merchant_id`, a `name` and a `currency`, and every transaction a `status`, an `effective_at` and the event that caused it (`source_type`, `source_id`, unique together). `bank_accounts` is one row per real account [Treasury](/books/payments/treasury#how-to-build-it) runs, and this chapter owns every inbound file, statement line and break: Treasury's outbound files and transfers are matched through the tables here.

```sql
-- Dimensions on accounts, so one type covers every merchant, bank account and currency.
-- The core `name` holds the account type: 'merchant_balance', 'cash', 'suspense', ...
ALTER TABLE ledger_accounts
  ADD COLUMN side            TEXT NOT NULL CHECK (side IN ('asset', 'liability', 'income', 'expense')),
  ADD COLUMN bank_account_id UUID REFERENCES bank_accounts (id),
  ADD COLUMN processor       TEXT,
  DROP CONSTRAINT ledger_accounts_merchant_id_name_currency_key,
  ADD CONSTRAINT ledger_accounts_dims_key
    UNIQUE NULLS NOT DISTINCT (name, merchant_id, bank_account_id, processor, currency);

-- The third date, and corrections linked to what they correct.
-- source_type gains 'file_row' and 'adjustment' alongside the payment events.
ALTER TABLE ledger_transactions
  ADD COLUMN created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),  -- when we recorded it
  ADD COLUMN period       DATE NOT NULL,                       -- accounting period it posts into
  ADD COLUMN corrects_id  UUID REFERENCES ledger_transactions (id);

CREATE TABLE external_files (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  source        TEXT NOT NULL,              -- 'bank:jpm:bai2', 'processor:adyen:settlement'
  file_name     TEXT NOT NULL,
  sha256        BYTEA NOT NULL,
  business_date DATE NOT NULL,
  record_count  INTEGER NOT NULL,
  control_total BIGINT,                     -- from the trailer, checked before import
  parser_version TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('received', 'imported', 'rejected')),
  storage_uri   TEXT NOT NULL,              -- immutable archive of the original
  CONSTRAINT external_files_source_hash_key UNIQUE (source, sha256)
);

CREATE TABLE external_records (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  file_id       UUID NOT NULL REFERENCES external_files (id),
  source        TEXT NOT NULL,
  bank_account_id UUID REFERENCES bank_accounts (id),  -- set for statement lines
  source_ref    TEXT,                       -- PSP reference, trace ID, end-to-end ID
  our_ref       TEXT,                       -- our ID, when the source echoed it
  kind          TEXT NOT NULL,              -- 'capture', 'refund', 'fee', 'deposit', 'payout', ...
  amount        BIGINT NOT NULL,            -- signed, minor units
  currency      CHAR(3) NOT NULL,
  value_date    DATE NOT NULL,
  counterparty  TEXT,
  raw           JSONB NOT NULL              -- the row as received
);

-- Each statement's opening and closing balance, parsed from the same files.
CREATE TABLE bank_statement_balances (
  bank_account_id UUID NOT NULL REFERENCES bank_accounts (id),
  currency        CHAR(3) NOT NULL,
  business_date   DATE NOT NULL,
  opening_balance BIGINT NOT NULL,
  closing_balance BIGINT NOT NULL,
  file_id         UUID NOT NULL REFERENCES external_files (id),
  PRIMARY KEY (bank_account_id, currency, business_date)
);

CREATE TABLE expected_records (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  source        TEXT NOT NULL,
  our_ref       TEXT NOT NULL,
  amount        BIGINT NOT NULL,
  currency      CHAR(3) NOT NULL,
  expected_during DATERANGE NOT NULL,       -- window in banking days, resolved to dates
  ledger_transaction_id UUID REFERENCES ledger_transactions (id),
  status        TEXT NOT NULL CHECK (status IN ('open', 'partially_matched', 'matched', 'expired'))
);

CREATE TABLE match_groups (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  run_id        UUID NOT NULL,
  rule          TEXT NOT NULL,
  rule_version  INTEGER NOT NULL,
  difference    BIGINT NOT NULL DEFAULT 0,  -- zero, or within a named tolerance
  tolerance     TEXT,                       -- 'wire_fee', 'fx_rounding'; NULL means exact
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unmatched_at  TIMESTAMPTZ,                -- unmatching is recorded, never deleted
  unmatched_by  UUID
);

CREATE TABLE match_members (
  match_group_id     UUID NOT NULL REFERENCES match_groups (id),
  ledger_entry_id    UUID REFERENCES ledger_entries (id),
  external_record_id UUID REFERENCES external_records (id),
  expected_record_id UUID REFERENCES expected_records (id),
  CHECK (num_nonnulls(ledger_entry_id, external_record_id, expected_record_id) = 1)
);

CREATE TABLE breaks (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  kind          TEXT NOT NULL CHECK (kind IN ('timing', 'missing_external', 'missing_internal',
                  'amount', 'duplicate', 'fx', 'unidentified', 'misapplied')),
  amount        BIGINT NOT NULL,
  currency      CHAR(3) NOT NULL,
  ledger_account_id UUID REFERENCES ledger_accounts (id),
  owner_team    TEXT NOT NULL,
  opened_on     DATE NOT NULL,
  due_on        DATE NOT NULL,
  blocks_payouts BOOLEAN NOT NULL DEFAULT false,
  resolved_by_transaction_id UUID REFERENCES ledger_transactions (id),
  resolved_at   TIMESTAMPTZ,
  resolution_note TEXT
);

CREATE TABLE period_closes (
  period        DATE NOT NULL,
  kind          TEXT NOT NULL CHECK (kind IN ('daily', 'monthly')),
  closed_at     TIMESTAMPTZ NOT NULL,
  closed_by     UUID NOT NULL,
  checks        JSONB NOT NULL,             -- each check, its result and the evidence
  PRIMARY KEY (period, kind)
);
```

A cash account's roll-forward for a day, which the close stores as evidence:

```sql
SELECT a.id,
       SUM(e.amount) FILTER (WHERE t.effective_at < :day)                  AS opening,
       SUM(e.amount) FILTER (WHERE t.effective_at::date = :day)            AS activity,
       SUM(e.amount) FILTER (WHERE t.effective_at < :day + 1)              AS closing,
       s.closing_balance                                                   AS bank_closing
FROM ledger_accounts a
JOIN ledger_entries e      ON e.ledger_account_id = a.id
JOIN ledger_transactions t ON t.id = e.ledger_transaction_id AND t.status = 'posted'
JOIN bank_statement_balances s ON s.bank_account_id = a.bank_account_id
                              AND s.currency = a.currency AND s.business_date = :day
WHERE a.name = 'cash'
GROUP BY a.id, s.closing_balance;
```

How it runs:

1. **Import, then match, then close,** as separate jobs. An importer that fails stops the close for its source, not the others.
2. **Match runs are idempotent by run ID** and read both sides as of a cutoff. Two runs over the same inputs produce the same groups.
3. **Breaks open automatically** from leftovers after each run, with the owner set by kind and source, and `blocks_payouts` set for any cash break and for merchant-level breaks above a threshold.
4. **The payout job checks for blocking breaks** before it selects balances, and records which breaks, if any, it waited on.
5. **Corrections post as new transactions** with `corrects_id`, into the open period, and the match engine rematches the affected items on its next run.

## Auditing

Reconciliation records are what an examiner, an auditor or a sponsor bank reads to decide whether to trust everything else, so they need the properties [Audit Trails](/docs/architecture/audit-trails) describes, and a few specific to money:

- **Every match is explainable:** the rule and version that made it, the run, and the members on each side, with unmatching recorded rather than deleted.
- **Every break's life is kept:** when it opened, who owned it, what was done, and the transaction that resolved it. A break closed without a resolving entry or a written reason is a finding.
- **Every manual adjustment and write-off** shows who proposed it, who approved it, the evidence attached and the threshold that required the approval.
- **Original files are immutable and hashed,** and every external record points to its file and raw row, so a number in a report can be walked back to the bytes the bank sent ([Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident)).
- **Each close stores its checks and their results,** so the state of reconciliation on any past day is shown as it was, not recomputed.
- **Per-owner balance files are retained** with the reconciliation that proved their sum.

## What This Means for the System You Build

- **A chart of accounts with two halves,** liabilities by owner and assets by bank account, dimensioned by merchant, currency, processor and bank account, with the FBO identity checked daily.
- **Clearing and in-transit accounts that drain to zero,** with aging on whatever doesn't.
- **Pending and posted as separate balances,** three dates per transaction, and fee estimates trued up by linked entries.
- **An importer per source** into one canonical external record, with raw files archived and hashed and completeness checked before import.
- **A deterministic matching engine** with strongest-key rules, group matching, named tolerances, banking-day windows and expected records.
- **Breaks as owned, aged records,** with cash breaks holding payouts and suspense used only for money that really arrived.
- **A daily and monthly close** that stores its evidence, and a per-owner balance file that sums to the bank to the cent.

## References

**Specifications**

- [FDIC: Recordkeeping for Custodial Accounts (proposed rule, October 2, 2024)](https://www.federalregister.gov/documents/2024/10/02/2024-22565/recordkeeping-for-custodial-accounts), per-owner records and reconciliation at least daily
- [FCA: PS25/12, Changes to the safeguarding regime for payments and e-money firms](https://www.fca.org.uk/publications/policy-statements/ps25-12-changes-safeguarding-regime-payments-and-e-money-firms), daily safeguarding reconciliation and the monthly return

**Reference**

- [SEPA for Corporates: The difference between camt.052, camt.053 and camt.054](https://www.sepaforcorporates.com/swift-for-corporates/the-difference-between-a-camt052-camt053-and-camt054/), intraday reports, prior-day statements and notifications; BAI2 record 16 and MT940 tag 61 populated in each bank's own flavour
- [TigerBeetle: Two-phase transfers](https://docs.tigerbeetle.com/coding/two-phase-transfers/), pending amounts reserved apart from posted balances, then posted, voided or expired

**In practice**

- [Stripe: Payout reconciliation](https://docs.stripe.com/payouts/reconciliation), balance transactions per payout, and manual payouts left to the merchant to reconcile
- [Stripe: Payout reconciliation report](https://docs.stripe.com/reports/payout-reconciliation), reporting categories, itemized exports with trace IDs, and report data that can lag the payout
- [Adyen: Transaction-level settlement reconciliation](https://docs.adyen.com/reporting/settlement-reconciliation/transaction-level/), PSP and merchant references, cost columns, and net credits less net debits equal to the batch payout
- [Adyen: Settlement reconciliation](https://docs.adyen.com/reporting/settlement-reconciliation/), batch-level and transaction-level reports
- [Modern Treasury: Defining reconciliation rules](https://docs.moderntreasury.com/payments/docs/defining-reconciliation-rules.md), expected payments, ordered rule conditions, and many-to-one and one-to-many matching
