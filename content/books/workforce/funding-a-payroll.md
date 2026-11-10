+++
title = "Funding a Payroll"
description = "Collecting a payroll from the employer: debit timing from four-day to same-day, wire prefunding, credit limits, risk tiers, demotion and check date math."
category = "Workforce Industry"
order = 2620
part = "Moving the Money"
tags = ["payroll", "ach", "funding", "credit-risk", "money-movement", "wires"]
+++

Before a payroll provider pays anyone, it has to get the money from the employer, and the gap between the two is the business. The provider debits the employer's bank account for net pay, taxes and the other amounts it will pay on the employer's behalf, waits some number of banking days, and then sends credits to every worker's bank on the check date. How many days it waits is a product choice that looks like a convenience (approve on Wednesday instead of Monday) and is really a credit decision: an ACH debit can come back after it settles, and every day the provider pays out before the debit's return window closes, it is lending the employer that payroll. Paylocity's 10-K says it plainly: it debits "a client's account prior to any disbursement on its behalf," yet "We typically pay client employees, taxing authorities and vendors before" the client's transfers settle, so "the client's funds will be insufficient to cover the amounts we have already paid" is a risk it carries.

This chapter covers the employer side of the money: what a pay run collects, debit timing from four-day to next-day and same-day, wire prefunding, holidays and the check date math, credit limits and underwriting, risk tiers and demotion, and the provider as a short-term lender. The ACH mechanics underneath (files, SEC codes, settlement windows, return codes) belong to [ACH & Bank Transfers](/books/payments/ach); what happens when a debit comes back is [When the Debit Fails](/books/workforce/failed-debits-and-recovery); where the collected money sits until it is paid out is [Client Funds & Impound Accounts](/books/workforce/client-funds-and-impounds); and the credits to workers are [Direct Deposit, Pay Cards & Checks](/books/workforce/paying-employees).

## How the Platforms Do It

What providers publish about collecting payroll from employers, as of November 2026:

| Provider | Model | Funding rule it publishes |
| --- | --- | --- |
| **Check** | Embedded payroll API | "At the end of each business day at 5pm PT, our system collects all payrolls that have an `approval_deadline` on that day" and starts the employer debit, which "can take up to 3 business days to complete"; net pay ACH starts only once Check has the employer's cash requirement. Paydays are returned per `processing_period` (`three_day`, `two_day`, `one_day`) with `impacted_by_holiday`. Wire-funded payrolls get an approval deadline of "4pm ET on the payroll's payday," and "Payroll credits... will only be sent out on receipt of the wire" |
| **Gusto Embedded** | Embedded payroll API | `payment_speed` of `1-day`, `2-day` or `4-day` ("1-day is only applicable to partners that opt in"); for a Friday check date, run by 4pm PT Monday (4-day), Wednesday (2-day) or Thursday (next-day); a `fast_payment_limit` on the aggregate of payments in 24 hours above which a payroll moves to 4-day; `earned_fast_ach_blockers` of `minimum_days` and `minimum_funded_payments`; reverse wires, "debit transactions initiated by Gusto to pull funds from a partner's bank account" |
| **Insperity** | PEO | Clients "remit their comprehensive service fees no later than the same day as the applicable payroll date," and Insperity may "require prepayment, letters of credit, or other collateral upon deterioration in a client's financial condition" |
| **Paylocity** | Payroll and HCM | Debits before disbursing, pays before the client's transfers settle, and notes that ACH credits to it "could be reversed under certain circumstances and timeframes" |
| **QuickBooks Payroll** | Small-business payroll | Next-day direct deposit ("run payroll by 5:00 PM to pay your employees the next business day") on lower tiers, same-day ("run payroll by 7:00 am") on higher ones |
| **Square Payroll** | Small-business payroll | Two-day payroll that "shortens the processing time needed to submit payroll to two business days instead of four," which the employer applies for; next-day direct deposit; Instant Deposit for workers who use Cash App |
| **TriNet** | PEO | "In most instances, clients are required to remit payment prior to the applicable payroll date by wire transfer or ACH" |

Three things stand out. **Speed is earned, not chosen.** Square's two-day payroll is something an employer applies for, Gusto's `earned_fast_ach_blockers` keep a new company on 4-day until it has enough days and funded payments behind it, and Check's processing period is set by Check and lengthened after funding failures. **Limits are aggregate and per day.** Gusto's `fast_payment_limit` applies to the sum of payments in any 24 hours, so two off-cycle runs can push a regular payroll back to 4-day. **PEOs fund differently because they are the employer.** A co-employer owes the wages whether or not the client paid ("These liabilities are not contingent on the prepayment by the client," Insperity), so PEOs collect up front by wire or ACH and hold collateral instead of offering speed as a feature. My rule: funding speed is an attribute of the employer that the risk system assigns and can take away, stored with its reasons, never a setting the employer picks.

## What a Pay Run Collects

The debit is the **cash requirement**: everything the provider will pay out of its own accounts for this run. It is not the gross payroll. For a full-service provider the requirement is:

| Component | In the debit? | Why |
| --- | --- | --- |
| Net pay by direct deposit and pay card | Yes | The provider sends the credits |
| Net pay by paper check drawn on the provider's account | Yes | The provider clears the check |
| Net pay by check drawn on the employer's account, or a manual check | No | The employer's bank pays it |
| Employee taxes withheld and employer taxes (federal, state, local) | Yes, when the provider deposits them | The provider pays the agencies on their due dates |
| Garnishments the provider remits (child support to a state disbursement unit, levies) | Yes, when managed | Check's child support deductions are "included in the payroll's cash requirement" when `managed` |
| 401(k) deferrals and other remittances the provider makes to plans | When the provider remits them | Some providers send them to the recordkeeper; others leave them to the employer |
| Benefit premiums the employer pays its carrier directly | No | The deduction stays with the employer |
| The provider's fees | Separate debit, usually | Gusto lists "Debit payroll fee" as its own transaction type |

The cash requirement is computed at approval, from the calculated statements and the provider's remittance responsibilities for that employer, and it is what the debit and the funds reconciliation both key on. A payroll the employer approves and then edits must produce a new cash requirement and, after the debit is sent, a correction run with its own funding, never an edit to the amount in flight. Check states the same boundary in its API: approval locks taxes and net pay, and after the reopen deadline the payroll moves to `processing` and changes need Check itself.

## Debit Timing: Four-Day to Same-Day

A provider's payroll speed is the number of banking days between the employer debit and the check date. The four common schedules, using Gusto's published Friday timeline and the rail behavior in [ACH & Bank Transfers](/books/payments/ach#timing):

- **Four-day.** Gusto: "Run payroll by 4pm PT on Monday. Funds are debited Monday," and the debit is "successful or unsuccessful by Thursday"; if it succeeded, employees are paid Friday. Square calls four business days the standard. The schedule exists because an ACH debit sent Monday settles Tuesday and an insufficient funds or closed account return comes back within two banking days of settlement, so by Thursday the provider knows. A four-day provider sends credits only after the administrative return window has closed, and lends nothing if the employer account is a business account.
- **Two-day.** Debit Wednesday, pay Friday. The debit settles Thursday, the credits go out Thursday for Friday settlement, and the return window stays open into the next week: the provider pays the employees and finds out on Monday or Tuesday whether the employer paid it.
- **Next-day.** Debit Thursday, pay Friday. Gusto offers it only to partners that opt in, QuickBooks sells it with a 5:00 PM cutoff, and Square's next-day direct deposit is paid from the seller's Square balance, which sidesteps the debit entirely when the money is already on the platform.
- **Same-day.** QuickBooks advertises "run payroll by 7:00 am to pay your employees that same business day." A same-day product needs either a Same Day ACH debit and credit in the same settlement cycle or a prefunded balance, because nothing about a morning debit is known by the afternoon. Same Day ACH entries are capped at $1 million each, a limit Nacha's rule set effective March 18, 2022 and listed "Payroll funding" among the use cases it helps.

![A timeline of a Friday, November 13, 2026 check date in Veterans Day week. Three lanes show a 4-day debit sent Friday November 6 that settles Monday November 9 with its return window closing Thursday November 12, before net pay; a 2-day debit sent Tuesday November 10 that settles Thursday November 12; and a next-day debit sent Thursday November 12 that settles Friday November 13. The 2-day and next-day return windows run past the check date to Tuesday November 17. Wednesday November 11 is hatched as a bank holiday.](/diagrams/wf-debit-timing.svg "Speed counts banking days back from the check date, so a bank holiday pushes the debit earlier. Only the 4-day debit is past its return window before net pay goes out; on faster speeds the provider pays first and learns later.")

Business accounts make the four-day schedule work. Employer debits are business entries (CCD), whose administrative returns and the R29 unauthorized return close in two banking days. A sole proprietor funding payroll from a consumer account is a different risk: a consumer can return a debit as unauthorized (R10) for 60 calendar days ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)), so no schedule clears that exposure, and providers that allow it price the account as higher risk or require a wire.

## Check Date Math and Holidays

Every schedule counts banking days, and banking days are the Federal Reserve's: weekends and the eleven Fed holidays don't settle ACH. The Fed's 2026 holidays include Columbus Day (October 12) and Veterans Day (November 11), days most employers work, and its rule for weekend holidays is asymmetric: "For holidays falling on Sunday, all Federal Reserve offices will be closed the following Monday," while for a Saturday holiday the Reserve Banks stay open the Friday before. So July 4, 2026, a Saturday, closes nothing that settles payroll, and July 4, 2027, a Sunday, closes Monday, July 5.

The rule a provider publishes is "N banking days before the check date"; the date the employer sees moves every holiday week. Worked for a Friday check date, my examples:

| Check date | Holiday in the window | 4-day debit | 2-day debit | Next-day debit |
| --- | --- | --- | --- | --- |
| Friday, November 20, 2026 | None | Monday, November 16 | Wednesday, November 18 | Thursday, November 19 |
| Friday, November 13, 2026 | Veterans Day, Wednesday, November 11 | Friday, November 6 | Tuesday, November 10 | Thursday, November 12 |
| Friday, November 27, 2026 | Thanksgiving, Thursday, November 26 | Friday, November 20 | Tuesday, November 24 | Wednesday, November 25 |
| Friday, October 16, 2026 | Columbus Day, Monday, October 12 | Friday, October 9 | Wednesday, October 14 | Thursday, October 15 |

The Veterans Day row is the one employers miss: the 4-day approval deadline falls in the previous week. The check date itself can also land on a holiday. Pay schedules carry a holiday rule (the core model's `pay_schedules.holiday_rule`, previous or next business day), and state pay frequency laws decide which is lawful; for Christmas Day on a Friday, December 25, 2026, a previous-business-day rule moves the check date to Thursday, December 24, and every debit date moves with it. Pay Frequency, Pay Statements & Final Pay covers the payday laws.

The engine for this is a calendar, not arithmetic. Store each year's Fed holidays as rows (they are published years ahead), compute the debit date as the Nth banking day before the check date, then subtract the provider's own cutoff (Gusto's 4pm PT, Check's 5pm PT collection) to get the approval deadline, and show the employer the deadline, not the speed. Check returns the result directly: each payday comes with its `approval_deadline` and a flag saying whether a holiday moved it.

## Wire Prefunding

A wire is final when it arrives, so it replaces the return window with a deadline. Three patterns:

- **Wire as the funding method.** Check lets an employer fund by wire, moving the approval deadline to "4pm ET on the payroll's payday" and sending credits "only... on receipt of the wire"; the wire must be for "exactly the amount shown in the wire details object." The employer gets the latest possible approval and the provider takes no credit risk, at the cost of the employer's wire fee and the risk that a late wire means late pay.
- **Wire as the recovery path.** When an ACH debit fails, a wire is the fastest cure: Check recommends it because wires "land within a matter of hours rather than days" ([When the Debit Fails](/books/workforce/failed-debits-and-recovery)).
- **Reverse wires against a partner.** In embedded payroll, the platform that resells payroll may fund on its customers' behalf. Gusto's reverse wires are "debit transactions initiated by Gusto to pull funds from a partner's bank account" to cover payroll or contractor payment obligations, with statuses `pending_processing`, `processed`, `rejected` and `failed`: a drawdown on the partner, under its agreement, rather than a wire the partner sends.

PEOs use prefunding as their default. TriNet requires payment "prior to the applicable payroll date by wire transfer or ACH," and Insperity "no later than the same day as the applicable payroll date," which, for a same-day payment, only a wire or a balance the PEO already holds can satisfy.

## Underwriting the Employer

A provider that pays before the money is final has to decide, per employer, how much it will lend and for how long. The public pieces:

- **Know the business.** Onboarding verifies the employer's identity, EIN and authority (Gusto Embedded companies have signatories and federal tax details; Zeal's company onboarding includes microdeposit bank verification and authorization documents), and the bank account is verified before the first debit: Check sends an ACH prenote on an employer's raw bank account and holds it `validation_pending` until the result arrives.
- **Look at the balance.** Gusto encourages connecting bank accounts through Plaid because it provides "the last cached bank balance, which can inform threshold adjustments." A balance at onboarding isn't a balance on payday, but a payroll larger than the account has ever held is a signal.
- **Set a limit in dollars per period.** Gusto's `fast_payment_limit` is a dollar ceiling on "the 24-hour aggregate of all payments"; anything above moves to 4-day. Gusto tells partners to "evaluate and decide the level of risk you would like to take on in a 24 hour period for a given client," and to let customers request temporary or permanent increases.
- **Earn speed with history.** `earned_fast_ach_blockers` (`minimum_days`, `minimum_funded_payments`) make a new company wait for days on the platform and successfully funded payrolls before faster speeds apply. History is the cheapest underwriting signal a payroll provider has: an employer that has funded twenty payrolls on time is a different risk from one that signed up last week.
- **Take collateral when it deteriorates.** Insperity's right to "require prepayment, letters of credit, or other collateral upon deterioration in a client's financial condition" is the PEO version; a payroll provider's version is moving the employer to wire funding.

The limit has to be computed against the whole exposure, not one run. Exposure at any moment is the sum of debits that have been paid out against but are still inside their return window: this payroll, an off-cycle bonus run the same week, and the contractor payments that share the employer's bank account. A $40,000 regular payroll under a $50,000 limit is fine until a $15,000 bonus run is approved the same day.

### Worked Numbers: A Limit and a Demotion

An invented employer on 2-day payroll has a `fast_payment_limit` of $50,000. Its regular biweekly cash requirement is $42,300 (net pay $31,800, taxes $10,500), with check date Friday, December 4, 2026 and a 2-day debit on Wednesday, December 2. On Tuesday, December 1 it approves an off-cycle bonus run of $9,600 for the same check date.

| Run | Approved | Cash requirement | 24-hour aggregate | Speed |
| --- | --- | --- | --- | --- |
| Bonus (off-cycle) | Tue Dec 1 | $9,600 | $9,600 | 2-day, debit Wed Dec 2 |
| Regular | Wed Dec 2 | $42,300 | $51,900 | Over $50,000: moves to 4-day |

On a 4-day schedule the regular payroll's debit would have had to go Monday, November 30, so it can no longer make the December 4 check date. Gusto describes this exact situation: when a payroll is pushed to 4-day by the threshold, "the user must then cancel the payroll," the partner adjusts the threshold, and the payroll is reprocessed. The fix belongs before approval: the system knows the aggregate, so it should warn when the second run is being prepared, offer a temporary limit increase, wire funding, or a later check date, and say which, rather than accept the payroll and miss the date.

The exposure the limit controls, worked at the next-day schedule's two-banking-day tail: $42,300 paid out Friday against a debit that can return until Tuesday is four calendar days of an unsecured $42,300 loan. If one employer in 2,000 such payrolls fails to fund and isn't recovered, the expected loss is about $21 a payroll; an annual fee or float give-up that is smaller than that is the wrong price. Those rates are mine, for the arithmetic; the provider's own loss history is the input that matters, and How Payroll Providers Make Money works the float side of the same trade ([Float Against Credit Losses](/books/workforce/revenue-models#float-against-credit-losses)).

## Risk Tiers and Demotion

Speeds are risk tiers, and both public embedded APIs move employers between them on evidence:

- **Promotion** happens on history (Gusto's earned blockers) or on review (Square's application for two-day payroll).
- **Demotion** happens on a funding failure. Check records a funding strike for each failed payroll funding, and a company with active strikes "may have its processing period lengthened, or in severe cases be removed from the platform." Gusto's recovery case policy sets probation by history: none for a first failure repaid within 8 days, 90 days for a failure on a bank verification debit, 180 days for a first failure repaid after more than 8 days, 180 to 365 days for multiple failures within two years, with at least one successful payroll a month during probation; "A company is afforded five bank errors" before it may be removed.
- **Automatic demotion per payroll** happens at the limit, as worked above.

A tier change is a dated record with a reason and evidence (the failed debit, the strike count, the reviewer), effective from a date, because it changes every approval deadline after it. Employers notice a demotion as a deadline that moved two days earlier; the system should tell them before the next run, and say what earns the speed back.

## The Provider as a Short-Term Lender

Put together, faster funding is a revolving, unsecured, same-week credit line to the employer, sized by the limit, priced inside the subscription, underwritten on history and a bank balance, and collected through the ACH network's return window. The filings are candid that the lender sometimes loses: Paychex "could be held liable for such amounts in the event the client has insufficient funds" and has "in the past" made payments on clients' behalf "for which we may not be reimbursed"; Paylocity says the shortfall "has only occurred in very limited instances in the past." In embedded payroll the credit can be passed down the chain: if a company doesn't repay a failed 2-day debit, Gusto says "the liability is transferred to you (after 90 days)," the partner platform. When the Debit Fails follows the recovery.

Two consequences shape the system. **Taxes ride on the same debit.** A provider that funds net pay before the debit clears has usually also impounded the taxes in that debit, and Check won't send a tax deposit unless its funding is `funded`; a failed debit therefore becomes an employer's late tax deposit unless the employer cures it, which is why the tax calendar and the funding calendar share dates ([Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns#when-deposits-are-due)). **The worker is paid regardless.** Once credits are sent, the provider can't take them back from workers for the employer's failure: Nacha permits reversing a payroll credit only for a short list of errors ([Reversals](/books/payments/ach#reversals)), and a reversal because the employer didn't fund is improper. MyPayrollHR's 2019 collapse showed what happens when that rule is broken at scale ([When Payroll Providers Fail](/books/workforce/when-providers-fail)).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). A pay run's funding is a `money_movements` row with `purpose = 'client_debit'`, keyed to the run; this chapter adds the employer's funding profile and limit, the history of speed changes, the cash requirement's composition, and the banking calendar the dates come from.

```sql
-- How an employer funds, and at what speed, over time.
CREATE TABLE funding_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  method              TEXT NOT NULL CHECK (method IN ('ach_debit', 'wire', 'reverse_wire',
                        'platform_balance')),
  speed_days          SMALLINT NOT NULL CHECK (speed_days BETWEEN 0 AND 5),  -- banking days before check date
  funding_bank_account_id UUID REFERENCES bank_accounts (id),
  cutoff_local        TIME NOT NULL,         -- e.g. 16:00 in the cutoff zone
  cutoff_zone         TEXT NOT NULL,         -- 'America/Los_Angeles'
  funded_by           TEXT NOT NULL DEFAULT 'employer' CHECK (funded_by IN ('employer',
                        'partner')),          -- embedded: the platform may fund
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (employer_id WITH =, valid_during WITH &&),
  CHECK ((method = 'ach_debit') = (funding_bank_account_id IS NOT NULL))
);

-- The exposure the provider accepts before debits are final.
CREATE TABLE credit_limits (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  window_hours        SMALLINT NOT NULL DEFAULT 24,
  limit_amount        BIGINT NOT NULL,       -- cents across all runs in the window
  kind                TEXT NOT NULL CHECK (kind IN ('standing', 'temporary')),
  basis               JSONB NOT NULL DEFAULT '{}',  -- balance seen, history, reviewer notes
  approved_by         TEXT NOT NULL,
  valid_during        TSTZRANGE NOT NULL     -- a temporary increase has an end
);

-- Every promotion and demotion, with why.
CREATE TABLE funding_speed_changes (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  from_profile_id     UUID REFERENCES funding_profiles (id),
  to_profile_id       UUID NOT NULL REFERENCES funding_profiles (id),
  reason              TEXT NOT NULL CHECK (reason IN ('earned', 'review', 'funding_failure',
                        'probation_end', 'limit_exceeded', 'employer_request', 'risk_review')),
  evidence_ref        UUID,                  -- a recovery case, strike or review
  applies_to_run_id   UUID REFERENCES pay_runs (id),  -- set for a one-run demotion at the limit
  decided_by          TEXT NOT NULL,         -- a user, the risk engine
  effective_at        TIMESTAMPTZ NOT NULL,
  notified_at         TIMESTAMPTZ
);

-- The banking calendar: Federal Reserve holidays and any agency calendars.
CREATE TABLE bank_holidays (
  calendar            TEXT NOT NULL,         -- 'fed', 'dc_legal', 'state_ca', ...
  holiday_date        DATE NOT NULL,
  name                TEXT NOT NULL,
  settles             BOOLEAN NOT NULL DEFAULT FALSE,  -- a Saturday holiday: Friday still settles
  PRIMARY KEY (calendar, holiday_date)
);

-- What a run collects, by component, so the debit and reconciliation agree.
ALTER TABLE pay_runs
  ADD COLUMN cash_requirement     BIGINT,     -- cents; set at approval
  ADD COLUMN cash_components      JSONB,      -- {"net_pay":..., "taxes":..., "garnishments":...}
  ADD COLUMN funding_profile_id   UUID REFERENCES funding_profiles (id),
  ADD COLUMN debit_on             DATE,       -- computed from check_date, speed and bank_holidays
  ADD COLUMN funding_status       TEXT CHECK (funding_status IN ('not_required', 'pending',
                                    'in_flight', 'funded', 'failed', 'waived'));

-- Exposure now: debits paid against but still inside the return window.
SELECT r.employer_id,
       SUM(m.amount) AS exposure
FROM money_movements m
JOIN pay_runs r ON r.id = m.pay_run_id
WHERE m.purpose = 'client_debit'
  AND m.status IN ('sent', 'settled')
  AND r.status IN ('paying', 'paid')
  AND return_window_closes(m.effective_date, m.bank_account_id) > CURRENT_DATE  -- helper over bank_holidays
GROUP BY r.employer_id;
```

Design notes:

- **Compute the approval deadline, store it on the run.** `pay_runs.approval_deadline_at` comes from the check date, `speed_days`, `bank_holidays` and the cutoff, and `debit_on` with it; a later speed change recomputes only runs not yet approved ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Check the limit at approval, across runs.** The test is the sum of cash requirements of runs approved in the window plus this one against the active `credit_limits` row; failing it changes the run's funding profile or blocks approval with the options, before anything is sent.
- **Make the speed change a record, not an update.** `funding_profiles` is effective-dated and `funding_speed_changes` says why each change happened, so a dispute about a missed check date can be answered from data.
- **One debit per run, one idempotency key.** The client debit's key is the run's, so a retried file or a replayed job can't debit twice ([Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)); the debit itself is an `ach_entries` row in Payments' model ([How to Build It](/books/payments/ach#how-to-build-it)).
- **Hold credits behind a funding gate.** The net pay job runs only when the run's `funding_status` allows it under the profile: `funded` for 4-day and wire, `in_flight` for faster speeds within the limit. That gate is the credit decision, so log it.
- **Keep the calendar as data and test the holiday weeks.** Veterans Day, Columbus Day and Sunday holidays break hard-coded "four days before Friday," and the test suite should cover each year's list.

## Auditing

Funding records are what a client disputes after a missed payday, what a partner disputes after a loss is transferred, and what a SOC 1 auditor samples:

- **The cash requirement of every run,** by component, and the debit that collected it, with trace number and return code.
- **Every approval deadline and debit date** with the calendar and profile that produced them.
- **Every limit check at approval,** passed or failed, with the aggregate it saw.
- **Every speed change** with its reason, evidence and the notice sent to the employer.
- **The funding gate decision** for each run: when credits were released and on what funding status.

## What This Means for the System You Build

- **Treat funding speed as credit:** assign it from history and review, limit it in dollars per 24 hours across runs, and take it away on evidence.
- **Collect a cash requirement, not gross pay,** composed from what the provider will actually pay, fixed at approval.
- **Count banking days from a Federal Reserve holiday table,** including Columbus Day, Veterans Day and Sunday holidays, and show employers the approval deadline, not the speed.
- **Offer wire funding as the fallback** for large, late or demoted payrolls, with its own deadline.
- **Check limits before approval** and give the employer the choices (limit increase, wire, later check date) instead of accepting a payroll that can't make its date.
- **Gate net pay on funding status** under the employer's profile, and record each release.
- **Price consumer-account funding as 60-day risk,** or don't accept it.

## References

**Standards and specifications**

- [Nacha: Same Day ACH, moving to $1 million per payment](https://www.nacha.org/million), the $1 million per-payment limit effective March 18, 2022 and payroll funding as a use case
- [Federal Reserve: Holidays observed by the Federal Reserve System](https://www.federalreserve.gov/aboutthefed/k8.htm), the 2026 and 2027 holidays and the Saturday and Sunday rules

**Filings**

- [Insperity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1000753/000100075326000011/nsp-20251231.htm), service fees due no later than the payroll date, liability for wages not contingent on client prepayment, and prepayment, letters of credit or collateral on deterioration
- [Paychex: Form 10-K for the fiscal year ended May 31, 2026](https://www.sec.gov/Archives/edgar/data/723531/000119312526307785/payx-20260531.htm), liability when a client has insufficient funds and payments not reimbursed
- [Paylocity: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), debiting before disbursement, paying before transfers settle, reversal risk and limited past shortfalls
- [TriNet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/937098/000093709826000010/tnet-20251231.htm), payment before the payroll date by wire or ACH, and liability for worksite employee wages

**Vendor documentation**

- [Check: Life of a payroll](https://docs.checkhq.com/docs/life-of-a-payroll.md), the 5pm PT collection at the approval deadline, debit timing, the reopen deadline and release of net pay
- [Check: Get company paydays](https://docs.checkhq.com/reference/get-company-paydays.md), approval deadlines by processing period and the holiday flag
- [Check: Fund by wire](https://docs.checkhq.com/docs/fund-by-wire.md), the 4pm ET payday deadline, exact amounts and credits on receipt of the wire
- [Check: Resolve funding failures](https://docs.checkhq.com/docs/resolve-funding-failures.md), funding strikes and processing period lengthening
- [Check: Bank account verification](https://docs.checkhq.com/docs/bank-account-verification.md), prenotes on employer accounts and validation statuses
- [Check: Post-tax deductions](https://docs.checkhq.com/docs/post-tax-deductions.md), managed child support in the payroll's cash requirement
- [Gusto Embedded: Payroll processing speeds](https://docs.gusto.com/embedded-payroll/docs/2-day-vs-4-day.md), Friday timelines by speed, the 24-hour threshold, Plaid balances and the 90-day liability transfer
- [Gusto Embedded: Update a company's payment configs](https://docs.gusto.com/embedded-payroll/reference/put-v1-company-payment-configs.md), `payment_speed`, `fast_payment_limit` and `earned_fast_ach_blockers`
- [Gusto Embedded: Get reverse wire transactions](https://docs.gusto.com/embedded-payroll/reference/get-reverse-wire-transactions.md), reverse wires and their statuses
- [Gusto Embedded: ACH codes and transaction types](https://docs.gusto.com/embedded-payroll/docs/ach-codes-and-transaction-types.md), payroll fee debits as a separate transaction type
- [Gusto Embedded: Recovery cases](https://docs.gusto.com/embedded-payroll/docs/recovery-cases-1.md), probation periods and the five-error allowance
- [QuickBooks: Payroll pricing](https://quickbooks.intuit.com/payroll/pricing/), next-day and same-day direct deposit cutoffs
- [Square: Payroll pricing](https://squareup.com/us/en/payroll/pricing), two-day payroll on application, next-day direct deposit and Instant Deposit
- [Zeal: Documentation](https://docs.zeal.com/), company onboarding with microdeposit verification and authorization documents
