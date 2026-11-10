+++
title = "Tax Notices, Amendments & Agency Accounts"
nav_title = "Tax Notices"
description = "Agency registration and account numbers, IRS and state notices, penalty relief and first-time abatement, Form 941-X, state amendments and the notice inbox."
category = "Workforce Industry"
order = 2617
part = "Payroll Tax"
tags = ["payroll", "payroll-tax", "tax-notices", "form-941x", "penalty-abatement", "workflows"]
+++

Every payroll tax account is a conversation with an agency that the employer didn't start and can't end on its own schedule. It begins with a registration that produces an account number, sometimes weeks after the first payroll; it continues with notices, some routine (a new unemployment rate, next year's deposit schedule), some urgent (a balance due, a mismatch between the quarterly returns and the W-2s, a penalty for a deposit two days late); it includes corrections the employer files when it finds its own errors; and it ends only when the employer closes the account with a final return. A payroll provider that files for thousands of employers receives a steady stream of this mail on their behalf, much of it on paper, with response windows of ten to ninety days, and the notices are where a provider's errors become visible to its clients.

This chapter covers registering with agencies and what an account number gates, the IRS notices a payroll system sees and what each asks, state notices, penalty relief (reasonable cause, first-time abatement and its 2026 replacement, deposit designation), Form 941-X and the interest-free adjustment worked through, state amendments, who may talk to the agency for the employer, closing accounts, and the notice inbox as a workflow with states, owners and deadlines. Third-party authorizations (Forms 8655, 2678, 8821 and 2848) and what they let a provider do are in Who Runs Payroll: Agents & Liability. Corrections to wages (retro pay, voids, overpayments) start in Retro Pay, Voids & Corrections; this chapter is where they reach the agencies.

## How the Platforms Do It

What filing services and embedded APIs publish about registrations, notices and amendments, as of November 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **ADP SmartCompliance Employment Tax** | Filing and remittance service | Reports and supporting details for "filings, deposits, amendments, and notices," and a registration service that "handles the new registration process from start to updated registration ID completion" |
| **Check** | Embedded payroll API | Filings move through `pending`, `blocked`, `submitted`, `filed` and `inapplicable`; 26 blocker types include `applied_for_tax_id`, `invalid_tax_id`, `inactive_account`, `fein_tax_id_mismatch`, `poa_failure`, `missing_tax_funds`, `incorrect_experience_factor` and `invalid_tax_rate`; an agency rejection returns a filing to `blocked` with `blocked_reasons`; amendments link through `amends` and `amended_by` |
| **Gusto Embedded** | Embedded payroll API | State registrations are requirement sets with account number fields, format masks and `payroll_blocking` flags; federal tax details carry `ein_verification` with status pending, verified or failed, where failed "is commonly caused by an EIN entered incorrectly or a mismatch with the company's legal name" |

Two things stand out. **Most notices are caused by setup data.** Check's blocker list reads like a catalog of agency notices waiting to happen: wrong tax ID, inactive account, the wrong experience factor, an EIN that doesn't match the legal name. Catching them before filing is cheaper than answering them after. **Amendments are linked records, not edits.** Check's `amends` and `amended_by` and the core model's `filings.amends_filing_id` say the same thing: an amended return is a new filing that points at the original, and both stay. My rule is that every notice becomes a case with a deadline the moment it is scanned, linked to the registration, filing or deposit it concerns, and closed only with the agency's confirmation.

## Registering With Agencies

An employer needs an EIN before its first payroll and an account with each state and local agency where it has workers: state income tax withholding, state unemployment insurance, and local taxes. A new employer that indicated a federal tax obligation when getting its EIN is pre-enrolled in EFTPS. State and local registration is the slow part: an application per agency, an account number that may take days or weeks, and in some states a requirement to have paid wages before the unemployment account can be opened.

The account number gates three things in order: depositing (most agencies can't credit a payment without an account), filing (a return without an account number is rejected or held), and rate assignment (a new employer rate arrives with the account). The system's posture is that a pending registration accrues liabilities normally, holds deposits and filings in a visible queue, and alarms as the first due date approaches. Gusto marks the account number fields `payroll_blocking` for some states; Check lets the payroll run and blocks the filing with `applied_for_tax_id`. Either is defensible; what isn't is a liability with no account number and no one watching it.

Verifying the employer's identity is part of registration. The IRS matches the EIN to the legal name; Gusto's federal tax details show the verification status and the common failure, a name mismatch. A 941 under a slightly different name from the EIN record, or a state account opened under a trade name, produces notices for years. Pub 15 says to enter the name and EIN "exactly as they appeared on earlier returns."

## IRS Notices

The notices a payroll system receives for employment tax accounts, as the IRS describes them:

| Notice | What it says | Response window | What the system does |
| --- | --- | --- | --- |
| **CP136** | Deposit requirements for next year "may differ," computed from the lookback period | None required; compare and file any missing returns | Compare with the computed `deposit_schedule_determinations`; a zero quarter means the IRS has no return for it |
| **CP207** | The record of federal tax liability (Schedule B or line 16) "contains missing or incorrect information" | 45 days to send a corrected record, or penalties may be assessed | Regenerate Schedule B from statement lines, compare with the filed one, send the corrected record |
| **CP161** | "You have an unpaid balance due," possibly with a failure-to-deposit penalty | "Contact us within 10 days of the date of your notice if you think we made a mistake" | Match the balance to deposits and the return; pay, dispute or designate deposits |
| **Letter 99C** | After Combined Annual Wage Reporting, the 94X returns and the W-2s sent to SSA disagree | 45 days | Reconcile the four 941s to the W-3 by line, file W-2c or 941-X as the cause requires |
| **Failure-to-deposit penalty notice** | A penalty computed on late or improper deposits | 90 days to designate how deposits apply | Compute the designation that minimizes the penalty; consider abatement |

The list isn't complete (there are notices for missing returns, for changes the IRS made to a return, for a W-4 lock-in letter on an employee, for levies on an employee's wages), but these five are the ones a deposit and filing system causes and can answer from its own data. Letter 99C is described in [The Workforce Business](/books/workforce/workforce-business#the-life-of-a-payroll-tax-dollar); the reconciliation it asks for is in [Year-End, W-2s & Wage Reporting](/books/workforce/year-end-and-w2s#reconciling-w-2s-to-the-941s).
<!-- source-gap: wf-irs-notice-catalog | missing | a complete catalog of IRS employment tax notices (CP and letter numbers) with response windows | closes with: IRS notice pages for each employment tax CP notice and letter | checked: 2026-11-09 -->

## State Notices

State and local agencies send the same kinds of notice in their own formats: annual rate notices for unemployment, disability and paid leave programs; delinquency notices for missing quarterly reports; assessments when a report's wages disagree with the state's records or a payment didn't post; new employer and successor determinations; audit letters for a worker classification or SUI wage review; and account closure confirmations. Rate notices update `tax_registrations` and are modeled in [FICA, FUTA & SUTA](/books/workforce/fica-futa-and-suta#suta-state-unemployment-insurance); everything else is a case.

Two habits of state agencies shape the system. Many still send notices by paper mail to the employer's address of record, not to the provider, so the provider learns of them when the client forwards a scan, sometimes after the response window has half run. And many offer online accounts where notices post electronically and a third-party administrator can be linked to the employer's account, which is what Check's blocker types `tpa_failure`, `tpa_inactive`, `tpa_incorrect_access` and `tpa_linked_to_other_provider` are about: the provider's access to the state account is itself a record with a status, and losing it (when a client switches providers and the new one relinks the account) blocks filings and hides notices.

## Penalty Relief

The IRS removes penalties for four reasons that a payroll system should know how to argue from its data.

**Reasonable cause.** Deposit and return penalties "don't apply if any failure... was due to reasonable cause and not to willful neglect," and a penalty notice invites an explanation. A provider's own outage or a bank's failure to process a deposit file are the cases a provider argues for its clients; the evidence is the remittance record with timestamps and the bank's response.

**First deposits and changed frequencies.** If the return was filed on time, the IRS "may also waive deposit penalties if you inadvertently failed to deposit and it was the first quarter that you were required to deposit any employment tax, or if you inadvertently failed to deposit the first time after your deposit frequency changed," for employers within the section 7430 limits (businesses with net worth up to $7 million and no more than 500 employees), and the first time an employer sends a deposit to the IRS directly instead of by EFT. The frequency-change case is exactly the employer that crossed the $100,000 next-day rule in [Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns#the-100-000-next-day-rule).

**First-time abatement.** The IRS's administrative waiver covers "Failure to File," "Failure to Pay," and "Failure to Deposit" penalties regardless of amount, for a taxpayer with a timely filing history for the same return type over the prior three years (12 consecutive quarters for quarterly returns) and either no penalty in that period (other than estimated tax) or one later abated for reasonable cause or IRS error. For business taxpayers, the failure-to-deposit penalty must not have been waived four or more times in the prior three years and must not have been charged for avoiding EFTPS. A taxpayer asks by phone, by letter or on Form 843, without naming FTA, and "If a penalty is reduced or removed," related interest is reduced or removed automatically. The IRS says FTA is "transitioning to Automatic Exemption from Penalty (AEP) starting summer 2026," under which an eligible taxpayer's penalty isn't assessed at all, based on prior timely compliance.
<!-- source-gap: wf-aep-scope | status | which penalty types and return types Automatic Exemption from Penalty covered as of November 2026, and whether employment tax deposit penalties are included | closes with: IRS guidance on AEP's rollout | checked: 2026-11-09 -->

**Deposit designation.** Not relief, but often worth more: deposits are "generally applied to the most recent tax liability within the quarter," and within 90 days of a penalty notice the employer may designate how they apply to minimize the penalty. A missed deposit followed by a catch-up deposit is penalized less when the catch-up is designated to the oldest liability.

### Worked Numbers: Designating Deposits

Pub 15's Cedar, Inc. owed $1,000 by April 15 and $1,500 by May 15, made no April deposit, and deposited $2,000 on May 15. By default, $1,500 applies to May and $500 to April, so $500 of April remains undeposited and $500 of April was deposited 30 days late. Two default consequences follow: the $500 deposited late is in the 10% tier ($50), and the $500 never deposited keeps aging toward the 15% tier after notice. Designating the $2,000 as $1,000 to April and $1,000 to May instead leaves $1,000 of April 30 days late ($100 at 10%) and $500 of May undeposited from May 15. Which designation is cheaper depends on when the rest is paid; the system computes both by recomputing the tiers under each allocation and chooses within the 90 days. The answer is a calculation over `deposit_penalties` and `remittances`, not a judgment.

## Form 941-X and the Interest-Free Adjustment

When an employer discovers an error on a filed Form 941, it files a separate Form 941-X for each return being corrected, by itself, never attached to a 941. Two processes exist:

- **Adjustment** (line 1): for underreported tax, paid with the 941-X, or overreported tax applied as a credit to the return period in which the 941-X is filed.
- **Claim** (line 2): for overreported tax the employer wants refunded or abated. A 941-X that both underreports and overreports for one period can be one form, unless a refund is requested, in which case the underreported and overreported corrections go on separate forms.

**Interest-free.** An underreported correction is interest-free if the 941-X is filed by the due date of the return for the period in which the error was discovered and the tax is paid by then: errors found January through March are due April 30, April through June by July 31, July through September by October 31, October through December by January 31. The correction is not interest-free if the issue was raised in an IRS examination, the employer knowingly underreported, or it has received notice and demand for payment after assessment or a notice of determination under section 7436.

**Limitations.** Generally three years from when the 941 was filed, or two years from when the tax was paid if later, for overreported tax; three years for underreported. Forms 941 for a calendar year filed before April 15 of the next year are treated as filed on April 15. In the last 90 days of the period, an overreported correction must use the claim process.

**What can't be corrected.** Prior-year income tax withholding and Additional Medicare Tax withholding can be adjusted only for an administrative error (the 941 didn't report what was actually withheld) or under section 3509, "because the employee uses the amount shown on Form W-2... as a credit." The employer can't refund to itself income tax actually withheld from employees in a prior year.

**The employee's share.** To recover overreported employee Social Security and Medicare tax, the employer certifies on lines 4 and 5 that it repaid the employees or got their written consent (or is claiming only the employer share, or the tax was never withheld). Consents carry specific statements under penalties of perjury, are kept, not sent, and the records are kept at least four years. Line 3 certifies that W-2c forms have been or will be filed, checked even when the correction doesn't change W-2s. Since 2026, Form 941-X can be filed electronically through Modernized e-File.

### Worked Numbers: Two Corrections

**An underreport discovered in the next year.** An invented employer finds on February 10, 2027 that a $10,000 retention bonus paid in Q2 2026 was coded as a nontaxable reimbursement. Social Security and Medicare were not withheld; the employee is under the wage base.

| Item | Amount |
| --- | --- |
| Social Security, employer and employee (12.4% × $10,000) | $1,240.00 |
| Medicare, employer and employee (2.9% × $10,000) | $290.00 |
| **Tax due on the Q2 2026 Form 941-X** | **$1,530.00** |
| Income tax withholding on the bonus | Not correctable on 941-X: the error is not administrative and the year has closed |
| Discovered | Q1 2027 |
| File and pay by, to be interest-free | April 30, 2027 |

The employer owes the full $1,530 including the employee's $765; collecting the employee's share is "a matter for settlement between you and the employee," because underwithheld FICA can be made up from later pay but the employer owes it either way. The 2026 W-2 needs a W-2c for boxes 1, 3 and 5 (box 1 because the bonus is wages, even though no income tax can be corrected on the 941-X), and the employee's 2026 return picks up the income.

**An overreport near the limitation date.** The same employer overreported $2,000 of Social Security tax on its Q3 2026 941. All 2026 Forms 941 are treated as filed April 15, 2027, so the period closes April 15, 2030; from January 15, 2030 (the last 90 days), the correction must be a claim on line 2, not an adjustment. To recover the employee half ($1,000), the employer must repay the employees or get their consents first; otherwise it can claim only the employer half.

## State Amendments

States have their own amendment processes for withholding returns, unemployment wage reports and annual reconciliations: some take an amended return of the same form with an amended indicator, some a separate adjustment form, some an online correction in the employer's account; unemployment wage report corrections usually need the per-worker detail, not only totals. A federal correction often implies state corrections (a bonus coded nontaxable was probably wrong for state income tax and SUI too), so the correction workflow fans out from one discovery to every filing whose lines change. The core model's `filings.amends_filing_id` and `status = 'amended'` hold each one; this chapter's tables tie them to the case that started them.
<!-- source-gap: wf-state-amendments | missing | how states take amended withholding returns and SUI wage report corrections (form, format, deadline, interest) | closes with: state employer guides for the largest payroll states | checked: 2026-11-09 -->

## Who May Talk to the Agency

The employer is the taxpayer. A provider may sign and file returns, receive notices or discuss the account only under an authorization the agency recognizes, and the federal set (reporting agent authorization, Section 3504 agent appointment, tax information authorization and power of attorney) is in Who Runs Payroll: Agents & Liability. For notices, what matters is that each authorization is a record with scope (which forms and periods), dates and status, because an expired or missing authorization is why a notice went to the client instead of the provider, and why Check has a `poa_failure` blocker. States have their own authorization forms and online account linking, with the same consequences.

## Closing Accounts

An employer that stops paying wages files a final return: on Form 941, the final return box on line 17 for the last quarter in which wages were paid, and "If you continue to pay wages or other compensation for periods following termination of your business, you must file returns for those periods." A final return also brings the W-2 deadline forward: the employer must furnish W-2s and file them with SSA "by the due date of your final return." State accounts close by request or final report, and an account left open keeps generating delinquency notices for missing zero returns. A seasonal employer is different: it keeps the account open and checks the seasonal box on line 18 of every 941 it files.

Closing is also the event where a provider-to-provider or PEO transition goes wrong: the old provider closes "its" agency access, the new one hasn't linked yet, and the next notice goes nowhere. Changing Providers Mid-Year covers the handoff.

## The Notice Inbox as a Workflow

A notice is a document with an agency, a type, a period, an amount, a received date and a response date. Handling it is a [workflow](/docs/building-blocks/workflows#make-the-states-explicit): intake (scan or download, classify, extract the fields), match (to the employer, the registration, the period and the filings or deposits concerned), triage (is it correct, and what does it want), respond (pay, correct, explain, request abatement, or do nothing because it's informational), confirm (the agency's resolution), and close. Each step has an owner and a deadline computed from the notice date, and a case escalates as its deadline nears ([Timers, Deadlines and Escalations](/docs/building-blocks/workflows#timers-deadlines-and-escalations)).

| State | Meaning | Leaves when |
| --- | --- | --- |
| `received` | Scanned or downloaded, not yet classified | Classified and matched to an employer |
| `matched` | Linked to a registration, period and filings or deposits | Triage decides whether it's correct |
| `needs_response` | The notice is right or partly right; a payment, correction or explanation is owed | The response is sent |
| `disputed` | The notice is wrong; evidence is being assembled | The response is sent |
| `responded` | Payment, correction, explanation or abatement request sent | The agency confirms, or asks again |
| `informational` | No action required (a CP136 that matches, a rate notice applied) | Recorded |
| `resolved` | The agency confirmed the outcome | Terminal |
| `escalated` | Past an internal deadline, or a second notice arrived | Reassigned and responded |

The classification is where automation pays: most notices are one of a few dozen types per agency, and a correctly typed notice tells the system which records to pull. A CP207 pulls the quarter's Schedule B and statement lines; a CP161 pulls deposits and the return; a state delinquency pulls the filing list for the period. A good inbox drafts the response from those records; a person reviews and sends it.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `notices` holds what arrived; this chapter adds the case around it, the responses sent, and abatement requests. Amended filings are `filings` rows with `amends_filing_id`; the case links the correction to the discovery.

```sql
-- The case that a notice, or a self-discovered error, opens.
CREATE TABLE notice_cases (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  notice_id           UUID REFERENCES notices (id),   -- null for self-discovered corrections
  origin              TEXT NOT NULL CHECK (origin IN ('agency_notice', 'self_discovered',
                        'client_report', 'reconciliation_break')),
  notice_type         TEXT,                  -- 'CP136', 'CP207', 'CP161', 'Letter 99C', a state code
  tax_registration_id UUID REFERENCES tax_registrations (id),
  period              DATERANGE,
  discovered_on       DATE NOT NULL,         -- drives the 941-X interest-free date
  respond_by          DATE,                  -- from the notice date and its window
  amount_claimed      BIGINT,                -- cents the agency says is owed
  amount_agreed       BIGINT,
  root_cause          TEXT CHECK (root_cause IN ('agency_error', 'late_deposit',
                        'missing_return', 'setup_data', 'calculation', 'late_funding',
                        'provider_error', 'client_error', 'other')),
  responsible_party   TEXT CHECK (responsible_party IN ('employer', 'provider', 'agency',
                        'shared')),
  status              TEXT NOT NULL CHECK (status IN ('received', 'matched', 'needs_response',
                        'disputed', 'responded', 'informational', 'resolved', 'escalated')),
  owner               TEXT,
  opened_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ
);

CREATE TABLE notice_case_links (            -- the records a case is about
  case_id             UUID NOT NULL REFERENCES notice_cases (id),
  linked_table        TEXT NOT NULL CHECK (linked_table IN ('filings', 'remittances',
                        'liabilities', 'tax_calendar_events', 'deposit_penalties',
                        'pay_statements')),
  linked_id           UUID NOT NULL,
  PRIMARY KEY (case_id, linked_table, linked_id)
);

-- Everything sent back: payments, corrected records, amended returns, letters.
CREATE TABLE notice_responses (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id             UUID NOT NULL REFERENCES notice_cases (id),
  kind                TEXT NOT NULL CHECK (kind IN ('payment', 'corrected_record',
                        'amended_return', 'explanation', 'abatement_request',
                        'deposit_designation', 'authorization', 'phone_call')),
  filing_id           UUID REFERENCES filings (id),        -- an amended return or corrected record
  remittance_id       UUID REFERENCES remittances (id),    -- a payment
  document_id         UUID REFERENCES documents (id),      -- the letter or form as sent
  channel             TEXT NOT NULL CHECK (channel IN ('efile', 'online_account', 'mail',
                        'fax', 'phone')),
  sent_at             TIMESTAMPTZ NOT NULL,
  sent_by             TEXT NOT NULL,
  agency_reference    TEXT                   -- a confirmation number, call ID or tracking number
);

-- Abatement and waiver requests, and their outcomes.
CREATE TABLE penalty_abatements (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id             UUID NOT NULL REFERENCES notice_cases (id),
  deposit_penalty_id  UUID REFERENCES deposit_penalties (id),
  penalty_kind        TEXT NOT NULL CHECK (penalty_kind IN ('failure_to_deposit',
                        'failure_to_file', 'failure_to_pay', 'information_return', 'state')),
  basis               TEXT NOT NULL CHECK (basis IN ('first_time_abate', 'automatic_exemption',
                        'reasonable_cause', 'first_deposit_waiver', 'frequency_change_waiver',
                        'irs_error', 'statutory_exception')),
  eligibility         JSONB NOT NULL,        -- the prior-period compliance checked, waivers counted
  amount_requested    BIGINT NOT NULL,
  amount_abated       BIGINT,
  interest_abated     BIGINT,
  status              TEXT NOT NULL CHECK (status IN ('drafted', 'requested', 'granted',
                        'partially_granted', 'denied', 'appealed')),
  decided_on          DATE
);

-- The interest-free deadline for a self-discovered underreport: the due date of the
-- return for the quarter of discovery (941s due the last day of the following month).
SELECT c.id,
       (date_trunc('quarter', c.discovered_on) + INTERVAL '4 months' - INTERVAL '1 day')::DATE
         AS file_and_pay_by           -- move to the next business day by the holiday calendar
FROM notice_cases c
WHERE c.origin = 'self_discovered' AND c.status NOT IN ('resolved');

-- First-time abatement eligibility for a quarterly filer: 12 prior quarters of timely
-- 941s and no unabated penalty in them (other than estimated tax).
SELECT e.id AS employer_id,
       COUNT(*) FILTER (WHERE f.submitted_at::DATE <= f.due_on) = 12 AS timely_history,
       NOT EXISTS (
         SELECT 1 FROM deposit_penalties p
         WHERE p.employer_id = e.id AND p.status IN ('assessed', 'paid')
           AND p.event_id IN (SELECT t.id FROM tax_calendar_events t
                              WHERE t.employer_id = e.id AND t.period && $2::DATERANGE)
       ) AS no_unabated_penalties
FROM employers e
JOIN filings f ON f.employer_id = e.id AND f.form = '941' AND f.period && $2::DATERANGE
WHERE e.id = $1
GROUP BY e.id;
-- $2 = the three years before the penalty period.
```

Design notes:

- **Every notice is a case within a business day.** Intake runs on scans and agency downloads; an unclassified notice is itself a case in `received`, with a deadline from its notice date, not its scan date.
- **Link the case to the records, and the corrections to the case.** A 941-X, a W-2c and three state amendments that come from one discovery share a case, so the client sees one problem, and the next audit sees why five filings changed.
- **Compute response dates from the notice's own window.** Ten days for a CP161 dispute, 45 for a CP207 or Letter 99C, 90 for deposit designation; store the rule with the date ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Record root cause and responsible party on close.** They are the provider's quality metric and its liability ledger: a provider that pays penalties it caused needs the list, and a provider that charges clients for their own errors needs the evidence.
- **Keep the employee consents for overreported FICA as documents,** linked to the 941-X, because the 941-X certifies they exist ([What a Record Holds](/docs/building-blocks/audit-trails#what-a-record-holds)).

## Auditing

Notices and corrections are where examinations start. Keep:

- **Every notice as received**, with its scan or download, classification and the time it reached the case.
- **Each case's full history**: links, state changes, owners, responses as sent with their channel and the agency's reference.
- **Amended returns and corrected records** linked to the originals and to the case that produced them.
- **Employee repayment records and consents** for overreported employee taxes, for at least the four years the 941-X instructions require.
- **Abatement requests and outcomes**, with the eligibility facts the request relied on.
- **Authorizations** (federal and state) in effect when each notice arrived.

## What This Means for the System You Build

- **Treat registration as a dated workflow** that accrues liabilities while pending and makes the first due date visible.
- **Validate setup data that agencies match on** (EIN to legal name, account numbers, experience factors) before filing, not after the notice.
- **Turn every notice into a case** with a type, a computed response date, links to the records it concerns and an owner.
- **Answer from data:** regenerate Schedule B for a CP207, reconcile 941s to W-3 for a Letter 99C, compute the cheapest deposit designation within 90 days.
- **Check first-time abatement eligibility automatically** and track the 2026 move to Automatic Exemption from Penalty.
- **File 941-X by the discovery quarter's 941 due date** to keep corrections interest-free, and fan corrections out to every affected state filing.
- **Close accounts deliberately** with final returns, and never let a provider change leave agency access unlinked.

## References

**Agency guidance and forms**

- [IRS: Publication 15 (2026), Employer's Tax Guide](https://www.irs.gov/publications/p15), EFTPS pre-enrollment, names and EINs on returns, deposit penalty waivers and section 7430 limits, order of application and designation, final returns, seasonal employers, underwithheld taxes and prior-period adjustments
- [IRS: Instructions for Form 941-X](https://www.irs.gov/instructions/i941x), adjustment and claim processes, interest-free corrections and their exceptions, discovery-quarter due dates, the period of limitations and the April 15 rule, the 90-day claim rule, lines 3 to 5 and record retention
- [IRS: Instructions for Form 941 (Rev. March 2026)](https://www.irs.gov/instructions/i941), Form 941-X e-filing through MeF, and the final and seasonal boxes
- [IRS: Penalty relief due to first-time abatement or other administrative waiver](https://www.irs.gov/payments/penalty-relief-due-to-first-time-abate-or-other-administrative-waiver), penalties covered, eligibility, how to request, interest and the transition to Automatic Exemption from Penalty
- [IRS: Understanding your CP136 notice](https://www.irs.gov/individuals/understanding-your-cp136-notice), next year's deposit schedule
- [IRS: Understanding your CP207 notice](https://www.irs.gov/individuals/understanding-your-cp207-notice), the record of federal tax liability and the 45-day correction window
- [IRS: Understanding your CP161 notice](https://www.irs.gov/individuals/understanding-your-cp161-notice), unpaid balance and the 10-day window to dispute

**Vendor documentation**

- [ADP: SmartCompliance Employment Tax](https://apps.adp.com/en/apps/623571/adp-smartcompliance-employment-tax), filings, deposits, amendments, notices and registrations
- [Check: Tax filings](https://docs.checkhq.com/docs/tax-filings.md), the filing lifecycle, the 26 blocker types, rejections and amendments
- [Check: The filing object](https://docs.checkhq.com/reference/the-filing-object.md), status history, blocked reasons and amendment links
- [Gusto Embedded: Get a company's federal tax details](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-federal_tax_details.md), EIN verification and its common failure
- [Gusto Embedded: Get tax requirements for a state](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_uuid-tax_requirements-state.md), registration fields and blocking requirements
