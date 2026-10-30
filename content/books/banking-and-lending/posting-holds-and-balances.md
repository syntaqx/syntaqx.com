+++
title = "Posting, Holds & Balances"
description = "Memo and hard posting, ledger, available and collected balances, holds and blocks, posting order and its litigation, end of day, and effective dates."
category = "Banking & Lending Industry"
order = 2409
part = "The Core"
tags = ["banking", "core-banking", "posting", "balances", "ledger"]
+++

Every dispute a customer has with a bank about money comes down to three questions the core answers: what was the balance, when did this transaction count, and in what order did things happen. A debit card purchase that was approved and then caused an overdraft, a deposit that showed up but couldn't be spent, a fee charged on a day the app said there was money: each is the visible end of a posting decision. This chapter is those decisions: the difference between memo and hard posting, the three balances a bank tracks and which one each rule reads, holds and blocks, the order a batch posts items in and the litigation that order produced, how the business day closes, and how a transaction's effective date can differ from the day it was recorded.

The general double-entry rules are in [Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger); [Core Banking Systems](/books/banking-and-lending/core-banking-systems) describes the core this all runs in. How long a deposit can be held is a Regulation CC question, owned by Funds Availability, and whether an overdraft is paid and charged is owned by Overdraft, NSF & Fees; this chapter is the posting machinery both depend on.

## How the Platforms Do It

Incumbent cores document posting behavior to their customers, not publicly; the public record is mostly developer documentation from vendors that publish theirs. As of October 2026:

| | Intraday posting | Holds | Blocks and legal holds | End of day |
| --- | --- | --- | --- | --- |
| **Jack Henry** (remote deposit APIs) | Memo post now and hard post from a posting file, or hard post in real time where the core allows | Funds availability set by the bank; "more flexibility" with real-time hard posting | Not public | Batch on the legacy cores; a real-time Jack Henry Ledger in closed beta |
| **Mambu** | Real-time posting | Card holds reduce available only, start `PENDING`, expire after 7 days by default (1 to 36,525, overridable per merchant category or per hold); holds placed by account ID never expire | Blocks reduce available, can exceed it, keep accruing interest on the total; seizure moves blocked funds out | Ordered daily job groups at midnight in the organization's time zone, with no downtime; hourly hold expiry |
| **Apache Fineract** | Read, write and batch instance modes | Not covered here | Not covered here | Close-of-business jobs on batch instances, which can run on several batch instances |

Three things carry across vendors. A hold is a reduction of available balance, never a ledger entry. Expiry is a scheduled job, so a hold is live until the job runs, not until its timestamp passes, unless reads enforce the timestamp themselves ([Expiry Is Enforced on Read](/docs/architecture/reservations-and-holds#expiry-is-enforced-on-read)). And the business day closes on a schedule the bank sets, with transactions after the cutoff belonging to the next day.

## Memo Posting and Hard Posting

A transaction reaches the core in one of two ways, and many reach it twice.

**Memo posting** records that something is going to happen. A debit card authorization, a mobile deposit accepted for review, an ACH entry received before its settlement date, a teller transaction in a batch core during the day: each changes what the customer can spend without yet changing the ledger. In a batch core, memo posts are the intraday view; the nightly batch replaces them with hard posts and drops the memo records.

**Hard posting** changes the ledger: a journal entry, a customer-visible transaction row, and the GL summary it rolls into. A hard post is final in the sense that it can only be reversed by another entry, never edited.

Most items memo post first and hard post later, and the two can differ: a card authorization for $50 clears for $58 with a tip; a mobile deposit is accepted for $1,200 and the bank adjusts it to $1,020 after review; an ACH debit memo posted on Monday settles Tuesday. Jack Henry's remote deposit documentation describes both designs and their cost. Memo posting "relies on a posting file" to hard post "the final amount of each check" and lets rejected items "expire"; real-time hard posting needs no posting file but must handle all five of its alert types and "Multiple Status Alert Events", and any amount adjustment becomes a correcting entry instead of a corrected memo.

The engineering rule is that a memo post and its hard post are linked records, not one record updated. The link is what lets the bank explain why the app showed $942 at noon and the statement shows $934, and what lets a reconciliation find memo posts that never hard posted (an authorization that expired without clearing) and hard posts that arrived without a memo (a force-posted card transaction, a check presented with no prior notice). The card-side mechanics of holds that change size are in [The Ledger for an Issuer](/books/payments/issuer-processing#the-ledger-for-an-issuer) and [Holds That Change Size](/docs/payments/payment-states#holds-that-change-size).

## Three Balances

A deposit account has one ledger and at least three balances computed from it, and each rule in banking reads a specific one.

- **Ledger balance** (sometimes "current" or "book" balance): posted credits minus posted debits. The CFPB describes it as the balance "that is not reduced by any holds from pending transactions." Interest accrues on it (Regulation DD requires interest on "the full amount of principal in an account for each day"), statements report it, and the GL proves against it.
- **Available balance:** what the customer can spend right now. The CFPB's description: "generally the ledger balance plus any deposits that have not yet cleared" that the bank has made available, reduced by "any pending (i.e., authorized but not yet settled) debits." In practice it is ledger balance, minus the part of recent deposits still on hold, minus pending debit holds, minus blocks. Authorization, ATM withdrawals and most overdraft decisions read it.
- **Collected balance:** ledger balance minus **float**, the deposited items not yet collected from the paying bank, whatever the availability policy says. GOLDPoint Systems' core documentation computes the average daily collected balance by "subtracting the Float Amount from the customer account balance for each day", then applies reserve and earnings credit rates to it. Commercial account analysis, earnings credits and some interest calculations read it ([Treasury Management](/books/banking-and-lending/treasury-management) covers account analysis).

A worked example. An account opens the day with a ledger balance of $500.00. The customer deposits a $1,200.00 check at a branch, and the bank's policy under Regulation CC makes the first $275.00 available the next business day and holds the rest (Funds Availability has the schedule). A debit card authorization for $80.00 is pending. A $150.00 legal block sits on the account.

| | Ledger | Collected | Available |
| --- | --- | --- | --- |
| Opening | 500.00 | 500.00 | 500.00 |
| Check deposit posted | +1,200.00 | +0.00 (float until collected) | +275.00 (next day), rest held |
| Pending card authorization | 0.00 | 0.00 | −80.00 |
| Legal block | 0.00 | 0.00 | −150.00 |
| **Next morning** | **1,700.00** | **500.00** | **545.00** |

Interest accrues on the ledger balance, with the check's $1,200.00 starting no later than the business day Regulation CC sets for it ([When Interest Starts and Stops](/books/banking-and-lending/interest-and-statements#when-interest-starts-and-stops)), so $1,700.00 once that day arrives. The customer can spend $545.00. The bank has actually collected $500.00. If the check comes back unpaid, the ledger drops by $1,200.00 and nothing that read the available balance was wrong.

Two rules keep the three straight:

- **Store the inputs, compute the balances.** Ledger from posted entries, holds and blocks as their own records, float from the deposit items and their collection dates. A cached `available_balance` column that each process decrements is the source of most balance bugs; if you cache, recompute from the inputs and compare.
- **Every decision records the balance it read.** An overdraft fee assessed against available balance, an authorization declined for insufficient funds, a hold released early: each stores which balance, its value and the timestamp. The APSN problem below is impossible to analyze without it.

Regulation DD adds a display rule: a balance shown through an automated system (an app, a website, an ATM) may not include "additional amounts that the institution may provide to cover an item", such as discretionary overdraft or a transfer from another account; a second balance that includes them may be shown if it says so (12 CFR 1030.11(c); Overdraft, NSF & Fees has the rest).

## Holds and Blocks

A **hold** reduces available balance for a reason and, usually, a time. A **block** (or freeze) reduces it until someone lifts it. The difference matters because a hold ends on its own and a block needs a decision.

| Kind | Placed by | Ends | Owned by |
| --- | --- | --- | --- |
| Card authorization | Card processor, on approval | Clearing, reversal, or expiry on the issuer's schedule | [The Ledger for an Issuer](/books/payments/issuer-processing#the-ledger-for-an-issuer) |
| Deposit availability | Core, from the bank's Reg CC policy | The availability date, or the item's return | Funds Availability |
| Risk or fraud | Fraud system or analyst | Review outcome | [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams) |
| Legal process | Operations, on a levy, garnishment or court order | Release, or seizure of the funds | [Levies, Garnishments & Legal Process](/books/banking-and-lending/legal-process) |
| Pledge | Lending, for a share-secured or CD-secured loan | Loan payoff | Credit Builders & Secured Products |
| Dispute or error claim | Case system, reversing provisional credit | Claim outcome | [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes) |

Mambu's documentation shows both mechanisms in one core. Card authorization holds start `PENDING`, move to `SETTLED`, `EXPIRED` or `REVERSED`, can be incremented or partially reversed, and "have no impact on the ledger or the total balance"; holds placed "directly on deposit accounts via account ID do not expire." Blocks make "the available balance ... the total balance minus the blocked amount", can be larger than the available balance, and leave interest accruing "based on the total balance, not on the available balance"; a seizure then moves blocked funds out as a transaction, optionally leaving some in a protected account for subsistence, which is the shape a garnishment with protected federal benefits takes.

The design rules:

- **One table, typed.** Every hold and block is a row with a kind, an amount, a reason, who placed it, the transaction or case it belongs to, and either an expiry or a release condition. Available balance sums the live rows.
- **Expiry is explicit.** A hold that "expires" leaves a record that it did, when, and by what job, and a later clearing posts against the ledger as a new debit ([Hold Lifetimes Are Policy](/docs/architecture/reservations-and-holds#hold-lifetimes-are-policy)).
- **Holds can exceed the balance.** A block for a $10,000 levy on a $3,000 account blocks $3,000 now and catches the next deposits; the record holds the target amount and the amount currently secured.
- **Release is authorized.** Lifting a legal or fraud block is a permissioned action (Mambu's is `BLOCK_AND_SEIZE_FUNDS`), recorded with who and why.

## Posting Order

A batch core posts a business day's items in an order it chooses, and for an account near zero the order decides how many items overdraw it. A real-time core mostly posts in arrival order, but still has to order items that arrive together (a settlement file, a batch of checks) and items with the same effective time.

A worked example. An account starts the night at $100.00. Four debits post in the batch: $90.00, $12.00, $8.00 and $5.00, total $115.00. Assume an illustrative $30 per-item overdraft fee.

| Order | Running balance after each item | Items that overdraw | Fees |
| --- | --- | --- | --- |
| Low to high: 5, 8, 12, 90 | 95.00, 87.00, 75.00, −15.00 | 1 | $30 |
| High to low: 90, 12, 8, 5 | 10.00, −2.00, −10.00, −15.00 | 3 | $90 |
| Chronological (say 12, 90, 5, 8) | 88.00, −2.00, −7.00, −15.00 | 3 | $90 |

Same items, same ending balance, three times the fees. "High to low" was defended as paying the most important item (the rent check) first; it was attacked as ordering items to maximize fees, and that attack produced some of the largest consumer class actions in banking:

- **The multidistrict overdraft litigation** alleged that dozens of large banks resequenced "debit card transactions each day from highest-to-lowest in dollar amount"; settlements approved by the court totaled over $1 billion, including $410 million from Bank of America with final approval in November 2011.
- **Gutierrez v. Wells Fargo** (9th Cir. No. 10-16959, decided December 26, 2012) shows the legal limit of the attack on a national bank. The district court had enjoined high-to-low posting and ordered $203 million in restitution; the Ninth Circuit held that posting order is "a federally authorized pricing decision", that the National Bank Act preempts California's unfair-practices claim against it, and vacated both, while letting claims based on misleading representations about posting proceed.

The lesson the industry took is that posting order is a disclosed product term with fee consequences, not an internal detail. The CFPB's Circular 2022-06 on unanticipated overdraft fees, which as of October 2026 still shows no withdrawal notice on its page, makes the same point from the other direction: fees can depend on "how the financial institution orders the transactions at the end of the banking day", and its example of **authorize positive, settle negative (APSN)** is a posting-order problem. A customer with $100 available makes a $50 debit card purchase that is authorized; a $120 ACH debit settles first and overdraws the account; then the $50 purchase settles into a negative balance and is charged a second fee, though it was authorized against money that was there. Whether a bank may charge that second fee is in Overdraft, NSF & Fees; whether it can even tell which transactions were authorized positive depends on the memo-to-hard-post link above.

Build posting order as configuration with a version, not code:

- **Order by class, then within class.** A common shape is credits first, then debits the bank has already guaranteed (authorized card transactions, in authorization order), then other electronic debits, then checks; within a class, by timestamp or amount. Whatever the order, it's a ranked list of rules ([Stages and Ordered Rules](/docs/architecture/rules-as-data#stages-and-ordered-rules)).
- **The version that posted a day is recorded** on the run, so a complaint about a past day is answered with the rule in force then.
- **Disclosure follows the rule.** The account agreement describes the order; a change to the order is a change in terms with notice ([Changing Terms on Existing Accounts](/books/banking-and-lending/product-configuration#changing-terms-on-existing-accounts)).

## End of Day and the Business Date

A core runs on a **business date** that is not the calendar date. Everything posted after the cutoff belongs to the next business day; weekends and holidays roll into the next one; the business date advances only when end of day completes. Mambu's documentation is explicit: "the accounting cutoff specifies the end of the accounting day", and transactions after it "will have the next day as their Journal Entry Date."

End of day is an ordered sequence, and the order is part of the product. Mambu publishes its own: account jobs (automated transfers, product setting updates), early accounting jobs, then loan and savings jobs (interest accrual and application, due fees and penalties, dormancy, arrears), account jobs again, then late accounting jobs including the accounting closure, with hold expiry hourly. A batch core's night typically looks like:

1. **Cut off** the business day; route new activity to the next date.
2. **Hard post** the day's items in posting order, replacing memo posts.
3. **Assess** item-driven fees (overdraft, returned item) against the balances that resulted.
4. **Accrue** interest for the day on the closing balances ([Accrual Is Daily](/books/banking-and-lending/interest-and-statements#accrual-is-daily)).
5. **Run date-driven events:** interest crediting, maturities and renewals, monthly fees, dormancy transitions, loan due dates and delinquency aging.
6. **Snapshot** every account's ledger, available and collected balances.
7. **Summarize** to the GL and run the subledger proofs ([The General Ledger and Its Subledgers](/books/banking-and-lending/core-banking-systems#the-general-ledger-and-its-subledgers)).
8. **Produce files out:** statements due, notices, extracts to the warehouse, positive pay and regulatory feeds.
9. **Roll** the business date.

Order matters in specific, testable ways. Fees assessed before accrual change the balance interest accrues on; accrual before posting misses the day's activity; a maturity processed before interest crediting renews a CD without its final interest. Two engineering rules follow:

- **Each step is idempotent per account and business date,** with a checkpoint, so a failure at step 5 for 40,000 accounts restarts those accounts at step 5 instead of rerunning the night ([Job Design](/docs/architecture/background-jobs#job-design)).
- **The business date is a row, not a clock.** Processes ask the core what day it is; a test can run end of day for February 29 without waiting for a leap year.

Real-time cores still run steps 3 to 9; what they drop is step 2, and with it the window when the ledger and available balances disagree by a whole day's activity.

## Effective Dates and Backdating

Every posted transaction carries at least two dates. Mambu's documentation defines both: the **value date** is "the date based on which assets either become available to the account owner ... or cease to be available", and drives interest, penalties and arrears; the **booking date** is when the entry is "posted to an account on the account servicer's accounting books." The Payments volume adds a third, when the system recorded it ([Three Dates per Entry](/books/payments/ledger-and-reconciliation#double-entry-at-provider-scale)).

The dates diverge whenever the bank corrects the past:

- **A deposit posted late.** A $5,000.00 branch deposit is keyed three days late. Regulation DD requires interest to begin accruing no later than the business day Regulation CC sets for that deposit, so the deposit is booked today with a value date three days ago, and the core recomputes interest for those three days: at 4.00% on an Actual/365 basis, $5,000.00 × 0.04 × 3 ÷ 365 = $1.64.
- **A bank error.** A debit posted to the wrong account is reversed on the wrong account and posted to the right one, both with the original value date, so neither customer's interest or fees reflect the error.
- **Reg E corrections.** An error resolved in the customer's favor is credited with interest as if it never happened ([Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes) owns the clocks).

A backdated entry changes every balance after its value date, which means every interest accrual, every fee that read a balance, and possibly every overdraft decision since. Cores handle it in one of two ways. Mambu's is to **repost the chain**: adjusting a past transaction makes Mambu "automatically adjust all the transactions until the adjusted one and then ... repost them", with interest "recalculated according to the adjusted transaction", and it warns that backdated adjustments "will affect the overall performance"; a reposted withdrawal that would now take the balance below zero can't be reposted. The other is to **post a single adjustment**: compute the interest and fee differences from the value date forward and post them as their own transactions today, leaving history untouched. My default is the second for anything beyond a short window. It keeps closed statements closed, makes the correction visible as a line the customer can read, and bounds the work.

Either way, the accounting period decides how far back an entry may book. Mambu requires a backdated transaction's booking date to be after the last accounting closure, and adjusting before it takes a separate `RECTIFY_ADJUSTMENT` permission. The general rule is in [Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed): value date in the past if the facts require it, booking date in the open period, always.

## How to Build It

These tables extend `transactions`, `holds`, `balance_snapshots` and `journal_entries` from [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). There, a `transactions` row is a hard post (it has a `journal_entry_id`), its `effective_date` is the value date, and `holds` already carry a reason, a source, an expiry and a release. What this chapter adds is the memo post as its own record, the booking date and posting sequence on each hard post, the inputs to the three balances, posting order as configuration, the core's business calendar, and a record of the balance each decision read. Card holds placed by an issuer processor keep their card-side detail in the Payments volume's authorization records ([Issuer Processing](/books/payments/issuer-processing#how-to-build-it)); here they are `holds` rows that point to them.

```sql
-- Intraday items not yet hard posted; a debit memo post carries a hold.
CREATE TABLE memo_posts (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('card_authorization', 'deposit_item',
                          'ach_pending', 'teller', 'instant_payment', 'other')),
  direction             TEXT NOT NULL CHECK (direction IN ('credit', 'debit')),
  amount                BIGINT NOT NULL CHECK (amount > 0),
  hold_id               UUID REFERENCES holds (id),
  source_ref            TEXT NOT NULL,      -- the authorization, deposit item or file entry
  business_date         DATE NOT NULL,
  received_at           TIMESTAMPTZ NOT NULL,
  state                 TEXT NOT NULL CHECK (state IN ('pending', 'posted', 'reversed', 'expired')),
  posted_transaction_id UUID REFERENCES transactions (id),
  ended_at              TIMESTAMPTZ,
  UNIQUE (account_id, kind, source_ref)
);

-- Hard posts: when they posted, in which run and position, and the memo post they replace.
ALTER TABLE transactions
  ADD COLUMN booking_date   DATE NOT NULL,          -- the business date it posted on; effective_date is the value date
  ADD COLUMN posting_class  TEXT NOT NULL,          -- 'credit', 'card_debit', 'ach_debit', 'check', 'fee', ...
  ADD COLUMN posting_run_id UUID,                   -- the batch or stream run that posted it
  ADD COLUMN posting_seq    INTEGER,                -- its position in that run
  ADD COLUMN memo_post_id   UUID REFERENCES memo_posts (id),
  ADD CONSTRAINT value_not_after_booking CHECK (effective_date <= booking_date);

-- Holds: a target amount and what is currently secured, disputes as a reason, and who acted.
ALTER TABLE holds
  DROP CONSTRAINT holds_reason_check,
  ADD CONSTRAINT holds_reason_check CHECK (reason IN ('card_authorization', 'deposit_availability',
    'legal_process', 'fraud', 'collateral', 'dispute', 'manual')),
  ADD COLUMN secured_amount    BIGINT NOT NULL,    -- what it reduces available balance by now; amount is the target
  ADD COLUMN release_condition TEXT,               -- for blocks with no expires_at
  ADD COLUMN placed_by         TEXT NOT NULL,
  ADD COLUMN released_by       TEXT,
  ADD CONSTRAINT secured_within_target CHECK (secured_amount BETWEEN 0 AND amount);

-- The inputs behind each day's three balances.
ALTER TABLE balance_snapshots
  ADD COLUMN float_amount BIGINT NOT NULL,         -- deposited items not yet collected
  ADD COLUMN holds_amount BIGINT NOT NULL;

-- Posting order as versioned configuration.
CREATE TABLE posting_order_rules (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id UUID NOT NULL REFERENCES institutions (id),
  version        INTEGER NOT NULL,
  rank           INTEGER NOT NULL,                 -- lower posts first
  posting_class  TEXT NOT NULL,
  within_class   TEXT NOT NULL CHECK (within_class IN ('authorized_at', 'received_at',
                   'amount_asc', 'amount_desc', 'check_number')),
  effective_from DATE NOT NULL,
  UNIQUE (institution_id, version, rank)
);

-- The core's own calendar, and the night's checkpoints.
CREATE TABLE business_days (
  institution_id        UUID NOT NULL REFERENCES institutions (id),
  business_date         DATE NOT NULL,
  state                 TEXT NOT NULL CHECK (state IN ('open', 'cut_off', 'closing', 'closed')),
  cutoff_at             TIMESTAMPTZ,
  closed_at             TIMESTAMPTZ,
  posting_rules_version INTEGER,
  PRIMARY KEY (institution_id, business_date)
);

CREATE TABLE eod_steps (
  institution_id UUID NOT NULL,
  business_date  DATE NOT NULL,
  step           TEXT NOT NULL,     -- 'hard_post', 'item_fees', 'accrue', 'date_events', 'snapshot', 'gl_proof', 'files', 'roll'
  account_id     UUID,              -- NULL for institution-wide steps
  completed_at   TIMESTAMPTZ NOT NULL,
  UNIQUE NULLS NOT DISTINCT (institution_id, business_date, step, account_id),
  FOREIGN KEY (institution_id, business_date) REFERENCES business_days (institution_id, business_date)
);

-- What each balance-dependent decision read.
CREATE TABLE balance_decisions (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  memo_post_id   UUID REFERENCES memo_posts (id),
  transaction_id UUID REFERENCES transactions (id),
  decision       TEXT NOT NULL,     -- 'authorize', 'decline_nsf', 'pay_into_overdraft', 'return_item', 'assess_fee'
  balance_kind   TEXT NOT NULL CHECK (balance_kind IN ('ledger', 'available', 'collected')),
  balance_value  BIGINT NOT NULL,
  decided_at     TIMESTAMPTZ NOT NULL
);
```

Available balance computed from its inputs, the query the authorization path and every channel should agree with. Deposit availability holds are rows like any other, so the uncollected part of a deposit reduces available balance through the same sum, and the expiry test enforces expiry on read whether or not the expiry job has run:

```sql
SELECT a.id,
       l.ledger,
       h.held,
       l.ledger - h.held AS available
FROM accounts a
CROSS JOIN LATERAL (
  SELECT COALESCE(SUM(CASE t.direction WHEN 'credit' THEN t.amount ELSE -t.amount END), 0) AS ledger
  FROM transactions t
  WHERE t.account_id = a.id
) l
CROSS JOIN LATERAL (
  SELECT COALESCE(SUM(x.secured_amount), 0) AS held
  FROM holds x
  WHERE x.account_id = a.id
    AND x.released_at IS NULL
    AND (x.expires_at IS NULL OR x.expires_at > NOW())   -- expiry enforced on read
) h
WHERE a.id = :account_id;
```

How it runs:

1. **A memo post creates a `memo_posts` row,** and for a debit a hold; the hard post creates the `transactions` row with `memo_post_id` and its journal entry, marks the memo post `posted` and releases the hold as `settled`, in one database transaction that also writes the outbox event ([Publishing Events With the Write](/books/payments/architecture-at-scale#publishing-events-with-the-write)).
2. **The night's hard posting** selects the day's items, sorts them by the `posting_order_rules` version recorded on `business_days`, and writes `posting_seq`, so the order of any past night is reproducible.
3. **Every overdraft, decline and fee decision** writes `balance_decisions` with the balance it read.
4. **A backdated correction** posts today (`booking_date`) with a past `effective_date`, reversing the wrong entry by `reverses_id`, and an adjustment job posts the interest and fee differences as their own linked transactions.
5. **`eod_steps` checkpoints** make the night restartable per account and step; the business date rolls only when every step has completed for every account.

## Auditing

Posting records answer complaints, Reg E claims, overdraft litigation and examiner sampling, and the question is always the same: what did the bank know and do, in what order, on that day. Beyond [Audit Trails](/docs/architecture/audit-trails):

- **Every hard post links to its memo post,** and every memo post ends as posted, reversed or expired, with the time and the job or person.
- **The posting order in force for any past business date** is recoverable from the run, with the sequence each item posted in.
- **Every balance-dependent decision** stores the balance kind and value it read, so an APSN or overdraft complaint is answered with data, not reconstruction.
- **Every hold and block** has who placed it, why, its source, and who released it; legal and fraud releases carry their authorization.
- **Backdated entries** show value date, booking date and recorded time, the reason, the approver, and the adjustment entries they caused.
- **End-of-day evidence:** each business date's steps, completion times, the snapshots and the GL proofs, retained as they were.

## What This Means for the System You Build

- **Memo and hard posts are separate, linked records,** and a reconciliation finds memo posts that never posted and hard posts that never had a memo.
- **Ledger, available and collected balances are computed from stored inputs,** never maintained by decrementing a cached number, and each rule names the balance it reads.
- **Holds and blocks live in one typed table** with sources, expiry or release conditions, and permissioned release; expiry is enforced on read.
- **Posting order is versioned, disclosed configuration,** recorded on each night's run, because it decides fees and has been litigated.
- **The business date is data,** end of day is an ordered, checkpointed, idempotent sequence, and its order is tested.
- **Corrections carry a value date and a booking date,** book into the open period, and post their interest and fee consequences as visible adjustments.

## References

**Law and regulation**

- [12 CFR 1030.7: Payment of interest (Regulation DD)](https://www.consumerfinance.gov/rules-policy/regulations/1030/7/), interest on the full principal each day, and accrual beginning by the Regulation CC business day
- [12 CFR 1030.11: Additional disclosure requirements for overdraft services (Regulation DD)](https://www.consumerfinance.gov/rules-policy/regulations/1030/11/), balances shown through automated systems exclude amounts the institution may provide to cover an item
- [12 CFR 229.10: Next-day availability (Regulation CC)](https://www.law.cornell.edu/cfr/text/12/229.10), the first $275 of check deposits and next-day availability for cash and electronic payments

**Regulators and guidance**

- [CFPB Circular 2022-06: Unanticipated overdraft fee assessment practices](https://www.consumerfinance.gov/compliance/circulars/consumer-financial-protection-circular-2022-06-unanticipated-overdraft-fee-assessment-practices/), ledger and available balance, the APSN example, and fees that depend on posting order

**Court records**

- [Orrick InfoBytes: Ninth Circuit vacates restitution order in overdraft ordering case (Gutierrez v. Wells Fargo)](https://infobytes.orrick.com/2013-01-04/ninth-circuit-vacates-restitution-order-overdraft-ordering-case-allows-state-fraud-claims-proceed/), posting order as a federally authorized pricing decision, the vacated $203 million restitution and the surviving misrepresentation claims
- [Lieff Cabraser: Bank overdraft fee cases](https://lieffcabraser.com/consumer/bank-overdraft), highest-to-lowest resequencing claims, settlements over $1 billion and the $410 million Bank of America settlement approved November 2011

**Vendor documentation**

- [Jack Henry: Remote deposit posting options](https://api.payments.jackhenry.com/docs/smart-alerts/APIReference/Posting/), memo posting with a posting file against real-time hard posting, and funds availability flexibility
- [Mambu: Authorization holds](https://docs.mambu.com/docs/authorization-holds/), hold states, default and per-merchant expiry, the hourly expiration job, and non-expiring account holds
- [Mambu: Blocking funds in deposit accounts](https://docs.mambu.com/docs/blocking-funds-in-deposit-accounts/), blocks against available balance, interest on the total balance, seizure and protected accounts
- [Mambu: End of day processing and cron jobs](https://docs.mambu.com/docs/automatic-end-of-day-actions/), the ordered daily jobs, the accounting cutoff and no downtime
- [Mambu: Booking date vs value date](https://docs.mambu.com/docs/booking-date-vs-value-date/), the two dates, backdating after accounting closure and the rectify permission
- [Mambu: Adjusting transactions](https://docs.mambu.com/docs/adjusting-transactions/), reposting later transactions, interest recalculation and the cost of backdated adjustments
- [Apache Fineract: Platform documentation](https://fineract.apache.org/docs/current/), batch instances and close-of-business jobs
- [GOLDPoint Systems: Analysis statement fields](https://secure.goldpointsystems.com/gpsdocs/deposits/DepositCIMGOLD/analysisstatementprevdaicaa.asp), float as uncollected funds and the average daily collected balance
