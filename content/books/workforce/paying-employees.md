+++
title = "Direct Deposit, Pay Cards & Checks"
nav_title = "Paying Employees"
description = "How net pay reaches workers: direct deposit and splits, Reg E's compulsory use rule, payroll cards, paper checks, instant pay and unclaimed wages."
category = "Workforce Industry"
order = 2623
part = "Moving the Money"
tags = ["payroll", "direct-deposit", "payroll-cards", "regulation-e", "checks", "unclaimed-property"]
+++

Net pay is the one number every worker checks, and it reaches them in one of four ways: an ACH credit to a bank account of their choosing, a credit to a payroll card account, a paper check, or, increasingly, an instant push to a debit card or wallet. Each comes with its own law. Federal wage law says wages are paid "in cash or negotiable instrument payable at par" and must reach the worker "free and clear"; Regulation E forbids requiring a worker to open an account at a particular institution as a condition of employment, which rules out mandatory payroll cards; payroll card accounts carry their own Regulation E disclosures; states add consent requirements and fee bans; and a paycheck nobody cashes eventually belongs to a state's unclaimed property program. The payroll system's job is to turn each statement's net pay into the right credits on the check date, keep the destinations safe from fraud, and keep track of every dollar that didn't arrive.

This chapter covers net pay from the payroll side: direct deposit and how splits work, account verification and changes, Regulation E's compulsory use rule, payroll cards under Regulation E and state law, paper checks and positive pay, instant and early pay as payroll hooks, and uncashed paychecks as unclaimed wages. The ACH rail is [ACH & Bank Transfers](/books/payments/ach); card programs as an issuer runs them are [Card Issuing](/books/payments/card-issuing); earned wage access is [Banking & Lending](/books/banking-and-lending/earned-wage-access); escheat mechanics are [Dormancy, Escheat & Closing Accounts](/books/banking-and-lending/dormancy-and-escheat). Payday frequency, pay statement contents and final pay deadlines are [Pay Frequency, Pay Statements & Final Pay](/books/workforce/pay-frequency-statements-and-final-pay).

## How the Platforms Do It

What payroll platforms publish about paying workers, as of November 2026:

| Provider | Methods | What it publishes |
| --- | --- | --- |
| **Check** | Direct deposit, paper checks, manual payments | Net pay "can be split across up to 7 accounts"; "amount-based, percentage-based, and mixed" splits, with amounts deducted first and percentages applied to the remainder, and a lowest-priority remainder account; destinations are "locked-in" at payroll approval, so changes after approval apply to the next cycle; an employee's raw bank account gets no upfront validation and stays `validation_pending` until a direct deposit succeeds; a failed credit can be retried to a new account or refunded to the employer and marked `MANUAL` |
| **Gusto Embedded** | Direct deposit, check | Splits `split_by` "Amount" (cents) or "Percentage"; "Percentages have to add up to 100.0%"; for amount splits, "The amount for the last account has to be given as `null` in order to receive the remainder" |
| **QuickBooks Payroll** | Direct deposit | Next-day and same-day direct deposit by plan |
| **Square Payroll** | Direct deposit, Cash App | "Team members get their paycheck instantly if they use Cash App" |
| **Zeal** | Direct deposit, employee checks | An employee check endpoint; funds settled on the pay date |

The shared design: **net pay is a list of destinations with priorities, fixed at approval.** Each destination takes a fixed amount or a percentage, the last takes the remainder, and the list that applies to a run is the one in force when the run was approved, so a change mid-run can't redirect money already calculated. **Verification is often after the fact.** Check doesn't validate a worker's account before the first deposit; the first successful credit validates it, and a return disables it. That is a cost tradeoff (a prenote delays the first paycheck) with a fraud consequence: an account a criminal adds is just as unvalidated as a real one. My rule is that a new or changed worker account is validated by its first credit or by a prenote, and is held to stricter controls for its first payroll either way.

## Direct Deposit as Payroll Does It

A direct deposit is an ACH credit with the PPD standard entry class, sent by the provider (as originator, or through its bank as a third-party sender) to the worker's bank to settle on the check date. Four rules shape it:

- **The employer can require direct deposit, but not the bank.** Regulation E says "No financial institution or other person may require a consumer to establish an account for receipt of electronic fund transfers with a particular institution as a condition of employment." The CFPB's 2013 bulletin draws the line: an employer may require direct deposit "if the employee is allowed to choose the institution that will receive the direct deposit," or may give employees the choice of an employer-designated institution or "another means, such as by check or cash."
- **State law can require consent.** New York's Labor Law says "No employer shall without the advance written consent of any employee directly pay or deposit the net wage or salary of such employee in a bank or other financial institution," with exemptions for some well-paid executive, administrative and professional employees. Where a state requires consent, the consent is a document with a date, and direct deposit without it is a wage payment violation even though the money arrived.
- **Wages must arrive whole.** Federal law requires wages "in cash or negotiable instrument payable at par," and the DOL's rule is that wages aren't paid unless "paid finally and unconditionally or 'free and clear.'" A payment method that costs the worker money to reach their wages can cut into the minimum wage, which is why fee-free access matters most for the lowest-paid workers.
- **The credit settles on the check date.** Files go to the bank the banking day before, and the credits are available on the settlement date; [ACH & Bank Transfers](/books/payments/ach#timing) covers the windows and [Funding a Payroll](/books/workforce/funding-a-payroll) covers why the provider sends credits only when the employer's funding allows it.

### Splits, Worked

A worker's distributions are ordered rules over net pay. An invented worker's net pay of $1,843.27 with three destinations, applied in Check's documented order (fixed amounts first, then percentages of what remains, then the remainder):

| Priority | Destination | Rule | Amount |
| --- | --- | --- | --- |
| 1 | Savings at bank A | $200.00 fixed | $200.00 |
| 2 | Checking at bank B | 10% of the remaining $1,643.27 | $164.33 |
| 3 | Checking at bank C | Remainder | $1,478.94 |
| | | **Total** | **$1,843.27** |

The edge cases are where engines differ, so the rules have to be explicit and tested: a fixed amount larger than net pay (a short week) takes everything and later destinations get zero, never a negative; percentages are applied to the post-fixed remainder in one engine and to the whole net in another, so a migration between providers can change where money goes; rounding falls on the remainder account, which is why there must be exactly one; and a destination whose account was disabled by a return drops out, with its share going to the remainder (Check moves the split to a deactivated state when its account is disabled). If no valid destination remains, the worker is paid by check or the payment is held as an obligation to the worker, never silently dropped.

### Verification and Account Changes

A worker's account can be verified three ways before money moves: an instant verification through a bank-data provider, a prenote (a zero-dollar entry, with three banking days of waiting before live entries), or micro-entries ([Validating the Account](/books/payments/ach#validating-the-account)). Each costs time against the first paycheck, which is why many payroll providers, like Check, let the first deposit be the test and handle the return.

Account changes are the larger risk. A change submitted on Wednesday for a Friday payday that redirects the whole paycheck is the signature of direct deposit diversion, the fraud in which someone who has phished a worker's credentials or impersonated them to HR changes the destination. Three payroll-side controls work: lock destinations at approval (Check's model) so a change can't affect a run in flight; notify the worker at the old destination's contact details when a change is made; and hold or split a first payroll to a changed account. [Payroll Fraud & Security](/books/workforce/payroll-fraud-and-security) covers the fraud and its controls in depth.

## Payroll Cards Under Regulation E

A payroll card account is a prepaid account "established directly or indirectly through an employer" to which wages are transferred on a recurring basis, in the CFPB's words, and Regulation E has covered it since 2006 "whether... operated or managed by the employer, a third party payroll processor, a depository institution or any other person." The prepaid rule (12 CFR 1005.18) adds payroll-specific requirements on top of the general prepaid ones ([Prepaid](/books/payments/card-issuing#prepaid)):

- **The worker can say no.** The pre-acquisition short form for a payroll card must state "You do not have to accept this payroll card. Ask your employer about other ways to receive your wages," above the fee lines. The CFPB's bulletin states the principle: Regulation E "prohibits employers from mandating that employees receive wages only on a payroll card of the employer's choosing," while "An employer may, however, offer employees the choice of receiving their wages on a payroll card or receiving it by some other means."
- **History instead of statements.** The issuer can skip periodic statements if it provides the balance by phone, at least 12 months of electronic history, and 24 months of written history on request.
- **Full protection from day one.** The prepaid rule's exception for accounts whose identity verification isn't complete applies only to prepaid accounts "that are not payroll card accounts or government benefit accounts," so a payroll card has error resolution and liability limits whether or not the issuer finished verifying the worker.
- **Error windows tied to history.** An error notice is timely within 60 days of the worker electronically accessing the history or receiving a written history showing it, or the issuer may accept notices within 120 days after the transfer.

### State Pay Card Laws

States add consent and fee rules, and the CFPB notes that EFTA preempts state laws only where they are inconsistent, and a state law that "affords consumers greater protections" isn't. New York's pay card regulations (12 NYCRR Part 192) are the strictest example in force: after a challenge, the Appellate Division upheld them in *Reardon v. Global Cash Card, Inc.* (No. 526973, January 9, 2020), and they require written notice and the employee's written consent, prohibit charging employees fees, and require "30 days' notice before any change in paycard terms and conditions," per the payroll association's summary of the decision. Other states set their own rules on consent, free withdrawals and alternatives.
<!-- source-gap: wf-paycard-state-laws | secondary | New York Part 192 requirements (notice, consent, fee ban, ATM access, revocation) and other states' pay card statutes (California Labor Code 212 and 213, Illinois 820 ILCS 115/14.5) | closes with: the text of 12 NYCRR Part 192 from the NY DOL or an official compilation, and the California and Illinois statutes from the legislatures' sites | checked: 2026-11-09 -->

For the payroll system, a pay card is a destination like a bank account, plus a consent record: the disclosure version the worker saw, the date they chose the card, the alternatives offered, and any revocation, which must move the worker to another method by the next payroll the state's rule requires. The card program itself (the issuing bank, the program manager, the fees) is a Payments relationship ([Card Issuing](/books/payments/card-issuing#prepaid)).

## Paper Checks and Positive Pay

Checks remain the fallback for workers without accounts, for final pay that must be handed over at termination, and for corrections. Two models:

- **Drawn on the provider's account.** The provider prints and mails or ships checks drawn on its own disbursement account, funded by the client debit; the provider clears them and owns positive pay.
- **Drawn on the employer's account.** The provider prints checks (or the employer hand-writes a manual check) drawn on the employer's own bank account; the money never enters the provider's funds, and the run records the check as paid outside the debit. Manual checks still need statement lines and taxes ([Manual Checks](/books/workforce/retro-pay-voids-and-corrections#manual-checks)).

**Positive pay** is the control against altered and counterfeit checks: the account holder sends its bank a file of every check issued (number, date, amount and, where supported, payee), and the bank flags any presented check that doesn't match for a pay or return decision. It is the account holder's service, so for checks drawn on the employer's account the provider can only supply the issue file. [Vendor Payouts](/books/payments/vendor-payouts#checks-are-still-here) covers the issuer side and Banking & Lending covers the bank's versions ([Payables Fraud Controls](/books/banking-and-lending/treasury-management#payables-fraud-controls)). A payroll check is voided and reissued, never edited: a stop payment on the original, a reversal of its statement, and a new check, each a record ([Voids, Reversals and Adjustments](/books/workforce/retro-pay-voids-and-corrections#voids-reversals-and-adjustments)).

## Instant and Early Pay

Workers want money sooner than the check date, and payroll has three hooks for it:

- **Faster settlement of the regular paycheck.** Next-day and same-day direct deposit move the approval deadline closer to the check date ([Funding a Payroll](/books/workforce/funding-a-payroll#debit-timing-four-day-to-same-day)); the worker still gets paid on payday.
- **Instant push to a wallet or card.** Square pays workers "instantly if they use Cash App," which works because the provider and the wallet are the same company; elsewhere it is a push-to-card or real-time payment from a funded balance, final on arrival ([The Alternatives](/books/payments/ach#the-alternatives)).
- **Pay before payday: earned wage access.** A provider advances wages already earned and recovers them from the paycheck, either through an employer integration that adds a deduction or a split deposit, or directly with the worker. Banking & Lending owns the product and its law; the payroll side is a deduction or a distribution to an account the provider controls, delivered by the processor's cutoff ([Payroll Integration](/books/banking-and-lending/earned-wage-access#payroll-integration)). A split deposit to repay an advance is a distribution like any other, and it ranks after garnishments in the order of deductions ([Deduction Ordering](/books/workforce/deductions#deduction-ordering)).

## Uncashed Paychecks and Unclaimed Wages

A paycheck nobody cashes is still wages owed. The employer (or the provider, for checks drawn on its account) holds the money, and after a dormancy period the state's unclaimed property law requires due diligence to reach the worker, then a report and delivery to the state. Payroll is a named category: the unclaimed property administrators' association lists "Uncashed dividends or payroll checks" among the common forms. Which state gets it is the worker's last known address, under *Texas v. New Jersey*; Banking & Lending covers the priority rules, the due diligence notices and the reports ([Which State Gets It](/books/banking-and-lending/dormancy-and-escheat#which-state-gets-it)). Payroll's part is the record: every outstanding check aging from its issue date, every returned direct deposit that couldn't be re-sent, and every pay card balance left after a worker leaves, each with the worker's last known address on the date it became payable.
<!-- source-gap: wf-wage-dormancy | missing | State dormancy periods for wages and payroll checks (commonly one year) and report dates | closes with: state unclaimed property statutes or controller holder guides listing the wage dormancy period | checked: 2026-11-09 -->

### Worked Numbers: An Outstanding Paycheck

An invented worker in a state with a one-year wage dormancy period (an illustration; periods vary by state) is paid $612.40 by check on Friday, June 12, 2026, leaves the job a week later and never cashes it.

| Date | Event | Record |
| --- | --- | --- |
| Fri Jun 12, 2026 | Check issued, drawn on the provider's disbursement account | `paychecks` row `issued`; positive pay file sent; obligation to the worker open |
| Mid-December 2026 | 180 days outstanding; the program's stale-check policy cancels it | Check `stopped`; the $612.40 stays an obligation, not income |
| Spring 2027 | Due diligence letter to the last known address, on the state's schedule | `unclaimed_wages` row `due_diligence_sent` |
| After Jun 12, 2027 | Dormancy runs from the date payable | Status `presumed_abandoned` |
| The state's report date | Reported and remitted with the worker's name, last known address and amount | `reported`; the worker now claims from the state |

Two errors are common. Treating a canceled check as a refund to the employer ends the obligation on the books but not in law; the worker is still owed and the state still expects the report. And a reissued check must close the original and carry its history, or the same wages escheat twice.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `pay_distributions` already holds a worker's destinations with `split_kind` and `priority`; this chapter adds prenotes, pay card consents, the paychecks a run issues, the positive pay files for them, and the unclaimed wage record.

```sql
-- Destinations in force at approval are the ones a run uses.
ALTER TABLE pay_distributions
  ADD COLUMN locked_by_run_id UUID REFERENCES pay_runs (id),   -- last run that read this row
  ADD COLUMN change_hold_until DATE;          -- a changed account's first-payroll hold

-- A prenote or other pre-credit verification of a worker's account.
CREATE TABLE prenotes (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  bank_account_id     UUID NOT NULL REFERENCES bank_accounts (id),
  method              TEXT NOT NULL CHECK (method IN ('prenote', 'micro_entries', 'instant',
                        'first_credit')),
  money_movement_id   UUID REFERENCES money_movements (id),
  sent_on             DATE,
  clears_on           DATE,                  -- sent + 3 banking days for a prenote
  result              TEXT CHECK (result IN ('pending', 'cleared', 'returned', 'noc')),
  return_code         TEXT
);

-- A worker's choice of a payroll card, with what they were shown.
CREATE TABLE pay_card_consents (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  card_program        TEXT NOT NULL,         -- the program; the card account lives at the issuer
  disclosure_document_id UUID NOT NULL REFERENCES documents (id),  -- short and long form version
  alternatives_offered TEXT[] NOT NULL,      -- {'direct_deposit', 'check'}
  state_rule          TEXT,                  -- e.g. 'NY 12 NYCRR 192'
  consented_at        TIMESTAMPTZ NOT NULL,
  revoked_at          TIMESTAMPTZ,
  effective_by_run_id UUID REFERENCES pay_runs (id)   -- the first run paid another way after revocation
);

-- A paper check, from issue to clearing, stop, or escheat.
CREATE TABLE paychecks (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_statement_id    UUID NOT NULL REFERENCES pay_statements (id),
  drawn_on            TEXT NOT NULL CHECK (drawn_on IN ('provider', 'employer')),
  account_ref         TEXT NOT NULL,         -- the disbursement account
  check_number        BIGINT NOT NULL,
  amount              BIGINT NOT NULL,
  issued_on           DATE NOT NULL,
  payee_name          TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('issued', 'mailed', 'cleared', 'stopped',
                        'voided', 'reissued', 'escheat_pending', 'escheated')),
  reissued_as_id      UUID REFERENCES paychecks (id),
  cleared_on          DATE,
  UNIQUE (account_ref, check_number)
);

-- The issue file each disbursement account's bank matches against.
CREATE TABLE positive_pay_files (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_ref         TEXT NOT NULL,
  file_date           DATE NOT NULL,
  check_ids           UUID[] NOT NULL,
  includes_payee      BOOLEAN NOT NULL,
  sent_at             TIMESTAMPTZ,
  bank_ack            TEXT,
  exceptions          JSONB NOT NULL DEFAULT '[]'   -- presented items that didn't match, and decisions
);

-- Wages owed to a worker that didn't arrive: the escheat clock.
CREATE TABLE unclaimed_wages (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  source              TEXT NOT NULL CHECK (source IN ('outstanding_check', 'returned_credit',
                        'pay_card_balance')),
  paycheck_id         UUID REFERENCES paychecks (id),
  money_movement_id   UUID REFERENCES money_movements (id),
  amount              BIGINT NOT NULL,
  payable_on          DATE NOT NULL,         -- the dormancy clock starts here
  last_known_address  JSONB NOT NULL,        -- from person_addresses as of payable_on
  owner_state         TEXT NOT NULL,         -- decides which state's rules apply
  status              TEXT NOT NULL CHECK (status IN ('outstanding', 'due_diligence_sent',
                        'claimed', 'presumed_abandoned', 'reported', 'remitted')),
  report_id           TEXT                   -- the state report it went in
);
```

Design notes:

- **Resolve distributions at approval, once.** The calculation writes one net pay `money_movements` row per destination, keyed to the statement and distribution, from the rows in force at approval; `locked_by_run_id` says which run read them ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **Exactly one remainder destination,** enforced, so rounding and a short week always have somewhere to go.
- **A consent is a document plus a date.** Direct deposit consent where a state requires it and pay card consent always point at the version shown, so the employer can prove the worker chose.
- **Map to the neighbors.** A net pay credit is Payments' `ach_entries` row and its return is `ach_returns` ([How to Build It](/books/payments/ach#how-to-build-it)); a pay card is a Payments card account the worker owns; an escheated wage is the payroll-side twin of Banking & Lending's dormancy records ([How to Build It](/books/banking-and-lending/dormancy-and-escheat#how-to-build-it)).
- **Unclaimed wages start at the payable date** with the address as of that date from `person_addresses`, because both decide the state and the clock ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).

## Auditing

- **Every distribution rule as of each run,** and the credits it produced, so "where did my pay go" is a query.
- **Every account change** with who made it, through what channel, the notice sent and any hold, since these records decide a diversion claim.
- **Direct deposit and pay card consents** with the disclosure versions and revocations.
- **Every check** from issue to clearing, stop, void, reissue or escheat, with the positive pay file that covered it and every exception decision.
- **Unclaimed wages** with due diligence letters, the state, the report and the remittance.

## What This Means for the System You Build

- **Let workers choose where wages go;** require direct deposit only to an account of the worker's choosing, and capture consent where a state requires it.
- **Treat a payroll card as one option with a consent record,** never the only way to be paid, and move a worker off it promptly when they revoke.
- **Apply splits in a stated order** with exactly one remainder, and lock destinations at approval.
- **Control account changes** with notices, holds on first payrolls to new accounts, and the fraud chapter's signals.
- **Send positive pay for every check drawn on an account you control,** and void and reissue rather than edit.
- **Keep every undelivered dollar as an obligation to the worker** until it is paid, claimed or reported to the right state.

## References

**Law and regulation**

- [12 CFR 1005.10](https://www.law.cornell.edu/cfr/text/12/1005.10), Regulation E's compulsory use rule for employment and government benefits, and notice of preauthorized transfers
- [12 CFR 1005.18](https://www.law.cornell.edu/cfr/text/12/1005.18), payroll card accounts: the short form statement on other ways to be paid, the periodic statement alternative, error resolution timing and the unverified account exception
- [29 CFR 531.27](https://www.law.cornell.edu/cfr/text/29/531.27), wages in cash or negotiable instrument payable at par
- [29 CFR 531.35](https://www.law.cornell.edu/cfr/text/29/531.35), wages paid free and clear, and costs that cut into minimum or overtime wages
- [New York Labor Law 192](https://www.nysenate.gov/legislation/laws/LAB/192), advance written consent for direct deposit and its exemptions

**Agency guidance and forms**

- [CFPB: Bulletin 2013-10, Payroll Card Accounts (Regulation E)](https://files.consumerfinance.gov/f/201309_cfpb_payroll-card-bulletin.pdf), coverage of payroll card accounts, compulsory use, employer choices, alternatives under state law and preemption only of inconsistent state law
- [CFPB: Payroll card accounts bulletin page](https://www.consumerfinance.gov/compliance/supervisory-guidance/bulletin-payroll-card-accounts/), the September 12, 2013 bulletin and its status

**Courts and enforcement**

- [American Payroll Association: Court sides with New York Department of Labor on paycard regulations](https://blogs.payroll.org/pay-news-now/court-sides-with-new-york-department-of-labor-on-paycard-regulations), *Reardon v. Global Cash Card, Inc.*, No. 526973 (January 9, 2020), Part 192 in effect, consent, notice, no fees and 30 days' notice of changes

**Vendor documentation**

- [Check: Net pay splits](https://docs.checkhq.com/docs/net-pay-splits.md), up to 7 accounts, amount, percentage and mixed splits, the remainder account, priority and lock-in at approval
- [Check: Bank account verification](https://docs.checkhq.com/docs/bank-account-verification.md), no upfront validation of employee accounts and validation by a successful deposit
- [Check: Handling failed payments](https://docs.checkhq.com/docs/handling-failed-payments.md), retrying failed credits to a new account and refunds marked `MANUAL`
- [Gusto Embedded: Bank accounts and direct deposit splits](https://docs.gusto.com/embedded-payroll/docs/bank-accounts-and-direct-deposit-splits.md), amount and percentage splits and the null remainder
- [QuickBooks: Payroll pricing](https://quickbooks.intuit.com/payroll/pricing/), next-day and same-day direct deposit
- [Square: Payroll pricing](https://squareup.com/us/en/payroll/pricing), instant pay to Cash App
- [Zeal: Documentation](https://docs.zeal.com/), employee checks and settlement on the pay date

**In practice**

- [NAUPA: What Is Unclaimed Property](https://www.unclaimed.org/what-is-unclaimed-property/), uncashed payroll checks as unclaimed property and dormancy periods
