+++
title = "Loan Servicing"
description = "Servicing a loan after it funds: boarding, the loan ledger, daily simple interest, payment application, payoff quotes, autopay, systems and transfers."
category = "Banking & Lending Industry"
order = 2451
part = "Servicing and Collections"
tags = ["banking", "lending", "loan-servicing", "payment-application", "daily-simple-interest", "servicing-transfers"]
+++

Origination decides whether a loan is made; servicing decides what it turns out to be. From the day a loan funds until the day its lien is released, a servicer bills it, takes the money, decides what each dollar paid off, answers the borrower's questions, quotes the payoff, reports the account to the bureaus and its owner, and works it when payments stop. A personal loan sees this for three to five years and a mortgage for up to thirty, often under several servicers and owners in turn. The arithmetic is simple and the consequences aren't: a payment applied in the wrong order or credited a day late changes the interest owed, the delinquency reported to the bureaus and, for a mortgage, whether a foreclosure clock starts.

This chapter covers the servicing systems and who runs them, boarding a loan from origination, the loan ledger, how payments are applied (with a worked daily simple interest example), partial payments and suspense, payoff quotes, autopay, deferrals and modifications, and servicing transfers. Mortgage servicing adds escrow, Regulation X's error and loss mitigation clocks and foreclosure, in [Mortgage Servicing, Escrow & Loss Mitigation](/books/banking-and-lending/mortgage-servicing). Reporting each account to the bureaus is [Furnishing Credit Data](/books/banking-and-lending/credit-reporting); what happens after a missed payment is [Collections & Recovery](/books/banking-and-lending/collections); and how the loss is reserved is [Credit Losses & CECL](/books/banking-and-lending/credit-losses-and-cecl). Card balances are serviced by the revolving engine in [Credit Cards as Credit](/books/banking-and-lending/credit-cards).

## How the Platforms Do It

As of October 2026, from vendors' pages and lenders' filings:

| Platform | Kind | What it services | What the public record says |
| --- | --- | --- | --- |
| **ICE MSP** | Mortgage servicing system of record | First liens and home equity on one system | ICE says MSP services "more active loans than any other mortgage servicing system," with a default suite for loss mitigation, collections, bankruptcy and foreclosure |
| **LoanPro** | API-first loan management platform | Installment, lines, cards, leases, BNPL, MCA, equipment | Claims over 25 million active loans and over 600 lenders, with separate payments, servicing and collections suites |
| **Peach Finance** (now SoFi Tech Credit Solutions) | API-first loan management | Installment, revolving, BNPL, cards | "Loan Replay" recalculates from a corrected date while keeping the original ledger; a compliance module for FDCPA, SCRA, TCPA and Reg F; claims $2 billion+ of active loans across 50+ lenders |
| **Canopy Servicing** | Loan management for commercial lenders | Secured, revolving, installment and hybrid products | Tracks every ledger change and can "retroactively process events" |
| **Nortridge** | Configurable loan servicing software | Consumer installment, auto, mortgage, student, payday, commercial | Configurable payment rules for ACH, card and check, and rules-based collections workflows |
| **Upstart** (in-house) | A lender's own platform | Its personal and auto loans (HELOCs excepted) | Services on its proprietary platform, which "manages all communication with borrowers, credit reporting agencies, and when necessary, collections agencies" |
| **Rocket** (Mr. Cooper) | Mortgage servicer and subservicer | $2.0 trillion of unpaid principal, 9.1 million loans at June 30, 2026 | Sold $53 billion of servicing rights in the second quarter of 2026 and kept the subservicing on about 80% of them |

Three patterns run through the list. **The ledger is the product.** Every modern platform sells the same promise: a backdated payment, a corrected rate or a reversed return replays the loan from the effective date and leaves the original entries in place, because that's the case every servicer meets daily. **Mortgages are their own world.** Escrow, Regulation X and investor reporting to Fannie Mae, Freddie Mac and Ginnie Mae make mortgage servicing systems a separate market from consumer and commercial loan management. **Owner, servicer and subservicer are separate roles.** Rocket keeping the subservicing on servicing rights it sold shows the split: the owner of the loan, the owner of the servicing right and the company that answers the phone can be three different parties, each in the data.

## Boarding

Boarding is the moment a loan becomes the servicer's: the origination system (or the prior servicer) hands over the terms, the schedule, the parties, the collateral and the documents, and the servicing system sets up the account. Everything later depends on getting it right once:

- **Terms as disclosed.** Principal, rate and rate type, accrual method, term, first due date, payment amount, late fee terms, prepayment terms and the APR, read from the same computation that produced the disclosure, not re-entered ([Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it) generates both from one function).
- **The schedule.** The first `payment_schedules` version with its installments. A servicer that recomputes the schedule at boarding with different rounding produces a last payment that disagrees with the note.
- **Parties and roles.** Borrower, co-borrower and guarantor on `account_parties`, with contact preferences and consents carried over (an autopay authorization, an E-SIGN consent, a phone consent for automated calls).
- **Collateral and lien.** The title, the recorded mortgage or the UCC filing, and who holds it.
- **Ownership and servicing.** The loan's owner (the lender's balance sheet, a forward-flow buyer, a trust) and the servicer, each effective-dated, because they change independently.
- **The reporting profile.** How the account will be furnished: which bureaus, which account type, from which month ([Furnishing Credit Data](/books/banking-and-lending/credit-reporting#how-to-build-it)).

Boarding is a reconciliation, not a copy. My rule: a loan boards only when its principal, first payment and schedule total match the origination record to the cent, and a mismatch is a boarding exception someone resolves before the first statement, not a ticket after the first complaint.

## The Loan Ledger

A loan's balance is not a column. It is the sum of what was disbursed, accrued and charged, less what was applied, and the servicer must be able to say, for any date, how much principal, interest, fees and escrow were owed and paid. The [core data model](/books/banking-and-lending/banking-business#the-core-data-model) gives the pieces: disbursements and charges as journal entries, interest as daily `interest_accruals`, fees as `fee_assessments`, each payment as a `loan_payments` row with its `payment_allocations`. The balances by bucket are computed from those rows.

The two accrual methods drive the ledger differently ([How Interest Accrues](/books/banking-and-lending/installment-loans#how-interest-accrues) covers the difference):

- **Scheduled interest** (most mortgages, many level-payment loans). Each installment's interest is fixed by the schedule; a payment on the 1st or the 14th pays the same interest, and lateness costs a late fee, not interest.
- **Daily simple interest** (most auto loans and many personal loans). Interest accrues each day on the principal outstanding, so the ledger is driven by the calendar and the payment's effective date decides how much of it is interest.

Three dates matter for every payment, and confusing them is the commonest servicing bug: when the money was **received**, the **effective date** it is credited as of (which stops interest under daily simple interest and decides lateness), and when it was **posted** to the ledger. Regulation Z requires a mortgage servicer to credit a periodic payment "as of the date of receipt," allowing a delay only where it causes no charge and no negative credit reporting (12 CFR 1026.36(c)(1)(i)); my rule is to apply the same standard to every loan, so a payment received Friday night is effective Friday whenever the batch runs.

## Payment Application

When a payment arrives, the servicer decides what it pays, in an order the contract, the investor and the law set. A typical order for a closed-end loan:

1. **Interest due** (accrued to the effective date under daily simple interest, or the installment's scheduled interest).
2. **Principal due** on the installment.
3. **Escrow** due, for mortgages that escrow.
4. **Fees** (late fees, returned payment fees), often last, so a fee never makes an otherwise full payment short.
5. **Anything left over:** extra principal, the next installment paid ahead, or unapplied funds, by the loan's policy.

Several rules constrain the order:

- **No fee pyramiding on mortgages.** A servicer may not charge a late fee on a payment that is otherwise a full periodic payment, received on time, merely because an earlier late fee is unpaid (12 CFR 1026.36(c)(2)). Applying a payment to the old fee first and then calling the installment short is the pattern the rule exists to stop.
- **Partial payments go to suspense, visibly.** A mortgage servicer that holds a payment less than a full periodic payment must keep it in a suspense or unapplied funds account, show the balance on the periodic statement, and apply the accumulated funds as a periodic payment once they cover one (1026.36(c)(1)(ii)); the statement must tell the borrower what to do for the funds to be applied (1026.41(d)(5)).
- **Card payments follow their own law.** Amounts above a card's minimum go to the highest-APR balance first (1026.53), which is the revolving engine in [Credit Cards as Credit](/books/banking-and-lending/credit-cards#balance-segments-and-aprs), not this one.
- **The investor's waterfall.** A loan sold to an investor may carry its servicing guide's order (for example, how curtailments and unapplied funds are treated), so the allocation rule is a property of the loan's owner and product, versioned.

The allocation is stored, never recomputed on read: `payment_allocations` records each bucket, the installment it satisfied and the rule version that decided it ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). When an earlier payment is reversed (an ACH return, a backdated correction), the servicer reverses the later allocations and replays them under the rules in force, as new rows, so the history the borrower saw on each statement stays intact ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).

## Worked Numbers: Daily Simple Interest Allocation

Continue the personal loan from [Personal & Installment Loans](/books/banking-and-lending/installment-loans#worked-numbers-an-amortization-schedule), now serviced as daily simple interest: 13.99% a year, actual/365, a $521.54 payment, and a principal balance of $14,918.39 after the first payment. Daily interest is 14,918.39 × 0.1399 / 365 = **$5.718035**. The note charges a $15 late fee when a payment is more than 15 days late and applies payments to accrued interest, then principal, then fees. These are my numbers, rounded to the cent at each allocation.

| Payment | Days since last | Amount | Interest | Principal | Late fee | Principal after |
| --- | --- | --- | --- | --- | --- | --- |
| 2 (10 days late) | 40 | $536.54 | $228.72 | $292.82 | $15.00 | $14,625.57 |
| 3 (5 days early) | 25 | $521.54 | $140.15 | $381.39 | n/a | $14,244.18 |
| 2 and 3 on time, for comparison | 30 and 30 | $521.54 each | $171.54, $167.52 | $350.00, $354.02 | n/a | $14,214.37 |

- **Lateness costs interest, not just a fee.** Ten extra days put $57.18 more interest in payment 2 than an on-time payment would carry, so $57.18 less principal was retired. The borrower paid the $15 fee separately, which is why the payment is $536.54; under the order above, a $521.54 payment would have left the fee owed and the installment paid.
- **Early pays back.** Payment 3, five days early, carries $27.37 less interest than an on-time one and retires more principal. After both, the principal is $29.81 higher than on the on-time path, because 65 days of interest accrued against 60.
- **The schedule doesn't move; the last payment does.** The due dates and payment amount stay as disclosed; the difference accumulates into the final payment (or a shorter or longer last period), which the servicer recomputes as it nears maturity.
- **The per diem is the payoff's engine.** After payment 3 the per diem is $5.46; a payoff ten days later is $14,244.18 + 10 × $5.459619 = **$14,298.78**.

The engine needs only three inputs per payment (effective date, amount, the rule) and the balances as of the prior payment, and it must produce the same rows every time it replays them. A backdated payment changes the day counts of every later payment, which is why a replay recomputes forward from the effective date rather than adjusting the latest row.

## Payoff Quotes

A payoff is a computed record with an expiry, not a balance read. For a daily simple interest loan it is principal plus interest accrued through the good-through date plus unpaid fees, with a per diem for each day after; for a precomputed loan it is the total of payments less the unearned interest rebate ([Prepayment](/books/banking-and-lending/installment-loans#prepayment)). For a loan secured by a dwelling, including a HELOC, the creditor, assignee or servicer must send an accurate payoff statement within a reasonable time and no more than seven business days after a written request (1026.36(c)(3)), and a Regulation X servicer must correct an inaccurate payoff balance within seven business days of a notice of error (Mortgage Servicing, Escrow & Loss Mitigation covers the error clock).

What goes wrong is predictable: a quote issued before a pending payment clears, a quote that omits a recoverable fee and then can't be honored, a payoff received a day after the good-through date and short by a per diem. My rule: the quote records the inputs it used (balances, pending items, fees, per diem), and the payoff posting compares what arrived with the quote it cites; a shortfall within a tolerance the policy sets is waived and recorded, never silently left as a balance that reports as open.

## Autopay and Payment Attempts

Most consumer loans are paid by recurring ACH debits from the borrower's bank account, authorized at origination or later. The rails and the return codes are the Payments volume's ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)); the servicer's side is:

- **An authorization per enrollment,** with its terms version and evidence, revocable by the borrower; a revoked authorization or an R07 or R10 return ends it ([Consumer Law: Regulation E](/books/payments/ach#consumer-law-regulation-e)).
- **The debit is a pending payment, not a paid one.** The servicer may credit it as of the debit date, but a return days later reverses the payment, replays the allocations, and may make the installment late after the fact, with a returned payment fee if the note and state law allow it.
- **Attempt limits.** For covered payday and high-cost installment loans, a second consecutive failed attempt ends the lender's right to try again without a new authorization (12 CFR 1041.8), recorded per attempt in `payment_transfer_attempts` ([Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it)); my default is to stop and contact the borrower after two consecutive NSF returns on any loan.
- **Debit amount changes.** When a preauthorized debit varies from the last one (a modified payment, an escrow change), Regulation E requires written notice of the amount and date at least 10 days before the debit, unless the borrower chose notice only for amounts outside an agreed range (12 CFR 1005.10(d)); a borrower may also stop a preauthorized debit by telling the bank at least three business days before it (1005.10(c)).

## Deferrals and Modifications

A borrower in temporary trouble may get a deferral (one or more payments moved to the end of the term) or a modification (new rate, term or payment). Both are a new `payment_schedules` version with a reason, never an edit to the old one. A deferral under daily simple interest keeps interest accruing over the deferred period, so the borrower should be told that the loan will cost more and the last payment will grow; Affirm's 10-K describes deferrals that extend the next due date with a total deferral period that "may not exceed three months." Card workouts and closed-end extensions have supervisory limits on how often they may reset delinquency ([Hardship Programs](/books/banking-and-lending/collections#hardship-programs) covers re-aging), and mortgage modifications run through Regulation X's loss mitigation procedures ([Loss Mitigation](/books/banking-and-lending/mortgage-servicing#loss-mitigation)). How a modification is disclosed to investors and in financial statements is in [Credit Losses & CECL](/books/banking-and-lending/credit-losses-and-cecl#modifications-and-vintage-disclosures).

## Servicing Transfers

Servicing moves when a lender sells servicing rights, when an owner changes subservicers, or when a fintech program changes servicing vendors. For mortgages, Regulation X sets the rules the borrower sees:

- **Notices.** The old servicer notifies the borrower at least 15 days before the transfer's effective date and the new servicer within 15 days after (or a combined notice at least 15 days before); up to 30 days after is allowed for a termination for cause, a servicer bankruptcy or certain FDIC and NCUA actions (12 CFR 1024.33(b)(3)).
- **The 60-day window.** For 60 days after the effective date, a payment sent on time to the old servicer "may not be treated as late for any purpose" (1024.33(c)(1)), so the old servicer must forward it and the new one must credit it as of its original receipt date.
- **Everything moves with it.** Pending loss mitigation applications, notices of error, escrow balances and disbursement schedules, autopay authorizations where the agreement allows, contact restrictions and bankruptcy flags. Failing to transfer servicing information accurately and timely is itself a covered error (1024.35(b)(8)).

For other loans the federal rule is thinner, but the engineering is the same: a transfer is a cutover with a reconciliation on both sides, and the new servicer boards the loan from the old servicer's ledger, not from the original note. My rule: the transferee rejects any loan whose balances by bucket, last payment, next due date and open cases don't reconcile, and a borrower's payment to either servicer during the window is credited as of its receipt date. [Core Modernization & Conversions](/books/banking-and-lending/core-modernization) covers the conversion weekend in full.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). A serviced loan is an `accounts` row with a `loans` row (`amortization` of `level_payment` or `daily_simple_interest`, `owner`, `servicer`), versioned `payment_schedules` with `schedule_installments`, and `loan_payments` with `payment_allocations`. [Personal & Installment Loans](/books/banking-and-lending/installment-loans#how-to-build-it) added `loan_disbursements`, `payoff_quotes` and `payment_transfer_attempts`; [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) added `measurement_basis` and `vintage`. This chapter adds boarding, versioned allocation rules, ownership and servicing history, autopay enrollments for loans, and transfers.

```sql
CREATE TABLE loan_boardings (                -- the handoff from origination or a prior servicer
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES loans (account_id),
  source               TEXT NOT NULL CHECK (source IN ('origination', 'servicing_transfer',
                         'conversion', 'purchase')),
  source_ref           TEXT NOT NULL,          -- the LOS loan number or the transfer file
  expected             JSONB NOT NULL,         -- principal, first payment, schedule total, by bucket
  boarded              JSONB NOT NULL,         -- the same figures as the servicing system computed them
  exceptions           TEXT[] NOT NULL DEFAULT '{}',
  status               TEXT NOT NULL CHECK (status IN ('pending', 'exception', 'boarded')),
  boarded_at           TIMESTAMPTZ
);

CREATE TABLE allocation_rules (              -- the payment waterfall, versioned
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  code                 TEXT NOT NULL,          -- e.g. 'DSI-STANDARD', 'INVESTOR-X-MORTGAGE'
  version              INT NOT NULL,
  bucket_order         TEXT[] NOT NULL,        -- {'interest','principal','escrow','fees'}
  excess_policy        TEXT NOT NULL CHECK (excess_policy IN ('principal', 'pay_ahead',
                         'unapplied', 'borrower_choice')),
  partial_policy       TEXT NOT NULL CHECK (partial_policy IN ('apply', 'suspense')),
  suspense_threshold   BIGINT,                 -- apply when unapplied funds reach a full payment
  source_citation      TEXT,                   -- note clause, investor guide section or regulation
  effective_from       DATE NOT NULL,
  effective_to         DATE,
  UNIQUE (code, version)
);

ALTER TABLE loans
  ADD COLUMN allocation_rule_code TEXT NOT NULL DEFAULT 'DSI-STANDARD',
  ADD COLUMN subservicer TEXT;               -- when the servicing right's owner outsources the work

CREATE TABLE loan_roles_history (            -- owner, servicer and subservicer over time
  account_id           UUID NOT NULL REFERENCES loans (account_id),
  role                 TEXT NOT NULL CHECK (role IN ('owner', 'servicer', 'subservicer')),
  party_ref            TEXT NOT NULL,          -- an investor, trust, institution or vendor ID
  valid_during         DATERANGE NOT NULL,
  source_ref           TEXT NOT NULL,          -- sale, transfer or agreement
  PRIMARY KEY (account_id, role, valid_during)
);

CREATE TABLE loan_autopay_enrollments (      -- recurring debits against a loan
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES loans (account_id),
  authorization_id     UUID NOT NULL REFERENCES ach_authorizations (id),  -- from the Payments volume
  amount_rule          TEXT NOT NULL CHECK (amount_rule IN ('scheduled_payment', 'fixed', 'minimum_due')),
  fixed_amount         BIGINT,
  debit_day_offset     SMALLINT NOT NULL DEFAULT 0,  -- days before the due date
  enrolled_at          TIMESTAMPTZ NOT NULL,
  ended_at             TIMESTAMPTZ,
  end_reason           TEXT CHECK (end_reason IN ('borrower_revoked', 'return_r07_r10',
                         'consecutive_failures', 'paid_off', 'transferred'))
);

CREATE TABLE servicing_transfers (           -- a cutover of many loans between servicers
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  from_servicer        TEXT NOT NULL,
  to_servicer          TEXT NOT NULL,
  effective_date       DATE NOT NULL,
  reason               TEXT NOT NULL CHECK (reason IN ('sale', 'subservicer_change',
                         'for_cause', 'servicer_bankruptcy', 'receivership', 'other')),
  misdirected_window_ends DATE NOT NULL,     -- 60 days after effective_date for mortgages
  status               TEXT NOT NULL CHECK (status IN ('planned', 'noticed', 'cut_over', 'reconciled'))
);

CREATE TABLE servicing_transfer_loans (
  transfer_id          UUID NOT NULL REFERENCES servicing_transfers (id),
  account_id           UUID NOT NULL REFERENCES loans (account_id),
  goodbye_notice_id    UUID REFERENCES disclosures (id),
  hello_notice_id      UUID REFERENCES disclosures (id),
  balances_at_cutover  JSONB NOT NULL,         -- by bucket, with next due date and open cases
  boarding_id          UUID REFERENCES loan_boardings (id),
  PRIMARY KEY (transfer_id, account_id)
);

-- Unapplied funds are an allocation bucket, so the suspense balance is a query.
CREATE VIEW loan_bucket_balances AS
SELECT lp.account_id, pa.bucket, SUM(pa.amount) AS applied
FROM payment_allocations pa
JOIN loan_payments lp ON lp.id = pa.loan_payment_id
WHERE lp.status = 'applied'                -- a reversed payment drops out; its replay is new rows
GROUP BY lp.account_id, pa.bucket;
```

How it runs:

1. **Boarding is a gate.** `loan.boarded` is emitted only when `loan_boardings.status = 'boarded'`, and no statement, autopay or bureau file runs for a loan that hasn't boarded.
2. **Each payment is effective-dated and applied by its loan's rule version.** The applier reads the rule in force on the effective date, the accrued interest to that date and the open installments, writes the allocations, and emits `loan_payment.applied`. A return or correction reverses the payment and every later one, then replays them in effective-date order with new rows ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
3. **Suspense is watched.** A nightly job applies unapplied funds that now cover a full periodic payment, under `suspense_threshold`, and the statement shows the remainder.
4. **Payoffs post against their quote.** The payoff cites the `payoff_quotes` row; a difference within policy is waived as a recorded adjustment, and the account closes, triggering lien release and a final bureau update.
5. **Transfers are batches with reconciliations.** Every loan in a `servicing_transfers` batch carries its cutover balances; the transferee boards each through `loan_boardings`, and until `misdirected_window_ends` a payment forwarded from the old servicer is credited as of its original receipt date.

## Auditing

Servicing is examined loan by loan, usually starting from a complaint, and the general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **Boarding against origination:** the expected and boarded figures, any exception and who cleared it.
- **Every payment's three dates** (received, effective, posted), its allocation by bucket and the rule version that applied.
- **Every reversal and replay,** with the event that caused it and the allocations before and after.
- **Suspense balances over time** and when each was applied.
- **Every payoff quote** with its inputs and good-through date, and the payoff posted against it.
- **Autopay enrollments, attempts and returns,** with the authorization each debit relied on.
- **Owner, servicer and subservicer history,** and every transfer with its notices and cutover balances.

## What This Means for the System You Build

- **Board loans by reconciliation,** not by copy, and refuse to service a loan that doesn't match its origination record.
- **Keep received, effective and posted dates separate** on every payment, and credit as of receipt.
- **Make the payment waterfall a versioned rule** attached to the loan's owner and product, and store which version applied.
- **Store allocations and replay on correction,** in effective-date order, as new rows.
- **Hold partial payments visibly in suspense** and apply them automatically when they cover a payment.
- **Issue payoffs as records** with inputs, a per diem and an expiry, and post payoffs against them.
- **Treat an ACH debit as pending until it can't be returned,** and stop after repeated failures.
- **Model owner, servicer and subservicer as effective-dated roles,** and run transfers as reconciled batches with the 60-day window enforced.

## References

**Law and regulation**

- [CFPB: Regulation Z § 1026.36, prohibited acts or practices](https://www.consumerfinance.gov/rules-policy/regulations/1026/36/), crediting payments as of receipt, partial payments in suspense, no late fee pyramiding, and payoff statements within seven business days
- [CFPB: Regulation Z § 1026.41, periodic statements for residential mortgage loans](https://www.consumerfinance.gov/rules-policy/regulations/1026/41/), the past payment breakdown, suspense balances and what the borrower must do to apply partial payments
- [CFPB: Regulation Z § 1026.53, allocation of payments](https://www.consumerfinance.gov/rules-policy/regulations/1026/53/), excess card payments to the highest-APR balance
- [CFPB: Regulation X § 1024.33, mortgage servicing transfers](https://www.consumerfinance.gov/rules-policy/regulations/1024/33/), the 15- and 30-day notices and the 60-day period in which a payment to the old servicer may not be treated as late
- [CFPB: Regulation X § 1024.35, error resolution procedures](https://www.consumerfinance.gov/rules-policy/regulations/1024/35/), misapplied payments, payoff errors and failed transfers of servicing information as covered errors
- [CFPB: Regulation E § 1005.10, preauthorized transfers](https://www.consumerfinance.gov/rules-policy/regulations/1005/10/), the 10-day notice for varying amounts, the range option and stop-payment three business days ahead
- [CFPB: 12 CFR § 1041.8, prohibited payment transfer attempts](https://www.consumerfinance.gov/rules-policy/regulations/1041/8/), the stop after two consecutive failed attempts

**Filings**

- [Rocket Companies: Second quarter 2026 results (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/0001805284/000180528426000082/rkt-063020268xkex991earnin.htm), servicing portfolio, MSR sales and retained subservicing
- [Upstart: Annual report on Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), the proprietary servicing platform and its role with bureaus and agencies
- [Affirm Holdings: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001820953/000162828026059279/afrm-20260630.htm), payment deferrals and the three-month limit

**Vendor documentation**

- [ICE: MSP mortgage servicing system](https://mortgagetech.ice.com/products/msp-mortgage-servicing-system), first liens and home equity on one system and the default suite
- [LoanPro](https://www.loanpro.io/), products supported, active loans and lenders, and the payments, servicing and collections suites
- [Peach Finance (SoFi Tech Credit Solutions)](https://www.peachfinance.com/), Loan Replay, asset classes, the compliance module and scale claims
- [Canopy Servicing](https://www.canopyservicing.com/), the ledger and retroactive event processing
- [Nortridge Loan System](https://www.nortridge.com/), loan types, configurable payment rules and collections workflows
