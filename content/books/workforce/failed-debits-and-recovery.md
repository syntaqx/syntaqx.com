+++
title = "When the Debit Fails"
description = "A payroll debit that comes back: the return codes that matter, retries, blocked payrolls, partial pay, recovery, who eats the loss, and the fraud patterns."
category = "Workforce Industry"
order = 2621
part = "Moving the Money"
tags = ["payroll", "ach", "returns", "collections", "credit-risk", "fraud"]
+++

A payroll provider sends an employer debit, pays the employees, and two banking days later the debit comes back marked R01, insufficient funds. The employees have their money and the law won't let the provider take it back from them. The taxes that rode on the same debit are due to the IRS on the employer's deposit schedule whether or not anyone has the cash. The employer may be a business having a bad week, a business that is failing, or a business that never existed. Every provider that funds faster than the return window builds for this case, and the public embedded payroll APIs document their machinery in detail: Gusto opens a recovery case and blocks the next payroll, Check records a funding strike and asks for a wire, and both pass the loss to the reselling platform if the employer doesn't pay.

This chapter covers the return codes that matter for payroll, the first days after a return, retries and their limits, blocked payrolls, partial pay when an employee's credit fails, recovery from the employer, what happens to the taxes, who eats the loss under embedded partner agreements, and the fraud patterns the controls exist for. The return codes, windows and reinitiation rules as the network defines them are in [ACH & Bank Transfers](/books/payments/ach#returns-when-money-is-really-yours); the funding speeds and limits that decide how much is at risk are in [Funding a Payroll](/books/workforce/funding-a-payroll).

## How the Platforms Do It

What embedded payroll APIs and filers publish about failed funding and recovery, as of November 2026:

| Provider | What it publishes |
| --- | --- |
| **Check** | `failure_code` values such as `insufficient_funds` and `account_closed`, and a `can_retry` flag; debit retries by wire (`use_wire`, recommended because wires "land within a matter of hours rather than days") or by a new bank account, after which "we must wait 3 banking days to clear the ACH return window"; funding failure requirements that move `failed`, `open` (`ach_redebit_inflight` or `expecting_wire`), `pending` (`ach_redebit_awaiting_return_window`) and `resolved`; a company "will be blocked from running additional payrolls until all its funding failures are resolved"; a funding strike per failed funding that factors into "processing period demotion and termination decisions"; a payroll `failed` when its employer debit returns, with in-flight payments paused where possible, and `partially_paid` when an employee or contractor credit fails |
| **Gusto Embedded** | A recovery case "to track any outstanding balance from a defaulted payment debit"; an R01 is re-debited automatically "within the next business day," and any other return code or a failed retry opens a case with `latest_error_code`; "Payroll will be blocked until the recovery case is resolved"; `PUT recovery_cases/{uuid}/redebit` returns 202 and re-initiates within a business day, taking up to four business days to process; probation from 90 to 365 days by history; "A company is afforded five bank errors"; liability moves to the partner if the re-debit isn't started within 90 days |
| **Paychex** | It "could be held liable for such amounts in the event the client has insufficient funds" and has made payments on clients' behalf "for which we may not be reimbursed" |
| **Paylocity** | Pays before client transfers settle; a shortfall "has only occurred in very limited instances in the past" |

Two designs stand out. **Retry is narrow and the default cure is a wire.** Only an insufficient funds return gets an automatic re-debit (Gusto), every other code needs a human or a new account, and both APIs steer employers to a wire because a second ACH debit reopens a second return window. **The block is the leverage.** An employer that owes the provider for last week's payroll can't run this week's until it pays, which is why both APIs block on an unresolved failure and why a block has to be explained to the employer immediately: it is about to miss a payday of its own making. My rule is that the failure, the block, the retry and the strike are separate records tied to one case, so each can be explained and each has its own clock.

## The Return Codes That Matter

An employer debit can come back for any code in Nacha's list; for payroll a handful matter, and each means something different for the next step. Windows are as [ACH & Bank Transfers](/books/payments/ach#returns-when-money-is-really-yours) states them.

| Code | Meaning | Window | What payroll does |
| --- | --- | --- | --- |
| R01 | Insufficient funds | 2 banking days | Automatic re-debit is allowed (Gusto does one); offer a wire; open a case if it fails |
| R09 | Uncollected funds | 2 banking days | Treat as R01: the money may be there tomorrow |
| R02 | Account closed | 2 banking days | No retry; the employer needs a new funding account, verified, before anything else |
| R03, R04 | No account, invalid number | 2 banking days | No retry; a data error at setup or a change; verify a new account |
| R16 | Account frozen | 2 banking days | Stop; a frozen account can be legal process or sanctions; escalate |
| R29 | Business says the debit wasn't authorized | 2 banking days | Stop; never re-debit without a new authorization; a fraud signal (account takeover or a fake employer) |
| R10, R05 | Consumer says unauthorized; consumer account debited as business | 60 calendar days | Only where an employer funds from a consumer account; the long tail no funding speed covers |

A **notification of change** (C01 and the rest) isn't a failure: the debit posted and the bank is telling the provider the account details are out of date. The correction has to be applied to the employer's funding account before the next debit, as the Rules require ([The Rules You Inherit](/books/payments/ach#the-rules-you-inherit)).

## The First Days After a Return

The order of events for an invented employer on 2-day payroll, with a cash requirement of $42,300 (net pay $31,800, federal taxes $10,500) for Friday, December 4, 2026, debited Wednesday, December 2:

| Day | Event | System action |
| --- | --- | --- |
| Wed Dec 2 | Debit sent | `money_movements` row `sent` |
| Thu Dec 3 | Debit settles; net pay credits sent for Friday | Credits released under the 2-day profile and limit |
| Fri Dec 4 | Employees paid | Run `paid` |
| Mon Dec 7 | Debit returned R01 | Debit `returned`; run `funding_status = 'failed'`; a recovery case opens; the employer's next payroll is blocked; a strike is recorded |
| Tue Dec 8 | Automatic re-debit sent (R01 only) | A new debit on the case, its own idempotency key; the employer is told and offered a wire |
| Wed Dec 9 | The semiweekly tax deposit for the December 4 payday is due | The $10,500 federal deposit is at risk: unfunded |
| Fri Dec 11 | Re-debit's return window closes, or a wire arrives | Case resolves, or escalates to collections |

The tax line is the one employers don't see coming. A semiweekly depositor's taxes on Friday wages are due the following Wednesday ([When Deposits Are Due](/books/workforce/deposits-and-returns#when-deposits-are-due)), and a provider that won't pay the IRS with money it didn't collect leaves the deposit late. Check states the rule in its object model: "Check will only send out payments for a Tax Deposit if it is `funded`." If the employer cures by wire on December 9 before the provider's EFTPS cutoff, the deposit is on time. If the re-debit is the cure, it settles December 9 but isn't safe until its own return window closes on December 11, so a provider that deposits only on cleared funds deposits on Friday, December 11, two days late: a 2% failure-to-deposit penalty, $210 on $10,500, assessed to the employer ([Failure-to-Deposit Penalties](/books/workforce/deposits-and-returns#failure-to-deposit-penalties)). The case has to show the employer that deadline and the choice, wire today or pay the penalty, on the day the return arrives.

## Retries and Their Limits

Retries are governed by the network, not the provider's patience. Nacha permits a returned entry to be reinitiated at most twice, for insufficient or uncollected funds, marked `RETRY PYMT`, and never for an unauthorized return, which needs a new authorization ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)). Within that, the public patterns:

- **One automatic retry, the next business day, R01 only** (Gusto). It catches the payroll that failed because a receivable cleared a day late.
- **Retry on the employer's say-so after that.** Gusto's re-debit endpoint is called after "confirming with the customer that the bank issue is resolved"; Check's retry takes a method (wire or new bank account).
- **A new account resets the clock.** A debit to a different account is a new entry with a new return window, and Check waits "3 banking days to clear the ACH return window" before it treats the requirement as resolved.
- **A wire ends it.** It arrives in hours and can't be returned.

A retry plan per return code, held as data, keeps operations from improvising: R01 and R09 get the automatic retry, R02 to R04 need a new verified account, R16 and R29 stop and escalate, and every path offers a wire.

## Blocked Payrolls

An unresolved failure blocks the employer's next payroll in both public APIs, and Check also takes a late wire-funded payroll out of good standing until "the wire arrives or the payroll is fully voided." The block raises its own wage-law problem: the employees are owed their next paycheck on the employer's regular payday whatever the employer owes the provider, so a block that runs past the next check date means the employer has to pay its people another way (from its own account, by check) and state late-pay penalties are the employer's. [Pay Frequency, Pay Statements & Final Pay](/books/workforce/pay-frequency-statements-and-final-pay) covers payday laws. Three rules make blocks survivable:

- **Block approval, not calculation.** The employer can prepare and preview the next run; only approval waits on the case.
- **Say how to unblock in the block.** The amount owed, the wire instructions and the deadline that saves the next check date, on the screen where the employer meets the block.
- **Release automatically.** When the case resolves, the block lifts without a ticket.

## Partial Pay: When a Worker's Credit Fails

The other direction fails too: an employee's direct deposit comes back R02 or R03 because the account was closed or the number mistyped. The employer funded the payroll; one worker wasn't paid. Check's payroll becomes `partially_paid` and returns to `paid` once every item is resolved, and the resolution is one of two: retry to a new account the worker provides (credits "can be expected to settle within 1-2 banking days") or refund the employer the worker's net pay, setting the item's `payment_method` to `MANUAL`, so the employer pays the worker off-platform. Check won't refund a credit for a payroll that wasn't funded.

The returned credit is money the provider holds for one worker, owed to that worker, and the system must not lose it: it is a liability to the employee (the core model's `payee_type = 'employee'`) until it is paid or refunded, and if neither happens it ages toward the state's unclaimed wage rules ([Direct Deposit, Pay Cards & Checks](/books/workforce/paying-employees#uncashed-paychecks-and-unclaimed-wages)). A new account supplied after a return is also the moment payroll fraud happens, so it goes through the same change controls as any bank account change ([Payroll Fraud & Security](/books/workforce/payroll-fraud-and-security)).

## Recovery From the Employer

When the retry fails and no wire comes, the debt is collection, and the provider has the levers a lender has:

- **Probation and demotion.** Gusto's recovery policy puts the company on probation (none for a first failure repaid within 8 days, 90 days for a failed verification debit, 180 days when repaid after more than 8 days, 180 to 365 days for multiple failures in two years) with "at least one successful payroll per month," and five bank errors may mean removal. Check lengthens the processing period on strikes. Both put every future payroll back behind the return window.
- **Collections.** Gusto describes a failed 2-day debit sending the company into collections "until Gusto receives the funds."
- **Termination.** Removal from the platform ends future exposure but not the debt.
- **The contract.** A provider's service agreement authorizes the debit, assigns responsibility for penalties caused by late funding, and grants the right to set off; the record of what the employer agreed to is what collection relies on.

What the provider can't do is take the money back from the workers. A reversal of payroll credits is allowed only for a duplicate, the wrong receiver or amount, the wrong date or certain credits on termination of employment, and reversing because the employer didn't fund is improper and returnable by the worker's bank ([Reversals](/books/payments/ach#reversals)). MyPayrollHR's reversal files in 2019, which pulled about $26 million from employees' accounts at more than 1,000 companies, are the case that shows why ([When Payroll Providers Fail](/books/workforce/when-providers-fail)).

## Who Eats the Loss

In direct payroll the provider does, after collection fails: the filings call it a liability for amounts paid on the client's behalf. In embedded payroll there is a chain, and the agreements publish its shape:

- **Gusto Embedded.** "If this collection is not fulfilled by the company, the liability is transferred to you (after 90 days)," and the partner must make sure the client resolves the issue and starts the re-debit within 90 days.
- **Check.** Whether a failed collection or tax debit affects the company's good standing "depends on the partner's risk policy," which is to say the partner sets part of the risk appetite and carries its consequence.

So the platform that resells payroll is a guarantor of its customers' payrolls, which changes how it should underwrite them: it chooses the funding speed limits it will allow (Gusto: "evaluate and decide the level of risk you would like to take on in a 24 hour period for a given client"), it watches its own recovery cases, and it reserves for the 90-day transfers. [Embedded Payroll](/books/workforce/embedded-payroll) covers the partner side of the agreements.

### Worked Numbers: The Chain of a Loss

An invented platform resells payroll to 800 small employers on 2-day speed, average cash requirement $18,000 biweekly. In a quarter, 12 debits fail. Ten employers wire within a week, one repays after 40 days, and one disappears.

| Outcome | Count | Amount | Who carries it |
| --- | --- | --- | --- |
| Cured by wire within 8 days | 10 | $180,000 collected | No loss; no probation under Gusto's first-failure rule if repaid in 8 days |
| Repaid on day 40 | 1 | $18,000 collected | No loss; 180-day probation; a late tax deposit penalty for the employer |
| Not repaid by day 90 | 1 | $18,000 | Transferred to the platform |

The platform's quarterly loss is $18,000 against 800 x 6.5 payrolls x $18,000, about $93.6 million funded, or about 0.02%. The rates are invented for the arithmetic; the point is the shape. Losses are rare and lumpy, a single bad employer is the whole number, and it lands on the partner on a fixed date (day 90), so the platform's ledger needs a receivable for every open case and a reserve against it ([Write-Offs](/docs/money/accounting#write-offs)).

## Fraud Patterns

Most failed debits are distress, not fraud. The controls in [Funding a Payroll](/books/workforce/funding-a-payroll#underwriting-the-employer) exist for the rest, and the patterns they target follow from the mechanics above:

- **The fake employer.** A business is set up with a real-looking EIN and bank account, adds "employees" whose accounts the fraudster controls, runs a payroll on a fast speed, and lets the debit return. The money left with the credits. Verification of the business, the earned-speed blockers that keep new companies on 4-day, and limits that start small are the defense; a new employer's first payrolls to brand-new accounts are the signal.
- **The bust-out.** An employer builds history on small payrolls until it earns fast speed and a higher limit, then runs one large payroll (or an off-cycle bonus) and abandons the account. Aggregate 24-hour limits and alerts on payrolls far above the employer's history, especially off-cycle runs approved close to the cutoff, are the defense.
- **The hijacked funding account.** Someone without authority links a victim's bank account as the funding account; the victim's bank returns the debit R29, unauthorized, two banking days later, after the credits went out. Bank account verification that proves control (a prenote proves only that the account exists), and a hold on first payrolls after a funding account change, are the defense. Nacha's 2026 rules require originators and their banks to monitor for entries "authorized under False Pretenses" ([The Rules You Inherit](/books/payments/ach#the-rules-you-inherit)).
- **Payroll as a cash-out.** A legitimate-looking employer whose payroll goes mostly to new accounts at a few prepaid or fintech banks is laundering, not paying people; the provider's anti-money laundering monitoring applies.
<!-- source-gap: wf-payroll-bustout | missing | Public cases of fake employers and bust-outs against payroll providers or embedded payroll platforms | closes with: a DOJ press release, court record or provider disclosure describing such a scheme against a payroll provider | checked: 2026-11-09 -->

Direct deposit diversion (a criminal changing a real employee's account) is the other big payroll fraud, but it doesn't make a debit fail; [Payroll Fraud & Security](/books/workforce/payroll-fraud-and-security) covers it.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model) and [Funding a Payroll](/books/workforce/funding-a-payroll#how-to-build-it). A failed client debit is a `money_movements` row with `status = 'returned'` and its `return_code`; this chapter adds the case that tracks the balance, the strikes that move the employer between speeds, and the collection steps.

```sql
-- The outstanding balance from a failed client debit, and its life.
CREATE TABLE recovery_cases (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  pay_run_id          UUID NOT NULL REFERENCES pay_runs (id),
  failed_movement_id  UUID NOT NULL REFERENCES money_movements (id),
  return_code         TEXT NOT NULL,         -- 'R01', 'R02', 'R29', ...
  amount_due          BIGINT NOT NULL,       -- cents outstanding
  amount_recovered    BIGINT NOT NULL DEFAULT 0,
  retry_plan          TEXT NOT NULL CHECK (retry_plan IN ('auto_redebit', 'new_account',
                        'wire_only', 'stop_escalate')),   -- from the return code
  status              TEXT NOT NULL CHECK (status IN ('open', 'redebit_in_flight',
                        'awaiting_return_window', 'expecting_wire', 'resolved',
                        'collections', 'transferred_to_partner', 'written_off')),
  blocks_payroll      BOOLEAN NOT NULL DEFAULT TRUE,
  tax_deposit_at_risk_on DATE,               -- the earliest deposit due date the failure endangers
  partner_liability_on DATE,                 -- e.g. opened_on + 90 days under an embedded agreement
  opened_on           DATE NOT NULL,
  resolved_at         TIMESTAMPTZ,
  CHECK (amount_recovered <= amount_due)
);

-- Each attempt to recover: a re-debit, a wire, a new account. Each is also a money movement.
CREATE TABLE collection_actions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  recovery_case_id    UUID NOT NULL REFERENCES recovery_cases (id),
  kind                TEXT NOT NULL CHECK (kind IN ('auto_redebit', 'redebit', 'wire_request',
                        'new_account_debit', 'notice', 'collections_referral', 'setoff',
                        'partner_transfer', 'write_off')),
  money_movement_id   UUID REFERENCES money_movements (id),
  attempt_number      SMALLINT,              -- reinitiations: at most 2 after the original
  actor               TEXT NOT NULL,
  detail              JSONB NOT NULL DEFAULT '{}',
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Strikes move employers between funding speeds.
CREATE TABLE funding_strikes (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  recovery_case_id    UUID NOT NULL REFERENCES recovery_cases (id),
  severity            TEXT NOT NULL CHECK (severity IN ('verification_debit', 'cured_fast',
                        'cured_slow', 'unrecovered', 'unauthorized')),
  active_during       DATERANGE NOT NULL,    -- probation: 90, 180 or 365 days
  speed_change_id     UUID REFERENCES funding_speed_changes (id)
);

-- An employee credit that came back: money owed to one worker.
ALTER TABLE money_movements
  ADD COLUMN returned_at       TIMESTAMPTZ,
  ADD COLUMN resolution        TEXT CHECK (resolution IN ('retried_new_account',
                                 'refunded_to_employer', 'paid_by_check', 'escheat_pending'));

-- No reinitiation beyond the network's limit, and never on an unauthorized return.
CREATE FUNCTION check_reinitiation() RETURNS trigger AS $$
BEGIN
  IF NEW.kind IN ('auto_redebit', 'redebit') AND (
       NEW.attempt_number > 2
       OR (SELECT return_code FROM recovery_cases WHERE id = NEW.recovery_case_id)
          NOT IN ('R01', 'R09')) THEN
    RAISE EXCEPTION 'reinitiation not allowed for this return';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER collection_actions_reinit BEFORE INSERT ON collection_actions
  FOR EACH ROW EXECUTE FUNCTION check_reinitiation();
```

![The recovery case moves from open to redebit in flight, then awaiting the return window, then resolved when the window clears; or from open to expecting a wire and then resolved when the wire arrives. A re-debit returned again, or an open case with no cure, moves to collections, then to transferred to the partner at day 90, then to written off as bad debt.](/diagrams/wf-recovery-case.svg "A failed debit becomes a case with one outstanding balance. Every path out is a payment that can't be returned, or a decision about who carries the loss.")

Design notes:

- **The return opens the case in the same transaction.** Marking the debit returned, setting the run's `funding_status`, opening the case, recording the strike and blocking approval happen together, so no payroll slips through between them.
- **Derive the retry plan from the return code** and store it on the case; the trigger enforces the network's limits so a script can't break them.
- **Put the tax deadline on the case.** `tax_deposit_at_risk_on` comes from the liabilities the failed debit was funding, and the case's notices lead with it.
- **Resolve only on final money.** A re-debit moves the case to `awaiting_return_window`, not `resolved`; resolution waits for the window or a wire ([Explicit State Machines](/docs/money/payment-states#explicit-state-machines)).
- **Book the receivable.** An open case is money owed to the provider; a transferred case is the partner's payable; a written-off case is an expense with its approvals ([Double-Entry Ledger](/docs/money/payment-states#double-entry-ledger)).
- **Treat a returned employee credit as a liability to the worker,** never as cash the provider can reuse.

## Auditing

- **Every return** with its code, trace number, date and the run and liabilities it was funding.
- **Every case** with its amounts, status history, blocks, notices and the tax deadline it showed the employer.
- **Every collection action,** including each reinitiation with its attempt number and description, so a Nacha rules question can be answered.
- **Strikes and probation** with their dates and the speed changes they caused.
- **Partner transfers and write-offs** with the agreement term that applied and who approved them.
- **Returned employee credits** through to their resolution: retried, refunded, paid by check or reported as unclaimed.

## What This Means for the System You Build

- **Open a recovery case on every failed client debit,** in the same transaction that blocks the next approval and records a strike.
- **Retry by return code:** one automatic re-debit for R01 and R09, a verified new account for R02 to R04, stop for R16 and R29, and a wire offered on every path.
- **Show the tax deadline the failure endangers,** because the employer's late deposit is the cost it doesn't expect.
- **Resolve on final money,** after the return window or on a wire, never on a re-debit's submission.
- **Never pull back workers' pay** for an employer's failure; a reversal is for errors only.
- **Track returned employee credits as money owed to the worker** until paid, refunded or reported.
- **Model the partner chain** in embedded payroll: the day liability transfers, the receivable before it and the reserve against it.
- **Watch for fake employers, bust-outs and hijacked funding accounts** with history-based speed, aggregate limits and holds after funding account changes.

## References

**Standards and specifications**

- [Nacha: Same Day ACH, moving to $1 million per payment](https://www.nacha.org/million), the Same Day per-payment limit that bounds a same-day cure by ACH

**Filings**

- [Paychex: Form 10-K for the fiscal year ended May 31, 2026](https://www.sec.gov/Archives/edgar/data/723531/000119312526307785/payx-20260531.htm), liability when a client has insufficient funds and payments not reimbursed
- [Paylocity: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), paying before client transfers settle and limited past shortfalls

**Vendor documentation**

- [Check: Handling failed payments](https://docs.checkhq.com/docs/handling-failed-payments.md), failure codes, `can_retry`, wire and new-account retries, the 3-banking-day wait, failed credits, refunds to the employer and `MANUAL` items, and funding strikes
- [Check: Resolve funding failures](https://docs.checkhq.com/docs/resolve-funding-failures.md), requirement statuses, blocking and unblocking, good standing on wire-funded payrolls, the partner's risk policy and processing period lengthening
- [Check: Life of a payroll](https://docs.checkhq.com/docs/life-of-a-payroll.md), the `failed` and `partially_paid` payroll statuses
- [Check: Tax deposits](https://docs.checkhq.com/docs/tax-deposits.md), tax deposits paid only when funded
- [Gusto Embedded: Recovery cases](https://docs.gusto.com/embedded-payroll/docs/recovery-cases-1.md), automatic R01 re-debit, recovery case statuses, blocked payroll, probation, five bank errors, the 90-day partner liability and the re-debit endpoint
- [Gusto Embedded: Payroll processing speeds](https://docs.gusto.com/embedded-payroll/docs/2-day-vs-4-day.md), collections after a failed 2-day debit and the liability transfer to the partner

**In practice**

- [Krebs on Security: MyPayrollHR CEO Arrested, Admits to $70M Fraud (September 2019)](https://krebsonsecurity.com/2019/09/mypayrollhr-ceo-arrested-admits-to-70m-fraud/), the reversal of about $26 million from employees at more than 1,000 companies
